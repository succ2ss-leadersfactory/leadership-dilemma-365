import { clamp } from './clamp';
import { choiceTypeLabels } from './statusLabels';

const gateLevels = {
  OUT: { score: 0, finalLevel: '조직개편 탈락 후보팀', survivalCode: 'OUT', survivalLabel: '조직개편 탈락', survivalScore: 0 },
  REDESIGN: { score: 1, finalLevel: '전면 재편 대상팀', survivalCode: 'REDESIGN', survivalLabel: '전면 재편 대상', survivalScore: 1 },
  CONDITIONAL: { score: 2, finalLevel: '조건부 유지팀', survivalCode: 'CONDITIONAL', survivalLabel: '조건부 생존', survivalScore: 2 },
  SURVIVE: { score: 3, finalLevel: '조직개편 생존팀', survivalCode: 'SURVIVE', survivalLabel: '조직개편 생존', survivalScore: 3 },
  EXPAND: { score: 4, finalLevel: '전략 유지·확대팀', survivalCode: 'SURVIVE', survivalLabel: '조직개편 생존', survivalScore: 3 }
};

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

function buildGateCheck({ code, label, passed, reason }) {
  return { code, label, passed, reason };
}

export function calculateFinalGate({ values = {}, week11Quality = 'medium', secretMissionScore = 0, riskTrendSummary = null }) {
  const { dangerCount, warningCount, riskLoad } = getRiskStats(values);
  const strongWeek11 = ['high', 'veryHigh'].includes(week11Quality);
  const weakWeek11 = ['low', 'medium'].includes(week11Quality);
  const rawRiskLoad = Number(riskTrendSummary?.riskLoad || 0);
  const maxRawRiskValue = Number(riskTrendSummary?.maxRawRiskValue || 0);
  const maxDangerStreak = Math.max(...Object.values(riskTrendSummary?.trendByRisk || {}).map(item => Number(item?.dangerStreak || 0)), 0);
  const risingRiskCount = Number(riskTrendSummary?.risingRiskCount || 0);
  const missionAchieved = Number(secretMissionScore || 0) >= 3;
  const missionPartial = Number(secretMissionScore || 0) >= 2;
  const missionMissed = Number(secretMissionScore || 0) <= 1;

  const checks = [
    buildGateCheck({
      code: 'critical-risk',
      label: '치명 리스크',
      passed: dangerCount < 2,
      reason: dangerCount >= 2 ? `위험 수준 리스크가 ${dangerCount}개입니다.` : `위험 수준 리스크는 ${dangerCount}개입니다.`
    }),
    buildGateCheck({
      code: 'cumulative-risk',
      label: '누적 부담',
      passed: !(maxRawRiskValue >= 5 || rawRiskLoad >= 12 || maxDangerStreak >= 3),
      reason: maxRawRiskValue >= 5 || rawRiskLoad >= 12 || maxDangerStreak >= 3
        ? `누적 리스크 총량 ${rawRiskLoad}, 최대 누적 부담 ${maxRawRiskValue}, 위험 지속 ${maxDangerStreak}회입니다.`
        : `누적 리스크 총량 ${rawRiskLoad}, 최대 누적 부담 ${maxRawRiskValue}입니다.`
    }),
    buildGateCheck({
      code: 'mission-core',
      label: '미션 기준',
      passed: missionPartial,
      reason: missionPartial ? `팀별 미션 기준 ${secretMissionScore}/3개를 충족했습니다.` : `팀별 미션 기준 ${secretMissionScore}/3개에 그쳤습니다.`
    }),
    buildGateCheck({
      code: 'recovery-proof',
      label: '회복 가능성',
      passed: strongWeek11 || risingRiskCount === 0,
      reason: strongWeek11 ? `Week 11 산출물 품질이 ${week11Quality}입니다.` : `최근 상승 리스크 ${risingRiskCount}개, Week 11 품질 ${week11Quality}입니다.`
    })
  ];

  let gateCode = 'CONDITIONAL';
  let gateReason = '주의 리스크와 회복 가능성을 함께 보아 조건부 유지가 적절합니다.';

  if ((dangerCount >= 2 && missionMissed && weakWeek11) || (dangerCount >= 2 && maxDangerStreak >= 2 && weakWeek11) || (rawRiskLoad >= 13 && missionMissed)) {
    gateCode = 'OUT';
    gateReason = '치명 리스크, 누적 부담, 미션 미달이 함께 나타나 조직개편 탈락 후보로 판정했습니다.';
  } else if (dangerCount >= 2 || (dangerCount >= 1 && warningCount >= 3) || maxRawRiskValue >= 5 || rawRiskLoad >= 12) {
    gateCode = 'REDESIGN';
    gateReason = strongWeek11
      ? '위험 부담은 크지만 마지막 산출물이 회복 가능성을 보여 전면 재편 대상으로 완화했습니다.'
      : '위험 부담과 누적 리스크가 커서 현 구조 그대로 유지하기 어렵습니다.';
  } else if (dangerCount >= 1 || warningCount >= 2 || !missionPartial || risingRiskCount >= 2) {
    gateCode = 'CONDITIONAL';
    gateReason = '생존은 가능하지만 일부 리스크와 미션 기준 보완이 필요합니다.';
  } else if (missionAchieved && strongWeek11 && warningCount <= 1 && rawRiskLoad <= 6 && maxDangerStreak === 0 && risingRiskCount === 0) {
    gateCode = 'EXPAND';
    gateReason = '위험 리스크가 낮고 미션·산출물·누적 흐름이 모두 안정적이어서 전략 유지·확대가 가능합니다.';
  } else {
    gateCode = 'SURVIVE';
    gateReason = '주요 위험을 관리했고 조직개편 생존 기준을 통과했습니다.';
  }

  const level = gateLevels[gateCode] || gateLevels.CONDITIONAL;
  return {
    gateModelVersion: 'final-gate-v1.0',
    gateCode,
    gateLabel: level.finalLevel,
    gateReason,
    gateScore: level.score,
    finalLevel: level.finalLevel,
    baseScore: level.score,
    survivalCode: level.survivalCode,
    survivalLabel: level.survivalLabel,
    survivalScore: level.survivalScore,
    gateChecks: checks,
    gateEvidenceLines: [
      `최종 게이트: ${level.finalLevel}`,
      gateReason,
      ...checks.map(check => `${check.passed ? '통과' : '주의'} · ${check.label}: ${check.reason}`)
    ],
    gateStats: {
      dangerCount,
      warningCount,
      riskLoad,
      rawRiskLoad,
      maxRawRiskValue,
      maxDangerStreak,
      risingRiskCount,
      week11Quality,
      secretMissionScore
    }
  };
}

export function calculateFinalLevel({ values = {}, week11Quality = 'medium', secretMissionScore = 0, riskTrendSummary = null }) {
  if (riskTrendSummary) return calculateFinalGate({ values, week11Quality, secretMissionScore, riskTrendSummary });
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

export function calculateSurvivalOutcome({ values = {}, week11Quality = 'medium', secretMissionScore = 0, riskTrendSummary = null }) {
  if (riskTrendSummary) {
    const gate = calculateFinalGate({ values, week11Quality, secretMissionScore, riskTrendSummary });
    return { survivalCode: gate.survivalCode, survivalLabel: gate.survivalLabel, survivalScore: gate.survivalScore };
  }
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
