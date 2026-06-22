import { readDb, updateDb } from './storage';
import { clamp } from '../utils/clamp';
import { getMaxRisk, getJudgmentPattern, calculateFinalLevel } from '../utils/judgmentUtils';

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
  const finalState = applyOutputQualityModifier(afterChoice, submission.quality);
  const risk = getMaxRisk(finalState);
  updateDb(db2 => {
    db2.rooms[roomId].roundCalculations[`${roundId}_${teamId}`] = {
      calculationId:`${roundId}_${teamId}`,
      roundId,
      teamId,
      choiceId:decision.finalChoiceId,
      choiceText: choice?.choiceText || decision.finalChoiceId,
      choiceInternalType: choice?.internalType || 'UNKNOWN',
      baseEffects:choice?.baseEffects || {},
      outputQuality:submission.quality,
      previousState,
      finalState,
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
export function generateFinalResults(roomId) {
  const db = readDb(); const room = db.rooms[roomId]; const choices = db.gameContent.choices;
  updateDb(db2 => {
    Object.keys(room.teams).forEach(teamId => {
      const values = room.stateValues[teamId]?.values || {};
      const week11 = room.submissions[`week11_${teamId}`]?.quality || 'medium';
      const secretMissionScore = 2;
      const decisions = Object.values(room.teamDecisions).filter(d => d.teamId === teamId);
      const pattern = getJudgmentPattern(decisions, choices);
      const level = calculateFinalLevel({ values, week11Quality:week11, secretMissionScore });
      const risk = getMaxRisk(values);
      db2.rooms[roomId].finalResults[teamId] = { teamId, ...level, judgmentPattern:pattern.label, secretMissionScore, evidenceLines:[`${pattern.label} 판단이 반복되었습니다.`, `${risk.maxRiskLabel} 수준의 ${risk.maxRiskKey} 부담이 남았습니다.`, '마지막 승부수와 비밀 미션이 최종 판정에 반영되었습니다.'], strongestAsset:'선택을 끝까지 기록한 실행력', remainingBurden:risk.maxRiskKey, nextAction:'다음 현업에서는 선택 전 부담 배분을 먼저 확인합니다.', hostAdjusted:false, visible:false, createdAt:Date.now() };
    });
  });
}
