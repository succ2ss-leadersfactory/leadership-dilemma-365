function countTruthy(items = []) {
  return items.filter(Boolean).length;
}

function joinAnswers(answers = {}) {
  return Object.values(answers)
    .map(value => String(value || '').trim())
    .filter(Boolean)
    .join(' ');
}

const domainEvidencePatterns = {
  sales: /(고객군|고객별|핵심 고객|기존 고객|관망|불안 고객|반응 구분|다음 접점|방문|연락|팔로우업|재방문|이탈|거래처|담당자)/,
  marketing: /(타깃|세그먼트|시장 반응|메시지|포지셔닝|검증 지표|캠페인|브랜드|고객 언어|반응률|조회|전환|테스트)/,
  rnd: /(기술 검증|검증 범위|기술 리스크|요구사항|재작업|기술부채|시연|프로토타입|MVP|테스트|완성도|개발 범위|스펙)/,
  operations: /(병목|납기|품질|현장 공백|현장 부담|예외 기준|처리 기준|공정|운영 흐름|SLA|자동화|원팀 공백|재작업|오류)/,
  hr: /(공정성|사실과 추측|안내 범위|직원 불안|루머|조직개편|소통 기준|변화 커뮤니케이션|심리적 안전|면담|이탈 신호|납득)/,
  finance: /(비용 구조|투자 최소선|실행 리스크|절감|예산|ROI|투자 효과|원가|손익|비용 통제|예외 기준|재무 기준|미래 실행력)/
};

function getDomainPattern(expertiseLens = null) {
  return domainEvidencePatterns[expertiseLens?.teamId] || null;
}

function getDomainSignal({ expertiseLens, hasDomainEvidence }) {
  const title = expertiseLens?.title || '팀 전문성';
  return hasDomainEvidence
    ? `${title}에 맞는 현업 증거 표현이 보입니다.`
    : `${title}에 맞는 현업 증거 표현을 더 남기면 좋습니다.`;
}

export function buildTeamOutputEvidenceReview({ answers = {}, expertiseLens = null }) {
  const answerText = joinAnswers(answers);
  const textLength = answerText.length;
  const domainPattern = getDomainPattern(expertiseLens);
  const hasNumericEvidence = /\d|%|건|명|곳|개|회|원|일|주|월|분기|전월|전주|비율|금액|횟수|기간/.test(answerText);
  const hasActionEvidence = /(다음|담당|책임|기한|언제|까지|확인|점검|보고|합의|조건|기준|계획|행동|일정|마감|공유|요청|후속|Follow-up|팔로우업)/.test(answerText);
  const hasRiskEvidence = /(리스크|위험|불안|부담|병목|공백|지연|반발|신뢰|품질|비용|손실|이탈|누락|오류|재작업|혼선|공정성|소진)/.test(answerText);
  const hasDomainEvidence = domainPattern ? domainPattern.test(answerText) : false;
  const rawEvidenceScore = countTruthy([
    textLength >= 80,
    hasNumericEvidence,
    hasActionEvidence,
    hasRiskEvidence,
    hasDomainEvidence
  ]);
  const evidenceScore = Math.min(rawEvidenceScore, 4);

  const evidenceLevel = evidenceScore >= 4 ? '강함' : evidenceScore >= 3 ? '충실' : evidenceScore >= 2 ? '기본' : '부족';
  const evidenceSignals = [
    textLength >= 80 ? '상황과 판단 근거가 충분히 서술되었습니다.' : '판단 근거가 아직 짧습니다.',
    hasNumericEvidence ? '수치·빈도·시점 같은 구체 증거가 보입니다.' : '수치·빈도·시점 같은 구체 증거가 더 필요합니다.',
    hasActionEvidence ? '다음 행동, 책임, 확인 기준이 일부 보입니다.' : '다음 행동, 책임, 확인 기준을 더 분명히 해야 합니다.',
    hasRiskEvidence ? '남는 부담이나 리스크 신호를 다루고 있습니다.' : '남는 부담이나 리스크 신호가 잘 드러나지 않습니다.',
    getDomainSignal({ expertiseLens, hasDomainEvidence })
  ];

  return {
    evidenceScore,
    evidenceLevel,
    evidenceSignals,
    hasDomainEvidence,
    expertiseTitle: expertiseLens?.title || '',
    expertiseKeywords: expertiseLens?.theoryKeywords || [],
    evidenceStandards: expertiseLens?.evidenceStandards || [],
    commonBlindSpots: expertiseLens?.commonBlindSpots || []
  };
}
