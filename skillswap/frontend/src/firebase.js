import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDLe5nQ2IcE1LkLiTSgbXRK2onjLk7T7Ck",
  authDomain: "skillswap-2fae4.firebaseapp.com",
  projectId: "skillswap-2fae4",
  storageBucket: "skillswap-2fae4.firebasestorage.app",
  messagingSenderId: "847384295154",
  appId: "1:847384295154:web:8a19e8495e82564687026b",
  measurementId: "G-MQ38DSQ4ZC",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
