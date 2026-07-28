import React, { useState } from "react";
import { EnterpriseCareerIntelligence } from "../types";
import {
  Building2,
  Briefcase,
  Target,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  Cpu,
  Code2,
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Compass,
  Check,
  FileText,
  MessageSquare
} from "lucide-react";

interface CareerIntelligenceViewProps {
  data: EnterpriseCareerIntelligence;
  onNavigateToSection?: (section: string) => void;
}

export default function CareerIntelligenceView({
  data,
  onNavigateToSection
}: CareerIntelligenceViewProps) {
  const [activeTab, setActiveTab] = useState<"classification" | "analysis" | "roadmap" | "companies">("classification");

  const classification = data?.classification || {
    industry: "Technology",
    profession: "Software Engineer",
    specialization: "Full Stack",
    careerLevel: "Mid Level",
    targetCompanyTier: "Tier 1",
    targetCompany: "Tech Enterprise",
    targetSalary: "$120,000",
    futureGoal: "Engineering Leadership",
    skillGapSummary: "Identified domain opportunities",
    careerTransition: {
      transitionType: "Upward Growth",
      feasibilityScore: 85,
      complexityLevel: "Moderate",
      explainableReasoning: "Strong technical baseline"
    }
  };

  const safeCareerTransition = classification.careerTransition || {
    transitionType: "Upward Growth",
    feasibilityScore: 85,
    complexityLevel: "Moderate",
    explainableReasoning: "Strong technical baseline"
  };

  const careerAnalysis = data?.careerAnalysis || {
    overallMarketPositioning: "High demand candidate",
    coreValueProposition: "Full stack engineering mastery",
    competitiveMoat: ["System Architecture", "Problem Solving"],
    explainableReasoning: "Proven project delivery",
    truthVerifiedAssessment: "Background verified"
  };

  const resumeQuality = data?.resumeQuality || {
    overallScore: 78,
    atsScore: 82,
    bulletImpactScore: 75,
    formattingScore: 80,
    keyStrengths: ["Clear technical skills", "Relevant experience"],
    actionableImprovements: ["Quantify achievements"]
  };

  const interviewReadiness = data?.interviewReadiness || {
    overallReadiness: 75,
    technicalReadiness: 80,
    behavioralReadiness: 72,
    hrReadiness: 75,
    keyStrengths: ["Solid CS fundamentals"],
    recommendedFocusAreas: ["System design whiteboarding"]
  };

  const learningPlan = data?.learningPlan || [];
  const recommendedCertifications = data?.recommendedCertifications || [];
  const recommendedProjects = data?.recommendedProjects || [];
  const recommendedTechnologies = data?.recommendedTechnologies || [];
  const recommendedSoftSkills = data?.recommendedSoftSkills || [];
  const targetCompanies = data?.targetCompanies || [];
  const futureCareerPaths = data?.futureCareerPaths || [];
  const alternativeCareerOptions = data?.alternativeCareerOptions || [];
  const salaryGrowthSuggestions = data?.salaryGrowthSuggestions || {
    marketRangeGuidance: "$100k - $150k",
    keySalaryMultipliers: ["Cloud Certification", "System Design"],
    negotiationLeveragePoints: ["Multiple offers"],
    disclaimer: "Estimates based on market data"
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Enterprise Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-black to-slate-950/80 border border-emerald-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-mono font-bold tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> ENTERPRISE AI CAREER INTELLIGENCE ENGINE
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {classification.profession || "Career Architect"} <span className="text-emerald-400 font-mono text-xl">[{classification.careerLevel}]</span>
            </h2>
            <p className="text-sm text-white/70 max-w-2xl mt-1 leading-relaxed">
              Domain: <strong className="text-white">{classification.industry}</strong> • Focus: <strong className="text-emerald-300">{classification.specialization}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-black/60 border border-white/10 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-white/40 font-mono font-bold block uppercase">Transition Feasibility</span>
              <span className="text-lg font-black font-mono text-emerald-400">{safeCareerTransition.feasibilityScore}%</span>
            </div>
            <div className="bg-black/60 border border-white/10 px-4 py-2.5 rounded-xl text-center">
              <span className="text-[10px] text-white/40 font-mono font-bold block uppercase">Complexity</span>
              <span className="text-xs font-bold font-mono text-amber-300">{safeCareerTransition.complexityLevel}</span>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 mt-6 pt-2 gap-4 text-xs font-bold overflow-x-auto">
          {[
            { id: "classification", label: "Executive Classification", icon: Building2 },
            { id: "analysis", label: "Market Positioning & Moat", icon: Compass },
            { id: "roadmap", label: "Learning & Growth Matrix", icon: Layers },
            { id: "companies", label: "Target Companies & Paths", icon: Target }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "border-emerald-400 text-emerald-400 font-black"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: EXECUTIVE CLASSIFICATION */}
      {activeTab === "classification" && (
        <div className="space-y-6">
          {/* Classification Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Primary Industry</span>
              <p className="text-sm font-black text-white">{classification.industry}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Target Profession</span>
              <p className="text-sm font-black text-white">{classification.profession}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Specialization</span>
              <p className="text-sm font-black text-white">{classification.specialization}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Career Level</span>
              <p className="text-sm font-black text-white">{classification.careerLevel}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Target Company Tier</span>
              <p className="text-sm font-black text-white">{classification.targetCompanyTier}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Target Company</span>
              <p className="text-sm font-black text-white">{classification.targetCompany}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">Target Salary Baseline</span>
              <p className="text-sm font-black text-emerald-400 font-mono">{classification.targetSalary}</p>
            </div>
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-extrabold uppercase tracking-widest block">5-Year Vision</span>
              <p className="text-xs font-bold text-white/90 truncate">{classification.futureGoal}</p>
            </div>
          </div>

          {/* Career Transition Deep Dive */}
          <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Career Transition Analysis
              </h3>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">
                Type: {classification.careerTransition.transitionType}
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-mono bg-black/40 p-4 rounded-xl border border-white/5">
              <strong className="text-emerald-400">Explainable AI Reasoning:</strong> {classification.careerTransition.explainableReasoning}
            </p>
            <div className="space-y-1">
              <span className="text-[10px] text-white/40 font-mono uppercase font-bold">Skill Gap Diagnostics Summary</span>
              <p className="text-xs text-white/80 leading-relaxed">{classification.skillGapSummary}</p>
            </div>
          </div>

          {/* Resume & Interview Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Quality */}
            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-white text-sm">Resume Quality Audit</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${getScoreColor(resumeQuality.overallScore)}`}>
                  {resumeQuality.overallScore}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">ATS Match</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{resumeQuality.atsScore}%</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">Bullet Impact</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{resumeQuality.bulletImpactScore}%</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">Formatting</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{resumeQuality.formattingScore}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">Key Strengths</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(resumeQuality?.keyStrengths || []).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-rose-400 font-mono font-bold uppercase block">Actionable Fixes</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(resumeQuality?.actionableImprovements || []).map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Readiness */}
            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-extrabold text-white text-sm">Interview Readiness</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${getScoreColor(interviewReadiness?.overallReadiness || 75)}`}>
                  {interviewReadiness?.overallReadiness || 75}/100
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">Technical</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{interviewReadiness?.technicalReadiness || 75}%</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">Behavioral</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{interviewReadiness?.behavioralReadiness || 75}%</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                  <span className="text-[9px] text-white/40 block font-mono">HR & Culture</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">{interviewReadiness?.hrReadiness || 75}%</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">Core Readiness Strengths</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(interviewReadiness?.keyStrengths || []).map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">Recommended Focus Areas</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(interviewReadiness?.recommendedFocusAreas || []).map((foc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{foc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET POSITIONING & MOAT */}
      {activeTab === "analysis" && (
        <div className="space-y-6">
          <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Executive Market Positioning
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-bold">{careerAnalysis.overallMarketPositioning}</p>

            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-2">
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">Explainable Strategic Reasoning</span>
              <p className="text-xs text-white/80 leading-relaxed font-mono">{careerAnalysis.explainableReasoning}</p>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Truth-Verified Background Guarantee
              </span>
              <p className="text-xs text-emerald-200/90 leading-relaxed">{careerAnalysis.truthVerifiedAssessment}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-3">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" /> Core Value Proposition
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">{careerAnalysis.coreValueProposition}</p>
            </div>

            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-3">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Competitive Moat Factors
              </h4>
              <ul className="space-y-2">
                {(careerAnalysis?.competitiveMoat || []).map((moat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/80 bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{moat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Salary Growth Suggestions */}
          <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" /> High-Level Compensation & Leverage
              </h3>
              <span className="text-[10px] text-white/40 font-mono uppercase">Guidance Only</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-bold">{salaryGrowthSuggestions?.marketRangeGuidance || "Competitive Industry Standard Benchmark"}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase block">Key Salary Multipliers</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(salaryGrowthSuggestions?.keySalaryMultipliers || []).map((mult, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-emerald-400" />
                      <span>{mult}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase block">Negotiation Leverage Points</span>
                <ul className="space-y-1 text-xs text-white/80">
                  {(salaryGrowthSuggestions?.negotiationLeveragePoints || []).map((lev, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                      <span>{lev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-[10px] text-white/40 italic font-mono pt-1">{salaryGrowthSuggestions.disclaimer}</p>
          </div>
        </div>
      )}

      {/* TAB 3: LEARNING & GROWTH MATRIX */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {/* Phase-by-phase Learning Plan */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/10 pb-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Structured Skill Acquisition Plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(learningPlan || []).map((step, idx) => (
                <div key={idx} className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-emerald-400 uppercase font-mono">{step.phase}</span>
                      <span className="text-[10px] text-white/40 font-mono font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10">{step.timeframe}</span>
                    </div>

                    <div className="space-y-3 mt-3">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Core Focus</span>
                        <div className="flex flex-wrap gap-1">
                          {(step.coreSkillFocus || []).map((sk, sIdx) => (
                            <span key={sIdx} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/20">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Milestones</span>
                        <ul className="space-y-1 text-xs text-white/80">
                          {(step.milestones || []).map((m, mIdx) => (
                            <li key={mIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] text-amber-400 uppercase font-mono block mb-1">Key Action Item</span>
                    <p className="text-xs text-white/90 font-bold">{step.actionItems?.[0] || "Execute core milestones"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Certifications & Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certifications */}
            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> High-ROI Certifications
              </h4>
              <div className="space-y-3">
                {(recommendedCertifications || []).map((cert, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-white text-xs">{cert.name}</h5>
                      <p className="text-[11px] text-white/50">{cert.issuingBody} • {cert.relevance}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono rounded-lg shrink-0">
                      ROI: {cert.roiScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Projects */}
            <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
              <h4 className="text-sm font-extrabold text-white font-mono flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" /> Recommended Portfolio Deliverables
              </h4>
              <div className="space-y-3">
                {(recommendedProjects || []).map((proj, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-3.5 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-white text-xs">{proj.title}</h5>
                      <span className="text-[9px] font-mono text-emerald-400 uppercase">CV Impact Ready</span>
                    </div>
                    <p className="text-[11px] text-white/70 leading-relaxed">{proj.objective}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(proj.technologiesOrTools || []).map((tech, tIdx) => (
                        <span key={tIdx} className="text-[9px] px-2 py-0.5 bg-white/5 text-white/80 rounded font-mono border border-white/10">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tech Stack & Soft Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" /> Priority Toolstack & Technologies
              </h4>
              <div className="flex flex-wrap gap-2">
                {(recommendedTechnologies || []).map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-xl">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Executive & Soft Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(recommendedSoftSkills || []).map((sk, idx) => (
                  <span key={idx} className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono font-bold rounded-xl">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TARGET COMPANIES & PATHWAYS */}
      {activeTab === "companies" && (
        <div className="space-y-6">
          {/* Target Companies */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/10 pb-2">
              <Building2 className="w-4 h-4 text-emerald-400" /> Categorized Target Companies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(targetCompanies || []).map((comp, idx) => (
                <div key={idx} className="bg-[#111]/80 border border-white/10 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-extrabold text-white text-base tracking-tight">{comp.companyName}</h4>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                        {comp.tier}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed mb-3">{comp.whyFit}</p>
                  </div>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Key Hiring Criteria</span>
                    <ul className="space-y-1 text-xs text-white/80">
                      {(comp.keyHiringCriteria || []).map((crit, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Future Career Paths */}
          <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" /> Multi-Year Career Progression Pathway
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(futureCareerPaths || []).map((path, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded border border-emerald-500/20 inline-block">
                    {path.timeframe} Target
                  </span>
                  <h5 className="font-extrabold text-white text-sm">{path.roleTitle}</h5>
                  <p className="text-xs text-white/70 leading-relaxed">{path.expectedScope}</p>
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-[9px] text-white/40 uppercase font-mono">Milestones</span>
                    {(path.keyMilestones || []).map((m, mIdx) => (
                      <p key={mIdx} className="text-[11px] text-white/80 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" /> {m}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Career Options */}
          <div className="bg-[#111]/80 border border-white/10 p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Strategic Alternative Career Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(alternativeCareerOptions || []).map((alt, idx) => (
                <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white text-sm">{alt.roleTitle}</h5>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold rounded">
                      {alt.skillOverlapPercentage}% Overlap
                    </span>
                  </div>
                  <p className="text-xs text-white/70">{alt.whyConsider}</p>
                  <div className="flex justify-between text-[11px] font-mono pt-1 text-white/40">
                    <span>Industry: {alt.industry}</span>
                    <span className="text-amber-300">Effort: {alt.transitionEffort}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
