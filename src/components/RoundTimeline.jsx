import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { subscribe, readDb } from '../services/storage';
import '../styles/timeline.css';

const hostPrefixes = ['/host/', '/compare/', '/report/', '/guide/', '/admin/', '/competencies/'];

const phaseLabels = {
  setup: '준비',
  briefing: '상황 확인',
  ksaSelection: 'KSA 선택',
  playerVote: '개인 판단',
  teamDecision: '팀 토의',
  output: '산출물',
  outputSubmission: '산출물 작성',
  result: '결과 확인',
  resultReview: '결과 확인',
  finalReflection: '개인 성찰',
  teamDeclaration: '팀 선언문',
  finalResult: '최종 판정'
};

export default function RoundTimeline({ roomId }) {
  const [tick, setTick] = useState(0);
  const location = useLocation();
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  if (!roomId) return null;
  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return null;

  const hostView = hostPrefixes.some(prefix => location.pathname.startsWith(prefix));
  const rounds = db.gameContent.rounds || [];
  const currentId = room.roomProgress.currentRoundId;
  const currentRound = rounds.find(r => r.roundId === currentId);

  return (
    <section className={`timelineWrap ${hostView ? 'hostTimeline' : 'playTimeline'}`}>
      <div className="timelineHeader">
        <div>
          <b>{currentRound?.title || '라운드'}</b>
          <span>{phaseLabels[room.roomProgress.currentPhase] || '진행 중'}</span>
        </div>
        {hostView ? (
          <div className="timelineLinks">
            <Link to={`/host/${roomId}`}>Host</Link>
            <Link to={`/guide/${roomId}`}>강사 가이드</Link>
            <Link to={`/report/${roomId}`}>리포트</Link>
          </div>
        ) : (
          <div className="timelineParticipantNote">현재 라운드 흐름만 확인하세요</div>
        )}
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
