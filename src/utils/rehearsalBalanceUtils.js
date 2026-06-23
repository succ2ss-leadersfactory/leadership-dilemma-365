const scenarioConfigs = {
  success: {
    label: '미션 성공형',
    intent: '기준과 협업을 통해 대체로 생존·미션 달성 흐름이 나오는 정상 운영 샘플입니다.',
    expectedRange: '조직개편 생존팀 또는 전략 유지·확대팀 중심',
    allowedFinalLevels: ['조직개편 생존팀', '전략 유지·확대팀', '조건부 유지팀'],
    warningFinalLevels: ['전면 재편 대상팀', '조직개편 탈락 후보팀']
  },
  ace: {
    label: '에이스 과부하형',
    intent: '성과는 내지만 에이스소진위험·실행압박이 남는 조건부 생존 샘플입니다.',
    expectedRange: '조건부 유지팀 또는 조직개편 생존팀 중심, 일부 부담 신호 필요',
    allowedFinalLevels: ['조건부 유지팀', '조직개편 생존팀', '전면 재편 대상팀'],
    warningFinalLevels: ['전략 유지·확대팀', '조직개편 탈락 후보팀']
  },
  rumor: {
    label: '루머 대응형',
    intent: '불안·신뢰·협업 부담이 남지만 완전 실패보다는 대응 여지가 보이는 샘플입니다.',
    expectedRange: '조건부 유지팀 중심, 일부 조직개편 생존 또는 전면 재편 가능',
    allowedFinalLevels: ['조건부 유지팀', '조직개편 생존팀', '전면 재편 대상팀'],
    warningFinalLevels: ['전략 유지·확대팀', '조직개편 탈락 후보팀']
  },
  pressure: {
    label: '재편 위험형',
    intent: '속도 선택과 낮은 품질이 반복되어 전면 재편 또는 탈락 후보 신호가 나오는 스트레스 샘플입니다.',
    expectedRange: '전면 재편 대상팀 또는 조직개편 탈락 후보팀 최소 1개 이상',
    allowedFinalLevels: ['전면 재편 대상팀', '조직개편 탈락 후보팀', '조건부 유지팀'],
    warningFinalLevels: ['전략 유지·확대팀', '조직개편 생존팀']
  }
};

const scenarioLabels = Object.fromEntries(Object.entries(scenarioConfigs).map(([key, config]) => [key, config.label]));

const positiveSurvival = ['조직개편 생존', '조건부 생존'];
const positiveMission = ['미션 달성', '미션 부분 달성'];
const maintainLevels = ['조직개편 생존팀', '전략 유지·확대팀', '조건부 유지팀', '유지팀'];
const redesignLevels = ['전면 재편 대상팀', '조직개편 탈락 후보팀', '전면 재설계 대상팀', '통합 검토팀'];
const burdenKeys = ['에이스소진위험', '실행압박', '상무신뢰위험', '협업부채', '성장위축위험'];

function getScenarioKey(room = {}) {
  const playerIds = Object.keys(room.players || {});
  return Object.keys(scenarioLabels).find(key => playerIds.some(id => id.includes(`_${key}_`))) || 'unknown';
}

function getFinals(room = {}) {
  return Object.values(room.teams || {}).map(team => ({ team, final: room.finalResults?.[team.teamId], state: room.stateValues?.[team.teamId] })).filter(item => item.final);
}

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function makeCheck(label, passed, detail, action) {
  return { label, passed, status: passed ? '정상' : '점검 필요', detail, action };
}

