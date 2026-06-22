import { updateDb, readDb } from './storage';

export function submitVote({ roomId, roundId, teamId, playerId, choiceId, reason }) {
  if (!choiceId) throw new Error('선택지를 선택해 주세요');
  if (!reason || reason.trim().length < 5) throw new Error('선택 이유를 5자 이상 입력해 주세요');
  const voteId = `${roundId}_${teamId}_${playerId}`;
  updateDb(db => { db.rooms[roomId].votes[voteId] = { voteId, roundId, teamId, playerId, choiceId, reason: reason.trim(), isFinal:true, submittedAt:Date.now(), updatedAt:Date.now() }; });
}
export function getTeamVotes(roomId, roundId, teamId) { return Object.values(readDb().rooms[roomId]?.votes || {}).filter(v => v.roundId === roundId && v.teamId === teamId); }
export function getVote(roomId, roundId, teamId, playerId) { return readDb().rooms[roomId]?.votes[`${roundId}_${teamId}_${playerId}`] || null; }
