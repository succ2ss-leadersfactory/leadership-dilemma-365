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

function uniqueTop(items = [], limit = 3) {
  return Array.from(new Set(items.filter(Boolean))).slice(0, limit);
}

function getRiskTheme(text = '') {
  if (/고객|신뢰|불안|반응/.test(text)) return '신뢰·불안 신호';
  if (/기술|검증|재작업|요구사항|부채/.test(text)) return '기술·검증 리스크';
  if (/품질|현장|병목|납기|처리/.test(text)) return '운영·품질 부담';
  if (/공정|직원|소통|원칙|루머/.test(text)) return '공정성·소통 부담';
  if (/비용|절감|투자|장기|실행력/.test(text)) return '비용·실행력 부담';
  if (/늦|지연|속도|기회/.test(text)) return '속도·기회 부담';
  return '기타 반복 부담';
}

function buildRiskCauseGroups(narratives = []) {
  const grouped = narratives.reduce((acc, item) => {
    const theme = getRiskTheme(item.risk || '');
    if (!acc[theme]) acc[theme] = [];
    acc[theme].push({
      roundId: item.roundId,
      choiceType: item.choiceType,
      risk: item.risk,
      question: item.question
    });
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([, items]) => items.length >= 3)
    .map(([theme, items]) => ({
      theme,
      count: items.length,
      rounds: items.map(item => ({
        roundId: item.roundId,
        choiceType: item.choiceType,
        risk: item.risk,
        question: item.question,
        line: `${item.roundId}: ${item.risk}`
      }))
    }));
}

function buildWarningSignals({ narratives = [], teamName, topChoiceType, topChoiceCount, riskCauseGroups = [] }) {
  const warnings = [];
  if (narratives.length >= 4 && topChoiceCount >= 3) {
    warnings.push(`${teamName}은 ${topChoiceType} 선택이 반복되었습니다. 같은 방식의 선택이 강점으로 작동했는지, 아니면 다른 대안을 좁혔는지 확인하십시오.`);
  }

  riskCauseGroups.forEach(group => {
    warnings.push(`${teamName}은 ${group.theme}가 ${group.count}회 반복적으로 남았습니다. 다음 디브리핑에서는 “왜 이 대가를 계속 뒤로 미뤘는가”를 물어보십시오.`);
  });

  return warnings;
}

function buildNarrativePattern(calculations = [], teamName) {
  const narratives = calculations.map(calc => ({
    roundId: calc.roundId,
    choiceType: calc.choiceInternalType,
    ...(calc.teamResultNarrative || {})
  })).filter(item => item.gain || item.risk || item.question);

  if (!narratives.length) {
    return {
      narrativeCount: 0,
      narrativeSummary: `${teamName}은 아직 팀별 결과 해석을 누적할 계산 결과가 충분하지 않습니다.`,
      repeatedGains: [],
      repeatedRisks: [],
      narrativeQuestions: [],
      warningSignals: [],
      riskCauseGroups: []
    };
  }

  const repeatedGains = uniqueTop(narratives.map(item => item.gain));
  const repeatedRisks = uniqueTop(narratives.map(item => item.risk));
  const narrativeQuestions = uniqueTop(narratives.map(item => item.question));
  const choiceCounts = narratives.reduce((acc, item) => {
    const key = item.choiceType || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const [topChoiceType, topChoiceCount] = Object.entries(choiceCounts).sort((a, b) => b[1] - a[1])[0] || ['UNKNOWN', 0];
  const firstGain = repeatedGains[0] || '기능 전문성에 맞는 진전 신호가 일부 나타났습니다.';
  const firstRisk = repeatedRisks[0] || '반복되는 대가는 아직 뚜렷하지 않습니다.';
  const riskCauseGroups = buildRiskCauseGroups(narratives);
  const warningSignals = buildWarningSignals({ narratives, teamName, topChoiceType, topChoiceCount, riskCauseGroups });

  return {
    narrativeCount: narratives.length,
    topChoiceType,
    topChoiceCount,
    narrativeSummary: `${teamName}은 ${topChoiceType} 선택 흐름에서 ${firstGain} 그러나 ${firstRisk}`,
    repeatedGains,
    repeatedRisks,
    narrativeQuestions,
    warningSignals,
    riskCauseGroups
  };
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
  const narrativePattern = buildNarrativePattern(calculations, team.teamName);

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
    ...narrativePattern,
    summaryLine: scores.length ? summarizeEvidence(averageScore, team.teamName) : `${team.teamName}은 아직 산출물 증거 수준을 판단할 계산 결과가 충분하지 않습니다.`
  };
}

export function buildAllTeamExpertiseReportSummaries({ room, gameContent, teams = [] }) {
  return teams.map(team => buildTeamExpertiseReportSummary({ room, gameContent, team }));
}
