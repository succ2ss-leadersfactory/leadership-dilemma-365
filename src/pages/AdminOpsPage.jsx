import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import FinalPilotChecklistPanel from '../components/FinalPilotChecklistPanel.jsx';
import RehearsalBalancePanel from '../components/RehearsalBalancePanel.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { calculateRoundResult, generateFinalResults } from '../services/calculationService';
import { generateTeamCompetencyProfiles } from '../utils/competencyProfileUtils';
import { getPersonaById } from '../utils/playerPersonaUtils';
import { buildOpsHealth } from '../utils/opsHealthUtils';

const rounds = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'week9', 'week10', 'week11'];
const emptyState = { aceBurnoutRisk: 0, growthShrinkRisk: 0, executionPressure: 0, executiveTrustRisk: 0, collaborationDebt: 0 };

const scenarios = {
  success: { label: '미션 성공형', choiceTypes: ['BALANCE', 'STRUCTURE', 'BALANCE', 'STRUCTURE', 'BALANCE', 'ALIGN', 'STRUCTURE', 'ALIGN', 'BALANCE', 'STRUCTURE', 'BALANCE'], qualities: ['high', 'high', 'high', 'veryHigh', 'high', 'high', 'high', 'veryHigh', 'high', 'high', 'veryHigh'], personas: ['standard_keeper', 'relationship_connector', 'silent_expert'], names: ['기준형 리더', '관계형 조율자', '침묵형 전문가'], note: '기준과 협업 조건을 먼저 맞추고 마지막에는 하나의 증거로 성과를 보여주겠습니다.' },
  ace: { label: '에이스 과부하형', choiceTypes: ['SPEED', 'SPEED', 'SPEED', 'STRUCTURE', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'BALANCE', 'STRUCTURE', 'BALANCE'], qualities: ['medium', 'medium', 'medium', 'high', 'medium', 'medium', 'high', 'high', 'medium', 'medium', 'high'], personas: ['ace_practitioner', 'ace_practitioner', 'careful_newcomer'], names: ['에이스 김프로', '해결사 이프로', '꼼꼼한 문프로'], note: '속도를 냈지만 다음 현업에서는 에이스에게 몰린 일을 나누는 구조를 먼저 만들겠습니다.' },
  rumor: { label: '루머 대응형', choiceTypes: ['STRUCTURE', 'BALANCE', 'BALANCE', 'STRUCTURE', 'BALANCE', 'ALIGN', 'STRUCTURE', 'BALANCE', 'STRUCTURE', 'SPEED', 'STRUCTURE'], qualities: ['medium', 'medium', 'medium', 'medium', 'medium', 'medium', 'high', 'medium', 'medium', 'low', 'medium'], personas: ['relationship_connector', 'careful_newcomer', 'silent_expert'], names: ['분위기 읽는 박프로', '기준 묻는 문프로', '조용한 전문가'], note: '불안을 덮지 않고 확인된 사실과 추측을 나누어 말하는 방식을 다시 세우겠습니다.' },
  pressure: { label: '재편 위험형', choiceTypes: ['SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED', 'SPEED'], qualities: ['low', 'low', 'medium', 'low', 'low', 'medium', 'low', 'medium', 'low', 'low', 'low'], personas: ['challenge_driver', 'ace_practitioner', 'careful_newcomer'], names: ['도전형 강프로', '에이스 오프로', '불안한 신입'], note: '빠르게 움직였지만 기준과 부담 배분을 놓친 대가를 확인했습니다.' }
};

const habits = ['불확실하면 속도부터 선택하는 경향이 있었다.', '기준을 세우느라 실행을 늦추는 순간이 있었다.', '사람 부담을 알면서도 성과 압박을 먼저 본 순간이 있었다.'];
const nexts = ['선택 전에 부담이 누구에게 몰리는지 먼저 확인하겠다.', '결정 전에 성공 기준과 확인 시점을 먼저 합의하겠다.', '성과와 사람을 함께 보는 체크 질문을 회의에 넣겠다.'];

function getChoiceByType(gameContent, roundId, type) {
  const round = gameContent.rounds.find(item => item.roundId === roundId);
  const choices = gameContent.choices.filter(choice => round?.choiceIds?.includes(choice.choiceId));
  return choices.find(choice => choice.internalType === type) || choices[0];
}

function applyPersona(profile, personaId) {
  const persona = getPersonaById(personaId);
  if (!profile || !persona) return profile;
  return { ...profile, personaId: persona.personaId, personaLabel: persona.personaLabel, personaCardTitle: persona.cardTitle, personaSceneText: persona.sceneText, personaStrengthText: persona.strengthText, personaRiskText: persona.riskText, personaDecisionHabit: persona.personaDecisionHabit || persona.decisionHabit };
}

function resetRoom(room) {
  room.players = {};
  room.votes = {};
  room.teamDecisions = {};
  room.submissions = {};
  room.roundCalculations = {};
  room.finalResults = {};
  room.declarations = {};
  room.competencyProfiles = {};
  room.stateValues = Object.fromEntries(Object.keys(room.teams || {}).map(teamId => [teamId, { teamId, values: { ...emptyState }, maxRiskValue: 0, maxRiskKey: 'aceBurnoutRisk', maxRiskLabel: '안정', updatedAt: Date.now() }]));
}

