import { readDb, updateDb } from './storage';
import { clamp } from '../utils/clamp';
import { getMaxRisk, getJudgmentPattern, calculateFinalLevel } from '../utils/judgmentUtils';
import { stateLabels } from '../utils/statusLabels';

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
      const riskName = stateLabels[risk.maxRiskKey] || '남은 부담';
      db2.rooms[roomId].finalResults[teamId] = {
        teamId,
        ...level,
        judgmentPattern: pattern.label,
        secretMissionScore,
        evidenceLines: [
          `${pattern.label} 판단이 반복되었습니다. ${assetSentence(pattern.label)}`,
          riskSentence(risk),
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
