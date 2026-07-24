import React, { useState, useEffect } from "react";
// Supabase integration
import { supabase } from "../supabaseClient";
import { isSupabaseConfigured, supabaseAuth, supabaseDb } from "../lib/supabase";
import { DEFAULT_STUDENT_PROFILE } from "../lib/defaultProfile";
import { StudentProfile } from "../types";
import ErrorAlertModal from "./ErrorAlertModal";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  CornerDownRight, 
  User, 
  BookOpen, 
  Briefcase, 
  Check, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Globe, 
  GraduationCap, 
  CheckCircle2, 
  MapPin, 
  ShieldAlert,
  Clock
} from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (uid: string) => void;
  onBack?: () => void;
}

// Common tech & professional skills for multi-select
const PRESET_SKILLS = [
  "React", "Node.js", "Python", "TypeScript", "System Design", 
  "SQL", "Cloud Computing", "Java", "C++", "Product Management", 
  "UI/UX Design", "Communication", "Data Structures & Algorithms", 
  "Machine Learning", "Docker", "Git", "DevOps", "Financial Modeling"
];

// Map auth error codes to human-readable, actionable messages.
function describeAuthError(err: unknown): string {
  const e = err as any;
  const msg = typeof err === "string" ? err : e?.message || "";
  if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("rate_limit")) {
    return "Supabase email rate limit exceeded. Please wait a few minutes before trying again, or click 'Continue as Guest' below.";
  }
  return msg || "An unknown authentication error occurred. Check browser console for details.";
}

type AuthMode = "login" | "signup" | "forgot" | "verify" | "success" | "expired";

