import React, { useState, useEffect } from "react";
import { StudentProfile, HRProfileAnalysis } from "../types";
import { 
  Linkedin, 
  Github, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Gauge, 
  Check, 
  Copy,
  AlertCircle 
} from "lucide-react";

interface HRProfileRatingProps {
  profile: StudentProfile;
  onSaveAnalysis?: (analysis: HRProfileAnalysis) => Promise<void>;
  initialAnalysis: HRProfileAnalysis | null;
  callServerEndpoint: (endpoint: string, body: any) => Promise<any>;
}

export default function HRProfileRating({
  profile,
  onSaveAnalysis,
  initialAnalysis,
  callServerEndpoint,
}: HRProfileRatingProps) {
  const [linkedinUrl, setLinkedinUrl] = useState<string>(profile.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState<string>(profile.githubUrl || "");
  const [analysis, setAnalysis] = useState<HRProfileAnalysis | null>(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [completedFixes, setCompletedFixes] = useState<Record<number, boolean>>({});
  const [copiedOutreachIdx, setCopiedOutreachIdx] = useState<string | null>(null);

  const getLinkedInOutreachMessage = () => {
    return `Hi, I noticed your team works with ${profile.targetRoles?.[0] || "Software Engineering"} roles. As a student of ${profile.branch || "Computer Science"} at ${profile.college || "my university"}, I’ve been building projects in ${profile.technicalSkills?.slice(0, 3).join(", ") || "development"}. Here is my GitHub: ${githubUrl || "my Github URL"}. I'd love to connect and learn more about potential opportunities or team culture at your firm!`;
  };

  const getRecruiterEmailMessage = () => {
    return `Subject: Referral Inquiry - ${profile.targetRoles?.[0] || "Software Engineering"} - ${profile.name}

Dear Hiring Team,

My name is ${profile.name}, and I am a final-year student specializing in ${profile.branch || "Computer Science"} at ${profile.college || "my college"}. 

I recently completed an HR Socials Screen using PlacementOS, scoring ${analysis?.ratings.professionalism || 85}% in Professionalism and ${analysis?.ratings.githubActivity || 80}% in Technical Maturity. 

Over the past semesters, I've honed skills in ${profile.technicalSkills?.slice(0, 5).join(", ") || "various technologies"} and built portfolio-worthy applications. You can view my public profiles below:
- LinkedIn: ${linkedinUrl || "[LinkedIn Link]"}
- GitHub Portfolio: ${githubUrl || "[GitHub Link]"}

I am eager to apply for entry-level ${profile.targetRoles?.[0] || "Software Engineer"} positions. I have attached my resume and would appreciate a brief call to discuss how my background aligns with your team's needs.

Thank you for your time and consideration.

Sincerely,
${profile.name}
${linkedinUrl || "[LinkedIn Link]"}`;
  };

  useEffect(() => {
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
      setLinkedinUrl(initialAnalysis.linkedinUrl || profile.linkedinUrl || "");
      setGithubUrl(initialAnalysis.githubUrl || profile.githubUrl || "");
    } else {
      if (profile.linkedinUrl) setLinkedinUrl(profile.linkedinUrl);
      if (profile.githubUrl) setGithubUrl(profile.githubUrl);
    }
  }, [initialAnalysis, profile.linkedinUrl, profile.githubUrl]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl.trim() && !githubUrl.trim()) {
      setError("Please provide at least one social profile link (LinkedIn or GitHub) to start the HR analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await callServerEndpoint("/api/placement/analyze-socials", {
        linkedinUrl,
        githubUrl,
        profile,
      });
      setAnalysis(data);
      setCompletedFixes({});
      if (onSaveAnalysis) {
        await onSaveAnalysis(data);
      }
    } catch (err: any) {
      console.error("HR Socials analysis failed:", err);
      setError("We encountered an error during analysis. Please verify your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
    if (score >= 50) return "text-amber-400 border-amber-500/30 bg-amber-500/5";
    return "text-rose-400 border-rose-500/30 bg-rose-500/5";
  };

  const toggleFix = (index: number) => {
    setCompletedFixes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <Sparkles className="w-3 h-3 animate-pulse" /> Recruiter Evaluation Suite
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">AI HR Profile Audit</h2>
            <p className="text-white/60 text-xs max-w-xl leading-relaxed">
              Submit your public handles to undergo a rigorous, strict recruiter screening. Get scored on industry standards, professionalism, and engineering appeal.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" /> Enter Professional Handles
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-1">
            PROVIDE PUBLIC LINKS SO OUR AI HR MANAGER CAN EVALUATE PORTFOLIO COMPLEXITY
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" /> LinkedIn Profile URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-white" /> GitHub Profile URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
              className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
          </div>

          <div className="md:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Screening Profiles...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run HR Audit & Grade Profiles
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Verdict and Score Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Recruiter Verdict Card */}
            <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Recruiter Feedback</span>
                  <h3 className="font-extrabold text-sm text-white mt-1">HR VERDICT</h3>
                </div>
                <div className="relative">
                  <span className="absolute -top-3 -left-2 text-6xl text-emerald-500/10 font-serif select-none">“</span>
                  <p className="text-sm text-white/90 italic leading-relaxed font-sans pl-4 relative z-10">
                    {analysis.hrVerdict}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-white/50 uppercase tracking-widest">
                  Graded on Global Standards
                </span>
              </div>
            </div>

            {/* Right: Scores bento layout */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {[
                { name: "Public Professionalism", value: analysis.ratings.professionalism, desc: "Branding alignment, profile clarity, and recruiter appeal." },
                { name: "Technical Maturity", value: analysis.ratings.githubActivity, desc: "Commit frequencies, repo clarity, and engineering postures." },
                { name: "Profile Activity", value: analysis.ratings.hrAppeal, desc: "Recruiter search visibility and interaction frequencies." },
                { name: "LinkedIn Completeness", value: analysis.ratings.linkedinCompleteness, desc: "Keyword density, banner layout, and title strength." }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-white/70 uppercase tracking-wide font-mono">{item.name}</h4>
                    <p className="text-[10px] text-white/40 leading-normal mt-1">{item.desc}</p>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tighter text-white font-mono">{item.value}</span>
                      <span className="text-xs text-white/30 font-mono">/100</span>
                      <div className="ml-auto">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getScoreColor(item.value)}`}>
                          {item.value >= 80 ? "STRONG" : item.value >= 50 ? "AVERAGE" : "WEAK"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Linear Progress Bar Indicator */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.value >= 80 
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                            : item.value >= 50 
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                              : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        }`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pros and Cons Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pros */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono">Screening Strengths (Pros)</h3>
              </div>
              <ul className="space-y-3">
                {analysis.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono">Screening Risks (Cons)</h3>
              </div>
              <ul className="space-y-3">
                {analysis.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0 mt-2" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Critical Fixes interactive Checklist */}
          <div className="bg-[#111] border border-amber-500/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono">Critical HR Fixes</h3>
                <p className="text-[10px] text-white/40 mt-0.5">COMPLETE THESE TASKS IMMEDIATELY TO PASS SCREENING RIGOR</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {analysis.criticalFixes.map((fix, index) => (
                <div 
                  key={index} 
                  onClick={() => toggleFix(index)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    completedFixes[index] 
                      ? "bg-emerald-500/5 border-emerald-500/30 text-white/40" 
                      : "bg-black/20 border-white/5 hover:border-white/10 text-white/90"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    completedFixes[index] 
                      ? "bg-emerald-500 border-emerald-500 text-black" 
                      : "border-white/20 hover:border-emerald-500/40"
                  }`}>
                    {completedFixes[index] && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                  </div>
                  <span className={`text-xs leading-relaxed font-sans ${completedFixes[index] ? "line-through" : ""}`}>
                    {fix}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outreach Templates Generated from Audit */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Dynamic High-Conversion Outreach
                </h3>
                <p className="text-[10px] text-white/40 mt-0.5 font-mono">PERSONALIZE COLD-OUTREACH USING YOUR COMPLETED HR AUDIT RATINGS</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LinkedIn Connection Template */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">LinkedIn Request Template</span>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Recruiter Inbound</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-lg border border-white/5 font-mono text-xs text-white/80 leading-relaxed whitespace-pre-line min-h-[140px] max-h-[180px] overflow-y-auto">
                    {getLinkedInOutreachMessage()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getLinkedInOutreachMessage());
                    setCopiedOutreachIdx("linkedin");
                    setTimeout(() => setCopiedOutreachIdx(null), 2000);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    copiedOutreachIdx === "linkedin"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono"
                      : "bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                  }`}
                >
                  {copiedOutreachIdx === "linkedin" ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> Copied LinkedIn Text!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy LinkedIn Message
                    </>
                  )}
                </button>
              </div>

              {/* Recruiter Cold Email Template */}
              <div className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Direct Email Template</span>
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Scored Pitch</span>
                  </div>
                  <div className="bg-black/40 p-4 rounded-lg border border-white/5 font-mono text-xs text-white/80 leading-relaxed whitespace-pre-line min-h-[140px] max-h-[180px] overflow-y-auto font-mono">
                    {getRecruiterEmailMessage()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getRecruiterEmailMessage());
                    setCopiedOutreachIdx("email");
                    setTimeout(() => setCopiedOutreachIdx(null), 2000);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    copiedOutreachIdx === "email"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono"
                      : "bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-black shadow-lg shadow-emerald-500/10"
                  }`}
                >
                  {copiedOutreachIdx === "email" ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> Copied Email Text!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Pitch Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
