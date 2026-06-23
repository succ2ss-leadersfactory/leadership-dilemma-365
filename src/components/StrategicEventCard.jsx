import '../styles/strategicEventUx.css';

export default function StrategicEventCard({ event, teamId, audience = 'participant' }) {
  if (!event) return null;
  const lens = event.teamLens?.[teamId];
  const isFacilitator = audience === 'facilitator';

  return (
    <section className={`card strategic-event strategic-event-${event.eventType || 'mixed'} strategicEventCard`}>
      <div className="strategicEventHeader">
        <div>
          <p className="eyebrow">이번 주 외부 신호</p>
          <h3>{event.title}</h3>
        </div>
        <span className="eventTypeBadge">{event.eventLabel || '전략 이벤트'}</span>
      </div>

      <div className="eventTriggerBox">
        <h4>무슨 일이 벌어졌나</h4>
        <p>{event.triggerText}</p>
      </div>

      <div className="eventSignalGrid">
        <div>
          <b>지금 생긴 압박</b>
          <p>{event.pressureText}</p>
        </div>
        <div>
          <b>놓치기 쉬운 대가</b>
          <p>{event.hiddenTradeoff}</p>
        </div>
        <div>
          <b>활용할 수 있는 기회</b>
          <p>{event.opportunityText}</p>
        </div>
      </div>

      {lens && <div className="eventLensBox"><b>우리 팀 관점</b><p>{lens}</p></div>}
      {!isFacilitator && <p className="eventParticipantHint">이 신호는 정답을 알려주는 단서가 아니라, 이번 선택에서 무엇을 더 조심해야 하는지 보여주는 배경입니다.</p>}
      {isFacilitator && event.facilitatorPrompt && <p className="eventFacilitatorPrompt"><b>강사용 토의 질문:</b> {event.facilitatorPrompt}</p>}
    </section>
  );
}
