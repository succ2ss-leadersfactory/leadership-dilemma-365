import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getFirebaseEnvStatus, getFirestoreDb } from './firebaseClient';

function cleanForFirestore(value) {
  if (value === undefined || typeof value === 'function') return null;
  if (value === null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(item => cleanForFirestore(item));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined && typeof item !== 'function')
        .map(([key, item]) => [key, cleanForFirestore(item)])
    );
  }
  return String(value);
}

function safeDocId(id) {
  return String(id || 'unknown').replaceAll('/', '_');
}

function mapCount(value) {
  return Object.keys(value || {}).length;
}

function writeMapCollection({ batch, roomRef, collectionName, sourceMap, idField }) {
  const entries = Object.entries(sourceMap || {});
  entries.forEach(([key, value]) => {
    const item = cleanForFirestore(value || {});
    const docId = safeDocId(item?.[idField] || key);
    batch.set(doc(collection(roomRef, collectionName), docId), {
      ...item,
      firebaseDocId: docId,
      exportedAt: serverTimestamp()
    }, { merge: true });
  });
  return entries.length;
}

export function buildFirestoreExportPlan(room) {
  if (!room) return null;
  return {
    roomId: room.roomId,
    rootDocument: `rooms/${room.roomId}`,
    collections: [
      { name: 'teams', count: mapCount(room.teams) },
      { name: 'players', count: mapCount(room.players) },
      { name: 'votes', count: mapCount(room.votes) },
      { name: 'teamDecisions', count: mapCount(room.teamDecisions) },
      { name: 'submissions', count: mapCount(room.submissions) },
      { name: 'roundCalculations', count: mapCount(room.roundCalculations) },
      { name: 'declarations', count: mapCount(room.declarations) },
      { name: 'finalResults', count: mapCount(room.finalResults) },
      { name: 'stateValues', count: mapCount(room.stateValues) },
      { name: 'competencyProfiles', count: mapCount(room.competencyProfiles) },
      { name: 'roundProgress', count: mapCount(room.roundProgress) }
    ]
  };
}

export async function exportRoomToFirestore(room) {
  const envStatus = getFirebaseEnvStatus();
  if (!envStatus.ready) {
    return {
      ok: false,
      step: 'env',
      message: `Firebase 환경변수가 부족합니다: ${envStatus.missingKeys.join(', ')}`,
      envStatus,
      exportedAt: Date.now()
    };
  }

  if (!room?.roomId) {
    return {
      ok: false,
      step: 'room',
      message: '내보낼 방 데이터가 없습니다.',
      envStatus,
      exportedAt: Date.now()
    };
  }

  try {
    const db = getFirestoreDb();
    const batch = writeBatch(db);
    const roomRef = doc(db, 'rooms', safeDocId(room.roomId));
    const plan = buildFirestoreExportPlan(room);

    batch.set(roomRef, {
      roomId: room.roomId,
      sessionName: room.sessionName || room.roomName || '',
      companyName: room.companyName || '',
      joinCode: room.joinCode || '',
      roomProgress: cleanForFirestore(room.roomProgress || {}),
      exportSchemaVersion: 'firestore-export-v1',
      storageSource: 'localStorage',
      counts: Object.fromEntries(plan.collections.map(item => [item.name, item.count])),
      exportedAt: serverTimestamp(),
      browserExportedAt: Date.now()
    }, { merge: true });

    const writtenCollections = {
      teams: writeMapCollection({ batch, roomRef, collectionName: 'teams', sourceMap: room.teams, idField: 'teamId' }),
      players: writeMapCollection({ batch, roomRef, collectionName: 'players', sourceMap: room.players, idField: 'playerId' }),
      votes: writeMapCollection({ batch, roomRef, collectionName: 'votes', sourceMap: room.votes, idField: 'voteId' }),
      teamDecisions: writeMapCollection({ batch, roomRef, collectionName: 'teamDecisions', sourceMap: room.teamDecisions, idField: 'decisionId' }),
      submissions: writeMapCollection({ batch, roomRef, collectionName: 'submissions', sourceMap: room.submissions, idField: 'submissionId' }),
      roundCalculations: writeMapCollection({ batch, roomRef, collectionName: 'roundCalculations', sourceMap: room.roundCalculations, idField: 'calculationId' }),
      declarations: writeMapCollection({ batch, roomRef, collectionName: 'declarations', sourceMap: room.declarations, idField: 'teamId' }),
      finalResults: writeMapCollection({ batch, roomRef, collectionName: 'finalResults', sourceMap: room.finalResults, idField: 'teamId' }),
      stateValues: writeMapCollection({ batch, roomRef, collectionName: 'stateValues', sourceMap: room.stateValues, idField: 'teamId' }),
      competencyProfiles: writeMapCollection({ batch, roomRef, collectionName: 'competencyProfiles', sourceMap: room.competencyProfiles, idField: 'teamId' }),
      roundProgress: writeMapCollection({ batch, roomRef, collectionName: 'roundProgress', sourceMap: room.roundProgress, idField: 'roundId' })
    };

    await batch.commit();

    return {
      ok: true,
      step: 'export',
      message: '현재 방 데이터를 Firestore 구조로 내보냈습니다.',
      envStatus,
      roomId: room.roomId,
      rootDocument: `rooms/${safeDocId(room.roomId)}`,
      writtenCollections,
      exportedAt: Date.now()
    };
  } catch (error) {
    return {
      ok: false,
      step: 'firestore-export',
      message: error?.message || 'Firestore 내보내기 중 오류가 발생했습니다.',
      envStatus,
      roomId: room.roomId,
      exportedAt: Date.now()
    };
  }
}
