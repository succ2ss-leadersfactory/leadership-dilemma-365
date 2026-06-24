import { collection, doc, onSnapshot } from 'firebase/firestore';
import { getFirebaseEnvStatus, getFirestoreDb } from './firebaseClient';

function safeId(value) {
  return String(value || 'unknown').replaceAll('/', '_');
}

function mapCollection(snapshot) {
  return Object.fromEntries(snapshot.docs.map(item => [item.id, { firebaseDocId: item.id, ...item.data() }]));
}

export function canUseFirebaseHostStatus() {
  return getFirebaseEnvStatus().ready;
}

export function subscribeFirebaseHostStatus({ roomId, onChange, onError }) {
  if (!canUseFirebaseHostStatus()) return () => {};
  const db = getFirestoreDb();
  const roomRef = doc(db, 'rooms', safeId(roomId));
  const state = {
    room: null,
    teams: {},
    teamMembers: {},
    teamDecisions: {},
    submissions: {},
    declarations: {},
    finalResults: {},
    roundCalculations: {}
  };
  const emit = () => onChange?.({ ...state });
  const unsubs = [
    onSnapshot(roomRef, snapshot => {
      state.room = snapshot.exists() ? { firebaseDocId: snapshot.id, ...snapshot.data() } : null;
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'teams'), snapshot => {
      state.teams = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'teamMembers'), snapshot => {
      state.teamMembers = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'teamDecisions'), snapshot => {
      state.teamDecisions = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'submissions'), snapshot => {
      state.submissions = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'declarations'), snapshot => {
      state.declarations = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'finalResults'), snapshot => {
      state.finalResults = mapCollection(snapshot);
      emit();
    }, error => onError?.(error)),
    onSnapshot(collection(roomRef, 'roundCalculations'), snapshot => {
      state.roundCalculations = mapCollection(snapshot);
      emit();
    }, error => onError?.(error))
  ];
  return () => unsubs.forEach(unsub => unsub());
}
