import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  Search, 
  TrendingUp, 
  Users, 
  Check, 
  HelpCircle, 
  ChevronDown, 
  Code, 
  Star, 
  Layers, 
  Menu, 
  X, 
  Globe, 
  Mail, 
  Lock, 
  Monitor,
  Heart,
  Github
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onLocalBypass?: () => void;
}

export default function LandingPage({ onGetStarted, onLogin, onLocalBypass }: LandingPageProps) {
  // Navigation & interaction states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  // Interactive Dashboard Preview state
  const [previewTab, setPreviewTab] = useState<"resume" | "interview" | "roadmap">("resume");
  const [simulatedScore, setSimulatedScore] = useState(72);
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setSimulatedScore(72);
    setTimeout(() => {
      setSimulatedScore(94);
      setIsScanning(false);
    }, 1800);
  };

  // Pricing models
  const plans = [
    {
      name: "Free Assessment",
      price: 0,
      description: "Perfect for evaluating your initial job-readiness benchmarks.",
      features: [
        "1 Comprehensive ATS Resume Scan",
        "Initial Employability Score report",
        "Limited access to Student Profile builder",
        "1 Mock Interview question simulation",
        "Public knowledge base access",
      ],
      cta: "Start Free Evaluation",
      popular: false,
      comingSoon: false,
    },
    {
      name: "Elite Co-Pilot",
      price: billingCycle === "yearly" ? 14 : 19,
      description: "The complete full-stack campaign engine for landing top tech offers.",
      features: [
        "Unlimited ATS Resume Scans & keyword matching",
        "Full AI Resume Builder suggestions & feedback",
        "Unlimited real-time Speech Mock Interviews",
        "Interactive Career Roadmap & skill gap assessment",
        "GCP-powered Project Advisor & Outreach planner",
        "Offer Evaluation & Negotiation Coach",
        "Priority Firestore database cloud syncing",
      ],
      cta: "Get Started Now",
      popular: true,
      comingSoon: false,
    },
    {
      name: "University Enterprise",
      price: "Custom",
      description: "Tailored licenses, custom admin portals, and analytics for universities.",
      features: [
        "Dedicated student placement dashboard",
        "Bulk seat licensing & LMS integrations",
        "Custom mock interview bank configurations",
        "Cohort analytics & progress tracking",
        "Dedicated security and support manager",
        "White-labeled university domain portal",
      ],
      cta: "Contact Enterprise Sales",
      popular: false,
      comingSoon: true,
    },
  ];

  // FAQs
  const faqs = [
    {
      q: "How accurate is the AI Resume Analyzer compared to enterprise ATS?",
      a: "Our parsing engine matches the exact scoring models used by major enterprise ATS platforms like Greenhouse, Lever, and Workday. It cross-references structural hierarchies, keyword frequencies, and formatting traps to ensure you bypass the automated screeners.",
    },
    {
      q: "Is the Mock Interview feedback delivered in real-time?",
      a: "Yes! Utilizing advanced speech-to-text algorithms and AI reasoning, the Mock Interview co-pilot evaluates your answers, pauses, and vocabulary instantly to deliver an immersive scoring metric and actionable bullet points for improvement.",
    },
    {
      q: "How does the Career Roadmap define and resolve my skill gaps?",
      a: "Once you input your student background and target job roles, Placement OS generates a high-fidelity learning pathway. It scans current industry postings, highlights missing credentials or technical competencies, and recommends specific hands-on projects to bridge those gaps.",
    },
    {
      q: "Is my personal data safe and private?",
      a: "Absolutely. All resume files, credentials, and conversation histories are securely isolated inside your private, authenticated Firebase Firestore database sandbox on Google Cloud. Your data is encrypted and is never shared or used to train external public models.",
    },
    {
      q: "Can I manage or cancel my premium subscription at any time?",
      a: "Yes, you can upgrade, downgrade, or cancel your Elite Co-Pilot subscription instantly from your secure profile settings panel with no long-term contracts.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-96 h-96 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1600px] right-0 w-96 h-96 bg-emerald-400/[0.02] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* --- 11. HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="bg-emerald-500 text-black px-2.5 py-1 font-black text-sm rounded tracking-tighter">
              POS
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight flex items-center gap-1.5">
                PlacementOS
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  v2.0
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            {onLocalBypass && (
              <button 
                onClick={onLocalBypass}
                className="text-xs text-white/40 hover:text-emerald-400 transition-colors font-mono uppercase tracking-wider"
              >
                Local Dev Sandbox
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold hover:text-white text-white/80 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center gap-1"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#0b0b0b] px-4 py-6 space-y-4"
            >
              <div className="flex flex-col gap-4 text-sm font-medium text-white/70">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">How It Works</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Testimonials</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Pricing</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">FAQ</a>
                {onLocalBypass && (
                  <button 
                    onClick={() => { setMobileMenuOpen(false); onLocalBypass(); }}
                    className="text-left text-xs text-white/40 hover:text-emerald-400 font-mono"
                  >
                    Local Dev Sandbox
                  </button>
                )}
              </div>
              <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onLogin(); }}
                  className="w-full py-2.5 text-center text-sm font-semibold hover:text-white text-white/80 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-lg shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-8 pb-20 sm:pb-28 sm:pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero text */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Launching Placement Campaign Co-Pilot
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-sans">
              From Resume to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200">Offer Letter</span> — Everything You Need to Get Hired.
            </h1>
            
            <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Placement OS helps students and professionals build stronger resumes, prepare for interviews, identify skill gaps, and confidently achieve their career goals using AI.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/15 cursor-pointer flex items-center justify-center gap-2 group"
              >
                Get Started For Free 
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a 
                href="#features"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore Features
              </a>
            </div>

            {/* Floating feature highlights in Hero */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 text-left font-mono">
              <div>
                <span className="text-[10px] text-white/30 uppercase block font-bold tracking-wider">ATS Score</span>
                <span className="text-sm font-bold text-white mt-1 block">Greenhouse 2026 Ready</span>
              </div>
              <div>
                <span className="text-[10px] text-white/30 uppercase block font-bold tracking-wider">Voice Interview</span>
                <span className="text-sm font-bold text-emerald-400 mt-1 block">Real-time Speech AI</span>
              </div>
              <div>
                <span className="text-[10px] text-white/30 uppercase block font-bold tracking-wider">Cloud Auth</span>
                <span className="text-sm font-bold text-white mt-1 block">Secure Sandboxed DB</span>
              </div>
            </div>
          </div>

          {/* Hero preview mockup & animations */}
          <div className="lg:col-span-6 relative flex justify-center">
            
            {/* Interactive Dashboard Preview Card */}
            <div className="w-full max-w-[500px] bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl relative z-10 space-y-6">
              
              {/* Fake navigation buttons in the preview card */}
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/40" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                </div>
                <div className="flex bg-black/40 border border-white/5 p-1 rounded-lg gap-1">
                  <button 
                    onClick={() => setPreviewTab("resume")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${previewTab === "resume" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
                  >
                    Resume AI
                  </button>
                  <button 
                    onClick={() => setPreviewTab("interview")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${previewTab === "interview" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
                  >
                    Mock Interview
                  </button>
                  <button 
                    onClick={() => setPreviewTab("roadmap")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${previewTab === "roadmap" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
                  >
                    Roadmaps
                  </button>
                </div>
              </div>

              {/* Changing content according to previewTab */}
              <div className="min-h-[160px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {previewTab === "resume" && (
                    <motion.div 
                      key="resume"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">ATS Resume Matcher</h4>
                          <p className="text-[10px] text-white/40">Targeting Software Engineer @ Google</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-emerald-400 font-mono">{simulatedScore}%</span>
                          <span className="text-[9px] block text-white/30 font-bold uppercase font-mono">Match Score</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-black/60 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between text-[10px] text-white/40">
                          <span>Keyword Density Check</span>
                          <span className={simulatedScore > 80 ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                            {simulatedScore > 80 ? "Optimized" : "Missing Keywords"}
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                          <motion.div 
                            animate={{ width: `${simulatedScore}%` }} 
                            transition={{ duration: 0.5 }} 
                            className="bg-emerald-500 h-full rounded-full" 
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={handleSimulateScan}
                          disabled={isScanning}
                          className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-white/5 flex items-center justify-center gap-1"
                        >
                          {isScanning ? "Scanning Resume..." : "Simulate ATS Scan"}
                        </button>
                        <button 
                          onClick={onGetStarted}
                          className="py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all"
                        >
                          Unlock Builder
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {previewTab === "interview" && (
                    <motion.div 
                      key="interview"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Mock Interview AI</h4>
                          <p className="text-[10px] text-emerald-400 font-mono mt-0.5">● Simulating Live Speech Session</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[11px] font-mono text-white/50 bg-black/60 p-2.5 border border-white/5 rounded-lg leading-relaxed">
                          <strong className="text-emerald-400">AI Recruiter:</strong> &quot;Can you explain how you designed the custom routing layers in your project?&quot;
                        </div>
                        <div className="text-[11px] font-mono text-white/30 pl-2.5 border-l-2 border-emerald-500/40 py-0.5">
                          Listening for student speech feedback...
                        </div>
                      </div>

                      <button 
                        onClick={onGetStarted}
                        className="w-full py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm"
                      >
                        Start Voice Training
                      </button>
                    </motion.div>
                  )}

                  {previewTab === "roadmap" && (
                    <motion.div 
                      key="roadmap"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Adaptive Roadmap</h4>
                          <p className="text-[10px] text-white/40">Target: Systems Architect Path</p>
                        </div>
                        <span className="text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                          3 Skill Gaps Detected
                        </span>
                      </div>

                      {/* Map lines */}
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-[11px] font-mono">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-[9px]">1</div>
                          <span className="text-white/80">System Design (Load Balancing)</span>
                          <span className="text-emerald-400 text-[10px] font-bold ml-auto font-sans">✓ Complete</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-mono">
                          <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-[9px]">2</div>
                          <span className="text-white/80">Redis & Cache Invalidation</span>
                          <span className="text-amber-400 text-[10px] font-bold ml-auto font-sans">⚠ Missing Skill</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-mono">
                          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-white/30 flex items-center justify-center font-bold text-[9px]">3</div>
                          <span className="text-white/40">GCP Deployment Core</span>
                          <span className="text-white/30 text-[10px] font-bold ml-auto font-sans">Pending</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Glowing effect under card */}
            <div className="absolute inset-0 bg-emerald-500/5 blur-3xl scale-95 pointer-events-none rounded-2xl" />

            {/* Floating feature card 1 */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 hidden sm:flex items-center gap-2.5 bg-black/80 border border-white/10 px-3.5 py-2.5 rounded-xl shadow-lg z-20"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[9px] text-white/40 uppercase block font-bold font-mono">ATS Parser</span>
                <span className="text-[11px] text-white font-extrabold font-mono">Greenhouse Optimized</span>
              </div>
            </motion.div>

            {/* Floating feature card 2 */}
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-2.5 bg-black/80 border border-white/10 px-3.5 py-2.5 rounded-xl shadow-lg z-20"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[9px] text-white/40 uppercase block font-bold font-mono">Voice Coaching</span>
                <span className="text-[11px] text-white font-extrabold font-mono">Ready to Speak</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- 2. SOCIAL PROOF (METRICS) --- */}
      <section className="border-y border-white/5 bg-white/[0.01] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">12,400+</span>
              <span className="text-[10px] sm:text-xs text-emerald-400 block font-bold uppercase tracking-widest font-mono">Students Helped</span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">8,900+</span>
              <span className="text-[10px] sm:text-xs text-white/40 block font-bold uppercase tracking-widest font-mono">Resumes Analyzed</span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">15,600+</span>
              <span className="text-[10px] sm:text-xs text-white/40 block font-bold uppercase tracking-widest font-mono">Interviews Completed</span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">6,200+</span>
              <span className="text-[10px] sm:text-xs text-white/40 block font-bold uppercase tracking-widest font-mono">Roadmaps Generated</span>
            </div>

          </div>
        </div>
      </section>

      {/* --- 3. PROBLEM SECTION --- */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">The Employment Friction</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Why standard job search campaigns fail.</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            The modern job pipeline is heavily automated and highly competitive. Relying on default tools, unstructured spreadsheets, and general practice leads to immediate rejection.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-1 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Poor Resumes</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Formatting errors, soft phrasing, and unquantified metrics fail to express actual capability.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">ATS Rejections</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Automated applicant filters reject 75% of qualified resumes before human review due to layout or phrasing traps.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Interview Anxiety</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Lack of interactive, real-time voice practice leads to nervous communication blocks under pressure.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Skill Disconnect</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Graduates build generic portfolios without clear reference to structural technical gaps required by hiring roles.
              </p>
            </div>
          </div>

          <div className="md:col-span-1 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Untracked Outreach</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Scattered spreadsheet logs make pipeline tracking, message scheduling, and follow-ups chaotic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. SOLUTION SECTION --- */}
      <section className="bg-emerald-500/[0.01] border-y border-white/5 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">The Career Operating System</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Structured pathways to bypass automated rejections.</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Placement OS consolidates the complete job preparation lifecycle into a unified, server-synced co-pilot dashboard, empowering you to move from general applicant to targeted candidate.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual breakdown lists */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="flex gap-4 p-4 hover:bg-white/[0.02] border border-transparent hover:border-white/5 rounded-xl transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Real-Time ATS Score Optimizer</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Compare your structural text resume syntax against specific job posts to resolve phrasing, vocabulary, and keywords in seconds.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 hover:bg-white/[0.02] border border-transparent hover:border-white/5 rounded-xl transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Immersive AI Voice Recruiter</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Speak directly into the co-pilot to simulate active interviews. Receive precise speech evaluations and technical critiques instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 hover:bg-white/[0.02] border border-transparent hover:border-white/5 rounded-xl transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Dynamic Learning Roadmap Path</h4>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Bridge key skill gaps through an automated roadmap, recommending concrete full-stack projects suited to your target roles.
                  </p>
                </div>
              </div>

            </div>

            {/* Simulated System dashboard mapping preview */}
            <div className="lg:col-span-7 bg-[#111] border border-white/10 rounded-2xl p-6 relative">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider font-mono block mb-3 border-b border-white/5 pb-2">AI Campaign Execution Engine</span>
              
              <div className="grid grid-cols-2 gap-4">
                
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono text-white/40">
                    <span>ATS PARSER CORE</span>
                    <span className="text-emerald-400">ONLINE</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">92/100</div>
                  <p className="text-[10px] text-white/50 leading-normal">Optimized keywords match target Greenhouse standard.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono text-white/40">
                    <span>SPEECH ANALYSIS</span>
                    <span className="text-emerald-400">ACTIVE</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">4.8s <span className="text-xs font-normal text-white/40">PAUSE</span></div>
                  <p className="text-[10px] text-white/50 leading-normal">Speech structure flows elegantly without filler words.</p>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2 col-span-2">
                  <div className="flex justify-between items-center text-[10px] font-bold font-mono text-white/40">
                    <span>SYNC SYSTEM STATUS</span>
                    <span className="text-emerald-400">FIRESTORE DIRECT</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white font-mono">Secure sandboxed users/users_4e8d2db56</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">Automatic sync retries save updates locally and back up instantly.</p>
                </div>

              </div>

              {/* absolute visual background blur */}
              <div className="absolute inset-0 bg-emerald-500/[0.02] rounded-2xl pointer-events-none" />
            </div>

          </div>
        </div>
      </section>

      {/* --- 5. DETAILED FEATURE SHOWCASE --- */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Platform Capability</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">The ultimate career optimizer tool kit.</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Every module of Placement OS is custom-engineered to handle a specific milestone in your hiring lifecycle. No mock tools — real, deep analytical feedback.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">AI Resume Analyzer</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Scan your resume against specific target descriptions. Our parser isolates structural defects and suggests bullet replacements instantly.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Analyze Resume <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">ATS Score Index</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Receive an objective score on layout, formatting, syntax, and phrasing. Verify matches to Greenhouse, Lever, and Workday frameworks.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Get ATS Score <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Mock Interview AI</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Connect your microphone to practice real-time technical and behavioral interviews. Get speech rate and clarity ratings immediately.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Practice Interview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Dynamic Learning Roadmap</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Identify and resolve technical skill gaps. Generate custom-tailored learning paths based on the role requirements of modern startups.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Generate Roadmap <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Job Campaign Tracker</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Keep track of your active outreach, custom LinkedIn follow-ups, interview dates, and custom negotiation steps inside one board.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Open Campaign Tracker <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Company Prep Kit</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Fetch core telemetry on custom companies, tech stacks, and active team architectures before you sit down for your screen.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Get Prep Kit <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 7 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">Offer & Negotiation Co-Pilot</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Compare multiple offers and simulate response scripts. Use verified data metrics to confidently maximize base salary and stock options.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Evaluate Offer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature 8 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-xl hover:shadow-emerald-500/[0.02]">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">HR Social Rating Tracker</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Connect and audit your LinkedIn profile and public HR socials. Match structural industry expectations to build a top outreach reputation.
              </p>
            </div>
            <button 
              onClick={onGetStarted}
              className="mt-6 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-left cursor-pointer"
            >
              Analyze Socials <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* --- 6. HOW IT WORKS --- */}
      <section id="how-it-works" className="bg-white/[0.01] border-y border-white/5 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">The Placement Blueprint</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Six structural milestones to get hired.</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Our end-to-end framework bypasses superficial resume matching, converting your background into structural job campaign results.
            </p>
          </div>

          <div className="grid md:grid-cols-6 gap-6 relative">
            
            {/* Step 1 */}
            <div className="space-y-4">
              <span className="text-sm font-black text-emerald-400 font-mono block">01 / ACCOUNT SETUP</span>
              <h4 className="font-extrabold text-white text-sm">Create Account</h4>
              <p className="text-xs text-white/50 leading-relaxed">Sign in instantly via Google. Your private workspace profiles are automatically sandboxed.</p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <span className="text-sm font-black text-white/30 font-mono block">02 / EXTRACT PROFILE</span>
              <h4 className="font-extrabold text-white text-sm">Upload Resume</h4>
              <p className="text-xs text-white/50 leading-relaxed">Parse your current resume details instantly using our structured schema analyzers.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <span className="text-sm font-black text-white/30 font-mono block">03 / REAL ASSESSMENTS</span>
              <h4 className="font-extrabold text-white text-sm">AI Analysis</h4>
              <p className="text-xs text-white/50 leading-relaxed">Verify structural ATS compliance, identify keyword densities, and map your profile score.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4">
              <span className="text-sm font-black text-white/30 font-mono block">04 / BRIDGE GAPS</span>
              <h4 className="font-extrabold text-white text-sm">Improve Skills</h4>
              <p className="text-xs text-white/50 leading-relaxed">Resolve key technical shortcomings by executing custom hands-on full stack project scripts.</p>
            </div>

            {/* Step 5 */}
            <div className="space-y-4">
              <span className="text-sm font-black text-white/30 font-mono block">05 / SIMULATION CYCLE</span>
              <h4 className="font-extrabold text-white text-sm">Practice Interviews</h4>
              <p className="text-xs text-white/50 leading-relaxed">Simulate active speech calls with our interactive recruiter to maximize confidence.</p>
            </div>

            {/* Step 6 */}
            <div className="space-y-4 border-l border-emerald-500/20 pl-4 md:pl-0 md:border-l-0">
              <span className="text-sm font-black text-emerald-400 font-mono block">06 / THE OUTCOME</span>
              <h4 className="font-extrabold text-emerald-400 text-sm">Get Hired</h4>
              <p className="text-xs text-white/50 leading-relaxed">Confidently handle negotiation offer evaluations and secure top technical compensation packages.</p>
            </div>

          </div>
        </div>
      </section>

      {/* --- 7. TESTIMONIALS --- */}
      <section id="testimonials" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Student Placements</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">What graduates say about Placement OS.</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            From tier-1 computer science schools to self-taught career switchers, hear from professionals who transformed their hiring pipelines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-white/70 leading-relaxed italic">
              &quot;The ATS optimization module is incredibly accurate. I uploaded my resume, implemented the automated bullet improvements, and within a week, I had screening calls scheduled with Stripe and Meta.&quot;
            </p>
            <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-white/5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">AS</div>
              <div>
                <span className="text-xs font-bold text-white block">Aisha Sharma</span>
                <span className="text-[10px] text-white/40 font-mono">Software Engineer @ Stripe (UWaterloo SE)</span>
              </div>
              <div className="flex gap-0.5 ml-auto text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-white/70 leading-relaxed italic">
              &quot;The live Voice Mock Interview feedback was an absolute game changer. It rated my pauses, critiqued my systems design definitions, and helped me enter my real interviews feeling completely prepared.&quot;
            </p>
            <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-white/5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">MK</div>
              <div>
                <span className="text-xs font-bold text-white block">Marcus Kowalski</span>
                <span className="text-[10px] text-white/40 font-mono">Frontend Lead @ Vercel (Georgia Tech)</span>
              </div>
              <div className="flex gap-0.5 ml-auto text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-white/70 leading-relaxed italic">
              &quot;Thanks to the Offer & Negotiation feedback scripts, I confidently countered Google&apos;s initial compensation offer. The metrics suggested a perfect counter that secured an additional $18k in annual base salary.&quot;
            </p>
            <div className="flex items-center gap-3.5 mt-6 pt-6 border-t border-white/5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">DL</div>
              <div>
                <span className="text-xs font-bold text-white block">Devon Lee</span>
                <span className="text-[10px] text-white/40 font-mono">Systems Architect @ Google (Stanford CS)</span>
              </div>
              <div className="flex gap-0.5 ml-auto text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- 8. PRICING PREVIEW --- */}
      <section id="pricing" className="bg-white/[0.01] border-y border-white/5 py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">SaaS Pricing Plans</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Clean pricing, built for career results.</h2>
            <p className="text-sm text-white/50 leading-relaxed">
              Start with our free core assessments or unlock full campaign capability to maximize your callback rate.
            </p>

            {/* Toggle monthly/yearly */}
            <div className="inline-flex items-center bg-black/60 border border-white/10 p-1 rounded-xl">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all ${billingCycle === "monthly" ? "bg-white/5 text-white" : "text-white/40 hover:text-white"}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-xs font-extrabold uppercase rounded-lg transition-all flex items-center gap-1.5 ${billingCycle === "yearly" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white"}`}
              >
                Yearly <span className="text-[9px] font-bold bg-black/10 px-1.5 py-0.5 rounded text-black font-mono">SAVE 25%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`bg-[#111] border rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative ${plan.popular ? "border-emerald-500 shadow-2xl shadow-emerald-500/5 scale-102 z-10" : "border-white/10"}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full font-mono">
                    Most Popular Choice
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{plan.name}</h3>
                    <p className="text-xs text-white/50 leading-relaxed mt-2">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    {typeof plan.price === "number" ? (
                      <>
                        <span className="text-4xl font-black text-white font-mono">${plan.price}</span>
                        <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">/ month</span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-white font-mono">{plan.price}</span>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-6 space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-white/70 leading-normal">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  {plan.comingSoon ? (
                    <button 
                      disabled
                      className="w-full py-3.5 bg-white/5 text-white/40 text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed border border-white/5"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <button 
                      onClick={onGetStarted}
                      className={`w-full py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center ${plan.popular ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/10" : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}`}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 9. FAQ SECTION --- */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Platform FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Got questions? We have answers.</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Everything you need to know about our parsing models, voice feedback security, and sandbox storage.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden transition-all"
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left text-sm font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${activeFaq === idx ? "rotate-180 text-emerald-400" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5"
                  >
                    <p className="px-6 py-5 text-xs text-white/60 leading-relaxed bg-black/20 font-sans">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* --- 10. FINAL CALL TO ACTION --- */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center overflow-hidden rounded-3xl bg-[#111] border border-white/10 shadow-2xl mb-20">
        
        {/* Absolute visual glows inside CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="space-y-8 max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
            <Sparkles className="w-3 h-3 animate-pulse" /> Secure Offer Acceleration Node
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Ready to accelerate your career campaign?
          </h2>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Join thousands of students and professionals who bypassed structural applicant filters, practiced voice simulations confidently, and secured high-fidelity compensation offers.
          </p>
          <div>
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-500/15 cursor-pointer inline-flex items-center gap-1.5"
            >
              Create Free Account <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-black py-16 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-8">
          
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500 text-black px-2 py-0.5 font-black text-xs rounded">POS</div>
              <span className="font-extrabold text-white text-sm tracking-tight">PlacementOS</span>
            </div>
            <p className="leading-relaxed max-w-xs">
              The high-fidelity AI Career Operating System designed to accelerate interview prep, ATS alignment, resume scoring, and career campaigns on Google Cloud and Firestore.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:support@placementos.com" className="hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <span className="font-bold text-white uppercase tracking-widest text-[9px] block mb-4 font-mono">Product</span>
            <ul className="space-y-2.5">
              <li><a href="#features" className="hover:text-white transition-colors">ATS Analyzer</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Mock Recruiter AI</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Gap Roadmap</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Campaign Kanban</a></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white uppercase tracking-widest text-[9px] block mb-4 font-mono">Resources</span>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">System Metrics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GCP Integration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API References</a></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white uppercase tracking-widest text-[9px] block mb-4 font-mono">Company</span>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Vision</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white uppercase tracking-widest text-[9px] block mb-4 font-mono">Contact & Support</span>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Submit Ticket</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise Sales</a></li>
              <li><span className="text-white/20">Status: operational</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <span>&copy; {new Date().getFullYear()} PlacementOS. All rights reserved. Securely integrated with Firebase.</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" /> GCP Firestore Secured
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500/60" /> Built with Care
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
