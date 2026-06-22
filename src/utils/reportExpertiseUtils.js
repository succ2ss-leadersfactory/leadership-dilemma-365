function levelLabel(score) {
  if (score >= 3.5) return '강함';
  if (score >= 2.5) return '충실';
  if (score >= 1.5) return '기본';
  return '부족';
}

function summarizeEvidence(score, teamName) {
  if (score >= 3.5) return `${teamName}은 산출물에서 판단 근거, 구체 증거, 다음 행동, 남는 리스크를 비교적 균형 있게 남겼습니다.`;
  if (score >= 2.5) return `${teamName}은 산출물의 기본 증거는 충실하게 남겼지만, 일부 기준은 더 구체화할 여지가 있습니다.`;
  if (score >= 1.5) return `${teamName}은 산출물의 방향은 보였지만, 증거와 다음 행동을 더 선명하게 남길 필요가 있습니다.`;
  return `${teamName}은 산출물이 실행 메모에 가까워, 판단 근거와 리스크 신호를 더 분명히 남겨야 합니다.`;
}

function getTeamCalculations(room = {}, teamId) {
  return Object.values(room.roundCalculations || {})
    .filter(calc => calc.teamId === teamId && calc.outputEvidenceReview)
    .sort((a, b) => Number(String(a.roundId).replace('week', '')) - Number(String(b.roundId).replace('week', '')));
}

export function buildTeamExpertiseReportSummary({ room, gameContent, team }) {
  const lens = gameContent.teamExpertiseLenses?.[team.teamId];
  const calculations = getTeamCalculations(room, team.teamId);
  const scores = calculations.map(calc => Number(calc.outputEvidenceReview?.evidenceScore || 0));
  const averageScore = scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : 0;
  const strongest = calculations.filter(calc => Number(calc.outputEvidenceReview?.evidenceScore || 0) >= 3).map(calc => calc.roundId);
  const weakest = calculations.filter(calc => Number(calc.outputEvidenceReview?.evidenceScore || 0) <= 1).map(calc => calc.roundId);
  const repeatedSignals = calculations.flatMap(calc => calc.outputEvidenceReview?.evidenceSignals || []);
  const needsMoreEvidence = repeatedSignals.filter(line => line.includes('더 필요') || line.includes('분명히') || line.includes('드러나지')).slice(0, 3);

  return {
    teamId: team.teamId,
    teamName: team.teamName,
    lensTitle: lens?.title || '전문성 렌즈 미등록',
    businessLens: lens?.businessLens || '',
    leadershipLens: lens?.leadershipLens || '',
    expertiseKeywords: lens?.theoryKeywords || [],
    evidenceStandards: lens?.evidenceStandards || [],
    commonBlindSpots: lens?.commonBlindSpots || [],
    facilitatorQuestion: lens?.facilitatorQuestions?.[0] || '이 팀은 어떤 전문성 기준을 반복적으로 놓쳤습니까?',
    evidenceCount: calculations.length,
    averageScore,
    evidenceLevel: scores.length ? levelLabel(averageScore) : '기록 없음',
    strongestWeeks: strongest.length ? strongest.join(', ') : '뚜렷한 강점 주차 없음',
    weakestWeeks: weakest.length ? weakest.join(', ') : '뚜렷한 취약 주차 없음',
    needsMoreEvidence,
    summaryLine: scores.length ? summarizeEvidence(averageScore, team.teamName) : `${team.teamName}은 아직 산출물 증거 수준을 판단할 계산 결과가 충분하지 않습니다.`
  };
}

export function buildAllTeamExpertiseReportSummaries({ room, gameContent, teams = [] }) {
  return teams.map(team => buildTeamExpertiseReportSummary({ room, gameContent, team }));
}
