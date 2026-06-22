export default function StrategicEventCard({ event, teamId }) {
  if (!event) return null;
  const lens = event.teamLens?.[teamId];
  return (
    <section className={`card strategic-event strategic-event-${event.eventType || 'mixed'}`}>
      <p className="eyebrow">{event.eventLabel || '전략 이벤트'}</p>
      <h3>{event.title}</h3>
      <p className="eventTrigger">{event.triggerText}</p>
      <div className="eventGrid">
        <div>
          <b>압박</b>
          <p>{event.pressureText}</p>
        </div>
        <div>
          <b>숨은 대가</b>
          <p>{event.hiddenTradeoff}</p>
        </div>
        <div>
          <b>전략적 기회</b>
          <p>{event.opportunityText}</p>
        </div>
      </div>
      {lens && <div className="eventLens"><b>우리 팀 관점</b><p>{lens}</p></div>}
      {event.facilitatorPrompt && <p className="eventPrompt"><b>토의 질문:</b> {event.facilitatorPrompt}</p>}
    </section>
  );
}
