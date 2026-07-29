import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const safeConfig = (firebaseConfigJson as Record<string, string>) || {};

const config = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || safeConfig.projectId || 'gen-lang-client-0957103195',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || safeConfig.appId || '',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || safeConfig.apiKey || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || safeConfig.authDomain || '',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || safeConfig.firestoreDatabaseId || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || safeConfig.storageBucket || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || safeConfig.messagingSenderId || '',
};

const app = !getApps().length ? initializeApp(config) : getApp();

export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence enabled in another tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in browser.');
    }
  });
}

export {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
};

