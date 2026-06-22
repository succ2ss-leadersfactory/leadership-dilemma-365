import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StrategicEventCard from '../components/StrategicEventCard.jsx';
import TwelveWeekTimeline from '../components/TwelveWeekTimeline.jsx';
import { subscribe, readDb } from '../services/storage';
import { getRoom, updateRoomProgress } from '../services/roomService';
import { getCurrentRound, movePhase, moveToNextRound, revealRoundResult } from '../services/roundService';
import { calculateAllTeamResultsForRound, generateFinalResults } from '../services/calculationService';
import { stateLabels } from '../utils/statusLabels';

function nextAction(round, progress) {
  if (!round) return '방을 다시 확인하세요.';
  if (round.roundId === 'round0') return '팀 화면에서 KSA를 선택한 뒤 Week 1로 이동합니다.';
  if (round.roundId === 'week12') return '개인 성찰, 팀 선언문, 최종 판정, 교육 리포트 순서로 마무리합니다.';
  if (progress.resultVisible) return '결과 카드를 확인한 뒤 다음 라운드로 이동합니다.';
  if (progress.currentPhase === 'playerVote') return '참가자가 개인 선택을 저장한 뒤 팀 화면에서 최종 결정을 진행합니다.';
  if (progress.currentPhase === 'teamDecision') return '팀 최종 선택과 산출물을 저장한 뒤 결과를 계산합니다.';
  return '현재 단계의 입력을 확인한 뒤 다음 단계로 이동합니다.';
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

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">Host Dashboard</p>
        <h2>{round?.title} · {progress.currentPhase}</h2>
        <p>입장 코드: <b className="code">{room.joinCode}</b> · 참가 링크: <Link to={`/join/${room.joinCode}`}>/join/{room.joinCode}</Link></p>
        <div className="notice"><b>다음 행동:</b> {nextAction(round, progress)}</div>
        <div className="actions">
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

      <StrategicEventCard event={strategicEvent} />
      <TwelveWeekTimeline rounds={db.gameContent.rounds} weekLogs={db.gameContent.weekLogs} currentWeek={round?.week || 0} compact />

      <section className="grid2">
        <div className="card">
          <h3>운영 현황</h3>
          <p><b>참가자:</b> {players.length}명</p>
          <p><b>팀:</b> {teams.length}개</p>
          <p><b>화면 잠금:</b> {progress.isScreenLocked ? '잠금' : '해제'}</p>
          <p><b>결과 공개:</b> {progress.resultVisible ? '공개' : '비공개'}</p>
          <p><b>최종 판정:</b> {finalCount}개 팀</p>
          <p><b>개인 성찰:</b> {reflectionCount}건</p>
        </div>
        <div className="card">
          <h3>진행 체크리스트</h3>
          <ol>
            <li>Round 0: 팀별 KSA 저장 및 팀원 초기 역량 프로필 자동 등록</li>
            <li>Week 라운드: 전략 이벤트 카드와 12주 타임라인 확인</li>
            <li>개인 선택 저장</li>
            <li>팀 최종 선택과 산출물 저장</li>
            <li>결과 계산 후 결과 카드 확인</li>
            <li>Week 12: 개인 성찰과 팀 선언문 저장</li>
            <li>최종 판정 생성 후 교육 리포트 확인</li>
          </ol>
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <h3>참가자</h3>
          {players.length ? players.map(p => <p key={p.playerId}>{p.displayName} · {room.teams[p.teamId]?.teamName}</p>) : <p className="muted">아직 입장자가 없습니다.</p>}
        </div>
        <div className="card">
          <h3>팀 화면</h3>
          {teams.map(t => <p key={t.teamId}><Link to={`/team/${roomId}/${t.teamId}`}>{t.teamName} 진행 화면</Link></p>)}
        </div>
      </section>

      <section className="card">
        <h3>팀별 상태</h3>
        <table>
          <thead><tr><th>팀</th><th>최대 리스크</th><th>상태값</th></tr></thead>
          <tbody>{teams.map(t => { const s = room.stateValues[t.teamId]; return <tr key={t.teamId}><td>{t.teamName}</td><td>{stateLabels[s.maxRiskKey] || s.maxRiskKey} · {s.maxRiskLabel}</td><td>{Object.values(s.values).join(' / ')}</td></tr>; })}</tbody>
        </table>
      </section>
    </Layout>
  );
}
