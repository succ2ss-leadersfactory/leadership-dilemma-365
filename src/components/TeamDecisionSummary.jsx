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
  const hasSavedOpinions = total > 0;
  const maxVotes = choices.reduce((max, choice) => {
    const count = opinions.filter(item => item.choiceId === choice.choiceId).length;
    return Math.max(max, count);
  }, 0);

  return (
    <div className="teamDecisionSummary">
      <div className="teamDecisionSummaryHeader">
        <div>
          <p className="teamDecisionSummaryEyebrow">TEAM DISCUSSION STARTER</p>
          <h3>개인 생각 나누기</h3>
          <p>앱에 저장된 개인 판단이 있으면 참고하고, 없으면 각자 1분 동안 생각한 선택 방향을 말로 공유한 뒤 토의를 시작합니다.</p>
        </div>
        <div className="decisionMeta">
          <b>{total}</b>
          <span>앱에 저장된 개인 판단</span>
        </div>
      </div>

      {!hasSavedOpinions && <div className="decisionEmptyBox">기본 운영에서는 개인별 앱 저장이 없어도 됩니다. 각자 생각한 선택 방향을 말로 나눈 뒤 바로 팀 토의를 시작하세요.</div>}

      <div className="decisionChoiceGrid">
        {choices.map((choice, index) => {
          const items = opinions.filter(item => item.choiceId === choice.choiceId);
          const percent = voteRatio(items.length, total);
          const isTop = hasSavedOpinions && items.length === maxVotes;
          return (
            <div className={`decisionChoiceCard ${isTop ? 'top' : ''}`} key={choice.choiceId}>
              <div className="decisionChoiceTitle">
                <span>{optionMark(index)}</span>
                <b>{hasSavedOpinions ? `${items.length}명` : '토의'}</b>
              </div>
              <p>{choice.choiceText}</p>
              <div className="decisionVoteBar" aria-label={hasSavedOpinions ? `${percent}% 선택` : '저장된 개인 판단 없음'}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className="decisionVoteMeta">
                <span>{hasSavedOpinions ? `${percent}%` : '팀 논의'}</span>
                {isTop && <em>가장 많이 고른 방향</em>}
              </div>
              {items.length > 0 ? (
                <ul>
                  {items.slice(0, 3).map((item, itemIndex) => (
                    <li key={`${choice.choiceId}_${itemIndex}`}>{item.reason || '선택 이유 미작성'}</li>
                  ))}
                </ul>
              ) : (
                <small>{hasSavedOpinions ? '아직 이 방향을 고른 개인 판단은 없습니다.' : '이 방향을 선택한다면 얻는 것과 부담을 함께 말해 보세요.'}</small>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
