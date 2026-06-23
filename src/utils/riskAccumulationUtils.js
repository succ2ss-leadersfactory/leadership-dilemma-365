import { stateLabels } from './statusLabels';

const riskKeys = Object.keys(stateLabels);

export function createEmptyRiskMap() {
  return Object.fromEntries(riskKeys.map(key => [key, 0]));
}

export function normalizeRiskMap(values = {}) {
  const base = createEmptyRiskMap();
  riskKeys.forEach(key => {
    base[key] = Math.max(0, Number(values?.[key] || 0));
  });
  return base;
}

export function applyRawRiskEffects(values = {}, effects = {}) {
  const next = normalizeRiskMap(values);
  Object.entries(effects || {}).forEach(([key, amount]) => {
    if (!riskKeys.includes(key)) return;
    next[key] = Math.max(0, Number(next[key] || 0) + Number(amount || 0));
  });
  return next;
}

export function getOutputQualityRiskEffects(quality) {
  if (['high', 'veryHigh'].includes(quality)) return { executionPressure: -1 };
  if (quality === 'low') return { executiveTrustRisk: 1 };
  return {};
}

export function applyPersonaRiskEffects(values = {}, personaInfluences = []) {
  return (personaInfluences || []).reduce((next, item) => applyRawRiskEffects(next, item.effects || {}), normalizeRiskMap(values));
}

function sumRiskLoad(values = {}) {
  return riskKeys.reduce((sum, key) => sum + Number(values?.[key] || 0), 0);
}

function getMaxRawRisk(values = {}) {
  return riskKeys
    .map(key => ({ key, label: stateLabels[key] || key, value: Number(values?.[key] || 0) }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))[0] || { key: 'executionPressure', label: '실행압박', value: 0 };
}

function getDangerStreak(history = [], riskKey) {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (Number(history[i]?.values?.[riskKey] || 0) >= 3) streak += 1;
    else break;
  }
  return streak;
}

function getWarningStreak(history = [], riskKey) {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (Number(history[i]?.values?.[riskKey] || 0) >= 2) streak += 1;
    else break;
  }
  return streak;
}

function getTrend(history = [], riskKey) {
  const recent = history.slice(-3);
  if (recent.length < 2) return { code: 'stable', label: '관찰 시작', delta: 0 };
  const first = Number(recent[0]?.values?.[riskKey] || 0);
  const last = Number(recent[recent.length - 1]?.values?.[riskKey] || 0);
  const delta = Number((last - first).toFixed(1));
  if (delta >= 1) return { code: 'rising', label: '상승', delta };
  if (delta <= -1) return { code: 'falling', label: '완화', delta };
  return { code: 'stable', label: '유지', delta };
}

export function buildRiskTrendSnapshot({ previousRawValues = {}, rawValues = {}, previousHistory = [], roundId }) {
  const currentRawValues = normalizeRiskMap(rawValues);
  const previousValues = normalizeRiskMap(previousRawValues);
  const entry = {
    roundId,
    values: currentRawValues,
    riskLoad: Number(sumRiskLoad(currentRawValues).toFixed(1)),
    createdAt: Date.now()
  };
  const riskHistory = [...(previousHistory || []), entry].slice(-12);
  const maxRawRisk = getMaxRawRisk(currentRawValues);
  const trendByRisk = Object.fromEntries(riskKeys.map(key => {
    const trend = getTrend(riskHistory, key);
    const current = Number(currentRawValues[key] || 0);
    const previous = Number(previousValues[key] || 0);
    return [key, {
      riskKey: key,
      riskLabel: stateLabels[key] || key,
      currentRawValue: current,
      previousRawValue: previous,
      deltaFromPrevious: Number((current - previous).toFixed(1)),
      trendCode: trend.code,
      trendLabel: trend.label,
      trendDelta: trend.delta,
      dangerStreak: getDangerStreak(riskHistory, key),
      warningStreak: getWarningStreak(riskHistory, key)
    }];
  }));
  const maxRiskTrend = trendByRisk[maxRawRisk.key] || null;
  const risingRisks = Object.values(trendByRisk).filter(item => item.trendCode === 'rising');
  const fallingRisks = Object.values(trendByRisk).filter(item => item.trendCode === 'falling');
  const riskLoad = Number(sumRiskLoad(currentRawValues).toFixed(1));
  const previousRiskLoad = Number(sumRiskLoad(previousValues).toFixed(1));
  const riskLoadDelta = Number((riskLoad - previousRiskLoad).toFixed(1));

  const participantSummary = maxRawRisk.value >= 3
    ? `${maxRawRisk.label} 부담이 누적 기준으로도 높게 남아 있습니다. 다음 라운드에서는 이 부담을 낮추는 행동을 먼저 확인하세요.`
    : risingRisks.length > 0
      ? `${risingRisks[0].riskLabel} 부담이 최근 흐름에서 올라가고 있습니다. 아직 위험은 아니어도 조기 관리가 필요합니다.`
      : fallingRisks.length > 0
        ? `${fallingRisks[0].riskLabel} 부담이 완화되는 흐름이 보입니다. 이 회복 행동을 유지해 보세요.`
        : '누적 부담 흐름은 크게 흔들리지 않았습니다. 다음 선택에서도 기준과 확인 시점을 남겨 주세요.';

  return {
    modelVersion: 'risk-trend-v1.0',
    rawValues: currentRawValues,
    previousRawValues: previousValues,
    riskHistory,
    riskLoad,
    previousRiskLoad,
    riskLoadDelta,
    maxRawRiskKey: maxRawRisk.key,
    maxRawRiskLabel: maxRawRisk.label,
    maxRawRiskValue: maxRawRisk.value,
    maxRiskTrend,
    trendByRisk,
    risingRiskCount: risingRisks.length,
    fallingRiskCount: fallingRisks.length,
    participantSummary,
    facilitatorLines: [
      `누적 리스크 총량: ${previousRiskLoad}→${riskLoad}(${riskLoadDelta > 0 ? '+' : ''}${riskLoadDelta})`,
      `최대 누적 부담: ${maxRawRisk.label} ${maxRawRisk.value}`,
      maxRiskTrend ? `${maxRawRisk.label} 최근 흐름: ${maxRiskTrend.trendLabel}, 위험 지속 ${maxRiskTrend.dangerStreak}회` : null
    ].filter(Boolean)
  };
}
