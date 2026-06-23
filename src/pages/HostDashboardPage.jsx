import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StrategicEventCard from '../components/StrategicEventCard.jsx';
import TwelveWeekTimeline from '../components/TwelveWeekTimeline.jsx';
import PilotRunbookPanel from '../components/PilotRunbookPanel.jsx';
import { subscribe, readDb } from '../services/storage';
import { getRoom, updateRoomProgress } from '../services/roomService';
import { getCurrentRound, movePhase, moveToNextRound, revealRoundResult } from '../services/roundService';
import { calculateAllTeamResultsForRound, generateFinalResults } from '../services/calculationService';
import { stateLabels } from '../utils/statusLabels';
import '../styles/hostDashboardUx.css';

const phaseLabels = {
  ksaSelection: 'KSA 선택',
  playerVote: '개인 판단 입력',
  teamDecision: '팀 토의와 최종 선택',
  outputSubmission: '산출물 작성',
  resultReview: '결과 확인',
  finalReflection: '개인 성찰',
  teamDeclaration: '팀 선언문',
  finalResult: '최종 판정'
};

function nextAction(round, progress) {
  if (!round) return '방을 다시 확인하세요.';
  if (round.roundId === 'round0') return '팀 화면에서 KSA를 선택한 뒤 Week 1로 이동합니다.';
  if (round.roundId === 'week12') return '개인 성찰, 팀 선언문, 최종 판정, 교육 리포트 순서로 마무리합니다.';
  if (progress.resultVisible) return '결과 카드를 확인한 뒤 다음 라운드로 이동합니다.';
  if (progress.currentPhase === 'playerVote') return '참가자가 개인 선택을 저장한 뒤 팀 화면에서 최종 결정을 진행합니다.';
  if (progress.currentPhase === 'teamDecision') return '팀 최종 선택과 산출물을 저장한 뒤 결과를 계산합니다.';
  return '현재 단계의 입력을 확인한 뒤 다음 단계로 이동합니다.';
}

function isKsaComplete(team) {
  return team.selectedKSA?.knowledge?.length === 3 && team.selectedKSA?.skill?.length === 3 && team.selectedKSA?.attitude?.length === 3;
}

function teamRoundStatus({ room, round, team, players }) {
  const teamPlayers = players.filter(player => player.teamId === team.teamId);
  const voteCount = Object.values(room.votes || {}).filter(v => v.roundId === round?.roundId && v.teamId === team.teamId).length;
  const decision = room.teamDecisions?.[`${round?.roundId}_${team.teamId}`];
  const submission = room.submissions?.[`${round?.roundId}_${team.teamId}`];
  const calculation = room.roundCalculations?.[`${round?.roundId}_${team.teamId}`];
  const declaration = room.declarations?.[team.teamId];
  const reflectionCount = Object.keys(declaration?.individualReflections || {}).length;
  const finalResult = room.finalResults?.[team.teamId];

  if (round?.roundId === 'round0') {
    return [
      { label: 'KSA', done: isKsaComplete(team), text: isKsaComplete(team) ? '저장 완료' : '미완료' },
      { label: '팀원', done: teamPlayers.length > 0, text: `${teamPlayers.length}명 입장` }
    ];
  }

  if (round?.roundId === 'week12') {
    return [
      { label: '개인 성찰', done: reflectionCount > 0, text: `${reflectionCount}건` },
      { label: '팀 선언문', done: Boolean(declaration?.teamDeclaration), text: declaration?.teamDeclaration ? '저장 완료' : '미완료' },
      { label: '최종 판정', done: Boolean(finalResult), text: finalResult ? '생성 완료' : '미생성' }
    ];
  }

  return [
    { label: '개인 판단', done: voteCount >= Math.max(1, teamPlayers.length), text: `${voteCount}/${teamPlayers.length || 0}` },
    { label: '팀 결정', done: Boolean(decision), text: decision ? '저장 완료' : '대기' },
    { label: '산출물', done: Boolean(submission), text: submission ? '저장 완료' : '대기' },
    { label: '결과', done: Boolean(calculation), text: calculation ? '계산 완료' : '미계산' }
  ];
}

