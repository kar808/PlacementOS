import React, { useState, useEffect } from "react";
import {
  StudentProfile,
  IntelligenceMap,
  ReadinessScores,
  RecommendedRole,
  ResumeLinkedInSuggestion,
  RoadmapPlan,
  ProjectIdea,
  JobSearchStrategy,
  MockInterviewSession,
  PastInterviewSession,
  NegotiationAdvisorResponse,
  CommunicationTip,
  HRProfileAnalysis,
} from "./types";
import { DEFAULT_STUDENT_PROFILE } from "./lib/defaultProfile";

// Firebase integration
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./lib/firebase";

// Import modular sub-components
import ProfileForm from "./components/ProfileForm";
import IntelligenceDashboard from "./components/IntelligenceDashboard";
import ResumeBuilder from "./components/ResumeBuilder";
import RoadmapView from "./components/RoadmapView";
import ProjectAdvisor from "./components/ProjectAdvisor";
import InterviewSimulator from "./components/InterviewSimulator";
import JobOutreach from "./components/JobOutreach";
import NegotiationCoach from "./components/NegotiationCoach";
import CommunicationCoach from "./components/CommunicationCoach";
import AuthScreen from "./components/AuthScreen";
import OnboardingWizard from "./components/OnboardingWizard";
import HRProfileRating from "./components/HRProfileRating";
import PlacementSchedule from "./components/PlacementSchedule";

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
} from "lucide-react";

// Client-side rate-limiting rolling window tracking
const clientRequestHistory: { [userId: string]: number[] } = {};

