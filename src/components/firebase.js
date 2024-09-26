// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqkEHbPpooT8It9pMGi2TEurvVr5KsFcg",
  authDomain: "momentia-da146.firebaseapp.com",
  projectId: "momentia-da146",
  storageBucket: "momentia-da146.appspot.com",
  messagingSenderId: "686252183841",
  appId: "1:686252183841:web:d7b680956f3c4e07ff6e60",
  measurementId: "G-8P3ZNG36ZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Initialize Analytics

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app); // Initialize and export Firebase Storage

export default app;