function makeScenario(roomId, scenarioKey = 'success') {
  const scenario = scenarios[scenarioKey] || scenarios.success;
  updateDb(db => {
    const room = db.rooms[roomId];
    resetRoom(room);
    Object.values(room.teams).forEach(team => {
      const ksa = db.gameContent.ksaOptions[team.teamId];
      if (ksa) team.selectedKSA = { knowledge: ksa.knowledge.slice(0, 3), skill: ksa.skill.slice(0, 3), attitude: ksa.attitude.slice(0, 3) };
      const declaration = { teamId: team.teamId, individualReflections: {}, teamDeclaration: `${team.teamName} · ${scenario.note}`, submittedAt: Date.now() };
      scenario.names.forEach((name, idx) => {
        const playerId = `${team.teamId}_${scenarioKey}_${idx + 1}`;
        room.players[playerId] = { playerId, displayName: name, teamId: team.teamId, role: 'player', connectionStatus: 'online', joinedAt: Date.now(), lastSeenAt: Date.now(), isActive: true };
        declaration.individualReflections[playerId] = { habit: habits[idx], nextBehavior: nexts[idx], submittedAt: Date.now() };
      });
      const generated = generateTeamCompetencyProfiles({ players: Object.values(room.players || {}), team, selectedKSA: team.selectedKSA });
      room.competencyProfiles[team.teamId] = Object.fromEntries(Object.entries(generated).map(([playerId, profile], idx) => [playerId, applyPersona(profile, scenario.personas[idx % scenario.personas.length])]));
      room.declarations[team.teamId] = declaration;
      rounds.forEach((roundId, idx) => {
        const choice = getChoiceByType(db.gameContent, roundId, scenario.choiceTypes[idx]);
        const quality = scenario.qualities[idx] || 'medium';
        const qualityScore = quality === 'veryHigh' ? 95 : quality === 'high' ? 85 : quality === 'medium' ? 65 : 35;
        room.teamDecisions[`${roundId}_${team.teamId}`] = { decisionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, finalChoiceId: choice?.choiceId, discussionSummary: `${scenario.label}: ${team.teamName}은 선택의 장점과 남는 부담을 함께 확인했다.`, submittedBy: 'scenario', submittedAt: Date.now(), locked: true };
        room.submissions[`${roundId}_${team.teamId}`] = { submissionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, answers: { summary: `${scenario.label} 실행안`, action: quality === 'low' ? '책임자와 확인 시점이 아직 불분명하다.' : '책임자, 기준, 확인 시점을 정한다.' }, quality, qualityScore, submittedBy: 'scenario', submittedAt: Date.now() };
      });
    });
  });
  rounds.forEach(roundId => Object.keys(readDb().rooms[roomId].teams).forEach(teamId => { try { calculateRoundResult({ roomId, roundId, teamId }); } catch {} }));
  generateFinalResults(roomId);
  updateDb(db => { const room = db.rooms[roomId]; room.roomProgress.currentRoundId = 'week12'; room.roomProgress.currentPhase = 'finalResult'; room.roomProgress.finalResultVisible = true; Object.values(room.finalResults).forEach(r => { r.visible = true; }); });
}

