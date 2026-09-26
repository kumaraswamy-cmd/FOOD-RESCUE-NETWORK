import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Secure Firebase Configuration from Environment Variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "food-rescue-network-8d050.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "food-rescue-network-8d050",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "food-rescue-network-8d050.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "613636160066",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:613636160066:web:bb48256739a3db66a00bdb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T3579DZELT"
};

// Initialize Firebase App if API Key is available
let app = null;
let auth = null;
let db = null;
let storage = null;
let googleProvider = null;

if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn("⚠️ Firebase initialization warning:", err.message);
  }
} else {
  console.info("ℹ️ Firebase running in local fallback mode. Set VITE_FIREBASE_API_KEY in client/.env for Cloud Firestore sync.");
}

export { auth, db, storage, googleProvider };

// Google Popup Login Helper
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return { user: null, error: "Firebase Auth is not initialized. Set VITE_FIREBASE_API_KEY in client/.env" };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    return { user: null, error: error.message };
  }
};

// Email / Password Signup Helper
export const signUpWithEmail = async (email, password, displayName) => {
  if (!auth) {
    return { user: null, error: "Firebase Auth is not initialized. Set VITE_FIREBASE_API_KEY in client/.env" };
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Firebase Signup Error:", error);
    return { user: null, error: error.message };
  }
};

// Email / Password Login Helper
export const loginWithEmail = async (email, password) => {
  if (!auth) {
    return { user: null, error: "Firebase Auth is not initialized. Set VITE_FIREBASE_API_KEY in client/.env" };
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    console.error("Firebase Login Error:", error);
    return { user: null, error: error.message };
  }
};

// Sign Out Helper
export const logoutFirebase = async () => {
  if (!auth) return { success: true };
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
