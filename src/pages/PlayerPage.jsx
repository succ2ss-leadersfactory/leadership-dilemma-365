import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import RoundCard from '../components/RoundCard.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import ResultCard from '../components/ResultCard.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { getPlayer } from '../services/playerService';
import { getCurrentRound } from '../services/roundService';
import { submitVote, getVote } from '../services/voteService';
import { defaultResultCard } from '../data/seedResultCards';

export default function PlayerPage() {
  const { roomId, playerId } = useParams();
  const [tick, setTick] = useState(0);
  const [choiceId, setChoiceId] = useState('');
  const [reason, setReason] = useState('');
  const [habit, setHabit] = useState('');
  const [nextBehavior, setNextBehavior] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  const player = getPlayer(roomId, playerId);
  const round = getCurrentRound(roomId);
  if (!room || !player || !round) return <Layout><div className="card">정보를 찾을 수 없습니다.</div></Layout>;

  const team = room.teams[player.teamId];
  const choices = db.gameContent.choices.filter(c => round.choiceIds.includes(c.choiceId)).sort((a, b) => a.displayOrder - b.displayOrder);
  const vote = getVote(roomId, round.roundId, player.teamId, playerId);
  const canVote = room.roomProgress.currentPhase === 'playerVote' && !room.roomProgress.isScreenLocked;
  const calculation = room.roundCalculations[`${round.roundId}_${player.teamId}`];
  const resultCard = db.gameContent.resultCards[calculation?.resultCardId] || defaultResultCard;
  const declaration = room.declarations?.[player.teamId];
  const reflection = declaration?.individualReflections?.[playerId];

  const save = () => {
    try {
      submitVote({ roomId, roundId: round.roundId, teamId: player.teamId, playerId, choiceId: choiceId || vote?.choiceId, reason: reason || vote?.reason });
      setMsg('개인 선택을 저장했습니다. 팀 화면에서 선택 분포와 최종 결정을 확인하세요.');
    } catch (e) { setMsg(e.message); }
  };

  const saveReflection = () => {
    updateDb(db2 => {
      const d = db2.rooms[roomId].declarations[player.teamId] || { teamId: player.teamId, individualReflections: {} };
      d.individualReflections = {
        ...(d.individualReflections || {}),
        [playerId]: {
          habit: habit || reflection?.habit || '',
          nextBehavior: nextBehavior || reflection?.nextBehavior || '',
          submittedAt: Date.now()
        }
      };
      db2.rooms[roomId].declarations[player.teamId] = d;
    });
    setMsg('개인 성찰을 저장했습니다. 팀 화면에서 선언문을 작성해 마무리하세요.');
  };

  return (
    <Layout roomId={roomId}>
      <RoundCard round={round} />
      <section className="card">
        <p>참가자: <b>{player.displayName}</b> · 팀: <Link to={`/team/${roomId}/${player.teamId}`}>{team.teamName}</Link></p>
        <p className="muted">현재 단계: {room.roomProgress.currentPhase}</p>
        {msg && <div className="notice">{msg}</div>}

        {choices.length > 0 ? (
          <>
            <ChoiceList choices={choices} selectedChoiceId={choiceId || vote?.choiceId} onSelect={setChoiceId} disabled={!canVote} />
            <label>선택 이유<textarea disabled={!canVote} value={reason || vote?.reason || ''} onChange={e => setReason(e.target.value)} placeholder="왜 이 선택을 하셨습니까?" /></label>
            <div className="actions">
              <button className="primary" disabled={!canVote} onClick={save}>개인 선택 저장</button>
              <Link className="secondary" to={`/team/${roomId}/${player.teamId}`}>팀 결정 화면으로 이동</Link>
            </div>
          </>
        ) : round.roundId === 'week12' ? (
          <>
            <h3>개인 성찰</h3>
            <p className="muted">팀 선언문을 쓰기 전에, 내가 반복한 판단 습관과 현업에서 바꿀 행동을 먼저 남깁니다.</p>
            <label>내가 반복한 판단 습관<textarea defaultValue={reflection?.habit || ''} onChange={e => setHabit(e.target.value)} placeholder="예: 불확실하면 속도를 먼저 선택했다 / 기준을 세우느라 실행을 늦췄다" /></label>
            <label>다음 현업에서 바꿀 행동<textarea defaultValue={reflection?.nextBehavior || ''} onChange={e => setNextBehavior(e.target.value)} placeholder="예: 선택 전에 부담이 누구에게 몰리는지 먼저 확인하겠다" /></label>
            <div className="actions">
              <button className="primary" onClick={saveReflection}>개인 성찰 저장</button>
              <Link className="secondary" to={`/team/${roomId}/${player.teamId}`}>팀 선언문 작성으로 이동</Link>
              <Link className="secondary" to={`/report/${roomId}`}>교육 리포트 보기</Link>
            </div>
          </>
        ) : <p>KSA 선택은 팀 화면에서 진행합니다.</p>}
      </section>
      {room.roomProgress.resultVisible && calculation && <ResultCard card={resultCard} calculation={calculation} />}
    </Layout>
  );
}
