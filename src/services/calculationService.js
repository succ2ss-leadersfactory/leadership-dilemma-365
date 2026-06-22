import { readDb, updateDb } from './storage';
import { clamp } from '../utils/clamp';
import { getMaxRisk, getJudgmentPattern, calculateFinalLevel, calculateSurvivalOutcome, calculateMissionOutcome } from '../utils/judgmentUtils';
import { calculateWeekLogImpacts } from '../utils/weekLogImpactUtils';
import { applyRoundCompetencyGrowth } from '../utils/competencyGrowthUtils';
import { applyTeamPersonaInfluence } from '../utils/teamPersonaInfluenceUtils';
import { applyExpertiseFinalAdjustment } from '../utils/expertiseFinalAdjustmentUtils';
import { getTeamResultNarrative } from '../utils/teamResultNarrativeUtils';
import { stateLabels } from '../utils/statusLabels';
import { seedMissions } from '../data/seedMissions';

const qualityRank = { low: 0, medium: 1, high: 2, veryHigh: 3 };

export function clampStateValue(value) { return clamp(value, 0, 3); }
export function applyChoiceEffects(currentState, baseEffects) {
  const next = { ...currentState };
  Object.entries(baseEffects || {}).forEach(([k, v]) => { next[k] = clampStateValue((next[k] || 0) + v); });
  return next;
}
export function applyOutputQualityModifier(state, quality) {
  const next = { ...state };
  if (['high','veryHigh'].includes(quality)) next.executionPressure = clampStateValue((next.executionPressure || 0) - 1);
  if (quality === 'low') next.executiveTrustRisk = clampStateValue((next.executiveTrustRisk || 0) + 1);
  return next;
}
export function calculateRoundResult({ roomId, roundId, teamId }) {
  const db = readDb();
  const room = db.rooms[roomId];
  const decision = room.teamDecisions[`${roundId}_${teamId}`];
  if (!decision) throw new Error('팀 최종 선택이 없습니다');
  const choice = db.gameContent.choices.find(c => c.choiceId === decision.finalChoiceId);
  const submission = room.submissions[`${roundId}_${teamId}`] || { quality:'low' };
  const previousState = room.stateValues[teamId].values;
  const afterChoice = applyChoiceEffects(previousState, choice?.baseEffects || {});
  const afterQuality = applyOutputQualityModifier(afterChoice, submission.quality);
  updateDb(db2 => {
    const personaInfluence = applyTeamPersonaInfluence({
      values: afterQuality,
      profiles: db2.rooms[roomId].competencyProfiles?.[teamId] || {},
      choice
    });
    const finalState = personaInfluence.values;
    const risk = getMaxRisk(finalState);
    const growth = applyRoundCompetencyGrowth({
      room: db2.rooms[roomId],
      teamId,
      roundId,
      choice,
      submission,
      risk
    });
    const teamResultNarrative = getTeamResultNarrative({ teamId, choiceType: choice?.internalType });
    db2.rooms[roomId].roundCalculations[`${roundId}_${teamId}`] = {
      calculationId:`${roundId}_${teamId}`,
      roundId,
      teamId,
      choiceId:decision.finalChoiceId,
      choiceText: choice?.choiceText || decision.finalChoiceId,
      choiceInternalType: choice?.internalType || 'UNKNOWN',
      baseEffects:choice?.baseEffects || {},
      outputQuality:submission.quality,
      outputQualityScore: submission.qualityScore,
      outputEvidenceReview: submission.evidenceReview || null,
      teamResultNarrative,
      previousState,
      afterChoice,
      afterQuality,
      finalState,
      personaInfluences: personaInfluence.personaInfluences,
      personaInfluenceLines: personaInfluence.personaInfluenceLines,
      competencyGrowthLines: growth.growthLines,
      competencyGrowthEvents: growth.growthEvents,
      resultCardId:decision.finalChoiceId,
      calculatedAt:Date.now(),
      calculatedBy:'system'
    };
    db2.rooms[roomId].stateValues[teamId] = { teamId, values:finalState, ...risk, updatedAt:Date.now() };
  });
}
export function calculateAllTeamResultsForRound(roomId, roundId) {
  Object.keys(readDb().rooms[roomId].teams).forEach(teamId => {
    try { calculateRoundResult({ roomId, roundId, teamId }); } catch { /* skip incomplete */ }
  });
}
function riskSentence(risk) {
  const riskName = stateLabels[risk.maxRiskKey] || '남은 부담';
  if (risk.maxRiskValue === 0) return '현재 팀의 주요 리스크는 안정적으로 관리되고 있습니다.';
  if (risk.maxRiskValue === 1) return `${riskName}에 작은 신호가 남아 있습니다. 다음 현업에서 조기 관리가 필요합니다.`;
  if (risk.maxRiskValue === 2) return `${riskName}이 주의 수준입니다. 과제 배분과 의사소통 방식을 조정해야 합니다.`;
  return `${riskName}이 위험 수준입니다. 단기 성과보다 부담 완화가 우선 과제입니다.`;
}
function assetSentence(patternLabel) {
  if (patternLabel.includes('빠른')) return '위기 앞에서 실행을 미루지 않고 결과를 만들려는 힘이 확인되었습니다.';
  if (patternLabel.includes('기준')) return '불확실한 상황을 기준과 산출물로 정리하는 힘이 확인되었습니다.';
  if (patternLabel.includes('균형')) return '성과와 사람을 함께 보려는 판단 기준이 반복적으로 확인되었습니다.';
  if (patternLabel.includes('조건')) return '상위 기대와 협업 조건을 맞추며 리스크를 줄이려는 힘이 확인되었습니다.';
  return '선택을 기록하고 끝까지 실행하려는 힘이 확인되었습니다.';
}

