import React, { useState, useEffect, useRef } from "react";
import { MockInterviewQuestion, StudentProfile, MockInterviewSession, PastInterviewSession } from "../types";
import { 
  MessageSquare, Play, Send, RefreshCw, Star, ArrowRight, 
  CheckCircle2, ChevronDown, ChevronUp, Brain, Mic, MicOff, 
  AlertTriangle, Sparkles, Activity, History, Award, BookOpen,
  Volume2, HelpCircle, Clock, Headphones, Pause, PlayCircle,
  Lightbulb, Zap, X, Compass, Copy, Check, Download, ShieldCheck,
  UserCheck, Briefcase, FileText, BarChart2, PieChart, ExternalLink,
  Info, AlertCircle, ArrowLeft, Layers, Sliders, Trash2, Terminal,
  VolumeX, RotateCcw, Wrench, Filter, CheckSquare
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InterviewSimulatorProps {
  profile: StudentProfile;
  session: MockInterviewSession;
  history?: PastInterviewSession[];
  onGenerateQuestions: (
    role: string, 
    interviewType?: string, 
    experienceLevel?: string, 
    domain?: string, 
    questionCount?: number
  ) => Promise<void>;
  onEvaluateAnswer: (
    question: string, 
    answer: string, 
    type?: string, 
    expectedFocus?: string,
    verbalMetrics?: {
      totalFillerCount?: number;
      fillerCounts?: Record<string, number>;
      sentimentLabel?: string;
      sentimentScore?: number;
      hesitationDuration?: number;
      wordsPerMinute?: number;
      audioUrl?: string;
    },
    category?: string,
    experienceLevel?: string,
    domain?: string
  ) => Promise<void>;
  onNextQuestion: () => void;
  onResetInterview: () => void;
  isGenerating?: boolean;
  isEvaluating?: boolean;
  callServerEndpoint: (endpoint: string, body: any) => Promise<any>;
}

const EVALUATION_DIMENSIONS = [
  { id: "communicationClarity", label: "Communication & Structure" },
  { id: "technicalAccuracy", label: "Technical Accuracy & Depth" },
  { id: "problemSolving", label: "Problem Solving Logic" },
  { id: "confidence", label: "Spoken Confidence" },
  { id: "domainKnowledge", label: "Domain Expertise" },
  { id: "relevanceToRole", label: "Role Alignment" },
  { id: "grammar", label: "Verbal Grammar & Tone" },
  { id: "behaviour", label: "Behavioral Readiness" },
] as const;

const INTERVIEW_CATEGORIES = [
  { id: "Technical", name: "Technical Deep-Dive", description: "Architecture, system design, data structures, domain code, frameworks", icon: Brain },
  { id: "Behavioral", name: "Behavioral & STAR", description: "Leadership, conflict resolution, team collaboration, situation handling", icon: UserCheck },
  { id: "HR", name: "HR & Cultural Fit", description: "Salary, values alignment, career progression, motivation", icon: Briefcase },
  { id: "Leadership", name: "Executive Leadership", description: "Strategic direction, resource allocation, team scaling, vision", icon: Award },
  { id: "Domain Specific", name: "Domain & Industry Specialist", description: "Deep role-tailored technical & regulatory questions", icon: Compass },
];

const EXPERIENCE_LEVELS = [
  { id: "Fresher", label: "Entry Level / Fresher (0-1 Yrs)", description: "Core fundamentals, academic projects, adaptability" },
  { id: "Mid Level", label: "Mid Level Professional (2-5 Yrs)", description: "Practical execution, problem-solving, trade-offs" },
  { id: "Senior Level", label: "Senior Specialist (5-8 Yrs)", description: "System design, optimization, mentoring, best practices" },
  { id: "Lead / Executive", label: "Lead / Manager (8+ Yrs)", description: "Strategic impact, cross-team architecture, business value" },
];

const DOMAINS_LIST = [
  "Software Engineering & IT",
  "Artificial Intelligence & Data Science",
  "Finance & Investment Banking",
  "Healthcare & Clinical Medicine",
  "Civil Services & Public Governance (IAS/IPS)",
  "Aerospace & Mechanical Engineering",
  "Product Management",
  "Custom Domain"
];

// Technical terminology dictionary for preservation & standardization
const TECHNICAL_TERMS_DICTIONARY: Record<string, string> = {
  "react": "React",
  "reactjs": "React.js",
  "react js": "React.js",
  "react native": "React Native",
  "typescript": "TypeScript",
  "javascript": "JavaScript",
  "nodejs": "Node.js",
  "node js": "Node.js",
  "express": "Express.js",
  "expressjs": "Express.js",
  "nextjs": "Next.js",
  "next js": "Next.js",
  "vue": "Vue.js",
  "angular": "Angular",
  "python": "Python",
  "java": "Java",
  "c++": "C++",
  "c sharp": "C#",
  "golang": "Go",
  "rust": "Rust",
  "html": "HTML",
  "css": "CSS",
  "tailwindcss": "Tailwind CSS",
  "tailwind": "Tailwind CSS",
  "aws": "AWS",
  "amazon web services": "AWS",
  "azure": "Azure",
  "gcp": "GCP",
  "google cloud": "GCP",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "k8s": "Kubernetes",
  "terraform": "Terraform",
  "ci/cd": "CI/CD",
  "cicd": "CI/CD",
  "devops": "DevOps",
  "serverless": "Serverless",
  "microservices": "Microservices",
  "sql": "SQL",
  "mysql": "MySQL",
  "postgresql": "PostgreSQL",
  "postgres": "PostgreSQL",
  "mongodb": "MongoDB",
  "redis": "Redis",
  "graphql": "GraphQL",
  "rest api": "REST API",
  "restful": "RESTful",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "scikit learn": "Scikit-learn",
  "pandas": "Pandas",
  "numpy": "NumPy",
  "machine learning": "Machine Learning",
  "deep learning": "Deep Learning",
  "llm": "LLM",
  "gemini": "Gemini",
  "openai": "OpenAI",
  "hipaa": "HIPAA",
  "ehr": "EHR",
  "emr": "EMR",
  "icu": "ICU",
  "cpr": "CPR",
  "bls": "BLS",
  "acls": "ACLS",
  "ias": "IAS",
  "ips": "IPS",
  "kpi": "KPI",
  "sla": "SLA",
  "okr": "OKR",
  "roi": "ROI",
  "gdpr": "GDPR",
  "saas": "SaaS",
  "b2b": "B2B",
  "b2c": "B2C",
  "agile": "Agile",
  "scrum": "Scrum",
  "jira": "Jira",
};

export function InterviewSimulator({
  profile,
  session,
  history = [],
  onGenerateQuestions,
  onEvaluateAnswer,
  onNextQuestion,
  onResetInterview,
  isGenerating = false,
  isEvaluating = false,
  callServerEndpoint
}: InterviewSimulatorProps) {
  // Navigation & Config state
  const [activeSubTab, setActiveSubTab] = useState<"practice" | "trends" | "history">("practice");
  const [selectedCategory, setSelectedCategory] = useState<string>("Technical");
  const [selectedLevel, setSelectedLevel] = useState<string>("Mid Level");
  const [selectedDomain, setSelectedDomain] = useState<string>("Software Engineering & IT");
  const [customDomainText, setCustomDomainText] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>(profile.targetRoles?.[0] || "Software Engineer");
  const [questionCount, setQuestionCount] = useState<number>(3);

  // Active session input & timer
  const [userAnswerInput, setUserAnswerInput] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [isClarifying, setIsClarifying] = useState<boolean>(false);
  const [clarificationData, setClarificationData] = useState<{ clarifiedQuestion: string; helpfulHints: string[] } | null>(null);
  const [clarifyError, setClarifyError] = useState<string | null>(null);

  // Audio recording & Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown");
  const [showMicHelpModal, setShowMicHelpModal] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [lastRecordedAudio, setLastRecordedAudio] = useState<string | null>(null);

  // Real-time audio spectrum & dynamics state
  const [audioVolumeLevel, setAudioVolumeLevel] = useState<number>(0);
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [cleanFillersEnabled, setCleanFillersEnabled] = useState<boolean>(true);
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [speechLogs, setSpeechLogs] = useState<string[]>([]);

  // Analytics state
  const [fillerCounts, setFillerCounts] = useState<Record<string, number>>({
    um: 0, uh: 0, like: 0, actually: 0, basically: 0, so: 0
  });
  const [sentimentLabel, setSentimentLabel] = useState<"Confident" | "Constructive" | "Hesitant">("Constructive");
  const [sentimentScore, setSentimentScore] = useState(50);
  const [hesitationDuration, setHesitationDuration] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);

  // UI Modals & Export state
  const [showQuickTips, setShowQuickTips] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [expandedPastSessionId, setExpandedPastSessionId] = useState<string | null>(null);

  // Audio & Web Speech Refs
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const isListeningRef = useRef<boolean>(false);
  const userAnswerInputRef = useRef<string>("");
  const speechStartTimeRef = useRef<number | null>(null);
  const lastSpeechTimestampRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceCheckIntervalRef = useRef<any>(null);

  const currentQuestion: MockInterviewQuestion | undefined = session.questions[session.currentQuestionIndex];
  const currentAnswerItem = session.chatHistory[session.currentQuestionIndex];
  const isQuestionAnswered = Boolean(currentAnswerItem && currentAnswerItem.role === "student" && currentAnswerItem.feedback !== undefined);

  const effectiveDomain = selectedDomain === "Custom Domain" 
    ? (customDomainText.trim() || "General Industry") 
    : selectedDomain;

  // Log helper for speech diagnostics
  const logSpeechEvent = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formatted = `[${timestamp}] ${msg}`;
    console.log(formatted);
    setSpeechLogs((prev) => [formatted, ...prev.slice(0, 24)]);
  };

  // Mount check: Speech recognition & Microphone permissions
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      logSpeechEvent("Web Speech API supported in this browser environment.");
    } else {
      setSpeechSupported(false);
      logSpeechEvent("Web Speech API NOT supported natively. Typed fallback enabled.");
    }
    checkMicrophonePermission();

    return () => {
      cleanupSpeechResources();
    };
  }, []);

  const cleanupSpeechResources = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try { audioContextRef.current.close(); } catch (e) {}
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        // Querying microphone permission status safely
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
        setMicPermissionState(result.state as any);
        logSpeechEvent(`Microphone permission state: ${result.state}`);
        result.onchange = () => {
          setMicPermissionState(result.state as any);
          logSpeechEvent(`Microphone permission updated: ${result.state}`);
        };
      } else {
        setMicPermissionState("prompt");
      }
    } catch (e) {
      logSpeechEvent("Permission Query API not supported by browser (e.g. Safari). Will check via getUserMedia.");
      setMicPermissionState("prompt");
    }
  };

  const requestMicrophoneAccess = async () => {
    setSpeechError(null);
    setSpeechNotice(null);
    logSpeechEvent("Requesting getUserMedia audio access from user...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState("granted");
      setShowMicHelpModal(false);
      logSpeechEvent("Microphone access GRANTED by user.");
      // Stop temporary track
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.error("Microphone access denied:", err);
      setMicPermissionState("denied");
      setShowMicHelpModal(true);
      logSpeechEvent(`Microphone access DENIED: ${err.message || err.name || "Unknown error"}`);
      setSpeechError("Microphone access is blocked in your browser. Please allow microphone access in browser settings or use the typed fallback input.");
    }
  };

  // Auto-restore answer draft from localStorage when question changes
  useEffect(() => {
    if (currentQuestion && session.status === "ongoing") {
      const draftKey = `vorynexa_draft_${currentQuestion.id || session.currentQuestionIndex}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft && savedDraft.trim() && !userAnswerInput) {
        setUserAnswerInput(savedDraft);
        finalTranscriptRef.current = savedDraft;
        userAnswerInputRef.current = savedDraft;
        setIsDraftRestored(true);
        analyzeSpeechDynamics(savedDraft);
        logSpeechEvent(`Restored answer draft for question #${session.currentQuestionIndex + 1}`);
      } else {
        setIsDraftRestored(false);
      }
    }
  }, [session.currentQuestionIndex, session.status]);

  // Reset metrics on new question
  useEffect(() => {
    if (session.status === "ongoing") {
      setUserAnswerInput("");
      setInterimTranscript("");
      finalTranscriptRef.current = "";
      userAnswerInputRef.current = "";
      setFillerCounts({ um: 0, uh: 0, like: 0, actually: 0, basically: 0, so: 0 });
      setSentimentLabel("Constructive");
      setSentimentScore(50);
      setHesitationDuration(0);
      setWordsPerMinute(0);
      speechStartTimeRef.current = null;
      lastSpeechTimestampRef.current = null;
      setClarificationData(null);
      setClarifyError(null);
      setLastRecordedAudio(null);
      setTimeLeft(120);
      setIsTimerActive(true);
      setSpeechNotice(null);
      setSpeechError(null);
    }
  }, [session.currentQuestionIndex]);

  // Countdown timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && session.status === "ongoing" && !isQuestionAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerActive, session.status, isQuestionAnswered]);

  // Silence auto-stop detection ticker (6 seconds inactivity auto-pause)
  useEffect(() => {
    if (isListening) {
      silenceCheckIntervalRef.current = setInterval(() => {
        if (lastSpeechTimestampRef.current && isListeningRef.current) {
          const silenceSeconds = (Date.now() - lastSpeechTimestampRef.current) / 1000;
          if (silenceSeconds >= 6.0) {
            logSpeechEvent("Inactivity auto-pause triggered (6s continuous silence). Stopping listening stream.");
            setSpeechNotice("Inactivity auto-pause: No spoken input for 6 seconds. Recording paused and transcript saved.");
            stopListeningSession();
          }
        }
      }, 500);
    } else {
      if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    }
    return () => {
      if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current);
    };
  }, [isListening]);

  // Handle manual typing input change & draft auto-save
  const handleInputChange = (val: string) => {
    setUserAnswerInput(val);
    userAnswerInputRef.current = val;
    finalTranscriptRef.current = val;
    analyzeSpeechDynamics(val);

    if (currentQuestion) {
      const draftKey = `vorynexa_draft_${currentQuestion.id || session.currentQuestionIndex}`;
      localStorage.setItem(draftKey, val);
    }

    if (!isTimerActive && val.trim()) {
      setIsTimerActive(true);
    }
  };

  // Clear current draft
  const handleClearDraft = () => {
    if (currentQuestion) {
      const draftKey = `vorynexa_draft_${currentQuestion.id || session.currentQuestionIndex}`;
      localStorage.removeItem(draftKey);
    }
    setUserAnswerInput("");
    finalTranscriptRef.current = "";
    userAnswerInputRef.current = "";
    setInterimTranscript("");
    setIsDraftRestored(false);
  };

  // Filler & Technical Term Formatting logic
  const formatAndCleanText = (rawText: string, stripFillers = true) => {
    if (!rawText) return "";
    let cleaned = rawText;

    if (stripFillers) {
      // Remove standalone fillers without destroying sentence flow
      const fillerPatterns = [
        /\b(um|uh|err|hmm)\b/gi,
        /\b(you know|i mean)\b/gi,
        /(^|\.\s+)\b(basically|actually|so)\b,\s*/gi,
        /\b(basically|actually)\b(?=\s*,|\s*\.)/gi,
      ];
      fillerPatterns.forEach((p) => {
        cleaned = cleaned.replace(p, " ");
      });
    }

    // Preserve and standardize technical terminology capitalization
    Object.entries(TECHNICAL_TERMS_DICTIONARY).forEach(([lowerKey, formattedVal]) => {
      const escaped = lowerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, "gi");
      cleaned = cleaned.replace(regex, formattedVal);
    });

    return cleaned.replace(/\s{2,}/g, " ").trim();
  };

  // Manual trigger to clean fillers and format technical terms
  const handleApplyCleanText = () => {
    const cleaned = formatAndCleanText(userAnswerInput, true);
    setUserAnswerInput(cleaned);
    finalTranscriptRef.current = cleaned;
    userAnswerInputRef.current = cleaned;
    setInterimTranscript("");
    analyzeSpeechDynamics(cleaned);
    setSpeechNotice("Text cleaned: Standalone filler words removed and technical terms formatted.");
  };

  // Speech dynamics & fluency metrics analysis
  const analyzeSpeechDynamics = (text: string) => {
    const lowerText = text.toLowerCase();
    const fillers = ["um", "uh", "like", "actually", "basically", "so"];
    const counts: Record<string, number> = { um: 0, uh: 0, like: 0, actually: 0, basically: 0, so: 0 };

    fillers.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lowerText.match(regex);
      counts[word] = matches ? matches.length : 0;
    });
    setFillerCounts(counts);

    const positiveWords = ["achieved", "solved", "optimized", "managed", "created", "success", "improved", "strong", "leadership", "impact", "delivered", "coordinated", "resolved", "architected", "scaled"];
    const hesitantWords = ["difficult", "fail", "failed", "scared", "wrong", "late", "worried", "nervous", "stuck", "error", "maybe", "probably", "don't know", "unsure"];

    let positiveCount = 0;
    let hesitantCount = 0;

    positiveWords.forEach((w) => {
      const matches = lowerText.match(new RegExp(`\\b${w}\\b`, "gi"));
      if (matches) positiveCount += matches.length;
    });

    hesitantWords.forEach((w) => {
      const matches = lowerText.match(new RegExp(`\\b${w}\\b`, "gi"));
      if (matches) hesitantCount += matches.length;
    });

    const totalFillers = Object.values(counts).reduce((a, b) => a + b, 0);
    let calculated = 50 + (positiveCount * 12) - (hesitantCount * 8) - (totalFillers * 4);
    calculated = Math.max(15, Math.min(98, calculated));

    setSentimentScore(calculated);
    if (calculated >= 68) setSentimentLabel("Confident");
    else if (calculated <= 40) setSentimentLabel("Hesitant");
    else setSentimentLabel("Constructive");
  };

  // Stop listening helper
  const stopListeningSession = () => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try { audioContextRef.current.close(); } catch (e) {}
    }

    // Commit any pending interim transcript into final text
    if (interimTranscript.trim()) {
      const combined = (finalTranscriptRef.current + " " + interimTranscript).replace(/\s+/g, " ").trim();
      const finalClean = cleanFillersEnabled ? formatAndCleanText(combined, true) : combined;
      setUserAnswerInput(finalClean);
      finalTranscriptRef.current = finalClean;
      userAnswerInputRef.current = finalClean;
      setInterimTranscript("");
    }

    setAudioVolumeLevel(0);
    logSpeechEvent("Speech listening session ended cleanly.");
  };

  // Main Speech Recording Toggle (Start/Stop)
  const handleToggleListening = () => {
    setSpeechError(null);
    setSpeechNotice(null);

    if (isListening) {
      stopListeningSession();
    } else {
      startListeningSession();
    }
  };

  // Start Speech Recognition Engine
  const startListeningSession = async () => {
    isListeningRef.current = true;
    setIsTimerActive(true);
    logSpeechEvent("Initiating speech recognition session...");

    // Destroy any lingering speech recognition instance before starting fresh
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      logSpeechEvent("SpeechRecognition object missing on window.");
      setSpeechError("Speech recognition is not supported in this browser engine. Please use Chrome or Edge on Android/Desktop, or Safari on iOS. Fallback typing is fully supported below.");
      isListeningRef.current = false;
      return;
    }

    try {
      // 1. Initialize Web Audio API for spectrum visualizer & volume analysis
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermissionState("granted");
        logSpeechEvent("Microphone stream acquired successfully.");

        // Setup AudioContext for visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (analyserRef.current && isListeningRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const volumePercentage = Math.min(100, Math.round((average / 128) * 100));
              setAudioVolumeLevel(volumePercentage);
              animFrameRef.current = requestAnimationFrame(updateVolume);
            }
          };
          updateVolume();
        } catch (audioCtxErr) {
          logSpeechEvent("AudioContext visualizer setup failed, fallback visualizer active.");
        }

        // Setup MediaRecorder for answer audio playback saving (cross-browser iOS/Android supported)
        let recorderOptions = {};
        try {
          if (MediaRecorder.isTypeSupported("audio/webm")) recorderOptions = { mimeType: "audio/webm" };
          else if (MediaRecorder.isTypeSupported("audio/mp4")) recorderOptions = { mimeType: "audio/mp4" };
          else if (MediaRecorder.isTypeSupported("audio/aac")) recorderOptions = { mimeType: "audio/aac" };
          else if (MediaRecorder.isTypeSupported("audio/ogg")) recorderOptions = { mimeType: "audio/ogg" };
        } catch (e) {}

        const mediaRecorder = new MediaRecorder(stream, recorderOptions);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const mimeType = mediaRecorder.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => setLastRecordedAudio(reader.result as string);
          stream.getTracks().forEach((t) => t.stop());
        };

        mediaRecorder.start();
      }

      // 2. Initialize Speech Recognition Engine
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      // Initialize base text
      finalTranscriptRef.current = userAnswerInput;
      userAnswerInputRef.current = userAnswerInput;
      speechStartTimeRef.current = Date.now();
      lastSpeechTimestampRef.current = Date.now();

      rec.onresult = (event: any) => {
        let currentInterim = "";

        // Standardized iteration starting from event.resultIndex to prevent duplication!
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscriptRef.current = (finalTranscriptRef.current + " " + transcriptChunk).replace(/\s+/g, " ").trim();
            logSpeechEvent(`Final speech segment recognized: "${transcriptChunk}"`);
          } else {
            currentInterim += transcriptChunk;
          }
        }

        setInterimTranscript(currentInterim);
        lastSpeechTimestampRef.current = Date.now();

        // Calculate combined text
        let combined = (finalTranscriptRef.current + " " + currentInterim).replace(/\s+/g, " ").trim();
        if (cleanFillersEnabled) {
          combined = formatAndCleanText(combined, false); // format terms while live
        }

        setUserAnswerInput(combined);
        userAnswerInputRef.current = combined;
        analyzeSpeechDynamics(combined);

        // Auto-save draft
        if (currentQuestion) {
          const draftKey = `vorynexa_draft_${currentQuestion.id || session.currentQuestionIndex}`;
          localStorage.setItem(draftKey, combined);
        }

        // Live Words Per Minute (WPM) calculation
        const now = Date.now();
        if (speechStartTimeRef.current) {
          const elapsedSeconds = (now - speechStartTimeRef.current) / 1000;
          const wordCount = combined.split(/\s+/).filter(Boolean).length;
          if (elapsedSeconds > 1.5 && wordCount > 0) {
            const currentWpm = Math.round((wordCount / elapsedSeconds) * 60);
            setWordsPerMinute(Math.min(220, Math.max(30, currentWpm)));
          }
        }
      };

      rec.onerror = (err: any) => {
        logSpeechEvent(`Speech Recognition Error: ${err?.error || "unknown"}`);
        if (err.error === "not-allowed" || err.error === "service-not-allowed") {
          isListeningRef.current = false;
          setIsListening(false);
          setMicPermissionState("denied");
          setShowMicHelpModal(true);
          setSpeechError("Microphone access blocked. Please allow microphone access in browser settings or use text mode.");
        } else if (err.error === "no-speech") {
          logSpeechEvent("No speech detected over time window. Listening engine waiting...");
        } else if (err.error !== "aborted") {
          if (!isListeningRef.current) {
            setSpeechError(`Speech recognition issue: ${err.error || "transient error"}. Keyboard fallback is ready.`);
          }
        }
      };

      rec.onend = () => {
        logSpeechEvent("Speech recognition engine session onend fired.");
        // Auto-reconnect if continuous listening is still active
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
            logSpeechEvent("Auto-restarted speech recognition session.");
            return;
          } catch (startErr) {
            setTimeout(() => {
              if (isListeningRef.current && recognitionRef.current) {
                try { 
                  recognitionRef.current.start(); 
                  logSpeechEvent("Auto-restarted speech recognition session after delay.");
                } catch (e) {}
              }
            }, 250);
            return;
          }
        }

        setIsListening(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
          try { mediaRecorderRef.current.stop(); } catch (e) {}
        }
      };

      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      logSpeechEvent("Speech recognition engine active and recording.");
    } catch (e: any) {
      console.error("Speech start error:", e);
      logSpeechEvent(`Speech engine start failed: ${e.message || e}`);
      isListeningRef.current = false;
      setIsListening(false);
      setSpeechError("Could not start voice recognition. Keyboard fallback mode is ready below.");
    }
  };

  const handleStartInterview = () => {
    if (selectedRole) {
      onGenerateQuestions(
        selectedRole,
        selectedCategory,
        selectedLevel,
        effectiveDomain,
        questionCount
      );
    }
  };

  const handleSubmitAnswer = () => {
    if (!userAnswerInput.trim() || !currentQuestion) return;

    if (isListening) stopListeningSession();

    // Final clean on submit
    const finalAnswerText = cleanFillersEnabled 
      ? formatAndCleanText(userAnswerInput, true) 
      : userAnswerInput;

    const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0);
    const verbalMetrics = {
      totalFillerCount: totalFillers,
      fillerCounts,
      sentimentLabel,
      sentimentScore,
      hesitationDuration,
      wordsPerMinute,
      audioUrl: lastRecordedAudio || undefined,
    };

    // Remove draft from storage on successful submission
    const draftKey = `vorynexa_draft_${currentQuestion.id || session.currentQuestionIndex}`;
    localStorage.removeItem(draftKey);

    onEvaluateAnswer(
      currentQuestion.question,
      finalAnswerText,
      currentQuestion.type,
      currentQuestion.expectedFocus,
      verbalMetrics,
      selectedCategory,
      selectedLevel,
      effectiveDomain
    );
  };

  const handleClarifyQuestion = async () => {
    if (!currentQuestion) return;
    setIsClarifying(true);
    setClarifyError(null);
    try {
      const res = await callServerEndpoint("/api/placement/interview/clarify", {
        question: currentQuestion.question,
        role: selectedRole,
        interviewType: selectedCategory,
        experienceLevel: selectedLevel,
        domain: effectiveDomain,
      });
      setClarificationData(res);
    } catch (e) {
      setClarifyError("Could not generate question hint. Please proceed with your response.");
    } finally {
      setIsClarifying(false);
    }
  };

  const handleDownloadPDFReport = async () => {
    const reportElement = document.getElementById("interview-report-export-container");
    if (!reportElement) return;

    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Vorynexa_AI_Interview_Report_${selectedRole.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Compute 8-dimension historical trends data
  const trendData = history.slice().reverse().map((h, i) => ({
    round: `Round ${i + 1}`,
    score: h.overallScore,
    communication: h.metrics?.communication ?? h.metrics?.communicationClarity ?? 70,
    technicalAccuracy: h.metrics?.technicalAccuracy ?? h.metrics?.technicalDepth ?? 70,
    confidence: h.metrics?.confidence ?? 70,
    grammar: h.metrics?.grammar ?? 70,
    professionalism: h.metrics?.professionalism ?? 70,
    problemSolving: h.metrics?.problemSolving ?? 70,
    depthOfKnowledge: h.metrics?.depthOfKnowledge ?? h.metrics?.technicalDepth ?? 70,
    behaviour: h.metrics?.behaviour ?? 70,
  }));

  // Compute completed session stats
  const completedAnswers = session.chatHistory.filter((item) => item.role === "student" && item.score !== undefined);
  const overallAverageScore = completedAnswers.length > 0
    ? Math.round(completedAnswers.reduce((sum, item) => sum + (item.score || 0), 0) / completedAnswers.length)
    : 0;

  const radarData = EVALUATION_DIMENSIONS.map((dim) => {
    const key = dim.id as keyof typeof EVALUATION_DIMENSIONS[number]["id"];
    const avg = completedAnswers.length > 0
      ? Math.round(completedAnswers.reduce((sum, item) => sum + (item.dimensions?.[key] ?? item[key] ?? 75), 0) / completedAnswers.length)
      : 75;
    return { subject: dim.label, score: avg, fullMark: 100 };
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enterprise AI Interview Studio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Universal Role & Domain Simulator
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Conduct high-stakes HR, Technical, Behavioural, Leadership & Domain-Specific interviews with 8-dimension AI evaluation and real-time mobile voice engine.
            </p>
          </div>

          {/* Microphone Permission Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              isListening
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse"
                : micPermissionState === "granted"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400"
                : micPermissionState === "denied"
                ? "bg-rose-950/40 border-rose-500/30 text-rose-400"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300"
            }`}>
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75" />
                  <Mic className="w-5 h-5 text-emerald-400 relative" />
                </div>
              ) : micPermissionState === "granted" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : micPermissionState === "denied" ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <MicOff className="w-5 h-5 text-amber-400" />
              )}
              
              <div className="text-xs">
                <span className="font-bold block uppercase tracking-wider text-[10px] opacity-70">Microphone Status</span>
                <span className="font-semibold font-mono">
                  {isListening
                    ? "Live Listening..."
                    : micPermissionState === "granted"
                    ? "Microphone Ready"
                    : micPermissionState === "denied"
                    ? "Access Denied"
                    : "Permission Needed"}
                </span>
              </div>

              {micPermissionState !== "granted" && !isListening && (
                <button
                  onClick={requestMicrophoneAccess}
                  className="ml-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-mono text-[11px] transition-all cursor-pointer"
                >
                  Enable Mic
                </button>
              )}
            </div>

            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
              title="Toggle Voice Diagnostics Panel"
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Voice Engine Logs</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveSubTab("practice")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "practice"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Active Studio</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab("trends")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "trends"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analytics & Trends ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "history"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white/5 hover:bg-white/10 text-slate-300"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Session Reports</span>
          </button>

          <button
            onClick={() => setShowQuickTips(true)}
            className="ml-auto px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Interview Prep Guide</span>
          </button>
        </div>
      </div>

      {/* VOICE DIAGNOSTICS & LOGS PANEL */}
      {showDiagnostics && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <strong className="text-white text-sm">Mobile Voice Engine Diagnostics & Event Log</strong>
            </div>
            <button
              onClick={() => setShowDiagnostics(false)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block uppercase">Browser Platform</span>
              <span className="font-bold text-indigo-300 break-all">{navigator.userAgent.includes("Android") ? "Android Chrome/Browser" : navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad") ? "iOS Safari" : "Desktop Browser"}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block uppercase">Web Speech API</span>
              <span className={`font-bold ${speechSupported ? "text-emerald-400" : "text-amber-400"}`}>{speechSupported ? "Supported (Natively)" : "Not Supported (Typed Mode)"}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block uppercase">Mic Stream State</span>
              <span className="font-bold text-white uppercase">{micPermissionState}</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 block uppercase">Audio Recorder</span>
              <span className="font-bold text-emerald-400">{typeof MediaRecorder !== "undefined" ? "MediaRecorder Available" : "Unavailable"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 uppercase text-[10px] font-bold">Timestamped Engine Event Logs</span>
              <button
                onClick={() => setSpeechLogs([])}
                className="text-[11px] text-slate-400 hover:text-rose-300 cursor-pointer"
              >
                Clear Logs
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 max-h-40 overflow-y-auto space-y-1 text-[11px] leading-snug text-slate-300">
              {speechLogs.length > 0 ? (
                speechLogs.map((log, idx) => (
                  <div key={idx} className="border-b border-slate-900 pb-1">{log}</div>
                ))
              ) : (
                <span className="text-slate-500 italic">No voice events logged yet. Tap "Start Voice Response" to test.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 1: PRACTICE STUDIO */}
      {activeSubTab === "practice" && (
        <div className="space-y-6">
          {/* STEP 1: INTERVIEW CONFIGURATION CARD (If Idle) */}
          {session.status === "idle" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <span>Configure Interview Session</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Select your category, candidate level, target domain, and question count to launch a role-specific simulation.
                </p>
              </div>

              {/* 1. Interview Category Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  1. Select Interview Category
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INTERVIEW_CATEGORIES.map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30"
                            : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-300"}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-white">{cat.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Candidate Experience Level */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  2. Select Candidate Experience Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((lvl) => {
                    const isSelected = selectedLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setSelectedLevel(lvl.id)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-950/60 border-indigo-500 text-white ring-2 ring-indigo-500/30"
                            : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-bold text-sm text-white block">{lvl.label}</span>
                        <span className="text-xs text-slate-400">{lvl.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Industry / Domain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    3. Target Industry / Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {DOMAINS_LIST.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  {selectedDomain === "Custom Domain" && (
                    <input
                      type="text"
                      placeholder="e.g., Renewable Energy Systems, Nuclear Physics, Aviation Safety"
                      value={customDomainText}
                      onChange={(e) => setCustomDomainText(e.target.value)}
                      className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>

                {/* Target Role & Question Count */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Target Role / Position Title
                    </label>
                    <input
                      type="text"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      placeholder="e.g., Senior Software Engineer, IAS Officer, Clinical Nurse Lead"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Number of Questions
                    </label>
                    <div className="flex gap-3">
                      {[3, 5, 7].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setQuestionCount(num)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            questionCount === num
                              ? "bg-indigo-600 border-indigo-500 text-white"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {num} Questions
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Action Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleStartInterview}
                  disabled={isGenerating || !selectedRole.trim()}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Generating Enterprise Interview Questions...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      <span>Launch AI Interview Studio</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ACTIVE QUESTION INTERVIEW STUDIO */}
          {session.status === "ongoing" && currentQuestion && (
            <div className="space-y-6">
              {/* Question Progress Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                      Question {session.currentQuestionIndex + 1} of {session.questions.length}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                      {currentQuestion.type?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                      {selectedCategory}
                    </span>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border ${
                      timeLeft <= 20
                        ? "bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}</span>
                    </div>

                    <button
                      onClick={handleClarifyQuestion}
                      disabled={isClarifying}
                      className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-mono text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isClarifying ? "Asking AI Coach..." : "Clarify / Hints"}</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Interview Progress ({Math.round(((session.currentQuestionIndex + (isQuestionAnswered ? 1 : 0)) / session.questions.length) * 100)}% Completed)</span>
                    <span>{session.chatHistory.filter((i) => i.role === "student").length} of {session.questions.length} Answered • ~{Math.max(1, (session.questions.length - session.currentQuestionIndex) * 2)} min remaining</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/50">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${Math.round(((session.currentQuestionIndex + (isQuestionAnswered ? 1 : 0)) / session.questions.length) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-3">
                  <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                    "{currentQuestion.question}"
                  </h3>

                  {currentQuestion.expectedFocus && (
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-mono block mb-0.5">Assessor Grading Focus:</strong>
                        <span>{currentQuestion.expectedFocus}</span>
                      </div>
                    </div>
                  )}

                  {/* Clarification Box */}
                  {clarificationData && (
                    <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs">
                      <strong className="text-indigo-300 font-mono block">AI Coach Clarification:</strong>
                      <p className="text-slate-200">{clarificationData.clarifiedQuestion}</p>
                      <div className="space-y-1 pt-2">
                        <span className="text-slate-400 font-mono text-[11px] block">Key Response Hints:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                          {clarificationData.helpfulHints.map((hint, idx) => (
                            <li key={idx}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Speech Error Banner */}
              {speechError && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block text-white font-mono">Microphone Notice</strong>
                      <p>{speechError}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={requestMicrophoneAccess}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                    >
                      Retry Permissions
                    </button>
                    <button
                      onClick={() => setSpeechError(null)}
                      className="text-rose-400 hover:text-rose-200 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Speech Notice Banner */}
              {speechNotice && (
                <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>{speechNotice}</span>
                  </div>
                  <button
                    onClick={() => setSpeechNotice(null)}
                    className="text-indigo-400 hover:text-indigo-200 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Answer Input Controls (Voice & Text) */}
              {!isQuestionAnswered ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Your Spoken / Typed Response
                      </label>
                      {isDraftRestored && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Draft Restored
                        </span>
                      )}
                    </div>

                    {/* Speech Options & Mic Toggle Button */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Filler Cleanup Toggle */}
                      <button
                        type="button"
                        onClick={() => setCleanFillersEnabled(!cleanFillersEnabled)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          cleanFillersEnabled
                            ? "bg-indigo-950/60 border-indigo-500/40 text-indigo-300"
                            : "bg-slate-800 border-slate-700 text-slate-400"
                        }`}
                        title="Automatically clean filler words (um, uh, like) while preserving technical terms"
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Fillers Clean: {cleanFillersEnabled ? "ON" : "OFF"}</span>
                      </button>

                      {/* Manual Clean Action */}
                      <button
                        type="button"
                        onClick={handleApplyCleanText}
                        disabled={!userAnswerInput.trim()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-mono font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Remove filler words and format tech terms now"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Format & Clean</span>
                      </button>

                      {/* Mic Button */}
                      <button
                        type="button"
                        onClick={handleToggleListening}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          isListening
                            ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-4 h-4" />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>Start Voice Response</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* REAL-TIME SPEECH SPECTRUM & LIVE DYNAMICS BAR */}
                  {isListening && (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 border border-emerald-500/40 space-y-3 animate-fade-in shadow-inner">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-300 tracking-wider uppercase">
                            Live Speech Audio Stream
                          </span>
                        </div>

                        {/* Real-time Spectrum Equalizer Bars */}
                        <div className="flex items-center gap-1 h-5 px-3 bg-slate-900/80 rounded-lg border border-slate-800">
                          {[30, 70, 45, 90, 60, 35, 80].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                              style={{
                                height: `${Math.max(15, Math.min(100, (audioVolumeLevel * (i % 2 === 0 ? 1.2 : 0.8))))}%`,
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Live Dynamics Gauges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Pace Speed</span>
                          <span className="font-bold text-white">{wordsPerMinute || "--"} WPM</span>
                        </div>

                        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Tone Sentiment</span>
                          <span className={`font-bold ${
                            sentimentLabel === "Confident" ? "text-emerald-400" : sentimentLabel === "Hesitant" ? "text-amber-400" : "text-indigo-300"
                          }`}>{sentimentLabel}</span>
                        </div>

                        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Audio Level</span>
                          <span className="font-bold text-emerald-400">{audioVolumeLevel}%</span>
                        </div>

                        <div className="p-2 bg-slate-900/60 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Silence Detector</span>
                          <span className="font-bold text-indigo-300">Auto-Pause (6s)</span>
                        </div>
                      </div>

                      {/* Live Streamed Interim Transcript */}
                      {interimTranscript && (
                        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/30 text-xs text-indigo-200 italic font-mono flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                          <span>Hearing: "{interimTranscript}"...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Answer Text Area Input */}
                  <div className="space-y-2 relative">
                    <textarea
                      rows={5}
                      value={userAnswerInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="Speak using the microphone or type your complete answer here... Use technical terminology, STAR methodology (Situation, Task, Action, Result) for best scoring."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans shadow-inner"
                    />

                    {/* Word Counter & Draft Controls */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                      <div className="flex items-center gap-3">
                        <span>{userAnswerInput.split(/\s+/).filter(Boolean).length} Words</span>
                        <span>•</span>
                        <span>{userAnswerInput.length} Characters</span>
                      </div>

                      {userAnswerInput.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearDraft}
                          className="text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear Text</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission & Action Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <span>Evaluated across 8 dimensions including technical accuracy & spoken fluency</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isEvaluating || !userAnswerInput.trim()}
                      className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Evaluating Answer & Verbal Fluency...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Answer for AI Grading</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Question Answered Feedback Card */
                <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white text-base">Answer Evaluated & Graded</h4>
                    </div>
                    <span className="text-xl font-black font-mono text-emerald-400">
                      Score: {currentAnswerItem?.score ?? 80}%
                    </span>
                  </div>

                  {/* Candidate Response Recorded */}
                  <div className="space-y-2">
                    <strong className="text-xs font-mono uppercase text-slate-400 block">Your Recorded Answer:</strong>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-200 leading-relaxed">
                      {currentAnswerItem?.text}
                    </div>

                    {(currentAnswerItem?.audioUrl || lastRecordedAudio) && (
                      <div className="pt-2 flex items-center gap-3">
                        <audio controls src={currentAnswerItem?.audioUrl || lastRecordedAudio || undefined} className="h-8 max-w-xs" />
                        <span className="text-xs text-slate-400 font-mono">Recorded Voice Clip</span>
                      </div>
                    )}
                  </div>

                  {/* AI Feedback */}
                  <div className="space-y-2">
                    <strong className="text-xs font-mono uppercase text-indigo-400 block">AI Assessor Evaluation & Insights:</strong>
                    <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/30 text-xs text-slate-200 leading-relaxed">
                      {currentAnswerItem?.feedback}
                    </div>
                  </div>

                  {/* Next Question / Finish Session Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={onNextQuestion}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{session.currentQuestionIndex + 1 < session.questions.length ? "Proceed to Next Question" : "View Final Assessment Report"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: COMPLETED REPORT VIEW */}
          {session.status === "completed" && (
            <div id="interview-report-export-container" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
              {/* Report Header & Download Action */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>Official Assessment Report</span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedRole} — Executive Evaluation
                  </h2>
                  <p className="text-xs text-slate-400">
                    Candidate: {profile.name} • Session Date: {new Date().toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPDFReport}
                    disabled={isExportingPdf}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isExportingPdf ? "Generating PDF..." : "Export Official PDF Report"}</span>
                  </button>

                  <button
                    onClick={onResetInterview}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>New Session</span>
                  </button>
                </div>
              </div>

              {/* Hiring Recommendation & Overall Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider block">Overall Readiness Score</span>
                    <span className="text-4xl md:text-5xl font-black text-white font-mono mt-1 block">{overallAverageScore}%</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Hiring Recommendation</span>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      overallAverageScore >= 80
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : overallAverageScore >= 65
                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                        : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    }`}>
                      {overallAverageScore >= 80 ? "Strongly Recommend Hire" : overallAverageScore >= 65 ? "Hire with Coaching" : "Needs Practice"}
                    </span>
                  </div>
                </div>

                {/* Radar Chart Visualizer */}
                <div className="md:col-span-2 p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">
                    8-Dimension Readiness Breakdown
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                        <Radar name="Candidate" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Question-by-Question Breakdown Table */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Question-by-Question Assessment Audit</span>
                </h3>

                <div className="space-y-4">
                  {completedAnswers.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-800/50 border border-slate-700/60 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-700/60 pb-3">
                        <span className="font-bold text-sm text-white">Q{idx + 1}: {session.questions[idx]?.question}</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{item.score}%</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <strong className="text-slate-400 font-mono block">Candidate Response:</strong>
                        <p className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-xl text-slate-200 leading-relaxed">
                          {item.text}
                        </p>

                        {/* Audio Playback Player if available */}
                        {item.audioUrl && (
                          <div className="pt-1 flex items-center gap-3">
                            <audio controls src={item.audioUrl} className="h-8 max-w-xs" />
                            <span className="text-[11px] text-slate-400 font-mono">Recorded Voice Answer</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <strong className="text-indigo-400 font-mono block">AI Feedback & Nuances:</strong>
                        <p className="text-slate-300 leading-relaxed">{item.feedback}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: ANALYTICS & TRENDS */}
      {activeSubTab === "trends" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <span>Historical Session Performance Trends</span>
            </h2>
            <p className="text-xs text-slate-400">
              Track your score progress across past mock rounds over time.
            </p>
          </div>

          {trendData.length > 0 ? (
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="round" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#fff" }} />
                  <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} name="Overall Score" />
                  <Line type="monotone" dataKey="communication" stroke="#34d399" strokeWidth={2} name="Communication" />
                  <Line type="monotone" dataKey="technicalAccuracy" stroke="#f59e0b" strokeWidth={2} name="Technical Accuracy" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl text-slate-400 text-xs">
              No historical session trends recorded yet. Complete your first mock round to track score progress.
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: PAST SESSION REPORTS */}
      {activeSubTab === "history" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>Past Interview Records ({history.length})</span>
            </h2>
            <p className="text-xs text-slate-400">
              Review and export completed candidate interview sessions.
            </p>
          </div>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((h) => {
                const isExpanded = expandedPastSessionId === h.id;
                return (
                  <div key={h.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/40">
                    <button
                      onClick={() => setExpandedPastSessionId(isExpanded ? null : h.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/80 transition-all cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-white block">{h.role}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(h.timestamp).toLocaleDateString()} • Category: {h.category || "Technical"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-lg font-black font-mono text-emerald-400">{h.overallScore}%</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-900/80">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2.5 bg-slate-800 rounded-lg">
                            <span className="text-slate-400 font-mono block text-[10px] uppercase">Communication</span>
                            <span className="font-bold text-indigo-400 font-mono">{h.metrics?.communication ?? 75}%</span>
                          </div>
                          <div className="p-2.5 bg-slate-800 rounded-lg">
                            <span className="text-slate-400 font-mono block text-[10px] uppercase">Technical Accuracy</span>
                            <span className="font-bold text-emerald-400 font-mono">{h.metrics?.technicalAccuracy ?? 75}%</span>
                          </div>
                          <div className="p-2.5 bg-slate-800 rounded-lg">
                            <span className="text-slate-400 font-mono block text-[10px] uppercase">Confidence</span>
                            <span className="font-bold text-amber-400 font-mono">{h.metrics?.confidence ?? 75}%</span>
                          </div>
                          <div className="p-2.5 bg-slate-800 rounded-lg">
                            <span className="text-slate-400 font-mono block text-[10px] uppercase">Problem Solving</span>
                            <span className="font-bold text-purple-400 font-mono">{h.metrics?.problemSolving ?? 75}%</span>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          {h.questionsAndAnswers?.map((qa, idx) => (
                            <div key={idx} className="p-3.5 bg-slate-800/50 rounded-xl space-y-3 text-xs border border-slate-700/50">
                              <span className="font-bold text-white block">Q{idx + 1}: {qa.question}</span>
                              <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">{qa.answer}</p>

                              {/* Recorded Audio Playback & Self-Critique Studio */}
                              {qa.audioUrl ? (
                                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-indigo-300 font-bold font-mono text-[11px] flex items-center gap-1.5">
                                      <Headphones className="w-3.5 h-3.5 text-indigo-400" /> Playback Answer Audio & Self-Critique Tone
                                    </span>
                                    <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/30">
                                      Recorded Speech
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <audio controls src={qa.audioUrl} className="w-full h-8 rounded" />
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-indigo-500/20 text-[10px]">
                                    <span className="text-slate-400 font-mono">Critique Focus:</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Pace & Pauses</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Vocal Confidence</span>
                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Filler Word Frequency</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 font-mono">
                                  <VolumeX className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  Text response logged (Microphone was off or audio recording was skipped for this question).
                                </div>
                              )}

                              <div className="space-y-1">
                                <span className="text-indigo-400 font-mono font-bold text-[10px] uppercase block">AI Evaluation & Critique:</span>
                                <p className="text-slate-300 leading-relaxed">{qa.feedback}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-800/40 rounded-xl text-slate-400 text-xs">
              No past sessions saved yet.
            </div>
          )}
        </div>
      )}

      {/* MICROPHONE TROUBLESHOOTING & HELP MODAL */}
      {showMicHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <MicOff className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Microphone Access Troubleshooting</h3>
              </div>
              <button
                onClick={() => setShowMicHelpModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <p className="text-slate-300 leading-relaxed">
                Your browser or system settings are currently blocking microphone permissions. Follow these platform steps to enable audio:
              </p>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <strong className="text-emerald-400 font-mono block text-xs">Android Chrome / Edge:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Tap the <strong>lock icon 🔒</strong> next to the URL in the address bar.</li>
                  <li>Select <strong>Site Settings</strong> &rarr; <strong>Permissions</strong>.</li>
                  <li>Tap <strong>Microphone</strong> and set it to <strong>Allow</strong>.</li>
                  <li>Refresh this page or tap "Retry Mic Access" below.</li>
                </ol>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <strong className="text-indigo-300 font-mono block text-xs">iOS Safari / WebKit:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Tap the <strong>aA</strong> icon in the Safari address bar.</li>
                  <li>Select <strong>Website Settings</strong>.</li>
                  <li>Change <strong>Microphone</strong> from Ask/Block to <strong>Allow</strong>.</li>
                  <li>Tap Done and reload the page.</li>
                </ol>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-[11px]">
                💡 <strong>Typed Fallback Always Active:</strong> You can continue your mock interview anytime by typing directly into the response text box without microphone access!
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMicHelpModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                Use Text Input Mode
              </button>
              <button
                onClick={requestMicrophoneAccess}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Retry Mic Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREP GUIDE / QUICK TIPS MODAL OVERLAY */}
      {showQuickTips && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-lg">Interview Master Guide</h3>
              </div>
              <button
                onClick={() => setShowQuickTips(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-2">
                <strong className="text-indigo-300 font-mono block text-sm">STAR Method Guide</strong>
                <p className="text-slate-200 leading-relaxed">
                  <strong>Situation:</strong> Set the scene & context.<br />
                  <strong>Task:</strong> State the key goal or difficulty.<br />
                  <strong>Action (60%):</strong> Detail YOUR specific personal contributions.<br />
                  <strong>Result:</strong> Conclude with hard metrics and impact.
                </p>
              </div>

              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                <strong className="text-amber-300 font-mono block text-sm">Spoken Fluency Tips</strong>
                <p className="text-slate-200 leading-relaxed">
                  • Target conversational speed: 120 - 140 WPM.<br />
                  • Replace filler words ("um", "like", "basically") with 1-second deliberate silent pauses.<br />
                  • Pause for 3 seconds before responding to demonstrate composure and critical thought.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewSimulator;
