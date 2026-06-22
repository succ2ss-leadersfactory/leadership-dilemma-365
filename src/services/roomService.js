import { updateDb, readDb } from './storage';
import { createId, createJoinCode } from '../utils/idUtils';
import { seedTeams } from '../data/seedTeams';
import { seedRounds } from '../data/seedRounds';

const emptyState = { aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:0, executiveTrustRisk:0, collaborationDebt:0 };

export function createRoom(input = {}) {
  const roomId = createId('room');
  const joinCode = createJoinCode();
  updateDb(db => {
    db.rooms[roomId] = {
      roomId,
      title: input.title || '리더십 딜레마 365 - 파일럿',
      companyName: input.companyName || '세림인사이트',
      joinCode,
      status: 'waiting',
      hostKey: createId('host'),
      roomProgress: { roomId, status:'waiting', currentRoundId:'round0', currentPhase:'intro', currentRoundOrder:1, isPaused:false, isScreenLocked:false, resultVisible:false, finalResultVisible:false, updatedAt: Date.now() },
      teams: Object.fromEntries(seedTeams.map(t => [t.teamId, { ...t, selectedKSA:{ knowledge:[], skill:[], attitude:[] }, createdAt: Date.now(), updatedAt: Date.now() }])),
      players: {},
      competencyProfiles: Object.fromEntries(seedTeams.map(t => [t.teamId, {}])),
      roundProgress: Object.fromEntries(seedRounds.map(r => [r.roundId, { roundId:r.roundId, week:r.week, title:r.title, status:r.roundId === 'round0' ? 'active' : 'pending', phase:'intro', resultRevealed:false, locked:false, skipped:false }])),
      votes: {}, teamDecisions: {}, submissions: {},
      stateValues: Object.fromEntries(seedTeams.map(t => [t.teamId, { teamId:t.teamId, values:{...emptyState}, maxRiskValue:0, maxRiskKey:'aceBurnoutRisk', maxRiskLabel:'안정', updatedAt:Date.now() }])),
      roundCalculations: {}, finalResults: {}, declarations: {}, hostActions: []
    };
  });
  return { roomId, joinCode };
}

export function getRoom(roomId) { return readDb().rooms[roomId] || null; }
export function findRoomByJoinCode(joinCode) { return Object.values(readDb().rooms).find(r => r.joinCode === joinCode) || null; }
export function updateRoomProgress(roomId, patch) { updateDb(db => { Object.assign(db.rooms[roomId].roomProgress, patch, { updatedAt: Date.now() }); }); }
export function logHostAction(roomId, actionType, description) { updateDb(db => { db.rooms[roomId].hostActions.unshift({ actionId:createId('action'), actionType, description, createdAt:Date.now() }); }); }
