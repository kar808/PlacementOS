import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: config.apiKey || (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: config.authDomain || (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: config.projectId || (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: config.storageBucket || (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.messagingSenderId || (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.appId || (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: config.measurementId || (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp, config.firestoreDatabaseId || (import.meta as any).env.VITE_FIREBASE_FIRESTORE_DB_ID || "(default)");
export const storage = getStorage(firebaseApp);

// Google provider, explicitly bound to the OAuth client ID from the config.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  // client_id ensures Firebase uses your specific OAuth 2.0 Web client,
  // not the auto-provisioned default. Required when the project has
  // multiple OAuth clients or a custom consent screen.
  client_id: config.oAuthClientId || (import.meta as any).env.VITE_FIREBASE_OAUTH_CLIENT_ID,
});
googleProvider.addScope("email");
googleProvider.addScope("profile");
