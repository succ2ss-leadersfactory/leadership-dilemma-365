import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { calculateRoundResult, generateFinalResults } from '../services/calculationService';
import { generateTeamCompetencyProfiles } from '../utils/competencyProfileUtils';
import { buildOpsHealth } from '../utils/opsHealthUtils';

const rounds = ['week1', 'week5', 'week8', 'week10', 'week11'];
const pick = { sales: ['week1_balance', 'week5_structure', 'week8_balance', 'week10_structure', 'week11_balance'], marketing: ['week1_structure', 'week5_balance', 'week8_align', 'week10_balance', 'week11_structure'], rnd: ['week1_align', 'week5_structure', 'week8_structure', 'week10_structure', 'week11_structure'], operations: ['week1_speed', 'week5_speed', 'week8_structure', 'week10_speed', 'week11_speed'], hr: ['week1_balance', 'week5_align', 'week8_balance', 'week10_balance', 'week11_balance'], finance: ['week1_structure', 'week5_align', 'week8_align', 'week10_align', 'week11_align'] };
const memberNames = ['김박사', '이매니저', '박코치'];
const habits = ['불확실하면 속도부터 선택하는 경향이 있었다.', '기준을 세우느라 실행을 늦추는 순간이 있었다.', '사람 부담을 알면서도 성과 압박을 먼저 본 순간이 있었다.'];
const nexts = ['선택 전에 부담이 누구에게 몰리는지 먼저 확인하겠다.', '결정 전에 성공 기준과 확인 시점을 먼저 합의하겠다.', '성과와 사람을 함께 보는 체크 질문을 회의에 넣겠다.'];

