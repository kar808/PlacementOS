import React, { useState, useEffect, useRef } from "react";
import { MockInterviewQuestion, StudentProfile, MockInterviewSession, PastInterviewSession } from "../types";
import { 
  MessageSquare, Play, Send, RefreshCw, Star, ArrowRight, 
  CheckCircle2, ChevronDown, ChevronUp, Brain, Mic, MicOff, 
  AlertTriangle, Sparkles, Activity, History, Award, BookOpen 
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
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
}: InterviewSimulatorProps) {
  const [selectedRole, setSelectedRole] = useState(profile.targetRoles[0] || "");
  const [userAnswerInput, setUserAnswerInput] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"practice" | "history">("practice");
  const [expandedPastSessionId, setExpandedPastSessionId] = useState<string | null>(null);

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
  }, [session.currentQuestionIndex]);

  // Sync state analysis when text inputs are manually updated too
  const handleInputChange = (val: string) => {
    setUserAnswerInput(val);
    analyzeSpeechDynamics(val);
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
      setIsListening(false);
    } else {
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
        };

        baseTranscriptRef.current = userAnswerInput;
        speechStartTimeRef.current = Date.now();
        lastSpeechTimestampRef.current = Date.now();
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
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onNextQuestion();
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswerInput.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
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

  const currentQuestion: MockInterviewQuestion | undefined = session.questions[session.currentQuestionIndex];
  const lastHistoryItem = session.chatHistory[session.chatHistory.length - 1];
  const isQuestionAnswered = lastHistoryItem?.role === "student" && lastHistoryItem.feedback !== undefined;

  const activeRadarData = getActiveRadarData();
  const historicalRadarData = getHistoricalRadarData();

  return (
    <div className="space-y-6">
      {/* Tab Switcher - Only visible when not in an ongoing active interview */}
      {session.status !== "ongoing" && (
        <div className="flex border-b border-white/10 pb-1 gap-2">
          <button
            onClick={() => setActiveSubTab("practice")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative ${
              activeSubTab === "practice" 
                ? "text-emerald-400 border-b-2 border-emerald-400" 
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Practice Simulator
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all relative ${
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
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getQuestionTypeLabel(currentQuestion.type)}`}>
                        {currentQuestion.type} ROUND
                      </span>
                      <span className="text-xs text-white/40 font-semibold font-mono">
                        Question {session.currentQuestionIndex + 1} of {session.questions.length}
                      </span>
                    </div>
                    <button onClick={onResetInterview} className="text-xs text-rose-400 hover:text-rose-300 font-bold font-mono cursor-pointer bg-transparent border-none">
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
                      <div className="bg-black/20 border border-white/5 rounded-xl p-4 max-w-[85%]">
                        <p className="text-sm text-white/90 font-semibold leading-relaxed">
                          "{currentQuestion.question}"
                        </p>
                        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-white/50 font-mono">
                          <Brain className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                          <span>
                            <strong className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] mr-1">Recruiter Tip:</strong> They are looking for: {currentQuestion.expectedFocus}
                          </span>
                        </div>
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
                          <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest font-mono text-[9px] mb-1.5 flex items-center justify-between">
                            <span>Answer Draft</span>
                            {isListening && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] font-black font-mono rounded-full animate-pulse uppercase tracking-wider">
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
                          <div className="flex flex-wrap gap-4 py-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-[10px] font-mono text-white/40">
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
                                    <div className="flex flex-wrap gap-4 py-2 px-3 bg-white/[0.01] border border-white/5 rounded-lg text-[10px] font-mono text-white/40">
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
    </div>
  );
}
