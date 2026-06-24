import { collection, doc, onSnapshot, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { getFirebaseEnvStatus, getFirestoreDb } from './firebaseClient';

function safeId(value) {
  return String(value || 'unknown').replaceAll('/', '_');
}

function randomPin(existingPins = new Set()) {
  let pin = '';
  let guard = 0;
  do {
    pin = String(Math.floor(1000 + Math.random() * 9000));
    guard += 1;
  } while ((existingPins.has(pin) || ['0000', '1111', '1234', '4321'].includes(pin)) && guard < 100);
  existingPins.add(pin);
  return pin;
}

export function canUseFirebasePinService() {
  return getFirebaseEnvStatus().ready;
}

export function subscribeRepresentativePins({ roomId, teamIds, onChange, onError }) {
  if (!canUseFirebasePinService()) return () => {};
  const db = getFirestoreDb();
  const state = {};
  const emit = () => onChange?.({ ...state });
  const unsubs = (teamIds || []).map(teamId => onSnapshot(
    doc(db, 'rooms', safeId(roomId), 'teams', safeId(teamId)),
    snapshot => {
      state[teamId] = snapshot.exists() ? { firebaseDocId: snapshot.id, ...snapshot.data() } : null;
      emit();
    },
    error => onError?.(error)
  ));
  return () => unsubs.forEach(unsub => unsub());
}

export async function issueRepresentativePins({ roomId, teams, force = false }) {
  const envStatus = getFirebaseEnvStatus();
  if (!envStatus.ready) {
    return { ok: false, message: `Firebase 환경변수가 부족합니다: ${envStatus.missingKeys.join(', ')}` };
  }
  const db = getFirestoreDb();
  const batch = writeBatch(db);
  const pins = {};
  const usedPins = new Set();
  const roomRef = doc(db, 'rooms', safeId(roomId));

  batch.set(roomRef, {
    roomId,
    representativePinIssuedAt: serverTimestamp(),
    browserRepresentativePinIssuedAt: Date.now()
  }, { merge: true });

  (teams || []).forEach(team => {
    const pin = randomPin(usedPins);
    pins[team.teamId] = pin;
    batch.set(doc(collection(roomRef, 'teams'), safeId(team.teamId)), {
      teamId: team.teamId,
      teamName: team.teamName || team.teamId,
      representativePin: pin,
      representativeName: force ? '' : (team.representativeName || ''),
      representativePinPolicy: 'host-issued-4-digit',
      representativePinIssuedAt: serverTimestamp(),
      browserRepresentativePinIssuedAt: Date.now()
    }, { merge: true });
  });

  await batch.commit();
  return { ok: true, pins, message: '팀별 대표 PIN을 생성했습니다.' };
}
