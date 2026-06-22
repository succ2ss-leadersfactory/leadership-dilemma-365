export function calculateSubmissionQuality(outputRequirement, answers = {}) {
  const fields = outputRequirement?.fields || [];
  if (!fields.length) return { quality: 'medium', qualityScore: 50 };
  const required = fields.filter(f => f.required);
  const total = Math.max(required.length, 1);
  const filled = required.filter(f => String(answers[f.fieldKey] || '').trim().length > 0).length;
  const score = Math.round((filled / total) * 100);
  if (score <= 40) return { quality: 'low', qualityScore: score };
  if (score <= 70) return { quality: 'medium', qualityScore: score };
  if (score <= 90) return { quality: 'high', qualityScore: score };
  return { quality: 'veryHigh', qualityScore: score };
}
