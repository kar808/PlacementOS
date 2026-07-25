import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  IntelligenceMap,
  ReadinessScores,
  RecommendedRole,
  ResumeLinkedInSuggestion,
  RoadmapPlan,
  EnterpriseRoadmapParams,
  ProjectIdea,
  JobSearchStrategy,
  MockInterviewSession,
  PastInterviewSession,
  NegotiationAdvisorResponse,
  CommunicationTip,
  HRProfileAnalysis,
} from "./types";
import { DEFAULT_STUDENT_PROFILE } from "./lib/defaultProfile";
import { sanitizeUserInput } from "./lib/sanitizer";

// Supabase integration
import { supabase } from "./supabaseClient";
import { getSupabase, isSupabaseConfigured, supabaseAuth, supabaseDb, AdaptedUser } from "./lib/supabase";

// Import modular sub-components
import ProfileForm from "./components/ProfileForm";
import IntelligenceDashboard from "./components/IntelligenceDashboard";
import ResumeBuilder from "./components/ResumeBuilder";
import RoadmapView, { generateDefaultEnterpriseRoadmap } from "./components/RoadmapView";
import ProjectAdvisor from "./components/ProjectAdvisor";
import InterviewSimulator from "./components/InterviewSimulator";
import JobOutreach from "./components/JobOutreach";
import NegotiationCoach from "./components/NegotiationCoach";
import CommunicationCoach from "./components/CommunicationCoach";
import LandingPage from "./components/LandingPage";
import OnboardingWizard from "./components/OnboardingWizard";
import HRProfileRating from "./components/HRProfileRating";
import PlacementSchedule from "./components/PlacementSchedule";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import SettingsPanel from "./components/SettingsPanel";
import AppLoadingSpinner from "./components/AppLoadingSpinner";
import ErrorAlertModal from "./components/ErrorAlertModal";

// Lucide Icons
import {
  Sparkles,
  User,
  LayoutDashboard,
  FileText,
  Calendar,
  FolderGit,
  MessageSquare,
  Search,
  Scale,
  MessageCircleCode,
  ShieldAlert,
  Menu,
  X,
  TrendingUp,
  LogOut,
  RefreshCw,
  UserCheck,
  CalendarClock,
  Home,
  Activity,
  Settings,
  Zap,
  EyeOff,
  Sun,
  Moon
} from "lucide-react";

// Client-side rate-limiting rolling window tracking
const clientRequestHistory: { [userId: string]: number[] } = {};

import { getCanonicalString, computeRequestIntegrity } from "./lib/apiUtils";
import { startCall, endCall } from "./lib/apiMonitoring";

const GUEST_USER: AdaptedUser = {
  uid: "guest_sandbox_user",
  email: "candidate@vorynexa.com",
  displayName: "Vorynexa Candidate",
  emailVerified: true,
  isSupabase: false,
};

