import { updateDb, readDb } from './storage';
import { calculateSubmissionQuality } from '../utils/qualityUtils';
import { buildTeamOutputEvidenceReview } from '../utils/teamOutputEvidenceUtils';

export function submitRoundOutput({ roomId, roundId, teamId, answers, submittedBy }) {
  const db = readDb();
  const outputRequirement = db.gameContent.outputRequirements[`${roundId}_output`];
  const expertiseLens = db.gameContent.teamExpertiseLenses?.[teamId];
  const required = outputRequirement?.fields?.filter(f => f.required) || [];
  for (const f of required) {
    if (!String(answers[f.fieldKey] || '').trim()) throw new Error(`${f.label}을(를) 입력해 주세요`);
  }
  const evidenceReview = buildTeamOutputEvidenceReview({ answers, expertiseLens });
  const discussionQualityReview = db.rooms[roomId]?.teamDecisions?.[`${roundId}_${teamId}`]?.discussionQualityReview || null;
  const { quality, qualityScore, qualityBreakdown } = calculateSubmissionQuality(outputRequirement, answers, evidenceReview, discussionQualityReview);
  const submissionId = `${roundId}_${teamId}`;
  updateDb(db => {
    db.rooms[roomId].submissions[submissionId] = {
      submissionId,
      roundId,
      teamId,
      answers,
      quality,
      qualityScore,
      qualityBreakdown,
      evidenceReview,
      discussionQualityReview,
      submittedBy,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
      forcedLowByHost: false
    };
  });
}

export function getSubmission(roomId, roundId, teamId) { return readDb().rooms[roomId]?.submissions[`${roundId}_${teamId}`] || null; }
