import { updateDb, readDb } from './storage';
import { createId } from '../utils/idUtils';
import { findRoomByJoinCode } from './roomService';

export function joinRoom({ joinCode, displayName, teamId }) {
  const room = findRoomByJoinCode(joinCode);
  if (!room) throw new Error('유효하지 않은 입장 코드입니다');
  if (!displayName?.trim()) throw new Error('이름을 입력해 주세요');
  if (!teamId) throw new Error('참여할 팀을 선택해 주세요');
  const playerId = createId('player');
  updateDb(db => {
    db.rooms[room.roomId].players[playerId] = { playerId, displayName:displayName.trim(), teamId, role:'player', connectionStatus:'online', joinedAt:Date.now(), lastSeenAt:Date.now() };
  });
  return { roomId: room.roomId, playerId };
}

export function getPlayer(roomId, playerId) { return readDb().rooms[roomId]?.players[playerId] || null; }
