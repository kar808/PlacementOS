import { useState } from "react";
import { signInWithPopup, AuthError } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

// Map Firebase auth error codes to human-readable messages.
function describeAuthError(err: unknown): string {
  const e = err as AuthError & { customData?: { email?: string } };
  const code = e?.code ?? "";
  switch (code) {
    case "auth/popup-closed-by-user":
      return "You closed the Google sign-in window before finishing.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/cancelled-popup-request":
      return "Another sign-in attempt is already in progress.";
    case "auth/network-request-failed":
      return "Network error — check your internet connection.";
    case "auth/account-exists-with-different-credential":
      return `An account already exists for ${e.customData?.email ?? "this email"} with a different sign-in method.`;
    case "auth/unauthorized-domain":
      return "This domain isn't authorized in Firebase Auth settings. Add it under Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is disabled for this project. Enable it in Firebase Console → Authentication → Sign-in method.";
    case "auth/invalid-api-key":
      return "The Firebase API key is invalid. Check firebase-applet-config.json.";
    case "auth/internal-error":
      return "Firebase reported an internal error. Try again in a moment.";
    default:
      return e?.message
        ? `${code ? `[${code}] ` : ""}${e.message}`
        : "Unknown sign-in error. Check the browser console for details.";
  }
}

export default function AuthScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Full error object goes to the console for debugging;
      // user sees a specific, actionable message.
      console.error("[AuthScreen] Google sign-in failed:", err);
      setError(describeAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <h1>Sign in to PlacementOS</h1>
      <button onClick={handleGoogleSignIn} disabled={loading}>
        {loading ? "Signing in…" : "Continue with Google"}
      </button>
      {error && (
        <div role="alert" className="auth-error" style={{ color: "#b00020", marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