function getMissionForTeam(db, teamId) {
  const contentMission = db.gameContent.secretMissions?.[teamId];
  if (contentMission?.scoreRules?.length) return contentMission;
  return seedMissions[teamId];
}

function getDecisionChoice(decisions, choices, roundId) {
  const decision = decisions.find(d => d.roundId === roundId);
  if (!decision) return null;
  return choices.find(c => c.choiceId === decision.finalChoiceId) || null;
}

function evaluateMissionRule({ rule, values, decisions, choices }) {
  if (rule.type === 'riskAtMost') {
    const current = Number(values?.[rule.riskKey] ?? 0);
    return { ...rule, passed: current <= rule.max, detail: `${stateLabels[rule.riskKey] || rule.riskKey}: ${current} / 허용 ${rule.max}` };
  }

  if (rule.type === 'roundChoiceTypeIn') {
    const choice = getDecisionChoice(decisions, choices, rule.roundId);
    return { ...rule, passed: Boolean(choice && rule.allowedTypes.includes(choice.internalType)), detail: choice ? `${rule.roundId} 선택 유형: ${choice.internalType}` : `${rule.roundId} 팀 결정 없음` };
  }

  return { ...rule, passed: false, detail: '지원하지 않는 미션 기준입니다.' };
}

function evaluateOutputQualityRule({ rule, room, teamId }) {
  const quality = room.submissions?.[`${rule.roundId}_${teamId}`]?.quality || 'low';
  return { ...rule, passed: (qualityRank[quality] ?? 0) >= (qualityRank[rule.minQuality] ?? 0), detail: `${rule.roundId} 산출물 품질: ${quality} / 기준 ${rule.minQuality}` };
}

function evaluateOutputEvidenceRule({ rule, room, teamId }) {
  const roundIds = rule.roundIds || [rule.roundId];
  const minScore = Number(rule.minScore ?? 3);
  const details = roundIds.map(roundId => {
    const review = room.submissions?.[`${roundId}_${teamId}`]?.evidenceReview;
    const score = Number(review?.evidenceScore || 0);
    const level = review?.evidenceLevel || '기록 없음';
    return { roundId, score, level, passed: score >= minScore };
  });
  const passed = details.some(item => item.passed);
  const detail = details.map(item => `${item.roundId} 증거 수준 ${item.level}(${item.score}/4)`).join(' / ');
  return { ...rule, passed, detail: `${detail} / 기준 ${minScore}/4 이상` };
}

function calculateSecretMission({ db, room, teamId, values, decisions, choices }) {
  const mission = getMissionForTeam(db, teamId);
  const ruleResults = (mission?.scoreRules || []).map(rule => {
    if (rule.type === 'outputQualityAtLeast') return evaluateOutputQualityRule({ rule, room, teamId });
    if (rule.type === 'outputEvidenceAtLeast') return evaluateOutputEvidenceRule({ rule, room, teamId });
    return evaluateMissionRule({ rule, values, decisions, choices });
  });
  const secretMissionScore = clamp(ruleResults.filter(r => r.passed).length, 0, 3);
  return {
    mission,
    secretMissionScore,
    missionCriteriaResults: ruleResults,
    missionEvidenceLines: ruleResults.map(r => `${r.passed ? '충족' : '미충족'} · ${r.label} (${r.detail})`)
  };
}

