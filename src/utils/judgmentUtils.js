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

function getRiskStats(values = {}) {
  const nums = Object.values(values).map(Number);
  const max = nums.length ? Math.max(...nums) : 0;
  const dangerCount = nums.filter(v => v >= 3).length;
  const warningCount = nums.filter(v => v >= 2).length;
  const riskLoad = nums.reduce((sum, value) => sum + value, 0);
  return { nums, max, dangerCount, warningCount, riskLoad };
}

export function calculateFinalLevel({ values = {}, week11Quality = 'medium', secretMissionScore = 0 }) {
  let score = 4;
  const { dangerCount, warningCount, riskLoad } = getRiskStats(values);
  if (dangerCount >= 2) score -= 2;
  else if (dangerCount === 1) score -= 1;
  if (warningCount >= 3) score -= 1;
  if (riskLoad >= 10) score -= 1;
  if (['high', 'veryHigh'].includes(week11Quality)) score += 1;
  if (secretMissionScore === 3) score += 1;
  if (secretMissionScore === 0 && warningCount >= 3) score -= 1;
  score = clamp(score, 0, 4);
  const levels = ['전면 재설계 대상팀', '통합 검토팀', '조건부 유지팀', '유지팀', '전략 유지·확대팀'];
  return { baseScore: score, finalLevel: levels[score] };
}

export function calculateSurvivalOutcome({ values = {}, week11Quality = 'medium' }) {
  const { dangerCount, warningCount, riskLoad } = getRiskStats(values);
  const strong = ['high', 'veryHigh'].includes(week11Quality);
  if (dangerCount >= 2 && warningCount >= 3 && riskLoad >= 11 && !strong) return { survivalCode: 'OUT', survivalLabel: '조직개편 탈락', survivalScore: 0 };
  if (dangerCount >= 2 && warningCount >= 3) return { survivalCode: 'REDESIGN', survivalLabel: '전면 재편 대상', survivalScore: 1 };
  if (dangerCount >= 1 && warningCount >= 2 && !strong) return { survivalCode: 'REDESIGN', survivalLabel: '전면 재편 대상', survivalScore: 1 };
  if (dangerCount >= 1 || warningCount >= 2 || (warningCount === 1 && !strong)) return { survivalCode: 'CONDITIONAL', survivalLabel: '조건부 생존', survivalScore: 2 };
  return { survivalCode: 'SURVIVE', survivalLabel: '조직개편 생존', survivalScore: 3 };
}

export function calculateMissionOutcome(secretMissionScore = 0) {
  if (secretMissionScore >= 3) return { missionCode: 'ACHIEVED', missionLabel: '미션 달성' };
  if (secretMissionScore === 2) return { missionCode: 'PARTIAL', missionLabel: '미션 부분 달성' };
  return { missionCode: 'MISSED', missionLabel: '미션 미달성' };
}
