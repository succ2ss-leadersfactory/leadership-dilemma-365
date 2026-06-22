export const roundOrder = ['round0', 'week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'week9', 'week10', 'week11', 'week12'];
export const generalPhases = ['intro', 'playerVote', 'teamDiscussion', 'teamDecision', 'submission', 'calculationReview', 'resultReveal'];
export const setupPhases = ['intro', 'ksaSelection', 'resultReveal'];
export const finalPhases = ['intro', 'finalCalculation', 'finalReview', 'finalResult', 'reflection', 'declaration'];

export function getPhaseList(roundType) {
  if (roundType === 'setup') return setupPhases;
  if (roundType === 'result') return finalPhases;
  return generalPhases;
}

export function getNextPhase(roundType, phase) {
  const list = getPhaseList(roundType);
  const idx = list.indexOf(phase);
  return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : phase;
}

export function getPrevPhase(roundType, phase) {
  const list = getPhaseList(roundType);
  const idx = list.indexOf(phase);
  return idx > 0 ? list[idx - 1] : phase;
}

export function getNextRoundId(currentRoundId) {
  const idx = roundOrder.indexOf(currentRoundId);
  return idx >= 0 && idx < roundOrder.length - 1 ? roundOrder[idx + 1] : currentRoundId;
}
