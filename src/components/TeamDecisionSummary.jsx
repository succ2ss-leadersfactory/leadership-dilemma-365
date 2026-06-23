import '../styles/teamDecisionSummary.css';

function optionMark(index) {
  return String.fromCharCode(65 + index);
}

function voteRatio(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export default function TeamDecisionSummary({ choices = [], opinions = [] }) {
  if (!choices.length) return null;
  const total = opinions.length;
  const maxVotes = choices.reduce((max, choice) => {
    const count = opinions.filter(item => item.choiceId === choice.choiceId).length;
    return Math.max(max, count);
  }, 0);

  return (
    <div className="teamDecisionSummary">
      <div className="teamDecisionSummaryHeader">
        <div>
          <p className="teamDecisionSummaryEyebrow">TEAM DISCUSSION STARTER</p>
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
          const percent = voteRatio(items.length, total);
          const isTop = total > 0 && items.length === maxVotes;
          return (
            <div className={`decisionChoiceCard ${isTop ? 'top' : ''}`} key={choice.choiceId}>
              <div className="decisionChoiceTitle">
                <span>{optionMark(index)}</span>
                <b>{items.length}명</b>
              </div>
              <p>{choice.choiceText}</p>
              <div className="decisionVoteBar" aria-label={`${percent}% 선택`}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className="decisionVoteMeta">
                <span>{percent}%</span>
                {isTop && <em>가장 많이 고른 방향</em>}
              </div>
              {items.length > 0 ? (
                <ul>
                  {items.slice(0, 3).map((item, itemIndex) => (
                    <li key={`${choice.choiceId}_${itemIndex}`}>{item.reason || '선택 이유 미작성'}</li>
                  ))}
                </ul>
              ) : (
                <small>아직 이 방향을 고른 개인 판단은 없습니다.</small>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
