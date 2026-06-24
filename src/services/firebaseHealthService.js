import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirebaseEnvStatus, getFirestoreDb } from './firebaseClient';

function makeCheckId(roomId) {
  const safeRoomId = roomId || 'no-room';
  return `${safeRoomId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function runFirebaseConnectionCheck({ roomId } = {}) {
  const envStatus = getFirebaseEnvStatus();
  if (!envStatus.ready) {
    return {
      ok: false,
      step: 'env',
      envStatus,
      message: `Firebase 환경변수가 부족합니다: ${envStatus.missingKeys.join(', ')}`,
      checkedAt: Date.now()
    };
  }

  try {
    const db = getFirestoreDb();
    const checkId = makeCheckId(roomId);
    const ref = doc(db, 'firebaseHealthChecks', checkId);
    const payload = {
      checkId,
      roomId: roomId || null,
      projectId: envStatus.projectId,
      appName: 'leadership-dilemma-365',
      source: 'admin-firebase-check',
      createdAt: serverTimestamp(),
      browserCheckedAt: Date.now()
    };

    await setDoc(ref, payload);
    const snapshot = await getDoc(ref);

    return {
      ok: snapshot.exists(),
      step: snapshot.exists() ? 'write-read' : 'read',
      checkId,
      envStatus,
      message: snapshot.exists()
        ? 'Firestore 쓰기와 읽기 테스트가 성공했습니다.'
        : '문서 쓰기 후 읽기 결과가 없습니다.',
      checkedAt: Date.now()
    };
  } catch (error) {
    return {
      ok: false,
      step: 'firestore',
      envStatus,
      message: error?.message || 'Firestore 연결 테스트 중 오류가 발생했습니다.',
      checkedAt: Date.now()
    };
  }
}
