import React, { useState, useEffect } from "react";
import { IntelligenceMap, ReadinessScores, RecommendedRole } from "../types";
import CareerIntelligenceView from "./CareerIntelligenceView";
import { 
  Award, ShieldAlert, Sparkles, AlertCircle, ArrowUpRight, TrendingUp, CheckCircle2, 
  Lock, CheckSquare, FileText, BookOpen, MessageSquare, Volume2, ShieldCheck, Compass, Zap, Cpu
} from "lucide-react";

interface IntelligenceDashboardProps {
  intelligenceMap: IntelligenceMap | null;
  scores: ReadinessScores | null;
  recommendedRoles: RecommendedRole[] | null;
  onNavigateToSection: (section: string) => void;
  isAnalyzing?: boolean;
  onRunAudit?: () => void;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  requirement: string;
  icon: React.ComponentType<any>;
  color: string;
  unlocked: boolean;
}

export default function IntelligenceDashboard({
  intelligenceMap,
  scores,
  recommendedRoles,
  onNavigateToSection,
  isAnalyzing,
  onRunAudit
}: IntelligenceDashboardProps) {
  const [viewMode, setViewMode] = useState<"index" | "career_intelligence">(
    intelligenceMap?.careerIntelligence ? "career_intelligence" : "index"
  );

  // Automatically trigger audit generation if cache is empty on mount
  useEffect(() => {
    if ((!intelligenceMap || !scores || !recommendedRoles) && onRunAudit && !isAnalyzing) {
      onRunAudit();
    }
  }, []);

  if (isAnalyzing) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Row 1 Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-[#111]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl h-[264px] flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center mb-4">
              <div className="w-12 h-6 bg-white/10 rounded"></div>
            </div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
          <div className="lg:col-span-3 bg-[#111]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl h-[264px] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-white/10 rounded w-1/4"></div>
              <div className="h-3 bg-white/5 rounded w-full"></div>
              <div className="h-3 bg-white/5 rounded w-5/6"></div>
              <div className="h-3 bg-white/5 rounded w-4/5"></div>
              <div className="h-3 bg-white/5 rounded w-11/12"></div>
            </div>
            <div className="h-10 bg-white/5 rounded-xl w-full"></div>
          </div>
        </div>

        {/* Row 2 Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl h-[340px] space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
            </div>
          </div>
          <div className="bg-[#111]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl h-[340px] space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3"></div>
            <div className="space-y-3">
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
              <div className="h-12 bg-black/20 rounded-xl w-full border border-white/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!intelligenceMap || !scores || !recommendedRoles) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#111]/50 border border-white/10 rounded-2xl backdrop-blur-md space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
        <div className="text-center space-y-2 max-w-md px-4">
          <h3 className="font-extrabold text-white text-xl font-mono">No Placement Audit Cache Found</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Click below to generate your complete VORYNEXA Intelligence Map, benchmark readiness scores, and AI candidate audit report.
          </p>
        </div>
        {onRunAudit && (
          <button
            onClick={onRunAudit}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Launch VORYNEXA Intelligence Audit</span>
          </button>
        )}
      </div>
    );
  }

  // 1. Core bento card categories and attributes
  const scoreCategories = [
    { key: "resume", name: "ATS Resume", score: scores?.resume?.score ?? 75, low: scores?.resume?.loweringFactors || [], fix: scores?.resume?.fastestFix || "Optimize keywords", target: "resume" },
    { key: "linkedIn", name: "LinkedIn Branding", score: scores?.linkedIn?.score ?? 70, low: scores?.linkedIn?.loweringFactors || [], fix: scores?.linkedIn?.fastestFix || "Complete profile headline", target: "resume" },
    { key: "skills", name: "Domain Skills", score: scores?.skills?.score ?? 80, low: scores?.skills?.loweringFactors || [], fix: scores?.skills?.fastestFix || "Build domain portfolio project", target: "roadmap" },
    { key: "interview", name: "Interview Prep", score: scores?.interview?.score ?? 65, low: scores?.interview?.loweringFactors || [], fix: scores?.interview?.fastestFix || "Complete AI mock interview", target: "interview" },
    { key: "aptitude", name: "Aptitude & Logical", score: scores?.aptitude?.score ?? 75, low: scores?.aptitude?.loweringFactors || [], fix: scores?.aptitude?.fastestFix || "Practice technical problem solving", target: "roadmap" },
    { key: "communication", name: "English & Comm", score: scores?.communication?.score ?? 80, low: scores?.communication?.loweringFactors || [], fix: scores?.communication?.fastestFix || "Practice spoken delivery drills", target: "communication" },
  ];

  // Find the lowest score category for our Floating Quick Actions Tray
  const lowestCategory = [...scoreCategories].sort((a, b) => a.score - b.score)[0];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const getSvgProgressColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-500";
    if (score >= 50) return "stroke-amber-500";
    return "stroke-rose-500";
  };

  // Define badges list dynamically computed based on state
  const badges: BadgeItem[] = [
    {
      id: "ats_pro",
      name: "ATS Pro",
      description: "Unlocked at 80%+ ATS Resume match",
      requirement: "Resume score >= 80%",
      icon: FileText,
      color: "from-emerald-500 to-teal-600",
      unlocked: (scores?.resume?.score ?? 0) >= 80
    },
    {
      id: "linkedin_auth",
      name: "LinkedIn Dynamo",
      description: "Unlocked at 80%+ LinkedIn match",
      requirement: "LinkedIn score >= 80%",
      icon: Sparkles,
      color: "from-sky-500 to-blue-600",
      unlocked: (scores?.linkedIn?.score ?? 0) >= 80
    },
    {
      id: "domain_scholar",
      name: "Domain Master",
      description: "Unlocked at 80%+ Technical score",
      requirement: "Domain score >= 80%",
      icon: BookOpen,
      color: "from-amber-500 to-orange-600",
      unlocked: (scores?.skills?.score ?? 0) >= 80
    },
    {
      id: "interview_gladiator",
      name: "STAR Interviewer",
      description: "Unlocked at 80%+ Interview score",
      requirement: "Interview score >= 80%",
      icon: MessageSquare,
      color: "from-indigo-500 to-purple-600",
      unlocked: (scores?.interview?.score ?? 0) >= 80
    },
    {
      id: "aptitude_elite",
      name: "Logic Wizard",
      description: "Unlocked at 80%+ Logical score",
      requirement: "Aptitude score >= 80%",
      icon: TrendingUp,
      color: "from-fuchsia-500 to-pink-600",
      unlocked: (scores?.aptitude?.score ?? 0) >= 80
    },
    {
      id: "expressive_orator",
      name: "Orator Supreme",
      description: "Unlocked at 80%+ Communication score",
      requirement: "Communication score >= 80%",
      icon: Volume2,
      color: "from-rose-500 to-red-600",
      unlocked: (scores?.communication?.score ?? 0) >= 80
    },
    {
      id: "elite_pathfinder",
      name: "Elite Co-Pilot",
      description: "Unlocked at 75%+ Overall Index",
      requirement: "Overall index >= 75%",
      icon: Compass,
      color: "from-yellow-400 to-emerald-500",
      unlocked: (scores?.overall ?? 0) >= 75
    }
  ];

  return (
    <div className="space-y-8 relative">
      {/* Top Engine View Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111]/80 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">VORYNEXA Intelligence Engine</h3>
            <p className="text-[11px] text-white/50">Multi-signal career classification, market positioning & readiness matrix</p>
          </div>
        </div>

        <div className="flex items-center bg-black/60 p-1 border border-white/10 rounded-xl gap-1 self-start sm:self-auto">
          {intelligenceMap.careerIntelligence && (
            <button
              onClick={() => setViewMode("career_intelligence")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "career_intelligence"
                  ? "bg-emerald-500 text-black font-black shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Career Intelligence Engine
            </button>
          )}

          <button
            onClick={() => setViewMode("index")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "index"
                ? "bg-emerald-500 text-black font-black shadow-lg"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Employability Index & Badges
          </button>
        </div>
      </div>

      {/* Render Career Intelligence Engine View */}
      {viewMode === "career_intelligence" && intelligenceMap.careerIntelligence ? (
        <CareerIntelligenceView
          data={intelligenceMap.careerIntelligence}
          onNavigateToSection={onNavigateToSection}
        />
      ) : (
        <>
      {/* Bento Grid Layout - Row 1 (Core dial + Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Core Employability Index Dial */}
        <div id="employability-index-dial" className="lg:col-span-1 bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#151515]/95 hover:scale-[1.02]">
          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Employability Index</h3>
          <div className="relative flex items-center justify-center my-6">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-white/5"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - scores.overall / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-white font-mono">{scores.overall}</span>
              <span className="text-white/40 font-bold block text-xs">/ 100</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/85">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Live Index
          </div>
        </div>

        {/* Card 2: Recruiter Summary Map */}
        <div id="recruiter-intelligence-map" className="lg:col-span-3 bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#151515]/95 hover:scale-[1.02]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base tracking-tight">Recruiter Intelligence Map</h3>
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line font-medium">
              {intelligenceMap.summary}
            </p>
          </div>
          {intelligenceMap.roleMismatchRisk && (
            <div className="mt-5 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">Role Alignment & Gaps Risk Warning</h4>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{intelligenceMap.roleMismatchRisk}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid Layout - Row 2 (Strengths & Assets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 3: Hidden Strengths */}
        <div id="hidden-strengths-card" className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#151515]/95 hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm">Undetected Strengths & Assets</h3>
          </div>
          <ul className="space-y-3">
            {intelligenceMap.hiddenStrengths?.map((strength, idx) => (
              <li key={idx} className="bg-black/30 p-3.5 rounded-xl border border-white/5 flex items-start gap-3 hover:border-white/10 transition-colors">
                <div className="w-5.5 h-5.5 bg-white/5 text-emerald-400 border border-white/10 rounded-md flex items-center justify-center font-mono text-xs font-black mt-0.5 shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs text-white/85 leading-relaxed font-semibold">{strength}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Card 4: Missing Placement Assets */}
        <div id="missing-assets-card" className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#151515]/95 hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm">Missing Placement Assets Checklist</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {intelligenceMap.missingAssets?.map((asset, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3.5 bg-black/30 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-white/80 font-bold">{asset}</span>
              </div>
            ))}
            {intelligenceMap.missingAssets?.length === 0 && (
              <p className="text-xs text-white/40 font-mono italic p-4 text-center">All primary placement assets are fully verified!</p>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid Layout - Row 3 (Interactive Badges) */}
      <div id="badges-grid-section" className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#151515]/95 hover:scale-[1.01]">
        <div className="flex items-center gap-2 mb-4 justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm">Professional Employability Badges</h3>
          </div>
          <span className="text-[10px] text-white/40 font-bold font-mono">
            {badges.filter(b => b.unlocked).length} OF {badges.length} UNLOCKED
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div 
                key={badge.id}
                className={`relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all group ${
                  badge.unlocked 
                    ? "bg-gradient-to-b from-[#181818] to-black border-emerald-500/30 text-white shadow-lg shadow-emerald-500/5 hover:border-emerald-500/60" 
                    : "bg-black/40 border-white/5 text-white/20 hover:border-white/10"
                }`}
                title={`${badge.name}: ${badge.requirement}`}
              >
                {/* Glowing Background Glow for Unlocked Badges */}
                {badge.unlocked && (
                  <div className={`absolute inset-0 bg-gradient-to-tr ${badge.color} opacity-5 rounded-xl blur-md group-hover:opacity-10 transition-opacity`} />
                )}

                {/* Badge Icon wrapper */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center relative mb-2.5 transition-all group-hover:scale-110 ${
                  badge.unlocked 
                    ? `bg-gradient-to-tr ${badge.color} text-black font-black shadow-md` 
                    : "bg-white/5 text-white/15"
                }`}>
                  {badge.unlocked ? (
                    <Icon className="w-5.5 h-5.5" />
                  ) : (
                    <div className="relative">
                      <Icon className="w-5.5 h-5.5 opacity-40" />
                      <Lock className="w-3.5 h-3.5 text-rose-500/80 absolute -top-1.5 -right-1.5 stroke-[3px]" />
                    </div>
                  )}
                </div>

                <span className={`text-[11px] font-black tracking-tight text-center ${badge.unlocked ? "text-white" : "text-white/30"}`}>
                  {badge.name}
                </span>
                
                <span className="text-[9px] font-mono text-white/30 mt-1 text-center scale-90 sm:scale-100">
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bento Grid Layout - Row 4 (Placement Scores Diagnostic) */}
      <div className="space-y-4">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono border-b border-white/10 pb-2 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-emerald-400" /> Readiness Index Diagnostic Matrix
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoreCategories.map((cat) => {
            const radius = 24;
            const strokeWidth = 4.5;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (cat.score / 100) * circumference;

            return (
              <div 
                key={cat.key} 
                className="bg-[#111]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl hover:border-emerald-500/30 hover:bg-[#151515]/95 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-white text-sm tracking-tight">{cat.name}</span>
                    
                    {/* SVG Circular Progress Indicator */}
                    <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className="stroke-white/5"
                          strokeWidth={strokeWidth}
                          fill="transparent"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r={radius}
                          className={`${getSvgProgressColor(cat.score)} transition-all duration-1000 ease-out`}
                          strokeWidth={strokeWidth}
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-[11px] font-black text-white font-mono">{cat.score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Factors lowering score */}
                  {cat.low.length > 0 ? (
                    <div className="space-y-1 mb-4">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-mono">Top Hurdles</span>
                      {cat.low.map((factor, fIdx) => (
                        <p key={fIdx} className="text-xs text-white/60 leading-normal flex items-start gap-1">
                          <span className="text-emerald-500/60 mt-0.5">•</span>
                          <span>{factor}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg mb-4">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-400 font-mono">ALL REQUIREMENT MET</span>
                    </div>
                  )}
                </div>

                {/* Fix button/action */}
                <div className="border-t border-white/5 pt-3.5 mt-2">
                  <div className="bg-black/40 p-3 rounded-xl border border-dashed border-white/10">
                    <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider block mb-1 font-mono">Fastest Employability Fix</span>
                    <p className="text-xs text-white/90 leading-relaxed font-bold">{cat.fix}</p>
                  </div>
                  <button
                    onClick={() => onNavigateToSection(cat.target)}
                    className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 border border-white/10 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black text-white/85 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    Solve Issue <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-black" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bento Grid Layout - Row 5 (Role Recommendations) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" /> Role Recommendation Engine
          </h3>
          <span className="text-[10px] text-white/40 font-bold font-mono">BACKGROUND ALIGNMENT</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedRoles.map((role, idx) => {
            const isDream = role.type === "dream";
            const isSafe = role.type === "safe";

            return (
              <div
                key={idx}
                className={`bg-[#111]/70 backdrop-blur-md border rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between ${
                  isDream ? "border-emerald-500/40 shadow-emerald-500/5 shadow-2xl" : "border-white/10"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isDream ? "bg-emerald-500 text-black font-black" : isSafe ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                    }`}>
                      {role.type} Target
                    </span>
                    <div className="text-right">
                      <span className="text-[9px] text-white/40 font-bold block font-mono">FIT PROBABILITY</span>
                      <span className="text-sm font-black font-mono text-emerald-400">{role.probability}%</span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-white text-base mb-1 tracking-tight">{role.role}</h4>
                  <p className="text-xs text-white/60 leading-relaxed mb-4">{role.reason}</p>
                </div>

                <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-bold">Est. Package:</span>
                    <span className="text-emerald-400 font-black font-mono">{role.salaryUpside}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-bold">Learning Curve:</span>
                    <span className="text-white/80 font-bold">{role.learningFit}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button / Quick Actions Tray */}
      <div 
        id="floating-quick-action-tray" 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl border border-emerald-500/30 rounded-full pl-5 pr-3 py-3 shadow-2xl flex items-center gap-4 transition-all duration-300 hover:border-emerald-500/60 hover:scale-105 group whitespace-nowrap"
      >
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        
        <div className="text-left leading-none">
          <span className="text-[10px] text-white/40 font-bold uppercase block tracking-wider font-mono">RECOMMENDED NEXT HURDLE</span>
          <span className="text-xs font-black text-white">{lowestCategory.name} is currently low ({lowestCategory.score}%)</span>
        </div>

        <button
          onClick={() => onNavigateToSection(lowestCategory.target)}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-full transition-all cursor-pointer"
        >
          Fix Hurdles <Sparkles className="w-3.5 h-3.5 text-black" />
        </button>
      </div>
      </>
      )}

    </div>
  );
}
