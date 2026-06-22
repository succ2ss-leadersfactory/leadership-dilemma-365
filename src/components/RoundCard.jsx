export default function RoundCard({ round }) {
  if (!round) return null;
  return <section className="card hero"><span className="eyebrow">Week {round.week}</span><h2>{round.title}</h2><h3>{round.coreQuestion}</h3><p>{round.situationText}</p><div className="signal">{round.teamSignalText}</div></section>;
}
