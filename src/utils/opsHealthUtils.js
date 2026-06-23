import { buildTeamExpertiseReportSummary } from './reportExpertiseUtils';

const playableRounds = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'week9', 'week10', 'week11'];

function isKsaComplete(team) {
  const ksa = team?.selectedKSA || {};
  return ['knowledge', 'skill', 'attitude'].every(key => (ksa[key] || []).length === 3);
}

function getTeamPlayers(room, teamId) {
  return Object.values(room.players || {}).filter(player => player.teamId === teamId);
}

function makeIssue({ severity = '주의', teamName = '전체', area, message, action }) {
  return { severity, teamName, area, message, action };
}

function getStatus(ok, warning = false) {
  if (ok) return '정상';
  if (warning) return '주의';
  return '확인 필요';
}

function hasQualityV2(submission) {
  return Boolean(submission?.qualityBreakdown?.modelVersion === 'quality-v2.0');
}

function hasDiscussionReview(decision) {
  return Boolean(decision?.discussionQualityReview?.score != null);
}

function hasImpactLog(calc) {
  return Boolean(calc?.roundImpactSummary?.modelVersion);
}

function hasCumulativeRisk(calc) {
  return Boolean(calc?.riskTrendSnapshot?.modelVersion && calc?.rawRiskValues);
}

function hasFinalGate(final) {
  return Boolean(final?.gateModelVersion && final?.gateChecks?.length);
}

function hasReflectionReview(reflection) {
  return Boolean(reflection?.reflectionQualityReview?.score != null);
}

function hasDeclarationReview(declaration) {
  return Boolean(declaration?.declarationQualityReview?.score != null);
}

