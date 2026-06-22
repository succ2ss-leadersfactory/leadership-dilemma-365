import { clamp } from './clamp';

function getTeamEvidenceScores(room = {}, teamId) {
  return Object.values(room.roundCalculations || {})
    .filter(calc => calc.teamId === teamId && calc.outputEvidenceReview)
    .map(calc => Number(calc.outputEvidenceReview?.evidenceScore || 0));
}

function reduceRisk(values, riskKey) {
  return {
    ...values,
    [riskKey]: clamp(Number(values?.[riskKey] || 0) - 1, 0, 3)
  };
}

function increaseRisk(values, riskKey) {
  return {
    ...values,
    [riskKey]: clamp(Number(values?.[riskKey] || 0) + 1, 0, 3)
  };
}

export function applyExpertiseFinalAdjustment({ room, teamId, values = {} }) {
  const scores = getTeamEvidenceScores(room, teamId);
  if (scores.length < 3) {
    return {
      reviewValues: values,
      adjustmentCode: 'NO_DATA',
      averageEvidenceScore: 0,
      evidenceCount: scores.length,
      adjustmentLines: ['전문성 증거 수준은 기록이 충분하지 않아 최종 판정에 별도 보정하지 않았습니다.']
    };
  }

  const averageEvidenceScore = Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1));

  if (averageEvidenceScore >= 3.5) {
    const targetRisk = Number(values.executiveTrustRisk || 0) > 0 ? 'executiveTrustRisk' : 'executionPressure';
    const reviewValues = reduceRisk(values, targetRisk);
    return {
      reviewValues,
      adjustmentCode: 'STRONG_EVIDENCE',
      averageEvidenceScore,
      evidenceCount: scores.length,
      adjustedRiskKey: targetRisk,
      adjustmentLines: [`산출물 평균 증거 수준이 강함(${averageEvidenceScore}/4)으로 확인되어 ${targetRisk === 'executiveTrustRisk' ? '상무신뢰위험' : '실행압박'}을 1단계 완화했습니다.`]
    };
  }

  if (averageEvidenceScore < 1.5) {
    if (Number(values.executiveTrustRisk || 0) >= 2) {
      return {
        reviewValues: values,
        adjustmentCode: 'LOW_EVIDENCE_CAPPED',
        averageEvidenceScore,
        evidenceCount: scores.length,
        adjustedRiskKey: 'executiveTrustRisk',
        adjustmentLines: [`산출물 평균 증거 수준이 부족(${averageEvidenceScore}/4)이지만, 상무신뢰위험이 이미 주의 수준 이상이라 추가 악화는 제한했습니다.`]
      };
    }
    return {
      reviewValues: increaseRisk(values, 'executiveTrustRisk'),
      adjustmentCode: 'LOW_EVIDENCE',
      averageEvidenceScore,
      evidenceCount: scores.length,
      adjustedRiskKey: 'executiveTrustRisk',
      adjustmentLines: [`산출물 평균 증거 수준이 부족(${averageEvidenceScore}/4)하여 상무신뢰위험을 1단계 높였습니다.`]
    };
  }

  return {
    reviewValues: values,
    adjustmentCode: 'NEUTRAL_EVIDENCE',
    averageEvidenceScore,
    evidenceCount: scores.length,
    adjustmentLines: [`산출물 평균 증거 수준은 ${averageEvidenceScore}/4로, 최종 판정에 별도 보정 없이 관찰 자료로 반영했습니다.`]
  };
}
