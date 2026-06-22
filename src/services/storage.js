import { seedRounds } from '../data/seedRounds';
import { seedChoices } from '../data/seedChoices';
import { seedResultCards } from '../data/seedResultCards';
import { seedOutputRequirements } from '../data/seedOutputRequirements';
import { seedTeams } from '../data/seedTeams';
import { seedKsaOptions } from '../data/seedKsaOptions';
import { seedMissions } from '../data/seedMissions';

const KEY = 'leadership_dilemma_365_react_mvp';
const listeners = new Set();

function initialDb() {
  return {
    gameContent: {
      rounds: seedRounds,
      choices: seedChoices,
      resultCards: seedResultCards,
      outputRequirements: seedOutputRequirements,
      teams: seedTeams,
      ksaOptions: seedKsaOptions,
      secretMissions: seedMissions
    },
    rooms: {}
  };
}

export function readDb() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialDb();
  try { return { ...initialDb(), ...JSON.parse(raw) }; } catch { return initialDb(); }
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
