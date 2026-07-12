import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import config from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId || undefined,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
export const storage = getStorage(firebaseApp);

// Google provider, explicitly bound to the OAuth client ID from the config.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  // client_id ensures Firebase uses your specific OAuth 2.0 Web client,
  // not the auto-provisioned default. Required when the project has
  // multiple OAuth clients or a custom consent screen.
  client_id: config.oAuthClientId,
});
googleProvider.addScope("email");
googleProvider.addScope("profile");
