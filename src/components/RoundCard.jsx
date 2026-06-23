import { useEffect } from 'react';
import '../styles/roundCardUx.css';

export default function RoundCard({ round, teamVariant = null }) {
  const roundId = round?.roundId;

  useEffect(() => {
    if (!roundId) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [roundId]);

  if (!round) return null;

  return (
    <section className="card hero roundHero">
      <div className="roundHeroTop">
        <div>
          <p className="roundHeroEyebrow">이번 라운드</p>
          <h2>{round.title}</h2>
        </div>
        <span className="roundWeekBadge">Week {round.week}</span>
      </div>

      <div className="roundQuestionBox">
        <small>오늘의 판단 질문</small>
        <h3>{round.coreQuestion}</h3>
      </div>

      <div className="roundReadHint" aria-label="상황 읽기 기준">
        <div><b>무엇이 흔들렸나</b><span>상황 속에서 깨진 기대와 압박을 먼저 봅니다.</span></div>
        <div><b>누가 부담을 안는가</b><span>선택 이후 부담이 몰릴 사람과 팀을 확인합니다.</span></div>
        <div><b>무엇을 뒤로 미루는가</b><span>선택하지 않는 것의 대가를 함께 생각합니다.</span></div>
      </div>

      <div className="roundSituationBox">
        <h4>전사 공통 상황</h4>
        <p>{round.situationText}</p>
      </div>

      {teamVariant?.signalText && (
        <div className="roundSignalBox">
          <h4>우리 팀에 들어온 신호</h4>
          <p>{teamVariant.signalText}</p>
        </div>
      )}

      <div className="roundSignalBox">
        <h4>팀 안에서 보이는 공통 신호</h4>
        <p>{round.teamSignalText}</p>
      </div>
    </section>
  );
}
