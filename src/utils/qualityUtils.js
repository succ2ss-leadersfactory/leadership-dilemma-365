function getQuality(score) {
  if (score <= 39) return 'low';
  if (score <= 64) return 'medium';
  if (score <= 84) return 'high';
  return 'veryHigh';
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

export function calculateSubmissionQuality(outputRequirement, answers = {}, evidenceReview = null, discussionQualityReview = null) {
  const fields = outputRequirement?.fields || [];
  if (!fields.length) {
    return {
      quality: 'medium',
      qualityScore: 50,
      qualityBreakdown: {
        completionScore: 50,
        evidenceScore: 0,
        discussionScore: 0,
        modelVersion: 'quality-v2.0',
        feedback: ['이 라운드에는 산출물 입력 항목이 없어 기본 품질로 처리했습니다.']
      }
    };
  }

  const required = fields.filter(f => f.required);
  const total = Math.max(required.length, 1);
  const filled = required.filter(f => String(answers[f.fieldKey] || '').trim().length > 0).length;
  const completionScore = clampPercent((filled / total) * 100);
  const evidenceScore = clampPercent((Number(evidenceReview?.evidenceScore || 0) / 4) * 100);
  const discussionScore = clampPercent((Number(discussionQualityReview?.score || 0) / 5) * 100);
  const qualityScore = clampPercent((completionScore * 0.2) + (evidenceScore * 0.6) + (discussionScore * 0.2));
  const quality = getQuality(qualityScore);

  const feedback = [
    `입력 완성도 ${completionScore}/100`,
    `산출물 증거성 ${evidenceScore}/100`,
    `토의 요약 품질 ${discussionScore}/100`
  ];

  if (quality === 'low') feedback.push('칸을 채우는 것보다 선택 기준, 실행 조건, 남는 부담을 더 구체적으로 남겨야 합니다.');
  if (quality === 'medium') feedback.push('기본 방향은 보이지만 실행 조건과 증거 수준을 더 보완해야 합니다.');
  if (quality === 'high') feedback.push('판단 근거와 실행 조건이 비교적 잘 남아 있습니다.');
  if (quality === 'veryHigh') feedback.push('선택 기준, 실행 조건, 리스크 인식이 균형 있게 남아 있습니다.');

  return {
    quality,
    qualityScore,
    qualityBreakdown: {
      completionScore,
      evidenceScore,
      discussionScore,
      rawEvidenceScore: evidenceReview?.evidenceScore ?? null,
      rawDiscussionScore: discussionQualityReview?.score ?? null,
      weights: {
        completion: 0.2,
        outputEvidence: 0.6,
        discussionQuality: 0.2
      },
      modelVersion: 'quality-v2.0',
      feedback
    }
  };
}
