import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore/lite'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
  throw new Error(
    'Missing Firebase configuration. .env.local.example 을 참고해 Firebase Web App 환경 변수를 작성하세요.',
  )
}

const app = getApps().length > 0 ? getApp() : initializeApp(config)

export const db = getFirestore(app)
