import React, { useState } from "react";
import { NegotiationAdvisorResponse, StudentProfile } from "../types";
import { Award, RefreshCw, Sparkles, AlertCircle, Copy, Check, ShieldAlert, Heart } from "lucide-react";

interface NegotiationCoachProps {
  profile: StudentProfile;
  advice: NegotiationAdvisorResponse | null;
  onGenerate: (offer: string, company: string, expectations: string) => Promise<void>;
  isGenerating: boolean;
}

export default function NegotiationCoach({
  profile,
  advice,
  onGenerate,
  isGenerating,
}: NegotiationCoachProps) {
  const [currentOffer, setCurrentOffer] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [expectations, setExpectations] = useState(profile.salaryExpectation || "");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchAdvice = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(currentOffer, targetCompany, expectations);
  };

  return (
    <div className="space-y-8">
      {/* Advisor Setup */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-xl shadow-lg space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Award className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-sm font-extrabold">Offer & Salary Negotiation Advisor</h3>
        </div>
        <p className="text-white/60 text-xs">
          Enter your current or tentative offer details below. We'll generate a professional, highly polite negotiation email template and script strategies so you never leave value on the table.
        </p>

        <form onSubmit={handleFetchAdvice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-widest font-mono text-[9px] mb-1">Target Company Name</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Acme Tech, TCS, Stripe"
                className="w-full text-xs border border-white/10 rounded-lg px-3 py-2 text-white bg-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-widest font-mono text-[9px] mb-1">Your Salary Expectations</label>
              <input
                type="text"
                value={expectations}
                onChange={(e) => setExpectations(e.target.value)}
                placeholder="e.g. ₹6 LPA, $90,000/year"
                className="w-full text-xs border border-white/10 rounded-lg px-3 py-2 text-white bg-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 uppercase tracking-widest font-mono text-[9px] mb-1">Current Offer Terms / Tentative Figures (If any)</label>
            <textarea
              rows={3}
              value={currentOffer}
              onChange={(e) => setCurrentOffer(e.target.value)}
              placeholder="Describe the salary, benefits, or stock details offered (e.g., ₹4 LPA base, ₹50k joining bonus offered, HR wants an answer by Friday)..."
              className="w-full text-xs border border-white/10 rounded-lg p-3 text-white bg-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/30"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isGenerating || !targetCompany}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Offer Leverage...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Formulate Negotiation Playbook
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {advice ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strategy Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                <Heart className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm font-extrabold">Negotiation Strategy</h4>
              </div>
              <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                {advice.politeStrategy}
              </p>
            </div>

            {/* Recruiter Objections Response Map */}
            <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-white text-sm font-extrabold">Recruiter Objections Playbook</h4>
              </div>
              <div className="space-y-4">
                {advice.responseToHrQuestions?.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-rose-400 font-mono leading-snug">Objection: "{item.question}"</p>
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs text-white/90 leading-normal italic">
                      "{item.response}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Email counter template */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                <h4 className="font-bold text-white text-sm font-extrabold">Verbatim Counter-Offer Email</h4>
                <button
                  onClick={() => handleCopy(advice.counterOfferTemplate)}
                  className="text-xs text-white/40 hover:text-white/80 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Draft
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Email Draft
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 font-mono text-xs text-white/80 leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto">
                {advice.counterOfferTemplate}
              </div>
            </div>
            <div className="text-[10px] text-white/40 italic mt-3 pt-3 border-t border-white/10">
              💡 Always maintain extreme politeness and leverage. Make sure to update bracketed markers before sending your response to the HR recruiter.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-white/10 rounded-xl">
          <AlertCircle className="w-10 h-10 text-emerald-400/80 mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Negotiation Strategy Idle</h3>
          <p className="text-xs text-white/60 max-w-sm text-center mt-1">
            Provide the target company and salary expectations above to generate your customized counter-leverage playbook.
          </p>
        </div>
      )}
    </div>
  );
}
