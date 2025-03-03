import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnZoAMTm_E24WmTEVJiQC9oYw-qT3JFhY",
  authDomain: "nafnapp.firebaseapp.com",
  projectId: "nafnapp",
  storageBucket: "nafnapp.appspot.com",
  messagingSenderId: "1099129929863",
  appId: "1:1099129929863:android:e099faa82ce3fc0378b822"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // Fallback to regular getAuth if there's an error with persistence
  console.warn("Failed to initialize auth with persistence, falling back to memory persistence", error);
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };