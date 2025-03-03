import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const auth = getAuth(app);
export const db = getFirestore(app);