import { updateDb, readDb } from './storage';
import { calculateSubmissionQuality } from '../utils/qualityUtils';

export function submitRoundOutput({ roomId, roundId, teamId, answers, submittedBy }) {
  const outputRequirement = readDb().gameContent.outputRequirements[`${roundId}_output`];
  const required = outputRequirement?.fields?.filter(f => f.required) || [];
  for (const f of required) {
    if (!String(answers[f.fieldKey] || '').trim()) throw new Error(`${f.label}을(를) 입력해 주세요`);
  }
  const { quality, qualityScore } = calculateSubmissionQuality(outputRequirement, answers);
  const submissionId = `${roundId}_${teamId}`;
  updateDb(db => { db.rooms[roomId].submissions[submissionId] = { submissionId, roundId, teamId, answers, quality, qualityScore, submittedBy, submittedAt:Date.now(), updatedAt:Date.now(), forcedLowByHost:false }; });
}
export function getSubmission(roomId, roundId, teamId) { return readDb().rooms[roomId]?.submissions[`${roundId}_${teamId}`] || null; }
