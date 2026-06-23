import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import FinalPilotChecklistPanel from '../components/FinalPilotChecklistPanel.jsx';
import RehearsalBalancePanel from '../components/RehearsalBalancePanel.jsx';
import { subscribe, readDb, resetDb, updateDb } from '../services/storage';
import { calculateRoundResult, generateFinalResults } from '../services/calculationService';
import { calculateSubmissionQuality } from '../utils/qualityUtils';
import { generateTeamCompetencyProfiles } from '../utils/competencyProfileUtils';
import { getPersonaById } from '../utils/playerPersonaUtils';
import { analyzeDiscussionSummary } from '../utils/discussionQualityUtils';
import { analyzePersonalReflection, analyzeTeamDeclaration } from '../utils/reflectionQualityUtils';
import { buildOpsHealth } from '../utils/opsHealthUtils';
import { buildRehearsalBalanceCheck } from '../utils/rehearsalBalanceUtils';
import { buildTeamOutputEvidenceReview } from '../utils/teamOutputEvidenceUtils';

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

function getOutputRequirement(gameContent, roundId) {
  const round = gameContent.rounds.find(item => item.roundId === roundId);
  return gameContent.outputRequirements?.[round?.outputRequirementId] || gameContent.outputRequirements?.[`${roundId}_output`];
}

function applyPersona(profile, personaId) {
  const persona = getPersonaById(personaId);
  if (!profile || !persona) return profile;
  return { ...profile, personaId: persona.personaId, personaLabel: persona.personaLabel, personaCardTitle: persona.cardTitle, personaSceneText: persona.sceneText, personaStrengthText: persona.strengthText, personaRiskText: persona.riskText, personaDecisionHabit: persona.personaDecisionHabit || persona.decisionHabit };
}

function resetStateValues(room) {
  room.stateValues = Object.fromEntries(Object.keys(room.teams || {}).map(teamId => [teamId, {
    teamId,
    values: { ...emptyState },
    rawValues: { ...emptyState },
    riskHistory: [],
    riskTrendSummary: null,
    rawRiskLoad: 0,
    maxRawRiskValue: 0,
    maxRawRiskKey: 'aceBurnoutRisk',
    maxRawRiskLabel: '안정',
    maxRiskValue: 0,
    maxRiskKey: 'aceBurnoutRisk',
    maxRiskLabel: '안정',
    updatedAt: Date.now()
  }]));
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
  resetStateValues(room);
}

function buildScenarioAnswers({ scenario, team, quality, roundId }) {
  if (quality === 'low') {
    return {
      summary: `${scenario.label} ${roundId} 실행 메모`,
      action: '빠르게 처리한다.',
      risk: '확인 필요'
    };
  }
  return {
    summary: `${team.teamName}은 ${scenario.label} 상황에서 선택 기준과 남는 부담을 함께 정리했다.`,
    action: '담당자, 성공 기준, 확인 시점을 정하고 다음 회의에서 고객·팀원·협업 신호를 다시 확인한다.',
    owner: '팀 대표와 담당자가 함께 확인',
    timing: '다음 라운드 시작 전 또는 다음 주 월요일 회의',
    risk: '실행 속도와 사람 부담이 한쪽으로 몰리지 않는지 확인한다.'
  };
}

function buildScenarioSubmission({ db, roundId, team, scenario, quality, discussionQualityReview }) {
  const answers = buildScenarioAnswers({ scenario, team, quality, roundId });
  const evidenceReview = buildTeamOutputEvidenceReview({ answers, expertiseLens: db.gameContent.teamExpertiseLenses?.[team.teamId] });
  const outputRequirement = getOutputRequirement(db.gameContent, roundId);
  const qualityResult = calculateSubmissionQuality(outputRequirement, answers, evidenceReview, discussionQualityReview);
  return { answers, evidenceReview, ...qualityResult };
}