export default function HostDashboardPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = getRoom(roomId);
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const round = getCurrentRound(roomId);
  const strategicEvent = db.gameContent.strategicEvents?.[round?.strategicEventId];
  const progress = room.roomProgress;
  const teams = Object.values(room.teams);
  const players = Object.values(room.players);
  const finalCount = Object.keys(room.finalResults || {}).length;
  const reflectionCount = Object.values(room.declarations || {}).reduce((sum, d) => sum + Object.keys(d.individualReflections || {}).length, 0);
  const phaseLabel = phaseLabels[progress.currentPhase] || progress.currentPhase;
  const ksaDoneCount = teams.filter(isKsaComplete).length;
  const roundCalculations = Object.values(room.roundCalculations || {}).filter(item => item.roundId === progress.currentRoundId).length;

  return (
    <Layout roomId={roomId}>
      <section className="card hero hostDashboardHero">
        <div className="hostDashboardHeader">
          <div>
            <p className="hostDashboardEyebrow">HOST CONTROL</p>
            <h2>{round?.title} · {phaseLabel}</h2>
            <p>강사는 이 화면에서 진행 단계, 팀별 입력 상태, 결과 공개와 최종 리포트 이동을 관리합니다.</p>
          </div>
          <div className="hostJoinCard">
            <small>입장 코드</small>
            <b className="code">{room.joinCode}</b>
            <p><Link to={`/join/${room.joinCode}`}>참가자 입장 링크 열기</Link></p>
          </div>
        </div>

        <div className="hostQuickStats">
          <div><b>{players.length}</b><span>참가자</span></div>
          <div><b>{teams.length}</b><span>팀</span></div>
          <div><b>{phaseLabel}</b><span>현재 단계</span></div>
          <div><b>{progress.isScreenLocked ? '잠금' : '해제'}</b><span>화면 상태</span></div>
          <div><b>{progress.resultVisible ? '공개' : '비공개'}</b><span>결과 카드</span></div>
          <div><b>{finalCount}/{teams.length}</b><span>최종 판정</span></div>
        </div>

        <div className="hostNextAction"><b>다음 행동:</b> {nextAction(round, progress)}</div>

        <div className="hostActionBar">
          <button onClick={() => movePhase(roomId, 'prev')}>이전 단계</button>
          <button className="primary" onClick={() => movePhase(roomId, 'next')}>다음 단계</button>
          <button onClick={() => moveToNextRound(roomId)}>다음 라운드</button>
          <button onClick={() => updateRoomProgress(roomId, { isScreenLocked: !progress.isScreenLocked })}>{progress.isScreenLocked ? '잠금 해제' : '화면 잠금'}</button>
          <button onClick={() => { calculateAllTeamResultsForRound(roomId, progress.currentRoundId); revealRoundResult(roomId); }}>계산 후 결과 공개</button>
          <button onClick={() => generateFinalResults(roomId)}>최종 판정 생성</button>
          <Link className="secondary" to={`/competencies/${roomId}`}>역량 프로필</Link>
          <Link className="secondary" to={`/guide/${roomId}`}>강사 가이드</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트</Link>
        </div>
      </section>

      <section className="hostOpsBoard">
        <div className="card hostOpsCard">
          <h3>운영 현황</h3>
          <p><b>KSA 완료:</b> {ksaDoneCount}/{teams.length}개 팀</p>
          <p><b>현재 라운드 결과 계산:</b> {roundCalculations}/{teams.length}개 팀</p>
          <p><b>개인 성찰:</b> {reflectionCount}건</p>
          <p><b>최종 판정:</b> {finalCount}개 팀</p>
        </div>
        <div className="card hostOpsCard">
          <h3>진행 체크리스트</h3>
          <ol>
            <li>Round 0: 팀별 KSA 저장 및 팀원 초기 역량 프로필 자동 등록</li>
            <li>Week 라운드: 파일럿 진행 체크리스트와 전략 이벤트 확인</li>
            <li>개인 선택 저장</li>
            <li>팀 최종 선택과 산출물 저장</li>
            <li>결과 계산 후 결과 카드 확인</li>
            <li>Week 12: 개인 성찰과 팀 선언문 저장</li>
            <li>최종 판정 생성 후 교육 리포트 확인</li>
          </ol>
        </div>
        <div className="card hostOpsCard hostLinksCard">
          <h3>운영 링크</h3>
          <p><Link to={`/compare/${roomId}`}>다팀 비교 화면</Link></p>
          <p><Link to={`/competencies/${roomId}`}>역량 프로필 화면</Link></p>
          <p><Link to={`/guide/${roomId}`}>강사 가이드</Link></p>
          <p><Link to={`/admin/${roomId}`}>관리자 운영 도구</Link></p>
        </div>
      </section>

      <PilotRunbookPanel round={round} progress={progress} />
      <StrategicEventCard event={strategicEvent} audience="facilitator" />
      <TwelveWeekTimeline rounds={db.gameContent.rounds} weekLogs={db.gameContent.weekLogs} currentWeek={round?.week || 0} audience="facilitator" />

      <section className="card">
        <h3>팀별 진행 보드</h3>
        <div className="hostTeamOpsGrid">
          {teams.map(team => {
            const steps = teamRoundStatus({ room, round, team, players });
            const risk = room.stateValues[team.teamId];
            return (
              <div className="hostTeamOpsCard" key={team.teamId}>
                <div className="hostTeamOpsCard__top">
                  <div>
                    <h4>{team.teamName}</h4>
                    <small>{team.slogan}</small>
                  </div>
                  <span className={steps.every(step => step.done) ? 'hostBadge success' : 'hostBadge warning'}>{steps.every(step => step.done) ? '준비 완료' : '확인 필요'}</span>
                </div>
                <div className="hostTeamOpsCard__steps">
                  {steps.map(step => <div className={step.done ? 'hostStepLine done' : 'hostStepLine'} key={step.label}><b>{step.label}</b><span>{step.text}</span></div>)}
                </div>
                {risk && <p><b>최대 리스크:</b> {stateLabels[risk.maxRiskKey] || risk.maxRiskKey} · {risk.maxRiskLabel}</p>}
                <p><Link to={`/team/${roomId}/${team.teamId}`}>{team.teamName} 진행 화면 열기</Link></p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <h3>참가자</h3>
          {players.length ? players.map(p => <p key={p.playerId}>{p.displayName} · {room.teams[p.teamId]?.teamName}</p>) : <p className="muted">아직 입장자가 없습니다.</p>}
        </div>
        <div className="card">
          <h3>팀별 상태값</h3>
          <table>
            <thead><tr><th>팀</th><th>최대 리스크</th><th>상태값</th></tr></thead>
            <tbody>{teams.map(t => { const s = room.stateValues[t.teamId]; return <tr key={t.teamId}><td>{t.teamName}</td><td>{stateLabels[s.maxRiskKey] || s.maxRiskKey} · {s.maxRiskLabel}</td><td>{Object.values(s.values).join(' / ')}</td></tr>; })}</tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}
