import React, { useState } from "react";
import { JobSearchStrategy, StudentProfile } from "../types";
import { Search, RefreshCw, Sparkles, Copy, Check, MessageSquare, Mail, UserCheck, AlertCircle } from "lucide-react";

interface JobOutreachProps {
  profile: StudentProfile;
  strategy: JobSearchStrategy | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export default function JobOutreach({
  profile,
  strategy,
  onGenerate,
  isGenerating,
}: JobOutreachProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getChannelIcon = (channel: string) => {
    const name = channel.toLowerCase();
    if (name.includes("email")) return <Mail className="w-4 h-4 text-emerald-400" />;
    if (name.includes("linkedin")) return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    return <UserCheck className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Strategy initiator banner */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-sm font-extrabold">Campaign & Outreach Strategist</h3>
          <p className="text-white/60 text-xs">
            Generate tailored job search blueprints and outreach templates designed for your background.
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> mapping channels...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Map Search Strategy
            </>
          )}
        </button>
      </div>

      {strategy ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Channel and Strategy Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-5 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="border-b border-white/10 pb-2">
                <h4 className="font-bold text-white text-sm font-extrabold font-mono uppercase tracking-wider text-xs">Job Hunt Funnel Strategy</h4>
              </div>
              <p className="text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                {strategy.strategy}
              </p>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-3 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="border-b border-white/10 pb-2">
                <h4 className="font-bold text-white text-sm font-extrabold font-mono uppercase tracking-wider text-xs">Target Application Methods</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strategy.channels?.map((channel, idx) => (
                  <span key={idx} className="bg-white/5 text-emerald-400 border border-white/10 px-2.5 py-1 rounded-full text-xs font-mono">
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Outreach templates column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-white text-sm border-b border-white/10 pb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Recruiter & Cold Networking Outreach Templates
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {strategy.outreach?.map((item, idx) => (
                <div key={idx} className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(item.channel)}
                      <span className="font-bold text-white text-sm">{item.channel} Template</span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.message, idx)}
                      className="text-xs text-white/40 hover:text-white/80 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Text
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Message
                        </>
                      )}
                    </button>
                  </div>

                  {item.subject && (
                    <div className="text-xs bg-black/40 p-2.5 rounded-lg border border-white/10 text-white/90 font-medium">
                      <strong className="text-emerald-400 mr-1.5 font-mono uppercase text-[9px] tracking-widest">SUBJECT:</strong> {item.subject}
                    </div>
                  )}

                  <div className="bg-black/20 p-4 rounded-lg border border-white/5 font-mono text-xs text-white/80 leading-relaxed whitespace-pre-line max-h-[180px] overflow-y-auto">
                    {item.message}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-white/5">
                    <div className="text-[10px] text-white/40 italic leading-snug max-w-md">
                      💡 Replace bracketed placeholders like [Name] or [Skills] with your actual profile specifications before launching outreach.
                    </div>
                    <button
                      onClick={() => handleCopy(item.message, idx)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                        copiedIndex === idx 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-mono" 
                          : "bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-black hover:scale-[1.02]"
                      }`}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Copied to Clipboard!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy to Clipboard
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-white/10 rounded-xl">
          <AlertCircle className="w-10 h-10 text-emerald-400/80 mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Strategy Pipeline Empty</h3>
          <p className="text-xs text-white/60 max-w-sm text-center mt-1">
            Click "Map Search Strategy" to construct custom channels and high-conversion network outreach scripts.
          </p>
        </div>
      )}
    </div>
  );
}
