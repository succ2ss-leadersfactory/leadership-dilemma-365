import { stateLabels } from './statusLabels';

export const emptyRiskValues = {
  aceBurnoutRisk: 0,
  growthShrinkRisk: 0,
  executionPressure: 0,
  executiveTrustRisk: 0,
  collaborationDebt: 0
};

const riskLevelLabels = ['안정', '신호', '주의', '위험'];

function clampDisplayRisk(value = 0) {
  return Math.max(0, Math.min(3, Number(value || 0)));
}

function pickMaxRisk(values = {}) {
  const entries = Object.entries({ ...emptyRiskValues, ...(values || {}) });
  const [key, rawValue] = entries.sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))[0] || ['executionPressure', 0];
  const value = clampDisplayRisk(rawValue);
  return {
    key,
    value,
    label: riskLevelLabels[value] || '안정',
    name: stateLabels[key] || key
  };
}

export function getSafeStateRecord(room, teamId) {
  const record = room?.stateValues?.[teamId] || null;
  const values = { ...emptyRiskValues, ...(record?.values || {}) };
  const max = pickMaxRisk(values);
  return {
    teamId,
    values,
    rawValues: { ...emptyRiskValues, ...(record?.rawValues || record?.values || {}) },
    riskHistory: record?.riskHistory || [],
    riskTrendSummary: record?.riskTrendSummary || null,
    rawRiskLoad: record?.rawRiskLoad ?? record?.riskTrendSummary?.riskLoad ?? 0,
    maxRiskKey: record?.maxRiskKey || max.key,
    maxRiskValue: record?.maxRiskValue ?? max.value,
    maxRiskLabel: record?.maxRiskLabel || max.label,
    maxRawRiskKey: record?.maxRawRiskKey || record?.riskTrendSummary?.maxRawRiskKey || max.key,
    maxRawRiskLabel: record?.maxRawRiskLabel || record?.riskTrendSummary?.maxRawRiskLabel || max.name,
    maxRawRiskValue: record?.maxRawRiskValue ?? record?.riskTrendSummary?.maxRawRiskValue ?? max.value,
    isFallback: !record || !record.values
  };
}

export function formatStateValueList(record = {}) {
  const values = { ...emptyRiskValues, ...(record.values || {}) };
  return Object.values(values).map(value => Number(value || 0)).join(' / ');
}

export function buildRuntimeSafetyWarnings(room) {
  const teams = Object.values(room?.teams || {});
  const missingStateTeams = teams.filter(team => !room?.stateValues?.[team.teamId]);
  const staleCalculations = Object.values(room?.roundCalculations || {}).filter(calc => !calc.calculationModelVersion || !calc.riskTrendSnapshot || !calc.roundImpactSummary);
  const staleFinalResults = Object.values(room?.finalResults || {}).filter(result => !result.gateModelVersion || !result.gateChecks?.length || !result.declarationQualityReview);
  const missingDeclarations = teams.filter(team => room?.finalResults?.[team.teamId] && !room?.declarations?.[team.teamId]?.teamDeclaration && !room?.finalResults?.[team.teamId]?.declarationText);
  const warnings = [];

  if (missingStateTeams.length) {
    warnings.push({
      key: 'missing-state',
      level: '주의',
      title: '팀 상태값 일부가 없습니다',
      message: `${missingStateTeams.map(team => team.teamName).join(', ')} 팀은 기본 상태값으로 임시 표시됩니다.`,
      action: '관리자 운영 도구에서 “전체 재계산 + 최종 판정 재생성”을 실행하면 최신 구조로 복구됩니다.'
    });
  }

  if (staleCalculations.length) {
    warnings.push({
      key: 'stale-calculation',
      level: '주의',
      title: '이전 계산 모델 결과가 섞여 있습니다',
      message: `최신 영향도 TOP 3 또는 누적 리스크가 없는 계산 결과 ${staleCalculations.length}건이 있습니다.`,
      action: '관리자 운영 도구에서 계산 모델 v2 데이터 보정 후 전체 재계산을 실행하세요.'
    });
  }

  if (staleFinalResults.length) {
    warnings.push({
      key: 'stale-final',
      level: '주의',
      title: '최종 판정 데이터가 최신 구조가 아닙니다',
      message: `최종 게이트 또는 선언문 피드백이 없는 최종 결과 ${staleFinalResults.length}건이 있습니다.`,
      action: 'Week 12 최종 판정을 다시 생성하거나 관리자 운영 도구에서 재생성하세요.'
    });
  }

  if (missingDeclarations.length) {
    warnings.push({
      key: 'missing-declaration',
      level: '안내',
      title: '최종 판정 전 팀 선언문 확인 필요',
      message: `${missingDeclarations.map(team => team.teamName).join(', ')} 팀은 팀 선언문 없이 최종 판정이 생성되었습니다.`,
      action: '파일럿 운영에서는 팀 선언문 저장 후 최종 판정을 생성하는 흐름을 권장합니다.'
    });
  }

  return warnings;
}
