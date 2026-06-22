import { updateDb, readDb } from './storage';
import { generateTeamCompetencyProfiles } from '../utils/competencyProfileUtils';

export function saveTeamKSA(roomId, teamId, selectedKSA) {
  ['knowledge','skill','attitude'].forEach(k => { if ((selectedKSA[k] || []).length !== 3) throw new Error('지식·기술·태도를 각각 3개씩 선택해 주세요'); });
  updateDb(db => {
    const room = db.rooms[roomId];
    const team = room.teams[teamId];
    team.selectedKSA = selectedKSA;
    team.updatedAt = Date.now();
    room.competencyProfiles = room.competencyProfiles || {};
    room.competencyProfiles[teamId] = generateTeamCompetencyProfiles({
      players: Object.values(room.players || {}),
      team,
      selectedKSA
    });
  });
}
export function submitTeamDecision({ roomId, roundId, teamId, finalChoiceId, discussionSummary, submittedBy }) {
  if (!finalChoiceId) throw new Error('팀 최종 선택을 골라 주세요');
  if (!discussionSummary || discussionSummary.trim().length < 5) throw new Error('토론 요약을 5자 이상 입력해 주세요');
  const decisionId = `${roundId}_${teamId}`;
  updateDb(db => { db.rooms[roomId].teamDecisions[decisionId] = { decisionId, roundId, teamId, finalChoiceId, discussionSummary: discussionSummary.trim(), submittedBy, submittedAt:Date.now(), locked:true, forcedByHost:false }; });
}
export function getTeamDecision(roomId, roundId, teamId) { return readDb().rooms[roomId]?.teamDecisions[`${roundId}_${teamId}`] || null; }
