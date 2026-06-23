import { seedRounds } from '../data/seedRounds';
import { seedChoices } from '../data/seedChoices';
import { seedResultCards } from '../data/seedResultCards';
import { seedOutputRequirements } from '../data/seedOutputRequirements';
import { seedTeams } from '../data/seedTeams';
import { seedKsaOptions } from '../data/seedKsaOptions';
import { seedMissions } from '../data/seedMissions';
import { seedStrategicEvents } from '../data/seedStrategicEvents';
import { seedWeekLogs } from '../data/seedWeekLogs';
import { seedWeekLogImpacts } from '../data/seedWeekLogImpacts';
import { seedTeamExpertiseLenses } from '../data/seedTeamExpertiseLenses';
import { seedTeamSituationVariants } from '../data/seedTeamSituationVariants';

const KEY = 'leadership_dilemma_365_react_mvp';
const listeners = new Set();

function baseGameContent() {
  return {
    rounds: seedRounds,
    choices: seedChoices,
    resultCards: seedResultCards,
    outputRequirements: seedOutputRequirements,
    teams: seedTeams,
    ksaOptions: seedKsaOptions,
    secretMissions: seedMissions,
    strategicEvents: seedStrategicEvents,
    weekLogs: seedWeekLogs,
    weekLogImpacts: seedWeekLogImpacts,
    teamExpertiseLenses: seedTeamExpertiseLenses,
    teamSituationVariants: seedTeamSituationVariants
  };
}

function initialDb() {
  return {
    gameContent: baseGameContent(),
    rooms: {}
  };
}

function migrateRounds(rounds = []) {
  const seededById = Object.fromEntries(seedRounds.map(round => [round.roundId, round]));
  const sourceRounds = Array.isArray(rounds) && rounds.length ? rounds : seedRounds;
  return sourceRounds.map(round => ({
    ...(seededById[round.roundId] || {}),
    ...round,
    strategicEventId: round.strategicEventId || seededById[round.roundId]?.strategicEventId
  }));
}

function mergeById(baseItems = [], parsedItems = [], idKey) {
  const merged = new Map();
  baseItems.forEach(item => merged.set(item[idKey], item));
  (Array.isArray(parsedItems) ? parsedItems : []).forEach(item => merged.set(item[idKey], { ...(merged.get(item[idKey]) || {}), ...item }));
  return Array.from(merged.values()).sort((a, b) => (a.week || 0) - (b.week || 0));
}

function mergeSecretMissions(baseMissions = {}, parsedMissions = {}) {
  return Object.fromEntries(Object.entries(baseMissions).map(([teamId, baseMission]) => {
    const parsedMission = parsedMissions?.[teamId] || {};
    const parsedRules = parsedMission.scoreRules || [];
    const hasExpertiseRule = parsedRules.some(rule => rule.type === 'outputEvidenceAtLeast');
    return [teamId, {
      ...baseMission,
      ...parsedMission,
      criteria: hasExpertiseRule ? (parsedMission.criteria || baseMission.criteria) : baseMission.criteria,
      scoreRules: hasExpertiseRule ? parsedRules : baseMission.scoreRules
    }];
  }));
}

function mergeGameContent(parsedGameContent = {}) {
  const base = baseGameContent();
  return {
    ...base,
    ...parsedGameContent,
    rounds: migrateRounds(parsedGameContent.rounds),
    secretMissions: mergeSecretMissions(base.secretMissions, parsedGameContent.secretMissions),
    strategicEvents: {
      ...base.strategicEvents,
      ...(parsedGameContent.strategicEvents || {})
    },
    teamExpertiseLenses: {
      ...base.teamExpertiseLenses,
      ...(parsedGameContent.teamExpertiseLenses || {})
    },
    teamSituationVariants: {
      ...base.teamSituationVariants,
      ...(parsedGameContent.teamSituationVariants || {})
    },
    weekLogs: mergeById(base.weekLogs, parsedGameContent.weekLogs, 'logId'),
    weekLogImpacts: {
      ...base.weekLogImpacts,
      ...(parsedGameContent.weekLogImpacts || {})
    }
  };
}

export function readDb() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialDb();
  try {
    const parsed = JSON.parse(raw);
    const base = initialDb();
    return {
      ...base,
      ...parsed,
      gameContent: mergeGameContent(parsed.gameContent)
    };
  } catch { return initialDb(); }
}

export function writeDb(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach(fn => fn(readDb()));
}

export function updateDb(mutator) {
  const db = readDb();
  mutator(db);
  writeDb(db);
  return db;
}

export function subscribe(callback) {
  listeners.add(callback);
  callback(readDb());
  return () => listeners.delete(callback);
}

export function resetDb() {
  writeDb(initialDb());
}

export function seedGameContent() {
  return updateDb(db => {
    db.gameContent = initialDb().gameContent;
  });
}