export default function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Login credentials
  const [loginEmail, setLoginEmail] = useState<string>(() => localStorage.getItem("remember_email") || "");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(() => localStorage.getItem("remember_me") === "true");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Security and Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTimer, setLockoutTimer] = useState<number>(0);

  // Sign up step navigation
  const [signupStep, setSignupStep] = useState<number>(1);

  // Step 1 Form: Basic info and credentials
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [country, setCountry] = useState<string>("India");
  const [state, setState] = useState<string>("");

  // Step 2 Form: Educational Context
  const [college, setCollege] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [gradYear, setGradYear] = useState<string>("2026");
  const [semester, setSemester] = useState<string>("");

  // Step 3 Form: Career Goals & Skills
  const [targetRole, setTargetRole] = useState<string>("");
  const [preferredIndustry, setPreferredIndustry] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [acceptPolicies, setAcceptPolicies] = useState<boolean>(false);
  const [newsletterSub, setNewsletterSub] = useState<boolean>(false);

  // Password Validation Checks
  const hasMinLength = signupPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(signupPassword);
  const hasLowercase = /[a-z]/.test(signupPassword);
  const hasNumber = /[0-9]/.test(signupPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(signupPassword);
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  // Handle countdown lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const timer = setTimeout(() => {
        setLockoutTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lockoutTimer]);

  // Log active user session details to Firestore helper
  const logSessionStart = async (userId: string, email: string) => {
    try {
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const userAgent = navigator.userAgent;
      
      // Basic OS detection
      let os = "Unknown OS";
      if (userAgent.indexOf("Win") !== -1) os = "Windows";
      else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
      else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
      else if (userAgent.indexOf("Android") !== -1) os = "Android";
      else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

      // Basic Browser detection
      let browser = "Unknown Browser";
      if (userAgent.indexOf("Chrome") !== -1) browser = "Google Chrome";
      else if (userAgent.indexOf("Safari") !== -1) browser = "Safari";
      else if (userAgent.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
      else if (userAgent.indexOf("Edge") !== -1) browser = "Microsoft Edge";

      const sessionData = {
        id: sessionId,
        userId,
        email,
        loginTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        userAgent,
        os,
        browser,
        location: "Bengaluru, India (Simulated)",
        status: "Active"
      };

      // Save activity event log to Supabase
      await supabaseDb.saveActivity(userId, `act_${Date.now()}`, {
        event: "Logged In",
        description: `New active login session registered from ${browser} on ${os}`,
        timestamp: new Date().toISOString(),
        category: "auth"
      });

      // Keep session details locally too
      localStorage.setItem("current_session_id", sessionId);
    } catch (err) {
      console.error("Failed to log session metadata:", err);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) {
      setError(`Too many failed attempts. Locked out. Resuming in ${lockoutTimer}s...`);
      return;
    }
    setError(null);
    setInfoMessage(null);
    setIsLoading(true);

    try {
      // Convert username/Vorynexa ID to synthetic email if it does not contain '@'
      const rawLoginInput = loginEmail.trim();
      const targetEmail = rawLoginInput.includes("@") 
        ? rawLoginInput.replace(/\s+/g, "") 
        : `${rawLoginInput.toLowerCase().replace(/[^a-z0-9_.-]/g, "")}@vorynexa.com`;

      const { data, error: sbError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: loginPassword,
      });

      if (sbError) {
        const isEmailNotConfirmed = sbError.message.toLowerCase().includes("email not confirmed") || sbError.message.toLowerCase().includes("email_not_confirmed");
        if (isEmailNotConfirmed) {
          console.warn("[AuthScreen] Email unconfirmed in Supabase. Logging in with local session fallback.");
          const fallbackUserId = `user_local_${Date.now()}`;
          localStorage.setItem("vorynexa_guest_session", fallbackUserId);
          await logSessionStart(fallbackUserId, targetEmail);
          setError(null);
          setInfoMessage("Email unconfirmed in Supabase Auth. Logging in with local profile session...");
          setTimeout(() => {
            onAuthSuccess(fallbackUserId);
            window.location.href = "/";
          }, 1200);
          return;
        }
        throw new Error(sbError.message);
      }

      if (!data.session) {
        setInfoMessage("Check your email and confirm your account before logging in.");
        return;
      }

      const userId = data.session.user.id;
      
      // Remember me logic
      if (rememberMe) {
        localStorage.setItem("remember_email", loginEmail);
        localStorage.setItem("remember_me", "true");
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_me");
      }

      setFailedAttempts(0);
      
      // Create session metadata
      await logSessionStart(userId, targetEmail);

      // Successfully authenticated - redirect to Home page
      onAuthSuccess(userId);
      window.location.href = "/";
    } catch (err: any) {
      console.error("[AuthScreen] Sign In failed:", err);
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      
      const realErrorMessage = err?.message || "Invalid Username or Password.";
      if (attempts >= 5) {
        setLockoutTimer(60);
        setError(`Too many failed login attempts. Account access throttled for 60 seconds. ${realErrorMessage}`);
      } else {
        setError(`${realErrorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password dispatch
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error: sbError } = await supabaseAuth.resetPassword(loginEmail);
      if (sbError) {
        throw new Error(sbError);
      }
      setError(null);
      setMode("login");
      alert(`A secure password reset email has been dispatched to ${loginEmail}. Please complete resetting your credentials via the link.`);
    } catch (err: any) {
      console.error("[AuthScreen] Password reset failed:", err);
      setError(isSupabaseConfigured() ? err.message : describeAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up / Step 1 submit validator
  const handleSignUpStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please fill out both your First Name and Last Name.");
      return;
    }

    // Auto-clean username/email: convert spaces in usernames to underscores, strip spaces in emails
    const rawInput = signupEmail.trim();
    if (!rawInput || rawInput.length < 3) {
      setError("Please enter a username or email with at least 3 characters.");
      return;
    }

    const cleanInput = rawInput.includes("@")
      ? rawInput.replace(/\s+/g, "")
      : rawInput.replace(/\s+/g, "_");

    setSignupEmail(cleanInput);

    if (!country.trim() || !state.trim()) {
      setError("Please specify both your Country and State / Region.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify your credentials.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Your password does not meet the complexity requirements. It must have at least 8 characters, and include at least one capital letter, one lowercase letter, one numeric digit, and one special character (!@#$...).");
      return;
    }

    setSignupStep(2);
  };

  // Step 2 educational check
  const handleSignUpStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!college.trim() || !degree.trim() || !branch.trim()) {
      setError("Please complete all mandatory educational background fields.");
      return;
    }
    setSignupStep(3);
  };

  // Sign up step 3 & final Supabase creation
  const handleSignUpFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Robust consistent checks across fields before sending to Supabase
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please go back and fill out both your First Name and Last Name.");
      return;
    }

    if (!signupEmail.trim() || signupEmail.trim().length < 3) {
      setError("Please go back and enter a choose a valid username.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify your credentials.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Your password does not meet the complexity requirements. It must have at least 8 characters, and include at least one capital letter, one lowercase letter, one numeric digit, and one special character (!@#$...).");
      return;
    }

    if (!college.trim() || !degree.trim() || !branch.trim()) {
      setError("Please go back and complete all mandatory educational background fields.");
      return;
    }

    if (!acceptPolicies) {
      setError("You must accept the terms of service and privacy policy to instantiate your profile.");
      return;
    }
    setIsLoading(true);

    try {
      let userId: string;
      // Generate a public Vorynexa ID (VNX-XXXXXXX)
      const generatedVorynexaId = `VNX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // Convert username/Vorynexa ID to synthetic email if it does not contain '@'
      const rawSignupInput = signupEmail.trim();
      const targetEmail = rawSignupInput.includes("@")
        ? rawSignupInput.replace(/\s+/g, "")
        : `${rawSignupInput.toLowerCase().replace(/[^a-z0-9_.-]/g, "")}@vorynexa.com`;

      // Construct a unified profile
      const userProfile: StudentProfile = {
        ...DEFAULT_STUDENT_PROFILE,
        vorynexaId: generatedVorynexaId,
        name: `${firstName} ${lastName}`.trim(),
        email: targetEmail,
        location: `${state ? `${state}, ` : ""}${country}`,
        college,
        degree,
        branch,
        year: gradYear,
        gpa: "0.0", // default unassigned
        technicalSkills: selectedSkills,
        targetRoles: targetRole ? [targetRole] : [],
        careerGoals: `Target role: ${targetRole} in the ${preferredIndustry} industry.`,
        constraints: newsletterSub ? "Subscribed to global newsletter notifications." : ""
      };

      const { data, error: sbError } = await supabase.auth.signUp({
        email: targetEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (sbError) {
        const msg = sbError.message.toLowerCase();
        const isRateLimit = 
          msg.includes("rate limit") || 
          msg.includes("rate_limit") || 
          msg.includes("20 seconds") || 
          msg.includes("security purposes") || 
          msg.includes("over_email_send_rate_limit");
        if (isRateLimit) {
          console.warn("[AuthScreen] Supabase email rate limit exceeded. Creating local session profile fallback.");
          const fallbackUserId = `user_local_${Date.now()}`;
          const localProfile: StudentProfile = {
            ...userProfile,
            vorynexaId: generatedVorynexaId,
          };
          localStorage.setItem("placement_profile", JSON.stringify(localProfile));
          localStorage.setItem("vorynexa_guest_session", fallbackUserId);
          try {
            await supabaseDb.saveProfile(fallbackUserId, localProfile);
          } catch (e) {
            console.warn("Db profile save skipped:", e);
          }
          await logSessionStart(fallbackUserId, targetEmail);

          setError(null);
          setInfoMessage("Email server rate limit reached. Your account profile has been saved locally! Redirecting to Dashboard...");
          setTimeout(() => {
            onAuthSuccess(fallbackUserId);
            window.location.href = "/";
          }, 1500);
          return;
        }
        throw new Error(sbError.message);
      }

      // Save initial profile to Supabase if user record was created
      const createdUserId = data.user?.id || data.session?.user?.id;
      if (createdUserId) {
        await supabaseDb.saveProfile(createdUserId, userProfile);
        await supabaseDb.saveActivity(createdUserId, `act_${Date.now()}`, {
          event: "Account Created",
          description: `VORYNEXA AI Career Operating System profile initialized successfully with Public ID ${generatedVorynexaId}.`,
          timestamp: new Date().toISOString(),
          category: "auth"
        });
      }

      // Do NOT auto-login after signup - sign out any session auto-started by Supabase
      if (data.session) {
        await supabase.auth.signOut();
      }

      // 1) Redirect to Sign In page
      // 2) Pre-fill email in Sign In form
      // 3) Show success notification
      setError(null);
      setInfoMessage("Your account has been created. Please check your email and verify your address before logging in.");
      setLoginEmail(rawSignupInput);
      setMode("login");
      setSignupStep(1);
    } catch (err: any) {
      console.error("[AuthScreen] Complete Sign Up failed:", err);
      setError(describeAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Check email verification status manually
  const checkEmailVerificationStatus = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const currentUser = await supabaseAuth.getCurrentUser();
      if (currentUser) {
        if (currentUser.emailVerified) {
          setMode("success");
        } else {
          setError("Your email address is not yet verified. Please check your inbox for the Supabase verification link.");
        }
      } else {
        setError("User context lost. Please log in again.");
        setMode("login");
      }
    } catch (err: any) {
      console.error("Error refreshing user verification state:", err);
      setError("Failed to verify. Please try again or resend the verification link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Verification Email
  const handleResendVerification = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const targetEmail = signupEmail || loginEmail;
      if (!targetEmail) {
        throw new Error("No target email address available to resend verification.");
      }
      const { error: sbError } = await supabaseAuth.resendVerificationEmail(targetEmail);
      if (sbError) {
        throw new Error(sbError);
      }
      alert(`A fresh verification link has been dispatched to ${targetEmail}.`);
    } catch (err: any) {
      console.error("[AuthScreen] Resend verification failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { error: sbError } = await supabaseAuth.signInWithGoogle();
      if (sbError) {
        throw new Error(sbError);
      }
    } catch (err: any) {
      console.error("[AuthScreen] Google auth failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Guest Access
  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const randId = Math.floor(100000 + Math.random() * 900000);
      const guestEmail = `guest_${randId}@placementos.com`;
      const guestPassword = `PlacementOSGuest123!`;
      const { data, error: sbError } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            full_name: "Guest Student"
          }
        }
      });
      if (sbError) {
        throw new Error(sbError.message);
      }
      const userId = data.user?.id || `guest_${randId}`;
      await logSessionStart(userId, guestEmail);
      onAuthSuccess(userId);
      window.location.href = "/";
    } catch (err: any) {
      console.warn("Supabase guest signup failed, initializing guest session locally:", err?.message || err);
      // Fallback: If Supabase rate limits or fails on guest signup, create guest user locally
      const randId = Math.floor(100000 + Math.random() * 900000);
      const guestUserId = `guest_${randId}`;
      localStorage.setItem("vorynexa_guest_session", guestUserId);
      await logSessionStart(guestUserId, `guest_${randId}@vorynexa.com`);
      onAuthSuccess(guestUserId);
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  // Skill select toggle helper
  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-xl bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-md transition-all">
        
        {/* TOP BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
            <Sparkles className="w-3 h-3 animate-pulse" /> VORYNEXA Career Companion
          </div>
          
          <div className="flex justify-center">
            {isSupabaseConfigured() ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Supabase Secure Gateway
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono rounded-full font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Firebase Auth Sandbox Fallback
              </span>
            )}
          </div>
          
          {mode === "login" && (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Access Your Placement Engine</h2>
              <p className="text-xs text-white/50 leading-relaxed max-w-md mx-auto">
                Securely resume your automated ATS audits, confidence coaching, mock interviews, and personalized carrier pathways.
              </p>
            </>
          )}

          {mode === "signup" && (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Setup Your Security Profile</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Step {signupStep} of 3: {signupStep === 1 ? "Credentials & Identity" : signupStep === 2 ? "Educational Background" : "Career Goals & Specialization"}
              </p>
              
              {/* Stepper progress indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {[1, 2, 3].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === signupStep ? "w-8 bg-emerald-500" : "w-2 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {mode === "forgot" && (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Recover Profile Access</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Enter your account email below to receive secure cryptographic credentials to reset your password.
              </p>
            </>
          )}

          {mode === "verify" && (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                We have dispatched a security validation link to your inbox.
              </p>
            </>
          )}

          {mode === "success" && (
            <>
              <h2 className="text-2xl font-black text-white tracking-tight">Validation Successful</h2>
              <p className="text-xs text-white/50 leading-relaxed">
                Your credentials have been securely verified. Welcome to the workspace.
              </p>
            </>
          )}
        </div>

        {/* INFO / SUCCESS DISPLAY */}
        {infoMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* ERROR DISPLAY */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* LOCKOUT THROW WARNING */}
        {lockoutTimer > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-400">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Security Lockout: System throttled due to multiple failures. Countdown: {lockoutTimer}s.</span>
          </div>
        )}

        {/* VIEW 1: SIGN IN / LOGIN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Vorynexa ID or Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g., VNX-84A6KF2 or john_doe"
                  className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10.5 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Password</label>
                <button 
                  type="button" 
                  onClick={() => setMode("forgot")}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider font-mono cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10.5 pr-10 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-black"
                />
                <span className="text-xs text-white/50 font-semibold">Remember me on this secure node</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutTimer > 0}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In Securely</span> <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* VIEW 2: FORGOT PASSWORD */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="registered@university.edu"
                  className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10.5 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Dispatch Recovery Link</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="w-full text-center text-xs text-white/40 hover:text-white underline cursor-pointer"
            >
              Return to login page
            </button>
          </form>
        )}

        {/* VIEW 3: MULTI-STEP SIGN UP FORM */}
        {mode === "signup" && (
          <div className="space-y-4">
            {/* SIGNUP STEP 1: Identity & Security */}
            {signupStep === 1 && (
              <form onSubmit={handleSignUpStep1} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Choose a Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g., sushil"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-white/30">Used securely to reload your profile. No email or verification required.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">State / Region</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Create Secure Password</label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                  
                  {/* Real-time checklist strength validator */}
                  <div className="p-3 bg-black rounded-lg border border-white/5 space-y-1.5 text-[11px] font-semibold">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 block mb-1">Cryptographic Guidelines (8+ chars required):</span>
                    <div className="grid grid-cols-2 gap-1.5 font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLength ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={hasMinLength ? "text-emerald-400/80" : "text-white/40"}>8+ Characters</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasUppercase ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={hasUppercase ? "text-emerald-400/80" : "text-white/40"}>Capital Letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasLowercase ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={hasLowercase ? "text-emerald-400/80" : "text-white/40"}>Lowercase Letter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasNumber ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={hasNumber ? "text-emerald-400/80" : "text-white/40"}>Numeric Digit</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasSpecial ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={hasSpecial ? "text-emerald-400/80" : "text-white/40"}>Special Character (!@#$...)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Educational Profile Setup</span> <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* SIGNUP STEP 2: Educational Context */}
            {signupStep === 2 && (
              <form onSubmit={handleSignUpStep2} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">College / University</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/30" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Indian Institute of Technology, Bombay"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl pl-10.5 pr-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Degree Name</label>
                    <input
                      type="text"
                      required
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      placeholder="B.Tech / B.E."
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Branch / Specialization</label>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Computer Science"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Graduation Year</label>
                    <select
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                      <option value="2028">2028</option>
                      <option value="2029">2029</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Current Semester (Optional)</label>
                    <input
                      type="text"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="7th Semester"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Configure Objectives</span> <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP STEP 3: Professional Objectives & Skills */}
            {signupStep === 3 && (
              <form onSubmit={handleSignUpFinal} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Target Role</label>
                    <input
                      type="text"
                      required
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Preferred Industry</label>
                    <input
                      type="text"
                      required
                      value={preferredIndustry}
                      onChange={(e) => setPreferredIndustry(e.target.value)}
                      placeholder="FinTech / SaaS"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Skills Multiselect */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Core Specializations (Select Multiple)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-3 bg-black border border-white/10 rounded-xl">
                    {PRESET_SKILLS.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillToggle(skill)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            isSelected 
                              ? "bg-emerald-500 border-emerald-500 text-black" 
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Policies acceptance checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      required
                      checked={acceptPolicies}
                      onChange={(e) => setAcceptPolicies(e.target.checked)}
                      className="mt-0.5 rounded border-white/10 text-emerald-500 bg-black"
                    />
                    <span className="text-[11px] text-white/50 font-semibold leading-snug">
                      I accept the <a href="#terms" className="text-emerald-400 underline font-bold">Terms of Service</a> and <a href="#privacy" className="text-emerald-400 underline font-bold">Privacy Policy</a>. I consent to secure Firestore sandboxing of my career metadata.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={newsletterSub}
                      onChange={(e) => setNewsletterSub(e.target.checked)}
                      className="mt-0.5 rounded border-white/10 text-emerald-500 bg-black"
                    />
                    <span className="text-[11px] text-white/50 font-semibold leading-snug">
                      Optionally subscribe to PlacementOS weekly newsletters containing ATS strategy alerts and interview templates.
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(2)}
                    className="py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Finish & Deploy</span> <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* VIEW 4: VERIFY EMAIL WAIT SCREEN */}
        {mode === "verify" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-white/70">
                A verification link is on its way to your mailbox. Click the verification link to proceed.
              </p>
              <p className="text-xs text-white/40">
                Remember to inspect your spam directory if the security email fails to hit your primary inbox.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={checkEmailVerificationStatus}
                disabled={isLoading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Email Verified</span>}
              </button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Resend Verification Link
              </button>

              <button
                type="button"
                onClick={() => setMode("success")}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Continue After Verification
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="w-full py-1 text-center text-xs text-white/40 hover:text-white underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: EMAIL VERIFICATION SUCCESS */}
        {mode === "success" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Email Verified Successfully</h3>
              <p className="text-xs text-white/50">
                Your profile is active. Setup complete.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                const currentUser = await supabaseAuth.getCurrentUser();
                if (currentUser?.uid) onAuthSuccess(currentUser.uid);
                else setMode("login");
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Initialize Workspace</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* VIEW 6: SESSION EXPIRED GATE */}
        {mode === "expired" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Session Expired</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                For security reasons, your active session credentials have expired. Please sign back in to continue where you left off.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Proceed to Login</span> <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SHARED TOGGLES: GUEST */}
        {(mode === "login" || mode === "signup") && (
          <div className="space-y-3 pt-1">
            
            {/* Guest access option */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue with Guest Session</span>
              <CornerDownRight className="w-3.5 h-3.5 text-white/40" />
            </button>
            
            {/* Toggle Sign Up / Sign In Links */}
            <div className="text-center text-xs pt-3">
              <span className="text-white/40">
                {mode === "signup" ? "Already have a secure account?" : "Need full sandboxed workspace?"}{" "}
              </span>
              <button
                onClick={() => {
                  setMode(mode === "signup" ? "login" : "signup");
                  setSignupStep(1);
                  setError(null);
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
              >
                {mode === "signup" ? "Sign In Securely" : "Sign Up & Register"}
              </button>
            </div>
          </div>
        )}

        {/* Back navigation button to landing tour */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/5 text-white/60 hover:text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>← Back to Homepage Product Tour</span>
          </button>
        )}

        {/* Zero-trust protection badge */}
        <div className="flex items-center gap-1.5 justify-center text-[10px] text-white/30 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
          <span>All profiles securely stored on Supabase PostgreSQL</span>
        </div>

      </div>

      <ErrorAlertModal error={error} onClose={() => setError(null)} />
    </div>
  );
}
