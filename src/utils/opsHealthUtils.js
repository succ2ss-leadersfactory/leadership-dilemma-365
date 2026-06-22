const playableRounds = ['week1', 'week5', 'week8', 'week10', 'week11'];

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
    const decisionCount = playableRounds.filter(roundId => room.teamDecisions?.[`${roundId}_${team.teamId}`]).length;
    const submissionCount = playableRounds.filter(roundId => room.submissions?.[`${roundId}_${team.teamId}`]).length;
    const calculationCount = playableRounds.filter(roundId => room.roundCalculations?.[`${roundId}_${team.teamId}`]).length;
    const personaInfluenceCount = playableRounds.reduce((sum, roundId) => {
      const calc = room.roundCalculations?.[`${roundId}_${team.teamId}`];
      return sum + (calc?.personaInfluenceLines?.length || 0);
    }, 0);
    const finalReady = Boolean(room.finalResults?.[team.teamId]);
    const declaration = room.declarations?.[team.teamId];
    const reflectionCount = Object.keys(declaration?.individualReflections || {}).length;

    if (!completeKsa) issues.push(makeIssue({ teamName: team.teamName, area: 'KSA', message: 'Round 0 KSA가 지식·기술·태도 각 3개로 완성되지 않았습니다.', action: '팀 화면에서 KSA 9개를 저장하세요.' }));
    if (teamPlayers.length === 0) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '참가자', message: '팀에 참가자가 없습니다.', action: '참가자 입장 또는 샘플 데이터 생성을 확인하세요.' }));
    if (teamPlayers.length > 0 && missingProfiles.length > 0) issues.push(makeIssue({ teamName: team.teamName, area: '역량 프로필', message: `${missingProfiles.length}명의 역량 프로필이 없습니다.`, action: 'KSA 저장 후 참가자를 다시 입장시키거나 샘플 데이터를 재생성하세요.' }));
    if (missingPersona.length > 0) issues.push(makeIssue({ teamName: team.teamName, area: '인물 카드', message: `${missingPersona.length}명의 인물 카드가 없습니다.`, action: '역량 프로필 재생성을 확인하세요.' }));
    if (decisionCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '팀 결정', message: `팀 결정 ${decisionCount}/${playableRounds.length}건`, action: '미진행 라운드의 팀 최종 선택을 저장하세요.' }));
    if (submissionCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '산출물', message: `산출물 ${submissionCount}/${playableRounds.length}건`, action: '미진행 라운드의 산출물을 저장하세요.' }));
    if (calculationCount < playableRounds.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '결과 계산', message: `계산 결과 ${calculationCount}/${playableRounds.length}건`, action: 'Host 화면 또는 팀 화면에서 결과 계산을 실행하세요.' }));
    if (!finalReady) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '최종 판정', message: '최종 판정이 아직 생성되지 않았습니다.', action: 'Week 12에서 최종 판정 생성을 실행하세요.' }));
    if (teamPlayers.length > 0 && reflectionCount < teamPlayers.length) issues.push(makeIssue({ severity: '주의', teamName: team.teamName, area: '개인 성찰', message: `개인 성찰 ${reflectionCount}/${teamPlayers.length}건`, action: '참가자 개인 화면에서 성찰을 저장하게 하세요.' }));

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      ksaStatus: getStatus(completeKsa),
      playerCount: teamPlayers.length,
      profileCount: profileList.length,
      personaCount: profileList.filter(profile => profile.personaId).length,
      decisionCount,
      submissionCount,
      calculationCount,
      personaInfluenceCount,
      finalStatus: finalReady ? '생성' : '미생성',
      reflectionCount,
      status: completeKsa && teamPlayers.length === profileList.length && calculationCount === playableRounds.length && finalReady ? '정상' : '확인 필요'
    };
  });

  const contentChecks = [
    { label: '전략 이벤트', ok: Object.keys(gameContent.strategicEvents || {}).length >= 5, note: `${Object.keys(gameContent.strategicEvents || {}).length}건` },
    { label: '중간 사건 로그', ok: (gameContent.weekLogs || []).length >= 6, note: `${(gameContent.weekLogs || []).length}건` },
    { label: '후폭풍 규칙', ok: Object.keys(gameContent.weekLogImpacts || {}).length >= 6, note: `${Object.keys(gameContent.weekLogImpacts || {}).length}건` },
    { label: '비밀 미션', ok: Object.keys(gameContent.secretMissions || {}).length >= teams.length, note: `${Object.keys(gameContent.secretMissions || {}).length}건` },
    { label: 'KSA 옵션', ok: Object.keys(gameContent.ksaOptions || {}).length >= teams.length, note: `${Object.keys(gameContent.ksaOptions || {}).length}개 팀` }
  ];

  contentChecks.forEach(check => {
    if (!check.ok) issues.push(makeIssue({ teamName: '전체', area: check.label, message: `${check.label} 데이터가 부족합니다.`, action: 'seed 데이터 또는 storage migration을 확인하세요.' }));
  });

  const summary = {
    totalTeams: teams.length,
    totalPlayers: players.length,
    completeKsaTeams: teamRows.filter(row => row.ksaStatus === '정상').length,
    profileTeams: teamRows.filter(row => row.playerCount > 0 && row.profileCount === row.playerCount).length,
    calculatedTeams: teamRows.filter(row => row.calculationCount === playableRounds.length).length,
    finalTeams: teamRows.filter(row => row.finalStatus === '생성').length,
    issueCount: issues.length,
    criticalCount: issues.filter(issue => issue.severity === '확인 필요').length
  };

  return { summary, teamRows, contentChecks, issues, playableRounds };
}