function makeSample(roomId) {
  updateDb(db => {
    const room = db.rooms[roomId];
    Object.values(room.teams).forEach(team => {
      const ksa = db.gameContent.ksaOptions[team.teamId];
      if (ksa) team.selectedKSA = { knowledge: ksa.knowledge.slice(0, 3), skill: ksa.skill.slice(0, 3), attitude: ksa.attitude.slice(0, 3) };
      const declaration = room.declarations[team.teamId] || { teamId: team.teamId, individualReflections: {} };
      declaration.teamDeclaration = `${team.teamName}은 선택의 대가를 숨기지 않고, 다음 현업에서 부담 배분과 확인 시점을 먼저 정하겠습니다.`;
      declaration.submittedAt = Date.now();
      declaration.individualReflections = declaration.individualReflections || {};
      memberNames.forEach((name, idx) => {
        const playerId = `${team.teamId}_sample_${idx + 1}`;
        room.players[playerId] = { playerId, displayName: name, teamId: team.teamId, role: 'player', connectionStatus: 'online', joinedAt: Date.now(), lastSeenAt: Date.now(), isActive: true };
        declaration.individualReflections[playerId] = { habit: habits[idx], nextBehavior: nexts[idx], submittedAt: Date.now() };
      });
      room.competencyProfiles = room.competencyProfiles || {};
      room.competencyProfiles[team.teamId] = generateTeamCompetencyProfiles({
        players: Object.values(room.players || {}),
        team,
        selectedKSA: team.selectedKSA
      });
      room.declarations[team.teamId] = declaration;
      rounds.forEach((roundId, idx) => {
        const choiceId = pick[team.teamId]?.[idx] || db.gameContent.choices.find(c => c.roundId === roundId)?.choiceId;
        const choice = db.gameContent.choices.find(c => c.choiceId === choiceId);
        room.teamDecisions[`${roundId}_${team.teamId}`] = { decisionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, finalChoiceId: choiceId, discussionSummary: `${team.teamName}은 선택의 장점과 남는 부담을 함께 정리했다.`, submittedBy: 'sample', submittedAt: Date.now(), locked: true };
        room.submissions[`${roundId}_${team.teamId}`] = { submissionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, answers: { summary: `${choice?.choiceText || '선택'} 실행안`, action: '책임자와 확인 시점을 정한다.' }, quality: idx >= 3 ? 'high' : 'medium', qualityScore: idx >= 3 ? 85 : 65, submittedBy: 'sample', submittedAt: Date.now() };
      });
    });
  });
  rounds.forEach(roundId => Object.keys(readDb().rooms[roomId].teams).forEach(teamId => { try { calculateRoundResult({ roomId, roundId, teamId }); } catch {} }));
  generateFinalResults(roomId);
  updateDb(db => { const room = db.rooms[roomId]; room.roomProgress.currentRoundId = 'week12'; room.roomProgress.currentPhase = 'finalResult'; room.roomProgress.finalResultVisible = true; Object.values(room.finalResults).forEach(r => { r.visible = true; }); });
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildOpsMarkdown(room, health) {
  const lines = ['# 운영 QA 점검 리포트', '', `- 방 ID: ${room.roomId}`, `- 현재 라운드: ${room.roomProgress.currentRoundId}`, `- 현재 단계: ${room.roomProgress.currentPhase}`, `- 이슈 수: ${health.summary.issueCount}`, ''];
  lines.push('## 팀별 점검');
  health.teamRows.forEach(row => {
    lines.push(`- ${row.teamName}: ${row.status} / KSA ${row.ksaStatus} / 참가자 ${row.playerCount} / 프로필 ${row.profileCount} / 계산 ${row.calculationCount}/${health.playableRounds.length} / 최종 ${row.finalStatus}`);
  });
  lines.push('', '## 확인 필요 항목');
  if (health.issues.length) health.issues.forEach(issue => lines.push(`- [${issue.severity}] ${issue.teamName} · ${issue.area}: ${issue.message} → ${issue.action}`));
  else lines.push('- 확인 필요 항목 없음');
  return lines.join('\n');
}

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
          <button className="primary" onClick={() => { makeSample(roomId); setMsg('6개 팀 샘플 데이터, 역량 프로필, 인물 카드, 최종 판정을 생성했습니다.'); }}>6팀 샘플 데이터 생성</button>
          <Link className="secondary" to={`/competencies/${roomId}`}>역량 프로필</Link>
          <Link className="secondary" to={`/guide/${roomId}`}>강사 가이드</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트 보기</Link>
        </div>
      </section>

      <section className="card">
        <h3>팀별 운영 점검</h3>
        <table>
          <thead><tr><th>팀</th><th>상태</th><th>KSA</th><th>참가자</th><th>프로필</th><th>인물 카드</th><th>팀 결정</th><th>산출물</th><th>계산</th><th>인물 영향</th><th>최종</th><th>성찰</th></tr></thead>
          <tbody>
            {health.teamRows.map(row => (
              <tr key={row.teamId}>
                <td>{row.teamName}</td>
                <td>{row.status}</td>
                <td>{row.ksaStatus}</td>
                <td>{row.playerCount}</td>
                <td>{row.profileCount}</td>
                <td>{row.personaCount}</td>
                <td>{row.decisionCount}/{health.playableRounds.length}</td>
                <td>{row.submissionCount}/{health.playableRounds.length}</td>
                <td>{row.calculationCount}/{health.playableRounds.length}</td>
                <td>{row.personaInfluenceCount}건</td>
                <td>{row.finalStatus}</td>
                <td>{row.reflectionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>콘텐츠 데이터 점검</h3>
        <table>
          <thead><tr><th>항목</th><th>상태</th><th>내용</th></tr></thead>
          <tbody>{health.contentChecks.map(c => <tr key={c.label}><td>{c.label}</td><td>{c.ok ? '정상' : '확인 필요'}</td><td>{c.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="card">
        <h3>확인 필요 항목</h3>
        {health.issues.length ? (
          <table>
            <thead><tr><th>심각도</th><th>팀</th><th>영역</th><th>내용</th><th>권장 조치</th></tr></thead>
            <tbody>{health.issues.map((issue, index) => <tr key={`${issue.teamName}_${issue.area}_${index}`}><td>{issue.severity}</td><td>{issue.teamName}</td><td>{issue.area}</td><td>{issue.message}</td><td>{issue.action}</td></tr>)}</tbody>
          </table>
        ) : <p className="notice">현재 확인 필요 항목이 없습니다. 파일럿 운영에 필요한 핵심 데이터가 준비되어 있습니다.</p>}
      </section>

      <section className="card">
        <h3>샘플 생성 내용</h3>
        <ul>
          <li>6개 팀 KSA 자동 선택</li>
          <li>팀별 샘플 참가자 3명과 개인 성찰 생성</li>
          <li>팀원별 역량 프로필과 인물 카드 자동 생성</li>
          <li>주요 라운드 팀 결정과 산출물 생성</li>
          <li>인물 카드 영향, 상태값 계산, 최종 판정 생성</li>
        </ul>
      </section>
    </Layout>
  );
}