function downloadJson(filename, data) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
function downloadText(filename, text) { const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
function buildOpsMarkdown(room, health) { const lines = ['# 운영 QA 점검 리포트', '', `- 방 ID: ${room.roomId}`, `- 현재 라운드: ${room.roomProgress.currentRoundId}`, `- 현재 단계: ${room.roomProgress.currentPhase}`, `- 이슈 수: ${health.summary.issueCount}`, '', '## 팀별 점검']; health.teamRows.forEach(row => lines.push(`- ${row.teamName}: ${row.status} / KSA ${row.ksaStatus} / 참가자 ${row.playerCount} / 프로필 ${row.profileCount} / 계산 ${row.calculationCount}/${health.playableRounds.length} / 최종 ${row.finalStatus}`)); lines.push('', '## 확인 필요 항목'); if (health.issues.length) health.issues.forEach(issue => lines.push(`- [${issue.severity}] ${issue.teamName} · ${issue.area}: ${issue.message} → ${issue.action}`)); else lines.push('- 확인 필요 항목 없음'); return lines.join('\n'); }

export default function AdminOpsPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);
  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;
  const health = buildOpsHealth(room, db.gameContent);
  const backup = () => downloadJson(`${roomId}_backup.json`, room);
  const exportQa = () => downloadText(`${roomId}_ops_qa.md`, buildOpsMarkdown(room, health));
  const importJson = e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const data = JSON.parse(r.result); if (!data.teams || !data.roomProgress) throw new Error('형식 오류'); updateDb(db => { db.rooms[roomId] = { ...data, roomId }; }); setMsg('JSON 가져오기를 완료했습니다.'); } catch (err) { setMsg(`JSON 가져오기 실패: ${err.message}`); } e.target.value = ''; }; r.readAsText(f); };

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">운영 안정화</p>
        <h2>운영 QA 점검판</h2>
        <p>현재 라운드: {room.roomProgress.currentRoundId} · 단계: {room.roomProgress.currentPhase}</p>
        <p>참가자: {Object.keys(room.players).length}명 · 팀: {Object.keys(room.teams).length}개</p>
        {msg && <div className="notice">{msg}</div>}
        <div className="summaryCards">
          <div><b>{health.summary.issueCount}</b><span>확인 항목</span></div>
          <div><b>{health.summary.completeKsaTeams}/{health.summary.totalTeams}</b><span>KSA 완료 팀</span></div>
          <div><b>{health.summary.profileTeams}/{health.summary.totalTeams}</b><span>프로필 정상 팀</span></div>
          <div><b>{health.summary.calculatedTeams}/{health.summary.totalTeams}</b><span>라운드 계산 완료 팀</span></div>
          <div><b>{health.summary.finalTeams}/{health.summary.totalTeams}</b><span>최종 판정 팀</span></div>
        </div>
        <div className="actions">
          <button onClick={backup}>JSON 백업 다운로드</button>
          <button onClick={exportQa}>QA 리포트 다운로드</button>
          <label className="secondary">JSON 가져오기<input type="file" accept=".json" onChange={importJson} style={{ display: 'none' }} /></label>
          <button onClick={() => setMsg('운영 QA 점검 결과를 아래 표에서 확인하세요.')}>운영 QA 점검</button>
          <Link className="secondary" to={`/competencies/${roomId}`}>역량 프로필</Link>
          <Link className="secondary" to={`/guide/${roomId}`}>강사 가이드</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트 보기</Link>
        </div>
      </section>

      <FinalPilotChecklistPanel roomId={roomId} joinCode={room.joinCode} />
      <RehearsalBalancePanel room={room} />

      <section className="card">
        <h3>리허설 샘플 시나리오 생성</h3>
        <p className="muted">버튼을 누르면 기존 리허설 데이터가 정리되고, 선택 패턴·산출물 품질·인물 카드 구성이 새로 생성됩니다.</p>
        <div className="grid2">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <div className="card" key={key}>
              <h4>{scenario.label}</h4>
              <p><b>인물 카드:</b> {scenario.personas.map(id => getPersonaById(id).personaLabel).join(' / ')}</p>
              <p><b>선택 패턴:</b> {scenario.choiceTypes.join(' → ')}</p>
              <button className="primary" onClick={() => { makeScenario(roomId, key); setMsg(`${scenario.label} 데이터를 생성했습니다.`); }}>{scenario.label} 생성</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>팀별 운영 점검</h3>
        <table>
          <thead><tr><th>팀</th><th>상태</th><th>KSA</th><th>참가자</th><th>프로필</th><th>인물 카드</th><th>팀 결정</th><th>산출물</th><th>계산</th><th>인물 영향</th><th>최종</th><th>성찰</th></tr></thead>
          <tbody>{health.teamRows.map(row => <tr key={row.teamId}><td>{row.teamName}</td><td>{row.status}</td><td>{row.ksaStatus}</td><td>{row.playerCount}</td><td>{row.profileCount}</td><td>{row.personaCount}</td><td>{row.decisionCount}/{health.playableRounds.length}</td><td>{row.submissionCount}/{health.playableRounds.length}</td><td>{row.calculationCount}/{health.playableRounds.length}</td><td>{row.personaInfluenceCount}건</td><td>{row.finalStatus}</td><td>{row.reflectionCount}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="card"><h3>콘텐츠 데이터 점검</h3><table><thead><tr><th>항목</th><th>상태</th><th>내용</th></tr></thead><tbody>{health.contentChecks.map(c => <tr key={c.label}><td>{c.label}</td><td>{c.ok ? '정상' : '확인 필요'}</td><td>{c.note}</td></tr>)}</tbody></table></section>

      <section className="card">
        <h3>확인 필요 항목</h3>
        {health.issues.length ? <table><thead><tr><th>심각도</th><th>팀</th><th>영역</th><th>내용</th><th>권장 조치</th></tr></thead><tbody>{health.issues.map((issue, index) => <tr key={`${issue.teamName}_${issue.area}_${index}`}><td>{issue.severity}</td><td>{issue.teamName}</td><td>{issue.area}</td><td>{issue.message}</td><td>{issue.action}</td></tr>)}</tbody></table> : <p className="notice">현재 확인 필요 항목이 없습니다. 파일럿 운영에 필요한 핵심 데이터가 준비되어 있습니다.</p>}
      </section>

      <section className="card"><h3>리허설 샘플 활용법</h3><ul><li>미션 성공형: 정상 운영 리허설과 최종 리포트 확인</li><li>에이스 과부하형: 빠른 실행과 소진 리스크 디브리핑</li><li>루머 대응형: Week 10 사실·추측·감정 구분 연습</li><li>재편 위험형: 낮은 산출물과 반복된 속도 선택의 영향 확인</li></ul></section>
    </Layout>
  );
}
