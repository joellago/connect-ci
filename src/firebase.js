import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-placeholder',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-placeholder',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-placeholder',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-placeholder',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'demo-placeholder',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-placeholder'
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'demo-placeholder');

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;

export const firebaseReady = Boolean(auth);

let confirmationResult = null;

export async function sendOtp(phoneNumber) {
  if (!firebaseReady || !auth) {
    return { ok: true, demoCode: '123456' };
  }

  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    });
  }

  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
  return { ok: true };
}

export async function verifyOtp(code) {
  if (!firebaseReady || !confirmationResult) {
    return code === '123456';
  }

  const result = await confirmationResult.confirm(code);
  return Boolean(result.user);
}
