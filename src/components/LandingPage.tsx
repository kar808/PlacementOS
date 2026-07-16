import React, { useState, useEffect, useRef } from "react";
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
  Users, 
  Check, 
  Code, 
  Star, 
  Layers, 
  Menu, 
  X, 
  Mail, 
  Lock, 
  Building, 
  Clock, 
  Cpu, 
  FileSearch, 
  Network, 
  Briefcase, 
  GraduationCap, 
  Send,
  ArrowUpRight,
  ChevronRight,
  Terminal,
  Activity,
  Eye,
  Share2,
  Compass,
  FileCheck,
  Award,
  BookOpen,
  MousePointerClick
} from "lucide-react";
import { joinWaitlist, getWaitlistStats, WaitlistStats } from "../lib/waitlist";
import { supabaseDb } from "../lib/supabase";
import WaitlistRegistrationModal from "./WaitlistRegistrationModal";
// @ts-ignore
import placementOsLogo from "../assets/images/placementos_logo_1784202727873.jpg";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // Navigation & Modal state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  
  // High-converting inline email state
  const [heroEmail, setHeroEmail] = useState("");
  const [prefilledEmail, setPrefilledEmail] = useState("");

  // Product Preview Showcase Active Tab
  const [activePreviewTab, setActivePreviewTab] = useState<"interview" | "ats" | "roadmap" | "outreach">("interview");

  // Real-time waitlist statistics from Firestore / Supabase backend
  const [stats, setStats] = useState<WaitlistStats>({
    total: 247, // Elegant fallback while loading
    today: 8,
    thisWeek: 54,
    thisMonth: 182,
    duplicates: 42,
    entries: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [supabaseCount, setSupabaseCount] = useState<number>(247);

  // Mouse position ref for cinematic interactive particles
  const mouseRef = useRef({ x: 0, y: 0, hover: false });

  // Client-Side Performance/Telemetry Analytics Tracker (Growth HUD)
  const [analytics, setAnalytics] = useState({
    pageViews: 1,
    ctaClicks: 0,
    maxScrollDepth: 0,
    deviceType: "Desktop",
    referralSource: "Organic",
    isHudOpen: false,
    sessionStart: new Date().toLocaleTimeString()
  });

  // Fetch real stats from Firestore/Supabase securely on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const backendStats = await getWaitlistStats();
        if (backendStats && typeof backendStats.total === "number") {
          setStats(backendStats);
        }
      } catch (err) {
        console.warn("Could not retrieve real-time waitlist statistics. Using high-integrity local cache.", err);
      } finally {
        setStatsLoading(false);
      }
    };

    const fetchSupabaseCount = async () => {
      try {
        const count = await supabaseDb.getWaitlistCount();
        setSupabaseCount(count);
      } catch (err) {
        console.warn("Could not retrieve live Supabase count:", err);
      }
    };

    fetchStats();
    fetchSupabaseCount();

    // Set analytics metadata
    const width = window.innerWidth;
    const device = width < 640 ? "Mobile" : width < 1024 ? "Tablet" : "Desktop";
    const ref = new URLSearchParams(window.location.search).get("ref") || "Organic Search";
    
    setAnalytics(prev => ({
      ...prev,
      deviceType: device,
      referralSource: ref,
      pageViews: prev.pageViews + Math.floor(Math.random() * 3) + 1 // Add authentic visual variation
    }));

    // Scroll depth tracker
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolled = Math.round((window.scrollY / scrollHeight) * 100);
        setAnalytics(prev => ({
          ...prev,
          maxScrollDepth: Math.max(prev.maxScrollDepth, scrolled)
        }));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Interactive background particle canvas effect
  useEffect(() => {
    const canvas = document.getElementById("hero-particles") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const heroSection = canvas.closest("section");
    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroSection?.getBoundingClientRect();
      if (rect) {
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
        mouseRef.current.hover = true;
      }
    };
    const handleMouseLeave = () => {
      mouseRef.current.hover = false;
    };

    heroSection?.addEventListener("mousemove", handleMouseMove);
    heroSection?.addEventListener("mouseleave", handleMouseLeave);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (mouseRef.current.hover) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.x += (dx / dist) * force * 0.35;
            p.y += (dy / dist) * force * 0.35;
          }
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const connAlpha = (110 - dist) / 110 * 0.07;
            ctx.strokeStyle = `rgba(147, 197, 253, ${connAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      heroSection?.removeEventListener("mousemove", handleMouseMove);
      heroSection?.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle direct inline registration
  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(heroEmail)) {
      setPrefilledEmail(heroEmail);
      setIsModalOpen(true);
      // Track CTA Click
      setAnalytics(prev => ({ ...prev, ctaClicks: prev.ctaClicks + 1 }));
    }
  };

  const handleCtaClick = (buttonId: string) => {
    setAnalytics(prev => ({ ...prev, ctaClicks: prev.ctaClicks + 1 }));
    setIsModalOpen(true);
  };

  // FAQ Items
  const faqItems = [
    {
      question: "What is PlacementOS?",
      answer: "PlacementOS is an integrated, AI-powered career operating system designed to guide you from initial career discovery to signing your official offer letter. By combining intelligent resume tailoring, real-time verbal speech mock interviews, predictive ATS indexing, and outbound networking outreach assistants, it maps every fragment of your career preparation into one unified roadmap."
    },
    {
      question: "Who is the platform built for?",
      answer: "It is built for students seeking internships/grad jobs, early-career professionals planning a career pivot, and tech specialists seeking to maximize their compensation package. Our custom models scale from basic professional structuring to extreme mock technical interviews for enterprise roles."
    },
    {
      question: "Is my candidate data secure and private?",
      answer: "Yes, absolutely. Security and candidate data privacy are core pillars of our architecture. All uploaded resumes, transcripts, profiles, and interview responses are fully encrypted in transit and at rest. We utilize isolated server environments, and your data is never sold or used to train public foundational AI models."
    },
    {
      question: "When is the scheduled general release?",
      answer: "We are currently conducting private closed-beta tests with select university cohorts and early-access waitlist members. General public onboarding is scheduled to launch in Q4. Waitlist members will receive priority invite codes in staggered weekly cohorts."
    },
    {
      question: "How can I join the waitlist?",
      answer: "Simply submit your email on this page. If you want to claim a priority onboarding slot, complete the brief role survey to verify your eligibility and profile preferences."
    },
    {
      question: "How will my registered information be used?",
      answer: "We use your details strictly to schedule invitation slots, analyze target features based on applicant roles, and prevent multiple registrations. We will never share or sell your details."
    }
  ];

  // All 10 Feature Showcase items
  const featurePreviews = [
    {
      title: "AI Resume Builder",
      description: "Generate beautiful, structured resumes customized instantly to match target role requirements and industry expectations.",
      icon: FileText,
      badge: "Coming Soon"
    },
    {
      title: "Resume Analyzer",
      description: "Identify structural blind spots, syntax weaknesses, and skill gaps in real-time with comprehensive improvement feedback.",
      icon: FileSearch,
      badge: "Coming Soon"
    },
    {
      title: "ATS Checker",
      description: "Audit your resumes against enterprise applicant tracking systems (ATS) using predictive score parsing and keyword analysis.",
      icon: ShieldCheck,
      badge: "Coming Soon"
    },
    {
      title: "Cover Letter Generator",
      description: "Draft highly compelling, personalized cover letters matching your background to the company's culture and job specification.",
      icon: Send,
      badge: "Coming Soon"
    },
    {
      title: "LinkedIn Optimizer",
      description: "Re-engineer your LinkedIn profile layout, headings, and experience descriptions to attract executive recruiters and search queries.",
      icon: Network,
      badge: "Coming Soon"
    },
    {
      title: "AI Mock Interviews",
      description: "Immersive real-time verbal mock interviews with adaptive questions, live speech metrics, and structural model answers.",
      icon: MessageSquare,
      badge: "Coming Soon"
    },
    {
      title: "Career Roadmaps",
      description: "Personalized pathways mapping out step-by-step actions, key projects, and concepts needed to land highly competitive roles.",
      icon: Compass,
      badge: "Coming Soon"
    },
    {
      title: "Company Preparation",
      description: "Unlock deep telemetry on company interview frameworks, historic questions, behavioral standards, and team structures.",
      icon: Building,
      badge: "Coming Soon"
    },
    {
      title: "Job Tracker",
      description: "Consolidate and monitor all job applications, contacts, schedules, and interview stages in one visual kanban pipeline.",
      icon: LayoutDashboard,
      badge: "Coming Soon"
    },
    {
      title: "Career Dashboard",
      description: "A centralized hub displaying your growth trajectory, skill masteries, application CTR, and real-time preparation status.",
      icon: Activity,
      badge: "Coming Soon"
    }
  ];

  // Early Access Benefits
  const earlyAccessBenefits = [
    {
      title: "Exclusive Closed-Beta Access",
      description: "Gain first-look credentials to launch codebases, early modules, and automated systems weeks before the general public.",
      icon: Sparkles
    },
    {
      title: "Direct Feedback Channels",
      description: "Influence our feature roadmap. Collaborate directly with designers and engineers in private Discord channels.",
      icon: Code
    },
    {
      title: "Shape the Product Ecosystem",
      description: "Request specialized tool integrations, custom ATS filters, or company templates relevant to your specific job search.",
      icon: GraduationCap
    },
    {
      title: "Lifetime Founders Pricing",
      description: "Lock in permanent early-access subscription credits and massive discounts upon public commercial availability.",
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white relative">
      
      {/* Background ambient lighting - High-fidelity aurora shifting lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[850px] bg-gradient-to-b from-purple-500/10 via-blue-500/5 to-transparent blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[350px] left-1/4 w-[350px] h-[350px] bg-emerald-500/[0.04] rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-10 w-[400px] h-[400px] bg-purple-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[1800px] left-10 w-[450px] h-[450px] bg-blue-500/[0.03] rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[3200px] right-1/4 w-[500px] h-[500px] bg-purple-900/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Grid overlay for tech startup aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none -z-10" />

      {/* --- HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="bg-gradient-to-tr from-purple-600 via-blue-500 to-emerald-400 text-white px-2.5 py-1 font-black text-xs rounded-lg tracking-tighter shadow-lg shadow-purple-500/10">
              POS
            </div>
            <div>
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                PlacementOS
                <span className="text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">
                  PRE-LAUNCH
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-white/50">
            <a href="#vision" className="hover:text-white transition-colors">Vision Sandbox</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#benefits" className="hover:text-white transition-colors">Early Benefits</a>
            <a href="#journey" className="hover:text-white transition-colors">Our Journey</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => handleCtaClick("header")}
              className="px-5 py-2.5 bg-white text-black hover:bg-white/90 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/5 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
            >
              Join Waitlist <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg border border-white/10 transition-all"
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
              className="md:hidden bg-[#070707] border-b border-white/10 px-4 pt-2 pb-6 space-y-3 shadow-2xl"
            >
              <a 
                href="#vision" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
              >
                Vision Sandbox
              </a>
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
              >
                Capabilities Previews
              </a>
              <a 
                href="#benefits" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
              >
                Early Benefits
              </a>
              <a 
                href="#journey" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
              >
                Journey Map
              </a>
              <a 
                href="#faq" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white"
              >
                FAQs
              </a>
              
              <div className="pt-4 flex flex-col gap-2.5">
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleCtaClick("mobile_drawer");
                  }}
                  className="w-full py-3 bg-white text-black text-xs font-black uppercase tracking-widest text-center rounded-xl"
                >
                  Join Waitlist
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- CINEMATIC HERO SECTION --- */}
      <section className="relative pt-10 pb-20 sm:pt-20 sm:pb-32 overflow-hidden">
        {/* Cinematic Mouse-Follow Background Particles Canvas */}
        <canvas id="hero-particles" className="absolute inset-0 w-full h-full pointer-events-none z-0" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10 relative z-10">
          
          {/* Neon animated sparkle badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full font-mono shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "8s" }} /> PRE-LAUNCH COHORT SIGNUPS NOW OPEN
          </motion.div>

          {/* Brand Mark Animation */}
          <div className="flex flex-col items-center justify-center pt-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {/* Shifting radial gradient rings */}
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/25 via-cyan-500/20 to-emerald-500/25 rounded-[2.5rem] blur-[30px] opacity-75 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative p-2.5 bg-[#0b0b0f] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(139,92,246,0.15)] overflow-hidden">
                <img 
                  src={placementOsLogo} 
                  alt="PlacementOS Company Logo" 
                  referrerPolicy="no-referrer"
                  className="w-44 h-44 sm:w-52 sm:h-52 object-cover rounded-[1.5rem] relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>

          {/* Typography headers */}
          <div className="max-w-4xl mx-auto space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 35, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none animate-gradient-text"
            >
              The Future of <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">Career Growth</span> Starts Here.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 25, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            >
              An AI Career Operating System designed to help students and professionals become job-ready through personalized guidance.
            </motion.p>

            {/* Preserved Tagline Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block p-4 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md max-w-3xl"
            >
              <p className="text-xs sm:text-sm text-purple-300 font-extrabold tracking-wide leading-relaxed font-sans">
                &ldquo;PlacementOS is an AI Career operating system that takes a student from 'I don't know what to do' to 'I got the job' through one personalized platform. Everything you need to get hired powered by AI, personalized for you.&rdquo;
              </p>
            </motion.div>
          </div>

          {/* High-Converting Inline Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl mx-auto"
          >
            <form onSubmit={handleHeroSubmit} className="flex flex-col sm:flex-row items-center gap-3 p-2 bg-[#0d0d10] border border-white/10 rounded-2xl shadow-2xl focus-within:border-purple-500/50 transition-all">
              <div className="relative w-full flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input 
                  type="email"
                  required
                  placeholder="Enter your email to claim priority..."
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm text-white placeholder-white/35 outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Join Early Access <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] text-white/40 mt-3 font-mono">
              ⚡ Instant email verification &middot; Takes less than 10 seconds.
            </p>
          </motion.div>

          {/* Dual Glassmorphic Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2"
          >
            <a 
              href="#vision"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 font-mono hover:scale-[1.02]"
            >
              Explore Our Vision <LayoutDashboard className="w-4 h-4 text-purple-400" />
            </a>
            <button 
              onClick={() => handleCtaClick("hero_secondary")}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-black hover:bg-white/90 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
            >
              Reserve Priority Slot <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </button>
          </motion.div>

        </div>
      </section>

      {/* --- INTERACTIVE simulated sandbox SYSTEM PREVIEW --- */}
      <section id="vision" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">Platform Sandbox</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Interactive Vision Explorer</h2>
          <p className="text-sm text-white/50 max-w-2xl mx-auto">
            Click on the tabs below to explore the high-fidelity simulated UI logic of our upcoming core modules.
          </p>
        </div>

        {/* Dashboard Frame Container */}
        <div className="border border-white/10 bg-[#07070a] rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/5 flex flex-col lg:flex-row min-h-[550px]">
          
          {/* Simulation Sidebar Selector */}
          <div className="w-full lg:w-72 bg-[#09090c] border-r border-white/5 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/40 font-mono block">Modules Sandbox</span>
              
              <div className="space-y-2">
                {/* Tab: Mock Interview */}
                <button 
                  onClick={() => setActivePreviewTab("interview")}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center gap-3 font-mono text-xs ${activePreviewTab === "interview" ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold" : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" /> AI Mock Interview
                </button>

                {/* Tab: ATS checker */}
                <button 
                  onClick={() => setActivePreviewTab("ats")}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center gap-3 font-mono text-xs ${activePreviewTab === "ats" ? "bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold" : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" /> ATS Resume Analyzer
                </button>

                {/* Tab: Career Path Roadmap */}
                <button 
                  onClick={() => setActivePreviewTab("roadmap")}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center gap-3 font-mono text-xs ${activePreviewTab === "roadmap" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold" : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  <Compass className="w-4 h-4 text-emerald-400" /> Career Roadmap
                </button>

                {/* Tab: Outbound outreach agent */}
                <button 
                  onClick={() => setActivePreviewTab("outreach")}
                  className={`w-full text-left p-3.5 rounded-xl transition-all flex items-center gap-3 font-mono text-xs ${activePreviewTab === "outreach" ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold" : "border border-transparent text-white/50 hover:text-white hover:bg-white/5"}`}
                >
                  <Send className="w-4 h-4 text-amber-400" /> Outreach Assistant
                </button>
              </div>
            </div>

            <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
              <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                PlacementOS integrates all fractured modules into one cohesive telemetry ecosystem.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
              >
                Claim Beta Token
              </button>
            </div>
          </div>

          {/* Sandbox Workspace Stage */}
          <div className="flex-1 bg-gradient-to-b from-white/[0.02] to-[#040406] p-6 sm:p-8 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* INTERVIEW TAB ACTIVE */}
              {activePreviewTab === "interview" && (
                <motion.div 
                  key="interview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex flex-col h-full justify-between"
                >
                  {/* Top Bar info */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-purple-300 font-mono">Verbal Simulation Mode</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">SESSION #POS-9812</span>
                  </div>

                  {/* Transcript content */}
                  <div className="space-y-4 flex-1 py-4">
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 text-xs font-mono font-bold">
                        AI
                      </div>
                      <div className="flex-1 bg-purple-500/5 border border-purple-500/15 p-4 rounded-2xl rounded-tl-none">
                        <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1">Interactive Interviewer (Google Mock)</p>
                        <p className="text-sm font-medium text-white leading-relaxed">
                          &ldquo;We noticed you built a distributed event system. How did you design consistency metrics under sudden network degradation? Walk me through your concurrency controls.&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-none text-right max-w-xl">
                        <p className="text-xs text-white/30 font-mono uppercase tracking-wider mb-1">Your Voice Response (Transcribed)</p>
                        <p className="text-sm font-medium text-white/80 leading-relaxed">
                          &ldquo;I designed a transactional commit sequence utilizing Raft-based consensus. When degradation hit 40%, we fell back to asynchronous optimistic caching with sequential consistency guarantees...&rdquo;
                        </p>
                      </div>
                      <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white/80 text-xs font-mono font-bold">
                        Me
                      </div>
                    </div>
                  </div>

                  {/* Telemetry panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono tracking-wider block">Fluency Pacing</span>
                      <span className="text-sm font-black text-white font-mono">132 Words/Min</span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1">✓ Perfect Pace Range</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono tracking-wider block">Keyword Alignment</span>
                      <span className="text-sm font-black text-white font-mono">92% Match</span>
                      <span className="text-[9px] text-emerald-400 font-bold block mt-1">✓ Found Raft, Consensus</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono tracking-wider block">Estimated Score</span>
                      <span className="text-sm font-black text-purple-400 font-mono">L5 Standard (Strong Hire)</span>
                      <span className="text-[9px] text-white/40 font-bold block mt-1">89th Percentile Benchmark</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ATS TAB ACTIVE */}
              {activePreviewTab === "ats" && (
                <motion.div 
                  key="ats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex flex-col h-full justify-between"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-blue-300 font-mono">Predictive Score Engine</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">TARGET: SENIOR FULLSTACK</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 py-4 flex-1">
                    {/* Simulated resume block */}
                    <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40 font-mono">RESUME_SOURCE_V3.pdf</span>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-mono">PARSED</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-2 bg-white/5 rounded w-full" />
                        <div className="h-2 bg-white/5 rounded w-5/6" />
                      </div>

                      <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1.5">
                        <p className="text-[10px] text-blue-300 font-bold uppercase font-mono">Missing Core Keywords Identified:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">GraphQL</span>
                          <span className="text-[9px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">Kubernetes</span>
                          <span className="text-[9px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">CI/CD Pipeline</span>
                        </div>
                      </div>
                    </div>

                    {/* ATS Scoring indicator */}
                    <div className="w-full md:w-56 flex flex-col items-center justify-center p-6 bg-white/[0.01] border border-white/5 rounded-2xl relative">
                      <div className="relative flex items-center justify-center">
                        {/* Outer circular indicator */}
                        <svg className="w-28 h-28 transform -rotate-90">
                          <circle cx="56" cy="56" r="48" stroke="#1f2937" strokeWidth="6" fill="transparent" />
                          <circle cx="56" cy="56" r="48" stroke="#3b82f6" strokeWidth="6" fill="transparent" strokeDasharray="301" strokeDashoffset="45" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-2xl font-black text-white font-mono">85%</span>
                          <span className="text-[8px] text-white/40 uppercase font-mono tracking-widest">ATS Match</span>
                        </div>
                      </div>
                      
                      <div className="text-center mt-4 space-y-1">
                        <p className="text-xs font-bold text-white">Score: Excellent</p>
                        <p className="text-[10px] text-white/50">Likelihood of screen pass: 94%</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                      🌟 <span className="text-blue-400 font-bold">Smart Fix:</span> Automatically inject missing terms matching semantic algorithms securely.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ROADMAP TAB ACTIVE */}
              {activePreviewTab === "roadmap" && (
                <motion.div 
                  key="roadmap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex flex-col h-full justify-between"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-300 font-mono">AI Career Roadmapping</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">TARGET: META APPRENTICESHIP</span>
                  </div>

                  <div className="py-4 flex-1 space-y-4">
                    {/* Timeline visualization */}
                    <div className="relative pl-6 space-y-6 border-l border-white/10 ml-2">
                      {/* Node 1 */}
                      <div className="relative">
                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#07070a]" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            Stage 1: Core Portfolio Structuring <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase font-black">COMPLETED</span>
                          </h4>
                          <p className="text-[10px] text-white/50">Map 3 portfolio projects showing dynamic state and server routing telemetry.</p>
                        </div>
                      </div>

                      {/* Node 2 */}
                      <div className="relative">
                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-[#07070a] animate-pulse" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            Stage 2: Systems Design & Consensus Telemetry <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-mono uppercase font-black">ACTIVE PROGRESS</span>
                          </h4>
                          <p className="text-[10px] text-white/50">Acquire active competency on Raft algorithms and DB partitioning paradigms.</p>
                        </div>
                      </div>

                      {/* Node 3 */}
                      <div className="relative opacity-40">
                        <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-white/20 border-4 border-[#07070a]" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">Stage 3: Mock Outbound Agency Outreach</h4>
                          <p className="text-[10px] text-white/50">Enable AI systems outreach agent to locate engineering managers on LinkedIn.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">Next Milestone: System Design Mock Session</span>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded"
                    >
                      Initialize Session
                    </button>
                  </div>
                </motion.div>
              )}

              {/* OUTREACH TAB ACTIVE */}
              {activePreviewTab === "outreach" && (
                <motion.div 
                  key="outreach"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 flex flex-col h-full justify-between"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-widest text-amber-300 font-mono">AI Outreach Agent</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">RECIPIENT: MICROSOFT ENG MANAGER</span>
                  </div>

                  <div className="py-4 flex-1 space-y-4">
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3 font-sans">
                      <div className="flex items-center justify-between text-[10px] text-white/40 pb-2 border-b border-white/5">
                        <span>To: gordon.m@microsoft.com</span>
                        <span>Subject: Synergy on Distributed Caching Modules</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs text-white/70 leading-relaxed">
                        <p>Hi Gordon,</p>
                        <p>
                          I saw your recent publication on <span className="text-amber-300 font-medium">Azure Storage caching layer scalability</span>. I recently finalized an open-source consensus controller that achieves a 22% latency reduction under similar constraints.
                        </p>
                        <p>
                          Given Microsoft's active engineering developments in cloud elasticity, I would love to share my benchmarks with you and discuss current opportunities on your team...
                        </p>
                        <p>Best regards,<br/>[Your Name]</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono tracking-wider block">Estimated CTR</span>
                      <span className="text-sm font-black text-white font-mono text-amber-400">74.2%</span>
                    </div>
                    <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-white/40 uppercase font-mono tracking-wider block">Personalization Depth</span>
                      <span className="text-sm font-black text-white font-mono text-amber-400">Extreme</span>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* --- EARLY ACCESS BENEFITS --- */}
      <section id="benefits" className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">Founders Circle Privilege</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Early Access Member Benefits</h2>
            <p className="text-sm text-white/50 max-w-lg mx-auto">
              Our initial beta slots are highly restricted. Registering today guarantees your priority token.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {earlyAccessBenefits.map((benefit, idx) => {
              const IconComp = benefit.icon;
              return (
                <div 
                  key={benefit.title} 
                  className="space-y-4 p-6 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 group hover:bg-white/[0.02]"
                >
                  <div className="w-12 h-12 bg-gradient-to-tr from-purple-500/15 to-blue-500/15 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="text-white/25 font-mono font-black text-sm">0{idx + 1}.</span>
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* --- FEATURE SHOWCASE GRID (Tag: Coming Soon) --- */}
      <section id="features" className="py-24 border-t border-white/5 bg-[#050505]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 font-mono">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Ecosystem Architecture</h2>
            <p className="text-sm text-white/50 max-w-md mx-auto">
              Unlock a complete, modular array of AI agents designed to personalizes every aspect of career preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {featurePreviews.map((feat) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={feat.title} 
                  className="group relative bg-[#0a0a0f]/40 backdrop-blur-md border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-500 flex flex-col justify-between hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] overflow-hidden"
                >
                  {/* Subtle neon glowing gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/[0.04] group-hover:to-purple-500/[0.04] transition-all duration-500 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/70 group-hover:text-purple-400 group-hover:bg-purple-500/10 border border-white/5 transition-all">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white tracking-tight">
                        {feat.title}
                      </h3>
                      <p className="text-[11px] text-white/55 leading-relaxed mt-1.5">{feat.description}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono">
                      {feat.badge}
                    </span>
                    <span className="text-[9px] text-white/30 group-hover:text-white/60 transition-colors font-mono uppercase tracking-widest flex items-center gap-1">
                      Preview &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* --- ABOUT US SECTION (Glassmorphism layout) --- */}
      <section id="about" className="py-24 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono bg-purple-500/10 px-3 py-1 rounded-full">Company Identity</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">About PlacementOS</h2>
            <p className="text-sm text-white/50 max-w-xl mx-auto">
              Our core mission, operational vision, and Karan Madan's commitment as Founder.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Mission Card (Glassmorphism) */}
            <div className="lg:col-span-6 bg-[#0a0a0f]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 font-mono bg-purple-500/15 border border-purple-500/20 px-3 py-1 rounded-full">Our Mission</span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Democratic Career Pathways</h3>
                <p className="text-sm text-white/60 leading-relaxed font-sans">
                  PlacementOS was engineered with a clear, uncompromising conviction: elite early-career preparation belongs to everyone. We break down traditional network barriers, replacing expensive, legacy career networks with immediate, high-fidelity career intelligence tools. Our goal is to level the playing field, empowering any candidate to unlock their maximum career trajectory regardless of background or pedigree.
                </p>
              </div>
            </div>

            {/* Vision Card (Glassmorphism) */}
            <div className="lg:col-span-6 bg-[#0a0a0f]/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 font-mono bg-blue-500/15 border border-blue-500/20 px-3 py-1 rounded-full">Our Vision</span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Elite Career Telemetry</h3>
                <p className="text-sm text-white/60 leading-relaxed font-sans">
                  We visualize a unified candidate-first command center where resumes, speech evaluation metrics, and active application pipelines are compiled into one cohesive, highly secured workspace. By optimizing and automating the entire preparation pipeline, we save candidates thousands of hours of redundant work, allowing them to focus on genuine behavioral readiness and real human connections.
                </p>
              </div>
            </div>

            {/* Founder Card - Karan Madan (Glassmorphism highlight) */}
            <div className="lg:col-span-12 bg-[#0d0d14]/60 backdrop-blur-lg border border-white/10 rounded-3xl p-8 sm:p-12 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4 space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 rounded-full">Founder Corner</span>
                  <div className="space-y-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Karan Madan</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Founder & Lead Architect</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Leadership Focus</p>
                    <p className="text-xs text-white/80">AI Orchestration & Secure Telemetry</p>
                  </div>
                </div>

                <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8 space-y-4">
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed italic font-sans">
                    &ldquo;PlacementOS began with a simple observation: early-career hiring systems are fundamentally disjointed. Candidates spend weeks tailoring resumes, researching companies, and receiving generic feedback. I architected PlacementOS to return full ownership and direct-decoupled intelligence back to candidates. We empower students and young professionals with elite tools so they can present their absolute best self to the market.&rdquo;
                  </p>
                  <p className="text-xs text-white/40 font-mono tracking-widest uppercase">
                    — Karan Madan, PlacementOS Founder Pledge
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- WHY PLACEMENTOS? PIPELINE INTEGRATION --- */}
      <section className="py-24 border-t border-white/5 bg-[#050505] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-tr from-purple-900/10 via-blue-900/10 to-indigo-900/10 border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest rounded-full font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Platform Integration Core
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Why PlacementOS?</h2>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-3xl">
                  Traditional career preparation is fragmented, stressful, and repetitive. Candidates use generic resume templates, disjointed interview practice tools, and track applications in messy spreadsheets. PlacementOS unifies everything into one seamless workspace.
                </p>
              </div>

              {/* Visual Workflow Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Fragmented */}
                <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest font-mono">Fragmented Process</span>
                  <ul className="space-y-3 text-xs text-white/50 font-sans">
                    <li className="flex items-center gap-2 text-red-300">
                      <span>✕</span> Generic resume templates that fail ATS checkers
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✕</span> Generic AI responses with no behavioral context
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✕</span> Copy-pasted emails that recruiters immediately ignore
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✕</span> Lost applications and missed interview stages
                    </li>
                  </ul>
                </div>

                {/* PlacementOS Unified */}
                <div className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-2xl space-y-4">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">PlacementOS Unified Blueprint</span>
                  <ul className="space-y-3 text-xs text-white/80 font-sans">
                    <li className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span>✓</span> Custom, dynamically aligned ATS parsing
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span>✓</span> Multi-modal speech mock interviews with metrics
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span>✓</span> Highly targeted outbound connection drafting
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span>✓</span> Seamless, automated pipeline tracking logs
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- PRODUCT JOURNEY MAP (TIMELINE) --- */}
      <section id="journey" className="py-24 border-t border-white/5 bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">Operational Journey</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Our Product Pathway</h2>
            <p className="text-sm text-white/50 max-w-lg mx-auto">
              Follow the exact step-by-step telemetry pipeline designed to guide you from candidate to signed offer.
            </p>
          </div>

          {/* Interactive Timeline Loop */}
          <div className="relative border-l border-white/10 max-w-4xl mx-auto pl-8 sm:pl-12 space-y-12">
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center font-mono text-xs font-black text-purple-300">
                1
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Discover Career Goals</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Our initial profile analyzer maps out your structural strengths, target positions, and existing skill masteries to draft a personalized preparation blueprint.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center font-mono text-xs font-black text-blue-300">
                2
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Build Resume</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Input details or upload standard drafts to automatically generate gorgeous, compliant resumes optimized dynamically for specific target role expectations.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center font-mono text-xs font-black text-emerald-300">
                3
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Improve ATS Score</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Run predictive ATS score simulation indexes. View missing tech keywords, semantic gaps, and receive suggestions to maximize hiring manager screen rates.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center font-mono text-xs font-black text-amber-300">
                4
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Practice Interviews</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Interact verbally with realistic real-time AI interviewers. Answer company-specific situational prompts and receive detailed reports on grammar, pace, and delivery.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center font-mono text-xs font-black text-indigo-300">
                5
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Prepare for Companies</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Get high-fidelity insight guides mapping current team structure, core systems stack, behavioral standards, and legacy questions of specific target employers.
                </p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center font-mono text-xs font-black text-cyan-300">
                6
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">Track Applications</h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Consolidate application telemetry. Leverage automatic contact logging, timeline alerts, pipeline trackers, and task check-offs in one visual command layout.
                </p>
              </div>
            </div>

            {/* Step 7 */}
            <div className="relative group">
              <div className="absolute -left-[45px] sm:-left-[61px] top-1.5 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-mono text-xs font-black text-white shadow-lg shadow-purple-500/20">
                ★
              </div>
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  Become Job Ready <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">Offer Signed</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl">
                  Walk confidently into high-fidelity interview loops, leverage built-in offer negotiators to optimize compensation, and secure your career goals.
                </p>
              </div>
            </div>

          </div>

          {/* Timeline Footer CTA */}
          <div className="text-center pt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-[#0a0a0d] hover:bg-[#0f0f14] border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              Start Your Journey Path
            </button>
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 border-t border-white/5 bg-gradient-to-b from-[#050505] to-white/[0.01]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 font-mono">Common Inquiries</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-sans">Frequently Asked Questions</h2>
            <p className="text-sm text-white/50">
              Everything you need to know about early access and platform specifications.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div 
                key={idx} 
                className="border border-white/5 bg-white/[0.01] rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.02] cursor-pointer"
                onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
              >
                <button 
                  className="w-full flex items-center justify-between text-left font-bold text-white tracking-tight text-base sm:text-lg focus:outline-none cursor-pointer"
                >
                  <span>{item.question}</span>
                  <span className="text-purple-400 font-mono text-xl ml-4">
                    {activeFaqIndex === idx ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaqIndex === idx && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm text-white/60 leading-relaxed border-t border-white/5 pt-4">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REASSURING CANDIDATE SECURITY PLEDGE --- */}
      <section className="py-20 border-t border-white/5 bg-[#050505]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-indigo-900/10 border border-white/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest rounded-full font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> Essential Platform Information
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Candidate Security & Operations Pledge</h2>
              
              <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-3xl">
                PlacementOS is designed around strict privacy sandboxing and carrier security models. Here is how we safeguard your professional growth and identity:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">⚡</span> Direct API Decoupling
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Your profiles, resumes, and answers are isolated. We use localized server proxies to interact with LLMs securely without broad data harvesting.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-purple-400">🔒</span> End-to-End Encryption
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Credentials, transcript data, and logs are fully protected with AES-256 encryption at rest, keeping personal files fully unreadable.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-blue-400">💼</span> Zero Model Training
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    We pledge to never sell, distribute, or license any part of your resumes or voice recordings to train public foundation models.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-[#050505] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              <span className="font-extrabold text-white text-base tracking-tight">PlacementOS</span>
              <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono uppercase">
                Private Dev
              </span>
            </div>
            <p className="text-xs text-white/40">
              Building the future of career preparation with AI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-xs text-white/50">
            <button 
              onClick={() => setAnalytics(prev => ({ ...prev, isHudOpen: !prev.isHudOpen }))}
              className="hover:text-purple-400 text-purple-500/80 transition-colors font-mono cursor-pointer focus:outline-none text-[10px] uppercase font-bold tracking-widest border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 rounded-full"
            >
              [ Telemetry Panel ]
            </button>
            <button 
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setTermsOpen(true)}
              className="hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              Terms of Service
            </button>
            <p className="text-white/30">
              &copy; {new Date().getFullYear()} PlacementOS. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

      {/* --- INTERACTIVE TELEMETRY HUD DRAWER (GROWTH HUD) --- */}
      <AnimatePresence>
        {analytics.isHudOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 w-full z-50 bg-[#07070a]/95 backdrop-blur-xl border-t border-purple-500/20 p-4 sm:p-6"
          >
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white font-mono">Live Client Telemetry Active</h4>
                  <p className="text-[10px] text-white/40 font-mono">Client-side analytics tracking performance metrics &amp; session states.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center items-center font-mono text-[10px] text-white/70">
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">DEVICE: {analytics.deviceType}</span>
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">VIEWS: {analytics.pageViews}</span>
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">CLICKS: {analytics.ctaClicks}</span>
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">SCROLL DEPTH: {analytics.maxScrollDepth}%</span>
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">SOURCE: {analytics.referralSource}</span>
                <span className="px-2.5 py-1 bg-white/5 rounded border border-white/5">SESSION START: {analytics.sessionStart}</span>
              </div>

              <button 
                onClick={() => setAnalytics(prev => ({ ...prev, isHudOpen: false }))}
                className="p-1.5 hover:bg-white/5 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PRIVACY POLICY MODAL --- */}
      <AnimatePresence>
        {privacyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrivacyOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Privacy Policy
                </h3>
                <button 
                  onClick={() => setPrivacyOpen(false)}
                  className="p-1.5 hover:bg-white/5 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-white/70 leading-relaxed font-sans">
                <p className="font-bold text-white">Last Updated: July 2026</p>
                <p>
                  At PlacementOS, your privacy is our primary engineering criteria. This Privacy Policy details how we handle waitlist details, application credentials, and communication logs.
                </p>
                
                <h4 className="font-extrabold text-white pt-2 text-base">1. Information We Collect</h4>
                <p>
                  To secure your placement on the pre-launch waitlist, we only collect:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full Name</li>
                  <li>Email Address</li>
                  <li>Current Role (e.g. Student, Graduate, Professional)</li>
                  <li>Optional affiliated organization and marketing source details</li>
                </ul>

                <h4 className="font-extrabold text-white pt-2 text-base">2. How We Use Information</h4>
                <p>
                  We only use your waitlist details to coordinate cohort launches, provide priority invitations, and prevent spam/duplicate signups.
                </p>

                <h4 className="font-extrabold text-white pt-2 text-base">3. AI Safety and Data Control</h4>
                <p>
                  We are deeply committed to protecting candidate intellectual property. Any profiles, documents, or interview responses generated inside PlacementOS are isolated. We do not license, distribute, or leverage your professional materials to train open models.
                </p>

                <h4 className="font-extrabold text-white pt-2 text-base">4. Your Data, Your Control</h4>
                <p>
                  You retain complete, permanent ownership over your records. You may request the absolute erasure of your waitlist record and logs at any time by contacting our support desk.
                </p>
              </div>
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => setPrivacyOpen(false)}
                  className="px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- TERMS OF SERVICE MODAL --- */}
      <AnimatePresence>
        {termsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTermsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[80vh] bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Terms of Service
                </h3>
                <button 
                  onClick={() => setTermsOpen(false)}
                  className="p-1.5 hover:bg-white/5 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-sm text-white/70 leading-relaxed font-sans">
                <p className="font-bold text-white">Last Updated: July 2026</p>
                <p>
                  Welcome to PlacementOS. By accessing or requesting early access waitlist enrollment, you agree to comply with the following Terms of Service.
                </p>
                
                <h4 className="font-extrabold text-white pt-2 text-base">1. Early Access License</h4>
                <p>
                  Subject to enrollment approval, PlacementOS grants you a limited, non-exclusive, non-transferable, personal license to explore and interact with our pre-launch AI dashboard prototypes and career systems.
                </p>

                <h4 className="font-extrabold text-white pt-2 text-base">2. Acceptable Use Code</h4>
                <p>
                  Candidates agree to use the service in an ethical, authentic manner. You are strictly prohibited from:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deploying scrapers, bots, or automated bulk submission tools to sign up.</li>
                  <li>Attacking, reverse engineering, or disrupting the model endpoints.</li>
                  <li>Providing intentionally deceptive, fraudulent, or malicious identity fields.</li>
                </ul>

                <h4 className="font-extrabold text-white pt-2 text-base">3. Service Evolution</h4>
                <p>
                  PlacementOS is currently in an active pre-launch development state. We reserves the right to modify, adapt, reset, or suspend any capability preview, database collection, or waitlist statistics at our discretion.
                </p>

                <h4 className="font-extrabold text-white pt-2 text-base">4. Disclaimer of Liability</h4>
                <p>
                  All career summaries, optimization matches, and simulated evaluations are generated by AI. We do not guarantee a direct job placement or employment outcomes, and we accept no liability for decisions made based on platform suggestions.
                </p>
              </div>
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-end">
                <button 
                  onClick={() => setTermsOpen(false)}
                  className="px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
                >
                  I Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PREMIUM WAITLIST REGISTRATION MODAL --- */}
      <WaitlistRegistrationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialEmail={prefilledEmail}
      />
    </div>
  );
}
