import React from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AppLoadingSpinnerProps {
  phase: "auth" | "profile" | "audit" | "generic";
  message?: string;
}

export default function AppLoadingSpinner({ phase, message }: AppLoadingSpinnerProps) {
  const getPhaseConfig = () => {
    switch (phase) {
      case "auth":
        return {
          tag: "Security Gateway",
          title: "Authenticating Session",
          desc: "Establishing secure cryptographic connection with VORYNEXA core...",
        };
      case "profile":
        return {
          tag: "Profile Mount",
          title: "Synchronizing Career Vault",
          desc: "Retrieving sandboxed student metrics, scores, and target role blueprints...",
        };
      case "audit":
        return {
          tag: "Engine Audit",
          title: "Executing Core Employability Audit",
          desc: "Analyzing ATS keyword density, grading HR social indicators, and synthesizing roadmap vectors...",
        };
      default:
        return {
          tag: "VORYNEXA Optimizer",
          title: "Processing Command",
          desc: "Synchronizing state vectors across all distributed nodes...",
        };
    }
  };

  const config = getPhaseConfig();
  const displayMessage = message || config.desc;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300">
      {/* Dynamic abstract grid pattern in the background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="relative max-w-sm w-full mx-auto px-6 py-8 text-center space-y-6">
        {/* Animated premium loader ring */}
        <div className="relative w-20 h-20 mx-auto">
          {/* Inner pulse */}
          <div className="absolute inset-2 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          {/* Outer spins */}
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/10 border-t-emerald-400 animate-spin" />
          <div className="absolute -inset-1 rounded-full border-2 border-transparent border-b-emerald-400/40 animate-spin [animation-duration:3s]" />
        </div>

        {/* Phase Meta */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full font-mono">
            <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> {config.tag}
          </div>
          
          <h3 className="text-lg font-black text-white tracking-tight">
            {config.title}
          </h3>
          
          <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto font-medium">
            {displayMessage}
          </p>
        </div>

        {/* Loading Progress bar animation */}
        <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-[loading_1.8s_ease-in-out_infinite] w-24 origin-left" />
        </div>
      </div>
    </div>
  );
}