function makeScenario(roomId, scenarioKey = 'success') {
  const scenario = scenarios[scenarioKey] || scenarios.success;
  updateDb(db => {
    const room = db.rooms[roomId];
    resetRoom(room);
    Object.values(room.teams).forEach(team => {
      const ksa = db.gameContent.ksaOptions[team.teamId];
      if (ksa) team.selectedKSA = { knowledge: ksa.knowledge.slice(0, 3), skill: ksa.skill.slice(0, 3), attitude: ksa.attitude.slice(0, 3) };
      const teamDeclaration = `${team.teamName} · ${scenario.note} 다음 주 월요일 회의에서 남은 부담과 확인 시점을 다시 보겠습니다.`;
      const declaration = { teamId: team.teamId, individualReflections: {}, teamDeclaration, declarationQualityReview: analyzeTeamDeclaration(teamDeclaration), submittedAt: Date.now() };
      scenario.names.forEach((name, idx) => {
        const playerId = `${team.teamId}_${scenarioKey}_${idx + 1}`;
        const habit = habits[idx];
        const nextBehavior = nexts[idx];
        room.players[playerId] = { playerId, displayName: name, teamId: team.teamId, role: 'player', connectionStatus: 'online', joinedAt: Date.now(), lastSeenAt: Date.now(), isActive: true };
        declaration.individualReflections[playerId] = { habit, nextBehavior, reflectionQualityReview: analyzePersonalReflection({ habit, nextBehavior }), submittedAt: Date.now() };
      });
      const generated = generateTeamCompetencyProfiles({ players: Object.values(room.players || {}), team, selectedKSA: team.selectedKSA });
      room.competencyProfiles[team.teamId] = Object.fromEntries(Object.entries(generated).map(([playerId, profile], idx) => [playerId, applyPersona(profile, scenario.personas[idx % scenario.personas.length])]));
      room.declarations[team.teamId] = declaration;
      rounds.forEach((roundId, idx) => {
        const choice = getChoiceByType(db.gameContent, roundId, scenario.choiceTypes[idx]);
        const quality = scenario.qualities[idx] || 'medium';
        const discussionSummary = `${scenario.label}: ${team.teamName}은 ${choice?.internalType || '선택'} 방향의 장점과 남는 부담을 함께 확인했고, 다음 회의에서 담당자와 확인 시점을 정하기로 했다.`;
        const discussionQualityReview = analyzeDiscussionSummary(discussionSummary);
        const submission = buildScenarioSubmission({ db, roundId, team, scenario, quality, discussionQualityReview });
        room.teamDecisions[`${roundId}_${team.teamId}`] = { decisionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, finalChoiceId: choice?.choiceId, discussionSummary, discussionQualityReview, submittedBy: 'scenario', submittedAt: Date.now(), locked: true };
        room.submissions[`${roundId}_${team.teamId}`] = { submissionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, ...submission, submittedBy: 'scenario', submittedAt: Date.now() };
      });
    });
  });
  recalculateAllModelV2(roomId);
  updateDb(db => { const room = db.rooms[roomId]; room.roomProgress.currentRoundId = 'week12'; room.roomProgress.currentPhase = 'finalResult'; room.roomProgress.finalResultVisible = true; Object.values(room.finalResults).forEach(r => { r.visible = true; }); });
}

function repairModelV2Data(roomId) {
  updateDb(db => {
    const room = db.rooms[roomId];
    Object.values(room.teamDecisions || {}).forEach(decision => {
      if (!decision.discussionQualityReview) decision.discussionQualityReview = analyzeDiscussionSummary(decision.discussionSummary || '');
    });
    Object.values(room.submissions || {}).forEach(submission => {
      const discussionQualityReview = room.teamDecisions?.[`${submission.roundId}_${submission.teamId}`]?.discussionQualityReview || null;
      submission.evidenceReview = submission.evidenceReview || buildTeamOutputEvidenceReview({ answers: submission.answers || {}, expertiseLens: db.gameContent.teamExpertiseLenses?.[submission.teamId] });
      const outputRequirement = getOutputRequirement(db.gameContent, submission.roundId);
      const qualityResult = calculateSubmissionQuality(outputRequirement, submission.answers || {}, submission.evidenceReview, discussionQualityReview);
      submission.quality = qualityResult.quality;
      submission.qualityScore = qualityResult.qualityScore;
      submission.qualityBreakdown = qualityResult.qualityBreakdown;
      submission.discussionQualityReview = discussionQualityReview;
      submission.updatedAt = Date.now();
    });
    Object.values(room.declarations || {}).forEach(declaration => {
      if (declaration.teamDeclaration && !declaration.declarationQualityReview) declaration.declarationQualityReview = analyzeTeamDeclaration(declaration.teamDeclaration);
      Object.values(declaration.individualReflections || {}).forEach(reflection => {
        if (!reflection.reflectionQualityReview) reflection.reflectionQualityReview = analyzePersonalReflection({ habit: reflection.habit, nextBehavior: reflection.nextBehavior });
      });
    });
  });
}

