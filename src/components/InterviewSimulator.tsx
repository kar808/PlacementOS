import React, { useState, useEffect, useRef } from "react";
import { MockInterviewQuestion, StudentProfile, MockInterviewSession, PastInterviewSession } from "../types";
import { 
  MessageSquare, Play, Send, RefreshCw, Star, ArrowRight, 
  CheckCircle2, ChevronDown, ChevronUp, Brain, Mic, MicOff, 
  AlertTriangle, Sparkles, Activity, History, Award, BookOpen,
  Volume2, HelpCircle, Clock, Headphones, Pause, PlayCircle,
  Lightbulb, Zap, X, Compass, Copy, Check
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
  Tooltip
} from "recharts";

interface InterviewSimulatorProps {
  profile: StudentProfile;
  session: MockInterviewSession;
  history?: PastInterviewSession[];
  onGenerateQuestions: (role: string) => Promise<void>;
  onEvaluateAnswer: (question: string, answer: string, type: string, focus: string, verbalMetrics?: any) => Promise<void>;
  onNextQuestion: () => void;
  onResetInterview: () => void;
  isGenerating: boolean;
  isEvaluating: boolean;
  callServerEndpoint: (endpoint: string, body: any) => Promise<any>;
}

export default function InterviewSimulator({
  profile,
  session,
  history = [],
  onGenerateQuestions,
  onEvaluateAnswer,
  onNextQuestion,
  onResetInterview,
  isGenerating,
  isEvaluating,
  callServerEndpoint,
}: InterviewSimulatorProps) {
  const [selectedRole, setSelectedRole] = useState(profile.targetRoles[0] || "");
  const [userAnswerInput, setUserAnswerInput] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"practice" | "trends" | "audio-review" | "history">("practice");
  const [expandedPastSessionId, setExpandedPastSessionId] = useState<string | null>(null);

  // Floating Quick Tips Toggle Overlay state
  const [showQuickTips, setShowQuickTips] = useState<boolean>(false);
  const [quickTipsCategory, setQuickTipsCategory] = useState<"round" | "speech" | "formulas" | "mindset">("round");
  const [copiedScriptIndex, setCopiedScriptIndex] = useState<number | null>(null);

  // Active question countdown timer
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Audio Review Checklist selected state (to let users toggle self-reflection criteria per audio)
  const [reflectionChecked, setReflectionChecked] = useState<Record<string, Record<string, boolean>>>({});
  const [selectedAudioKey, setSelectedAudioKey] = useState<string | null>(null);

  // Audio Recording states and refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [lastRecordedAudio, setLastRecordedAudio] = useState<string | null>(null);

  // AI Question Clarification states
  const [clarificationData, setClarificationData] = useState<{ clarifiedQuestion: string; helpfulHints: string[] } | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarifyError, setClarifyError] = useState<string | null>(null);

  // Web Speech API and live analytics states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [fillerCounts, setFillerCounts] = useState<Record<string, number>>({
    um: 0,
    uh: 0,
    like: 0,
    actually: 0,
    basically: 0,
    so: 0,
  });
  const [sentimentLabel, setSentimentLabel] = useState<"Confident" | "Constructive" | "Hesitant">("Constructive");
  const [sentimentScore, setSentimentScore] = useState(50); // 0-100 scale

  // NEW: Fluency and verbal speed metrics tracking
  const [hesitationDuration, setHesitationDuration] = useState(0); // in seconds
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const speechStartTimeRef = useRef<number | null>(null);
  const lastSpeechTimestampRef = useRef<number | null>(null);

  const recognitionRef = useRef<any>(null);
  const baseTranscriptRef = useRef<string>("");

  const currentQuestion: MockInterviewQuestion | undefined = session.questions[session.currentQuestionIndex];
  const lastHistoryItem = session.chatHistory[session.chatHistory.length - 1];
  const isQuestionAnswered = lastHistoryItem?.role === "student" && lastHistoryItem.feedback !== undefined;

  // Check speech recognition support and initialize
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Reset voice and fluency metrics on new question rounds
  useEffect(() => {
    setUserAnswerInput("");
    setFillerCounts({
      um: 0,
      uh: 0,
      like: 0,
      actually: 0,
      basically: 0,
      so: 0,
    });
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
  }, [session.currentQuestionIndex]);

  // Countdown timer ticking interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && session.status === "ongoing" && !isQuestionAnswered) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, session.status, isQuestionAnswered]);

  // Sync state analysis when text inputs are manually updated too
  const handleInputChange = (val: string) => {
    setUserAnswerInput(val);
    analyzeSpeechDynamics(val);
    if (!isTimerActive && val.trim()) {
      setIsTimerActive(true); // Auto-resume timer if they type
    }
  };

  const analyzeSpeechDynamics = (text: string) => {
    const lowerText = text.toLowerCase();

    // Track filler words
    const fillers = ["um", "uh", "like", "actually", "basically", "so"];
    const counts: Record<string, number> = {
      um: 0,
      uh: 0,
      like: 0,
      actually: 0,
      basically: 0,
      so: 0,
    };

    fillers.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lowerText.match(regex);
      counts[word] = matches ? matches.length : 0;
    });
    setFillerCounts(counts);

    // Dynamic Sentiment & Confidence scoring
    const positiveWords = ["achieved", "solved", "optimized", "managed", "created", "success", "improved", "strong", "leadership", "impact", "delivered", "coordinated", "resolved", "helped", "teamwork", "effectively"];
    const hesitantWords = ["difficult", "fail", "failed", "scared", "wrong", "late", "worried", "nervous", "stuck", "bad", "broke", "error", "maybe", "probably", "guess", "don't know"];

    let positiveCount = 0;
    let hesitantCount = 0;

    positiveWords.forEach(w => {
      const regex = new RegExp(`\\b${w}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    hesitantWords.forEach(w => {
      const regex = new RegExp(`\\b${w}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) hesitantCount += matches.length;
    });

    // Base score is 50, goes up with positive terms, down with filler frequencies & hesitant words
    const totalFillers = Object.values(counts).reduce((a, b) => a + b, 0);
    let calculated = 50 + (positiveCount * 12) - (hesitantCount * 8) - (totalFillers * 4);
    calculated = Math.max(15, Math.min(98, calculated));

    setSentimentScore(calculated);

    if (calculated >= 68) {
      setSentimentLabel("Confident");
    } else if (calculated <= 40) {
      setSentimentLabel("Hesitant");
    } else {
      setSentimentLabel("Constructive");
    }
  };

  const handleToggleListening = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recognition:", e);
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error("Error stopping media recorder:", e);
        }
      }
      setIsListening(false);
    } else {
      setIsTimerActive(true); // Auto-resume countdown timer if they speak!
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechError("Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
        return;
      }

      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event: any) => {
          let sessionTranscript = "";
          for (let i = 0; i < event.results.length; ++i) {
            sessionTranscript += event.results[i][0].transcript + " ";
          }
          const combined = (baseTranscriptRef.current + " " + sessionTranscript).replace(/\s+/g, " ").trim();
          setUserAnswerInput(combined);
          analyzeSpeechDynamics(combined);

          // Calculate real-time words-per-minute (WPM)
          const now = Date.now();
          if (speechStartTimeRef.current) {
            const elapsedSeconds = (now - speechStartTimeRef.current) / 1000;
            const wordCount = combined.split(/\s+/).filter(Boolean).length;
            if (elapsedSeconds > 1.5 && wordCount > 0) {
              const currentWpm = Math.round((wordCount / elapsedSeconds) * 60);
              // Constrain WPM to realistic conversational speech boundaries
              setWordsPerMinute(Math.min(220, Math.max(30, currentWpm)));
            }
          }

          // Track conversational hesitation pauses (silence gaps)
          if (lastSpeechTimestampRef.current) {
            const silenceGap = (now - lastSpeechTimestampRef.current) / 1000;
            if (silenceGap > 1.2 && silenceGap < 8.0) {
              setHesitationDuration((prev) => prev + Math.round(silenceGap));
            }
          }
          lastSpeechTimestampRef.current = now;
        };

        rec.onerror = (err: any) => {
          console.error("Speech recognition error:", err);
          setIsListening(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            try { mediaRecorderRef.current.stop(); } catch (e) {}
          }
          if (err.error === "not-allowed") {
            setSpeechError("Microphone access is blocked or not allowed. Please click 'Allow' on your browser's prompt or grant microphone permissions in your browser's settings.");
          } else if (err.error === "no-speech") {
            setSpeechError("No speech detected. Please check your microphone connection or speak closer and more clearly.");
          } else if (err.error === "audio-capture") {
            setSpeechError("No working microphone hardware detected. Please connect recording headphones or a mic.");
          } else if (err.error === "network") {
            setSpeechError("Network communication error with browser's speech engine.");
          } else if (err.error !== "aborted") {
            setSpeechError(`Speech recognition error: ${err.error || "unknown"}. Please try again or type your answer.`);
          }
        };

        rec.onend = () => {
          setIsListening(false);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            try { mediaRecorderRef.current.stop(); } catch (e) {}
          }
        };

        baseTranscriptRef.current = userAnswerInput;
        speechStartTimeRef.current = Date.now();
        lastSpeechTimestampRef.current = Date.now();

        // Initialize MediaRecorder alongside SpeechRecognition
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              let recorderOptions = {};
              try {
                if (MediaRecorder.isTypeSupported('audio/webm')) {
                  recorderOptions = { mimeType: 'audio/webm' };
                } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                  recorderOptions = { mimeType: 'audio/ogg' };
                }
              } catch (e) {}

              const mediaRecorder = new MediaRecorder(stream, recorderOptions);
              mediaRecorderRef.current = mediaRecorder;
              audioChunksRef.current = [];

              mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  audioChunksRef.current.push(e.data);
                }
              };

              mediaRecorder.onstop = () => {
                const mimeType = mediaRecorder.mimeType || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                  const base64Audio = reader.result as string;
                  setLastRecordedAudio(base64Audio);
                };
                // Stop all tracks in stream to release microphone icon
                stream.getTracks().forEach(t => t.stop());
              };

              mediaRecorder.start();
            })
            .catch(err => {
              console.error("Audio recording permission or device error:", err);
            });
        }

        rec.start();
        recognitionRef.current = rec;
        setIsListening(true);
      } catch (e: any) {
        console.error("Speech start error:", e);
        setSpeechError("Could not start speech recognition: please make sure your microphone is connected and authorized.");
      }
    }
  };

  const handleStartMock = () => {
    if (selectedRole) {
      onGenerateQuestions(selectedRole);
    }
  };

  const handleNextQuestion = () => {
    if (isListening && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    onNextQuestion();
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerInput.trim()) return;

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    onEvaluateAnswer(
      currentQuestion.question,
      userAnswerInput,
      currentQuestion.type,
      currentQuestion.expectedFocus,
      {
        fillerCounts,
        sentimentScore,
        sentimentLabel,
        hesitationDuration,
        wordsPerMinute,
        totalFillerCount: (Object.values(fillerCounts) as number[]).reduce((a, b) => a + b, 0),
        audioUrl: lastRecordedAudio || undefined,
      }
    );
    setUserAnswerInput("");
    setSpeechError(null);
    setFillerCounts({
      um: 0,
      uh: 0,
      like: 0,
      actually: 0,
      basically: 0,
      so: 0,
    });
    setSentimentScore(50);
    setSentimentLabel("Constructive");
    setHesitationDuration(0);
    setWordsPerMinute(0);
  };

  const handleClarifyQuestion = async () => {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) return;
    setIsClarifying(true);
    setClarifyError(null);
    setIsTimerActive(false); // Pause the countdown timer!
    try {
      const data = await callServerEndpoint("/api/placement/interview/clarify", {
        question: currentQuestion.question,
        type: currentQuestion.type,
        expectedFocus: currentQuestion.expectedFocus,
      });
      setClarificationData(data);
    } catch (err: any) {
      console.error("Clarification error:", err);
      setClarifyError(err.message || "An unknown error occurred.");
    } finally {
      setIsClarifying(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20 font-mono";
      case "behavioral":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20 font-mono";
    }
  };

  // Helper to compile Radar Chart data for active completed session
  const getActiveRadarData = () => {
    const studentAnswers = session.chatHistory.filter(c => c.role === "student" && c.score !== undefined);
    if (studentAnswers.length === 0) return [];
    
    const avgTech = Math.round(studentAnswers.reduce((sum, item) => sum + (item.technicalDepth || 0), 0) / studentAnswers.length);
    const avgComm = Math.round(studentAnswers.reduce((sum, item) => sum + (item.communicationClarity || 0), 0) / studentAnswers.length);
    const avgConf = Math.round(studentAnswers.reduce((sum, item) => sum + (item.confidence || 0), 0) / studentAnswers.length);

    return [
      { subject: "Technical Depth", value: avgTech },
      { subject: "Communication Clarity", value: avgComm },
      { subject: "Confidence", value: avgConf }
    ];
  };

  // Helper to compile Radar Chart data for overall historical performance
  const getHistoricalRadarData = () => {
    if (history.length === 0) return [];
    const total = history.length;
    
    const avgTech = Math.round(history.reduce((sum, item) => sum + (item.metrics.technicalDepth || 0), 0) / total);
    const avgComm = Math.round(history.reduce((sum, item) => sum + (item.metrics.communicationClarity || 0), 0) / total);
    const avgConf = Math.round(history.reduce((sum, item) => sum + (item.metrics.confidence || 0), 0) / total);

    return [
      { subject: "Technical Depth", value: avgTech },
      { subject: "Communication Clarity", value: avgComm },
      { subject: "Confidence", value: avgConf }
    ];
  };

  const activeRadarData = getActiveRadarData();
  const historicalRadarData = getHistoricalRadarData();

  // Extract all historical answers with recorded audio files for review
  const recordedAnswers = (history || []).flatMap((past) => 
    (past.questionsAndAnswers || [])
      .filter((qa) => qa.audioUrl)
      .map((qa, index) => ({
        ...qa,
        sessionRole: past.role,
        sessionTimestamp: past.timestamp,
        sessionId: past.id,
        index,
      }))
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Only visible when not in an ongoing active interview */}
      {session.status !== "ongoing" && (
        <div className="flex border-b border-white/10 pb-1 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("practice")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative shrink-0 ${
              activeSubTab === "practice" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Practice Simulator
          </button>
          <button
            onClick={() => setActiveSubTab("trends")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative shrink-0 ${
              activeSubTab === "trends" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Performance Trends
          </button>
          <button
            onClick={() => setActiveSubTab("audio-review")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative shrink-0 ${
              activeSubTab === "audio-review" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Headphones className="w-3.5 h-3.5" /> Audio Review ({recordedAnswers.length})
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative shrink-0 ${
              activeSubTab === "history" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <History className="w-3.5 h-3.5" /> Mistakes & History Log ({history.length})
          </button>
        </div>
      )}

      {/* SUB-TAB 1: PRACTICE SIMULATOR */}
      {(activeSubTab === "practice" || session.status === "ongoing") && (
        <div className="space-y-8">
          {/* Starting Setup */}
          {session.status === "idle" && (
            <div className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-xl shadow-lg text-center max-w-2xl mx-auto space-y-6 my-6">
              <div className="w-12 h-12 bg-white/5 text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-extrabold">Mock Interview Simulator</h3>
                <p className="text-white/60 text-xs mt-1 max-w-md mx-auto leading-relaxed font-semibold">
                  Simulate standard technical, behavioral, and situational HR interview questions customized to your specific background and constraints.
                </p>
              </div>

              <div className="space-y-4 max-w-sm mx-auto text-left">
                <div>
                  <label className="block text-[10px] font-black text-white/40 font-mono uppercase tracking-widest mb-1">Select Interview Role Target</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full text-xs border border-white/10 rounded-lg px-3 py-2 text-white bg-black/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {profile.targetRoles.map((role) => (
                      <option key={role} value={role} className="bg-[#111] text-white">
                        {role}
                      </option>
                    ))}
                    {!profile.targetRoles.includes(selectedRole) && selectedRole && (
                      <option value={selectedRole} className="bg-[#111] text-white">{selectedRole}</option>
                    )}
                    {profile.targetRoles.length === 0 && <option value="" className="bg-[#111] text-white">Select target role</option>}
                  </select>
                </div>

                <button
                  onClick={handleStartMock}
                  disabled={isGenerating || !selectedRole}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Tailoring Questions...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Launch Mock Interview Round
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Ongoing Interview Chat */}
          {session.status === "ongoing" && currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question and Input Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3 gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getQuestionTypeLabel(currentQuestion.type)}`}>
                        {currentQuestion.type} ROUND
                      </span>
                      <span className="text-xs text-white/40 font-semibold font-mono shrink-0 hidden sm:inline">
                        Question {session.currentQuestionIndex + 1} of {session.questions.length}
                      </span>
                    </div>

                    {/* Countdown Timer with Pause/Play Controls */}
                    {!isQuestionAnswered && (
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-black/40 border border-white/10 rounded-lg text-xs font-mono font-bold text-white shrink-0">
                        <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsTimerActive((prev) => !prev)}
                          className="p-0.5 hover:bg-white/5 rounded text-white/60 hover:text-white transition-all cursor-pointer border-none bg-transparent flex items-center justify-center"
                          title={isTimerActive ? "Pause Timer" : "Resume Timer"}
                        >
                          {isTimerActive ? (
                            <Pause className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Play className="w-3 h-3 text-emerald-400" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Quick Tips Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowQuickTips((prev) => !prev)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 hover:from-amber-500/25 hover:to-cyan-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-sm shrink-0"
                      title="Toggle Communication Quick Tips"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>Quick Tips</span>
                    </button>

                    <button onClick={onResetInterview} className="text-xs text-rose-400 hover:text-rose-300 font-bold font-mono cursor-pointer bg-transparent border-none shrink-0">
                      Exit Mock
                    </button>
                  </div>

                  {/* Chat display */}
                  <div className="space-y-4">
                    {/* Question bubble */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white/5 border border-white/10 text-emerald-400 rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0">
                        HR
                      </div>
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 max-w-[85%] space-y-3 w-full">
                        <p className="text-sm text-white/90 font-semibold leading-relaxed">
                          "{currentQuestion.question}"
                        </p>
                        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-white/50 font-mono">
                          <Brain className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                          <span>
                            <strong className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] mr-1">Recruiter Tip:</strong> They are looking for: {currentQuestion.expectedFocus}
                          </span>
                        </div>

                        {/* Clarification Button & AI Response */}
                        {!isQuestionAnswered && (
                          <div className="border-t border-white/5 pt-3 mt-3 space-y-3">
                            {!clarificationData ? (
                              <button
                                type="button"
                                onClick={handleClarifyQuestion}
                                disabled={isClarifying}
                                className="px-3 py-1.5 bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/20 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {isClarifying ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simplifying Question...
                                  </>
                                ) : (
                                  <>
                                    <HelpCircle className="w-3.5 h-3.5" /> Ask for Clarification
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="bg-[#38bdf8]/5 border border-[#38bdf8]/10 rounded-lg p-3 space-y-2 text-xs">
                                <span className="text-[9px] font-black font-mono text-[#38bdf8] uppercase tracking-widest flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5" /> AI Coach Clarification
                                </span>
                                <div className="text-white/80 leading-relaxed font-semibold">
                                  <strong className="text-white">Simplified:</strong> "{clarificationData.clarifiedQuestion}"
                                </div>
                                <div className="space-y-1 mt-2">
                                  <span className="text-[9px] font-black font-mono text-white/40 uppercase">Actionable Hints:</span>
                                  <ul className="list-disc pl-4 space-y-1 text-white/60 font-semibold">
                                    {clarificationData.helpfulHints.map((hint, idx) => (
                                      <li key={idx}>{hint}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {clarifyError && (
                              <p className="text-[10px] text-rose-400 font-semibold font-mono">{clarifyError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* If already answered, show student answer */}
                    {isQuestionAnswered && (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="bg-emerald-500/10 text-emerald-300 rounded-xl p-4 max-w-[85%] text-left shadow-lg border border-emerald-500/20">
                          <p className="text-sm text-emerald-300 font-medium">
                            {lastHistoryItem.text}
                          </p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-500 text-black rounded-lg flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          ST
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Text Input for user with live verbal coaching analytics */}
                  {!isQuestionAnswered && (
                    <div className="border-t border-white/10 pt-5 space-y-4">
                      {/* Verbal Coaching Control Center */}
                      <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                          <div>
                            <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Verbal Speech Simulator
                            </h4>
                            <p className="text-[10px] text-white/50 leading-normal font-semibold">
                              Practice speaking out loud. We track filler speech patterns, confidence scores, and sentiment.
                            </p>
                          </div>

                          {speechSupported ? (
                            <button
                              type="button"
                              id="btn-voice-toggle"
                              onClick={handleToggleListening}
                              className={`px-4 py-2 text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                                isListening
                                  ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {isListening ? (
                                <>
                                  <MicOff className="w-4 h-4" /> Stop Recording
                                </>
                              ) : (
                                <>
                                  <Mic className="w-4 h-4" /> Start Speaking
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Speech API Unavailable
                            </div>
                          )}
                        </div>

                        {speechError && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2.5 text-rose-300 text-[11px] leading-relaxed">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                            <div className="flex-1">
                              <span className="font-bold text-rose-200">Microphone Issue:</span> {speechError}
                              <button 
                                type="button"
                                onClick={() => setSpeechError(null)}
                                className="ml-2.5 font-mono text-[9px] uppercase tracking-wider underline opacity-60 hover:opacity-100 font-bold text-rose-400"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Real-time metrics grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Filler word tracker */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono">Filler Word Frequency</span>
                            <div className="grid grid-cols-3 gap-2">
                              {(Object.entries(fillerCounts) as [string, number][]).map(([word, count]) => (
                                <div
                                  key={word}
                                  className={`p-2 rounded-lg border text-center transition-colors ${
                                    count > 0
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                      : "bg-white/[0.02] border-white/5 text-white/40"
                                  }`}
                                >
                                  <div className="text-[9px] font-mono uppercase font-bold">{word}</div>
                                  <div className="text-sm font-black font-mono mt-0.5">{count}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Confidence & Sentiment Gauge */}
                          <div className="space-y-2 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono block">Speech Confidence Indicator</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs font-black font-mono uppercase ${
                                  sentimentLabel === "Confident"
                                    ? "text-emerald-400"
                                    : sentimentLabel === "Hesitant"
                                    ? "text-rose-400"
                                    : "text-amber-400"
                                }`}>
                                  {sentimentLabel}
                                </span>
                                <span className="text-xs font-bold text-white/60 font-mono">{sentimentScore}%</span>
                              </div>
                            </div>

                            {/* Gauge bar */}
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  sentimentLabel === "Confident"
                                    ? "bg-emerald-500"
                                    : sentimentLabel === "Hesitant"
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${sentimentScore}%` }}
                              />
                            </div>

                            <p className="text-[9px] text-white/40 font-semibold leading-relaxed mt-1">
                              {sentimentLabel === "Confident"
                                ? "Excellent action-verb power and metric references. Keep verbalizing."
                                : sentimentLabel === "Hesitant"
                                ? "Try avoiding words like 'worried', 'fail', or repeating fillers. Take deep breaths."
                                : "Good conversational tone. Inject additional performance metrics."}
                            </p>
                          </div>

                          {/* Speech Fluency & Pacing */}
                          <div className="space-y-2 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest font-mono block">Speech Fluency & Pacing</span>
                              <div className="grid grid-cols-2 gap-2 mt-1.5">
                                <div className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                                  <div className="text-[8px] font-mono text-white/40 uppercase font-black">Speaking Rate</div>
                                  <div className="text-xs font-black text-white mt-0.5 font-mono">
                                    {wordsPerMinute > 0 ? `${wordsPerMinute} WPM` : "—"}
                                  </div>
                                  {wordsPerMinute > 0 && (
                                    <div className={`text-[8px] font-bold font-mono mt-0.5 ${
                                      wordsPerMinute >= 110 && wordsPerMinute <= 150
                                        ? "text-emerald-400"
                                        : wordsPerMinute > 150
                                        ? "text-amber-400"
                                        : "text-sky-400"
                                    }`}>
                                      {wordsPerMinute >= 110 && wordsPerMinute <= 150
                                        ? "Optimal"
                                        : wordsPerMinute > 150
                                        ? "Fast Pace"
                                        : "Deliberate"}
                                    </div>
                                  )}
                                </div>
                                <div className="p-2 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                                  <div className="text-[8px] font-mono text-white/40 uppercase font-black">Hesitations</div>
                                  <div className="text-xs font-black text-white mt-0.5 font-mono">
                                    {hesitationDuration}s
                                  </div>
                                  <div className={`text-[8px] font-bold font-mono mt-0.5 ${
                                    hesitationDuration === 0
                                      ? "text-emerald-400"
                                      : hesitationDuration < 5
                                      ? "text-amber-400"
                                      : "text-rose-400"
                                  }`}>
                                    {hesitationDuration === 0
                                      ? "Fluent Flow"
                                      : hesitationDuration < 5
                                      ? "Minor Pauses"
                                      : "Needs Pacing"}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-[9px] text-white/40 font-semibold leading-relaxed mt-1">
                              Aim for 110-150 words per minute. Pause briefly to organize your structural STAR achievements.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Manual / Transcribed drafting canvas */}
                      <form onSubmit={handleSubmitAnswer} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest font-mono text-[9px] mb-1.5 flex items-center justify-between gap-2 overflow-x-auto">
                            <span>Answer Draft</span>
                            {timeLeft === 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black font-mono rounded-full uppercase tracking-wider animate-pulse shrink-0">
                                <AlertTriangle className="w-2.5 h-2.5" /> Recommended 2-min exceeded
                              </span>
                            )}
                            {isListening && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black font-mono rounded-full animate-pulse uppercase tracking-wider shrink-0">
                                <span className="w-1 h-1 rounded-full bg-rose-500 animate-ping mr-0.5" />
                                Active Mic: Recording Transcripts...
                              </span>
                            )}
                          </label>
                          <textarea
                            rows={4}
                            value={userAnswerInput}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Type or verbalize your response. We will provide full recruiter diagnostics, scoring, and optimized STAR rewrites..."
                            className="w-full text-xs border border-white/10 rounded-lg p-3 text-white bg-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/30 font-semibold leading-relaxed"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/45 font-semibold">Pressing submit initiates recruiter scoring and STAR rewriting.</span>
                          <button
                            type="submit"
                            disabled={isEvaluating || !userAnswerInput.trim()}
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-xs transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-500/10"
                          >
                            {isEvaluating ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" /> Evaluating Answer...
                              </>
                            ) : (
                              <>
                                <Send className="w-3 h-3" /> Submit Answer
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback & Rewrite Column */}
              <div className="lg:col-span-1 space-y-6">
                {isQuestionAnswered ? (
                  <div className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-lg space-y-6">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Evaluation Score</span>
                      <div className="text-4xl font-black text-emerald-400 font-mono mt-1">{lastHistoryItem.score}%</div>
                      <div className="text-xs text-white/60 mt-1 font-semibold font-mono uppercase tracking-wider text-[9px]">Response Readiness</div>
                    </div>

                    {/* Show analytical scores */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-center">
                      <div>
                        <div className="text-[8px] text-white/40 uppercase font-mono font-bold">Tech Depth</div>
                        <div className="text-xs font-bold text-sky-400 font-mono">{lastHistoryItem.technicalDepth || 0}%</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-white/40 uppercase font-mono font-bold">Clarity</div>
                        <div className="text-xs font-bold text-amber-400 font-mono">{lastHistoryItem.communicationClarity || 0}%</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-white/40 uppercase font-mono font-bold">Confidence</div>
                        <div className="text-xs font-bold text-purple-400 font-mono">{lastHistoryItem.confidence || 0}%</div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono block">Recruiter Feedback</span>
                        <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                          {lastHistoryItem.feedback}
                        </p>
                      </div>

                      <div className="bg-black/30 border border-dashed border-white/10 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Polished STAR Formula</span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed italic">
                          "{lastHistoryItem.suggestedStarAnswer}"
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex gap-3">
                      {session.currentQuestionIndex < session.questions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Next Question <ArrowRight className="w-3.5 h-3.5 text-black" />
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Finish Round & View Dashboard <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/30 border border-dashed border-white/10 rounded-xl p-6 text-center py-16 text-white/40 space-y-2">
                    <MessageSquare className="w-8 h-8 text-emerald-400/80 mx-auto" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Waiting for Response Submission</h4>
                    <p className="text-[11px] text-white/60 max-w-xs mx-auto">
                      Submit your answer in the box to receive real-time recruiter scores and optimized STAR-structured answers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completion View / Visual Summary Dashboard */}
          {session.status === "completed" && (
            <div className="bg-[#111] border border-white/10 rounded-xl p-6 md:p-8 shadow-xl max-w-4xl mx-auto space-y-8 my-6">
              
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Mock Interview Summary Dashboard</h3>
                <p className="text-white/60 text-xs max-w-md mx-auto leading-relaxed font-semibold">
                  Excellent job! You have completed all evaluation questions for this interview set. Review your performance radar and questions log.
                </p>
              </div>

              {/* Analytical Layout: Radar chart & Quick stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-y border-white/10 py-6">
                
                {/* Visual Performance Chart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider text-center">Performance Radar Analysis</h4>
                  <div className="w-full h-64 bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                    {activeRadarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={activeRadarData}>
                          <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                          <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: "#9ca3af", fontSize: 9, fontFamily: "monospace", fontWeight: "bold" }} 
                          />
                          <PolarRadiusAxis 
                            angle={30} 
                            domain={[0, 100]} 
                            tick={{ fill: "#4b5563", fontSize: 8 }} 
                          />
                          <Radar
                            name="Your Session"
                            dataKey="value"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-xs text-white/40 font-mono">No analysis data.</div>
                    )}
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">Metric Score Breakdown</h4>
                  
                  <div className="space-y-3">
                    {/* Overall Score */}
                    {(() => {
                      const overall = activeRadarData.length > 0 ? Math.round(activeRadarData.reduce((acc, curr) => acc + curr.value, 0) / activeRadarData.length) : 0;
                      return (
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white/80">Average Score</span>
                          </div>
                          <span className="text-sm font-black font-mono text-emerald-400">{overall}%</span>
                        </div>
                      );
                    })()}

                    {/* Sub-Metrics details */}
                    {activeRadarData.map((item) => (
                      <div key={item.subject} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white/70">{item.subject}</span>
                          <span className="font-bold text-white font-mono">{item.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-400/80 transition-all" 
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NEW: Spoken Fluency & Confidence Scorecard */}
              {(() => {
                const sAnswers = session.chatHistory.filter(c => c.role === "student");
                const ansCount = sAnswers.length || 1;
                const avgWpm = Math.round(sAnswers.reduce((sum, item) => sum + (item.wordsPerMinute || 0), 0) / ansCount);
                const avgHesitation = Math.round(sAnswers.reduce((sum, item) => sum + (item.hesitationDuration || 0), 0) / ansCount);
                const totalFillers = sAnswers.reduce((sum, item) => sum + (item.totalFillerCount || 0), 0);

                let paceStatus = "Deliberate";
                let paceClass = "text-sky-400";
                if (avgWpm >= 110 && avgWpm <= 150) {
                  paceStatus = "Optimal Pace";
                  paceClass = "text-emerald-400";
                } else if (avgWpm > 150) {
                  paceStatus = "Fast Pace";
                  paceClass = "text-amber-400";
                }

                let flowStatus = "Fluent Flow";
                let flowClass = "text-emerald-400";
                if (avgHesitation > 4 && avgHesitation <= 10) {
                  flowStatus = "Minor Hesitations";
                  flowClass = "text-amber-400";
                } else if (avgHesitation > 10) {
                  flowStatus = "Needs Pacing";
                  flowClass = "text-rose-400";
                }

                return (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" /> Spoken Fluency & Confidence Scorecard
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg space-y-1 text-center">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Average Speaking Rate</span>
                        <div className={`text-2xl font-black font-mono ${paceClass}`}>{avgWpm > 0 ? `${avgWpm} WPM` : "N/A"}</div>
                        <span className="text-[10px] text-white/50 block font-semibold leading-none">{paceStatus}</span>
                      </div>
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg space-y-1 text-center">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Average Hesitation Duration</span>
                        <div className={`text-2xl font-black font-mono ${flowClass}`}>{avgHesitation}s / question</div>
                        <span className="text-[10px] text-white/50 block font-semibold leading-none">{flowStatus}</span>
                      </div>
                      <div className="p-4 bg-white/[0.01] border border-white/5 rounded-lg space-y-1 text-center">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Total Session Filler Words</span>
                        <div className="text-2xl font-black font-mono text-amber-400">{totalFillers}</div>
                        <span className="text-[10px] text-white/50 block font-semibold leading-none">Clutter Word Count</span>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs text-white/70 leading-relaxed font-semibold">
                      <span className="text-emerald-400 font-bold uppercase font-mono tracking-wider text-[10px] block mb-1">Employability coaching tip:</span>
                      {avgWpm > 150 
                        ? "You are speaking a bit fast! Try inserting purposeful 1-second pauses when shifting between the Situation, Task, Action, and Result (STAR) stages of your answers to increase your conversational authority."
                        : totalFillers > 5
                        ? "Your answers have slight word clutter. Whenever you feel stuck, take a silent deep breath instead of vocalizing 'uh', 'um', or 'basically'. This increases clarity and signals professional confidence."
                        : "Outstanding verbal delivery! Your speaking rate and pause patterns are aligned with top management standards. Maintain this deliberate, fluent pacing in your real-world rounds."}
                    </div>
                  </div>
                );
              })()}

              {/* Review Session Questions & Answer Feedback */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Detailed Session Questions & Answers Log
                </h4>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {session.questions.map((q, idx) => {
                    const ans = session.chatHistory.filter(c => c.role === "student")[idx];
                    return (
                      <div key={q.id} className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start gap-3 border-b border-white/5 pb-2">
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">QUESTION {idx + 1}</span>
                            <h5 className="text-xs font-bold text-white leading-normal">"{q.question}"</h5>
                          </div>
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black font-mono rounded">
                            {ans?.score || 0}%
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-rose-400/80 uppercase tracking-widest font-mono">Your Answer</span>
                            <p className="text-white/70 leading-relaxed font-semibold italic">"{ans?.text || "No response submitted"}"</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono">Recruiter Feedback</span>
                            <p className="text-white/60 leading-relaxed">{ans?.feedback || "No feedback available."}</p>
                          </div>
                        </div>

                        {/* Per-question spoken diagnostics */}
                        {ans && (ans.wordsPerMinute !== undefined || ans.hesitationDuration !== undefined) && (
                          <div className="flex flex-col gap-2 py-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-[10px] font-mono text-white/40">
                            <div className="flex flex-wrap gap-4">
                              <div>
                                <span className="font-bold text-white/60 uppercase">Speaking speed:</span> {ans.wordsPerMinute || 0} WPM
                              </div>
                              <div>
                                <span className="font-bold text-white/60 uppercase">Conversational hesitations:</span> {ans.hesitationDuration || 0}s
                              </div>
                              <div>
                                <span className="font-bold text-white/60 uppercase">Filler word count:</span> {ans.totalFillerCount || 0} words
                              </div>
                            </div>
                            {ans.audioUrl && (
                              <div className="flex items-center gap-2 mt-1 py-1 px-2 bg-emerald-500/5 border border-emerald-500/10 rounded w-fit">
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Play Recorded Audio:
                                </span>
                                <audio src={ans.audioUrl} controls className="h-6 max-w-[200px]" />
                              </div>
                            )}
                          </div>
                        )}

                        {ans?.suggestedStarAnswer && (
                          <div className="p-3 bg-[#0c0c0c] border border-dashed border-white/5 rounded-lg space-y-1">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider font-mono block">Suggested STAR Formulation</span>
                            <p className="text-[11px] text-white/90 leading-relaxed italic">"{ans.suggestedStarAnswer}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={onResetInterview}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Simulate Another Role
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: PERFORMANCE TRENDS VIEW */}
      {activeSubTab === "trends" && session.status !== "ongoing" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Long-Term Performance Trends
              </h3>
              <p className="text-white/50 text-xs mt-1 font-semibold leading-relaxed">
                Track how your Confidence Score and Spoken Fluency have evolved over your last 10 mock interview sessions.
              </p>
            </div>
          </div>

          {history.length < 2 ? (
            <div className="bg-[#111] border border-white/10 p-12 rounded-xl text-center space-y-4 max-w-md mx-auto my-12 shadow-md">
              <Activity className="w-10 h-10 text-emerald-400/60 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">Waiting for More Sessions</h4>
                <p className="text-xs text-white/50 leading-relaxed font-semibold">
                  Complete at least 2 mock interview sessions to unlock beautiful interactive line chart trends and growth analysis!
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSubTab("practice");
                  onResetInterview();
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all cursor-pointer"
              >
                Launch Your First Role
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Statistics Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(() => {
                  const last10 = history.slice(-10);
                  const avgConfidence = Math.round(last10.reduce((sum, item) => sum + (item.metrics.confidence || 0), 0) / last10.length);
                  const avgFluency = Math.round(last10.reduce((sum, item) => sum + (item.metrics.communicationClarity || 0), 0) / last10.length);
                  const improvementConfidence = last10.length > 1 
                    ? (last10[last10.length - 1].metrics.confidence || 0) - (last10[0].metrics.confidence || 0)
                    : 0;

                  return (
                    <>
                      <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Avg Confidence Score</span>
                        <div className="text-2xl font-black font-mono text-emerald-400">{avgConfidence}%</div>
                        <span className="text-[10px] text-white/50 block font-semibold">Last 10 sessions average</span>
                      </div>
                      <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Avg Fluency Score</span>
                        <div className="text-2xl font-black font-mono text-sky-400">{avgFluency}%</div>
                        <span className="text-[10px] text-white/50 block font-semibold">Communication clarity average</span>
                      </div>
                      <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-1">
                        <span className="text-[9px] text-white/40 uppercase font-black font-mono tracking-wider">Confidence Growth</span>
                        <div className={`text-2xl font-black font-mono ${improvementConfidence >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {improvementConfidence >= 0 ? `+${improvementConfidence}%` : `${improvementConfidence}%`}
                        </div>
                        <span className="text-[10px] text-white/50 block font-semibold">Latest round vs earliest round</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Chart Container */}
              <div className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider">Long-Term Growth Tracking</h4>
                    <p className="text-[10px] text-white/50 font-semibold mt-0.5">Confidence Score and Fluency metrics over the last 10 rounds</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-emerald-400 rounded"></span>
                      <span className="text-white/60 font-semibold">Confidence Score</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-sky-400 rounded"></span>
                      <span className="text-white/60 font-semibold">Fluency (Communication)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-80 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={history.slice(-10).map((past, index) => ({
                        name: `Round ${index + 1}`,
                        date: new Date(past.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                        role: past.role,
                        "Confidence Score": past.metrics.confidence,
                        "Fluency": past.metrics.communicationClarity,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#4b5563" 
                        tick={{ fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" }} 
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        stroke="#4b5563" 
                        tick={{ fill: "#9ca3af", fontSize: 9, fontFamily: "monospace" }} 
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                        labelStyle={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "10px", fontWeight: "bold" }}
                        itemStyle={{ fontSize: "11px", fontWeight: "600" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Confidence Score"
                        stroke="#10b981"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="Fluency"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: AUDIO REVIEW & SELF-REFLECTION ENGINE */}
      {activeSubTab === "audio-review" && session.status !== "ongoing" && (() => {
        const selectedReviewKey = selectedAudioKey || (recordedAnswers.length > 0 ? `${recordedAnswers[0].sessionId}-${recordedAnswers[0].index}` : "");
        const selectedReviewQA = recordedAnswers.find((qa) => `${qa.sessionId}-${qa.index}` === selectedReviewKey);

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-emerald-400" /> Spoken Audio Review Engine
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-semibold">
                  Play back your speech recordings from past interviews to evaluate tone, pacing, filler words, and narrative structure.
                </p>
              </div>
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold shrink-0">
                Total Recordings: {recordedAnswers.length}
              </div>
            </div>

            {recordedAnswers.length === 0 ? (
              <div className="bg-[#111] border border-white/10 p-12 rounded-xl text-center space-y-4 max-w-md mx-auto my-12 shadow-md">
                <Headphones className="w-10 h-10 text-emerald-400/60 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-white text-sm">No Audio Recordings Found</h4>
                  <p className="text-xs text-white/50 leading-relaxed font-semibold">
                    You haven't saved any voice answers yet. To record your voice during a mock session, click 'Start Speaking' and allow mic access before submitting!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveSubTab("practice");
                    onResetInterview();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all cursor-pointer"
                >
                  Start Practice Session
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: List of recordings */}
                <div className="lg:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-1">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono mb-1 text-left">
                    Recorded Answer History
                  </div>
                  {recordedAnswers.map((qa, idx) => {
                    const key = `${qa.sessionId}-${qa.index}`;
                    return (
                      <div
                        key={key}
                        onClick={() => {
                          setSelectedAudioKey(key);
                        }}
                        className={`p-4 border rounded-xl transition-all cursor-pointer text-left space-y-3 ${
                          selectedReviewKey === key
                            ? "bg-emerald-500/5 border-emerald-400 shadow-md"
                            : "bg-[#111] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">
                            QA #{idx + 1}
                          </span>
                          <span className="text-[9px] text-white/40 font-mono font-bold">
                            {new Date(qa.sessionTimestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/50 font-mono font-semibold uppercase tracking-wider block">
                            Role: {qa.sessionRole}
                          </span>
                          <p className="text-xs font-extrabold text-white line-clamp-2 leading-snug">
                            {qa.question}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Click to listen & reflect</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Audio Player & Detailed Self-Reflection Panel */}
                <div className="lg:col-span-2">
                  {selectedReviewQA ? (
                    <div className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-xl space-y-6 text-left">
                      {/* Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <span className="text-[9px] font-black text-emerald-400 font-mono uppercase tracking-widest block mb-0.5">
                            Active Review Session
                          </span>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {selectedReviewQA.sessionRole} Mock Round
                          </h4>
                          <span className="text-[10px] text-white/40 font-mono font-bold">
                            Recorded on {new Date(selectedReviewQA.sessionTimestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono font-bold text-emerald-400">
                          Score: {selectedReviewQA.score}/100
                        </div>
                      </div>

                      {/* Question & Answer Box */}
                      <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest block">The Question</span>
                          <p className="text-xs font-extrabold text-white leading-relaxed">
                            {selectedReviewQA.question}
                          </p>
                        </div>
                        <div className="h-px bg-white/5 my-2" />
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest block">Your Answer Text</span>
                          <p className="text-xs text-white/80 leading-relaxed font-semibold italic">
                            "{selectedReviewQA.answer}"
                          </p>
                        </div>
                      </div>

                      {/* Custom Audio Element */}
                      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                              Voice Recording Playback
                            </span>
                          </div>
                          <span className="text-[10px] text-white/40 font-mono font-bold uppercase tracking-wider">
                            Interactive Player
                          </span>
                        </div>
                        
                        <audio
                          src={selectedReviewQA.audioUrl}
                          controls
                          className="w-full h-10 focus:outline-none"
                        />
                      </div>

                      {/* Fluency Diagnostics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center space-y-1">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Speaking Speed</span>
                          <div className="text-lg font-mono font-black text-white">
                            {selectedReviewQA.metrics?.wordsPerMinute || "N/A"} <span className="text-xs text-white/50">WPM</span>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-400/80 font-mono block">
                            {(selectedReviewQA.metrics?.wordsPerMinute || 0) >= 110 && (selectedReviewQA.metrics?.wordsPerMinute || 0) <= 150 ? "Optimal Pace" : "Fast / Slow Pace"}
                          </span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center space-y-1">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Filler Words</span>
                          <div className="text-lg font-mono font-black text-rose-400">
                            {selectedReviewQA.metrics?.totalFillerCount || 0} <span className="text-xs text-white/50">detected</span>
                          </div>
                          <span className="text-[9px] text-white/40 font-semibold block">
                            um, uh, like, actually, so
                          </span>
                        </div>
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center space-y-1">
                          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Silence Hesitations</span>
                          <div className="text-lg font-mono font-black text-amber-400">
                            {selectedReviewQA.metrics?.hesitationDuration || 0} <span className="text-xs text-white/50">seconds</span>
                          </div>
                          <span className="text-[9px] text-white/40 font-semibold block">
                            Natural pauses allowed
                          </span>
                        </div>
                      </div>

                      {/* Recruiter Coaching & Feedback Review */}
                      <div className="space-y-2 bg-[#1e293b]/20 border border-[#334155]/20 rounded-xl p-4">
                        <h5 className="text-xs font-mono font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-400" /> Evaluation Diagnostics
                        </h5>
                        <p className="text-xs text-white/70 leading-relaxed font-semibold">
                          {selectedReviewQA.feedback}
                        </p>
                      </div>

                      {/* Self-Reflection & Active Listening Rubric */}
                      <div className="border border-white/10 rounded-xl p-5 space-y-4">
                        <div>
                          <h5 className="text-xs font-mono font-black text-white uppercase tracking-widest">
                            Self-Reflection Delivery Checklist
                          </h5>
                          <p className="text-[10px] text-white/50 font-semibold mt-0.5">
                            Close your eyes, listen to your audio playback, and actively self-rate your performance:
                          </p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: "star", text: "Did I structure my story clearly using the STAR method (Situation, Task, Action, Result)?" },
                            { id: "fillers", text: "Did I minimize verbal clutter and speak smoothly without excessive 'um's or 'like's?" },
                            { id: "tone", text: "Is my vocal pitch, enthusiasm, and volume confident and professional throughout?" },
                            { id: "pacing", text: "Did I speak at an optimal speed (not too rushed, with breathing pauses between ideas)?" },
                            { id: "keywords", text: "Did I pronounce key industry/role terminology accurately and clearly?" }
                          ].map((rubric) => {
                            const isChecked = !!reflectionChecked[selectedReviewKey]?.[rubric.id];
                            return (
                              <label
                                key={rubric.id}
                                className="flex items-start gap-3 p-2 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-lg cursor-pointer transition-all select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    setReflectionChecked((prev) => {
                                      const audioMap = prev[selectedReviewKey] || {};
                                      return {
                                        ...prev,
                                        [selectedReviewKey]: {
                                          ...audioMap,
                                          [rubric.id]: e.target.checked,
                                        },
                                      };
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-white/10 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black bg-black/40 mt-0.5 cursor-pointer shrink-0"
                                />
                                <span className="text-xs text-white/80 font-medium leading-tight">
                                  {rubric.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Coach Reflection Tip */}
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-[11px] font-semibold text-emerald-400 leading-normal flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                          <span>
                            <strong>Pro Coaching Tip:</strong> Listen to your voice at least twice. The first pass should be strictly on structure—did you answer the prompt directly? The second pass should focus entirely on tone and speed.
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center space-y-3 h-full flex flex-col justify-center items-center shadow-lg min-h-[400px]">
                      <Headphones className="w-10 h-10 text-emerald-400/40" />
                      <div>
                        <h4 className="font-extrabold text-white text-sm">Select an Audio Recording</h4>
                        <p className="text-xs text-white/50 leading-relaxed font-semibold max-w-xs mx-auto mt-0.5">
                          Choose a saved answer from the history list on the left to start your active self-reflection playback.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* SUB-TAB 2: ALL INTERVIEW HISTORY & MISTAKES LOG */}
      {activeSubTab === "history" && session.status !== "ongoing" && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="bg-[#111] border border-white/10 p-12 rounded-xl text-center space-y-4 max-w-md mx-auto my-12 shadow-md">
              <History className="w-10 h-10 text-emerald-400/60 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-white text-sm">No Interview History Available</h4>
                <p className="text-xs text-white/50 leading-relaxed font-semibold">
                  You haven't completed any mock interviews yet. Launch a practice round to build your historical tracking and review recruiter feedback!
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSubTab("practice");
                  onResetInterview();
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all cursor-pointer"
              >
                Simulate Your First Role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Aggregated Historical Performance Card (Left Column) */}
              <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg h-fit space-y-6">
                <div>
                  <h4 className="text-xs font-black text-white font-mono uppercase tracking-widest">Aggregated Performance</h4>
                  <p className="text-[10px] text-white/50 font-semibold leading-normal mt-0.5">
                    Your average readiness score across all {history.length} mock sessions.
                  </p>
                </div>

                {/* Historical Radar Chart */}
                <div className="w-full h-56 bg-black/30 border border-white/5 rounded-xl p-2 flex items-center justify-center">
                  {historicalRadarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={historicalRadarData}>
                        <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: "#9ca3af", fontSize: 8, fontFamily: "monospace", fontWeight: "bold" }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: "#4b5563", fontSize: 7 }} 
                        />
                        <Radar
                          name="Historical Average"
                          dataKey="value"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.18}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>

                {/* Static averages list */}
                <div className="space-y-3.5 border-t border-white/5 pt-4">
                  {historicalRadarData.map((item) => (
                    <div key={item.subject} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white/60">{item.subject}</span>
                      <span className="font-extrabold text-white font-mono">{item.value}%</span>
                    </div>
                  ))}
                  
                  {(() => {
                    const avg = Math.round(history.reduce((sum, item) => sum + item.overallScore, 0) / history.length);
                    return (
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 font-bold">
                        <span className="text-emerald-400 uppercase font-mono text-[10px] tracking-wider">Overall Success Readiness</span>
                        <span className="text-sm font-black font-mono text-emerald-400">{avg}%</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* History Transcripts and Collapsible Session details (Right Column) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-white font-mono uppercase tracking-widest flex items-center gap-1.5">
                    <History className="w-4 h-4 text-emerald-400" /> Completed Mock Session History ({history.length})
                  </h4>
                  <span className="text-[10px] text-white/40 font-mono font-semibold">Click to expand diagnostics and Star formulations</span>
                </div>

                <div className="space-y-4">
                  {history.map((past) => {
                    const isExpanded = expandedPastSessionId === past.id;
                    const dateFormatted = new Date(past.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div 
                        key={past.id} 
                        className={`bg-[#111] border rounded-xl overflow-hidden shadow-md transition-all ${
                          isExpanded ? "border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Header Panel */}
                        <div 
                          onClick={() => setExpandedPastSessionId(isExpanded ? null : past.id)}
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-extrabold text-white truncate font-mono">{past.role}</h5>
                              <span className="px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-[8px] font-black font-mono rounded">
                                SCORE {past.overallScore}%
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 font-mono font-semibold">{dateFormatted}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-3 text-right">
                              <div>
                                <span className="text-[8px] text-white/40 uppercase font-mono block font-bold">Tech Depth</span>
                                <span className="text-[11px] font-bold text-sky-400 font-mono">{past.metrics.technicalDepth}%</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-white/40 uppercase font-mono block font-bold">Clarity</span>
                                <span className="text-[11px] font-bold text-amber-400 font-mono">{past.metrics.communicationClarity}%</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-white/40 uppercase font-mono block font-bold">Confidence</span>
                                <span className="text-[11px] font-bold text-purple-400 font-mono">{past.metrics.confidence}%</span>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="p-4 bg-[#111] border-t border-white/5 space-y-5">
                            
                            {/* Inner Header Notice */}
                            <div className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                              <Brain className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                              <p className="text-[10px] text-white/70 leading-relaxed font-semibold">
                                Use this Mistakes Log to review past failures, study exact recruiter critiques, and practice speaking the STAR formulations aloud before your next real-world round.
                              </p>
                            </div>

                            {/* Aggregate Session Speech Metrics */}
                            {(past.metrics.averageWordsPerMinute !== undefined || past.metrics.averageHesitationDuration !== undefined) && (
                              <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center font-mono">
                                <div>
                                  <span className="text-[8px] text-white/40 uppercase font-bold block">Avg Speaking Speed</span>
                                  <span className="text-xs font-black text-sky-400">{past.metrics.averageWordsPerMinute || 0} WPM</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-white/40 uppercase font-bold block">Avg Silence Gap</span>
                                  <span className="text-xs font-black text-emerald-400">{past.metrics.averageHesitationDuration || 0}s / q</span>
                                </div>
                                <div>
                                  <span className="text-[8px] text-white/40 uppercase font-bold block">Total Filler Words</span>
                                  <span className="text-xs font-black text-amber-400">{past.metrics.totalFillerCount || 0}</span>
                                </div>
                              </div>
                            )}

                            {/* Collapsible Transcript Questions */}
                            <div className="space-y-4">
                              {past.questionsAndAnswers.map((item, index) => (
                                <div key={index} className="p-3.5 bg-white/[0.01] border border-white/5 rounded-lg space-y-3">
                                  <div className="flex justify-between items-start gap-3 border-b border-white/5 pb-2">
                                    <div className="space-y-0.5">
                                      <span className="text-[8px] text-white/40 uppercase tracking-widest font-mono font-bold">QUESTION {index + 1} ({item.type})</span>
                                      <h6 className="text-[11px] font-bold text-white leading-normal">"{item.question}"</h6>
                                    </div>
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[9px] rounded">
                                      {item.score}%
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest font-mono">Your Saved Answer</span>
                                      <p className="text-white/60 leading-normal font-semibold italic">"{item.answer}"</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Recruiter Feedback</span>
                                      <p className="text-white/50 leading-relaxed">{item.feedback}</p>
                                    </div>
                                  </div>

                                  {/* Per-question spoken diagnostics */}
                                  {item.metrics && (item.metrics.wordsPerMinute !== undefined || item.metrics.hesitationDuration !== undefined) && (
                                    <div className="flex flex-col gap-2 py-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-[10px] font-mono text-white/40">
                                      <div className="flex flex-wrap gap-4">
                                        <div>
                                          <span className="font-bold text-white/60 uppercase">Speaking speed:</span> {item.metrics.wordsPerMinute || 0} WPM
                                        </div>
                                        <div>
                                          <span className="font-bold text-white/60 uppercase">Conversational hesitations:</span> {item.metrics.hesitationDuration || 0}s
                                        </div>
                                        <div>
                                          <span className="font-bold text-white/60 uppercase">Filler word count:</span> {item.metrics.totalFillerCount || 0} words
                                        </div>
                                      </div>
                                      {item.audioUrl && (
                                        <div className="flex items-center gap-2 mt-1 py-1 px-2 bg-emerald-500/5 border border-emerald-500/10 rounded w-fit">
                                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1 shrink-0">
                                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Play Recorded Audio:
                                          </span>
                                          <audio src={item.audioUrl} controls className="h-6 max-w-[200px]" />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {item.suggestedStarAnswer && (
                                    <div className="p-2.5 bg-black/30 border border-dashed border-white/5 rounded-lg">
                                      <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider font-mono block mb-0.5">Suggested STAR Formulation</span>
                                      <p className="text-[10px] text-white/80 leading-relaxed italic">"{item.suggestedStarAnswer}"</p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALWAYS ACCESSIBLE FLOATING QUICK TIPS TOGGLE BUTTON */}
      <button
        type="button"
        id="floating-quick-tips-toggle"
        onClick={() => setShowQuickTips((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 hover:scale-105 text-black font-black text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-amber-500/20 border border-white/20 transition-all cursor-pointer active:scale-95 group"
        title="Toggle Context-Sensitive Communication Quick Tips"
      >
        <Lightbulb className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
        <span className="font-mono">Quick Tips</span>
        {session.status === "ongoing" && (
          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
        )}
      </button>

      {/* FLOATING CONTEXT-SENSITIVE QUICK TIPS OVERLAY MODAL */}
      {showQuickTips && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/15 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300">
                  <Lightbulb className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Communication Quick Tips
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono rounded uppercase font-bold tracking-wider">
                      Context Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/60 font-medium mt-0.5">
                    {currentQuestion 
                      ? `Real-time guidance for ${currentQuestion.type.toUpperCase()} round questions`
                      : `Contextual advice for target role: ${selectedRole || 'General Interview'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickTips(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Category Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-black/40 px-4 pt-2 gap-1 overflow-x-auto shrink-0">
              <button
                onClick={() => setQuickTipsCategory("round")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all relative border-b-2 cursor-pointer ${
                  quickTipsCategory === "round"
                    ? "text-amber-300 border-amber-400 font-mono"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-amber-400" /> Round Strategy
              </button>
              <button
                onClick={() => setQuickTipsCategory("speech")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all relative border-b-2 cursor-pointer ${
                  quickTipsCategory === "speech"
                    ? "text-emerald-300 border-emerald-400 font-mono"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" /> Verbal Diagnostics
              </button>
              <button
                onClick={() => setQuickTipsCategory("formulas")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all relative border-b-2 cursor-pointer ${
                  quickTipsCategory === "formulas"
                    ? "text-cyan-300 border-cyan-400 font-mono"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> STAR & Formulas
              </button>
              <button
                onClick={() => setQuickTipsCategory("mindset")}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all relative border-b-2 cursor-pointer ${
                  quickTipsCategory === "mindset"
                    ? "text-purple-300 border-purple-400 font-mono"
                    : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-400" /> Anxiety Hacks
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* CATEGORY 1: ROUND STRATEGY */}
              {quickTipsCategory === "round" && (
                <div className="space-y-4">
                  {currentQuestion ? (
                    <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getQuestionTypeLabel(currentQuestion.type)}`}>
                          Active Round: {currentQuestion.type}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">Question #{session.currentQuestionIndex + 1}</span>
                      </div>
                      <p className="text-xs font-bold text-white italic">"{currentQuestion.question}"</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60">
                      Target Role Focus: <strong className="text-emerald-400">{selectedRole || 'General Candidate'}</strong>
                    </div>
                  )}

                  {/* Context Advice Cards */}
                  {(!currentQuestion || currentQuestion.type === "technical") && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> Technical Round Rules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">1. High-Level Approach First</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">State your time & space complexity goals before writing logic or code. Avoid jumping straight into syntax.</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">2. State Edge Cases Proactively</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">Mention null inputs, empty collections, or memory limits. This demonstrates senior architectural foresight.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!currentQuestion || currentQuestion.type === "behavioral") && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> Behavioral Round Rules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">1. The 60/40 Action Split</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">Spend 60% of your story detailing YOUR specific actions. Use "I designed/implemented", not just "we".</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">2. Quantified Impact Endings</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">Conclude every story with a hard metric (e.g., "reduced latency by 35%", "saved 8 hours/week").</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(!currentQuestion || currentQuestion.type === "hr" || (currentQuestion.type as string) === "situational") && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> HR & Situational Rules
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">1. Adaptability & Ownership</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">Show excitement for team collaboration and constructive feedback. Avoid blaming past teammates or managers.</p>
                        </div>
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                          <strong className="text-white block font-mono text-[11px]">2. Keep Answers under 2 Mins</strong>
                          <p className="text-white/60 leading-relaxed text-[11px]">HR screeners assess conciseness. A 90-second focused response outperforms a 4-minute rambling pitch.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CATEGORY 2: VERBAL DIAGNOSTICS */}
              {quickTipsCategory === "speech" && (
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono">
                      Live Session Speech Metrics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] text-white/40 font-mono uppercase block">Total Fillers</span>
                        <span className="text-base font-black font-mono text-amber-400">
                          {(Object.values(fillerCounts) as number[]).reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] text-white/40 font-mono uppercase block">Pace (WPM)</span>
                        <span className="text-base font-black font-mono text-cyan-400">
                          {wordsPerMinute || "0"}
                        </span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] text-white/40 font-mono uppercase block">Tone Confidence</span>
                        <span className="text-base font-black font-mono text-emerald-400">
                          {sentimentScore}%
                        </span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <span className="text-[9px] text-white/40 font-mono uppercase block">Hesitations</span>
                        <span className="text-base font-black font-mono text-purple-400">
                          {hesitationDuration}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time coaching recommendation */}
                  <div className="space-y-2 text-xs">
                    <strong className="text-white font-mono uppercase tracking-wider text-[11px] block">Actionable Verbal Fixes:</strong>
                    <ul className="space-y-2">
                      <li className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-amber-200">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Silence is Power:</strong> Replace filler words like <em>"um"</em>, <em>"like"</em>, or <em>"basically"</em> with 1-second silent pauses. Silent pauses sound deliberate and authoritative.
                        </div>
                      </li>
                      <li className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-2 text-cyan-200">
                        <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Cadence Target:</strong> Ideal conversational speed is 120-140 WPM. If you catch yourself speeding up, drop your chin slightly and breathe through your nose.
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* CATEGORY 3: FORMULAS & SCRIPTS */}
              {quickTipsCategory === "formulas" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono">
                      STAR Method Template
                    </h4>
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <p className="text-white/70 leading-relaxed">
                        <strong className="text-white font-mono">Formula:</strong> [Situation] → [Task] → [Action (60%)] → [Quantified Result]
                      </p>
                      <button
                        onClick={() => {
                          const script = "In my previous project, the main situation was [describe context]. My task was to [describe goal]. To resolve this, I [detailed action taken]. As a result, we achieved [metric/outcome].";
                          setUserAnswerInput((prev) => (prev ? `${prev}\n\n${script}` : script));
                          setCopiedScriptIndex(1);
                          setTimeout(() => setCopiedScriptIndex(null), 2000);
                        }}
                        className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedScriptIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScriptIndex === 1 ? "Inserted STAR Outline into Draft!" : "Insert STAR Template into Answer Draft"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                      PREP Method (Technical & Architectural Questions)
                    </h4>
                    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
                      <p className="text-white/70 leading-relaxed">
                        <strong className="text-white font-mono">Formula:</strong> [Point] → [Reason] → [Example] → [Point Reiteration]
                      </p>
                      <button
                        onClick={() => {
                          const script = "My primary recommendation is [Core Point]. The reason for this choice is [Technical Reason]. For instance, in [Example Case], this approach [Benefit]. Therefore, [Reiterate Core Point].";
                          setUserAnswerInput((prev) => (prev ? `${prev}\n\n${script}` : script));
                          setCopiedScriptIndex(2);
                          setTimeout(() => setCopiedScriptIndex(null), 2000);
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedScriptIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedScriptIndex === 2 ? "Inserted PREP Outline into Draft!" : "Insert PREP Template into Answer Draft"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 4: MINDSET & ANXIETY HACKS */}
              {quickTipsCategory === "mindset" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-purple-300 font-mono text-[11px]">1. The 3-Second Rule</h4>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      Never speak immediately after the interviewer finishes asking the question. Count 1-2-3 in your mind while nodding. This signals high composure and critical thinking.
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-emerald-300 font-mono text-[11px]">2. Box Breathing Reset</h4>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      If you feel nervous: Inhale deeply for 4 seconds → Hold for 4 seconds → Exhale smoothly for 4 seconds → Hold for 4 seconds. This instantly activates your parasympathetic nervous system.
                    </p>
                  </div>

                  <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1.5">
                    <h4 className="font-bold text-cyan-300 font-mono text-[11px]">3. Re-framing Script if Stuck</h4>
                    <p className="text-white/70 leading-relaxed text-[11px]">
                      If you lose your train of thought, don't panic or freeze. Say with a smile: <em>"To pivot back to the core question..."</em> or <em>"Let me reframe that clearly..."</em>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-white/40 font-mono">
                Press ESC or click close to return to active mock session
              </span>
              <button
                onClick={() => setShowQuickTips(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg transition-all cursor-pointer font-mono shadow-md shadow-emerald-500/10"
              >
                Return to Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
