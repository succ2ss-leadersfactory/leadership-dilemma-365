import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseEnvMap = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

export function getFirebaseEnvStatus() {
  const missingKeys = requiredKeys.filter(key => !firebaseEnvMap[key]);
  const configuredKeys = Object.entries(firebaseEnvMap)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return {
    ready: missingKeys.length === 0,
    missingKeys,
    configuredKeys,
    projectId: firebaseEnvMap.projectId || '',
    authDomain: firebaseEnvMap.authDomain || '',
    hasMeasurementId: Boolean(firebaseEnvMap.measurementId)
  };
}

export function getFirebaseApp() {
  const status = getFirebaseEnvStatus();
  if (!status.ready) {
    throw new Error(`Firebase 환경변수가 부족합니다: ${status.missingKeys.join(', ')}`);
  }

  if (getApps().length > 0) return getApps()[0];

  return initializeApp(firebaseEnvMap);
}

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}
