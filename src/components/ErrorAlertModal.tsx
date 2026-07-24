import React from "react";
import { AlertTriangle, Mail, RefreshCw, X, ShieldAlert, LifeBuoy } from "lucide-react";

interface ErrorAlertModalProps {
  error: string | null;
  onClose: () => void;
  onRetry?: () => void;
  supportEmail?: string;
}

export default function ErrorAlertModal({
  error,
  onClose,
  onRetry,
  supportEmail = "sushilmadan.yg@gmail.com"
}: ErrorAlertModalProps) {
  if (!error) return null;

  // Determine recovery recommendations based on error text
  const getActionableSteps = () => {
    const errText = error.toLowerCase();
    if (errText.includes("integrity") || errText.includes("security") || errText.includes("handshake") || errText.includes("auth")) {
      return [
        "Your login session or security token may be desynchronized.",
        "Try logging out and signing in again to refresh your session keys.",
        "Verify your database integration settings are properly configured."
      ];
    }
    if (errText.includes("api_key") || errText.includes("key") || errText.includes("unconfigured") || errText.includes("gemini")) {
      return [
        "For Vercel Deployment: Go to Vercel Dashboard -> Project Settings -> Environment Variables. Add GEMINI_API_KEY (or VITE_GEMINI_API_KEY) with your key from https://aistudio.google.com/app/apikey, then redeploy.",
        "For AI Studio / Local: Ensure GEMINI_API_KEY is configured in your .env file or the Secrets panel.",
        "Check that your Gemini API key is active and has permission for generative models."
      ];
    }
    if (errText.includes("permission") || errText.includes("insufficient") || errText.includes("supabase")) {
      return [
        "The database returned a permission or initialization violation.",
        "Ensure your Supabase project environment variables are correctly set.",
        "Check that your account has the correct permissions for this resource."
      ];
    }
    return [
      "Check your internet connection and verify that the application backend is active.",
      "Verify that standard API proxy pathways (/api/*) are accessible under port 3000.",
      "Attempt to refresh the dashboard or trigger a fresh profile analysis."
    ];
  };

  const steps = getActionableSteps();
  const mailToUrl = `mailto:${supportEmail}?subject=VORYNEXA%20System%20Error%20Report&body=Hi%20Support,%0D%0A%0D%0AI%20encountered%20an%20error%20on%20VORYNEXA.%0D%0A%0D%0AError%20Details:%0D%0A${encodeURIComponent(error)}%0D%0A%0D%0AUser%20Agent:%0D%0A${encodeURIComponent(navigator.userAgent)}`;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]">
      <div 
        id="error-modal"
        className="w-full max-w-lg bg-[#0e0e0e] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark decorative overlay with alert color */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                System Connection Alert
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-0.5">
                Diagnostics Tracker
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close error modal"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Main Error Block */}
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-rose-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              <AlertTriangle className="w-3.5 h-3.5" /> Diagnostics Log Output:
            </div>
            <p className="text-xs text-white/80 font-mono bg-black/60 p-3 rounded-lg border border-white/5 break-words max-h-36 overflow-y-auto leading-normal">
              {error}
            </p>
          </div>

          {/* Actionable Steps */}
          <div className="space-y-2.5">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">
              Actionable Recovery Steps:
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              {steps.map((step, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-normal font-medium">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer / Support & Actions */}
        <div className="p-4 sm:p-5 bg-white/2 border-t border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Email Support Link */}
          <a
            href={mailToUrl}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:text-white/90 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
          >
            <Mail className="w-4 h-4 text-white/60" />
            <span>Email Support</span>
          </a>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/5 text-white/60 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Dismiss
            </button>
            {onRetry && (
              <button
                onClick={() => {
                  onRetry();
                  onClose();
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-[spin_3s_linear_infinite]" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
