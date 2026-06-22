export const seedScoringRules = {
  baseScoreStart: 4,
  levels: { 4:'전략 유지·확대팀', 3:'유지팀', 2:'조건부 유지팀', 1:'통합 검토팀', 0:'전면 재설계 대상팀' },
  riskPenalty: { anyStateValueGte3:-1, twoOrMoreStateValuesGte2:-1 },
  bonusRules: { week11HighQuality:1, secretMissionPerfect:1 }
};
