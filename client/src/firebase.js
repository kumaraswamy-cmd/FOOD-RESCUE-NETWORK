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

// Live Firebase Configuration for food-rescue-network-8d050
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA1Ce720sDtHOHCCclcSn_4XkRNIV-1BKI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "food-rescue-network-8d050.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "food-rescue-network-8d050",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "food-rescue-network-8d050.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "613636160066",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:613636160066:web:bb48256739a3db66a00bdb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T3579DZELT"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Google Popup Login Helper
export const signInWithGoogle = async () => {
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
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