function recalculateAllModelV2(roomId) {
  updateDb(db => {
    const room = db.rooms[roomId];
    room.roundCalculations = {};
    room.finalResults = {};
    resetStateValues(room);
  });
  rounds.forEach(roundId => {
    Object.keys(readDb().rooms[roomId].teams).forEach(teamId => {
      try { calculateRoundResult({ roomId, roundId, teamId }); } catch { /* incomplete team */ }
    });
  });
  generateFinalResults(roomId);
}

function resetCurrentRoomProgress(roomId) {
  updateDb(db => {
    const room = db.rooms[roomId];
    resetRoom(room);
    room.roomProgress.currentRoundId = 'round0';
    room.roomProgress.currentPhase = 'ksaSelection';
    room.roomProgress.currentRoundOrder = 1;
    room.roomProgress.resultVisible = false;
    room.roomProgress.finalResultVisible = false;
    Object.values(room.roundProgress || {}).forEach(progress => {
      progress.status = progress.roundId === 'round0' ? 'active' : 'pending';
      progress.phase = 'intro';
      progress.resultRevealed = false;
      progress.locked = false;
      progress.skipped = false;
    });
  });
}

function downloadJson(filename, data) { const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
function downloadText(filename, text) { const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }
function buildOpsMarkdown(room, health) {
  const balance = buildRehearsalBalanceCheck(room);
  const lines = ['# 운영 QA 점검 리포트', '', `- 방 ID: ${room.roomId}`, `- 현재 라운드: ${room.roomProgress.currentRoundId}`, `- 현재 단계: ${room.roomProgress.currentPhase}`, `- 이슈 수: ${health.summary.issueCount}`, '', '## 리허설 샘플 밸런스 검증', `- 시나리오: ${balance.scenarioLabel}`, `- 상태: ${balance.status}`, `- 최종 판정 생성: ${balance.finalCount}/${balance.teamCount}`, `- 기준 충족: ${balance.passedCount}/${balance.totalChecks}`, `- 요약: ${balance.summary}`, '', '### 기준별 확인'];
  balance.checks.forEach(check => lines.push(`- [${check.status}] ${check.label}: ${check.detail} → ${check.action}`));
  lines.push('', '## 계산 모델 v2 QA', `- 토의 품질 v2 정상 팀: ${health.summary.discussionV2ReadyTeams}/${health.summary.totalTeams}`, `- 산출물 품질 v2 정상 팀: ${health.summary.qualityV2ReadyTeams}/${health.summary.totalTeams}`, `- 영향도 TOP 3 정상 팀: ${health.summary.impactReadyTeams}/${health.summary.totalTeams}`, `- 누적 리스크 정상 팀: ${health.summary.cumulativeRiskReadyTeams}/${health.summary.totalTeams}`, `- 최종 게이트 정상 팀: ${health.summary.finalGateTeams}/${health.summary.totalTeams}`, `- 선언문 피드백 정상 팀: ${health.summary.declarationReviewTeams}/${health.summary.totalTeams}`, `- 개인 성찰 피드백 정상 팀: ${health.summary.reflectionReviewTeams}/${health.summary.totalTeams}`);
  lines.push('', '## 전문성 고도화 QA', `- 전문성 렌즈 정상 팀: ${health.summary.expertiseReadyTeams}/${health.summary.totalTeams}`, `- 산출물 증거 수준 정상 팀: ${health.summary.evidenceReadyTeams}/${health.summary.totalTeams}`, `- 팀별 결과 해석 정상 팀: ${health.summary.narrativeReadyTeams}/${health.summary.totalTeams}`, `- 누적 경고 신호 팀: ${health.summary.warningSignalTeams}/${health.summary.totalTeams}`);
  lines.push('', '## 팀별 점검');
  health.teamRows.forEach(row => lines.push(`- ${row.teamName}: ${row.status} / KSA ${row.ksaStatus} / 토의v2 ${row.discussionReviewCount}/${row.decisionCount} / 품질v2 ${row.qualityV2Count}/${row.submissionCount} / 계산 ${row.calculationCount}/${health.playableRounds.length} / 영향도 ${row.impactLogCount}/${row.calculationCount} / 누적 ${row.cumulativeRiskCount}/${row.calculationCount} / 최종게이트 ${row.finalGateStatus} / 선언문 ${row.declarationReviewStatus} / 성찰 ${row.reflectionReviewCount}/${row.reflectionCount}`));
  lines.push('', '## 확인 필요 항목');
  if (health.issues.length) health.issues.forEach(issue => lines.push(`- [${issue.severity}] ${issue.teamName} · ${issue.area}: ${issue.message} → ${issue.action}`));
  else lines.push('- 확인 필요 항목 없음');
  return lines.join('\n');
}

export default function AdminOpsPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);
  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;
  const health = buildOpsHealth(room, db.gameContent);
  const backup = () => downloadJson(`${roomId}_backup.json`, room);
  const exportQa = () => downloadText(`${roomId}_ops_qa.md`, buildOpsMarkdown(room, health));
  const importJson = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!window.confirm('JSON 가져오기는 현재 방 데이터를 가져온 파일 내용으로 덮어씁니다. 먼저 백업을 다운로드했습니까?')) {
      e.target.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data.teams || !data.roomProgress) throw new Error('형식 오류');
        updateDb(db => { db.rooms[roomId] = { ...data, roomId }; });
        setMsg('JSON 가져오기를 완료했습니다. 필요하면 계산 모델 v2 데이터 보정과 전체 재계산을 실행하세요.');
      } catch (err) { setMsg(`JSON 가져오기 실패: ${err.message}`); }
      e.target.value = '';
    };
    r.readAsText(f);
  };

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">운영 안정화</p>
        <h2>운영 QA 점검판</h2>
        <p>현재 라운드: {room.roomProgress.currentRoundId} · 단계: {room.roomProgress.currentPhase}</p>
        <p>참가자: {Object.keys(room.players).length}명 · 팀: {Object.keys(room.teams).length}개</p>
        <div className="facilitatorOnlyNotice"><b>강사용 운영 도구</b><p>JSON 가져오기, 리허설 샘플 생성, 재계산, 초기화는 현재 방 데이터를 변경합니다. 실행 전 JSON 백업을 먼저 다운로드하세요.</p></div>
        {msg && <div className="notice">{msg}</div>}
        <div className="summaryCards">
          <div><b>{health.summary.issueCount}</b><span>확인 항목</span></div>
          <div><b>{health.summary.completeKsaTeams}/{health.summary.totalTeams}</b><span>KSA 완료 팀</span></div>
          <div><b>{health.summary.calculatedTeams}/{health.summary.totalTeams}</b><span>라운드 계산 완료 팀</span></div>
          <div><b>{health.summary.qualityV2ReadyTeams}/{health.summary.totalTeams}</b><span>산출물 품질 v2</span></div>
          <div><b>{health.summary.discussionV2ReadyTeams}/{health.summary.totalTeams}</b><span>토의 품질 v2</span></div>
          <div><b>{health.summary.impactReadyTeams}/{health.summary.totalTeams}</b><span>영향도 TOP 3</span></div>
          <div><b>{health.summary.cumulativeRiskReadyTeams}/{health.summary.totalTeams}</b><span>누적 리스크</span></div>
          <div><b>{health.summary.finalGateTeams}/{health.summary.totalTeams}</b><span>최종 게이트</span></div>
        </div>
        <div className="actions">
          <button onClick={backup}>JSON 백업 다운로드</button>
          <button onClick={exportQa}>QA 리포트 다운로드</button>
          <label className="danger">JSON 가져오기<input type="file" accept=".json" onChange={importJson} style={{ display: 'none' }} /></label>
          <button onClick={() => setMsg('운영 QA 점검 결과를 아래 표에서 확인하세요.')}>운영 QA 점검</button>
          <Link className="secondary" to={`/competencies/${roomId}`}>역량 프로필</Link>
          <Link className="secondary" to={`/guide/${roomId}`}>강사 가이드</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트 보기</Link>
        </div>
      </section>

      <section className="card">
        <h3>계산 모델 v2 운영 안정화</h3>
        <p className="muted">이 버튼들은 이전 버전 데이터나 가져온 JSON을 현재 계산 모델 v2 구조에 맞게 보정할 때 사용합니다.</p>
        <div className="grid2">
          <div className="reportInsight">
            <h4>1. v2 데이터 보정</h4>
            <p>토의 품질, 산출물 품질 v2, 선언문·성찰 피드백이 비어 있는 기존 데이터를 보완합니다. 상태값은 다시 계산하지 않습니다.</p>
            <button onClick={() => { repairModelV2Data(roomId); setMsg('계산 모델 v2 데이터 보정을 완료했습니다. 필요하면 전체 라운드 재계산을 이어서 실행하세요.'); }}>계산 모델 v2 데이터 보정</button>
          </div>
          <div className="reportInsight">
            <h4>2. 전체 라운드 재계산</h4>
            <p>Week 1~11 결과를 순서대로 다시 계산해 영향도 TOP 3, 누적 리스크, 최종 게이트를 최신 구조로 재생성합니다.</p>
            <button className="primary" onClick={() => { if (!window.confirm('기존 계산 결과와 최종 판정을 지우고 다시 계산합니다. 계속하시겠습니까?')) return; repairModelV2Data(roomId); recalculateAllModelV2(roomId); setMsg('전체 라운드 재계산과 최종 판정 재생성을 완료했습니다.'); }}>전체 재계산 + 최종 판정 재생성</button>
          </div>
          <div className="reportInsight">
            <h4>3. 현재 방 초기화</h4>
            <p>현재 방의 참가자, 선택, 산출물, 계산 결과, 선언문을 비우고 Round 0 상태로 되돌립니다. 방 자체와 팀 정보는 남깁니다.</p>
            <button className="danger" onClick={() => { if (!window.confirm('현재 방의 진행 데이터를 모두 지우고 Round 0으로 되돌립니다. 먼저 백업했습니까?')) return; resetCurrentRoomProgress(roomId); setMsg('현재 방을 Round 0 상태로 초기화했습니다.'); }}>현재 방 진행 데이터 초기화</button>
          </div>
          <div className="reportInsight">
            <h4>4. 전체 localStorage 초기화</h4>
            <p>모든 방과 진행 데이터를 초기 상태로 되돌립니다. 파일럿 리허설이 끝난 뒤 새로 시작할 때만 사용하세요.</p>
            <button className="danger" onClick={() => { if (!window.confirm('전체 localStorage DB를 초기화합니다. 모든 방 데이터가 삭제됩니다. JSON 백업을 다운로드했습니까?')) return; resetDb(); navigate('/'); }}>전체 DB 초기화하고 처음으로</button>
          </div>
        </div>
      </section>

      <FinalPilotChecklistPanel roomId={roomId} joinCode={room.joinCode} />
      <RehearsalBalancePanel room={room} />

      <section className="card">
        <h3>리허설 샘플 시나리오 생성</h3>
        <p className="muted">버튼을 누르면 기존 리허설 데이터가 정리되고, 선택 패턴·산출물 품질·인물 카드 구성·성찰·선언문 피드백까지 새로 생성됩니다.</p>
        <div className="facilitatorOnlyNotice"><b>현재 데이터 초기화 주의</b><p>리허설 샘플을 생성하면 현재 참가자, 선택, 산출물, 계산 결과, 선언문 데이터가 새 샘플로 바뀝니다.</p></div>
        <div className="grid2">
          {Object.entries(scenarios).map(([key, scenario]) => (
            <div className="card" key={key}>
              <h4>{scenario.label}</h4>
              <p><b>인물 카드:</b> {scenario.personas.map(id => getPersonaById(id).personaLabel).join(' / ')}</p>
              <p><b>선택 패턴:</b> {scenario.choiceTypes.join(' → ')}</p>
              <button className="primary" onClick={() => {
                if (!window.confirm(`${scenario.label} 데이터를 생성하면 현재 리허설 데이터가 새 샘플로 바뀝니다. 계속하시겠습니까?`)) return;
                makeScenario(roomId, key);
                setMsg(`${scenario.label} 데이터를 생성했습니다.`);
              }}>{scenario.label} 생성</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>팀별 운영 점검</h3>
        <table>
          <thead><tr><th>팀</th><th>상태</th><th>KSA</th><th>전문성</th><th>참가자</th><th>토의v2</th><th>산출물</th><th>품질v2</th><th>계산</th><th>영향도</th><th>누적</th><th>최종게이트</th><th>선언문</th><th>성찰</th></tr></thead>
          <tbody>{health.teamRows.map(row => <tr key={row.teamId}><td>{row.teamName}</td><td>{row.status}</td><td>{row.ksaStatus}</td><td>{row.expertiseLensStatus}</td><td>{row.playerCount}</td><td>{row.discussionReviewCount}/{row.decisionCount}</td><td>{row.submissionCount}/{health.playableRounds.length}</td><td>{row.qualityV2Count}/{row.submissionCount}</td><td>{row.calculationCount}/{health.playableRounds.length}</td><td>{row.impactLogCount}/{row.calculationCount}</td><td>{row.cumulativeRiskCount}/{row.calculationCount}</td><td>{row.finalGateStatus}</td><td>{row.declarationReviewStatus}</td><td>{row.reflectionReviewCount}/{row.reflectionCount}</td></tr>)}</tbody>
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