export default function App() {
  // Auth and Profile states
  const [user, setUser] = useState<AdaptedUser>({
    uid: localStorage.getItem("vorynexa_guest_session") || "candidate_active",
    email: "candidate@vorynexa.com",
    displayName: "Active Candidate",
    emailVerified: true,
    isSupabase: false,
  });
  const [showAuth, setShowAuth] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [hasProfile, setHasProfile] = useState<boolean>(true);

  // Online status and database sync states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncFailed, setSyncFailed] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Theme state (Dark/Light Mode)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("vorynexa_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("vorynexa_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // Core profile & cache states (persisted via localStorage)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("placement_profile");
    return saved ? JSON.parse(saved) : DEFAULT_STUDENT_PROFILE;
  });

  // Navigation Tabs: land directly on home if profile completed, otherwise landing
  const [activeTab, setActiveTab] = useState<string>(() => {
    const isCompleted = localStorage.getItem("placement_profile_completed") === "true";
    const savedProfile = localStorage.getItem("placement_profile");
    if (isCompleted || (savedProfile && JSON.parse(savedProfile).name?.trim() && JSON.parse(savedProfile).name !== "Student Candidate")) {
      return "home";
    }
    return "landing";
  });

  const isProfileCompleted = Boolean(
    localStorage.getItem("placement_profile_completed") === "true" ||
    (profile.name && profile.name.trim() !== "" && profile.name.trim() !== "Student Candidate" && profile.targetRoles?.length > 0)
  );

  const showWorkspaceNav = isProfileCompleted && activeTab !== "landing";
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [intelligenceMap, setIntelligenceMap] = useState<IntelligenceMap | null>(() => {
    const saved = localStorage.getItem("placement_intelligence");
    return saved ? JSON.parse(saved) : null;
  });

  const [scores, setScores] = useState<ReadinessScores | null>(() => {
    const saved = localStorage.getItem("placement_scores");
    return saved ? JSON.parse(saved) : null;
  });

  const [recommendedRoles, setRecommendedRoles] = useState<RecommendedRole[] | null>(() => {
    const saved = localStorage.getItem("placement_roles");
    return saved ? JSON.parse(saved) : null;
  });

  const [resumeSuggestions, setResumeSuggestions] = useState<ResumeLinkedInSuggestion | null>(() => {
    const saved = localStorage.getItem("placement_resume");
    return saved ? JSON.parse(saved) : null;
  });

  const [roadmapPlan, setRoadmapPlan] = useState<RoadmapPlan | null>(() => {
    const saved = localStorage.getItem("placement_roadmap");
    return saved ? JSON.parse(saved) : null;
  });

  const [recommendedProjects, setRecommendedProjects] = useState<ProjectIdea[] | null>(() => {
    const saved = localStorage.getItem("placement_projects");
    return saved ? JSON.parse(saved) : null;
  });

  const [jobStrategy, setJobStrategy] = useState<JobSearchStrategy | null>(() => {
    const saved = localStorage.getItem("placement_job_strategy");
    return saved ? JSON.parse(saved) : null;
  });

  const [negotiationAdvice, setNegotiationAdvice] = useState<NegotiationAdvisorResponse | null>(() => {
    const saved = localStorage.getItem("placement_negotiation");
    return saved ? JSON.parse(saved) : null;
  });

  const [communicationTips, setCommunicationTips] = useState<CommunicationTip[] | null>(() => {
    const saved = localStorage.getItem("placement_comm_tips");
    return saved ? JSON.parse(saved) : null;
  });

  const [hrAnalysis, setHrAnalysis] = useState<HRProfileAnalysis | null>(() => {
    const saved = localStorage.getItem("placement_hr_analysis");
    return saved ? JSON.parse(saved) : null;
  });

  // Interactive Mock Interview session (local state)
  const [interviewSession, setInterviewSession] = useState<MockInterviewSession>({
    questions: [],
    currentQuestionIndex: 0,
    chatHistory: [],
    status: "idle",
  });

  const [activeInterviewRole, setActiveInterviewRole] = useState<string>(() => {
    return localStorage.getItem("placement_active_interview_role") || "";
  });

  const [interviewHistory, setInterviewHistory] = useState<PastInterviewSession[]>(() => {
    const saved = localStorage.getItem("placement_interview_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Network operational states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isOptimizingResume, setIsOptimizingResume] = useState<boolean>(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [isDraftingProjects, setIsDraftingProjects] = useState<boolean>(false);
  const [isGeneratingJobStrategy, setIsGeneratingJobStrategy] = useState<boolean>(false);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState<boolean>(false);
  const [isEvaluatingInterview, setIsEvaluatingInterview] = useState<boolean>(false);
  const [isGeneratingNegotiation, setIsGeneratingNegotiation] = useState<boolean>(false);
  const [isGeneratingCommTips, setIsGeneratingCommTips] = useState<boolean>(false);

  // Global Error state (e.g. if API Key is missing or server fails)
  const [apiError, setApiError] = useState<string | null>(null);

  // Deep Work focus mode state
  const [isDeepWork, setIsDeepWork] = useState<boolean>(false);

  // Product Analytics Logging and Notifications state
  const [activities, setActivities] = useState<any[]>(() => {
    const saved = localStorage.getItem("placement_activities");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("placement_notifications");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "notif_1",
        title: "Welcome to VORYNEXA Core!",
        body: "Your secure cloud sandboxed student profile has been mounted successfully.",
        timestamp: "09:00 AM",
        read: false
      },
      {
        id: "notif_2",
        title: "Google Google Sign-In Activated",
        body: "Federated login active. All session metadata are sealed behind your UID credentials.",
        timestamp: "09:02 AM",
        read: true
      }
    ];
  });

  const addNotification = (title: string, body: string) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      localStorage.setItem("placement_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const logActivity = async (event: string, description: string, category = "general") => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isoString = new Date().toISOString();
    
    const newActivity = {
      id: `act_${Date.now()}`,
      event,
      description,
      timestamp,
      category
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev];
      localStorage.setItem("placement_activities", JSON.stringify(updated));
      return updated;
    });

    const currentUserId = user?.uid;
    if (currentUserId && currentUserId !== "local_sandbox_user") {
      try {
        await supabaseDb.saveActivity(currentUserId, newActivity.id, {
          event,
          description,
          timestamp: isoString,
          category
        });
      } catch (err) {
        console.error("Failed to sync activity to database:", err);
      }
    }
  };

  // Listen to Online / Offline window states
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen to Auth state with getSession() to protect private pages
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async (uid: string) => {
      try {
        const savedProfile = await supabaseDb.getProfile(uid);
        if (savedProfile && isMounted) {
          setProfile(savedProfile);
          setHasProfile(true);

          const intelligenceData = await supabaseDb.getAnalytics(uid, "intelligence");
          if (intelligenceData && isMounted) setIntelligenceMap(intelligenceData);

          const scoresData = await supabaseDb.getAnalytics(uid, "scores");
          if (scoresData && isMounted) setScores(scoresData);

          const rolesData = await supabaseDb.getAnalytics(uid, "roles");
          if (rolesData?.list && isMounted) setRecommendedRoles(rolesData.list);

          const hrData = await supabaseDb.getAnalytics(uid, "hrAnalysis");
          if (hrData && isMounted) setHrAnalysis(hrData);

          try {
            const history = await supabaseDb.getInterviews(uid);
            if (history.length > 0 && isMounted) {
              setInterviewHistory(history);
              localStorage.setItem("placement_interview_history", JSON.stringify(history));
            }
          } catch (err) {
            console.error("Error reading interviews from Supabase:", err);
          }

          try {
            const historyList = await supabaseDb.getActivities(uid);
            if (historyList.length > 0 && isMounted) {
              setActivities(historyList);
              localStorage.setItem("placement_activities", JSON.stringify(historyList));
            }
          } catch (err) {
            console.error("Error reading activity log from Supabase:", err);
          }
        } else if (isMounted) {
          setHasProfile(true);
        }
      } catch (error: any) {
        console.error("Supabase read error:", error);
        if (isMounted) setHasProfile(true);
      }
    };

    const checkSessionAndProtectPages = async () => {
      try {
        let guestSessionId = localStorage.getItem("vorynexa_guest_session");
        if (!guestSessionId) {
          guestSessionId = `candidate_${Date.now().toString(36)}`;
          localStorage.setItem("vorynexa_guest_session", guestSessionId);
        }
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const activeUser: AdaptedUser = {
            uid: session.user.id,
            email: session.user.email || null,
            displayName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            emailVerified: true,
            isSupabase: true,
          };
          if (isMounted) {
            setUser(activeUser);
            setShowAuth(false);
          }
          await loadUserData(activeUser.uid);
        } else {
          const activeUser: AdaptedUser = {
            uid: guestSessionId,
            email: `${guestSessionId}@vorynexa.com`,
            displayName: "Active Candidate",
            emailVerified: true,
            isSupabase: false,
          };
          if (isMounted) {
            setUser(activeUser);
            setShowAuth(false);
          }
          await loadUserData(activeUser.uid);
        }
      } catch (err) {
        console.error("Error in checkSessionAndProtectPages:", err);
        let guestSessionId = localStorage.getItem("vorynexa_guest_session");
        if (!guestSessionId) {
          guestSessionId = `candidate_${Date.now().toString(36)}`;
          localStorage.setItem("vorynexa_guest_session", guestSessionId);
        }
        const activeUser: AdaptedUser = {
          uid: guestSessionId,
          email: `${guestSessionId}@vorynexa.com`,
          displayName: "Active Candidate",
          emailVerified: true,
          isSupabase: false,
        };
        if (isMounted) {
          setUser(activeUser);
          setShowAuth(false);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    checkSessionAndProtectPages();

    // Listen to Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const activeUser: AdaptedUser = {
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          emailVerified: true,
          isSupabase: true,
        };
        setUser(activeUser);
        setShowAuth(false);
        loadUserData(activeUser.uid);
      } else {
        let guestSessionId = localStorage.getItem("vorynexa_guest_session");
        if (!guestSessionId) {
          guestSessionId = `candidate_${Date.now().toString(36)}`;
          localStorage.setItem("vorynexa_guest_session", guestSessionId);
        }
        const activeUser: AdaptedUser = {
          uid: guestSessionId,
          email: `${guestSessionId}@vorynexa.com`,
          displayName: "Active Candidate",
          emailVerified: true,
          isSupabase: false,
        };
        setUser(activeUser);
        setShowAuth(false);
        loadUserData(activeUser.uid);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sync profile edits with local cache and Supabase
  const saveProfileUpdate = async (updated: StudentProfile) => {
    setProfile(updated);
    localStorage.setItem("placement_profile", JSON.stringify(updated));
    if (user) {
      try {
        const success = await supabaseDb.saveProfile(user.uid, updated);
        if (!success) throw new Error("Supabase write failed");
        setSyncFailed(false);
      } catch (err) {
        console.error("Profile sync error:", err);
        setSyncFailed(true);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("SignOut error:", err);
    }
    // Clear all localStorage and state variables
    localStorage.removeItem("vorynexa_guest_session");
    localStorage.removeItem("placement_profile");
    localStorage.removeItem("placement_intelligence");
    localStorage.removeItem("placement_scores");
    localStorage.removeItem("placement_roles");
    localStorage.removeItem("placement_hr_analysis");
    localStorage.removeItem("placement_resume");
    localStorage.removeItem("placement_roadmap");
    localStorage.removeItem("placement_projects");
    localStorage.removeItem("placement_job_strategy");
    localStorage.removeItem("placement_negotiation");
    localStorage.removeItem("placement_comm_tips");
    localStorage.removeItem("placement_interview_history");
    localStorage.removeItem("placement_active_interview_role");
    
    const newSessionId = `candidate_${Date.now().toString(36)}`;
    localStorage.setItem("vorynexa_guest_session", newSessionId);
    setUser({
      uid: newSessionId,
      email: `${newSessionId}@vorynexa.com`,
      displayName: "Active Candidate",
      emailVerified: true,
      isSupabase: false,
    });
    setShowAuth(false);
    if (window.location.pathname === "/login") {
      window.history.pushState({}, "", "/");
    }
    setProfile(DEFAULT_STUDENT_PROFILE);
    setHasProfile(true);
    setIntelligenceMap(null);
    setScores(null);
    setRecommendedRoles(null);
    setResumeSuggestions(null);
    setRoadmapPlan(null);
    setRecommendedProjects(null);
    setJobStrategy(null);
    setNegotiationAdvice(null);
    setCommunicationTips(null);
    setHrAnalysis(null);
    setInterviewHistory([]);
    setActiveInterviewRole("");
    setActiveTab("home");
  };

  const handleOnboardingComplete = async (completedProfile: StudentProfile) => {
    setProfile(completedProfile);
    setHasProfile(true);
    localStorage.setItem("placement_profile", JSON.stringify(completedProfile));
    
    if (user && user.uid !== "local_sandbox_user") {
      try {
        const success = await supabaseDb.saveProfile(user.uid, completedProfile);
        if (!success) throw new Error("Supabase write failed");
        setSyncFailed(false);
      } catch (err) {
        console.error("Save onboarding error:", err);
        setSyncFailed(true);
      }
    }
    await runCoreAudit(completedProfile);
  };

  // Manual retry synchronization handler
  const handleSyncRetry = async () => {
    if (!user || user.uid === "local_sandbox_user") return;
    setIsSyncing(true);
    try {
      await supabaseDb.saveProfile(user.uid, profile);
      if (intelligenceMap) {
        await supabaseDb.saveAnalytics(user.uid, "intelligence", intelligenceMap);
      }
      if (scores) {
        await supabaseDb.saveAnalytics(user.uid, "scores", scores);
      }
      if (recommendedRoles) {
        await supabaseDb.saveAnalytics(user.uid, "roles", { list: recommendedRoles });
      }
      if (hrAnalysis) {
        await supabaseDb.saveAnalytics(user.uid, "hrAnalysis", hrAnalysis);
      }
      setSyncFailed(false);
    } catch (err) {
      console.error("Manual sync retry failed:", err);
      setSyncFailed(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveHrAnalysis = async (analysisData: HRProfileAnalysis) => {
    setHrAnalysis(analysisData);
    localStorage.setItem("placement_hr_analysis", JSON.stringify(analysisData));
    if (user && user.uid !== "local_sandbox_user") {
      try {
        const success = await supabaseDb.saveAnalytics(user.uid, "hrAnalysis", analysisData);
        if (!success) throw new Error("Supabase write failed");
        setSyncFailed(false);
      } catch (err) {
        console.error("HR analysis sync error:", err);
        setSyncFailed(true);
      }
    }
  };

  // Unified endpoint executor helper with Supabase JWT verification header, request integrity and client-side rate limiting
  const callServerEndpoint = async (endpoint: string, body: any) => {
    setApiError(null);
    const sanitizedBody = sanitizeUserInput(body);
    const userId = user?.uid || "sandbox-user";
    const monitorStartTime = startCall(endpoint);

    // 1. Client-Side Rate-Limiting Protection (sliding 60-second window, max 25 requests per user)
    const now = Date.now();
    if (!clientRequestHistory[userId]) {
      clientRequestHistory[userId] = [];
    }
    clientRequestHistory[userId] = clientRequestHistory[userId].filter(ts => now - ts < 60000);
    if (clientRequestHistory[userId].length >= 25) {
      const errorMsg = "Client rate limit protection: Too many requests. Please wait a moment before trying again to prevent server overload.";
      setApiError(errorMsg);
      endCall(endpoint, monitorStartTime, false);
      throw new Error(errorMsg);
    }
    clientRequestHistory[userId].push(now);

    let response: Response | null = null;
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const supabase = getSupabase();
      const { data: { session } } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      if (session) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      } else {
        headers["Authorization"] = `Bearer sandbox-token-123456`;
      }

      // 2. Compute dynamic request integrity signature and timestamp
      const integrityTimestamp = Date.now();
      const integritySignature = computeRequestIntegrity(endpoint, sanitizedBody, integrityTimestamp, userId);
      headers["X-Request-Timestamp"] = String(integrityTimestamp);
      headers["X-Request-Integrity"] = integritySignature;
      headers["X-Request-Client-Id"] = userId;

      response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(sanitizedBody),
      });

      const rawText = await response.text();
      let data: any = null;

      if (rawText && rawText.trim() !== "") {
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        }
        try {
          data = JSON.parse(cleanedText);
        } catch (e) {
          // Attempt extracting JSON object from string if embedded
          const match = cleanedText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (match) {
            try {
              data = JSON.parse(match[1]);
            } catch (e2) {}
          }
        }
      }

      if (data) {
        if (!response.ok || data.error) {
          throw new Error(data.message || data.error || `Endpoint operation failed with status ${response.status}`);
        }
        endCall(endpoint, monitorStartTime, true);
        return data;
      }

      // Handle cases where body is not JSON
      const snippet = rawText ? rawText.trim().substring(0, 300) : "Empty response body";
      const isHtml = snippet.startsWith("<!DOCTYPE") || snippet.startsWith("<html") || snippet.includes("<body");
      
      if (isHtml) {
        throw new Error(`Server returned an HTML error page (Status ${response.status}). Please try again.`);
      } else if (!response.ok) {
        throw new Error(`Server error (Status ${response.status}): ${snippet}`);
      } else {
        throw new Error(`Unexpected server response format: ${snippet}`);
      }
      
      endCall(endpoint, monitorStartTime, true);
      return data;

    } catch (err: any) {
      endCall(endpoint, monitorStartTime, false);
      console.error(`Error fetching ${endpoint}:`, err);
      const errMsg = err.message || "Failed to contact the career analysis server. Please ensure the backend is running and your GEMINI_API_KEY is active.";
      setApiError(errMsg);

      // Log fatal errors to database for debugging
      const currentUserId = user?.uid;
      if (currentUserId && currentUserId !== "local_sandbox_user") {
        try {
          const logPayload = {
            endpoint,
            payload: body || null,
            timestamp: new Date().toISOString(),
            errorStatus: response?.status || null,
            errorMessage: errMsg,
          };
          await supabaseDb.saveSystemLog({
            level: "error",
            category: "endpoint_failure",
            message: `Endpoint ${endpoint} failed: ${errMsg}`,
            details: logPayload,
            userId: currentUserId
          });
        } catch (dbErr) {
          console.error("Failed to sync errorLog to database:", dbErr);
        }
      }

      throw err;
    }
  };

  // 1. Run core placement audit (Intelligence Map + Scores + Roles)
  const runCoreAudit = async (customProfile?: StudentProfile) => {
    setIsAnalyzing(true);
    try {
      const targetProfile = customProfile || profile;
      const data = await callServerEndpoint("/api/placement/analyze", targetProfile);

      setIntelligenceMap(data.intelligenceMap);
      setScores(data.scores);
      setRecommendedRoles(data.recommendedRoles);

      localStorage.setItem("placement_intelligence", JSON.stringify(data.intelligenceMap));
      localStorage.setItem("placement_scores", JSON.stringify(data.scores));
      localStorage.setItem("placement_roles", JSON.stringify(data.recommendedRoles));

      if (user && user.uid !== "local_sandbox_user") {
        try {
          await supabaseDb.saveAnalytics(user.uid, "intelligence", data.intelligenceMap);
          await supabaseDb.saveAnalytics(user.uid, "scores", data.scores);
          await supabaseDb.saveAnalytics(user.uid, "roles", { list: data.recommendedRoles });
          setSyncFailed(false);
        } catch (dbErr) {
          console.error("Database audit sync error:", dbErr);
          setSyncFailed(true);
        }
      }

      // Successfully processed, head to intelligence dashboard
      setActiveTab("dashboard");
    } catch (err) {
      // Handled globally
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save profile and trigger audit
  const handleSaveProfile = async (updated: StudentProfile) => {
    await saveProfileUpdate(updated);
    localStorage.setItem("placement_profile_completed", "true");
    setActiveTab("home");
    await runCoreAudit(updated);
  };

  // 2. Optimize Resume & LinkedIn
  const handleOptimizeResume = async (jobDescription: string) => {
    setIsOptimizingResume(true);
    try {
      const data = await callServerEndpoint("/api/placement/resume-optimize", {
        profile,
        jobDescription,
      });
      setResumeSuggestions(data);
      localStorage.setItem("placement_resume", JSON.stringify(data));
    } catch (err) {
      // Handled globally
    } finally {
      setIsOptimizingResume(false);
    }
  };

  // 3. Generate Skill Gaps Roadmap
  const handleGenerateRoadmap = async (customParams?: EnterpriseRoadmapParams) => {
    setIsGeneratingRoadmap(true);
    try {
      const payload = customParams ? { profile, ...customParams } : profile;
      const data = await callServerEndpoint("/api/placement/roadmap", payload);
      setRoadmapPlan(data);
      localStorage.setItem("placement_roadmap", JSON.stringify(data));
      logActivity("Enterprise AI Career Roadmap Generated", `Computed 4-stage execution matrix for ${customParams?.targetRole || profile.targetRoles?.[0] || "Target Role"}.`, "career_plan");
      addNotification("Enterprise Career Roadmap Ready", "Your personalized 4-stage execution matrix and diagnostic skill gaps have been computed.");
    } catch (err) {
      console.error("Roadmap generation error:", err);
      // Fallback local generation so UI never breaks
      const fallbackRoadmap = {
        plan7Day: [],
        plan30Day: [],
        plan90Day: [],
        enterpriseRoadmap: generateDefaultEnterpriseRoadmap(profile, customParams)
      };
      setRoadmapPlan(fallbackRoadmap);
      localStorage.setItem("placement_roadmap", JSON.stringify(fallbackRoadmap));
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // 4. Recommend Projects
  const handleGenerateProjects = async (targetRole: string) => {
    setIsDraftingProjects(true);
    try {
      const data = await callServerEndpoint("/api/placement/projects", {
        profile,
        targetRole,
      });
      setRecommendedProjects(data);
      localStorage.setItem("placement_projects", JSON.stringify(data));
    } catch (err) {
      // Handled globally
    } finally {
      setIsDraftingProjects(false);
    }
  };

  // 5. Map Search & Outreach Strategy
  const handleGenerateJobStrategy = async () => {
    setIsGeneratingJobStrategy(true);
    try {
      const data = await callServerEndpoint("/api/placement/job-search", profile);
      setJobStrategy(data);
      localStorage.setItem("placement_job_strategy", JSON.stringify(data));
    } catch (err) {
      // Handled globally
    } finally {
      setIsGeneratingJobStrategy(false);
    }
  };

  // 6. Generate mock interview questions
  const handleGenerateInterviewQuestions = async (
    role: string,
    interviewType: string = "Technical",
    experienceLevel: string = "Experienced Professional",
    domain: string = "Software Engineering",
    questionCount: number = 3
  ) => {
    setIsGeneratingInterview(true);
    try {
      const excludeQuestions = [
        ...interviewSession.questions.map((q) => q.question),
        ...interviewHistory.flatMap((h) => h.questionsAndAnswers.map((qa) => qa.question))
      ];

      const pastSessions = interviewHistory || [];
      const performanceTrends = {
        totalSessions: pastSessions.length,
        averageOverallScore: pastSessions.length > 0 
          ? Math.round(pastSessions.reduce((sum, s) => sum + s.overallScore, 0) / pastSessions.length)
          : null,
        suggestedDifficulty: "Intermediate"
      };

      if (performanceTrends.averageOverallScore !== null) {
        if (performanceTrends.averageOverallScore < 65) {
          performanceTrends.suggestedDifficulty = "Beginner";
        } else if (performanceTrends.averageOverallScore > 82) {
          performanceTrends.suggestedDifficulty = "Advanced";
        }
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const previousSessionIds = pastSessions.map(h => h.id);

      const data = await callServerEndpoint("/api/placement/interview/questions", {
        profile,
        role,
        interviewType,
        experienceLevel,
        domain,
        questionCount,
        excludeQuestions,
        sessionContext: {
          sessionId,
          previousSessionIds,
        },
        performanceTrends,
        seed: Math.floor(Math.random() * 1000000)
      });
      setActiveInterviewRole(role);
      localStorage.setItem("placement_active_interview_role", role);
      setInterviewSession({
        questions: data,
        currentQuestionIndex: 0,
        chatHistory: [],
        status: "ongoing",
        category: interviewType,
        experienceLevel,
        domain,
        role,
      });
    } catch (err) {
      // Handled globally
    } finally {
      setIsGeneratingInterview(false);
    }
  };

  // 7. Evaluate mock interview answers
  const handleEvaluateInterviewAnswer = async (
    question: string,
    answer: string,
    type: string,
    focus: string,
    verbalMetrics?: any,
    interviewType?: string,
    experienceLevel?: string,
    domain?: string
  ) => {
    setIsEvaluatingInterview(true);
    try {
      const data = await callServerEndpoint("/api/placement/interview/evaluate", {
        question,
        answer,
        type,
        expectedFocus: focus,
        verbalMetrics,
        interviewType,
        experienceLevel,
        domain,
      });

      const dimensions = {
        communication: data.communication ?? data.communicationClarity ?? 75,
        technicalAccuracy: data.technicalAccuracy ?? data.technicalDepth ?? 75,
        confidence: data.confidence ?? 75,
        grammar: data.grammar ?? 75,
        professionalism: data.professionalism ?? 75,
        problemSolving: data.problemSolving ?? 75,
        depthOfKnowledge: data.depthOfKnowledge ?? 75,
        behaviour: data.behaviour ?? 75,
      };

      setInterviewSession((prev) => ({
        ...prev,
        chatHistory: [
          ...prev.chatHistory,
          {
            role: "student",
            text: answer,
            score: data.score,
            feedback: data.feedback,
            suggestedStarAnswer: data.suggestedStarAnswer,
            dimensions,
            technicalDepth: dimensions.technicalAccuracy,
            communicationClarity: dimensions.communication,
            confidence: dimensions.confidence,
            grammar: dimensions.grammar,
            professionalism: dimensions.professionalism,
            problemSolving: dimensions.problemSolving,
            depthOfKnowledge: dimensions.depthOfKnowledge,
            behaviour: dimensions.behaviour,
            hesitationDuration: verbalMetrics?.hesitationDuration || 0,
            wordsPerMinute: verbalMetrics?.wordsPerMinute || 0,
            totalFillerCount: verbalMetrics?.totalFillerCount || 0,
            audioUrl: verbalMetrics?.audioUrl || undefined,
          },
        ],
      }));
    } catch (err) {
      // Handled globally
    } finally {
      setIsEvaluatingInterview(false);
    }
  };

  const saveInterviewToHistory = async (completedSession: MockInterviewSession) => {
    const studentAnswers = completedSession.chatHistory.filter(
      (item) => item.role === "student" && item.score !== undefined
    );
    if (studentAnswers.length === 0) return;

    const count = studentAnswers.length;

    const overallScore = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.score || 0), 0) / count
    );

    const communication = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.communication ?? item.communicationClarity ?? 75), 0) / count
    );
    const technicalAccuracy = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.technicalAccuracy ?? item.technicalDepth ?? 75), 0) / count
    );
    const confidence = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.confidence ?? item.confidence ?? 75), 0) / count
    );
    const grammar = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.grammar ?? item.grammar ?? 75), 0) / count
    );
    const professionalism = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.professionalism ?? item.professionalism ?? 75), 0) / count
    );
    const problemSolving = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.problemSolving ?? item.problemSolving ?? 75), 0) / count
    );
    const depthOfKnowledge = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.depthOfKnowledge ?? item.depthOfKnowledge ?? 75), 0) / count
    );
    const behaviour = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.dimensions?.behaviour ?? item.behaviour ?? 75), 0) / count
    );

    const averageHesitationDuration = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.hesitationDuration || 0), 0) / count
    );
    const averageWordsPerMinute = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.wordsPerMinute || 0), 0) / count
    );
    const totalFillerCount = studentAnswers.reduce((sum, item) => sum + (item.totalFillerCount || 0), 0);

    const questionsAndAnswers = completedSession.questions.map((q, idx) => {
      const ans = studentAnswers[idx];
      const dims = ans?.dimensions || {
        communication: ans?.communicationClarity || 75,
        technicalAccuracy: ans?.technicalDepth || 75,
        confidence: ans?.confidence || 75,
        grammar: 75,
        professionalism: 75,
        problemSolving: 75,
        depthOfKnowledge: ans?.technicalDepth || 75,
        behaviour: 75
      };

      return {
        question: q.question,
        answer: ans?.text || "No response.",
        feedback: ans?.feedback || "No feedback generated.",
        score: ans?.score || 0,
        suggestedStarAnswer: ans?.suggestedStarAnswer || "",
        type: q.type,
        audioUrl: ans?.audioUrl || undefined,
        dimensions: dims,
        metrics: {
          communication: dims.communication,
          technicalAccuracy: dims.technicalAccuracy,
          confidence: dims.confidence,
          grammar: dims.grammar,
          professionalism: dims.professionalism,
          problemSolving: dims.problemSolving,
          depthOfKnowledge: dims.depthOfKnowledge,
          behaviour: dims.behaviour,
          technicalDepth: dims.technicalAccuracy,
          communicationClarity: dims.communication,
          hesitationDuration: ans?.hesitationDuration || 0,
          wordsPerMinute: ans?.wordsPerMinute || 0,
          totalFillerCount: ans?.totalFillerCount || 0,
        },
      };
    });

    const pastSession: PastInterviewSession = {
      id: `interview_${Date.now()}`,
      role: activeInterviewRole || completedSession.role || "Target Role",
      category: completedSession.category || "Technical",
      experienceLevel: completedSession.experienceLevel || "Experienced Professional",
      domain: completedSession.domain || "Software Engineering",
      timestamp: new Date().toISOString(),
      overallScore,
      hiringRecommendation: completedSession.hiringRecommendation || (overallScore >= 80 ? "Strongly Recommend Hire" : overallScore >= 65 ? "Hire with Coaching" : "Needs Improvement"),
      metrics: {
        communication,
        technicalAccuracy,
        confidence,
        grammar,
        professionalism,
        problemSolving,
        depthOfKnowledge,
        behaviour,
        technicalDepth: technicalAccuracy,
        communicationClarity: communication,
        averageHesitationDuration,
        averageWordsPerMinute,
        totalFillerCount,
      },
      questionsAndAnswers,
    };

    const newHistory = [pastSession, ...interviewHistory];
    setInterviewHistory(newHistory);
    localStorage.setItem("placement_interview_history", JSON.stringify(newHistory));

    if (user && user.uid !== "local_sandbox_user") {
      try {
        await supabaseDb.saveInterview(user.uid, pastSession.id, pastSession);
      } catch (err) {
        console.error("Save interview history error:", err);
      }
    }
  };

  const handleNextInterviewQuestion = () => {
    if (interviewSession.status === "completed") {
      setInterviewSession({
        questions: [],
        currentQuestionIndex: 0,
        chatHistory: [],
        status: "idle",
      });
      return;
    }

    if (interviewSession.currentQuestionIndex < interviewSession.questions.length - 1) {
      setInterviewSession((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      const completedSession = {
        ...interviewSession,
        status: "completed" as const,
      };
      setInterviewSession(completedSession);
      saveInterviewToHistory(completedSession);
    }
  };

  const handleResetInterview = () => {
    setInterviewSession({
      questions: [],
      currentQuestionIndex: 0,
      chatHistory: [],
      status: "idle",
    });
  };

  // 8. Generate Salary Negotiation
  const handleGenerateNegotiation = async (offer: string, company: string, expectations: string) => {
    setIsGeneratingNegotiation(true);
    try {
      const data = await callServerEndpoint("/api/placement/negotiate", {
        currentOffer: offer,
        targetCompany: company,
        expectations,
      });
      setNegotiationAdvice(data);
      localStorage.setItem("placement_negotiation", JSON.stringify(data));
    } catch (err) {
      // Handled globally
    } finally {
      setIsGeneratingNegotiation(false);
    }
  };

  // 9. Generate Confidence & Speech Drills
  const handleGenerateCommTips = async () => {
    setIsGeneratingCommTips(true);
    try {
      const data = await callServerEndpoint("/api/placement/communication-tips", profile);
      setCommunicationTips(data);
      localStorage.setItem("placement_comm_tips", JSON.stringify(data));
    } catch (err) {
      // Handled globally
    } finally {
      setIsGeneratingCommTips(false);
    }
  };

  // Route to specific section from sub-components
  const handleNavigateToSection = (section: string) => {
    setActiveTab(section);
    // If navigating to roadmap, make sure it is generated
    if (section === "roadmap" && !roadmapPlan) {
      handleGenerateRoadmap();
    }
    // If navigating to outreach, make sure it is generated
    if (section === "outreach" && !jobStrategy) {
      handleGenerateJobStrategy();
    }
    // If navigating to communication, make sure tips are generated
    if (section === "communication" && !communicationTips) {
      handleGenerateCommTips();
    }
  };

  // Left sidebar tabs array
  const navigationTabs = [
    { id: "home", name: "User Dashboard", icon: Home },
    { id: "blueprint", name: "Student Profile", icon: User },
    { id: "dashboard", name: "Placement Audit", icon: LayoutDashboard },
    { id: "resume", name: "Resume & LinkedIn", icon: FileText },
    { id: "hr-rating", name: "HR Socials Rating", icon: UserCheck },
    { id: "roadmap", name: "Roadmap & Gaps", icon: Calendar },
    { id: "schedule", name: "Placement Schedule", icon: CalendarClock },
    { id: "projects", name: "Project Advisor", icon: FolderGit },
    { id: "interview", name: "Mock Interview", icon: MessageSquare },
    { id: "outreach", name: "Job Strategy", icon: Search },
    { id: "negotiate", name: "Offer & Negotiation", icon: Scale },
    { id: "communication", name: "Confidence Coach", icon: MessageCircleCode },
    { id: "landing", name: "Platform Overview", icon: Sparkles },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  if (authLoading) {
    return <AppLoadingSpinner phase="auth" />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex flex-col font-sans p-3 sm:p-5 gap-4">
      {/* Top Header */}
      <header className="bg-[#111] border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white px-2.5 py-1 font-black text-xs rounded tracking-wider shadow-md">
            VX
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5 font-mono">
              VORYNEXA
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                AI Co-Pilot
              </span>
            </h1>
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">Employability Optimizer & Campaign Engine</p>
          </div>
        </div>

        {/* Global summary badge & Auth state */}
        <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-white/60">
          {/* Theme Toggle Button */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {isProfileCompleted ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Student: <strong className="text-white">{profile.name || "Wizard Profile"}</strong></span>
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] rounded uppercase font-bold tracking-wider">
                  {profile.vorynexaId || "VNX-84A6KF2"}
                </span>
              </div>
              {scores?.overall && (
                <div className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                  <span>Readiness Index: <strong className="text-emerald-400 font-mono">{scores.overall}%</strong></span>
                </div>
              )}
              {/* Deep Work Toggle Button */}
              <button
                type="button"
                id="deep-work-toggle-btn"
                onClick={() => setIsDeepWork(!isDeepWork)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold font-mono transition-all cursor-pointer ${
                  isDeepWork
                    ? "bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-amber-500/30 text-purple-200 border-purple-500/60 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30"
                    : "bg-white/5 hover:bg-white/10 text-white/70 border-white/10 hover:text-white"
                }`}
                title={isDeepWork ? "Exit Deep Work Focus Mode" : "Enable Deep Work Focus Mode (Collapses Sidebar & Hides Distractions)"}
              >
                <Zap className={`w-3.5 h-3.5 ${isDeepWork ? "text-purple-300 fill-purple-300 animate-pulse" : "text-amber-400"}`} />
                <span>{isDeepWork ? "DEEP WORK ON" : "Deep Work"}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors cursor-pointer"
                title="Reset active candidate profile"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Profile</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 text-xs font-bold font-mono">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Candidate Onboarding Phase</span>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all cursor-pointer"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          {showWorkspaceNav && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </header>

      {/* Persistent Offline & Sync Failure Banner */}
      {(!isOnline || syncFailed) && (
        <div className="bg-amber-500/5 border border-amber-500/20 px-5 py-3.5 rounded-xl flex items-center justify-between gap-4 shrink-0 transition-all">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div>
              <p className="text-xs font-black text-amber-400 font-mono">
                {!isOnline ? "CAMPAIGN OFFLINE MODE ACTIVE" : "SUPABASE SYNCHRONIZATION ERROR"}
              </p>
              <p className="text-[10px] text-white/50 font-semibold leading-relaxed mt-0.5">
                {!isOnline 
                  ? "Your network connection is offline. Changes will save to local storage and sync back once connectivity is restored." 
                  : "We encountered an issue syncing your profile analytics to the Cloud Database. Local cache is active and safe."}
              </p>
            </div>
          </div>
          <button
            onClick={handleSyncRetry}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" /> Sync Now
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar for Large Screens */}
        {showWorkspaceNav && (
          isDeepWork ? (
            <aside className="hidden md:flex flex-col w-16 bg-[#111] border border-white/10 rounded-xl py-4 px-2 items-center justify-between shrink-0 mr-4 transition-all shadow-xl">
              <div className="space-y-2 flex flex-col items-center w-full">
                <button
                  onClick={() => setIsDeepWork(false)}
                  className="p-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl hover:bg-purple-500/30 transition-all cursor-pointer mb-2 group"
                  title="Expand Sidebar (Exit Deep Work Mode)"
                >
                  <EyeOff className="w-4 h-4 text-purple-300 group-hover:scale-110 transition-transform" />
                </button>
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      }`}
                      title={tab.name}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setIsDeepWork(false)}
                className="p-2 text-white/30 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest cursor-pointer text-center"
                title="Exit Deep Work"
              >
                FOCUS
              </button>
            </aside>
          ) : (
            <aside className="hidden md:flex flex-col w-64 bg-[#111] border border-white/10 rounded-xl p-4 justify-between shrink-0 mr-4 transition-all">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block px-3 mb-2">Workspace Navigation</span>
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      id={`nav-${tab.id}`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-[9px] font-bold text-white/40 uppercase block tracking-wider font-mono">Placement Target</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1 truncate font-mono">
                    {profile.targetRoles[0] || "Select Target Role"}
                  </p>
                  <p className="text-[10px] text-white/40 leading-normal mt-0.5">
                    Deadline: {profile.placementDeadline}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Profile</span>
                </button>
              </div>
            </aside>
          )
        )}

        {/* Mobile Navigation Drawer */}
        {showWorkspaceNav && mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-black/65 md:hidden flex rounded-xl" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-[#111] border border-white/10 p-4 flex flex-col justify-between h-full" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">VORYNEXA Navigation</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-white/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {navigationTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === tab.id
                          ? "bg-emerald-500 text-black"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-[9px] font-bold text-white/40 uppercase block tracking-wider font-mono">Placement Target</span>
                  <p className="text-xs font-bold text-emerald-400 mt-1 truncate font-mono">
                    {profile.targetRoles[0] || "Select Target Role"}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>Reset Profile</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto space-y-6">
          {/* Deep Work Focus Mode Active Header */}
          {isDeepWork && (
            <div className="p-3.5 bg-gradient-to-r from-purple-900/40 via-purple-900/20 to-black/60 border border-purple-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs font-mono text-purple-200 shadow-xl backdrop-blur-md animate-in fade-in duration-200 mb-2">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300">
                  <Zap className="w-4 h-4 text-purple-300 fill-purple-300 animate-pulse" />
                </span>
                <div>
                  <h4 className="font-extrabold text-white text-xs tracking-tight">DEEP WORK FOCUS MODE ACTIVE</h4>
                  <p className="text-[10px] text-purple-300/70 font-medium">Sidebar collapsed & non-essential distractions hidden for laser-focused career execution.</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeepWork(false)}
                className="px-3.5 py-1.5 bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-[10px] font-mono uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                Exit Focus Mode
              </button>
            </div>
          )}

          {/* Global Missing API Key Alert / Server Error boundary */}
          {apiError && (
            <ErrorAlertModal
              error={apiError}
              onClose={() => setApiError(null)}
              onRetry={() => runCoreAudit()}
            />
          )}

          {/* Quick analysis notice */}
          {isAnalyzing && (
            <AppLoadingSpinner phase="audit" />
          )}

          {/* View Router */}
          <div className="max-w-6xl mx-auto">
            {activeTab === "home" && (
              <UserDashboard
                profile={profile}
                scores={scores}
                interviewHistory={interviewHistory}
                onNavigateToSection={handleNavigateToSection}
                activities={activities}
                notifications={notifications}
                onMarkNotificationRead={(id) => {
                  setNotifications(prev => {
                    const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
                    localStorage.setItem("placement_notifications", JSON.stringify(updated));
                    return updated;
                  });
                }}
                onMarkAllNotificationsRead={() => {
                  setNotifications(prev => {
                    const updated = prev.map(n => ({ ...n, read: true }));
                    localStorage.setItem("placement_notifications", JSON.stringify(updated));
                    return updated;
                  });
                }}
                onRefreshData={async () => {
                  setIsAnalyzing(true);
                  try {
                    await runCoreAudit();
                    logActivity("Manual Core Audit Triggered", "Aggregated employability matrices updated across all active channels.", "analytics");
                    addNotification("Employability matrices updated", "Manual refresh successfully updated your active career readiness scorecards.");
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setIsAnalyzing(false);
                  }
                }}
                isRefreshing={isAnalyzing}
              />
            )}

            {activeTab === "landing" && (
              <LandingPage onGetStarted={() => setActiveTab("blueprint")} />
            )}



            {activeTab === "settings" && (
              <SettingsPanel
                profile={profile}
                onSaveProfile={handleSaveProfile}
                interviewHistory={interviewHistory}
                onSignOut={handleSignOut}
                userId={user?.uid}
              />
            )}

            {activeTab === "blueprint" && (
              <div className="space-y-4">
                {!isProfileCompleted && (
                  <div className="bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-purple-500/10 border border-emerald-500/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase font-mono rounded-full tracking-wider">
                          Step 1 of 1 • Profile Onboarding
                        </span>
                        <h3 className="font-extrabold text-white text-base mt-1">Complete & Save Your Candidate Profile</h3>
                        <p className="text-xs text-white/60 font-medium leading-relaxed">
                          Fill in your target roles, skills, and education details below. Saving your profile automatically syncs your data to Supabase and unlocks all workspace navigation!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <ProfileForm profile={profile} onSave={handleSaveProfile} hrAnalysis={hrAnalysis} />
              </div>
            )}

            {activeTab === "dashboard" && (
              <IntelligenceDashboard
                intelligenceMap={intelligenceMap}
                scores={scores}
                recommendedRoles={recommendedRoles}
                onNavigateToSection={handleNavigateToSection}
                isAnalyzing={isAnalyzing}
              />
            )}

            {activeTab === "resume" && (
              <ResumeBuilder
                profile={profile}
                suggestions={resumeSuggestions}
                onOptimize={handleOptimizeResume}
                isOptimizing={isOptimizingResume}
                callServerEndpoint={callServerEndpoint}
                onUpdateProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
              />
            )}

            {activeTab === "hr-rating" && (
              <HRProfileRating
                profile={profile}
                initialAnalysis={hrAnalysis}
                onSaveAnalysis={handleSaveHrAnalysis}
                callServerEndpoint={callServerEndpoint}
              />
            )}

            {activeTab === "roadmap" && (
              <RoadmapView
                profile={profile}
                roadmap={roadmapPlan}
                onGenerate={handleGenerateRoadmap}
                isGenerating={isGeneratingRoadmap}
              />
            )}

            {activeTab === "schedule" && (
              <PlacementSchedule
                profile={profile}
              />
            )}

            {activeTab === "projects" && (
              <ProjectAdvisor
                profile={profile}
                projects={recommendedProjects}
                onGenerate={handleGenerateProjects}
                isGenerating={isDraftingProjects}
              />
            )}

            {activeTab === "interview" && (
              <InterviewSimulator
                profile={profile}
                session={interviewSession}
                history={interviewHistory}
                onGenerateQuestions={handleGenerateInterviewQuestions}
                onEvaluateAnswer={handleEvaluateInterviewAnswer}
                onNextQuestion={handleNextInterviewQuestion}
                onResetInterview={handleResetInterview}
                isGenerating={isGeneratingInterview}
                isEvaluating={isEvaluatingInterview}
                callServerEndpoint={callServerEndpoint}
              />
            )}

            {activeTab === "outreach" && (
              <JobOutreach
                profile={profile}
                strategy={jobStrategy}
                onGenerate={handleGenerateJobStrategy}
                isGenerating={isGeneratingJobStrategy}
              />
            )}

            {activeTab === "negotiate" && (
              <NegotiationCoach
                profile={profile}
                advice={negotiationAdvice}
                onGenerate={handleGenerateNegotiation}
                isGenerating={isGeneratingNegotiation}
              />
            )}

            {activeTab === "communication" && (
              <CommunicationCoach
                profile={profile}
                tips={communicationTips}
                onGenerate={handleGenerateCommTips}
                isGenerating={isGeneratingCommTips}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
