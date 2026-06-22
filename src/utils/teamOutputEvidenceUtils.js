function countTruthy(items = []) {
  return items.filter(Boolean).length;
}

function joinAnswers(answers = {}) {
  return Object.values(answers)
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(' ');
}

export function buildTeamOutputEvidenceReview({ answers = {}, expertiseLens = null }) {
  const answerText = joinAnswers(answers);
  const textLength = answerText.length;
  const hasNumericEvidence = /\d|%|건|명|곳|개|회|원|일|주|월|분기/.test(answerText);
  const hasActionEvidence = /(다음|담당|책임|기한|언제|까지|확인|점검|보고|합의|조건|기준|계획|행동)/.test(answerText);
  const hasRiskEvidence = /(리스크|위험|불안|부담|병목|공백|지연|반발|신뢰|품질|비용|손실)/.test(answerText);
  const evidenceScore = countTruthy([
    textLength >= 80,
    hasNumericEvidence,
    hasActionEvidence,
    hasRiskEvidence
  ]);

  const evidenceLevel = evidenceScore >= 4 ? '강함' : evidenceScore >= 3 ? '충실' : evidenceScore >= 2 ? '기본' : '부족';
  const evidenceSignals = [
    textLength >= 80 ? '상황과 판단 근거가 충분히 서술되었습니다.' : '판단 근거가 아직 짧습니다.',
    hasNumericEvidence ? '수치·빈도·시점 같은 구체 증거가 보입니다.' : '수치·빈도·시점 같은 구체 증거가 더 필요합니다.',
    hasActionEvidence ? '다음 행동, 책임, 확인 기준이 일부 보입니다.' : '다음 행동, 책임, 확인 기준을 더 분명히 해야 합니다.',
    hasRiskEvidence ? '남는 부담이나 리스크 신호를 다루고 있습니다.' : '남는 부담이나 리스크 신호가 잘 드러나지 않습니다.'
  ];

  return {
    evidenceScore,
    evidenceLevel,
    evidenceSignals,
    expertiseTitle: expertiseLens?.title || '',
    expertiseKeywords: expertiseLens?.theoryKeywords || [],
    evidenceStandards: expertiseLens?.evidenceStandards || [],
    commonBlindSpots: expertiseLens?.commonBlindSpots || []
  };
}
