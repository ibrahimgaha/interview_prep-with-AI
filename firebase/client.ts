import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-3VgluP84daOChMkYdDrQtBK9ZU8-kvk",
  authDomain: "talentforge-ee07d.firebaseapp.com",
  projectId: "talentforge-ee07d",
  storageBucket: "talentforge-ee07d.firebasestorage.app",
  messagingSenderId: "321927579762",
  appId: "1:321927579762:web:5858a68d4c89f5b8599aeb",
  measurementId: "G-TD3RXCP44L"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);