// Client-side synchronous request integrity calculation helper
function computeRequestIntegrity(endpoint: string, body: any, timestamp: number, userId: string): string {
  const secret = "PlacementOS_Secure_Key_2026";
  const data = `${endpoint}:${JSON.stringify(body || {})}:${timestamp}:${userId}:${secret}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

export default function App() {
  // Firebase Auth and Profile states
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [localUserBypass, setLocalUserBypass] = useState<boolean>(() => {
    return localStorage.getItem("local_sandbox_active") === "true";
  });
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  // Online status and database sync states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncFailed, setSyncFailed] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>("blueprint");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core profile & cache states (persisted via localStorage)
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);

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

  // Listen to Auth state and fetch user details from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const savedProfile = userDocSnap.data() as StudentProfile;
            setProfile(savedProfile);
            setHasProfile(true);

            // Fetch analytical modules
            const intelSnap = await getDoc(doc(db, "users", firebaseUser.uid, "analytics", "intelligence"));
            if (intelSnap.exists()) setIntelligenceMap(intelSnap.data() as IntelligenceMap);

            const scoresSnap = await getDoc(doc(db, "users", firebaseUser.uid, "analytics", "scores"));
            if (scoresSnap.exists()) setScores(scoresSnap.data() as ReadinessScores);

            const rolesSnap = await getDoc(doc(db, "users", firebaseUser.uid, "analytics", "roles"));
            if (rolesSnap.exists()) setRecommendedRoles((rolesSnap.data() as any).list);

            const hrSnap = await getDoc(doc(db, "users", firebaseUser.uid, "analytics", "hrAnalysis"));
            if (hrSnap.exists()) setHrAnalysis(hrSnap.data() as HRProfileAnalysis);

            // Fetch interview history from Firestore
            try {
              const interviewsSnap = await getDocs(collection(db, "users", firebaseUser.uid, "interviews"));
              const history: PastInterviewSession[] = [];
              interviewsSnap.forEach((doc) => {
                history.push(doc.data() as PastInterviewSession);
              });
              history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              setInterviewHistory(history);
              localStorage.setItem("placement_interview_history", JSON.stringify(history));
            } catch (err) {
              console.error("Error reading interviews from Firestore:", err);
            }
          } else {
            setHasProfile(false);
          }
        } catch (error) {
          console.error("Firestore read error:", error);
          setHasProfile(false);
        }
      } else {
        if (localUserBypass) {
          const cached = localStorage.getItem("placement_profile");
          if (cached) {
            setProfile(JSON.parse(cached));
            setHasProfile(true);
            
            const cachedIntel = localStorage.getItem("placement_intelligence");
            if (cachedIntel) setIntelligenceMap(JSON.parse(cachedIntel));
            
            const cachedScores = localStorage.getItem("placement_scores");
            if (cachedScores) setScores(JSON.parse(cachedScores));
            
            const cachedRoles = localStorage.getItem("placement_roles");
            if (cachedRoles) setRecommendedRoles(JSON.parse(cachedRoles));

            const cachedHr = localStorage.getItem("placement_hr_analysis");
            if (cachedHr) setHrAnalysis(JSON.parse(cachedHr));

            const cachedHistory = localStorage.getItem("placement_interview_history");
            if (cachedHistory) setInterviewHistory(JSON.parse(cachedHistory));
          } else {
            setHasProfile(false);
          }
        } else {
          setHasProfile(false);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [localUserBypass]);

  // Sync profile edits with local cache and Firestore
  const saveProfileUpdate = async (updated: StudentProfile) => {
    setProfile(updated);
    localStorage.setItem("placement_profile", JSON.stringify(updated));
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), updated);
        setSyncFailed(false);
      } catch (err) {
        console.error("Firestore sync error:", err);
        setSyncFailed(true);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase signOut error:", err);
    }
    // Clear all localStorage and state variables
    localStorage.removeItem("local_sandbox_active");
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
    
    setLocalUserBypass(false);
    setProfile(DEFAULT_STUDENT_PROFILE);
    setHasProfile(false);
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
    setActiveTab("blueprint");
  };

  const handleOnboardingComplete = async (completedProfile: StudentProfile) => {
    setProfile(completedProfile);
    setHasProfile(true);
    localStorage.setItem("placement_profile", JSON.stringify(completedProfile));
    
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), completedProfile);
        setSyncFailed(false);
      } catch (err) {
        console.error("Firestore save onboarding error:", err);
        setSyncFailed(true);
      }
    }
    await runCoreAudit(completedProfile);
  };

  // Manual retry synchronization handler
  const handleSyncRetry = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await setDoc(doc(db, "users", user.uid), profile);
      if (intelligenceMap) {
        await setDoc(doc(db, "users", user.uid, "analytics", "intelligence"), intelligenceMap);
      }
      if (scores) {
        await setDoc(doc(db, "users", user.uid, "analytics", "scores"), scores);
      }
      if (recommendedRoles) {
        await setDoc(doc(db, "users", user.uid, "analytics", "roles"), { list: recommendedRoles });
      }
      if (hrAnalysis) {
        await setDoc(doc(db, "users", user.uid, "analytics", "hrAnalysis"), hrAnalysis);
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
        await setDoc(doc(db, "users", user.uid, "analytics", "hrAnalysis"), analysisData);
        setSyncFailed(false);
      } catch (err) {
        console.error("Firestore HR analysis sync error:", err);
        setSyncFailed(true);
      }
    }
  };

  // Unified endpoint executor helper with Firebase JWT verification header, request integrity and client-side rate limiting
  const callServerEndpoint = async (endpoint: string, body: any) => {
    setApiError(null);
    const userId = auth.currentUser?.uid || "sandbox-user";

    // 1. Client-Side Rate-Limiting Protection (sliding 60-second window, max 25 requests per user)
    const now = Date.now();
    if (!clientRequestHistory[userId]) {
      clientRequestHistory[userId] = [];
    }
    clientRequestHistory[userId] = clientRequestHistory[userId].filter(ts => now - ts < 60000);
    if (clientRequestHistory[userId].length >= 25) {
      const errorMsg = "Client rate limit protection: Too many requests. Please wait a moment before trying again to prevent server overload.";
      setApiError(errorMsg);
      throw new Error(errorMsg);
    }
    clientRequestHistory[userId].push(now);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        headers["Authorization"] = `Bearer sandbox-token-123456`;
      }

      // 2. Compute dynamic request integrity signature and timestamp
      const integrityTimestamp = Date.now();
      const integritySignature = computeRequestIntegrity(endpoint, body, integrityTimestamp, userId);
      headers["X-Request-Timestamp"] = String(integrityTimestamp);
      headers["X-Request-Integrity"] = integritySignature;
      headers["X-Request-Client-Id"] = userId;

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.message || "Endpoint operation failed");
      }
      return data;
    } catch (err: any) {
      console.error(`Error fetching ${endpoint}:`, err);
      setApiError(err.message || "Failed to contact the career analysis server. Please ensure the backend is running and your GEMINI_API_KEY is active.");
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

      if (user) {
        try {
          await setDoc(doc(db, "users", user.uid, "analytics", "intelligence"), data.intelligenceMap);
          await setDoc(doc(db, "users", user.uid, "analytics", "scores"), data.scores);
          await setDoc(doc(db, "users", user.uid, "analytics", "roles"), { list: data.recommendedRoles });
          setSyncFailed(false);
        } catch (dbErr) {
          console.error("Firestore audit sync error:", dbErr);
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
  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      const data = await callServerEndpoint("/api/placement/roadmap", profile);
      setRoadmapPlan(data);
      localStorage.setItem("placement_roadmap", JSON.stringify(data));
    } catch (err) {
      // Handled globally
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

  // 6. Generate Mock Interview Questions
  const handleGenerateInterviewQuestions = async (role: string) => {
    setIsGeneratingInterview(true);
    try {
      const excludeQuestions = [
        ...interviewSession.questions.map((q) => q.question),
        ...interviewHistory.flatMap((h) => h.questionsAndAnswers.map((qa) => qa.question))
      ];

      // Calculate candidate specific performance trends from completed historical sessions
      const pastSessions = interviewHistory || [];
      const performanceTrends = {
        totalSessions: pastSessions.length,
        averageOverallScore: pastSessions.length > 0 
          ? Math.round(pastSessions.reduce((sum, s) => sum + s.overallScore, 0) / pastSessions.length)
          : null,
        averageTechnicalDepth: pastSessions.length > 0 
          ? Math.round(pastSessions.reduce((sum, s) => sum + (s.metrics?.technicalDepth || 0), 0) / pastSessions.length)
          : null,
        averageCommunicationClarity: pastSessions.length > 0 
          ? Math.round(pastSessions.reduce((sum, s) => sum + (s.metrics?.communicationClarity || 0), 0) / pastSessions.length)
          : null,
        recentScores: pastSessions.slice(0, 5).map(s => s.overallScore),
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
    verbalMetrics?: any
  ) => {
    setIsEvaluatingInterview(true);
    try {
      const data = await callServerEndpoint("/api/placement/interview/evaluate", {
        question,
        answer,
        type,
        expectedFocus: focus,
        verbalMetrics,
      });

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
            technicalDepth: data.technicalDepth,
            communicationClarity: data.communicationClarity,
            confidence: data.confidence,
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

    const overallScore = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.score || 0), 0) / studentAnswers.length
    );
    const technicalDepth = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.technicalDepth || 0), 0) / studentAnswers.length
    );
    const communicationClarity = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.communicationClarity || 0), 0) / studentAnswers.length
    );
    const confidence = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.confidence || 0), 0) / studentAnswers.length
    );

    // NEW: Calculate speech fluency averages across the session
    const averageHesitationDuration = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.hesitationDuration || 0), 0) / studentAnswers.length
    );
    const averageWordsPerMinute = Math.round(
      studentAnswers.reduce((sum, item) => sum + (item.wordsPerMinute || 0), 0) / studentAnswers.length
    );
    const totalFillerCount = studentAnswers.reduce((sum, item) => sum + (item.totalFillerCount || 0), 0);

    const questionsAndAnswers = completedSession.questions.map((q, idx) => {
      const ans = studentAnswers[idx];
      return {
        question: q.question,
        answer: ans?.text || "No response.",
        feedback: ans?.feedback || "No feedback generated.",
        score: ans?.score || 0,
        suggestedStarAnswer: ans?.suggestedStarAnswer || "",
        type: q.type,
        audioUrl: ans?.audioUrl || undefined,
        metrics: {
          technicalDepth: ans?.technicalDepth || 0,
          communicationClarity: ans?.communicationClarity || 0,
          confidence: ans?.confidence || 0,
          hesitationDuration: ans?.hesitationDuration || 0,
          wordsPerMinute: ans?.wordsPerMinute || 0,
          totalFillerCount: ans?.totalFillerCount || 0,
        },
      };
    });

    const pastSession: PastInterviewSession = {
      id: `interview_${Date.now()}`,
      role: activeInterviewRole || "Target Role",
      timestamp: new Date().toISOString(),
      overallScore,
      metrics: {
        technicalDepth,
        communicationClarity,
        confidence,
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
        await setDoc(doc(db, "users", user.uid, "interviews", pastSession.id), pastSession);
      } catch (err) {
        console.error("Firestore save interview history error:", err);
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
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Loading placement core...
          </div>
          <div className="text-sm font-semibold text-white/40 font-mono">Connecting to PlacementOS Secure Node...</div>
        </div>
      </div>
    );
  }

  if (!user && !localUserBypass) {
    return (
      <AuthScreen 
        onAuthSuccess={() => {}} 
        onLocalBypass={() => {
          localStorage.setItem("local_sandbox_active", "true");
          setLocalUserBypass(true);
        }}
      />
    );
  }

  if (!hasProfile) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex flex-col font-sans p-3 sm:p-5 gap-4">
      {/* Top Header */}
      <header className="bg-[#111] border border-white/10 rounded-xl px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-black px-2.5 py-1 font-black text-sm rounded">
            POS
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
              PlacementOS
              <span className="text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                AI Co-Pilot
              </span>
            </h1>
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">Employability Optimizer & Campaign Engine</p>
          </div>
        </div>

        {/* Global summary badge & Auth state */}
        <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-white/60">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active Student: <strong className="text-white">{profile.name || "Wizard Profile"}</strong></span>
          </div>
          {scores?.overall && (
            <div className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span>Readiness Index: <strong className="text-emerald-400 font-mono">{scores.overall}%</strong></span>
            </div>
          )}
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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
                {!isOnline ? "CAMPAIGN OFFLINE MODE ACTIVE" : "FIRESTORE SYNCHRONIZATION ERROR"}
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
        <aside className="hidden md:flex flex-col w-64 bg-[#111] border border-white/10 rounded-xl p-4 justify-between shrink-0 mr-4">
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
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors text-xs font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 bg-black/65 md:hidden flex rounded-xl" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-[#111] border border-white/10 p-4 flex flex-col justify-between h-full" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">PlacementOS Drawer</span>
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
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto space-y-6">
          {/* Global Missing API Key Alert / Server Error boundary */}
          {apiError && (
            <div className="bg-[#111] border border-rose-500/30 rounded-xl p-5 flex items-start gap-3 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-rose-400 text-sm">Career Advisor Offline</h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {apiError}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setApiError(null)}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
                  >
                    Dismiss Warning
                  </button>
                  <button
                    onClick={() => runCoreAudit()}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 bg-white/5 px-2.5 py-1 rounded-md shadow-xs"
                  >
                    Retry Core Audit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick analysis notice */}
          {isAnalyzing && (
            <div className="bg-[#111] border border-white/10 text-white rounded-xl p-6 shadow-lg flex items-center gap-4 justify-between animate-pulse">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-emerald-400">PlacementOS Analyzing Profile...</h4>
                <p className="text-white/60 text-xs">Generating Employability map, scoring assets, and designing target role pathways.</p>
              </div>
              <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shrink-0"></div>
            </div>
          )}

          {/* View Router */}
          <div className="max-w-6xl mx-auto">
            {activeTab === "blueprint" && (
              <ProfileForm profile={profile} onSave={handleSaveProfile} hrAnalysis={hrAnalysis} />
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