function distribution(items = [], keyGetter) {
  return items.reduce((acc, item) => {
    const key = keyGetter(item) || '미생성';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatDistribution(dist = {}) {
  const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries.map(([key, count]) => `${key} ${count}`).join(' / ') : '결과 없음';
}

function getTeamOutcomeRows(finals = []) {
  return finals.map(({ team, final, state }) => {
    const maxRawRiskLabel = final?.maxRawRiskLabel || state?.maxRawRiskLabel || final?.riskTrendSummary?.maxRawRiskLabel || '-';
    const maxRawRiskValue = final?.maxRawRiskValue ?? state?.maxRawRiskValue ?? final?.riskTrendSummary?.maxRawRiskValue ?? 0;
    const rawRiskLoad = final?.rawRiskLoad ?? state?.rawRiskLoad ?? final?.riskTrendSummary?.riskLoad ?? 0;
    return {
      teamId: team.teamId,
      teamName: team.teamName,
      finalLevel: final?.gateLabel || final?.finalLevel || '미생성',
      survivalLabel: final?.survivalLabel || '미생성',
      missionLabel: final?.missionLabel || '미생성',
      missionScore: final?.secretMissionScore ?? '-',
      remainingBurden: final?.remainingBurden || '-',
      maxRawRiskLabel,
      maxRawRiskValue: Number(maxRawRiskValue || 0),
      rawRiskLoad: Number(rawRiskLoad || 0),
      weekLogImpactCount: final?.weekLogImpactCount || 0,
      gateIssueCount: (final?.gateChecks || []).filter(check => !check.passed).length
    };
  });
}

function evaluateCommonShape(finals, config) {
  const finalLevels = finals.map(item => item.final.gateLabel || item.final.finalLevel);
  const finalDist = distribution(finals, item => item.final.gateLabel || item.final.finalLevel);
  const survivalDist = distribution(finals, item => item.final.survivalLabel);
  const missionDist = distribution(finals, item => item.final.missionLabel);
  const allSameFinal = new Set(finalLevels).size === 1 && finalLevels.length > 1;
  const allowedCount = countBy(finals, item => config.allowedFinalLevels.includes(item.final.gateLabel || item.final.finalLevel));
  const warningCount = countBy(finals, item => config.warningFinalLevels.includes(item.final.gateLabel || item.final.finalLevel));

  return [
    makeCheck(
      '시나리오 기대 범위',
      allowedCount >= Math.ceil(finals.length * 0.6) && warningCount <= Math.floor(finals.length * 0.4),
      `기대 범위: ${config.expectedRange}. 현재 분포: ${formatDistribution(finalDist)}`,
      '의도와 다른 판정이 많으면 시나리오별 선택 패턴, 산출물 품질, 최종 게이트 기준 순서로 점검합니다.'
    ),
    makeCheck(
      '판정 분포 폭',
      !allSameFinal,
      `최종 게이트 분포: ${formatDistribution(finalDist)} / 생존 분포: ${formatDistribution(survivalDist)} / 미션 분포: ${formatDistribution(missionDist)}`,
      '모든 팀이 같은 판정이면 리허설 디브리핑 폭이 좁습니다. 팀별 미션·산출물 증거·리스크 민감도를 확인합니다.'
    )
  ];
}

function evaluateSuccess(finals, config) {
  return [
    ...evaluateCommonShape(finals, config),
    makeCheck('생존 판정', finals.every(item => positiveSurvival.includes(item.final.survivalLabel)), '모든 팀이 생존 또는 조건부 생존이어야 합니다.', '탈락/전면 재편 팀이 있으면 성공형 선택·산출물 품질을 확인합니다.'),
    makeCheck('미션 판정', finals.every(item => positiveMission.includes(item.final.missionLabel)), '모든 팀이 미션 달성 또는 부분 달성이어야 합니다.', '비밀 미션 기준과 산출물 품질을 확인합니다.'),
    makeCheck('종합 판정', finals.filter(item => maintainLevels.includes(item.final.gateLabel || item.final.finalLevel)).length >= Math.ceil(finals.length * 0.8), '대부분의 팀이 조건부 유지 이상이어야 합니다.', '리스크가 과도하면 선택지 효과나 산출물 품질을 조정합니다.'),
    makeCheck('누적 리스크 안정성', finals.every(item => Number(item.final.rawRiskLoad || 0) <= 8), '성공형은 누적 리스크 총량이 과도하지 않아야 합니다.', '누적 리스크가 높으면 산출물 회복 효과와 선택 패턴을 확인합니다.')
  ];
}

function evaluateAce(finals, config) {
  const burdenTeams = finals.filter(item => ['에이스소진위험', '실행압박'].includes(item.final.remainingBurden) || ['에이스소진위험', '실행압박'].includes(item.final.maxRawRiskLabel));
  return [
    ...evaluateCommonShape(finals, config),
    makeCheck('부담 신호', burdenTeams.length >= 1, '에이스소진위험 또는 실행압박이 남아야 합니다.', '부담 신호가 없으면 SPEED 선택과 인물 카드 영향을 확인합니다.'),
    makeCheck('전면 실패 방지', countBy(finals, item => item.final.survivalLabel === '조직개편 탈락') === 0, '과부하형은 실패보다 부담이 남은 조건부 흐름이어야 합니다.', '탈락이 많으면 인물 카드 부작용과 최종 판정 기준을 완화합니다.'),
    makeCheck('조건부 구간', countBy(finals, item => ['조건부 생존', '전면 재편 대상'].includes(item.final.survivalLabel)) >= 1, '최소 1개 팀은 조건부 또는 재편 검토 신호가 나와야 합니다.', '모두 생존이면 과부하 리스크가 충분히 드러나는지 확인합니다.'),
    makeCheck('누적 부담 존재', finals.some(item => Number(item.final.rawRiskLoad || 0) >= 6), '과부하형은 누적 부담이 어느 정도 쌓여야 합니다.', '누적 부담이 낮으면 에이스 인물 카드 영향과 SPEED 반복을 확인합니다.')
  ];
}

function evaluateRumor(finals, config) {
  return [
    ...evaluateCommonShape(finals, config),
    makeCheck('불안 신호', countBy(finals, item => ['성장위축위험', '상무신뢰위험', '협업부채'].includes(item.final.remainingBurden) || ['성장위축위험', '상무신뢰위험', '협업부채'].includes(item.final.maxRawRiskLabel)) >= 1, '루머 대응형은 불안·신뢰·협업 부담 중 하나가 남아야 합니다.', '신호가 없으면 Week 10 품질과 선택 유형을 확인합니다.'),
    makeCheck('부분 회복', countBy(finals, item => positiveSurvival.includes(item.final.survivalLabel)) >= Math.ceil(finals.length * 0.5), '루머 대응형은 완전 실패가 아니라 대응 여지가 보여야 합니다.', '생존 팀이 너무 적으면 Week 10 결과와 밸런싱 기준을 확인합니다.'),
    makeCheck('미션 차이', new Set(finals.map(item => item.final.missionLabel)).size >= 1, '미션 판정이 생성되어 있어야 합니다.', '미션 판정이 없으면 최종 판정 생성을 다시 실행합니다.'),
    makeCheck('리스크 다양성', new Set(finals.map(item => item.final.remainingBurden).filter(key => burdenKeys.includes(key))).size >= 1, '루머형은 신뢰·협업·성장 위축 중 최소 하나가 드러나야 합니다.', '모든 부담이 실행압박으로만 몰리면 루머 대응 선택 패턴을 조정합니다.')
  ];
}

function evaluatePressure(finals, config) {
  return [
    ...evaluateCommonShape(finals, config),
    makeCheck('재편 신호', countBy(finals, item => redesignLevels.includes(item.final.gateLabel || item.final.finalLevel) || ['전면 재편 대상', '조직개편 탈락'].includes(item.final.survivalLabel)) >= 1, '재편 위험형은 최소 1개 팀에서 재편 신호가 나와야 합니다.', '모두 유지 이상이면 SPEED 반복과 낮은 품질 효과가 충분한지 확인합니다.'),
    makeCheck('완전 몰락 방지', countBy(finals, item => item.final.survivalLabel === '조직개편 탈락') < finals.length, '모든 팀이 탈락하면 파일럿 디브리핑 폭이 좁아집니다.', '모두 탈락이면 최종 판정 기준을 완화합니다.'),
    makeCheck('리스크 누적', finals.some(item => Number(item.final.reviewMaxRiskValue || 0) >= 2 || Number(item.final.rawRiskLoad || 0) >= 8), '주의 이상 리스크 또는 누적 리스크가 보여야 합니다.', '리스크가 낮으면 낮은 품질 산출물 효과를 확인합니다.'),
    makeCheck('미션 미달 신호', finals.some(item => ['미션 미달성'].includes(item.final.missionLabel)), '재편 위험형은 최소 일부 팀에서 미션 미달성이 보여야 합니다.', '모두 미션 달성이면 비밀 미션 기준과 산출물 품질을 확인합니다.')
  ];
}

function evaluateByScenario(key, finals) {
  const config = scenarioConfigs[key];
  if (!finals.length) return [makeCheck('최종 판정', false, '최종 판정 결과가 없습니다.', '리허설 샘플을 생성하거나 최종 판정 생성을 실행합니다.')];
  if (!config) return [makeCheck('시나리오 감지', false, '현재 방에서 리허설 샘플 유형을 감지하지 못했습니다.', 'Admin 화면에서 리허설 샘플을 다시 생성합니다.')];
  if (key === 'success') return evaluateSuccess(finals, config);
  if (key === 'ace') return evaluateAce(finals, config);
  if (key === 'rumor') return evaluateRumor(finals, config);
  if (key === 'pressure') return evaluatePressure(finals, config);
  return [makeCheck('시나리오 감지', false, '현재 방에서 리허설 샘플 유형을 감지하지 못했습니다.', 'Admin 화면에서 리허설 샘플을 다시 생성합니다.')];
}

export function buildRehearsalBalanceCheck(room = {}) {
  const scenarioKey = getScenarioKey(room);
  const config = scenarioConfigs[scenarioKey] || null;
  const finals = getFinals(room);
  const checks = evaluateByScenario(scenarioKey, finals);
  const passedCount = countBy(checks, check => check.passed);
  const outcomeRows = getTeamOutcomeRows(finals);
  const finalDistribution = distribution(finals, item => item.final.gateLabel || item.final.finalLevel);
  const survivalDistribution = distribution(finals, item => item.final.survivalLabel);
  const missionDistribution = distribution(finals, item => item.final.missionLabel);
  const maxRawRiskLoad = outcomeRows.length ? Math.max(...outcomeRows.map(row => row.rawRiskLoad)) : 0;
  const minRawRiskLoad = outcomeRows.length ? Math.min(...outcomeRows.map(row => row.rawRiskLoad)) : 0;
  return {
    scenarioKey,
    scenarioLabel: scenarioLabels[scenarioKey] || '감지 안 됨',
    scenarioIntent: config?.intent || '리허설 샘플 유형이 감지되지 않았습니다.',
    expectedRange: config?.expectedRange || 'Admin 화면에서 리허설 샘플을 생성해야 합니다.',
    teamCount: Object.keys(room.teams || {}).length,
    finalCount: finals.length,
    passedCount,
    totalChecks: checks.length,
    status: checks.length && passedCount === checks.length ? '정상' : '점검 필요',
    checks,
    outcomeRows,
    finalDistribution,
    survivalDistribution,
    missionDistribution,
    finalDistributionText: formatDistribution(finalDistribution),
    survivalDistributionText: formatDistribution(survivalDistribution),
    missionDistributionText: formatDistribution(missionDistribution),
    maxRawRiskLoad,
    minRawRiskLoad,
    summary: `${scenarioLabels[scenarioKey] || '리허설 샘플'} · ${passedCount}/${checks.length}개 기준 충족`
  };
}
