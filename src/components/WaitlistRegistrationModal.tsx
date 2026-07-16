import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mail, 
  User, 
  Building, 
  AlertCircle, 
  Send, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { joinWaitlist } from "../lib/waitlist";

interface WaitlistRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function WaitlistRegistrationModal({ isOpen, onClose, initialEmail = "" }: WaitlistRegistrationModalProps) {
  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");

  // Sync initialEmail when modal opens
  React.useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
  }, [isOpen, initialEmail]);
  
  // Interaction/UX State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Available Roles
  const roles = ["Student", "Graduate", "Professional", "Recruiter"];

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Check required fields
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    if (!role) {
      setError("Please select your current role.");
      return;
    }

    setIsSubmitting(true);

    try {
      await joinWaitlist({
        fullName,
        email,
        role,
        organization: organization.trim(),
        source: "organic_modal"
      });
      setIsSuccess(true);
      // Clear form on success
      setFullName("");
      setEmail("");
      setRole("");
      setOrganization("");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isSubmitting) {
                onClose();
                setIsSuccess(false);
                setError(null);
              }
            }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            id="modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 z-10"
            id="waitlist-modal-body"
          >
            {/* Close button */}
            <button 
              onClick={() => {
                onClose();
                setIsSuccess(false);
                setError(null);
              }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1.5 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 disabled:opacity-30 transition-all cursor-pointer"
              aria-label="Close modal"
              id="close-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="space-y-2 pr-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
                    <Sparkles className="w-3 h-3 animate-pulse" /> Early Access Form
                  </div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight" id="modal-title">
                    Join PlacementOS Waitlist
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Be part of an exclusive group to test-drive automated resume building, high-fidelity mock interviews, and personalized career roadmaps before public release.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" id="waitlist-form">
                  
                  {/* Full Name field */}
                  <div className="space-y-1.5" id="field-name-container">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-1">
                      <User className="w-3 h-3 text-purple-400" /> Full Name <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. Karan Madan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#121215] border border-white/10 hover:border-white/15 focus:border-purple-500 rounded-xl text-xs text-white outline-none transition-all placeholder-white/20"
                      id="input-full-name"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5" id="field-email-container">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Mail className="w-3 h-3 text-purple-400" /> Email Address <span className="text-purple-400">*</span>
                    </label>
                    <input 
                      type="email"
                      required
                      disabled={isSubmitting}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#121215] border border-white/10 hover:border-white/15 focus:border-purple-500 rounded-xl text-xs text-white outline-none transition-all placeholder-white/20"
                      id="input-email"
                    />
                  </div>

                  {/* Role Custom Dropdown */}
                  <div className="space-y-1.5 relative" id="field-role-container">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-1">
                      <span>💼</span> Current Professional Role <span className="text-purple-400">*</span>
                    </label>
                    
                    {/* Selected Role Button / Toggle */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-2.5 bg-[#121215] border border-white/10 hover:border-white/15 focus:border-purple-500 rounded-xl text-xs text-white outline-none transition-all flex items-center justify-between cursor-pointer"
                      id="role-dropdown-btn"
                    >
                      <span className={role ? "text-white font-medium" : "text-white/20"}>
                        {role || "Select your role"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          {/* Close dropdown backdrop */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsDropdownOpen(false)} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-20 left-0 right-0 mt-1 bg-[#121215] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                            id="role-dropdown-menu"
                          >
                            {roles.map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  setRole(r);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                  role === r 
                                    ? "bg-purple-600/10 text-purple-400 font-bold" 
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                                id={`role-option-${r.toLowerCase()}`}
                              >
                                <span>{r}</span>
                                {role === r && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* College/Company optional field */}
                  <div className="space-y-1.5" id="field-organization-container">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Building className="w-3 h-3 text-purple-400" /> College or Company <span className="text-white/30">(Optional)</span>
                    </label>
                    <input 
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. Stanford University or Google"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#121215] border border-white/10 hover:border-white/15 focus:border-purple-500 rounded-xl text-xs text-white outline-none transition-all placeholder-white/20"
                      id="input-organization"
                    />
                  </div>

                  {/* Errors and Warnings */}
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2"
                      id="form-error-alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-white text-black hover:bg-white/90 disabled:opacity-50 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-[0.99]"
                    id="submit-waitlist-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin text-black" />
                        Validating Seat...
                      </>
                    ) : (
                      <>
                        Secure Private Access <Send className="w-3.5 h-3.5 text-black" />
                      </>
                    )}
                  </button>

                </form>
              </>
            ) : (
              /* Success / Thank You Transition View */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-6"
                id="success-transition-view"
              >
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner shadow-emerald-500/20 animate-bounce">
                  🎉
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight" id="thank-you-title">
                    You're On The List!
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full font-mono">
                    Position Secured &bull; Premium Waitlist
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mx-auto pt-2">
                    Thank you for joining the PlacementOS Early Access waitlist. We have recorded your registration successfully!
                  </p>
                  <p className="text-xs text-white/40 leading-relaxed max-w-xs mx-auto">
                    We will notify you immediately via email when we begin onboarding users for our initial private release blocks.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      onClose();
                      setIsSuccess(false);
                      setError(null);
                    }}
                    className="px-8 py-3 bg-white text-black hover:bg-white/90 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono"
                    id="success-close-btn"
                  >
                    Return to Platform
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
