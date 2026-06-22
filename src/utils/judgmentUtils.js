import { clamp } from './clamp';
import { choiceTypeLabels } from './statusLabels';

export function getMaxRisk(values = {}) {
  const entries = Object.entries(values);
  if (!entries.length) return { maxRiskKey: 'executionPressure', maxRiskValue: 0, maxRiskLabel: '안정' };
  const [key, value] = entries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  return { maxRiskKey: key, maxRiskValue: Number(value), maxRiskLabel: ['안정', '신호', '주의', '위험'][Number(value)] || '안정' };
}

export function getJudgmentPattern(teamDecisions = [], choices = []) {
  const choiceMap = Object.fromEntries(choices.map(c => [c.choiceId, c]));
  const counts = { SPEED: 0, STRUCTURE: 0, BALANCE: 0, ALIGN: 0 };
  teamDecisions.forEach(d => {
    const type = choiceMap[d.finalChoiceId]?.internalType;
    if (type) counts[type] += 1;
  });
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'BALANCE';
  return { code: best, label: choiceTypeLabels[best] || '균형 조정형', counts };
}

export function calculateFinalLevel({ values = {}, week11Quality = 'medium', secretMissionScore = 0 }) {
  let score = 4;
  const nums = Object.values(values).map(Number);
  if (nums.some(v => v >= 3)) score -= 1;
  if (nums.filter(v => v >= 2).length >= 2) score -= 1;
  if (['high', 'veryHigh'].includes(week11Quality)) score += 1;
  if (secretMissionScore === 3) score += 1;
  score = clamp(score, 0, 4);
  const levels = ['전면 재설계 대상팀', '통합 검토팀', '조건부 유지팀', '유지팀', '전략 유지·확대팀'];
  return { baseScore: score, finalLevel: levels[score] };
}
