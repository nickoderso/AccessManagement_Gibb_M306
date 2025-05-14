import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyBU7IUORyjeohYeMzE3s3In1ycxuPKMfmw",
  authDomain: "accessmanagement-e4204.firebaseapp.com",
  projectId: "accessmanagement-e4204",
  storageBucket: "accessmanagement-e4204.firebasestorage.app",
  messagingSenderId: "30343490879",
  appId: "1:30343490879:web:0d6544ca75cb762a18778a",
}

// Firebase initialisieren
const app = initializeApp(firebaseConfig)

// Firestore und Auth exportieren
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
