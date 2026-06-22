import { updateDb, readDb } from './storage';
import { createId } from '../utils/idUtils';
import { findRoomByJoinCode } from './roomService';
import { generatePlayerCompetencyProfile, isKsaComplete } from '../utils/competencyProfileUtils';

export function joinRoom({ joinCode, displayName, teamId }) {
  const room = findRoomByJoinCode(joinCode);
  if (!room) throw new Error('유효하지 않은 입장 코드입니다');
  if (!displayName?.trim()) throw new Error('이름을 입력해 주세요');
  if (!teamId) throw new Error('참여할 팀을 선택해 주세요');
  const playerId = createId('player');
  updateDb(db => {
    const targetRoom = db.rooms[room.roomId];
    const player = { playerId, displayName:displayName.trim(), teamId, role:'player', connectionStatus:'online', joinedAt:Date.now(), lastSeenAt:Date.now() };
    targetRoom.players[playerId] = player;
    const team = targetRoom.teams[teamId];
    if (isKsaComplete(team?.selectedKSA)) {
      targetRoom.competencyProfiles = targetRoom.competencyProfiles || {};
      targetRoom.competencyProfiles[teamId] = targetRoom.competencyProfiles[teamId] || {};
      targetRoom.competencyProfiles[teamId][playerId] = generatePlayerCompetencyProfile({ player, team, selectedKSA: team.selectedKSA });
    }
  });
  return { roomId: room.roomId, playerId };
}

export function getPlayer(roomId, playerId) { return readDb().rooms[roomId]?.players[playerId] || null; }
