import React, { useState } from "react";
import { ResumeLinkedInSuggestion, StudentProfile } from "../types";
import { FileText, Sparkles, AlertCircle, RefreshCw, CheckCircle, Lightbulb, Zap, HelpCircle, X, ShieldAlert, BadgeInfo, Play, ArrowRight, Clipboard } from "lucide-react";

interface ResumeBuilderProps {
  profile: StudentProfile;
  suggestions: ResumeLinkedInSuggestion | null;
  onOptimize: (jobDesc: string) => Promise<void>;
  isOptimizing: boolean;
}

export default function ResumeBuilder({
  profile,
  suggestions,
  onOptimize,
  isOptimizing,
}: ResumeBuilderProps) {
  const [jobDesc, setJobDesc] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // AI Feedback Overlay states
  const [activeOverlayIndex, setActiveOverlayIndex] = useState<number | null>(null);
  const [customMetric, setCustomMetric] = useState<string>("35");
  const [customScale, setCustomScale] = useState<string>("large-scale");

  const handleCopy = (text: string, index: number, type: string) => {
    navigator.clipboard.writeText(text);
    const key = `${type}-${index}`;
    setCopiedIndex(index);
    setCopiedText(key);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedText(null);
    }, 2000);
  };

  const handleSubmitTailor = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(jobDesc);
  };

  const getSimulatedRewrite = (after: string) => {
    // Dynamically inject custom metrics if they are detected in the optimized text
    let dynamic = after;
    dynamic = dynamic.replace(/\d+%/g, `${customMetric}%`);
    dynamic = dynamic.replace(/large-scale/gi, customScale === "large-scale" ? "enterprise-scale" : "multi-tier");
    return dynamic;
  };

  return (
    <div className="space-y-8">
      
      {/* Bento Section 1: Target Optimizer form */}
      <div className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <FileText className="w-5 h-5 text-emerald-400 animate-pulse" />
          <h3 className="font-extrabold text-white text-base tracking-tight">Role-Specific ATS Customizer</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-medium">
          Paste your target job description (JD) below. Our deep analyzer extracts critical high-priority keywords, identifies gaps in your technical profile, and tailors your experience bullet points.
        </p>

        <form onSubmit={handleSubmitTailor} className="space-y-4">
          <textarea
            rows={4}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste target Job Description here (e.g. key responsibilities, software requirements, qualifications)..."
            className="w-full text-xs border border-white/10 rounded-xl p-4 text-white bg-black/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20 font-medium leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isOptimizing}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Tailoring Resume Assets...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Tailor Resume & LinkedIn
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {suggestions ? (
        <div className="space-y-8">
          
          {/* Bento Section 2: Headline & Summary Blueprints (CSS Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Headline Blueprint */}
            <div className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div>
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                  <Lightbulb className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono block">LinkedIn Headline Blueprint</span>
                </div>
                <h4 className="text-sm font-black text-white mb-3">ATS-Optimized Headline</h4>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-bold text-emerald-300 text-xs leading-relaxed italic relative">
                  "{suggestions.suggestedHeadline}"
                </div>
              </div>
              
              <button
                onClick={() => handleCopy(suggestions.suggestedHeadline, 0, "headline")}
                className="mt-5 flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                {copiedText === "headline-0" ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Copied Headline
                  </>
                ) : (
                  "Copy Headline"
                )}
              </button>
            </div>

            {/* About Section Blueprint */}
            <div className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div>
                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-mono block">Elevator Summary / About Me</span>
                </div>
                <h4 className="text-sm font-black text-white mb-3">Resume / Profile Summary</h4>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-white/80 text-xs leading-relaxed max-h-[120px] overflow-y-auto font-medium">
                  {suggestions.suggestedAboutSection}
                </div>
              </div>
              
              <button
                onClick={() => handleCopy(suggestions.suggestedAboutSection, 0, "about")}
                className="mt-5 flex items-center justify-center gap-1.5 w-full py-2.5 border border-white/10 hover:border-emerald-500 hover:text-white text-white/85 rounded-xl text-xs font-bold transition-all bg-white/5 cursor-pointer"
              >
                {copiedText === "about-0" ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" /> Copied Summary
                  </>
                ) : (
                  "Copy Summary Section"
                )}
              </button>
            </div>
          </div>

          {/* Weak phrases / Fillers detection banner */}
          {suggestions.weakPhrasesDetected?.length > 0 && (
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4 transition-all hover:border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <h4 className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider">Weak Fillers & Non-Quantitative Phrasing Detected</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  {suggestions.weakPhrasesDetected.map((phrase, idx) => (
                    <span key={idx} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold">
                      {phrase}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-white/50 mt-2.5 leading-normal font-semibold">
                  We identified filler terms in your submission. Try to swap these placeholder terms with metric-driven, action-focused phrasing inside your primary drafts.
                </p>
              </div>
            </div>
          )}

          {/* Bento Section 3: ATS Bullet points rewrite grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> ATS Impact Bullet Point Rewrite Matrix
              </h3>
              <span className="text-[10px] font-mono text-white/40 font-bold uppercase">Click standard bullets to trigger AI Overlay</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.atsBulletImprovements?.map((item, idx) => (
                <div key={idx} className="bg-[#111]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20 hover:bg-[#151515]/90 space-y-4">
                  <div className="space-y-3">
                    
                    {/* Before (Weak Bullet point with Pulse effect and cursor indication) */}
                    <div 
                      id={`weak-bullet-${idx}`}
                      onClick={() => {
                        setActiveOverlayIndex(idx);
                        // Extract a number if it exists in item.after to seed the customMetric state
                        const numMatch = item.after.match(/\d+/);
                        if (numMatch) setCustomMetric(numMatch[0]);
                      }}
                      className="p-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 hover:border-rose-500/40 rounded-xl cursor-pointer transition-all duration-300 relative group animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.15)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                          Weak / Vague (Click for AI Overlay)
                        </span>
                        <span className="text-[8px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-md font-bold font-mono uppercase tracking-wide opacity-80 group-hover:opacity-100">Click to Optimize</span>
                      </div>
                      <p className="text-xs text-white/50 italic leading-relaxed font-semibold">"{item.before}"</p>
                    </div>

                    {/* After */}
                    <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5 font-mono">ATS-Optimized Bullet (Metrics-Driven)</span>
                      <p className="text-xs text-emerald-300 font-bold leading-relaxed">"{item.after}"</p>
                    </div>
                  </div>

                  {/* Explanation & Action wrapper */}
                  <div className="border-t border-white/5 pt-3.5 space-y-3">
                    <p className="text-[11px] text-white/50 leading-relaxed font-semibold">
                      <strong className="text-white/80 font-bold font-mono text-[10px] uppercase tracking-wider">Strategy:</strong> {item.explanation}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(item.after, idx, "bullet")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-white/10 hover:border-emerald-500 hover:text-white text-white/80 rounded-xl text-xs font-bold transition-all bg-white/5 cursor-pointer"
                      >
                        {copiedText === `bullet-${idx}` ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          "Copy Original Optimized"
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveOverlayIndex(idx);
                          const numMatch = item.after.match(/\d+/);
                          if (numMatch) setCustomMetric(numMatch[0]);
                        }}
                        className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Open metric customizer"
                      >
                        Customize Metric
                      </button>
                    </div>
                  </div>

                  {/* AI Feedback Overlay Modal */}
                  {activeOverlayIndex === idx && (
                    <div 
                      id={`ai-feedback-overlay-${idx}`}
                      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                      onClick={() => setActiveOverlayIndex(null)}
                    >
                      <div 
                        className="bg-[#111] border border-white/15 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => setActiveOverlayIndex(null)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                          <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-white text-sm">Interactive AI Feedback Critique</h3>
                            <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Bullet Point ID: POS-REWRITE-{idx + 1}</p>
                          </div>
                        </div>

                        {/* Critique Body */}
                        <div className="space-y-3.5 text-xs">
                          {/* Weak Phrase alert */}
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5" /> Core Weakness Detected
                            </span>
                            <p className="text-[11px] leading-relaxed">
                              "{item.before}" lacks specific metrics, utilizes passive verbs, and misses immediate impact statements necessary to pass modern ATS pre-scans.
                            </p>
                          </div>

                          {/* Strategy detail */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Actionable Strategy</span>
                            <p className="text-white/80 leading-relaxed font-semibold">
                              {item.explanation}
                            </p>
                          </div>

                          {/* Interactive Metric Sandbox */}
                          <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                            <div className="flex items-center justify-between text-white/40 font-mono text-[9px] font-bold uppercase">
                              <span>Metric Impact Simulator</span>
                              <span className="text-emerald-400">Live Adjustment</span>
                            </div>

                            {/* metric slider */}
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] font-medium text-white/70">
                                <label className="font-sans">Quantifiable Value (Percentage / Gain):</label>
                                <span className="font-mono font-bold text-emerald-400">{customMetric}%</span>
                              </div>
                              <input 
                                type="range" 
                                min="10" 
                                max="95" 
                                value={customMetric} 
                                onChange={(e) => setCustomMetric(e.target.value)}
                                className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            {/* scale selector */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] text-white/70 block">Architectural Scale Factor:</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => setCustomScale("large-scale")}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase border transition-colors ${customScale === "large-scale" ? "bg-emerald-500 text-black border-emerald-500" : "bg-transparent border-white/10 text-white/60 hover:text-white"}`}
                                >
                                  Enterprise-Scale
                                </button>
                                <button 
                                  onClick={() => setCustomScale("multi-tier")}
                                  className={`py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase border transition-colors ${customScale === "multi-tier" ? "bg-emerald-500 text-black border-emerald-500" : "bg-transparent border-white/10 text-white/60 hover:text-white"}`}
                                >
                                  Multi-Tier Stack
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Real-time result output */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Resulting High-Impact ATS Statement</span>
                            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl relative group">
                              <p className="text-xs text-emerald-300 font-bold leading-relaxed pr-6">
                                "{getSimulatedRewrite(item.after)}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Copy / Apply Actions */}
                        <div className="flex gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => {
                              handleCopy(getSimulatedRewrite(item.after), idx, "custom-bullet");
                              setActiveOverlayIndex(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Apply & Copy Tailored Bullet
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111]/70 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
          <AlertCircle className="w-10 h-10 text-emerald-400 mb-3 animate-pulse" />
          <h3 className="font-extrabold text-white text-sm font-mono">Waiting for Optimizer Execution</h3>
          <p className="text-xs text-white/50 max-w-sm text-center mt-1 leading-relaxed px-4 font-medium">
            Click "Tailor Resume & LinkedIn" above to run our diagnostic engine and extract keywords or generate high-impact rephrases.
          </p>
        </div>
      )}
    </div>
  );
}
