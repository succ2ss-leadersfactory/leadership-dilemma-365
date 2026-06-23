import '../styles/roundCardUx.css';

export default function RoundCard({ round }) {
  if (!round) return null;
  return <section className="card hero roundHero"><span className="eyebrow">이번 라운드 · Week {round.week}</span><h2>{round.title}</h2><div className="roundQuestionBox"><small>오늘의 판단 질문</small><h3>{round.coreQuestion}</h3></div><div className="roundSituationBox"><h4>지금 벌어진 일</h4><p>{round.situationText}</p></div><div className="roundSignalBox"><h4>팀 안에서 보이는 신호</h4><p>{round.teamSignalText}</p></div></section>;
}