function logImpactSentence(logImpact) {
  if (logImpact.weekLogImpactCount > 0) return `중간 사건 로그 ${logImpact.weekLogImpactCount}건이 최종 심사에서 후폭풍으로 반영되었습니다.`;
  if (logImpact.skippedPlayableLogCount > 0) return `중간 사건 ${logImpact.skippedPlayableLogCount}건은 플레이 라운드 선택과 산출물로 이미 반영되어 별도 LOG 후폭풍에서는 제외했습니다.`;
  return '중간 사건 로그의 추가 후폭풍은 크지 않았습니다.';
}

export function generateFinalResults(roomId) {
  const db = readDb(); const room = db.rooms[roomId]; const choices = db.gameContent.choices;
  updateDb(db2 => {
    Object.keys(room.teams).forEach(teamId => {
      const values = room.stateValues[teamId]?.values || {};
      const week11 = room.submissions[`week11_${teamId}`]?.quality || 'medium';
      const decisions = Object.values(room.teamDecisions).filter(d => d.teamId === teamId);
      const pattern = getJudgmentPattern(decisions, choices);
      const logImpact = calculateWeekLogImpacts({
        weekLogs: db.gameContent.weekLogs,
        weekLogImpacts: db.gameContent.weekLogImpacts,
        values,
        decisions,
        choices,
        submissions: room.submissions,
        teamId
      });
      const expertiseAdjustment = applyExpertiseFinalAdjustment({ room, teamId, values: logImpact.reviewValues });
      const reviewValues = expertiseAdjustment.reviewValues;
      const missionEval = calculateSecretMission({ db, room, teamId, values: reviewValues, decisions, choices });
      const secretMissionScore = missionEval.secretMissionScore;
      const level = calculateFinalLevel({ values: reviewValues, week11Quality:week11, secretMissionScore });
      const survival = calculateSurvivalOutcome({ values: reviewValues, week11Quality: week11 });
      const mission = calculateMissionOutcome(secretMissionScore);
      const risk = getMaxRisk(reviewValues);
      const riskName = stateLabels[risk.maxRiskKey] || '남은 부담';
      db2.rooms[roomId].finalResults[teamId] = {
        teamId,
        ...level,
        ...survival,
        ...mission,
        judgmentPattern: pattern.label,
        baseValues: values,
        preExpertiseReviewValues: logImpact.reviewValues,
        reviewValues,
        reviewMaxRiskKey: risk.maxRiskKey,
        reviewMaxRiskValue: risk.maxRiskValue,
        reviewMaxRiskLabel: risk.maxRiskLabel,
        weekLogImpactCount: logImpact.weekLogImpactCount,
        weekLogImpacts: logImpact.weekLogImpacts,
        weekLogImpactLines: logImpact.weekLogImpactLines,
        skippedPlayableLogCount: logImpact.skippedPlayableLogCount || 0,
        skippedPlayableLogs: logImpact.skippedPlayableLogs || [],
        expertiseEvidenceAdjustment: expertiseAdjustment,
        expertiseEvidenceLines: expertiseAdjustment.adjustmentLines,
        secretMissionScore,
        secretMissionTitle: missionEval.mission?.missionTitle || '팀별 비밀 미션',
        secretMissionBrief: missionEval.mission?.missionBrief || '',
        secretMissionCriteria: missionEval.mission?.criteria || [],
        missionCriteriaResults: missionEval.missionCriteriaResults,
        missionEvidenceLines: missionEval.missionEvidenceLines,
        evidenceLines: [
          `${pattern.label} 판단이 반복되었습니다. ${assetSentence(pattern.label)}`,
          logImpactSentence(logImpact),
          ...(expertiseAdjustment.adjustmentLines || []),
          riskSentence(risk),
          `${survival.survivalLabel} 판정입니다. 조직개편 생존이 1차 기준으로 반영되었습니다.`,
          `${mission.missionLabel} 상태입니다. 팀별 비밀 미션 '${missionEval.mission?.missionTitle || '미션'}'의 충족 기준 ${secretMissionScore}/3개가 반영되었습니다.`,
          week11 === 'high' || week11 === 'veryHigh' ? '마지막 승부수의 산출물 품질이 높아 최종 판정에 긍정적으로 반영되었습니다.' : '마지막 승부수의 산출물 품질은 추가 보완 여지가 있어 최종 판정에 제한적으로 반영되었습니다.'
        ],
        strongestAsset: assetSentence(pattern.label).replace('확인되었습니다.', '').trim(),
        remainingBurden: riskName,
        nextAction: `${riskName}을 낮추기 위해 다음 현업에서는 선택 전 부담 배분과 확인 시점을 먼저 정합니다.`,
        hostAdjusted:false,
        visible:false,
        createdAt:Date.now()
      };
    });
  });
}
