import { clamp } from './clamp';
import { stateLabels } from './statusLabels';

const qualityRank = { low: 0, medium: 1, high: 2, veryHigh: 3 };

function getChoiceForRound(decisions = [], choices = [], roundId) {
  const decision = decisions.find(d => d.roundId === roundId);
  if (!decision) return null;
  return choices.find(choice => choice.choiceId === decision.finalChoiceId) || null;
}

function getSubmissionQuality(submissions = {}, roundId, teamId) {
  return submissions?.[`${roundId}_${teamId}`]?.quality || 'low';
}

function evaluateCondition({ condition, values, decisions, choices, submissions, teamId }) {
  if (!condition) return { passed: false, detail: '조건 없음' };

  if (condition.type === 'roundChoiceTypeIn') {
    const choice = getChoiceForRound(decisions, choices, condition.roundId);
    const passed = Boolean(choice && condition.choiceTypes.includes(choice.internalType));
    return { passed, detail: choice ? `${condition.roundId} 선택 유형 ${choice.internalType}` : `${condition.roundId} 팀 결정 없음` };
  }

  if (condition.type === 'roundChoiceTypeNotIn') {
    const choice = getChoiceForRound(decisions, choices, condition.roundId);
    const passed = Boolean(!choice || !condition.choiceTypes.includes(choice.internalType));
    return { passed, detail: choice ? `${condition.roundId} 선택 유형 ${choice.internalType}` : `${condition.roundId} 팀 결정 없음` };
  }

  if (condition.type === 'outputQualityAtMost') {
    const quality = getSubmissionQuality(submissions, condition.roundId, teamId);
    const passed = (qualityRank[quality] ?? 0) <= (qualityRank[condition.maxQuality] ?? 0);
    return { passed, detail: `${condition.roundId} 산출물 품질 ${quality} / 기준 ${condition.maxQuality} 이하` };
  }

  if (condition.type === 'riskAtLeast') {
    const current = Number(values?.[condition.riskKey] ?? 0);
    const passed = current >= Number(condition.min ?? 0);
    return { passed, detail: `${stateLabels[condition.riskKey] || condition.riskKey} ${current} / 기준 ${condition.min} 이상` };
  }

  return { passed: false, detail: `지원하지 않는 조건 ${condition.type}` };
}

function resolveTeamEffect(rule, teamId) {
  const teamEffect = rule.teamEffects?.[teamId];
  return {
    effect: teamEffect || rule.effect,
    label: teamEffect?.label || rule.label,
    evidence: teamEffect?.evidence || rule.evidence,
    isTeamSpecific: Boolean(teamEffect)
  };
}

function hasPlayableDecisionForWeek({ log, decisions = [] }) {
  const playableRoundId = `week${log.week}`;
  return decisions.some(decision => decision.roundId === playableRoundId);
}

export function calculateWeekLogImpacts({ weekLogs = [], weekLogImpacts = {}, values = {}, decisions = [], choices = [], submissions = {}, teamId, skipPlayableLogs = true }) {
  const impactValues = { ...values };
  const appliedImpacts = [];
  const skippedPlayableLogs = [];

  weekLogs.forEach(log => {
    if (skipPlayableLogs && hasPlayableDecisionForWeek({ log, decisions })) {
      skippedPlayableLogs.push({ logId: log.logId, week: log.week, title: log.title, reason: 'playable_round_decision_exists' });
      return;
    }
    const impactGroup = weekLogImpacts?.[log.logId];
    (impactGroup?.rules || []).forEach(rule => {
      const conditionResult = evaluateCondition({ condition: rule.condition, values: impactValues, decisions, choices, submissions, teamId });
      if (!conditionResult.passed) return;
      const resolved = resolveTeamEffect(rule, teamId);
      const riskKey = resolved.effect?.riskKey;
      const amount = Number(resolved.effect?.amount || 0);
      if (!riskKey || amount === 0) return;
      const before = Number(impactValues[riskKey] || 0);
      const after = clamp(before + amount, 0, 3);
      impactValues[riskKey] = after;
      appliedImpacts.push({
        logId: log.logId,
        week: log.week,
        title: log.title,
        ruleId: rule.ruleId,
        label: resolved.label,
        evidence: resolved.evidence,
        riskKey,
        riskLabel: stateLabels[riskKey] || riskKey,
        amount,
        before,
        after,
        conditionDetail: conditionResult.detail,
        isTeamSpecific: resolved.isTeamSpecific
      });
    });
  });

  return {
    baseValues: values,
    reviewValues: impactValues,
    weekLogImpactCount: appliedImpacts.length,
    weekLogImpacts: appliedImpacts,
    skippedPlayableLogs,
    skippedPlayableLogCount: skippedPlayableLogs.length,
    weekLogImpactLines: appliedImpacts.map(impact => `Week ${impact.week} · ${impact.isTeamSpecific ? '팀별 후폭풍 · ' : ''}${impact.label}: ${impact.riskLabel} ${impact.before}→${impact.after}. ${impact.evidence}`)
  };
}
