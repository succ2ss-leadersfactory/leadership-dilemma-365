import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseEnvStatus, getFirestoreDb } from './firebaseClient';

function id(value) {
  return String(value || 'unknown').replaceAll('/', '_');
}

function clean(value) {
  if (value === undefined || typeof value === 'function') return null;
  if (value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map(item => clean(item));
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && typeof item !== 'function').map(([key, item]) => [key, clean(item)]));
  }
  return String(value);
}

function refs(roomId, teamId, roundId = 'round0') {
  const db = getFirestoreDb();
  const room = id(roomId);
  const team = id(teamId);
  const round = id(roundId);
  return {
    roomRef: doc(db, 'rooms', room),
    teamRef: doc(db, 'rooms', room, 'teams', team),
    decisionRef: doc(db, 'rooms', room, 'teamDecisions', `${round}_${team}`),
    submissionRef: doc(db, 'rooms', room, 'submissions', `${round}_${team}`),
    declarationRef: doc(db, 'rooms', room, 'declarations', team),
    calculationRef: doc(db, 'rooms', room, 'roundCalculations', `${round}_${team}`),
    finalResultRef: doc(db, 'rooms', room, 'finalResults', team)
  };
}

export function isFirebaseTeamReady() {
  return getFirebaseEnvStatus().ready;
}

export function subscribeFirebaseTeamScreen({ roomId, teamId, roundId, onChange, onError }) {
  if (!isFirebaseTeamReady()) return () => {};
  const targetRefs = refs(roomId, teamId, roundId);
  const state = { room: null, team: null, decision: null, submission: null, declaration: null, calculation: null, finalResult: null };
  const emit = () => onChange?.({ ...state });
  const listen = (ref, key) => onSnapshot(ref, snapshot => {
    state[key] = snapshot.exists() ? { firebaseDocId: snapshot.id, ...snapshot.data() } : null;
    emit();
  }, error => onError?.(error));
  const unsubs = [
    listen(targetRefs.roomRef, 'room'),
    listen(targetRefs.teamRef, 'team'),
    listen(targetRefs.decisionRef, 'decision'),
    listen(targetRefs.submissionRef, 'submission'),
    listen(targetRefs.declarationRef, 'declaration'),
    listen(targetRefs.calculationRef, 'calculation'),
    listen(targetRefs.finalResultRef, 'finalResult')
  ];
  return () => unsubs.forEach(unsub => unsub());
}

export async function saveFirebaseTeamKsa({ roomId, teamId, teamName, selectedKSA }) {
  const { teamRef } = refs(roomId, teamId, 'round0');
  await setDoc(teamRef, { teamId, teamName: teamName || teamId, selectedKSA: clean(selectedKSA), updatedAt: serverTimestamp(), browserUpdatedAt: Date.now() }, { merge: true });
}

export async function saveFirebaseTeamDecision({ roomId, teamId, roundId, finalChoiceId, discussionSummary, discussionQualityReview }) {
  const { decisionRef } = refs(roomId, teamId, roundId);
  await setDoc(decisionRef, { decisionId: `${roundId}_${teamId}`, roomId, roundId, teamId, finalChoiceId, discussionSummary: discussionSummary || '', discussionQualityReview: clean(discussionQualityReview || null), submittedBy: 'team-representative', submittedAt: serverTimestamp(), browserSubmittedAt: Date.now() }, { merge: true });
}

export async function saveFirebaseRoundSubmission({ roomId, teamId, roundId, submission }) {
  const { submissionRef } = refs(roomId, teamId, roundId);
  await setDoc(submissionRef, { submissionId: `${roundId}_${teamId}`, roomId, roundId, teamId, ...clean(submission || {}), submittedBy: 'team-representative', submittedAt: serverTimestamp(), browserSubmittedAt: Date.now() }, { merge: true });
}

export async function saveFirebaseTeamDeclaration({ roomId, teamId, teamDeclaration, declarationQualityReview }) {
  const { declarationRef } = refs(roomId, teamId, 'week12');
  await setDoc(declarationRef, { teamId, teamDeclaration: teamDeclaration || '', declarationQualityReview: clean(declarationQualityReview || null), submittedAt: serverTimestamp(), browserSubmittedAt: Date.now() }, { merge: true });
}
