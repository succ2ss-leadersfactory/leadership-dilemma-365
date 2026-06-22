const stateLabels = {
  aceBurnoutRisk: '에이스 소진 위험',
  growthShrinkRisk: '성장 위축 위험',
  executionPressure: '실행 압박',
  executiveTrustRisk: '상무 신뢰 위험',
  collaborationDebt: '협업 부채'
};

const riskLabels = ['안정', '신호', '주의', '위험'];

function getRiskClass(value = 0) {
  if (value >= 3) return 'danger';
  if (value >= 2) return 'warning';
  if (value >= 1) return 'info';
  return 'success';
}

function describeState(key, value = 0) {
  const label = stateLabels[key] || key;
  if (value === 0) return `${label}은 현재 안정적으로 관리되고 있습니다.`;
  if (value === 1) return `${label}에 작은 신호가 생겼습니다. 다음 선택에서 관리가 필요합니다.`;
  if (value === 2) return `${label}이 주의 수준입니다. 팀 운영 방식의 조정이 필요합니다.`;
  return `${label}이 위험 수준입니다. 다음 라운드에서 우선적으로 완화해야 합니다.`;
}

function buildDebriefQuestions(card, calculation) {
  const choice = calculation?.choiceText || card?.choiceLabel || '이번 선택';
  return [
    `우리 팀은 왜 ${choice} 방향을 선택했습니까?`,
    '이 선택은 어떤 작은 진전을 만들었고, 어떤 부담을 남겼습니까?',
    '다음 라운드에서 이 부담을 줄이기 위해 무엇을 먼저 관리해야 합니까?'
  ];
}

export default function ResultCard({ card, calculation }) {
  if (!card) return null;

  const finalState = calculation?.finalState || {};
  const previousState = calculation?.previousState || {};
  const stateEntries = Object.keys(stateLabels).map(key => {
    const value = finalState[key] ?? 0;
    const before = previousState[key] ?? 0;
    const diff = value - before;
    return { key, value, before, diff };
  });
  const highest = stateEntries.reduce((max, item) => item.value > max.value ? item : max, stateEntries[0]);
  const questions = buildDebriefQuestions(card, calculation);

  return (
    <section className="card result-card">
      <p className="eyebrow">결과 카드</p>
      <h3>{card.resultTitle || '이번 선택이 남긴 결과'}</h3>
      <p className="resultLine">{card.oneLineResult}</p>

      <div className="resultGrid">
        <div className="resultBox good">
          <h4>작은 진전</h4>
          <p>{card.smallProgress}</p>
        </div>
        <div className="resultBox friction">
          <h4>남은 부담</h4>
          <p>{card.smallFriction}</p>
        </div>
        <div className="resultBox review">
          <h4>조직개편 심사 관점</h4>
          <p>{card.reorgReviewView}</p>
        </div>
      </div>

      <div className="stateSummary">
        <h4>팀 상태 변화</h4>
        <p className="muted">
          가장 크게 남은 부담은 <b>{stateLabels[highest?.key]}</b>이며, 현재 수준은 <b>{riskLabels[highest?.value] || '안정'}</b>입니다.
        </p>
        <div className="stateList">
          {stateEntries.map(({ key, value, diff }) => (
            <div className="stateRow" key={key}>
              <div>
                <b>{stateLabels[key]}</b>
                <small>{describeState(key, value)}</small>
              </div>
              <span className={`riskBadge ${getRiskClass(value)}`}>
                {riskLabels[value] || '안정'}{diff !== 0 ? ` ${diff > 0 ? '+' : ''}${diff}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {card.stateSceneText && Object.keys(card.stateSceneText).length > 0 && (
        <div className="sceneBox">
          <h4>장면으로 보면</h4>
          <ul>
            {Object.entries(card.stateSceneText).map(([key, text]) => (
              <li key={key}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="debriefBox">
        <h4>디브리핑 질문</h4>
        <ol>
          {questions.map(q => <li key={q}>{q}</li>)}
        </ol>
      </div>
    </section>
  );
}
