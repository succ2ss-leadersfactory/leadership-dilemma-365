const scenarioLabels = {
  success: '미션 성공형',
  ace: '에이스 과부하형',
  rumor: '루머 대응형',
  pressure: '재편 위험형'
};

const positiveSurvival = ['조직개편 생존', '조건부 생존'];
const positiveMission = ['미션 달성', '미션 부분 달성'];
const maintainLevels = ['유지팀', '전략 유지·확대팀', '조건부 유지팀'];
const redesignLevels = ['전면 재설계 대상팀', '통합 검토팀'];

function getScenarioKey(room = {}) {
  const playerIds = Object.keys(room.players || {});
  return Object.keys(scenarioLabels).find(key => playerIds.some(id => id.includes(`_${key}_`))) || 'unknown';
}

function getFinals(room = {}) {
  return Object.values(room.teams || {}).map(team => ({ team, final: room.finalResults?.[team.teamId] })).filter(item => item.final);
}

function countBy(items, predicate) {
  return items.filter(predicate).length;
}

function makeCheck(label, passed, detail, action) {
  return { label, passed, status: passed ? '정상' : '점검 필요', detail, action };
}

function evaluateSuccess(finals) {
  return [
    makeCheck('생존 판정', finals.every(item => positiveSurvival.includes(item.final.survivalLabel)), '모든 팀이 생존 또는 조건부 생존이어야 합니다.', '탈락/전면 재편 팀이 있으면 성공형 선택·산출물 품질을 확인합니다.'),
    makeCheck('미션 판정', finals.every(item => positiveMission.includes(item.final.missionLabel)), '모든 팀이 미션 달성 또는 부분 달성이어야 합니다.', '비밀 미션 기준과 산출물 품질을 확인합니다.'),
    makeCheck('종합 판정', finals.filter(item => maintainLevels.includes(item.final.finalLevel)).length >= Math.ceil(finals.length * 0.8), '대부분의 팀이 조건부 유지 이상이어야 합니다.', '리스크가 과도하면 선택지 효과나 산출물 품질을 조정합니다.')
  ];
}

function evaluateAce(finals) {
  const burdenTeams = finals.filter(item => ['에이스소진위험', '실행압박'].includes(item.final.remainingBurden));
  return [
    makeCheck('부담 신호', burdenTeams.length >= 1, '에이스소진위험 또는 실행압박이 남아야 합니다.', '부담 신호가 없으면 SPEED 선택과 인물 카드 영향을 확인합니다.'),
    makeCheck('전면 실패 방지', countBy(finals, item => item.final.survivalLabel === '조직개편 탈락') === 0, '과부하형은 실패보다 부담이 남은 조건부 흐름이어야 합니다.', '탈락이 많으면 인물 카드 부작용과 최종 판정 기준을 완화합니다.'),
    makeCheck('조건부 구간', countBy(finals, item => ['조건부 생존', '전면 재편 대상'].includes(item.final.survivalLabel)) >= 1, '최소 1개 팀은 조건부 또는 재편 검토 신호가 나와야 합니다.', '모두 생존이면 과부하 리스크가 충분히 드러나는지 확인합니다.')
  ];
}

function evaluateRumor(finals) {
  return [
    makeCheck('불안 신호', countBy(finals, item => ['성장위축위험', '상무신뢰위험', '협업부채'].includes(item.final.remainingBurden)) >= 1, '루머 대응형은 불안·신뢰·협업 부담 중 하나가 남아야 합니다.', '신호가 없으면 Week 10 품질과 선택 유형을 확인합니다.'),
    makeCheck('부분 회복', countBy(finals, item => positiveSurvival.includes(item.final.survivalLabel)) >= Math.ceil(finals.length * 0.5), '루머 대응형은 완전 실패가 아니라 대응 여지가 보여야 합니다.', '생존 팀이 너무 적으면 Week 10 결과와 밸런싱 기준을 확인합니다.'),
    makeCheck('미션 차이', new Set(finals.map(item => item.final.missionLabel)).size >= 1, '미션 판정이 생성되어 있어야 합니다.', '미션 판정이 없으면 최종 판정 생성을 다시 실행합니다.')
  ];
}

function evaluatePressure(finals) {
  return [
    makeCheck('재편 신호', countBy(finals, item => redesignLevels.includes(item.final.finalLevel) || ['전면 재편 대상', '조직개편 탈락'].includes(item.final.survivalLabel)) >= 1, '재편 위험형은 최소 1개 팀에서 재편 신호가 나와야 합니다.', '모두 유지 이상이면 SPEED 반복과 낮은 품질 효과가 충분한지 확인합니다.'),
    makeCheck('완전 몰락 방지', countBy(finals, item => item.final.survivalLabel === '조직개편 탈락') < finals.length, '모든 팀이 탈락하면 파일럿 디브리핑 폭이 좁아집니다.', '모두 탈락이면 최종 판정 기준을 완화합니다.'),
    makeCheck('리스크 누적', finals.some(item => Number(item.final.reviewMaxRiskValue || 0) >= 2), '주의 이상 리스크가 보여야 합니다.', '리스크가 낮으면 낮은 품질 산출물 효과를 확인합니다.')
  ];
}

function evaluateByScenario(key, finals) {
  if (!finals.length) return [makeCheck('최종 판정', false, '최종 판정 결과가 없습니다.', '리허설 샘플을 생성하거나 최종 판정 생성을 실행합니다.')];
  if (key === 'success') return evaluateSuccess(finals);
  if (key === 'ace') return evaluateAce(finals);
  if (key === 'rumor') return evaluateRumor(finals);
  if (key === 'pressure') return evaluatePressure(finals);
  return [makeCheck('시나리오 감지', false, '현재 방에서 리허설 샘플 유형을 감지하지 못했습니다.', 'Admin 화면에서 리허설 샘플을 다시 생성합니다.')];
}

export function buildRehearsalBalanceCheck(room = {}) {
  const scenarioKey = getScenarioKey(room);
  const finals = getFinals(room);
  const checks = evaluateByScenario(scenarioKey, finals);
  const passedCount = countBy(checks, check => check.passed);
  return {
    scenarioKey,
    scenarioLabel: scenarioLabels[scenarioKey] || '감지 안 됨',
    teamCount: Object.keys(room.teams || {}).length,
    finalCount: finals.length,
    passedCount,
    totalChecks: checks.length,
    status: checks.length && passedCount === checks.length ? '정상' : '점검 필요',
    checks,
    summary: `${scenarioLabels[scenarioKey] || '리허설 샘플'} · ${passedCount}/${checks.length}개 기준 충족`
  };
}
