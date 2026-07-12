import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signInWithPopup,
  AuthError 
} from "firebase/auth";
import { auth, db, googleProvider } from "../lib/firebase";
import { setDoc, getDoc, doc } from "firebase/firestore";
import { DEFAULT_STUDENT_PROFILE } from "../lib/defaultProfile";
import { Sparkles, Mail, Lock, AlertCircle, ShieldCheck, UserPlus, ArrowRight, CornerDownRight } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (uid: string) => void;
  onLocalBypass?: () => void;
}

export default function AuthScreen({ onAuthSuccess, onLocalBypass }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save default profile schema directly to Firestore under users/{uid}
        const initialProfile = {
          ...DEFAULT_STUDENT_PROFILE,
          name: email.split("@")[0],
        };
        await setDoc(doc(db, "users", userCredential.user.uid), initialProfile);
        onAuthSuccess(userCredential.user.uid);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user.uid);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      const authErr = err as AuthError;
      if (authErr.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please sign in instead.");
      } else if (authErr.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please verify your credentials.");
      } else if (authErr.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (authErr.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(authErr.message || "An authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Ensure default profile document is created if it does not exist
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        const initialProfile = {
          ...DEFAULT_STUDENT_PROFILE,
          name: userCredential.user.displayName || userCredential.user.email?.split("@")[0] || "New Student",
        };
        await setDoc(userDocRef, initialProfile);
      }
      onAuthSuccess(userCredential.user.uid);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      setError(err.message || "Failed to authenticate with Google OAuth.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      onAuthSuccess(userCredential.user.uid);
    } catch (err: any) {
      console.warn("Standard guest login failed, attempting automated sandboxed guest creation:", err);
      try {
        const randId = Math.floor(100000 + Math.random() * 900000);
        const guestEmail = `guest_${randId}@placementos.com`;
        const guestPassword = `PlacementOSGuest123!`;
        const userCredential = await createUserWithEmailAndPassword(auth, guestEmail, guestPassword);
        onAuthSuccess(userCredential.user.uid);
      } catch (fallbackErr: any) {
        console.error("Automated guest creation fallback failed:", fallbackErr);
        setError("Guest access is currently restricted. Please register using a standard email and password above.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex items-center justify-center p-4">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-md">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
            <Sparkles className="w-3 h-3 animate-pulse" /> PlacementOS Elite Co-Pilot
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isSignUp ? "Create Secure Account" : "Access Your Co-Pilot"}
          </h2>
          <p className="text-xs text-white/50 leading-relaxed">
            Gain full access to customized ATS optimization, roadmap tracking, interview simulators, and negotiation engines.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            ) : (
              <>
                {isSignUp ? "Sign Up Now" : "Sign In Securely"} <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center text-xs">
          <span className="text-white/40">
            {isSignUp ? "Already have an account?" : "Need personalized storage?"}{" "}
          </span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider font-mono">OR</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>

        {/* Google OAuth Option */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.61c-.29 1.5-.1.31-1.32 2.31v1.92h2.13c1.25-1.15 2.13-2.85 2.13-4.82z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.13-1.92c-.87.58-1.99.92-3.13.92-2.41 0-4.45-1.63-5.18-3.82H.87v2.41C2.85 20.35 7.15 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M6.82 14.19a7.11 7.11 0 0 1 0-2.38V9.4H.87a11.97 11.97 0 0 0 0 5.19l5.95-.4z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.15 0 2.85 3.65.87 7.75l5.95 2.41c.73-2.19 2.77-3.82 5.18-3.82z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Guest access option */}
        <button
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Continue with Guest Session</span>
          <CornerDownRight className="w-3.5 h-3.5 text-white/40" />
        </button>

        {/* Local Sandbox Bypass Escape Hatch */}
        {onLocalBypass && (
          <button
            type="button"
            onClick={onLocalBypass}
            className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Bypass Auth / Local Sandbox</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Privacy Note */}
        <div className="flex items-center gap-1.5 justify-center text-[10px] text-white/30 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
          <span>All profiles securely sandboxed on Firebase Firestore</span>
        </div>

      </div>
    </div>
  );
}
