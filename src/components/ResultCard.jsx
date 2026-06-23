import { getTeamResultNarrative } from '../utils/teamResultNarrativeUtils';
import { stateLabels, riskLabels } from '../utils/statusLabels';
import '../styles/resultCardUx.css';

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
  return `${label}이 높아졌습니다. 다음 라운드에서 우선적으로 완화해야 합니다.`;
}

function buildEvidenceSummary(evidenceReview) {
  if (!evidenceReview) return null;
  const score = Number(evidenceReview.evidenceScore || 0);
  if (score >= 4) return '산출물에 판단 근거, 구체 증거, 다음 행동, 남는 리스크가 비교적 균형 있게 담겼습니다.';
  if (score >= 3) return '산출물의 기본 증거는 충실하지만, 한 가지 기준은 더 보완하면 좋습니다.';
  if (score >= 2) return '산출물의 방향은 보이지만, 증거와 다음 행동을 더 구체화해야 합니다.';
  return '산출물이 실행 메모에 가깝습니다. 판단 근거, 수치, 다음 행동, 리스크 신호를 더 남겨야 합니다.';
}

function buildDiscussionSummary(discussionReview) {
  if (!discussionReview) return null;
  if (discussionReview.quality === 'veryHigh') return '토의 요약에 선택 기준, 갈린 의견, 남는 부담, 다음 확인 행동이 균형 있게 남았습니다.';
  if (discussionReview.quality === 'high') return '토의의 핵심 흔적은 보입니다. 다음에는 확인 시점이나 담당자를 더 분명히 남겨 보세요.';
  if (discussionReview.quality === 'medium') return '선택 이유는 보이지만 갈린 의견, 남는 부담, 다음 행동 중 일부가 더 필요합니다.';
  return '토의 요약이 결론 중심에 머물렀습니다. 왜 선택했는지와 무엇을 감수할지 더 남겨야 합니다.';
}

function buildParticipantNextAction(highest) {
  const label = stateLabels[highest?.key] || '남은 부담';
  const level = riskLabels[highest?.value] || '안정';
  if (!highest || highest.value === 0) return `현재 가장 크게 남은 부담은 크지 않습니다. 다음 라운드에서는 지금의 판단 기준을 유지하면서 실행 조건을 더 분명히 남겨 보세요.`;
  if (highest.value === 1) return `${label}에 작은 신호가 있습니다. 다음 라운드에서는 이 부담이 커지기 전에 책임자와 확인 시점을 먼저 정해 보세요.`;
  if (highest.value === 2) return `${label}이 ${level} 수준입니다. 다음 라운드에서는 성과보다 먼저 이 부담을 줄일 행동을 하나 정해야 합니다.`;
  return `${label}이 ${level} 수준입니다. 다음 라운드에서는 새 일을 더하기보다 이 부담을 낮추는 선택을 우선 검토하세요.`;
}

function buildQuestions({ card, calculation, teamNarrative, isFacilitator }) {
  const choice = calculation?.choiceText || card?.choiceLabel || '이번 선택';
  const participantQuestions = [
    `우리 팀은 왜 ${choice} 방향을 선택했습니까?`,
    '이번 선택으로 얻은 작은 진전과 남은 부담은 무엇입니까?',
    '다음 라운드에서 이 부담을 줄이기 위해 무엇을 먼저 관리해야 합니까?'
  ];
  if (!isFacilitator) return participantQuestions;
  const evidenceReview = calculation?.outputEvidenceReview;
  const discussionReview = calculation?.discussionQualityReview;
  return [
    ...participantQuestions,
    teamNarrative?.question || '우리 팀의 기능 관점에서 이번 선택의 대가는 무엇입니까?',
    discussionReview ? `이번 토의 요약의 품질은 ${discussionReview.label} 무엇이 더 남았어야 합니까?` : '이번 토의 요약에서 선택 기준과 남는 부담은 충분히 드러났습니까?',
    evidenceReview ? `이번 산출물의 증거 수준은 ${evidenceReview.evidenceLevel}입니다. 무엇을 더 구체적으로 남겼어야 합니까?` : '이번 산출물에서 더 구체적으로 남겼어야 할 증거는 무엇입니까?',
    '이번 선택에서 팀 안의 인물 카드는 결과에 어떤 영향을 주었습니까?',
    '이번 선택은 팀원 역량에 어떤 성장 경험 또는 위축 신호를 남겼습니까?'
  ];
}

