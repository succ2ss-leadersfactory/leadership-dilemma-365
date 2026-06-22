export default function ResultCard({ card, calculation }) {
  if (!card) return null;
  return <section className="card"><h3>결과 카드</h3><p className="resultLine">{card.oneLineResult}</p><ul><li>{card.smallProgress}</li><li>{card.smallFriction}</li><li>{card.reorgReviewView}</li></ul>{calculation && <pre>{JSON.stringify(calculation.finalState, null, 2)}</pre>}</section>;
}
