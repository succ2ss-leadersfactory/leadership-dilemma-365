import '../styles/teamDecisionSummary.css';

function optionMark(index) {
  return String.fromCharCode(65 + index);
}

export default function TeamDecisionSummary({ choices = [], opinions = [] }) {
  if (!choices.length) return null;
  const total = opinions.length;

  return (
    <div className="teamDecisionSummary">
      <div className="teamDecisionSummaryHeader">
        <div>
          <h3>개인 판단 모아보기</h3>
          <p>팀 결정 전에 각자가 먼저 본 문제와 선택 이유를 확인합니다. 이 분포는 결론이 아니라 토의 출발점입니다.</p>
        </div>
        <div className="decisionMeta">
          <b>{total}</b>
          <span>저장된 개인 판단</span>
        </div>
      </div>

      {total === 0 && <div className="decisionEmptyBox">아직 개인 판단이 없습니다. 팀원들이 개인 선택을 저장하면 이곳에 모입니다.</div>}

      <div className="decisionChoiceGrid">
        {choices.map((choice, index) => {
          const items = opinions.filter(item => item.choiceId === choice.choiceId);
          return (
            <div className="decisionChoiceCard" key={choice.choiceId}>
              <div className="decisionChoiceTitle">
                <span>{optionMark(index)}</span>
                <b>{items.length}명</b>
              </div>
              <p>{choice.choiceText}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