export default function ResultCard({ card, calculation, audience = 'participant' }) {
  if (!card) return null;

  const isFacilitator = audience === 'facilitator';
  const finalState = calculation?.finalState || {};
  const previousState = calculation?.previousState || {};
  const evidenceReview = calculation?.outputEvidenceReview;
  const evidenceSummary = buildEvidenceSummary(evidenceReview);
  const discussionReview = calculation?.discussionQualityReview;
  const discussionSummary = buildDiscussionSummary(discussionReview);
  const qualityBreakdown = calculation?.outputQualityBreakdown;
  const teamNarrative = calculation?.teamResultNarrative || getTeamResultNarrative({ teamId: calculation?.teamId, choiceType: calculation?.choiceInternalType, roundId: calculation?.roundId });
  const stateEntries = Object.keys(stateLabels).map(key => {
    const value = finalState[key] ?? 0;
    const before = previousState[key] ?? 0;
    return { key, value, diff: value - before };
  });
  const highest = stateEntries.reduce((max, item) => item.value > max.value ? item : max, stateEntries[0]);
  const questions = buildQuestions({ card, calculation, teamNarrative, isFacilitator });

  return (
    <section className={`card result-card ${isFacilitator ? 'result-card--facilitator' : 'result-card--participant'}`}>
      <div className="result-card__header">
        <p className="result-card__eyebrow">RESULT REVIEW</p>
        <h3>{card.resultTitle || '이번 선택이 남긴 결과'}</h3>
        <p className="resultLine">{card.oneLineResult}</p>
      </div>
      <div className="resultReadingGuide">
        <b>결과 읽는 법</b>
        <span>이 결과는 점수가 아니라 피드백입니다. 우리 팀이 얻은 것과 뒤로 미룬 부담을 함께 확인해 주세요.</span>
      </div>

      {!isFacilitator && (
        <div className="participantResultHero">
          <div>
            <small>이번 선택으로 얻은 것</small>
            <b>{card.smallProgress}</b>
          </div>
          <div>
            <small>아직 남은 부담</small>
            <b>{card.smallFriction}</b>
          </div>
          <div>
            <small>다음에 먼저 볼 신호</small>
            <b>{stateLabels[highest?.key] || '팀 상태 변화'} · {riskLabels[highest?.value] || '안정'}</b>
          </div>
        </div>
      )}

      {isFacilitator && (
        <div className="resultGrid">
          <div className="resultBox good"><h4>작은 진전</h4><p>{card.smallProgress}</p></div>
          <div className="resultBox friction"><h4>남은 부담</h4><p>{card.smallFriction}</p></div>
          <div className="resultBox review"><h4>조직개편 심사 관점</h4><p>{card.reorgReviewView}</p></div>
        </div>
      )}

      {teamNarrative && (
        <div className="sceneBox">
          <h4>{isFacilitator ? `팀별 결과 해석 · ${teamNarrative.title}` : '우리 팀 관점에서 보면'}</h4>
          <p><b>진전:</b> {teamNarrative.gain}</p>
          <p><b>남은 대가:</b> {teamNarrative.risk}</p>
          {isFacilitator && <div className="notice"><b>강사용 질문:</b> {teamNarrative.question}</div>}
        </div>
      )}

      {discussionReview && (
        <div className="sceneBox">
          <h4>{isFacilitator ? '토의 요약 품질' : '토의 기록 피드백'}</h4>
          {isFacilitator && <p><b>토의 요약:</b> {discussionReview.label} · {discussionReview.score}/{discussionReview.maxScore}</p>}
          <p>{discussionSummary}</p>
          {isFacilitator && discussionReview.feedbackLines?.length > 0 && <ul>{discussionReview.feedbackLines.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}</ul>}
        </div>
      )}

      {evidenceReview && (
        <div className="sceneBox">
          <h4>{isFacilitator ? '전문성 신호' : '산출물 피드백'}</h4>
          {isFacilitator && <p><b>산출물 증거 수준:</b> {evidenceReview.evidenceLevel} · {evidenceReview.evidenceScore}/4</p>}
          <p>{evidenceSummary}</p>
          {isFacilitator && evidenceReview.expertiseKeywords?.length > 0 && <p><b>관련 역량:</b> {evidenceReview.expertiseKeywords.join(' / ')}</p>}
          {isFacilitator && evidenceReview.evidenceStandards?.length > 0 && <div className="notice"><b>팀별 좋은 산출물 기준:</b> {evidenceReview.evidenceStandards.join(' · ')}</div>}
          {isFacilitator && evidenceReview.evidenceSignals?.length > 0 && <ul>{evidenceReview.evidenceSignals.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}</ul>}
        </div>
      )}

      {isFacilitator && qualityBreakdown && (
        <div className="sceneBox">
          <h4>품질 계산 v2 근거</h4>
          <p><b>품질 점수:</b> {calculation?.outputQualityScore}/100 · {calculation?.outputQuality}</p>
          <ul>{(qualityBreakdown.feedback || []).map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}</ul>
        </div>
      )}

      <div className="stateSummary">
        <h4>팀 상태 변화</h4>
        <p className="stateSummary__lead">가장 크게 남은 부담은 <b>{stateLabels[highest?.key]}</b>이며, 현재 수준은 <b>{riskLabels[highest?.value] || '안정'}</b>입니다.</p>
        <div className="stateList">
          {stateEntries.map(({ key, value, diff }) => (
            <div className="stateRow" key={key}>
              <div><b>{stateLabels[key]}</b><small>{describeState(key, value)}</small></div>
              <span className={`riskBadge ${getRiskClass(value)}`}>{riskLabels[value] || '안정'}{diff !== 0 ? ` ${diff > 0 ? '+' : ''}${diff}` : ''}</span>
            </div>
          ))}
        </div>
        {!isFacilitator && (
          <div className="participantNextAction">
            <h4>다음 라운드에서 관리할 부담</h4>
            <p>{buildParticipantNextAction(highest)}</p>
          </div>
        )}
      </div>

      {isFacilitator && calculation?.personaInfluenceLines?.length > 0 && <div className="sceneBox"><h4>인물 카드 영향</h4><ul>{calculation.personaInfluenceLines.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}</ul></div>}
      {isFacilitator && calculation?.competencyGrowthLines?.length > 0 && <div className="sceneBox"><h4>팀원 역량 변화</h4><ul>{calculation.competencyGrowthLines.map((line, index) => <li key={`${line}_${index}`}>{line}</li>)}</ul></div>}

      {isFacilitator && card.stateSceneText && Object.keys(card.stateSceneText).length > 0 && <div className="sceneBox"><h4>장면으로 보면</h4><ul>{Object.entries(card.stateSceneText).map(([key, text]) => <li key={key}>{text}</li>)}</ul></div>}

      <div className="debriefBox">
        <h4>{isFacilitator ? '디브리핑 질문' : '성찰 질문'}</h4>
        <ol>{questions.map(q => <li key={q}>{q}</li>)}</ol>
        {!isFacilitator && <p className="participantDebriefHint">질문에 정답은 없습니다. 우리 팀이 어떤 기준을 반복했는지, 그리고 다음 선택에서 무엇을 줄일지 이야기해 보세요.</p>}
      </div>
    </section>
  );
}
