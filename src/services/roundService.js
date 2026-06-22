import { readDb, updateDb } from './storage';
import { getNextPhase, getPrevPhase, getNextRoundId } from '../utils/phaseUtils';
import { logHostAction } from './roomService';

export function getRounds() { return readDb().gameContent.rounds; }
export function getRound(roundId) { return readDb().gameContent.rounds.find(r => r.roundId === roundId); }
export function getCurrentRound(roomId) { const p = readDb().rooms[roomId]?.roomProgress; return p ? getRound(p.currentRoundId) : null; }
export function movePhase(roomId, direction) {
  const db = readDb();
  const room = db.rooms[roomId];
  const round = db.gameContent.rounds.find(r => r.roundId === room.roomProgress.currentRoundId);
  const next = direction === 'prev' ? getPrevPhase(round.roundType, room.roomProgress.currentPhase) : getNextPhase(round.roundType, room.roomProgress.currentPhase);
  updateDb(db2 => { db2.rooms[roomId].roomProgress.currentPhase = next; db2.rooms[roomId].roundProgress[round.roundId].phase = next; db2.rooms[roomId].roomProgress.updatedAt = Date.now(); });
  logHostAction(roomId, 'movePhase', `단계 이동: ${next}`);
}
export function moveToNextRound(roomId) {
  const db = readDb();
  const room = db.rooms[roomId];
  const current = room.roomProgress.currentRoundId;
  const next = getNextRoundId(current);
  const nextRound = db.gameContent.rounds.find(r => r.roundId === next);
  updateDb(db2 => { db2.rooms[roomId].roomProgress.currentRoundId = next; db2.rooms[roomId].roomProgress.currentPhase = 'intro'; db2.rooms[roomId].roomProgress.currentRoundOrder = nextRound.order; db2.rooms[roomId].roomProgress.resultVisible = false; db2.rooms[roomId].roundProgress[next].status = 'active'; });
  logHostAction(roomId, 'moveRound', `라운드 이동: ${nextRound.title}`);
}
export function revealRoundResult(roomId) {
  const db = readDb(); const rid = db.rooms[roomId].roomProgress.currentRoundId;
  updateDb(db2 => { db2.rooms[roomId].roomProgress.resultVisible = true; db2.rooms[roomId].roomProgress.currentPhase = 'resultReveal'; db2.rooms[roomId].roundProgress[rid].resultRevealed = true; });
  logHostAction(roomId, 'revealResult', '결과 공개');
}