export function buildOpsHealth(room, gameContent = {}) {
  const teams = Object.values(room.teams || {});
  const players = Object.values(room.players || {});
  const issues = [];

  const teamRows = teams.map(team => {
    const teamPlayers = getTeamPlayers(room, team.teamId);
    const profiles = room.competencyProfiles?.[team.teamId] || {};
    const profileList = Object.values(profiles).filter(Boolean);
    const completeKsa = isKsaComplete(team);
    const missingProfiles = teamPlayers.filter(player => !profiles[player.playerId]);
    const missingPersona = profileList.filter(profile => !profile.personaId);
    const decisions = playableRounds.map(roundId => room.teamDecisions?.[`${roundId}_${team.teamId}`]).filter(Boolean);
    const submissions = playableRounds.map(roundId => room.submissions?.[`${roundId}_${team.teamId}`]).filter(Boolean);
    const calculations = playableRounds.map(roundId => room.roundCalculations?.[`${roundId}_${team.teamId}`]).filter(Boolean);
    const decisionCount = decisions.length;
    const submissionCount = submissions.length;
    const evidenceReviewCount = submissions.filter(submission => submission?.evidenceReview).length;
    const qualityV2Count = submissions.filter(hasQualityV2).length;
    const discussionReviewCount = decisions.filter(hasDiscussionReview).length;
    const calculationCount = calculations.length;
    const resultNarrativeCount = calculations.filter(calc => calc?.teamResultNarrative).length;
    const impactLogCount = calculations.filter(hasImpactLog).length;
    const cumulativeRiskCount = calculations.filter(hasCumulativeRisk).length;
    const personaInfluenceCount = calculations.reduce((sum, calc) => sum + (calc?.personaInfluenceLines?.length || 0), 0);
    const expertiseLensReady = Boolean(gameContent.teamExpertiseLenses?.[team.teamId]);
    const expertiseSummary = buildTeamExpertiseReportSummary({ room, gameContent, team });
    const warningSignalCount = expertiseSummary.warningSignals?.length || 0;
    const final = room.finalResults?.[team.teamId];
    const finalReady = Boolean(final);
    const finalGateReady = hasFinalGate(final);
    const riskTrendReady = Boolean(room.stateValues?.[team.teamId]?.riskTrendSummary || final?.riskTrendSummary);
    const declaration = room.declarations?.[team.teamId];
    const reflectionList = Object.values(declaration?.individualReflections || {});
    const reflectionCount = reflectionList.length;
    const reflectionReviewCount = reflectionList.filter(hasReflectionReview).length;
    const declarationReviewReady = hasDeclarationReview(declaration) || hasDeclarationReview(final);

    if (!completeKsa) issues.push(makeIssue({ teamName: team.teamName, area: 'KSA', message: 'Round 0 KSA가 지식·기술·태도 각 3개로 완성되지 않았습니다.', action: '팀 화면에서 KSA 9개를 저장하세요.' }));
    if (!expertiseLensReady) issues.push(makeIssue({ severity: '확인 필요', teamName: team.teamName, area: '전문성 렌즈', message: '팀별 전문지식 렌즈가 없습니다.', action: 'seedTeamExpertiseLenses와 gameContent 병합을 확인하세요.' }));
    if (teamPlayers.length === 0) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '참가자', message: '팀에 참가자가 없습니다.', action: '대면 기본 운영이면 정상일 수 있습니다. 개인 성찰까지 테스트하려면 참가자 입장 또는 샘플 데이터 생성을 확인하세요.' }));
    if (teamPlayers.length > 0 && missingProfiles.length > 0) issues.push(makeIssue({ teamName: team.teamName, area: '역량 프로필', message: `${missingProfiles.length}명의 역량 프로필이 없습니다.`, action: 'KSA 저장 후 참가자를 다시 입장시키거나 샘플 데이터를 재생성하세요.' }));
    if (missingPersona.length > 0) issues.push(makeIssue({ teamName: team.teamName, area: '인물 카드', message: `${missingPersona.length}명의 인물 카드가 없습니다.`, action: '역량 프로필 재생성을 확인하세요.' }));
    if (decisionCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '팀 결정', message: `팀 결정 ${decisionCount}/${playableRounds.length}건`, action: '미진행 라운드의 팀 최종 선택을 저장하세요.' }));
    if (decisionCount > 0 && discussionReviewCount < decisionCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '토의 품질 v2', message: `토의 품질 리뷰 ${discussionReviewCount}/${decisionCount}건`, action: '운영 안정화 패널에서 계산 모델 v2 데이터 보정을 실행하세요.' }));
    if (submissionCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '산출물', message: `산출물 ${submissionCount}/${playableRounds.length}건`, action: '미진행 라운드의 산출물을 저장하세요.' }));
    if (submissionCount > 0 && evidenceReviewCount < submissionCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '산출물 증거 수준', message: `증거 수준 리뷰 ${evidenceReviewCount}/${submissionCount}건`, action: '산출물을 다시 저장하거나 운영 안정화 패널에서 계산 모델 v2 데이터 보정을 실행하세요.' }));
    if (submissionCount > 0 && qualityV2Count < submissionCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '산출물 품질 v2', message: `품질 v2 계산 ${qualityV2Count}/${submissionCount}건`, action: '운영 안정화 패널에서 계산 모델 v2 데이터 보정을 실행하세요.' }));
    if (calculationCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '결과 계산', message: `계산 결과 ${calculationCount}/${playableRounds.length}건`, action: 'Host 화면 또는 운영 안정화 패널에서 결과 계산을 실행하세요.' }));
    if (calculationCount > 0 && resultNarrativeCount < calculationCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '팀별 결과 해석', message: `결과 해석 ${resultNarrativeCount}/${calculationCount}건`, action: '결과 계산을 다시 실행해 teamResultNarrative 생성을 확인하세요.' }));
    if (calculationCount > 0 && impactLogCount < calculationCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '영향도 TOP 3', message: `영향도 로그 ${impactLogCount}/${calculationCount}건`, action: '결과 계산을 다시 실행해 roundImpactSummary 생성을 확인하세요.' }));
    if (calculationCount > 0 && cumulativeRiskCount < calculationCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '누적 리스크', message: `누적 리스크 기록 ${cumulativeRiskCount}/${calculationCount}건`, action: '결과 계산을 다시 실행해 riskTrendSnapshot 생성을 확인하세요.' }));
    if (!finalReady) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '최종 판정', message: '최종 판정이 아직 생성되지 않았습니다.', action: 'Week 12에서 최종 판정 생성을 실행하세요.' }));
    if (finalReady && !finalGateReady) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '최종 게이트 v1', message: '최종 판정은 있으나 게이트 모델 데이터가 없습니다.', action: '운영 안정화 패널에서 최종 판정 재생성을 실행하세요.' }));
    if (finalReady && !riskTrendReady) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '최종 누적 리스크', message: '최종 판정에 누적 리스크 흐름이 연결되지 않았습니다.', action: '전체 라운드 재계산 후 최종 판정을 다시 생성하세요.' }));
    if (declaration?.teamDeclaration && !declarationReviewReady) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '팀 선언문 품질', message: '팀 선언문은 있으나 품질 피드백이 없습니다.', action: '운영 안정화 패널에서 계산 모델 v2 데이터 보정을 실행하세요.' }));
    if (teamPlayers.length > 0 && reflectionCount < teamPlayers.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '개인 성찰', message: `개인 성찰 ${reflectionCount}/${teamPlayers.length}건`, action: '참가자 개인 화면에서 성찰을 저장하게 하세요.' }));
    if (reflectionCount > 0 && reflectionReviewCount < reflectionCount) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '개인 성찰 품질', message: `개인 성찰 품질 리뷰 ${reflectionReviewCount}/${reflectionCount}건`, action: '운영 안정화 패널에서 계산 모델 v2 데이터 보정을 실행하세요.' }));

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      ksaStatus: getStatus(completeKsa),
      expertiseLensStatus: getStatus(expertiseLensReady),
      playerCount: teamPlayers.length,
      profileCount: profileList.length,
      personaCount: profileList.filter(profile => profile.personaId).length,
      decisionCount,
      discussionReviewCount,
      submissionCount,
      evidenceReviewCount,
      qualityV2Count,
      calculationCount,
      resultNarrativeCount,
      impactLogCount,
      cumulativeRiskCount,
      warningSignalCount,
      personaInfluenceCount,
      finalStatus: finalReady ? '생성' : '미생성',
      finalGateStatus: finalGateReady ? '생성' : '미생성',
      riskTrendStatus: riskTrendReady ? '생성' : '미생성',
      declarationReviewStatus: declarationReviewReady ? '생성' : '미생성',
      reflectionCount,
      reflectionReviewCount,
      status: completeKsa && expertiseLensReady && (teamPlayers.length === 0 || teamPlayers.length === profileList.length) && calculationCount === playableRounds.length && evidenceReviewCount === submissionCount && qualityV2Count === submissionCount && discussionReviewCount === decisionCount && resultNarrativeCount === calculationCount && impactLogCount === calculationCount && cumulativeRiskCount === calculationCount && finalReady && finalGateReady ? '정상' : '확인 필요'
    };
  });

  const contentChecks = [
    { label: '전략 이벤트', ok: Object.keys(gameContent.strategicEvents || {}).length >= playableRounds.length, note: `${Object.keys(gameContent.strategicEvents || {}).length}건` },
    { label: '중간 사건 로그', ok: (gameContent.weekLogs || []).length >= 6, note: `${(gameContent.weekLogs || []).length}건` },
    { label: '후폭풍 규칙', ok: Object.keys(gameContent.weekLogImpacts || {}).length >= 6, note: `${Object.keys(gameContent.weekLogImpacts || {}).length}건` },
    { label: '비밀 미션', ok: Object.keys(gameContent.secretMissions || {}).length >= teams.length, note: `${Object.keys(gameContent.secretMissions || {}).length}건` },
    { label: 'KSA 옵션', ok: Object.keys(gameContent.ksaOptions || {}).length >= teams.length, note: `${Object.keys(gameContent.ksaOptions || {}).length}개 팀` },
    { label: '팀별 전문성 렌즈', ok: Object.keys(gameContent.teamExpertiseLenses || {}).length >= teams.length, note: `${Object.keys(gameContent.teamExpertiseLenses || {}).length}개 팀` },
    { label: '팀별 상황 렌즈', ok: Object.keys(gameContent.teamSituationVariants || {}).length >= playableRounds.length, note: `${Object.keys(gameContent.teamSituationVariants || {}).length}개 라운드` }
  ];

  contentChecks.filter(check => !check.ok).forEach(check => issues.push(makeIssue({ severity: '확인 필요', area: '콘텐츠', message: `${check.label} 데이터 확인 필요 (${check.note})`, action: 'seed 데이터와 초기화 함수를 확인하세요.' })));

  const summary = {
    totalTeams: teams.length,
    totalPlayers: players.length,
    completeKsaTeams: teamRows.filter(row => row.ksaStatus === '정상').length,
    profileTeams: teamRows.filter(row => row.playerCount === 0 || row.profileCount === row.playerCount).length,
    calculatedTeams: teamRows.filter(row => row.calculationCount === playableRounds.length).length,
    expertiseReadyTeams: teamRows.filter(row => row.expertiseLensStatus === '정상').length,
    evidenceReadyTeams: teamRows.filter(row => row.submissionCount > 0 && row.evidenceReviewCount === row.submissionCount).length,
    qualityV2ReadyTeams: teamRows.filter(row => row.submissionCount > 0 && row.qualityV2Count === row.submissionCount).length,
    discussionV2ReadyTeams: teamRows.filter(row => row.decisionCount > 0 && row.discussionReviewCount === row.decisionCount).length,
    impactReadyTeams: teamRows.filter(row => row.calculationCount > 0 && row.impactLogCount === row.calculationCount).length,
    cumulativeRiskReadyTeams: teamRows.filter(row => row.calculationCount > 0 && row.cumulativeRiskCount === row.calculationCount).length,
    narrativeReadyTeams: teamRows.filter(row => row.calculationCount > 0 && row.resultNarrativeCount === row.calculationCount).length,
    warningSignalTeams: teamRows.filter(row => row.warningSignalCount > 0).length,
    finalTeams: teamRows.filter(row => row.finalStatus === '생성').length,
    finalGateTeams: teamRows.filter(row => row.finalGateStatus === '생성').length,
    declarationReviewTeams: teamRows.filter(row => row.declarationReviewStatus === '생성').length,
    reflectionReviewTeams: teamRows.filter(row => row.reflectionCount > 0 && row.reflectionReviewCount === row.reflectionCount).length,
    issueCount: issues.length,
    criticalCount: issues.filter(issue => issue.severity === '확인 필요').length
  };

  return { summary, teamRows, contentChecks, issues, playableRounds };
}
