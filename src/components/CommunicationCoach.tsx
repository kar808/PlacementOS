import React, { useState } from "react";
import { CommunicationTip, StudentProfile } from "../types";
import { MessageSquare, RefreshCw, Sparkles, AlertCircle, Copy, Check, Star, Mic } from "lucide-react";

interface CommunicationCoachProps {
  profile: StudentProfile;
  tips: CommunicationTip[] | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export default function CommunicationCoach({
  profile,
  tips,
  onGenerate,
  isGenerating,
}: CommunicationCoachProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Advisor Setup */}
      <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-sm font-extrabold">Confidence & Fluency Drills</h3>
          <p className="text-white/60 text-xs">
            Generate bite-sized fluency exercises and custom icebreaker templates specifically designed to tackle English or interview anxiety.
          </p>
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-all disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Customizing Exercises...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Generate Speech Blueprint
            </>
          )}
        </button>
      </div>

      {tips ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tips || []).map((item, idx) => (
            <div key={idx} className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-white/10 pb-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {item.category} Drill
                  </span>
                  <button
                    onClick={() => handleCopy(`${item.tip}\n\nExercise:\n${item.howToPractice}`, idx)}
                    className="text-[10px] text-white/40 hover:text-white/80 font-mono cursor-pointer"
                  >
                    {copiedIndex === idx ? "Copied" : "Copy Drill"}
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white leading-snug">{item.tip}</h4>
                </div>

                <div className="bg-black/30 p-3.5 rounded-lg border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-widest">Practice Exercise</span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed whitespace-pre-line">
                    {item.howToPractice}
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-white/40 italic pt-2 border-t border-white/10 font-mono">
                💡 Dedicate just 2 minutes every morning before interviews to run this speech framework out loud.
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-white/10 rounded-xl">
          <AlertCircle className="w-10 h-10 text-emerald-400/80 mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Communication Coaching Offline</h3>
          <p className="text-xs text-white/60 max-w-sm text-center mt-1">
            Click "Generate Speech Blueprint" to receive highly optimized icebreakers and daily English speaking drills.
          </p>
        </div>
      )}
    </div>
  );
}
