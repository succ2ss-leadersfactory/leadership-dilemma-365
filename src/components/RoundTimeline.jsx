import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribe, readDb } from '../services/storage';
import '../styles/timeline.css';

const phaseLabels = {
  setup: '준비',
  briefing: '상황 확인',
  playerVote: '개인 선택',
  teamDecision: '팀 결정',
  output: '산출물',
  result: '결과',
  finalResult: '최종 판정'
};

export default function RoundTimeline({ roomId }) {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  if (!roomId) return null;
  const room = readDb().rooms[roomId];
  if (!room) return null;

  const rounds = readDb().gameContent.rounds || [];
  const currentId = room.roomProgress.currentRoundId;
  const currentRound = rounds.find(r => r.roundId === currentId);

  return (
    <section className="timelineWrap">
      <div className="timelineHeader">
        <div>
          <b>{currentRound?.title || '라운드'}</b>
          <span>{phaseLabels[room.roomProgress.currentPhase] || room.roomProgress.currentPhase}</span>
        </div>
        <div className="timelineLinks">
          <Link to={`/host/${roomId}`}>Host</Link>
          <Link to={`/guide/${roomId}`}>강사 가이드</Link>
          <Link to={`/report/${roomId}`}>리포트</Link>
        </div>
      </div>
      <div className="timelineSteps">
        {rounds.map(r => {
          const state = r.order < (currentRound?.order || 0) ? 'done' : r.roundId === currentId ? 'current' : 'todo';
          return (
            <div className={`timelineStep ${state}`} key={r.roundId}>
              <span>{r.week === 0 ? 'R0' : `W${r.week}`}</span>
              <small>{r.title}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}
