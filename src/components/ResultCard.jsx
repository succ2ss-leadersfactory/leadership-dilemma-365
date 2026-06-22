import { getTeamResultNarrative } from '../utils/teamResultNarrativeUtils';

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

function buildDebriefQuestions(card, calculation, teamNarrative) {
  const choice = calculation?.choiceText || card?.choiceLabel || '이번 선택';
  const evidenceReview = calculation?.outputEvidenceReview;
  const evidenceQuestion = evidenceReview
    ? `이번 산출물의 증거 수준은 ${evidenceReview.evidenceLevel}입니다. 무엇을 더 구체적으로 남겼어야 합니까?`
    : '이번 산출물에서 더 구체적으로 남겼어야 할 증거는 무엇입니까?';
  return [
    `우리 팀은 왜 ${choice} 방향을 선택했습니까?`,
    '이 선택은 어떤 작은 진전을 만들었고, 어떤 부담을 남겼습니까?',
    teamNarrative?.question || '우리 팀의 기능 관점에서 이번 선택의 대가는 무엇입니까?',
    evidenceQuestion,
    '이번 선택에서 팀 안의 인물 카드는 결과에 어떤 영향을 주었습니까?',
    '이번 선택은 팀원 역량에 어떤 성장 경험 또는 위축 신호를 남겼습니까?',
    '다음 라운드에서 이 부담을 줄이기 위해 무엇을 먼저 관리해야 합니까?'
  ];
}

function buildEvidenceSummary(evidenceReview) {
  if (!evidenceReview) return null;
  const score = Number(evidenceReview.evidenceScore || 0);
  if (score >= 4) return '산출물에 판단 근거, 구체 증거, 다음 행동, 남는 리스크가 비교적 균형 있게 담겼습니다.';
  if (score >= 3) return '산출물의 기본 증거는 충실하지만, 한 가지 기준은 더 보완하면 좋습니다.';
  if (score >= 2) return '산출물의 방향은 보이지만, 증거와 다음 행동을 더 구체화해야 합니다.';
  return '산출물이 실행 메모에 가깝습니다. 판단 근거, 수치, 다음 행동, 리스크 신호를 더 남겨야 합니다.';
}

export default function ResultCard({ card, calculation }) {
  if (!card) return null;

  const finalState = calculation?.finalState || {};
  const previousState = calculation?.previousState || {};
  const personaLines = calculation?.personaInfluenceLines || [];
  const growthLines = calculation?.competencyGrowthLines || [];
  const evidenceReview = calculation?.outputEvidenceReview;
  const evidenceSummary = buildEvidenceSummary(evidenceReview);
  const teamNarrative = getTeamResultNarrative({ teamId: calculation?.teamId, choiceType: calculation?.choiceInternalType });
  const stateEntries = Object.keys(stateLabels).map(key => {
    const value = finalState[key] ?? 0;
    const before = previousState[key] ?? 0;
    const diff = value - before;
    return { key, value, before, diff };
  });
  const highest = stateEntries.reduce((max, item) => item.value > max.value ? item : max, stateEntries[0]);
  const questions = buildDebriefQuestions(card, calculation, teamNarrative);

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

      {teamNarrative && (
        <div className="sceneBox">
          <h4>팀별 결과 해석 · {teamNarrative.title}</h4>
          <p><b>진전:</b> {teamNarrative.gain}</p>
          <p><b>남은 대가:</b> {teamNarrative.risk}</p>
          <div className="notice"><b>강사용 질문:</b> {teamNarrative.question}</div>
        </div>
      )}

      {evidenceReview && (
        <div className="sceneBox">
          <h4>전문성 신호</h4>
          <p><b>산출물 증거 수준:</b> {evidenceReview.evidenceLevel} · {evidenceReview.evidenceScore}/4</p>
          <p>{evidenceSummary}</p>
          {evidenceReview.expertiseKeywords?.length > 0 && (
            <p><b>관련 역량:</b> {evidenceReview.expertiseKeywords.join(' / ')}</p>
          )}
          {evidenceReview.evidenceStandards?.length > 0 && (
            <div className="notice"><b>팀별 좋은 산출물 기준:</b> {evidenceReview.evidenceStandards.join(' · ')}</div>
          )}
          <ul>
            {(evidenceReview.evidenceSignals || []).map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}
          </ul>
        </div>
      )}

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

      {personaLines.length > 0 && (
        <div className="sceneBox">
          <h4>인물 카드 영향</h4>
          <ul>
            {personaLines.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}
          </ul>
        </div>
      )}

      {growthLines.length > 0 && (
        <div className="sceneBox">
          <h4>팀원 역량 변화</h4>
          <ul>
            {growthLines.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}
          </ul>
        </div>
      )}

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
