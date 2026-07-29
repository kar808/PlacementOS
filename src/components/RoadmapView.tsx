import React, { useState, useEffect } from "react";
import { 
  EnterpriseCareerRoadmap, 
  EnterpriseRoadmapParams, 
  EnterpriseUserAnalysis,
  RoadmapMilestoneItem, 
  RoadmapPlan, 
  StudentProfile 
} from "../types";
import { MAJOR_CAREER_DOMAINS } from "./UniversalProfessionEngine";
import { 
  Calendar, CheckSquare, Clock, Award, Star, ListChecks, Play, 
  TrendingUp, Compass, ShieldCheck, Zap, Download, Sliders, 
  BookOpen, Briefcase, ChevronRight, Edit3, Plus, ExternalLink, 
  Globe, Sparkles, Target, Users, Layers, MessageSquare, Check, Trash2, Printer, Rocket, FileText
} from "lucide-react";

interface RoadmapViewProps {
  profile: StudentProfile;
  roadmap: RoadmapPlan | null;
  onGenerate: (customParams?: EnterpriseRoadmapParams) => Promise<void>;
  isGenerating: boolean;
  onTargetRoleChange?: (role: string, industry?: string) => Promise<void> | void;
}

// Domain-specific stage data builder covering all major non-tech and tech professions
function getDomainSpecificStageData(role: string, industry: string) {
  const r = (role || "").toLowerCase();
  const ind = (industry || "").toLowerCase();

  // 1. Healthcare / Nursing / Medical
  if (r.includes("nurse") || r.includes("doctor") || r.includes("health") || r.includes("medical") || r.includes("clinic") || r.includes("pharma") || ind.includes("health") || ind.includes("medical")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Foundational Clinical Care & Medical Protocols",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Focus on foundational patient assessment, medical terminology, and strict HIPAA compliance before advancing to complex care plans.",
        learningTopics: ["Anatomy & Physiology Fundamentals", "Medical Terminology & Pathology", "Patient Assessment & Vitals Monitoring", "Pharmacology & Dosage Calculations", "HIPAA Compliance & EMR Data Privacy"],
        recommendedTools: ["Epic Systems / Cerner EHR", "Stethoscope & Vitals Diagnostics", "UpToDate Clinical Decision Support", "PubMed Research Database", "Medscape Pharmacopeia"],
        recommendedProjects: [
          { title: "Clinical Workflow & Patient Triage Audit", description: "Audit emergency department patient intake and triage prioritization flow to minimize wait times.", keyDeliverables: ["Triage Protocol Matrix", "EMR Entry Audit", "Patient Safety Report"], portfolioImpact: "Demonstrates clinical compliance and operational rigor." }
        ],
        recommendedCertifications: [
          { name: "BLS / ACLS Certification", issuer: "American Heart Association", relevance: "Essential Clinical Standard", estimatedCost: "$100" },
          { name: "Certified Medical Assistant / NCLEX-RN Prep", issuer: "NCSBN / State Licensing", relevance: "Core Licensure Requirement", estimatedCost: "$200" }
        ],
        books: [{ title: "Bates' Guide to Physical Examination", author: "Lynn S. Bickley", whyRead: "Gold standard manual for physical health assessment." }],
        courses: [{ title: "Human Anatomy & Physiology", platform: "Coursera / Duke", urlOrProvider: "Duke University", type: "Free" }],
        practicePlatforms: [{ name: "UWorld Medical / NCLEX QBank", focus: "Clinical Case Scenarios & Board Questions" }],
        interviewPreparation: [
          { topic: "Patient Care Scenarios & Compassion", keyQuestions: ["How do you handle an uncooperative patient?", "Describe a time you noticed an incorrect dosage."], strategy: "Emphasize patient safety, protocol verification, and clear escalation." }
        ],
        portfolioTasks: ["Log 50 clinical simulation hours", "Audit EMR data privacy compliance", "Create patient discharge instruction checklist"],
        networkingSuggestions: ["Connect with local hospital unit managers", "Join State Nursing or Medical Association", "Attend clinical research webinars"],
        jobApplicationStrategy: ["Target residency and entry clinical programs", "Highlight clinical rotation hours on CV", "Submit applications to regional health systems"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Specialized Clinical Management & EMR Workflows",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Develop sharp diagnostic reasoning, medication reconciliation, and interprofessional care team communication.",
        learningTopics: ["Critical Care & Emergency Protocol", "Diagnostic Diagnostics Interpretation (ECG/Lab)", "Interprofessional Team Care Coordination", "Patient Advocacy & Informed Consent", "Infection Control & Sterile Technique"],
        recommendedTools: ["Pyxis Automated Dispensing", "Cerner PowerChart", "3M Medical Coding", "UpToDate", "EHR Simulator"],
        recommendedProjects: [
          { title: "Medication Reconciliation & Safety Protocol Case Study", description: "Design a double-check verification framework reducing drug dosage errors in inpatient wards.", keyDeliverables: ["Medication Admin Checklist", "Safety Flowchart", "Staff Training Guide"], portfolioImpact: "Proves commitment to zero-defect patient care." }
        ],
        recommendedCertifications: [
          { name: "Certified Critical Care Nurse (CCRN) / Specialist", issuer: "AACN / Specialty Board", relevance: "High Advanced Competency", estimatedCost: "$300" }
        ],
        books: [{ title: "Harrison's Principles of Internal Medicine", author: "Joseph Loscalzo et al.", whyRead: "Definitive clinical medicine reference." }],
        courses: [{ title: "Clinical Terminology for Healthcare", platform: "Coursera / Pittsburgh", urlOrProvider: "Univ of Pittsburgh", type: "Free" }],
        practicePlatforms: [{ name: "Osmosis Health Learning", focus: "Pathology & Clinical Reasoning Drills" }],
        interviewPreparation: [
          { topic: "Critical Care Decision Making", keyQuestions: ["Explain how you prioritize 3 deteriorating patients.", "Walk me through an emergency code situation."], strategy: "Use ABCs (Airway, Breathing, Circulation) framework." }
        ],
        portfolioTasks: ["Publish unit medication safety protocol", "Log specialized ICU/ER rotation hours", "Author patient advocacy guide"],
        networkingSuggestions: ["Engage with specialty clinical committees", "Seek mentorship from Nurse Practitioners / Attending Physicians", "Attend annual clinical symposiums"],
        jobApplicationStrategy: ["Target specialized inpatient wards and ICUs", "Request internal unit transfer interviews", "Highlight specialized certification credentials"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Hospital Unit Leadership & Quality Metrics",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Master healthcare operational quality (HCAHPS), unit budgeting, and clinical risk mitigation.",
        learningTopics: ["Clinical Trial Management & Ethics", "Healthcare Quality Metrics & HCAHPS", "Hospital Unit Leadership & Budgeting", "Complex Multi-System Pathology Management", "Telehealth Protocol Optimization"],
        recommendedTools: ["Epic Cadence / Grand Central", "Midas Healthcare Analytics", "RedCap Research DB", "SAS Healthcare Analytics"],
        recommendedProjects: [
          { title: "Hospital Readmission Reduction Initiative", description: "Implement post-discharge follow-up care plans reducing 30-day readmissions by 18%.", keyDeliverables: ["Discharge Care Plan", "Metric Dashboard", "Executive Brief"], portfolioImpact: "Shows strategic healthcare management ability." }
        ],
        recommendedCertifications: [
          { name: "Certified Healthcare Executive (FACHE) / Nurse Leader", issuer: "ACHE / ANCC", relevance: "Top Executive Credential", estimatedCost: "$450" }
        ],
        books: [{ title: "Understanding Healthcare Financial Management", author: "Louis C. Gapenski", whyRead: "Strategic healthcare budget and operations guide." }],
        courses: [{ title: "Healthcare Quality Improvement", platform: "Harvard Online", urlOrProvider: "Harvard", type: "Paid" }],
        practicePlatforms: [{ name: "NEJM Knowledge+", focus: "Adaptive Board Level Clinical Case Drills" }],
        interviewPreparation: [
          { topic: "Healthcare Quality & Leadership", keyQuestions: ["How do you improve unit HCAHPS scores?", "How do you manage staff burnout?"], strategy: "Focus on data-driven interventions and empathetic leadership." }
        ],
        portfolioTasks: ["Author hospital quality improvement report", "Lead interdisciplinary case study review", "Present findings to chief nursing officer"],
        networkingSuggestions: ["Join Executive Healthcare Associations", "Participate in hospital policy boards", "Present poster sessions at medical conferences"],
        jobApplicationStrategy: ["Target Charge Nurse, Unit Supervisor, or Clinical Manager roles", "Leverage executive recruiter contacts", "Highlight unit efficiency metrics"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Enterprise Healthcare Administration & Policy",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Director, Chief Medical Officer, or Chief Nursing Officer executive leadership.",
        learningTopics: ["Health Policy & Regulatory Auditing", "Enterprise Hospital System Administration", "Clinical Governance & Risk Management", "Executive Healthcare Leadership", "Value-Based Care Reimbursement Models"],
        recommendedTools: ["Oracle Health Sciences", "Premier Healthcare Analytics", "Tableau Healthcare Intelligence"],
        recommendedProjects: [
          { title: "Enterprise Health System Quality Audit", description: "Lead comprehensive JCAHO accreditation audit across 5 outpatient care centers.", keyDeliverables: ["JCAHO Audit Dossier", "Risk Mitigation Roadmap", "C-Suite Presentation"], portfolioImpact: "Establishes executive healthcare leadership." }
        ],
        recommendedCertifications: [
          { name: "Certified Professional in Healthcare Quality (CPHQ)", issuer: "NAHQ", relevance: "Executive Quality Standard", estimatedCost: "$400" }
        ],
        books: [{ title: "The Leadership Challenge in Healthcare", author: "Stephen L. Walston", whyRead: "Executive guidance for leading healthcare organizations." }],
        courses: [{ title: "Executive Healthcare Leadership", platform: "edX / Johns Hopkins", urlOrProvider: "Johns Hopkins", type: "Paid" }],
        practicePlatforms: [{ name: "IHI Open School", focus: "Healthcare Quality & Executive Safety Leadership" }],
        interviewPreparation: [
          { topic: "C-Suite Healthcare Strategy", keyQuestions: ["How do you transition a health system to value-based care?", "Describe your multi-million dollar capital budgeting approach."], strategy: "Align clinical excellence with financial sustainability." }
        ],
        portfolioTasks: ["Deliver C-Suite health system audit", "Publish white paper on value-based care", "Structure multi-department clinical budget"],
        networkingSuggestions: ["Connect with hospital CEOs and VPs", "Serve on regional health advisory boards", "Keynote at healthcare leadership summits"],
        jobApplicationStrategy: ["Engage executive search firms", "Apply for CNO/CMO/VP Clinical Operations roles", "Negotiate executive compensation package"]
      }
    };
  }

  // 2. Legal / Law / Compliance
  if (r.includes("law") || r.includes("legal") || r.includes("attorney") || r.includes("paralegal") || r.includes("counsel") || ind.includes("legal") || ind.includes("law")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Legal Method, Case Analysis & Brief Writing",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master statutory interpretation, IRAC legal writing method, and primary precedent research on Westlaw/LexisNexis.",
        learningTopics: ["Legal Method & Case Law Analysis", "Statutory Interpretation & Research", "Legal Writing & Memorandum Drafting", "Civil Procedure & Torts Basics", "Professional Responsibility & Ethics Rules"],
        recommendedTools: ["Westlaw Precision", "LexisNexis Advance", "Clio Practice Management", "Adobe Acrobat Pro Legal", "Fastcase"],
        recommendedProjects: [
          { title: "Statutory Analysis & Memorandum of Law", description: "Draft a comprehensive legal memorandum analyzing tort liability in a breach of contract dispute.", keyDeliverables: ["Legal Memorandum", "Case Citation Index", "Statutory Summary"], portfolioImpact: "Demonstrates rigorous legal reasoning and citation skill." }
        ],
        recommendedCertifications: [
          { name: "Certified Paralegal (CP)", issuer: "NALA", relevance: "Core Industry Credential", estimatedCost: "$250" }
        ],
        books: [{ title: "Point Made: How to Write Like Top Advocates", author: "Ross Guberman", whyRead: "Master persuasive legal brief drafting." }],
        courses: [{ title: "An Introduction to American Law", platform: "Coursera / Penn Law", urlOrProvider: "UPenn", type: "Free" }],
        practicePlatforms: [{ name: "Westlaw Research Drills", focus: "Boolean Query Mastery & Shepardizing" }],
        interviewPreparation: [
          { topic: "Legal Reasoning & Citation", keyQuestions: ["Walk me through how you Shepardize a case.", "How do you structure an IRAC memo?"], strategy: "Demonstrate precision, thorough research, and ethical awareness." }
        ],
        portfolioTasks: ["Publish 10-page memorandum of law", "Build legal research citation index", "Draft client intake questionnaire"],
        networkingSuggestions: ["Join local or state Bar Association student section", "Reach out to law firm associates for informational interviews", "Attend local court proceedings"],
        jobApplicationStrategy: ["Target paralegal, legal assistant, or summer associate roles", "Submit writing sample alongside resume", "Apply to regional law firms and corporate legal departments"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Contract Drafting, Discovery & Trial Prep",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Build strong transactional drafting skills, master E-Discovery tools, and prepare for Bar Exam / licensing requirements.",
        learningTopics: ["Contract Drafting & Negotiation", "Litigation Discovery & E-Discovery Protocols", "Corporate Governance & M&A Fundamentals", "Intellectual Property & Licensing", "Evidence & Trial Strategy"],
        recommendedTools: ["Relativity E-Discovery", "Ironclad CLM", "Practical Law", "Clio Draft", "Lexis + AI"],
        recommendedProjects: [
          { title: "M&A Due Diligence & Contract Risk Matrix", description: "Analyze 50 commercial agreements for change of control clauses and indemnity liabilities.", keyDeliverables: ["Due Diligence Matrix", "Risk Executive Brief", "Redlined Contracts"], portfolioImpact: "Proves corporate transactional competence." }
        ],
        recommendedCertifications: [
          { name: "CIPP/US Certified Information Privacy Professional", issuer: "IAPP", relevance: "Top Corporate Privacy Credential", estimatedCost: "$550" }
        ],
        books: [{ title: "Working with Contracts: What Law School Doesn't Teach You", author: "Charles M. Fox", whyRead: "Practical transactional law guide." }],
        courses: [{ title: "Contract Law: From Trust to Promise to Contract", platform: "edX / Harvard Law", urlOrProvider: "Harvard", type: "Free" }],
        practicePlatforms: [{ name: "BarMax / Kaplan Legal QBank", focus: "Bar Exam & Legal Doctrine Practice" }],
        interviewPreparation: [
          { topic: "Contract Negotiation & Risk", keyQuestions: ["How do you negotiate limitation of liability clauses?", "Describe an E-discovery document review project."], strategy: "Emphasize risk mitigation, precision, and client business goals." }
        ],
        portfolioTasks: ["Redline complex commercial agreement", "Draft full discovery request package", "Create corporate board resolutions deck"],
        networkingSuggestions: ["Participate in Inns of Court meetings", "Connect with in-house legal counsels on LinkedIn", "Attend corporate law practice groups"],
        jobApplicationStrategy: ["Target junior associate and corporate compliance roles", "Highlight transactional redlining experience", "Leverage law school career placement services"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Regulatory Compliance & High-Stakes Litigation",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on complex corporate litigation, regulatory compliance audits (SEC/GDPR), and cross-border deal structuring.",
        learningTopics: ["Complex Commercial Litigation", "Regulatory Compliance & Regulatory Audits", "Antitrust & Competition Law", "Cross-Border Transactional Structuring", "Appellate Advocacy"],
        recommendedTools: ["Lex Machina Judicial Analytics", "LawGeex AI Contract Review", "RelativityOne"],
        recommendedProjects: [
          { title: "Regulatory Compliance Audit & Defense Brief", description: "Structure regulatory compliance framework for GDPR and SEC disclosure compliance.", keyDeliverables: ["Compliance Audit Manual", "Regulatory Defense Brief", "Executive Board Presentation"], portfolioImpact: "Distinguishes you as a senior corporate legal strategist." }
        ],
        recommendedCertifications: [
          { name: "State Bar Exam Licensure / LL.M.", issuer: "State Bar Association", relevance: "Full Attorney Practice License", estimatedCost: "$1,000" }
        ],
        books: [{ title: "The Legal Analyst: A Toolkit for Thinking About the Law", author: "Ward Farnsworth", whyRead: "Strategic legal analysis principles." }],
        courses: [{ title: "Corporate & Commercial Law", platform: "Coursera / Illinois", urlOrProvider: "Univ of Illinois", type: "Free" }],
        practicePlatforms: [{ name: "LexisNexis Practical Guidance", focus: "Transactional Drafting & Deal Structuring" }],
        interviewPreparation: [
          { topic: "Regulatory Strategy & Corporate Governance", keyQuestions: ["How do you advise a board on SEC compliance?", "Walk me through an internal corporate investigation."], strategy: "Balance legal exposure with strategic business objectives." }
        ],
        portfolioTasks: ["Author appellate amicus brief", "Structure enterprise data privacy compliance manual", "Manage complex M&A closing folder"],
        networkingSuggestions: ["Join American Bar Association Section of Business Law", "Speak on legal technology and compliance panels", "Build relationships with senior law firm partners"],
        jobApplicationStrategy: ["Target mid/senior associate and Senior Counsel positions", "Leverage legal headhunters", "Negotiate law firm billable hour and compensation structures"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "General Counsel & Executive Legal Leadership",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Chief Legal Officer, General Counsel, or Equity Partner roles in top firms.",
        learningTopics: ["General Counsel Leadership & Board Governance", "Crisis Management & Internal Investigations", "High-Stakes Settlement & Arbitration", "Legal Department Budgeting & Legal Tech Automation"],
        recommendedTools: ["SimpleLegal", "Onit Enterprise Legal Management", "Mitratech"],
        recommendedProjects: [
          { title: "Enterprise Legal Risk & Litigation Strategy Framework", description: "Design an enterprise dispute resolution and risk mitigation blueprint for global operations.", keyDeliverables: ["Risk Mitigation Policy", "Board Resolution Draft", "Outside Counsel Budgeting Guide"], portfolioImpact: "Demonstrates Chief Legal Officer leadership." }
        ],
        recommendedCertifications: [
          { name: "Certified Corporate Compliance & Ethics Professional (CCEP)", issuer: "SCCE", relevance: "Executive Compliance Benchmark", estimatedCost: "$450" }
        ],
        books: [{ title: "The Indispensable Counsel", author: "Jonathan Bellis", whyRead: "Guide for inside counsel and general counsel leadership." }],
        courses: [{ title: "Executive Legal Leadership", platform: "Harvard Law Executive Education", urlOrProvider: "Harvard Law", type: "Paid" }],
        practicePlatforms: [{ name: "ACC (Association of Corporate Counsel) Resource Hub", focus: "In-House Legal Strategy" }],
        interviewPreparation: [
          { topic: "General Counsel & Board Advisory", keyQuestions: ["How do you manage a public PR crisis with litigation risk?", "How do you optimize outside counsel legal spend?"], strategy: "Demonstrate executive leadership, risk management, and ROI focus." }
        ],
        portfolioTasks: ["Publish enterprise dispute resolution blueprint", "Draft annual legal department budget", "Present board advisory paper"],
        networkingSuggestions: ["Engage with Association of Corporate Counsel (ACC)", "Connect with Managing Partners & Board Members", "Write articles for Law360 or Harvard Law Blog"],
        jobApplicationStrategy: ["Engage executive legal search consultants", "Target General Counsel & VP of Legal roles", "Structure executive compensation and equity packages"]
      }
    };
  }

  // 3. Accounting, Banking & Finance
  if (r.includes("account") || r.includes("finance") || r.includes("bank") || r.includes("audit") || r.includes("tax") || r.includes("investment") || ind.includes("finance") || ind.includes("account")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Financial Accounting, Modeling & Audit Fundamentals",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master GAAP/IFRS principles, 3-statement financial modeling in Excel, and baseline corporate tax rules.",
        learningTopics: ["Financial Accounting Principles (GAAP/IFRS)", "3-Statement Financial Modeling", "Cost Accounting & Variance Analysis", "Corporate Tax Basics", "Excel Advanced Formulas & Financial Functions"],
        recommendedTools: ["Microsoft Excel (Advanced)", "QuickBooks Online", "Xero Accounting", "CapIQ Basics", "Tableau Financials"],
        recommendedProjects: [
          { title: "3-Statement Financial Model & Valuation Audit", description: "Build an interconnected DCF financial model projecting 5-year revenue, income, and cash flow.", keyDeliverables: ["Dynamic Excel Model", "Valuation Summary Pitchbook", "Sensitivity Analysis Table"], portfolioImpact: "Proves mastery of core corporate finance valuation." }
        ],
        recommendedCertifications: [
          { name: "Certified Public Accountant (CPA) Exam Part 1", issuer: "AICPA / NASBA", relevance: "Gold Standard Accounting License", estimatedCost: "$300" },
          { name: "CFA Level 1 Candidate", issuer: "CFA Institute", relevance: "Top Investment Credential", estimatedCost: "$1,000" }
        ],
        books: [{ title: "Financial Statement Analysis", author: "K.R. Subramanyam", whyRead: "Essential guide to reading and analyzing balance sheets." }],
        courses: [{ title: "Financial Accounting Fundamentals", platform: "Coursera / Wharton", urlOrProvider: "Wharton", type: "Free" }],
        practicePlatforms: [{ name: "Corporate Finance Institute (CFI)", focus: "Financial Modeling & Accounting Drills" }],
        interviewPreparation: [
          { topic: "3-Statement Accounting Walkthrough", keyQuestions: ["If depreciation increases by $10, how does it affect the 3 statements?", "Explain working capital."], strategy: "Trace changes line by line through Income Statement -> Cash Flow -> Balance Sheet." }
        ],
        portfolioTasks: ["Publish 3-statement financial model in Excel", "Build corporate valuation pitchbook", "Audit sample balance sheet for variances"],
        networkingSuggestions: ["Join local CPA or Financial Analysts Society", "Reach out to Big 4 accountants for coffee chats", "Attend university finance alumni panels"],
        jobApplicationStrategy: ["Apply for Financial Analyst, Staff Accountant, or Audit Associate roles", "Attach financial modeling portfolio to applications", "Target regional accounting firms and corporate finance teams"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "M&A LBO Modeling, Risk Analysis & ERP Systems",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Master LBO valuation, M&A deal modeling, internal controls, and enterprise ERP systems like SAP/Oracle.",
        learningTopics: ["Mergers & Acquisitions (M&A) LBO Modeling", "Corporate Audit Standards & Internal Controls", "Working Capital Management", "Capital Structure & WACC Optimization", "Financial Statement Fraud Detection"],
        recommendedTools: ["Bloomberg Terminal", "FactSet", "SAP Financials ERP", "Oracle Financials Cloud", "PowerBI"],
        recommendedProjects: [
          { title: "M&A Buy-Side LBO Valuation & Due Diligence", description: "Model a $500M leveraged buyout transaction with debt tranche scheduling and IRR calculation.", keyDeliverables: ["LBO Model Deck", "M&A Pitchbook", "Debt Coverage Sensitivity Table"], portfolioImpact: "Demonstrates investment banking / private equity modeling capability." }
        ],
        recommendedCertifications: [
          { name: "Financial Modeling & Valuation Analyst (FMVA)", issuer: "CFI", relevance: "High Practical Credential", estimatedCost: "$497" }
        ],
        books: [{ title: "Investment Banking: Valuation, LBOs, M&A", author: "Joshua Rosenbaum", whyRead: "Industry standard Wall Street handbook." }],
        courses: [{ title: "Business & Financial Modeling", platform: "Coursera / Wharton", urlOrProvider: "Wharton", type: "Free" }],
        practicePlatforms: [{ name: "Wall Street Prep / Wall Street Oasis QBank", focus: "Finance Technical Interviews & Valuation" }],
        interviewPreparation: [
          { topic: "Valuation & LBO Technicals", keyQuestions: ["Walk me through a DCF.", "What drives returns in an LBO?", "When would you use EV/EBITDA vs P/E?"], strategy: "State valuation formulas cleanly and explain economic rationale." }
        ],
        portfolioTasks: ["Build complete M&A LBO model", "Design internal audit control matrix", "Analyze 10-K filings for red flags"],
        networkingSuggestions: ["Connect with Investment Banking & Private Equity associates", "Join CFA Society local networking groups", "Participate in financial modeling competitions"],
        jobApplicationStrategy: ["Target Senior Financial Analyst, M&A Associate, or Senior Auditor roles", "Submit pitchbooks during application follow-ups", "Leverage finance boutique headhunters"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Treasury Management, Hedging & International Tax",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on corporate treasury, currency hedging, transfer pricing, and strategic capital allocation.",
        learningTopics: ["Derivatives Risk Management & Hedging", "Enterprise Risk Management (ERM)", "International Financial Reporting Standards (IFRS)", "Tax Structuring & Transfer Pricing", "Treasury & Liquidity Management"],
        recommendedTools: ["Refinitiv Eikon", "Anaplan Financial Planning", "Workday Financial Management"],
        recommendedProjects: [
          { title: "Enterprise Capital Budgeting & Hedging Strategy", description: "Structure foreign exchange risk hedging and multi-currency treasury management model.", keyDeliverables: ["Treasury Policy Manual", "Hedging Sensitivity Model", "CFO Presentation"], portfolioImpact: "Demonstrates senior corporate treasury capability." }
        ],
        recommendedCertifications: [
          { name: "Chartered Financial Analyst (CFA) Charter", issuer: "CFA Institute", relevance: "Elite Investment License", estimatedCost: "$1,200" }
        ],
        books: [{ title: "Options, Futures, and Other Derivatives", author: "John C. Hull", whyRead: "Definitive guide to financial risk management." }],
        courses: [{ title: "Advanced Corporate Finance", platform: "edX / MITx", urlOrProvider: "MIT", type: "Paid" }],
        practicePlatforms: [{ name: "FactSet Learning Academy", focus: "Portfolio Analytics & Equity Research" }],
        interviewPreparation: [
          { topic: "Corporate Finance & Capital Structure", keyQuestions: ["How do you determine optimal capital structure?", "How do you hedge against FX volatility?"], strategy: "Link financial risk management to shareholder value creation." }
        ],
        portfolioTasks: ["Structure multi-currency hedging model", "Draft international tax transfer policy", "Author capital allocation policy paper"],
        networkingSuggestions: ["Engage with Association for Financial Professionals (AFP)", "Attend treasury executive summits", "Build relationships with corporate CFOs"],
        jobApplicationStrategy: ["Apply for Finance Manager, Treasury Director, or VP Finance positions", "Highlight multi-million dollar budget management experience", "Negotiate performance bonuses and stock options"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "CFO Leadership, SEC Filings & IPO Strategy",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Prepare for Chief Financial Officer (CFO), Partner, or Managing Director executive roles.",
        learningTopics: ["CFO Strategic Financial Leadership", "Capital Allocation & Dividend Policy", "Investor Relations & SEC Filings (10-K/10-Q)", "Strategic Corporate Restructuring", "ESG Financial Audit"],
        recommendedTools: ["Adaptive Insights", "OneStream Software", "HighRadius AI Treasury"],
        recommendedProjects: [
          { title: "Corporate Restructuring & Initial Public Offering (IPO) Deck", description: "Prepare complete S-1 registration filing and financial prospectus for an enterprise stock listing.", keyDeliverables: ["S-1 Prospectus Draft", "Investor Roadshow Deck", "Valuation Range Matrix"], portfolioImpact: "Establishes CFO / Partner level financial leadership." }
        ],
        recommendedCertifications: [
          { name: "Certified Treasury Professional (CTP)", issuer: "AFP", relevance: "Executive Treasury Standard", estimatedCost: "$800" }
        ],
        books: [{ title: "The CFO Guidebook", author: "Steven M. Bragg", whyRead: "Comprehensive manual for chief financial officers." }],
        courses: [{ title: "Chief Financial Officer Program", platform: "Columbia Business School", urlOrProvider: "Columbia", type: "Paid" }],
        practicePlatforms: [{ name: "AICPA Executive Learning", focus: "Corporate Governance & Financial Strategy" }],
        interviewPreparation: [
          { topic: "CFO Executive Board Strategy", keyQuestions: ["How do you communicate bad quarterly earnings to investors?", "Walk me through an S-1 filing process."], strategy: "Display investor relations poise, transparency, and strategic vision." }
        ],
        portfolioTasks: ["Deliver S-1 IPO registration prospectus", "Present investor roadshow deck", "Formulate 5-year capital allocation strategy"],
        networkingSuggestions: ["Connect with private equity general partners and board chairs", "Speak at CFO Leadership Conferences", "Write market commentary for financial journals"],
        jobApplicationStrategy: ["Engage executive search consultants", "Apply for CFO, VP Finance, or Managing Director roles", "Structure executive equity, carried interest, and compensation terms"]
      }
    };
  }

  // 4. Skilled Trades, Civil / Mechanical / Electrical Engineering
  if (r.includes("electric") || r.includes("plumb") || r.includes("hvac") || r.includes("civil") || r.includes("mech") || r.includes("construct") || r.includes("arch") || ind.includes("construct") || ind.includes("trade") || ind.includes("engineering")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Blueprints, Safety Standards & Diagnostic Fundamentals",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master schematic blueprint reading, National Electrical/Building Codes, multimeter diagnostics, and OSHA safety standards.",
        learningTopics: ["Blueprint Reading & Architectural Schematics", "National Electrical Code (NEC) / Building Regulations", "Circuit Theory & Multimeter Diagnostics", "Power Tool Safety & OSHA Standards", "CAD Fundamentals (AutoCAD 2D)"],
        recommendedTools: ["AutoCAD 2D/3D", "Fluke Digital Multimeter", "Hand & Power Tools", "Revit BIM Basics", "OSHA Safety Guidelines"],
        recommendedProjects: [
          { title: "Residential Single-Line Layout & Load Calculation", description: "Design 2,500 sq ft residential electrical distribution scheme meeting NEC safety standards.", keyDeliverables: ["Single-Line Diagram", "Load Calculation Sheet", "Panel Schedule"], portfolioImpact: "Proves practical trade knowledge and code compliance." }
        ],
        recommendedCertifications: [
          { name: "OSHA 30-Hour Construction Safety Card", issuer: "OSHA / Department of Labor", relevance: "Essential Site Standard", estimatedCost: "$160" },
          { name: "Apprentice / Journeyman Trade License", issuer: "State Licensing Board", relevance: "Mandatory Practice License", estimatedCost: "$150" }
        ],
        books: [{ title: "Ugly's Electrical References", author: "Charles R. Miller", whyRead: "Essential pocket reference for trade professionals." }],
        courses: [{ title: "Introduction to Engineering Mechanics", platform: "Coursera / Georgia Tech", urlOrProvider: "Georgia Tech", type: "Free" }],
        practicePlatforms: [{ name: "Interplay Learning Trades Simulators", focus: "Virtual HVAC & Electrical Troubleshooting" }],
        interviewPreparation: [
          { topic: "Site Safety & Troubleshooting", keyQuestions: ["How do you troubleshoot a tripped circuit breaker?", "Walk me through OSHA lock-out/tag-out procedures."], strategy: "Prioritize human safety, systematic diagnostic isolation, and code adherence." }
        ],
        portfolioTasks: ["Create CAD single-line electrical schematic", "Complete OSHA 30 safety compliance log", "Perform panel load balancing calculation"],
        networkingSuggestions: ["Join local trade union or contractor association", "Connect with senior Journeymen and Master Electricians", "Attend local trade tool expos"],
        jobApplicationStrategy: ["Apply for Apprentice, Technician, or Field Engineering positions", "Highlight hands-on shop or field log hours", "Submit applications to regional contracting firms"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "PLC Automation, 3D CAD/BIM & Field Execution",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Master PLC ladder logic, 3D SolidWorks/Revit modeling, and building automation control systems.",
        learningTopics: ["Programmable Logic Controllers (PLC Wiring & Ladder Logic)", "3D Mechanical Design & Finite Element Analysis (FEA)", "Building Information Modeling (BIM)", "HVAC Load Estimation & Psychrometrics", "Construction Estimating & Quantity Surveying"],
        recommendedTools: ["SolidWorks", "Autodesk Revit BIM", "Siemens TIA Portal / Allen-Bradley PLC", "RSLogix 5000", "Procore Construction Management"],
        recommendedProjects: [
          { title: "Industrial Motor Control & PLC Automation Panel", description: "Wire and program a PLC-driven motor control cabinet with safety interlocks and HMI screen.", keyDeliverables: ["Ladder Logic Code", "Cabinet Wiring Diagram", "Bill of Materials"], portfolioImpact: "Demonstrates advanced industrial automation and trade skill." }
        ],
        recommendedCertifications: [
          { name: "FE (Fundamentals of Engineering) Exam", issuer: "NCEES", relevance: "First Step to Professional Engineer License", estimatedCost: "$225" },
          { name: "EPA 608 Universal Certification (HVAC)", issuer: "EPA", relevance: "Mandatory Refrigerant License", estimatedCost: "$150" }
        ],
        books: [{ title: "Shigley's Mechanical Engineering Design", author: "Richard G. Budynas", whyRead: "Definitive textbook on mechanical component design." }],
        courses: [{ title: "3D CAD Fundamental Design", platform: "Coursera / Autodesk", urlOrProvider: "Autodesk", type: "Free" }],
        practicePlatforms: [{ name: "NCEES Exam Practice Drills", focus: "FE & PE Engineering Exam Questions" }],
        interviewPreparation: [
          { topic: "PLC Logic & BIM Clash Detection", keyQuestions: ["Explain how you debug a PLC ladder logic loop.", "How do you resolve BIM structural clashes?"], strategy: "Demonstrate methodical technical troubleshooting and software fluency." }
        ],
        portfolioTasks: ["Publish PLC ladder logic program", "Build 3D Revit BIM building model", "Conduct HVAC psychrometric load analysis"],
        networkingSuggestions: ["Join IEEE, ASME, or ASCE local professional chapters", "Attend BIM and industrial automation expos", "Connect with project managers at general contracting firms"],
        jobApplicationStrategy: ["Target Journeyman, Automation Specialist, or Field Engineer roles", "Include CAD/BIM portfolio link in application", "Leverage trade union placement offices"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "PE Licensure, High-Voltage Systems & Project Management",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Achieve Professional Engineer (PE) or Master Contractor status, and lead multi-million dollar project execution using Primavera P6.",
        learningTopics: ["Structural Analysis & Geotechnical Engineering", "High-Voltage Distribution & Transformer Testing", "SCADA Systems & Industrial Control Networks", "Construction Project Scheduling (Primavera P6)", "Energy Audit & LEED Certification"],
        recommendedTools: ["Primavera P6", "ETAP Electrical Power System Analysis", "ANSYS Mechanical", "ETABS Structural"],
        recommendedProjects: [
          { title: "Multi-Storey Structural Load & Electrical Distribution Design", description: "Conduct structural FEA and electrical load distribution for a 5-storey commercial building.", keyDeliverables: ["Structural FEA Report", "ETAP Power Grid Simulation", "Primavera P6 Schedule"], portfolioImpact: "Proves senior engineering project delivery capability." }
        ],
        recommendedCertifications: [
          { name: "PE (Professional Engineer) License", issuer: "NCEES / State Board", relevance: "Gold Standard Engineering License", estimatedCost: "$350" },
          { name: "Master Electrician / Contractor License", issuer: "State Licensing Board", relevance: "Full Trade Contracting Credential", estimatedCost: "$300" }
        ],
        books: [{ title: "Standard Handbook for Civil Engineers", author: "Jonathan T. Ricketts", whyRead: "Comprehensive engineering reference guide." }],
        courses: [{ title: "Construction Management Specialization", platform: "Coursera / Columbia", urlOrProvider: "Columbia", type: "Free" }],
        practicePlatforms: [{ name: "SolidWorks CSWP Practice", focus: "Certified SolidWorks Professional Modeling" }],
        interviewPreparation: [
          { topic: "Project Management & Code Compliance", keyQuestions: ["How do you manage project delays and liquidated damages?", "Walk me through an ETAP power grid simulation."], strategy: "Emphasize budget management, schedule adherence, and zero safety violations." }
        ],
        portfolioTasks: ["Deliver full ETAP power distribution audit", "Create Primavera P6 master construction schedule", "Complete LEED energy efficiency report"],
        networkingSuggestions: ["Connect with Senior Project Directors and Firm Principals", "Speak at regional engineering and construction conferences", "Join AGC (Associated General Contractors) committees"],
        jobApplicationStrategy: ["Target Senior Project Engineer, Master Contractor, or Construction Manager roles", "Highlight PE stamp capability and project budget history", "Negotiate project completion bonuses"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Master Contracting, Megaprojects & Executive Leadership",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself as Director of Engineering, Chief Construction Officer, or Founder of a master contracting enterprise.",
        learningTopics: ["Chief Engineering Management & Construction Contracts", "Enterprise Asset Management & Maintenance Reliability", "Sustainable Building Standards & Net-Zero Energy", "Dispute Resolution & Field Audit Leadership"],
        recommendedTools: ["Autodesk Construction Cloud", "Maximo Asset Management", "Navisworks Manage"],
        recommendedProjects: [
          { title: "Enterprise Megaproject Master Plan & Field Safety Audit", description: "Oversee $20M infrastructure project execution including BIM clash detection and safety compliance.", keyDeliverables: ["BIM Clash Audit Report", "Master Project Plan", "Safety Compliance Dossier"], portfolioImpact: "Establishes Director of Engineering / Master Contractor leadership." }
        ],
        recommendedCertifications: [
          { name: "Project Management Professional (PMP)", issuer: "PMI", relevance: "Global Project Management Benchmark", estimatedCost: "$405" },
          { name: "LEED AP Building Design + Construction", issuer: "USGBC", relevance: "Top Sustainability Credential", estimatedCost: "$350" }
        ],
        books: [{ title: "Project Management for Construction", author: "Chris Hendrickson", whyRead: "Guide to managing large-scale construction projects." }],
        courses: [{ title: "Executive Engineering Management", platform: "edX / MIT", urlOrProvider: "MIT", type: "Paid" }],
        practicePlatforms: [{ name: "PMI Learning Hub", focus: "PMP & Construction Leadership Scenarios" }],
        interviewPreparation: [
          { topic: "Executive Megaproject Leadership", keyQuestions: ["How do you manage $50M+ capital construction risks?", "Describe your dispute resolution strategy with sub-contractors."], strategy: "Display executive poise, legal acumen, and operational efficiency." }
        ],
        portfolioTasks: ["Deliver $20M megaproject master plan", "Publish sustainable building net-zero framework", "Structure corporate safety manual"],
        networkingSuggestions: ["Join Executive Construction Roundtables", "Connect with infrastructure developers and government officials", "Keynote at global engineering summits"],
        jobApplicationStrategy: ["Engage executive engineering headhunters", "Target VP Engineering, Chief Construction Officer, or Principal Partner roles", "Structure equity, profit-sharing, and executive package"]
      }
    };
  }

  // 5. Education & Teaching
  if (r.includes("teacher") || r.includes("educat") || r.includes("school") || r.includes("profess") || r.includes("lectur") || r.includes("instruct") || ind.includes("educat")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Pedagogy, Lesson Planning & Classroom Management",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master lesson planning using Bloom's Taxonomy, classroom engagement strategies, and formative assessment methods.",
        learningTopics: ["Pedagogical Foundations & Learning Theories", "Lesson Planning & Curriculum Alignment", "Classroom Management Strategies", "Bloom's Taxonomy & Formative Assessment", "Student Engagement & Differentiated Instruction"],
        recommendedTools: ["Canvas LMS", "Google Classroom", "Blackboard Learn", "Nearpod", "Kahoot / Quizlet"],
        recommendedProjects: [
          { title: "4-Week Curriculum & Formative Assessment Plan", description: "Design a unit curriculum with clear learning objectives, rubrics, and interactive class activities.", keyDeliverables: ["Unit Syllabus", "4 Lesson Plans", "Grading Rubrics"], portfolioImpact: "Proves lesson preparation and structured teaching competence." }
        ],
        recommendedCertifications: [
          { name: "State Educator Teaching License / Credential", issuer: "State Board of Education", relevance: "Mandatory School Teaching License", estimatedCost: "$200" },
          { name: "Google Certified Educator Level 1", issuer: "Google for Education", relevance: "High EdTech Credential", estimatedCost: "$10" }
        ],
        books: [{ title: "The First Days of School", author: "Harry K. Wong", whyRead: "Classic handbook on classroom management and lesson organization." }],
        courses: [{ title: "Foundations of Teaching for Learning", platform: "Coursera / Commonwealth", urlOrProvider: "Commonwealth of Learning", type: "Free" }],
        practicePlatforms: [{ name: "Praxis Subject Prep QBank", focus: "Teacher Licensing Subject Knowledge Exams" }],
        interviewPreparation: [
          { topic: "Classroom Management & Pedagogy", keyQuestions: ["How do you handle a disruptive student?", "Walk me through how you differentiate instruction for diverse learners."], strategy: "Emphasize proactive classroom management, positive reinforcement, and student empathy." }
        ],
        portfolioTasks: ["Publish 4-week unit syllabus", "Design student grading rubric", "Build Google Classroom course module"],
        networkingSuggestions: ["Join State Teachers Association", "Connect with school principal alumni", "Participate in local education workshops"],
        jobApplicationStrategy: ["Target public and private school teaching positions", "Submit sample lesson plans with applications", "Attend school district job fairs"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Instructional Design & E-Learning Technology",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Build interactive e-learning modules with Articulate 360/Canvas, and master data-driven student outcome analysis.",
        learningTopics: ["Instructional Design & E-Learning Authoring", "Educational Psychology & Special Education Integration", "Data-Driven Student Outcome Tracking", "Blended Learning & Hybrid Classroom Management", "Parent-Teacher Stakeholder Communication"],
        recommendedTools: ["Articulate 360 / Storyline", "CamStudio / Loom", "Edpuzzle", "Padlet", "Turnitin"],
        recommendedProjects: [
          { title: "Interactive E-Learning Course Module & Outcomes Audit", description: "Build an interactive online learning module using Articulate/Canvas with built-in analytics.", keyDeliverables: ["E-Learning SCORM Module", "Student Assessment Dataset", "Outcome Analysis Report"], portfolioImpact: "Demonstrates modern instructional technology skills." }
        ],
        recommendedCertifications: [
          { name: "National Board Certification (NBCT) Candidate", issuer: "NBPTS", relevance: "Gold Standard Teaching Excellence", estimatedCost: "$475" }
        ],
        books: [{ title: "Teach Like a Champion 3.0", author: "Doug Lemov", whyRead: "63 concrete techniques for building student engagement." }],
        courses: [{ title: "Instructional Design Foundations", platform: "Coursera / Illinois", urlOrProvider: "Univ of Illinois", type: "Free" }],
        practicePlatforms: [{ name: "Edutopia Professional Learning", focus: "Evidence-Based Classroom Case Studies" }],
        interviewPreparation: [
          { topic: "Instructional Technology & Data", keyQuestions: ["How do you use assessment data to modify your instruction?", "Describe a time you integrated technology effectively."], strategy: "Focus on measurable student growth and learning engagement metrics." }
        ],
        portfolioTasks: ["Author interactive SCORM e-learning module", "Conduct student learning outcome data analysis", "Build parent communication portal guide"],
        networkingSuggestions: ["Join Association for Supervision and Curriculum Development (ASCD)", "Attend EdTech conferences", "Connect with Instructional Designers"],
        jobApplicationStrategy: ["Apply for Lead Teacher, Department Chair, or Instructional Designer roles", "Highlight EdTech and e-learning portfolio", "Leverage district referral networks"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Curriculum Reform & Educational Administration",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Lead curriculum reform, school district equity programs, and prepare for administrator/principal licensure.",
        learningTopics: ["School Leadership & Departmental Management", "Curriculum Reform & Educational Policy", "Grant Writing & Academic Research", "Special Needs & Inclusive Education Policy", "Institutional Accreditation Standards"],
        recommendedTools: ["PowerSchool SIS", "Infinite Campus", "Qualtrics Research", "SPSS Academic"],
        recommendedProjects: [
          { title: "School District Curriculum Audit & Equity Improvement Plan", description: "Audit math/reading proficiency data across 1,000 students and propose targeted intervention strategies.", keyDeliverables: ["Curriculum Audit Report", "Intervention Flowchart", "School Board Presentation"], portfolioImpact: "Shows academic leadership and administrative readiness." }
        ],
        recommendedCertifications: [
          { name: "Certified Educational Leader / Principal License", issuer: "State Board of Education", relevance: "School Administration Credential", estimatedCost: "$350" }
        ],
        books: [{ title: "Understanding by Design", author: "Grant Wiggins", whyRead: "Framework for designing curriculum backwards from desired results." }],
        courses: [{ title: "Educational Leadership & School Management", platform: "edX / Harvard", urlOrProvider: "Harvard", type: "Paid" }],
        practicePlatforms: [{ name: "ASCD Leadership Hub", focus: "School Administration & Policy Drills" }],
        interviewPreparation: [
          { topic: "School Administration & Board Leadership", keyQuestions: ["How do you manage faculty resistance to curriculum changes?", "How do you allocate district educational budgets?"], strategy: "Demonstrate collaborative leadership, policy awareness, and fiscal responsibility." }
        ],
        portfolioTasks: ["Deliver school district curriculum audit", "Author educational grant proposal", "Present equity improvement plan to school board"],
        networkingSuggestions: ["Connect with Superintendents and School Board Members", "Join National Association of Secondary School Principals (NASSP)", "Present at state education conferences"],
        jobApplicationStrategy: ["Target Assistant Principal, Principal, or Curriculum Director positions", "Highlight district-wide metric improvements", "Negotiate administrative salary scale"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Institutional Strategy & Higher Education Policy",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for School Superintendent, University Dean, or Chief Academic Officer leadership.",
        learningTopics: ["Institutional Strategy & Educational Policy Drafting", "Higher Education Governance & Accreditation", "Faculty Mentorship & Tenured Research Management", "Educational Endowment & Grant Leadership"],
        recommendedTools: ["Ellucian Banner", "Workday Education", "Canvas Admin Portal"],
        recommendedProjects: [
          { title: "Institutional Accreditation Dossier & Strategic Growth Plan", description: "Lead regional university/school accreditation self-study review across 12 academic departments.", keyDeliverables: ["Accreditation Report", "Faculty Development Plan", "Trustee Presentation"], portfolioImpact: "Establishes Dean / Superintendent level academic authority." }
        ],
        recommendedCertifications: [
          { name: "Doctor of Education (Ed.D.) / Ph.D.", issuer: "Accredited University", relevance: "Terminal Academic Credential", estimatedCost: "Degree" }
        ],
        books: [{ title: "How College Works", author: "Daniel F. Chambliss", whyRead: "Insightful study into institutional higher education success." }],
        courses: [{ title: "Higher Education Administration", platform: "Coursera / Penn", urlOrProvider: "UPenn", type: "Paid" }],
        practicePlatforms: [{ name: "Chronicle of Higher Education Hub", focus: "Executive Academic Leadership" }],
        interviewPreparation: [
          { topic: "Executive Academic Leadership", keyQuestions: ["How do you lead a multi-million dollar university endowment capital campaign?", "Walk me through an institutional accreditation crisis."], strategy: "Display vision, stakeholder alignment, and academic integrity." }
        ],
        portfolioTasks: ["Deliver university accreditation self-study dossier", "Publish educational policy white paper", "Structure faculty tenure framework"],
        networkingSuggestions: ["Connect with University Trustees and State Education Commissioners", "Keynote at global education summits", "Write for Chronicle of Higher Education"],
        jobApplicationStrategy: ["Engage executive academic search consultants", "Target Dean, Provost, Superintendent, or CAO positions", "Structure executive academic contracts"]
      }
    };
  }

  // 6. Business, Product, Marketing, Sales & Management
  if (r.includes("product") || r.includes("market") || r.includes("sales") || r.includes("biz") || r.includes("business") || r.includes("consult") || r.includes("manager") || ind.includes("business") || ind.includes("market")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Product Requirements, Customer Discovery & Funnels",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master user discovery interviews, drafting PRDs, market research, and core growth funnels.",
        learningTopics: ["Product Lifecycle Management & PRD Drafting", "Customer Discovery & User Interviewing", "Market Research & Competitive Intelligence", "Conversion Rate Optimization (CRO)", "Agile Scrum & Kanban Fundamentals"],
        recommendedTools: ["Figma / Miro", "Jira Software & Confluence", "Google Analytics 4", "HubSpot CRM", "Mixpanel / Amplitude"],
        recommendedProjects: [
          { title: "Product Requirements Document (PRD) & User Interview Case Study", description: "Conduct 15 customer discovery interviews and author an end-to-end PRD for a mobile application feature.", keyDeliverables: ["PRD Document", "User Interview Insights Matrix", "Figma Wireframe Deck"], portfolioImpact: "Proves core product management and user empathy skills." }
        ],
        recommendedCertifications: [
          { name: "Certified Scrum Product Owner (CSPO) / PSPO I", issuer: "Scrum Alliance / Scrum.org", relevance: "Core Agile Product License", estimatedCost: "$300" },
          { name: "HubSpot Inbound Marketing Certification", issuer: "HubSpot Academy", relevance: "High Marketing Credential", estimatedCost: "Free" }
        ],
        books: [{ title: "Inspired: How to Create Tech Products Customers Love", author: "Marty Cagan", whyRead: "Definitive product management playbook." }],
        courses: [{ title: "Becoming a Product Manager", platform: "LinkedIn Learning / Coursera", urlOrProvider: "Top Instructors", type: "Free" }],
        practicePlatforms: [{ name: "Exponent (TryExponent)", focus: "Product Management & Business Case Interviews" }],
        interviewPreparation: [
          { topic: "Product Sense & User Interviewing", keyQuestions: ["How do you prioritize feature requests?", "Improve your favorite mobile application."], strategy: "Follow Framework: User Persona -> Pain Points -> Solution Options -> Success Metrics." }
        ],
        portfolioTasks: ["Publish PRD for a mobile app feature", "Build Figma wireframe prototype", "Create Google Analytics 4 conversion funnel"],
        networkingSuggestions: ["Join Product School and Mind the Product communities", "Connect with Associate Product Managers on LinkedIn", "Attend local product meetups"],
        jobApplicationStrategy: ["Target Associate Product Manager, Growth Marketer, or Business Analyst roles", "Attach PRD case studies to applications", "Apply to tech startups and digital agencies"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "GTM Strategy, Unit Economics & Conversion Analytics",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Focus on GTM launch campaigns, CAC/LTV unit economics, A/B testing, and sales conversion pipelines.",
        learningTopics: ["Growth Marketing & CAC/LTV Unit Economics", "A/B Testing & Hypothesis Validation", "Go-To-Market (GTM) Launch Strategy", "Funnel Conversion Analytics", "Pricing Strategy & Monetization Models"],
        recommendedTools: ["Optimizely / VWO", "Salesforce CRM", "Tableau / Looker", "Notion Product Hub", "Google Tag Manager"],
        recommendedProjects: [
          { title: "Go-To-Market (GTM) Strategy & Conversion Campaign", description: "Design launch funnel and paid customer acquisition campaign targeting $50k ARR growth.", keyDeliverables: ["GTM Pitch Deck", "A/B Test Analytics Matrix", "Unit Economic Model"], portfolioImpact: "Demonstrates growth marketing and business revenue orientation." }
        ],
        recommendedCertifications: [
          { name: "Project Management Professional (PMP)", issuer: "PMI", relevance: "Gold Standard Management Credential", estimatedCost: "$405" },
          { name: "Google Analytics 4 Individual Qualification", issuer: "Google", relevance: "Standard Analytics Certification", estimatedCost: "Free" }
        ],
        books: [{ title: "Lean Analytics", author: "Alistair Croll", whyRead: "Mastering metrics that matter for business growth." }],
        courses: [{ title: "Digital Product Management", platform: "Coursera / Darden", urlOrProvider: "Univ of Virginia", type: "Free" }],
        practicePlatforms: [{ name: "Reforge Case Studies", focus: "Growth, Product & Monetization Strategy" }],
        interviewPreparation: [
          { topic: "Product Execution & Metrics", keyQuestions: ["How do you measure success for Instagram Stories?", "A key metric dropped by 10%. How do you diagnose it?"], strategy: "Break metrics down into Acquisition, Activation, Retention, Referral, Revenue (AARRR)." }
        ],
        portfolioTasks: ["Deliver full Go-To-Market launch playbook", "Build CAC/LTV unit economic calculator", "Conduct A/B testing experiment case study"],
        networkingSuggestions: ["Participate in ProductTank meetups", "Connect with Senior PMs and Growth Leads", "Engage in Reforge community discussions"],
        jobApplicationStrategy: ["Apply for Product Manager, Growth Lead, or Marketing Manager roles", "Include live GTM case study in application portfolio", "Leverage product management referral networks"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Enterprise Platform Strategy & Churn Prevention",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Master enterprise product roadmapping, churn diagnostics, cross-functional stakeholder alignment, and B2B pricing.",
        learningTopics: ["Enterprise Product Portfolio Management", "Cross-Functional Executive Alignment", "Strategic Mergers & Strategic Partnerships", "Enterprise Sales Pipeline Architecture", "Churn Reduction & Customer Retention Strategy"],
        recommendedTools: ["Productboard", "Salesforce Revenue Cloud", "Gainsight Customer Success", "Snowflake Business Intelligence"],
        recommendedProjects: [
          { title: "Enterprise Platform Roadmap & Churn Prevention Overhaul", description: "Analyze 10,000 user activity logs to reduce annual churn rate by 4.2% across enterprise tiers.", keyDeliverables: ["Product Roadmap Deck", "Churn Diagnostics Dashboard", "Executive Strategy Brief"], portfolioImpact: "Proves senior product and revenue leadership." }
        ],
        recommendedCertifications: [
          { name: "SAFe Product Manager / Product Owner (POPM)", issuer: "Scaled Agile", relevance: "Top Enterprise Scaling Credential", estimatedCost: "$595" }
        ],
        books: [{ title: "Escaping the Build Trap", author: "Melissa Perri", whyRead: "How effective product management creates real value." }],
        courses: [{ title: "Product Strategy", platform: "Kellogg Executive Education", urlOrProvider: "Northwestern", type: "Paid" }],
        practicePlatforms: [{ name: "Product School Case Study Library", focus: "Executive Product & Business Strategy" }],
        interviewPreparation: [
          { topic: "Product Strategy & Executive Alignment", keyQuestions: ["How do you balance tech debt vs strategic features?", "Design a 3-year product strategy for a legacy enterprise platform."], strategy: "Align product outcomes with company financial targets and competitive moat." }
        ],
        portfolioTasks: ["Publish 3-year enterprise product roadmap", "Build churn diagnostics dashboard", "Deliver B2B pricing strategy analysis"],
        networkingSuggestions: ["Connect with VPs of Product and Chief Revenue Officers", "Attend Product Leader Summits", "Write strategic breakdown essays on LinkedIn"],
        jobApplicationStrategy: ["Target Group Product Manager, Senior PM, or Director of Product roles", "Highlight portfolio revenue and ARR expansion metrics", "Negotiate equity and bonus packages"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "CPO / CMO Executive Leadership & Global Expansion",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Chief Product Officer (CPO), Chief Marketing Officer (CMO), or General Manager executive roles.",
        learningTopics: ["Chief Product / Marketing Officer Leadership", "Corporate Mergers & Portfolio Restructuring", "Executive Board Communications", "Global Brand Strategy & Crisis Response"],
        recommendedTools: ["Gartner Market Research", "Forrester Wave Analytics", "Workday Executive Management"],
        recommendedProjects: [
          { title: "Global Market Expansion & Product Portfolio Strategy", description: "Formulate 3-year product expansion playbook into APAC/EMEA markets targeting $10M new ARR.", keyDeliverables: ["Expansion Strategy Prospectus", "Board Pitch Deck", "Financial Forecast Model"], portfolioImpact: "Establishes C-Suite Product/Marketing Executive authority." }
        ],
        recommendedCertifications: [
          { name: "Executive Chief Product Officer Program", issuer: "INSEAD / Wharton", relevance: "Elite Executive Benchmark", estimatedCost: "$2,500" }
        ],
        books: [{ title: "The Hard Thing About Hard Things", author: "Ben Horowitz", whyRead: "Unfiltered insights on building and leading businesses." }],
        courses: [{ title: "Executive Product Leadership", platform: "Stanford Executive Education", urlOrProvider: "Stanford", type: "Paid" }],
        practicePlatforms: [{ name: "McKinsey Business Case Library", focus: "Executive Case Interview & Strategic Leadership" }],
        interviewPreparation: [
          { topic: "C-Suite Executive Leadership & Board Advisory", keyQuestions: ["How do you pivot an entire enterprise product portfolio?", "Describe your M&A product integration blueprint."], strategy: "Focus on corporate valuation, market dominance, and shareholder value." }
        ],
        portfolioTasks: ["Deliver $10M ARR global product expansion playbook", "Present board strategy deck", "Structure enterprise M&A product integration plan"],
        networkingSuggestions: ["Connect with Venture Capital Partners and Tech Board Chairs", "Keynote at global Product summits", "Write strategic commentary for Forbes / Harvard Business Review"],
        jobApplicationStrategy: ["Engage executive search firms", "Apply for CPO, CMO, VP Product, or GM roles", "Structure executive compensation, stock options, and severance terms"]
      }
    };
  }

  // 7. AI / Machine Learning / Deep Learning / Data Science / NLP
  if (r.includes("ai") || r.includes("machine learning") || r.includes("ml") || r.includes("data sci") || r.includes("nlp") || r.includes("deep learning") || r.includes("computer vision")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Math Foundations, Python & Data Preprocessing",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master Python data science libraries (numpy, pandas, scikit-learn), linear algebra, and data cleaning before building neural nets.",
        learningTopics: ["Linear Algebra & Matrix Calculus", "Python Data Science Stack (NumPy, Pandas)", "Exploratory Data Analysis (EDA)", "Supervised Machine Learning (Regression, Classification)", "Model Evaluation Metrics (F1, ROC-AUC)"],
        recommendedTools: ["JupyterLab / Google Colab", "Python 3.11", "Scikit-Learn", "Pandas & NumPy", "Matplotlib / Seaborn"],
        recommendedProjects: [
          { title: "Predictive Analytics & Model Benchmark Suite", description: "Build automated pipeline for data cleaning, feature engineering, and cross-validated baseline modeling.", keyDeliverables: ["Jupyter Notebook", "Feature Importance Plot", "Scikit-Learn Pipeline"], portfolioImpact: "Proves mathematical and machine learning fundamentals." }
        ],
        recommendedCertifications: [
          { name: "Supervised Machine Learning Specialization", issuer: "DeepLearning.AI / Stanford", relevance: "Gold Standard AI Entry", estimatedCost: "Free / $49/mo" }
        ],
        books: [{ title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", author: "Aurélien Géron", whyRead: "Practical, industry-standard machine learning guide." }],
        courses: [{ title: "Machine Learning Specialization", platform: "Coursera / Stanford", urlOrProvider: "Andrew Ng", type: "Free" }],
        practicePlatforms: [{ name: "Kaggle", focus: "Tabular Competitions & Exploratory Notebooks" }],
        interviewPreparation: [
          { topic: "Machine Learning Math & Algorithms", keyQuestions: ["Explain Bias-Variance Tradeoff.", "How does Gradient Descent minimize loss?"], strategy: "Derive loss functions clearly and explain regularization methods." }
        ],
        portfolioTasks: ["Publish Kaggle notebook with 100+ votes", "Build custom data preprocessing package", "Create baseline model comparison benchmark"],
        networkingSuggestions: ["Join Kaggle community and PyData local chapters", "Connect with ML Engineers on LinkedIn", "Attend AI research webinars"],
        jobApplicationStrategy: ["Target Junior ML Engineer, Data Analyst, or AI Research Assistant roles", "Link clean Kaggle and GitHub notebooks in resume", "Apply to tech companies building AI products"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Deep Learning, PyTorch & RAG Architectures",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Focus on PyTorch tensor operations, Transformer architectures, Fine-tuning LLMs, and Retrieval-Augmented Generation (RAG).",
        learningTopics: ["PyTorch Tensor Dynamics & Custom Layers", "Convolutional & Recurrent Neural Networks", "Transformer Architecture & Self-Attention Mechanisms", "Vector Databases & RAG Pipelines", "HuggingFace Transformers & Parameter-Efficient Fine-Tuning (LoRA)"],
        recommendedTools: ["PyTorch 2.x", "HuggingFace Transformers", "LangChain / LlamaIndex", "Pinecone / ChromaDB", "Weights & Biases"],
        recommendedProjects: [
          { title: "Enterprise Knowledge Base RAG Assistant", description: "Engineered multi-modal Retrieval-Augmented Generation system over thousands of PDF documents using PyTorch and Vector DB.", keyDeliverables: ["Vector Search Engine", "PyTorch LLM Wrapper", "Streamlit UI"], portfolioImpact: "Demonstrates high-demand generative AI engineering competence." }
        ],
        recommendedCertifications: [
          { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", relevance: "Industry Core Credential", estimatedCost: "Free / $49/mo" },
          { name: "AWS Certified Machine Learning - Specialty", issuer: "AWS", relevance: "Top Enterprise Cloud AI Standard", estimatedCost: "$300" }
        ],
        books: [{ title: "Designing Machine Learning Systems", author: "Chip Huyen", whyRead: "Essential blueprint for production ML pipelines." }],
        courses: [{ title: "Hugging Face NLP Course", platform: "Hugging Face", urlOrProvider: "Hugging Face", type: "Free" }],
        practicePlatforms: [{ name: "Papers With Code", focus: "Replicating State-of-the-Art Model Architectures" }],
        interviewPreparation: [
          { topic: "Deep Learning & Transformer Mechanics", keyQuestions: ["Walk me through Attention Mechanism equation.", "How does RAG differ from Model Fine-Tuning?"], strategy: "Explain trade-offs between context windows, latent space retrieval, and fine-tuning costs." }
        ],
        portfolioTasks: ["Deploy live RAG AI agent on Cloud Run / Vercel", "Publish open-source fine-tuned Hugging Face model", "Write technical blog breakdown of Transformer attention"],
        networkingSuggestions: ["Participate in AI hackathons (HackMIT, LabLab.ai)", "Connect with Applied AI Scientists", "Share model benchmarks on Twitter/LinkedIn"],
        jobApplicationStrategy: ["Apply for Machine Learning Engineer, AI Application Developer, or Data Scientist roles", "Highlight live AI API demo links", "Submit applications to AI-first startups"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "MLOps, Model Deployment & Distributed Training",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Master model quantization, TensorRT/vLLM serving, distributed multi-GPU training (DeepSpeed/FSDP), and automated MLOps pipelines.",
        learningTopics: ["MLOps Pipeline Automation (Kubeflow/MLflow)", "Distributed GPU Training (DeepSpeed/FSDP)", "Model Quantization & Inference Optimization (vLLM/TensorRT)", "Model Drift Monitoring & Continuous Training", "Enterprise AI Security & Prompt Injection Mitigation"],
        recommendedTools: ["vLLM / TensorRT", "Ray / Ray Train", "MLflow / Kubeflow", "Triton Inference Server", "Docker / Kubernetes"],
        recommendedProjects: [
          { title: "Distributed High-Throughput Model Serving Engine", description: "Engineered ultra-low latency inference microservice serving 1,000 requests/sec with vLLM, TensorRT, and Kubernetes.", keyDeliverables: ["Kubernetes Deployment Manifest", "TensorRT Optimization Pipeline", "Prometheus Latency Metrics"], portfolioImpact: "Proves enterprise-grade MLOps and AI infrastructure capability." }
        ],
        recommendedCertifications: [
          { name: "Google Professional Machine Learning Engineer", issuer: "Google Cloud", relevance: "Elite Cloud ML Credential", estimatedCost: "$200" }
        ],
        books: [{ title: "Deep Learning", author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville", whyRead: "The definitive textbook on deep learning theory." }],
        courses: [{ title: "Full Stack Deep Learning", platform: "FSDL / UC Berkeley", urlOrProvider: "FSDL", type: "Free" }],
        practicePlatforms: [{ name: "Triton & vLLM Documentation Labs", focus: "High-Throughput Model Serving Drills" }],
        interviewPreparation: [
          { topic: "ML System Design & MLOps", keyQuestions: ["Design a Recommendation System for Netflix", "How do you serve an 8B parameter model under 50ms latency?"], strategy: "Cover Data Pipeline -> Training -> Quantization -> Inference Serving -> Monitoring." }
        ],
        portfolioTasks: ["Publish open-source MLOps deployment boilerplate", "Benchmark vLLM vs Triton serving throughput", "Document multi-GPU distributed training setup"],
        networkingSuggestions: ["Present at local PyTorch / MLOps meetups", "Connect with AI Engineering Managers and Lead Scientists", "Contribute to open-source AI projects (LangChain, vLLM)"],
        jobApplicationStrategy: ["Target Senior ML Engineer, MLOps Specialist, or Lead AI Architect positions", "Demonstrate production inference throughput metrics", "Negotiate competitive equity & salary packages"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Enterprise AI Architecture & Research Leadership",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Principal AI Scientist, VP of AI, or Chief AI Officer roles overseeing multi-million dollar AI infrastructure.",
        learningTopics: ["Enterprise AI Governance & Ethics Strategy", "Multi-Modal Foundation Model Fine-Tuning", "AI Chip & Hardware Acceleration Strategy (H100/Groq)", "Executive AI Monetization & ROI Strategy"],
        recommendedTools: ["NVIDIA NeMo Framework", "Anyscale / Ray Cluster", "Databricks AI"],
        recommendedProjects: [
          { title: "Enterprise Foundation Model Architecture Strategy", description: "Design multi-agent autonomous enterprise framework reducing customer support overhead by 60%.", keyDeliverables: ["AI Governance White Paper", "Multi-Agent System Architecture", "Executive ROI Model"], portfolioImpact: "Establishes C-Suite AI authority and vision." }
        ],
        recommendedCertifications: [
          { name: "Executive Artificial Intelligence Program", issuer: "MIT Executive Education / Oxford", relevance: "Elite C-Suite Benchmark", estimatedCost: "$2,800" }
        ],
        books: [{ title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", whyRead: "Comprehensive foundational AI bible." }],
        courses: [{ title: "Stanford CS224N: Natural Language Processing with Deep Learning", platform: "Stanford University", urlOrProvider: "Stanford", type: "Free" }],
        practicePlatforms: [{ name: "NeurIPS / ICML Paper Reviews", focus: "State-of-the-Art AI Research & Frontier Model Analysis" }],
        interviewPreparation: [
          { topic: "Executive AI Vision & Strategic Alignment", keyQuestions: ["How do you evaluate buy vs build for enterprise AI models?", "Describe your AI safety governance framework."], strategy: "Align cutting-edge AI capability with business profitability and risk mitigation." }
        ],
        portfolioTasks: ["Publish AI research paper or enterprise white paper", "Keynote at national AI conference", "Lead enterprise AI strategy audit"],
        networkingSuggestions: ["Connect with AI Venture Capital Partners and CTOs", "Serve as peer reviewer for AI journals", "Write strategic AI opinion columns"],
        jobApplicationStrategy: ["Engage specialized AI executive search firms", "Apply for Head of AI, VP of Machine Learning, or CAO roles", "Structure executive compensation, equity, and IP licensing terms"]
      }
    };
  }

  // 8. Cybersecurity / Information Security / Ethical Hacking / SOC
  if (r.includes("cyber") || r.includes("sec") || r.includes("hack") || r.includes("pentest") || r.includes("soc") || ind.includes("security") || ind.includes("cyber")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Network Security, Linux & Threats",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Build solid network protocol mastery (TCP/IP, DNS, HTTP/S), Linux command line fluency, and baseline vulnerability assessment.",
        learningTopics: ["OSI Model & TCP/IP Protocol Analysis", "Linux Command Line & Shell Scripting", "Common Attack Vectors (OWASP Top 10)", "Network Packet Sniffing (Wireshark)", "CompTIA Security+ Core Domains"],
        recommendedTools: ["Wireshark", "Kali Linux", "Nmap Network Scanner", "Burp Suite Community", "Bash & Python"],
        recommendedProjects: [
          { title: "Network Audit & Vulnerability Scanning Dossier", description: "Perform authorized network scan and packet analysis across sandbox lab environment to identify unencrypted traffic.", keyDeliverables: ["Wireshark Packet Analysis", "Nmap Scan Dossier", "Vulnerability Audit Report"], portfolioImpact: "Proves hands-on network auditing and protocol mastery." }
        ],
        recommendedCertifications: [
          { name: "CompTIA Security+", issuer: "CompTIA", relevance: "Baseline Global Security Standard", estimatedCost: "$392" },
          { name: "Google Cybersecurity Professional Certificate", issuer: "Google / Coursera", relevance: "Strong Entry Credential", estimatedCost: "Free / $39/mo" }
        ],
        books: [{ title: "The Web Application Hacker's Handbook", author: "Dafydd Stuttard & Marcus Pinto", whyRead: "Definitive web penetration testing guide." }],
        courses: [{ title: "Introduction to Cybersecurity", platform: "Coursera / NYU", urlOrProvider: "NYU Tandon", type: "Free" }],
        practicePlatforms: [{ name: "TryHackMe", focus: "Pre-Security & Complete Beginner Modules" }],
        interviewPreparation: [
          { topic: "Network Security & Protocols", keyQuestions: ["Explain 3-way handshake in TCP.", "What is the difference between Symmetric and Asymmetric encryption?"], strategy: "Explain network packet flows clearly and state ports/protocols from memory." }
        ],
        portfolioTasks: ["Complete TryHackMe Top 10 Rooms badge", "Publish Nmap network scanning cheat sheet", "Build local Kali Linux security testing VM"],
        networkingSuggestions: ["Join local OWASP chapter and ISSA student section", "Participate in beginner CTF competitions", "Connect with Security Analysts on LinkedIn"],
        jobApplicationStrategy: ["Target Junior SOC Analyst, Information Security Assistant, or IT Security Specialist roles", "Highlight Security+ certification and TryHackMe ranks", "Apply to managed security service providers (MSSPs)"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "SIEM Operations, Penetration Testing & Incident Response",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Master SIEM log analysis (Splunk/Elastic), penetration testing with Metasploit/Burp Suite, and incident response playbooks.",
        learningTopics: ["SIEM Log Analysis & Threat Detection (Splunk)", "Web Application Penetration Testing", "Metasploit & Exploitation Frameworks", "Incident Response & Forensics Playbooks", "Cloud Security Configuration (AWS GuardDuty/IAM)"],
        recommendedTools: ["Splunk / Elastic SIEM", "Burp Suite Professional", "Metasploit Framework", "Autopsy Forensics", "AWS GuardDuty"],
        recommendedProjects: [
          { title: "SIEM Threat Detection & IR Playbook Suite", description: "Configure Splunk dashboard monitoring simulated brute-force and SQL injection attacks with automated alert playbooks.", keyDeliverables: ["Splunk Detection Rules", "Incident Response Playbook", "Attack Simulation Log"], portfolioImpact: "Demonstrates production SOC threat hunting and incident triage." }
        ],
        recommendedCertifications: [
          { name: "Offensive Security Certified Professional (OSCP)", issuer: "OffSec", relevance: "Gold Standard Penetration Testing", estimatedCost: "$1,649" },
          { name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", relevance: "Industry Recognized Benchmark", estimatedCost: "$1,199" }
        ],
        books: [{ title: "Practical Malware Analysis", author: "Michael Sikorski & Andrew Honig", whyRead: "Essential guide to reverse engineering malicious software." }],
        courses: [{ title: "Practical Ethical Hacking", platform: "TCM Security", urlOrProvider: "Heath Adams", type: "Paid" }],
        practicePlatforms: [{ name: "Hack The Box", focus: "Medium/Hard Retired Boxes & Pentesting Labs" }],
        interviewPreparation: [
          { topic: "Penetration Testing & SOC Incident Triage", keyQuestions: ["How do you remediate SQL Injection?", "Walk me through how you investigate a ransomware incident."], strategy: "Follow Containment -> Eradication -> Recovery -> Lessons Learned incident framework." }
        ],
        portfolioTasks: ["Reach Pro Hacker rank on Hack The Box", "Publish incident response playbook repository", "Author CVE writeup for lab vulnerability"],
        networkingSuggestions: ["Participate in DEFCON local groups (DCG) and BSides conferences", "Engage with Red Teamers / Blue Teamers on Twitter", "Join Security Discord servers"],
        jobApplicationStrategy: ["Apply for SOC Analyst L2, Penetration Tester, or Security Engineer positions", "Attach HTB/OSCP badges to resume", "Submit applications to financial and defense sectors"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Zero-Trust Architecture & Enterprise Threat Hunting",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on Zero-Trust network architecture, reverse engineering malware, DevSecOps pipeline automation, and regulatory audits (SOC2/ISO27001).",
        learningTopics: ["Zero-Trust Network Architecture & SASE", "Reverse Engineering & Malware Dissection", "DevSecOps CI/CD Pipeline Integration (Snyk/SonarQube)", "Enterprise Compliance (SOC2, ISO 27001, NIST CSF)", "Cloud Infrastructure Penetration Testing"],
        recommendedTools: ["Ghidra / IDA Pro", "Snyk / SonarQube", "Terraform Security (tfsec)", "CrowdStrike Falcon", "Wireshark Deep Inspection"],
        recommendedProjects: [
          { title: "Enterprise DevSecOps Pipeline & SOC2 Security Audit", description: "Implement automated static/dynamic vulnerability scanning in CI/CD pipeline reducing security debt by 85%.", keyDeliverables: ["DevSecOps Pipeline Script", "SOC2 Compliance Checklist", "Vulnerability Remediation PRs"], portfolioImpact: "Proves senior enterprise security engineering authority." }
        ],
        recommendedCertifications: [
          { name: "Certified Information Systems Security Professional (CISSP)", issuer: "ISC2", relevance: "Premier Senior Security Credential", estimatedCost: "$749" },
          { name: "Certified Information Security Manager (CISM)", issuer: "ISACA", relevance: "Top Security Management Standard", estimatedCost: "$575" }
        ],
        books: [{ title: "Building Secure and Reliable Systems", author: "Heather Adkins et al. (Google SRE Team)", whyRead: "Enterprise scale security design principles." }],
        courses: [{ title: "SANS SEC504: Hacker Tools, Techniques & Incident Handling", platform: "GIAC / SANS", urlOrProvider: "SANS Institute", type: "Paid" }],
        practicePlatforms: [{ name: "Blue Team Labs Online", focus: "Advanced SOC Threat Hunting & DFIR" }],
        interviewPreparation: [
          { topic: "Enterprise Security Architecture & Governance", keyQuestions: ["How do you implement Zero Trust in a legacy enterprise environment?", "Describe your strategy for securing multi-cloud infrastructure."], strategy: "Balance strict security policy controls with business usability." }
        ],
        portfolioTasks: ["Publish SOC2 compliance audit manual", "Deliver malware reverse engineering report", "Architect multi-cloud security blueprint"],
        networkingSuggestions: ["Speak at regional security conferences (BSides, RSA)", "Connect with CISOs and Directors of Information Security", "Mentor junior security analysts"],
        jobApplicationStrategy: ["Target Senior Security Engineer, Lead Pentester, or DevSecOps Architect roles", "Highlight CISSP/CISM credentials", "Leverage executive cybersecurity recruiters"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "CISO Executive Governance & Global Security Resilience",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Chief Information Security Officer (CISO) or VP of Cybersecurity executive leadership.",
        learningTopics: ["Chief Information Security Officer (CISO) Governance", "Cyber Risk Quantification (FAIR Framework)", "Executive Crisis Management & Board Communication", "Nation-State Threat Intelligence Analysis"],
        recommendedTools: ["Archer Risk Management", "CrowdStrike Horizon", "Palo Alto Panorama"],
        recommendedProjects: [
          { title: "Global Enterprise Cyber Resilience & CISO Strategy", description: "Formulate enterprise ransomware defense strategy and cyber risk quantification model protecting $500M assets.", keyDeliverables: ["CISO Strategy Prospectus", "Board Cyber Risk Report", "Incident Response Command Playbook"], portfolioImpact: "Establishes C-Suite Cybersecurity leadership." }
        ],
        recommendedCertifications: [
          { name: "Certified Chief Information Security Officer (CCISO)", issuer: "EC-Council", relevance: "Elite Executive CISO Standard", estimatedCost: "$1,500" }
        ],
        books: [{ title: "CISO Desk Reference Guide", author: "Bill Bonney et al.", whyRead: "Practical guidance for executive security leaders." }],
        courses: [{ title: "Cybersecurity Leadership", platform: "Harvard Kennedy School", urlOrProvider: "Harvard", type: "Paid" }],
        practicePlatforms: [{ name: "MITRE ATT&CK Framework Labs", focus: "Nation-State Threat Intelligence & Advanced Persistence" }],
        interviewPreparation: [
          { topic: "C-Suite Risk Management & Crisis Command", keyQuestions: ["How do you present cyber risk metrics to the Board of Directors?", "Describe your response during a catastrophic zero-day breach."], strategy: "Focus on financial exposure reduction, regulatory compliance, and brand protection." }
        ],
        portfolioTasks: ["Deliver CISO enterprise risk report", "Present cyber crisis simulation to board", "Structure zero-trust migration roadmap"],
        networkingSuggestions: ["Connect with CISO Executive Networks", "Keynote at global cybersecurity summits", "Write policy commentary for Dark Reading / SC Magazine"],
        jobApplicationStrategy: ["Engage executive cybersecurity search firms", "Apply for CISO, VP Information Security, or CSO roles", "Structure executive compensation and liability insurance terms"]
      }
    };
  }

  // 9. Frontend Engineer / Web Developer / UI UX Design
  if (r.includes("front") || r.includes("ui") || r.includes("ux") || r.includes("web design") || r.includes("react")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "HTML5, CSS3, Modern JavaScript & React Basics",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master semantic HTML5, CSS Flexbox/Grid, ES6+ JavaScript, and core React component lifecycle.",
        learningTopics: ["Semantic HTML5 & Accessibility (a11y)", "CSS3 Layouts (Flexbox, Grid, Responsive Media Queries)", "Modern JavaScript ES6+ (Promises, Async/Await, Array Methods)", "React 18 Component State & Hooks", "Tailwind CSS Utility First Styling"],
        recommendedTools: ["VS Code", "Chrome DevTools", "Figma", "Git & GitHub", "npm / Vite"],
        recommendedProjects: [
          { title: "Responsive Interactive Dashboard", description: "Build pixel-perfect, accessible Web application dashboard with dark/light themes and dynamic filtering.", keyDeliverables: ["React Component Code", "Tailwind Styling", "Lighthouse 95+ Audit"], portfolioImpact: "Proves modern web interface development skill." }
        ],
        recommendedCertifications: [
          { name: "Meta Front-End Developer Professional Certificate", issuer: "Meta / Coursera", relevance: "Gold Standard Entry Frontend Credential", estimatedCost: "Free / $39/mo" }
        ],
        books: [{ title: "Don't Make Me Think, Revisited", author: "Steve Krug", whyRead: "Essential manual for web usability and user experience." }],
        courses: [{ title: "The Complete JavaScript Course", platform: "Udemy", urlOrProvider: "Jonas Schmedtmann", type: "Paid" }],
        practicePlatforms: [{ name: "Frontend Mentor", focus: "Real-world HTML/CSS/JS Component Challenges" }],
        interviewPreparation: [
          { topic: "Frontend DOM & JavaScript Core", keyQuestions: ["Explain Event Delegation and Bubbling.", "Difference between let, const, and var."], strategy: "Explain closure, prototype chain, and browser rendering engine stages." }
        ],
        portfolioTasks: ["Achieve Lighthouse 95+ score on web project", "Build responsive navbar with mobile drawer", "Publish live demo on Vercel"],
        networkingSuggestions: ["Join local React / Frontend Meetups", "Share component code snippets on Twitter / LinkedIn", "Connect with Senior Frontend Developers"],
        jobApplicationStrategy: ["Target Junior Frontend Developer, Web Designer, or UI Developer roles", "Include live working links for all portfolio projects", "Apply to digital agencies and SaaS startups"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Next.js, State Management & Design Systems",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Master Next.js App Router, SSR/SSG rendering patterns, global state (Zustand/Redux), and custom reusable design systems.",
        learningTopics: ["Next.js 14 App Router & Server Components", "Global State Management (Zustand, Redux Toolkit, TanStack Query)", "Design Systems & Component Libraries (shadcn/ui, Radix)", "Web Performance & Core Web Vitals Optimization", "E2E Testing with Playwright / Cypress"],
        recommendedTools: ["Next.js", "Zustand / Redux", "shadcn/ui", "Playwright", "Storybook"],
        recommendedProjects: [
          { title: "Full-Stack E-Commerce Web Application", description: "Engineered high-performance Next.js application featuring server-side rendering, shopping cart state, and stripe payment integration.", keyDeliverables: ["Next.js Repository", "Storybook Component Library", "Stripe Checkout Flow"], portfolioImpact: "Demonstrates production full-stack frontend engineering mastery." }
        ],
        recommendedCertifications: [
          { name: "Google UX Design Professional Certificate", issuer: "Google / Coursera", relevance: "High UX/UI Design Benchmark", estimatedCost: "Free / $39/mo" }
        ],
        books: [{ title: "Refactoring UI", author: "Adam Wathan & Steve Schoger", whyRead: "Practical guide to designing beautiful interfaces." }],
        courses: [{ title: "Epic React", platform: "Kent C. Dodds", urlOrProvider: "Kent C. Dodds", type: "Paid" }],
        practicePlatforms: [{ name: "GreatFrontEnd", focus: "Frontend System Design & Coding Interview Questions" }],
        interviewPreparation: [
          { topic: "React Internals & Next.js Rendering", keyQuestions: ["How does React Virtual DOM reconciliation work?", "Explain SSR vs SSG vs ISR in Next.js."], strategy: "Detail component render cycles, memoization hooks, and bundle size reduction." }
        ],
        portfolioTasks: ["Publish open-source UI component library on npm", "Build Storybook documentation site", "Optimize LCP and CLS Core Web Vitals"],
        networkingSuggestions: ["Contribute to open-source React/Next.js repositories", "Participate in Next.js Conf", "Connect with Product Designers and Frontend Leads"],
        jobApplicationStrategy: ["Apply for Frontend Engineer, React Specialist, or UI/UX Engineer roles", "Highlight performance scores and npm package downloads", "Submit applications to high-growth tech companies"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Micro-Frontends, WebGL & Enterprise Architecture",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on Micro-Frontend architecture, WebGL/Three.js interactive graphics, complex animations, and web accessibility compliance.",
        learningTopics: ["Micro-Frontends & Module Federation", "WebGL, Three.js & Canvas Performance", "Complex Motion & Layout Animations (Framer Motion)", "Enterprise Web Accessibility (WCAG 2.1 AA Compliance)", "Frontend Infrastructure & Automated Build Tooling"],
        recommendedTools: ["Three.js / WebGL", "Module Federation", "Framer Motion", "Webpack / Turbopack", "Axe Accessibility"],
        recommendedProjects: [
          { title: "3D Interactive Product Visualizer & Design System", description: "Engineered 60fps WebGL product customization canvas integrated into enterprise design system with complete WCAG accessibility.", keyDeliverables: ["3D WebGL Canvas", "Module Federation Suite", "Accessibility Audit Dossier"], portfolioImpact: "Distinguishes you as an elite frontend design engineer." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified Developer Associate", issuer: "AWS", relevance: "Strong for Cloud Hosting & CDN Deployment", estimatedCost: "$150" }
        ],
        books: [{ title: "Micro Frontends in Action", author: "Michael Geers", whyRead: "Building scalable frontend web applications." }],
        courses: [{ title: "Three.js Journey", platform: "Bruno Simon", urlOrProvider: "Bruno Simon", type: "Paid" }],
        practicePlatforms: [{ name: "Codewars & CSS Battle", focus: "Advanced Layout Calculations & Graphic Code Drills" }],
        interviewPreparation: [
          { topic: "Frontend System Design", keyQuestions: ["Design Google Docs Collaborative Rich Text Editor", "Design Newsfeed with infinite scrolling and virtualized lists."], strategy: "Cover DOM Virtualization -> Memory Management -> Network Optimization -> State Sync." }
        ],
        portfolioTasks: ["Publish 3D WebGL interactive project", "Deliver accessibility compliance overhaul report", "Write technical guide on frontend micro-architecture"],
        networkingSuggestions: ["Speak at regional Web Development conferences", "Connect with Engineering VPs and Design Directors", "Write technical frontend posts on Medium / DEV.to"],
        jobApplicationStrategy: ["Target Senior Frontend Engineer, Staff UI Engineer, or Design Technologist positions", "Highlight 3D/WebGL and architecture case studies", "Negotiate top tech market compensation"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Frontend Architect & Executive Design Leadership",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Principal Frontend Architect, VP of User Experience, or Head of Design Engineering.",
        learningTopics: ["Enterprise Frontend Infrastructure Strategy", "Design System Governance across 100+ Engineers", "Web Assembly (WASM) Engine Optimization", "Executive Product & Design Strategy"],
        recommendedTools: ["Figma Enterprise", "Chromatic Visual Testing", "Vercel Enterprise"],
        recommendedProjects: [
          { title: "Enterprise Design System & Micro-Frontend Blueprint", description: "Architected multi-brand design system powering 20 enterprise web products with unified CI/CD deployment.", keyDeliverables: ["Enterprise Design Token System", "Micro-Frontend Governance Plan", "Executive Performance Metrics"], portfolioImpact: "Establishes C-Suite Frontend & UX Architecture leadership." }
        ],
        recommendedCertifications: [
          { name: "Certified Web Accessibility Specialist (WAS)", issuer: "IAAP", relevance: "Elite Accessibility Credential", estimatedCost: "$430" }
        ],
        books: [{ title: "Expressive Design Systems", author: "Yesenia Perez-Cruz", whyRead: "Scaling design systems across enterprise organizations." }],
        courses: [{ title: "Frontend Architecture & Tech Leadership", platform: "Frontend Masters", urlOrProvider: "Top Instructors", type: "Paid" }],
        practicePlatforms: [{ name: "Nielsen Norman Group UX Drills", focus: "Executive Usability Strategy & Interface Architecture" }],
        interviewPreparation: [
          { topic: "Executive Frontend Leadership & Product UX", keyQuestions: ["How do you govern design system adoption across 50 engineering teams?", "Describe your strategy for migrating monolithic frontend to micro-frontends."], strategy: "Emphasize velocity, component reuse, brand consistency, and rendering speed." }
        ],
        portfolioTasks: ["Deliver enterprise design system case study", "Present keynote on Web Vitals optimization", "Audit multi-brand web architecture"],
        networkingSuggestions: ["Connect with CTOs, CPOs, and VPs of Engineering", "Organize local developer conferences", "Write influential design engineering essays"],
        jobApplicationStrategy: ["Engage executive search consultants", "Apply for Principal Frontend Architect, Head of UX Engineering, or Director of UI roles", "Structure executive equity and compensation packages"]
      }
    };
  }

  // 10. Cloud / DevOps / Systems Administrator / SRE
  if (r.includes("devops") || r.includes("cloud") || r.includes("sre") || r.includes("sysadmin") || ind.includes("cloud") || ind.includes("devops")) {
    return {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Linux SysAdmin, Networking & Docker Containers",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Master Linux system administration, bash scripting, networking protocols, and basic Docker containerization.",
        learningTopics: ["Linux Administration & Shell Scripting (Bash)", "Networking & Security Groups (SSH, DNS, Firewall, Subnets)", "Version Control & GitHub Actions", "Docker Containerization & Docker Compose", "AWS Cloud Core Services (EC2, S3, IAM, VPC)"],
        recommendedTools: ["Ubuntu / RedHat Linux", "Bash / Shell", "Docker Desktop", "AWS CLI", "Git & GitHub Actions"],
        recommendedProjects: [
          { title: "Containerized Web Application & CI/CD Pipeline", description: "Package full-stack web application into Docker containers with automated GitHub Actions testing and AWS EC2 deployment.", keyDeliverables: ["Dockerfile & Compose Manifest", "GitHub Actions YAML", "Live EC2 Deployment"], portfolioImpact: "Proves foundational cloud deployment and DevOps hygiene." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified Cloud Practitioner", issuer: "AWS", relevance: "Essential Cloud Standard", estimatedCost: "$100" },
          { name: "CompTIA Linux+", issuer: "CompTIA", relevance: "Strong SysAdmin Credential", estimatedCost: "$359" }
        ],
        books: [{ title: "The Linux Command Line", author: "William Shotts", whyRead: "Definitive manual for mastering Linux shell environment." }],
        courses: [{ title: "Linux Administration Bootcamp", platform: "Udemy", urlOrProvider: "Jason Cannon", type: "Paid" }],
        practicePlatforms: [{ name: "KodeKloud", focus: "Linux & Docker Hands-on Labs" }],
        interviewPreparation: [
          { topic: "Linux & Cloud Infrastructure Core", keyQuestions: ["Explain DNS resolution process step-by-step.", "How does a Docker container differ from a Virtual Machine?"], strategy: "Explain process isolation, cgroups, namespaces, and networking subnets accurately." }
        ],
        portfolioTasks: ["Write Bash script automating server backup", "Deploy multi-container app with Docker Compose", "Configure AWS VPC with public and private subnets"],
        networkingSuggestions: ["Join local DevOps / AWS User Groups", "Connect with Cloud Engineers on LinkedIn", "Participate in open-source DevOps Discord communities"],
        jobApplicationStrategy: ["Target Junior DevOps Engineer, Cloud Support Specialist, or Linux SysAdmin roles", "Highlight AWS certifications and GitHub Actions scripts", "Apply to cloud consultancies and SaaS companies"]
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Infrastructure as Code, Kubernetes & CI/CD",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Master Infrastructure as Code (Terraform), Kubernetes cluster orchestration (Helm, K8s), and zero-downtime CI/CD pipelines.",
        learningTopics: ["Infrastructure as Code (Terraform / OpenTofu)", "Kubernetes Orchestration (Pods, Services, Ingress, Deployments)", "Helm Chart Management", "Advanced CI/CD Automation (GitLab CI / ArgoCD)", "Cloud Security & IAM Policy Hardening"],
        recommendedTools: ["Terraform", "Kubernetes (kubectl)", "Helm", "ArgoCD", "AWS / GCP"],
        recommendedProjects: [
          { title: "Automated Kubernetes Cluster Provisioning & GitOps Pipeline", description: "Provision AWS EKS cluster with Terraform, configuring ArgoCD for GitOps continuous deployment and Helm deployment.", keyDeliverables: ["Terraform HCL Code", "Helm Chart Repository", "ArgoCD GitOps Setup"], portfolioImpact: "Demonstrates high-demand enterprise cloud engineering competence." }
        ],
        recommendedCertifications: [
          { name: "Certified Kubernetes Administrator (CKA)", issuer: "Linux Foundation / CNCF", relevance: "Gold Standard Kubernetes Credential", estimatedCost: "$395" },
          { name: "AWS Certified Solutions Architect Associate", issuer: "AWS", relevance: "Premier Industry Benchmark", estimatedCost: "$150" }
        ],
        books: [{ title: "Terraform: Up & Running", author: "Yevgeniy Brikman", whyRead: "Practical guide to writing clean infrastructure code." }],
        courses: [{ title: "Certified Kubernetes Administrator (CKA) with Practice Tests", platform: "KodeKloud / Udemy", urlOrProvider: "Mumshad Mannambeth", type: "Paid" }],
        practicePlatforms: [{ name: "Killercoda", focus: "Live Interactive Kubernetes & Terraform Labs" }],
        interviewPreparation: [
          { topic: "Kubernetes & Infrastructure as Code", keyQuestions: ["How does Kubernetes handle self-healing?", "Explain Terraform state locking and backend configuration."], strategy: "Detail K8s control plane components (etcd, API server, scheduler) and HCL best practices." }
        ],
        portfolioTasks: ["Pass CKA certification exam", "Publish open-source Terraform module", "Setup automated GitOps deployment with ArgoCD"],
        networkingSuggestions: ["Attend KubeCon / CloudNativeCon", "Connect with Senior DevOps and Cloud Architects", "Engage in Reddit r/devops and r/aws"],
        jobApplicationStrategy: ["Apply for DevOps Engineer, Kubernetes Administrator, or Cloud Engineer positions", "Attach CKA badge and Terraform GitHub links to applications", "Submit applications to enterprise tech companies"]
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "Observability, Chaos Engineering & SRE Practices",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on site reliability engineering (SLO/SLI metrics), observability stacks (Prometheus, Grafana, Jaeger), chaos engineering, and cost optimization (FinOps).",
        learningTopics: ["Observability & Metrics Monitoring (Prometheus, Grafana, Datadog)", "Distributed Tracing (OpenTelemetry / Jaeger)", "Site Reliability Engineering (SLO, SLI, Error Budgets)", "Chaos Engineering & Fault Tolerance Testing", "Cloud FinOps & Infrastructure Cost Optimization"],
        recommendedTools: ["Prometheus & Grafana", "OpenTelemetry", "Chaos Mesh / Gremlin", "Datadog", "Terraform Cloud"],
        recommendedProjects: [
          { title: "Enterprise Reliability & Grafana Observability Dashboard", description: "Engineered full observability stack with Prometheus, Grafana, and OpenTelemetry monitoring multi-service latency and error budgets.", keyDeliverables: ["Grafana Dashboards", "Prometheus Alert Rules", "SLO/SLI Documentation"], portfolioImpact: "Distinguishes you as an advanced Site Reliability Engineer." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified DevOps Engineer Professional", issuer: "AWS", relevance: "Elite Professional DevOps Credential", estimatedCost: "$300" },
          { name: "Certified Kubernetes Application Developer (CKAD)", issuer: "CNCF", relevance: "Strong K8s Credential", estimatedCost: "$395" }
        ],
        books: [{ title: "Site Reliability Engineering: How Google Runs Production Systems", author: "Betsy Beyer et al. (Google SRE Team)", whyRead: "Definitive handbook on SRE practices." }],
        courses: [{ title: "Site Reliability Engineering (SRE) Foundation", platform: "DevOps Institute / Coursera", urlOrProvider: "Top Instructors", type: "Free / Paid" }],
        practicePlatforms: [{ name: "Chaos Engineering Labs", focus: "Resilience & Fault Tolerance Simulations" }],
        interviewPreparation: [
          { topic: "SRE Reliability & System Incidents", keyQuestions: ["How do you define SLOs and SLIs for an API service?", "Walk me through post-mortem after an enterprise outage."], strategy: "Emphasize blameless post-mortems, error budgets, and automated self-healing." }
        ],
        portfolioTasks: ["Publish enterprise Prometheus alert rules repository", "Deliver cloud cost optimization report saving 30% cloud bill", "Write SRE post-mortem case study"],
        networkingSuggestions: ["Speak at DevOpsDays conferences", "Connect with Heads of Site Reliability and Cloud Infrastructure", "Write technical articles on Medium / Hashnode"],
        jobApplicationStrategy: ["Target Senior SRE, Staff DevOps Engineer, or Infrastructure Architect roles", "Highlight AWS Professional certifications and SLA metrics", "Negotiate top tier compensation packages"]
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Principal Cloud Architect & Executive Infrastructure Vision",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself for Principal Cloud Architect, VP of Infrastructure, or Head of Platform Engineering leading enterprise cloud transformations.",
        learningTopics: ["Multi-Cloud Enterprise Architecture & Hybrid Migration", "Executive Cloud Governance & FinOps Leadership", "Disaster Recovery Strategy & 99.999% Availability Architecture", "Platform Engineering & Internal Developer Platforms (IDP)"],
        recommendedTools: ["AWS Control Tower", "Google Cloud Anthos", "Backstage IDP"],
        recommendedProjects: [
          { title: "Multi-Cloud Migration & Enterprise IDP Blueprint", description: "Designed multi-cloud architecture and Internal Developer Platform (Backstage) reducing developer deployment friction by 70%.", keyDeliverables: ["Enterprise Cloud Migration Strategy", "Internal Developer Platform Setup", "C-Suite FinOps Forecast"], portfolioImpact: "Establishes C-Suite Infrastructure & Cloud Architecture authority." }
        ],
        recommendedCertifications: [
          { name: "Google Professional Cloud Architect", issuer: "Google Cloud", relevance: "Elite Cloud Architect Standard", estimatedCost: "$200" },
          { name: "AWS Certified Solutions Architect Professional", issuer: "AWS", relevance: "Top Architectural Standard", estimatedCost: "$300" }
        ],
        books: [{ title: "Cloud Strategy", author: "Gregor Hohpe", whyRead: "Navigating cloud transformation for enterprise leaders." }],
        courses: [{ title: "Enterprise Cloud Architecture", platform: "Carnegie Mellon / edX", urlOrProvider: "CMU", type: "Paid" }],
        practicePlatforms: [{ name: "AWS Architecture Center Case Studies", focus: "Enterprise Multi-Region System Design" }],
        interviewPreparation: [
          { topic: "Executive Cloud Strategy & Enterprise Governance", keyQuestions: ["How do you migrate 500 legacy monolithic workloads to multi-cloud?", "Describe your enterprise FinOps governance model."], strategy: "Align cloud elasticity, security compliance, and multi-million dollar cost governance." }
        ],
        portfolioTasks: ["Deliver enterprise multi-cloud migration playbook", "Keynote at global Cloud conference", "Structure zero-downtime DR protocol"],
        networkingSuggestions: ["Connect with CTOs, VPs of Infrastructure, and Cloud Partners", "Keynote at AWS re:Invent or Google Cloud Next", "Write white papers on Platform Engineering"],
        jobApplicationStrategy: ["Engage executive cloud search firms", "Apply for Principal Architect, VP of Infrastructure, or Head of Platform roles", "Structure executive compensation, equity, and advisory roles"]
      }
    };
  }

  // 11. Default Software Engineering (Fallback)
  return {
    beginner: {
      stageName: "Beginner Stage",
      stageTitle: "Foundations & Core Principles",
      timeline: "Weeks 1-3 (Estimated 50 Hours)",
      mentorAdvice: "Build non-negotiable fundamentals. Master language nuances, Git workflows, and baseline problem-solving before moving to complex frameworks.",
      learningTopics: ["Data Structures (Arrays, HashMaps, Trees)", "Algorithms (Sorting, Searching, Recursion)", "Clean Code & Refactoring Principles", "Version Control (Git/GitHub)", "RESTful API Specification"],
      recommendedTools: ["VS Code / JetBrains", "Git & GitHub CLI", "Postman", "Docker Desktop", "Terminal / Bash"],
      recommendedProjects: [
        { title: `${role} Baseline Service Engine`, description: "Build a clean REST API service with input validation, modular routing, and persistent DB storage.", keyDeliverables: ["REST Endpoints", "Input Validation", "Unit Tests"], portfolioImpact: "Demonstrates production code structure and hygiene." },
        { title: "Algorithmic Solver Suite", description: "Implement core algorithms from scratch with space/time complexity benchmarks.", keyDeliverables: ["Custom Implementations", "Benchmark Report", "Documentation"], portfolioImpact: "Proves deep computer science fundamentals." }
      ],
      recommendedCertifications: [
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", relevance: "High for Cloud Fundamentals", estimatedCost: "$100" },
        { name: "Meta Professional Software Certificate", issuer: "Meta / Coursera", relevance: "Strong for Industry Basics", estimatedCost: "Free / $39/mo" }
      ],
      books: [
        { title: "Clean Code", author: "Robert C. Martin", whyRead: "Essential principles for writing readable, maintainable software." },
        { title: "Grokking Algorithms", author: "Aditya Bhargava", whyRead: "Visual and intuitive breakdown of core algorithmic concepts." }
      ],
      courses: [
        { title: "CS50: Introduction to Computer Science", platform: "edX / Harvard", urlOrProvider: "Harvard University", type: "Free" },
        { title: "Data Structures & Algorithms Masterclass", platform: "Udemy / Coursera", urlOrProvider: "Top Instructors", type: "Paid" }
      ],
      practicePlatforms: [
        { name: "LeetCode", focus: "Easy/Medium Data Structure Problems" },
        { name: "HackerRank", focus: "Domain Language Fundamentals & SQL" }
      ],
      interviewPreparation: [
        { topic: "Behavioral Fundamentals (Tell Me About Yourself)", keyQuestions: ["Walk me through your background.", "Why are you targeting this role?"], strategy: "Structure answers using Present-Past-Future narrative arc." },
        { topic: "Basic Data Structure Code Walkthroughs", keyQuestions: ["How does a HashMap work internally?", "Explain O(1) vs O(n) complexity."], strategy: "Write clean pseudocode and state space-time trade-offs explicitly." }
      ],
      portfolioTasks: ["Create GitHub account with clean README profile", "Setup personal developer domain or portfolio site", "Publish first open-source repository with full documentation"],
      networkingSuggestions: ["Connect with 10 college alumni working in target roles", "Join local tech Discord / Slack communities", "Follow top technical leaders in your industry on LinkedIn"],
      jobApplicationStrategy: ["Audit resume against target role job descriptions", "Identify 20 target companies for early bookmarking", "Setup job alerts on LinkedIn and Wellfound"]
    },
    intermediate: {
      stageName: "Intermediate Stage",
      stageTitle: "Architecture & Framework Mastery",
      timeline: "Weeks 4-7 (Estimated 80 Hours)",
      mentorAdvice: "Transition from writing code to engineering software. Focus on database design, asynchronous processing, and automated testing.",
      learningTopics: ["Relational & NoSQL Database Schema Design", "Asynchronous Programming & Event Loops", "Authentication (JWT, OAuth2, Session)", "Caching Strategies (Redis)", "Docker Containerization"],
      recommendedTools: ["Redis", "PostgreSQL / MongoDB", "Docker Compose", "GitHub Actions", "Swagger / OpenAPI"],
      recommendedProjects: [
        { title: "Real-time Collaborative Dashboard", description: "Build a multi-user platform featuring WebSockets, caching, and state synchronization.", keyDeliverables: ["WebSocket Server", "Redis Cache", "Role-based Access"], portfolioImpact: "Proves ability to engineer responsive real-time applications." },
        { title: "E-Commerce Micro-services API", description: "Design order processing and inventory modules with transaction isolation.", keyDeliverables: ["DB Transactions", "Stripe API Integration", "Docker Compose"], portfolioImpact: "Shows readiness for real-world commercial software." }
      ],
      recommendedCertifications: [
        { name: "AWS Certified Developer Associate", issuer: "Amazon Web Services", relevance: "Very High for Backend & Cloud", estimatedCost: "$150" },
        { name: "MongoDB Certified Developer", issuer: "MongoDB Inc", relevance: "High for NoSQL Systems", estimatedCost: "$150" }
      ],
      books: [
        { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", whyRead: "The gold standard text on distributed systems, storage engines, and data consistency." },
        { title: "Refactoring: Improving Existing Code", author: "Martin Fowler", whyRead: "Master code transformation patterns without altering external behavior." }
      ],
      courses: [
        { title: "Full Stack Open", platform: "University of Helsinki", urlOrProvider: "Helsinki Uni", type: "Free" },
        { title: "Docker & Kubernetes: The Complete Guide", platform: "Udemy", urlOrProvider: "Stephen Grider", type: "Paid" }
      ],
      practicePlatforms: [
        { name: "NeetCode 150", focus: "Curated LeetCode Medium Pattern Practice" },
        { name: "System Design Primer", focus: "Foundational System Design Concepts" }
      ],
      interviewPreparation: [
        { topic: "Technical Deep-Dive into Projects", keyQuestions: ["Why did you choose PostgreSQL over MongoDB for this project?", "How did you handle race conditions?"], strategy: "Use STAR format emphasizing technical trade-offs and metrics." },
        { topic: "Medium Level Algorithmic Problem Solving", keyQuestions: ["Two Pointers, Sliding Window, Dynamic Programming basics."], strategy: "Always think aloud before writing code." }
      ],
      portfolioTasks: ["Host live working demo on Vercel/Render/AWS", "Write technical blog explaining a project challenge solved", "Record 2-minute video walkthrough of your capstone app"],
      networkingSuggestions: ["Request 3 informational interviews with senior engineers", "Attend virtual or local tech meetups", "Engage thoughtfully on engineering blog posts on LinkedIn"],
      jobApplicationStrategy: ["Apply to 10 safe companies to build interview momentum", "Customize resume keywords for each application", "Leverage campus or alumni referral requests"]
    },
    advanced: {
      stageName: "Advanced Stage",
      stageTitle: "System Design & Enterprise Scale",
      timeline: "Weeks 8-10 (Estimated 90 Hours)",
      mentorAdvice: "Focus on scalability, fault tolerance, and CI/CD pipelines. Demonstrate that you can write code that runs reliably at scale.",
      learningTopics: ["Distributed Systems Architecture", "Microservices vs Monoliths", "Message Queues (Kafka / RabbitMQ)", "CI/CD Pipeline Automation", "Performance Monitoring & Logging"],
      recommendedTools: ["Kubernetes", "Apache Kafka", "Prometheus & Grafana", "Terraform", "JMeter / k6"],
      recommendedProjects: [
        { title: "Distributed Task Scheduler & Queue", description: "Engineered a fault-tolerant message queue supporting retry policies and dead-letter queues.", keyDeliverables: ["Worker Pool", "DLQ Handling", "Prometheus Metrics"], portfolioImpact: "Distinguishes you as an advanced systems engineer." },
        { title: "High-Throughput Analytics Service", description: "Process millions of events with streaming ingestion and automated aggregation.", keyDeliverables: ["Kafka Pipeline", "Grafana Dashboard", "Load Testing"], portfolioImpact: "Demonstrates enterprise-grade data engineering capability." }
      ],
      recommendedCertifications: [
        { name: "AWS Solutions Architect Associate", issuer: "AWS", relevance: "Top Industry Standard", estimatedCost: "$150" },
        { name: "CKAD: Certified Kubernetes Application Developer", issuer: "Linux Foundation", relevance: "Gold standard for Kubernetes", estimatedCost: "$395" }
      ],
      books: [
        { title: "System Design Interview – An Insider's Guide", author: "Alex Xu", whyRead: "Step-by-step framework for tackling high-stakes system design rounds." },
        { title: "Building Microservices", author: "Sam Newman", whyRead: "Comprehensive guide to modelling, integrating, and deploying microservices." }
      ],
      courses: [
        { title: "Grokking the System Design Interview", platform: "Educative.io / Design Gurus", urlOrProvider: "Design Gurus", type: "Paid" },
        { title: "Kubernetes for Developers", platform: "Linux Foundation", urlOrProvider: "CNCF", type: "Free / Paid" }
      ],
      practicePlatforms: [
        { name: "ByteByteGo", focus: "Visual System Design Architectures" },
        { name: "LeetCode Hard & Company Specifics", focus: "FAANG / Tier 1 High-Frequency Questions" }
      ],
      interviewPreparation: [
        { topic: "System Design Whiteboarding", keyQuestions: ["Design URL Shortener (TinyURL)", "Design Rate Limiter", "Design Messaging App"], strategy: "Follow 4-step framework: Requirements -> API & Schema -> High Level -> Deep Dives." },
        { topic: "Behavioral Leadership & STAR Mastery", keyQuestions: ["Describe a time you disagreed with a teammate.", "How do you handle scope creep?"], strategy: "Emphasize ownership, data, and positive resolution." }
      ],
      portfolioTasks: ["Implement automated CI/CD deployment with test coverage badges", "Conduct k6 load testing and document max RPS benchmarks in README", "Publish System Design diagram case study"],
      networkingSuggestions: ["Reach out to engineering managers and hiring leads directly", "Ask for warm introductions via mutual LinkedIn connections", "Share your system design diagrams on tech forums"],
      jobApplicationStrategy: ["Target tier-1 companies and high-growth startups", "Follow up on all applications after 5 business days", "Pitch customized value propositions in cold emails"]
    },
    expert: {
      stageName: "Expert Stage",
      stageTitle: "Production Mastery & Career Acceleration",
      timeline: "Weeks 11-12+ (Ongoing Mastery)",
      mentorAdvice: "Position yourself as an indispensable asset. Focus on high-level production optimization, executive presence, and salary negotiation.",
      learningTopics: ["Production Zero-Downtime Deployments", "Security Audit & Vulnerability Scanning", "FinOps & Cloud Cost Optimization", "Technical Leadership & Mentorship", "Executive Compensation Negotiation"],
      recommendedTools: ["Snyk / SonarQube", "AWS CloudWatch / Datadog", "OpenTelemetry", "Helm", "GitLab CI"],
      recommendedProjects: [
        { title: "Open-Source Infrastructure SDK / Plugin", description: "Created and published an open-source library on npm/PyPI with thorough test coverage and automated release workflow.", keyDeliverables: ["NPM Package", "95%+ Test Coverage", "Documentation"], portfolioImpact: "Establishes industry authority and technical leadership." },
        { title: "Enterprise Security & Performance Audit", description: "Audited multi-service application for OWASP Top 10 vulnerabilities and reduced cloud bill by 30%.", keyDeliverables: ["Audit Report", "Cost Breakdown", "Remediation PRs"], portfolioImpact: "Demonstrates executive business mindset and production vigilance." }
      ],
      recommendedCertifications: [
        { name: "AWS Certified DevOps Engineer Professional", issuer: "AWS", relevance: "Elite Senior Level Credential", estimatedCost: "$300" },
        { name: "Google Professional Cloud Architect", issuer: "Google Cloud", relevance: "Elite Cloud Credential", estimatedCost: "$200" }
      ],
      books: [
        { title: "The Software Engineer's Guidebook", author: "Gergely Orosz", whyRead: "Navigating senior tech career growth, engineering leadership, and tech companies." },
        { title: "Never Split the Difference", author: "Chris Voss", whyRead: "Tactical negotiation skills for securing maximum compensation." }
      ],
      courses: [
        { title: "Pragmatic Senior Engineer Course", platform: "Gergely Orosz Blog & Guides", urlOrProvider: "The Pragmatic Engineer", type: "Paid" },
        { title: "Advanced Distributed Systems", platform: "MIT OpenCourseWare", urlOrProvider: "MIT", type: "Free" }
      ],
      practicePlatforms: [
        { name: "Pramp / Interviewing.io", focus: "Live Mock Interviews with Senior FAANG Engineers" },
        { name: "Levels.fyi", focus: "Market Compensation Intelligence & Equity Valuation" }
      ],
      interviewPreparation: [
        { topic: "Executive & Bar Raiser Rounds", keyQuestions: ["How do you prioritize technical debt vs product features?", "Tell me about a project that failed."], strategy: "Speak with business impact metrics and executive maturity." },
        { topic: "Compensation & Offer Negotiation", keyQuestions: ["What are your salary expectations?", "We have a strict salary band."], strategy: "Never give a hard number first; benchmark using Levels.fyi data." }
      ],
      portfolioTasks: ["Maintain active open-source library", "Give a tech talk or host a webinar", "Publish comprehensive career portfolio case study"],
      networkingSuggestions: ["Build direct relationships with executive recruiters", "Mentor junior developers in open-source or campus groups", "Engage with CTOs and VPs of Engineering on industry developments"],
      jobApplicationStrategy: ["Execute high-touch multi-channel application campaign", "Leverage competing job offers for negotiation leverage", "Evaluate total compensation package including equity & benefits"]
    }
  };
}

// Client-side Fallback Builder for instant personalized roadmap generation
export function generateDefaultEnterpriseRoadmap(
  profile: StudentProfile,
  overrides?: EnterpriseRoadmapParams
): EnterpriseCareerRoadmap {
  const edu = overrides?.education || `${profile.degree || "Bachelor Degree"} in ${profile.branch || "General Studies"} (${profile.college || "University"})`;
  const skills = overrides?.currentSkills?.length ? overrides.currentSkills : (profile.technicalSkills?.length ? profile.technicalSkills : ["Domain Knowledge", "Problem Solving"]);
  const role = overrides?.targetRole || profile.targetRoles?.[0] || "Professional Lead";
  const country = overrides?.country || profile.location || profile.preferredLocation || "United States / Global";
  const ind = overrides?.preferredIndustry || profile.preferredIndustry || "Engineering & Technology";
  const speed = overrides?.learningSpeed || "Standard (1x)";
  const time = overrides?.availableTime || profile.timeAvailable || "2-3 hours/day";
  const budget = overrides?.budget || "$0 (Free / Open Source)";
  const goal = overrides?.careerGoal || profile.careerGoals || "Professional Leadership & Domain Mastery";

  const lowerInd = ind.toLowerCase();
  const lowerRole = role.toLowerCase();
  const isTechDomain = lowerInd.includes("tech") || lowerInd.includes("software") || lowerInd.includes("ai") || lowerInd.includes("cyber") || lowerInd.includes("data") || lowerRole.includes("developer") || lowerRole.includes("engineer") || lowerRole.includes("programmer");

  let missing: string[];
  let beginnerMilestones: RoadmapMilestoneItem[];
  let intermediateMilestones: RoadmapMilestoneItem[];
  let advancedMilestones: RoadmapMilestoneItem[];
  let expertMilestones: RoadmapMilestoneItem[];

  if (!isTechDomain) {
    missing = [
      `Advanced ${ind} Statutory & Regulatory Compliance`,
      `Domain Tooling & Specialized Platform Mastery`,
      `Quantified Project Deliverables & Portfolio Documentation`,
      `Industry Certification & Licensing Requirements`,
      `Strategic Stakeholder & Executive Leadership`
    ];

    beginnerMilestones = [
      { id: "b1", title: `Master Foundational ${ind} Core Principles`, description: `Build deep proficiency in foundational regulations, methodologies, and standard terminology for ${role}.`, completed: false, priority: "High" },
      { id: "b2", title: "Domain Documentation & Compliance Standards", description: "Learn key industry documentation standards, protocol compliance, and quality auditing.", completed: false, priority: "High" },
      { id: "b3", title: "Core Industry Skill & Tooling Sprint", description: "Master specialized software, diagnostic equipment, or reporting platforms required for " + role + ".", completed: false, priority: "High" },
      { id: "b4", title: "Build Baseline Portfolio Case Study", description: "Develop an end-to-end practical project or comprehensive report demonstrating real-world domain application.", completed: false, priority: "Medium" }
    ];

    intermediateMilestones = [
      { id: "i1", title: `Intermediate ${role} Execution & Case Analysis`, description: "Execute complex real-world workflows, risk evaluations, and cross-functional scenarios.", completed: false, priority: "High" },
      { id: "i2", title: "Data-Driven Analysis & Process Optimization", description: "Optimize operational metrics, budget efficiency, or quality control metrics.", completed: false, priority: "High" },
      { id: "i3", title: "Industry Licensing & Certification Prep", description: "Prepare for core professional certifications and regulatory credentials required in " + ind + ".", completed: false, priority: "Medium" },
      { id: "i4", title: "Mock Domain Specialist Interview Sprints", description: "Complete structured mock interview rounds with real-time feedback on STAR responses and situational judgment.", completed: false, priority: "High" }
    ];

    advancedMilestones = [
      { id: "a1", title: `Advanced ${role} Strategy & Stakeholder Management`, description: "Lead high-stakes initiatives, stakeholder negotiations, and complex multi-team deliverables.", completed: false, priority: "High" },
      { id: "a2", title: "Publish Comprehensive Portfolio & Field Audit", description: "Deliver an enterprise-grade portfolio case study or audit report with measurable business impact.", completed: false, priority: "High" },
      { id: "a3", title: "Targeted Industry Network & Referral Pipeline", description: "Engage key senior professionals and alumni for direct referral and executive placement opportunities.", completed: false, priority: "High" }
    ];

    expertMilestones = [
      { id: "e1", title: "High-Stakes Domain & Executive Interview Readiness", description: "Ace senior executive panel rounds, case presentations, and situational leadership evaluations.", completed: false, priority: "High" },
      { id: "e2", title: "Industry Thought Leadership & Certification Achievement", description: "Complete top-tier industry credential and publish field insights or white papers.", completed: false, priority: "Medium" },
      { id: "e3", title: "Executive Offer Negotiation & Career Strategy", description: "Leverage market compensation benchmarks for maximum total rewards and career growth.", completed: false, priority: "High" }
    ];
  } else {
    missing = [
      "System Design & Scalability Architecture",
      "Cloud Native Deployment (AWS/GCP)",
      "CI/CD Automated Testing Pipelines",
      "Production Monitoring & Telemetry (Grafana/Datadog)",
      "Advanced Data Structures & Algorithms"
    ];

    beginnerMilestones = [
      { id: "b1", title: `Master Core ${skills[0] || "Programming"} Fundamentals`, description: "Build deep proficiency in memory management, OOP/FP concepts, and standard data types.", completed: false, priority: "High" },
      { id: "b2", title: "Git & GitHub Production Workflow", description: "Learn branching strategies, PR code reviews, interactive rebase, and commit conventions.", completed: false, priority: "High" },
      { id: "b3", title: "Core Data Structures & Algorithms Sprint", description: "Solve foundational problems covering Arrays, Strings, HashMaps, and Stacks.", completed: false, priority: "High" },
      { id: "b4", title: "Build Baseline Full-Stack CRUD Application", description: "Develop an end-to-end application with persistent database storage and clean REST endpoints.", completed: false, priority: "Medium" }
    ];

    intermediateMilestones = [
      { id: "i1", title: `Intermediate ${role} System Architecture`, description: "Architect decoupled microservices or modular monoliths with authentication and caching.", completed: false, priority: "High" },
      { id: "i2", title: "Database Query Optimization & Indexing", description: "Master SQL indexing, query execution plans, transactions, and Redis caching layers.", completed: false, priority: "High" },
      { id: "i3", title: "Containerization with Docker", description: "Containerize multi-service applications using Docker compose and environment configurations.", completed: false, priority: "Medium" },
      { id: "i4", title: "Mock Technical Interview Sprints", description: "Complete 5 mock technical interview rounds with real-time feedback on STAR responses and code design.", completed: false, priority: "High" }
    ];

    advancedMilestones = [
      { id: "a1", title: "Distributed Systems & Scalability Design", description: "Master load balancing, message queues, rate limiting, and sharding.", completed: false, priority: "High" },
      { id: "a2", title: "Cloud Deployment Pipeline (AWS/GCP)", description: "Automate CI/CD pipelines with GitHub Actions, Terraform, and cloud serverless/containers.", completed: false, priority: "High" },
      { id: "a3", title: "Capstones & Live Production Deployment", description: "Deploy an enterprise-grade project with 99.9% uptime, live domain, SSL, and error logging.", completed: false, priority: "High" }
    ];

    expertMilestones = [
      { id: "e1", title: "High-Stakes Technical & Executive Interview Readiness", description: "Ace System Design architecture whiteboarding and C-level executive culture rounds.", completed: false, priority: "High" },
      { id: "e2", title: "Open-Source Contributions & Technical Thought Leadership", description: "Publish technical blogs and submit PRs to prominent open-source repositories.", completed: false, priority: "Medium" },
      { id: "e3", title: "Offer Negotiation & Career Strategy", description: "Leverage competing offers using data-backed compensation guidelines for maximum total rewards.", completed: false, priority: "High" }
    ];
  }

  // Get domain-tailored stage details (learning topics, tools, projects, certs, books, courses, practice platforms, interview prep)
  const domainStages = getDomainSpecificStageData(role, ind);

  return {
    generatedAt: new Date().toISOString(),
    inputs: { 
      education: edu, 
      currentSkills: skills, 
      experience: profile.internships || profile.projects || "Entry-level", 
      careerGoal: goal, 
      targetRole: role, 
      country, 
      preferredIndustry: ind, 
      learningSpeed: speed, 
      availableTime: time, 
      budget, 
      existingResumeText: profile.resumeStatus 
    },
    userAnalysis: {
      currentCareerStage: "Early-Stage Specialist / Scholar",
      currentSkills: skills,
      missingSkills: missing,
      targetProfession: `${role} (${ind}, ${country})`,
      skillGapSummary: `Calculated a 32% skill gap focused on ${ind} domain execution and specialized tools.`,
      skillGapScore: 32,
      resumeStrengthScore: 78,
      resumeStrengthSummary: `Solid educational background from ${profile.college || "University"}. Needs quantified bullet points and real-world portfolio metrics.`,
      interviewReadinessScore: 70,
      interviewReadinessSummary: `Strong theoretical knowledge; needs structured domain scenario practice for ${role}.`,
      mentorExecutiveVerdict: `Targeting ${role} in ${country} within ${ind} is highly feasible within 60-90 days. Follow this personalized 4-stage execution matrix.`
    },
    stages: {
      beginner: {
        ...domainStages.beginner,
        milestones: beginnerMilestones
      },
      intermediate: {
        ...domainStages.intermediate,
        milestones: intermediateMilestones
      },
      advanced: {
        ...domainStages.advanced,
        milestones: advancedMilestones
      },
      expert: {
        ...domainStages.expert,
        milestones: expertMilestones
      }
    }
  };
}

export function ensureEnterpriseRoadmapData(
  raw?: Partial<EnterpriseCareerRoadmap> | null,
  profile?: StudentProfile,
  overrides?: EnterpriseRoadmapParams
): EnterpriseCareerRoadmap {
  const def = generateDefaultEnterpriseRoadmap(
    profile || ({} as StudentProfile),
    overrides
  );

  if (!raw) return def;

  const rawAnalysis: any = raw.userAnalysis || {};
  const userAnalysis: EnterpriseUserAnalysis = {
    currentCareerStage: rawAnalysis.currentCareerStage || def.userAnalysis.currentCareerStage,
    currentSkills: Array.isArray(rawAnalysis.currentSkills) && rawAnalysis.currentSkills.length > 0 ? rawAnalysis.currentSkills : def.userAnalysis.currentSkills,
    missingSkills: Array.isArray(rawAnalysis.missingSkills) && rawAnalysis.missingSkills.length > 0 ? rawAnalysis.missingSkills : def.userAnalysis.missingSkills,
    targetProfession: rawAnalysis.targetProfession || def.userAnalysis.targetProfession,
    skillGapSummary: rawAnalysis.skillGapSummary || def.userAnalysis.skillGapSummary,
    skillGapScore: typeof rawAnalysis.skillGapScore === "number" ? rawAnalysis.skillGapScore : def.userAnalysis.skillGapScore,
    resumeStrengthScore: typeof rawAnalysis.resumeStrengthScore === "number" ? rawAnalysis.resumeStrengthScore : def.userAnalysis.resumeStrengthScore,
    resumeStrengthSummary: rawAnalysis.resumeStrengthSummary || def.userAnalysis.resumeStrengthSummary,
    interviewReadinessScore: typeof rawAnalysis.interviewReadinessScore === "number" ? rawAnalysis.interviewReadinessScore : def.userAnalysis.interviewReadinessScore,
    interviewReadinessSummary: rawAnalysis.interviewReadinessSummary || def.userAnalysis.interviewReadinessSummary,
    mentorExecutiveVerdict: rawAnalysis.mentorExecutiveVerdict || def.userAnalysis.mentorExecutiveVerdict,
    classifiedIndustry: rawAnalysis.classifiedIndustry || def.userAnalysis.classifiedIndustry,
    classifiedProfession: rawAnalysis.classifiedProfession || def.userAnalysis.classifiedProfession,
    classifiedSubSpecialization: rawAnalysis.classifiedSubSpecialization || def.userAnalysis.classifiedSubSpecialization,
    classifiedCareerStage: rawAnalysis.classifiedCareerStage || def.userAnalysis.classifiedCareerStage,
    isTechnicalProfile: typeof rawAnalysis.isTechnicalProfile === "boolean" ? rawAnalysis.isTechnicalProfile : def.userAnalysis.isTechnicalProfile,
    classificationConfidenceScore: typeof rawAnalysis.classificationConfidenceScore === "number" ? rawAnalysis.classificationConfidenceScore : def.userAnalysis.classificationConfidenceScore,
    clarificationQuestions: Array.isArray(rawAnalysis.clarificationQuestions) ? rawAnalysis.clarificationQuestions : def.userAnalysis.clarificationQuestions,
    salaryProgressionGuidance: rawAnalysis.salaryProgressionGuidance || def.userAnalysis.salaryProgressionGuidance,
    alternativeCareerPaths: Array.isArray(rawAnalysis.alternativeCareerPaths) ? rawAnalysis.alternativeCareerPaths : def.userAnalysis.alternativeCareerPaths,
    commonMistakesToAvoid: Array.isArray(rawAnalysis.commonMistakesToAvoid) ? rawAnalysis.commonMistakesToAvoid : def.userAnalysis.commonMistakesToAvoid,
    industryTrends: Array.isArray(rawAnalysis.industryTrends) ? rawAnalysis.industryTrends : def.userAnalysis.industryTrends,
    emergingSkills: Array.isArray(rawAnalysis.emergingSkills) ? rawAnalysis.emergingSkills : def.userAnalysis.emergingSkills,
    linkedInOptimizationTips: Array.isArray(rawAnalysis.linkedInOptimizationTips) ? rawAnalysis.linkedInOptimizationTips : def.userAnalysis.linkedInOptimizationTips,
    resumeImprovements: Array.isArray(rawAnalysis.resumeImprovements) ? rawAnalysis.resumeImprovements : def.userAnalysis.resumeImprovements,
    atsScore: typeof rawAnalysis.atsScore === "number" ? rawAnalysis.atsScore : def.userAnalysis.atsScore
  };

  const stageKeys: Array<"beginner" | "intermediate" | "advanced" | "expert"> = ["beginner", "intermediate", "advanced", "expert"];
  const stages: any = {};

  stageKeys.forEach((key) => {
    const rawStage: any = (raw.stages as any)?.[key] || {};
    const defStage = def.stages[key];

    stages[key] = {
      stageName: rawStage.stageName || defStage.stageName,
      stageTitle: rawStage.stageTitle || defStage.stageTitle,
      timeline: rawStage.timeline || defStage.timeline,
      mentorAdvice: rawStage.mentorAdvice || defStage.mentorAdvice,
      learningTopics: Array.isArray(rawStage.learningTopics) && rawStage.learningTopics.length > 0 ? rawStage.learningTopics : defStage.learningTopics,
      recommendedProjects: Array.isArray(rawStage.recommendedProjects) && rawStage.recommendedProjects.length > 0
        ? rawStage.recommendedProjects.map((p: any, i: number) => ({
            title: p?.title || defStage.recommendedProjects[i]?.title || "Portfolio Project",
            description: p?.description || defStage.recommendedProjects[i]?.description || "",
            keyDeliverables: Array.isArray(p?.keyDeliverables) && p.keyDeliverables.length > 0 ? p.keyDeliverables : ["Deliverables", "Case Study"],
            portfolioImpact: p?.portfolioImpact || "High Impact"
          }))
        : defStage.recommendedProjects,
      recommendedCertifications: Array.isArray(rawStage.recommendedCertifications) && rawStage.recommendedCertifications.length > 0
        ? rawStage.recommendedCertifications.map((c: any, i: number) => ({
            name: c?.name || "Professional Certificate",
            issuer: c?.issuer || "Industry Body",
            relevance: c?.relevance || "High",
            estimatedCost: c?.estimatedCost || "Free / Low Cost"
          }))
        : defStage.recommendedCertifications,
      recommendedTools: Array.isArray(rawStage.recommendedTools) && rawStage.recommendedTools.length > 0 ? rawStage.recommendedTools : defStage.recommendedTools,
      books: Array.isArray(rawStage.books) && rawStage.books.length > 0
        ? rawStage.books.map((b: any) => ({
            title: b?.title || "Domain Reference Book",
            author: b?.author || "Industry Author",
            whyRead: b?.whyRead || "Core domain principles"
          }))
        : defStage.books,
      courses: Array.isArray(rawStage.courses) && rawStage.courses.length > 0
        ? rawStage.courses.map((c: any) => ({
            title: c?.title || "Online Academy Course",
            platform: c?.platform || "Online Provider",
            urlOrProvider: c?.urlOrProvider || "Provider",
            type: c?.type || "Free"
          }))
        : defStage.courses,
      practicePlatforms: Array.isArray(rawStage.practicePlatforms) && rawStage.practicePlatforms.length > 0
        ? rawStage.practicePlatforms.map((p: any) => ({
            name: p?.name || "Practice Platform",
            focus: p?.focus || "Skill Drills"
          }))
        : defStage.practicePlatforms,
      interviewPreparation: Array.isArray(rawStage.interviewPreparation) && rawStage.interviewPreparation.length > 0
        ? rawStage.interviewPreparation.map((ip: any) => ({
            topic: ip?.topic || "Domain Interview Prep",
            keyQuestions: Array.isArray(ip?.keyQuestions) && ip.keyQuestions.length > 0 ? ip.keyQuestions : ["Core Question"],
            strategy: ip?.strategy || "Use structured framework"
          }))
        : defStage.interviewPreparation,
      portfolioTasks: Array.isArray(rawStage.portfolioTasks) && rawStage.portfolioTasks.length > 0 ? rawStage.portfolioTasks : defStage.portfolioTasks,
      networkingSuggestions: Array.isArray(rawStage.networkingSuggestions) && rawStage.networkingSuggestions.length > 0 ? rawStage.networkingSuggestions : defStage.networkingSuggestions,
      jobApplicationStrategy: Array.isArray(rawStage.jobApplicationStrategy) && rawStage.jobApplicationStrategy.length > 0 ? rawStage.jobApplicationStrategy : defStage.jobApplicationStrategy,
      milestones: Array.isArray(rawStage.milestones) && rawStage.milestones.length > 0
        ? rawStage.milestones.map((m: any, i: number) => ({
            id: m?.id || `m_${key}_${i}`,
            title: m?.title || "Action Milestone",
            description: m?.description || "",
            completed: Boolean(m?.completed),
            priority: m?.priority || "High",
            userNotes: m?.userNotes || ""
          }))
        : defStage.milestones,
    };
  });

  return {
    generatedAt: raw.generatedAt || new Date().toISOString(),
    inputs: raw.inputs || def.inputs,
    userAnalysis,
    stages,
  };
}

export default function RoadmapView({
  profile,
  roadmap,
  onGenerate,
  isGenerating,
  onTargetRoleChange,
}: RoadmapViewProps) {
  // Enterprise Roadmap active stage selection
  const [activeStage, setActiveStage] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  
  // Parameter Studio Toggle & Input State
  const [showStudio, setShowStudio] = useState(false);
  const [customParams, setCustomParams] = useState<EnterpriseRoadmapParams>({
    education: `${profile?.degree || "B.Tech"} in ${profile?.branch || "Computer Science"}`,
    currentSkills: profile?.technicalSkills || [],
    experience: profile?.internships || profile?.projects || "Student / Intern",
    careerGoal: profile?.careerGoals || "Software Engineering Leadership",
    targetRole: profile?.targetRoles?.[0] || "Software Engineer",
    country: profile?.location || profile?.preferredLocation || "United States / Global",
    preferredIndustry: "Technology & Software",
    learningSpeed: "Standard (1x)",
    availableTime: profile?.timeAvailable || "2-3 hours/day",
    budget: "$0 (Free / Open Source)",
    existingResumeText: profile?.resumeStatus || ""
  });

  // Derived or Active Enterprise Roadmap Data with robust defensive normalization
  const enterpriseData: EnterpriseCareerRoadmap = ensureEnterpriseRoadmapData(
    roadmap?.enterpriseRoadmap,
    profile,
    customParams
  );

  // Completed Milestones & User Notes State
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [customMilestones, setCustomMilestones] = useState<Record<string, RoadmapMilestoneItem[]>>({});
  
  // Modal / Input for adding custom milestone
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestonePriority, setNewMilestonePriority] = useState<"High" | "Medium" | "Low">("High");

  // Load completion states from localStorage on boot
  useEffect(() => {
    try {
      const savedCompletions = localStorage.getItem("vorynexa_roadmap_milestones");
      if (savedCompletions) setCompletedMilestones(JSON.parse(savedCompletions));

      const savedNotes = localStorage.getItem("vorynexa_roadmap_notes");
      if (savedNotes) setUserNotes(JSON.parse(savedNotes));

      const savedCustom = localStorage.getItem("vorynexa_roadmap_custom_milestones");
      if (savedCustom) setCustomMilestones(JSON.parse(savedCustom));
    } catch (e) {
      console.error("Could not parse saved roadmap state:", e);
    }
  }, []);

  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem("vorynexa_roadmap_milestones", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveNote = (id: string, noteText: string) => {
    setUserNotes((prev) => {
      const updated = { ...prev, [id]: noteText };
      localStorage.setItem("vorynexa_roadmap_notes", JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddCustomMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    const newItem: RoadmapMilestoneItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || "Custom user action item.",
      completed: false,
      priority: newMilestonePriority
    };

    setCustomMilestones((prev) => {
      const stageItems = prev[activeStage] || [];
      const updated = { ...prev, [activeStage]: [...stageItems, newItem] };
      localStorage.setItem("vorynexa_roadmap_custom_milestones", JSON.stringify(updated));
      return updated;
    });

    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setShowAddMilestoneModal(false);
  };

  const handleDeleteCustomMilestone = (id: string) => {
    setCustomMilestones((prev) => {
      const stageItems = prev[activeStage] || [];
      const updated = { ...prev, [activeStage]: stageItems.filter(m => m.id !== id) };
      localStorage.setItem("vorynexa_roadmap_custom_milestones", JSON.stringify(updated));
      return updated;
    });
  };

  const handleReCalculate = async () => {
    await onGenerate(customParams);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Helper calculations for completion stats
  const currentStageObj = enterpriseData.stages[activeStage] || enterpriseData.stages.beginner;
  const stageBaseMilestones = currentStageObj.milestones || [];
  const stageCustomMilestones = customMilestones[activeStage] || [];
  const allCurrentStageMilestones = [...stageBaseMilestones, ...stageCustomMilestones];

  const currentStageDoneCount = allCurrentStageMilestones.filter((m) => completedMilestones[m.id]).length;
  const currentStageTotalCount = allCurrentStageMilestones.length;
  const currentStagePct = currentStageTotalCount > 0 ? Math.round((currentStageDoneCount / currentStageTotalCount) * 100) : 0;

  // Total across all 4 stages
  const stagesKeys: Array<"beginner" | "intermediate" | "advanced" | "expert"> = ["beginner", "intermediate", "advanced", "expert"];
  let totalRoadmapMilestonesCount = 0;
  let totalRoadmapCompletedCount = 0;

  stagesKeys.forEach((st) => {
    const base = enterpriseData.stages[st]?.milestones || [];
    const cust = customMilestones[st] || [];
    const combined = [...base, ...cust];
    totalRoadmapMilestonesCount += combined.length;
    totalRoadmapCompletedCount += combined.filter((m) => completedMilestones[m.id]).length;
  });

  const overallPct = totalRoadmapMilestonesCount > 0 ? Math.round((totalRoadmapCompletedCount / totalRoadmapMilestonesCount) * 100) : 0;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const analysis = enterpriseData.userAnalysis;

  return (
    <div className="space-y-8 print:p-0 print:m-0 print:bg-white print:text-black">
      
      {/* Printable CSS Rules */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .bg-black, .bg-\\[\\#111\\], .bg-\\[\\#111\\]\\/70 { background: #ffffff !important; color: #000000 !important; border: 1px solid #cccccc !important; }
          .text-white { color: #111111 !important; }
          .text-white\\/60, .text-white\\/50, .text-white\\/70 { color: #444444 !important; }
          .border-white\\/10, .border-white\\/5 { border-color: #dddddd !important; }
        }
      `}</style>

      {/* Print-Only Executive Header for PDF Export */}
      <div className="hidden print-only mb-6 p-6 border-b-2 border-black bg-white text-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">Vorynexa — Enterprise AI Career Roadmap</h1>
            <p className="text-sm font-bold text-gray-800 mt-1">
              Target Role: <span className="text-emerald-700">{customParams.targetRole || profile.targetRoles?.[0] || "Professional"}</span> • Preferred Industry: <span className="text-emerald-700">{customParams.preferredIndustry || "Technology"}</span>
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Candidate: <strong>{profile.name || profile.email || "Student"}</strong> • Education: {customParams.education || profile.degree || "University"} • Country: {customParams.country || "Global"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-600">{overallPct}%</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Overall Execution Progress</div>
            <div className="text-[10px] text-gray-400 mt-1">Exported on {new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Main Top Header & Action Suite */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-[#111] to-black border border-emerald-500/20 p-6 rounded-2xl shadow-2xl relative overflow-hidden no-print">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 animate-pulse" /> Vorynexa Career Intelligence
            </span>
            <span className="text-xs text-white/40 font-mono">v4.0 Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Enterprise AI Career Roadmap Engine
          </h1>
          <p className="text-xs text-white/60 font-semibold max-w-2xl leading-relaxed">
            Ultra-personalized 4-stage execution matrix tailored to your education, current skill gaps, preferred industry, country, and daily timeline.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            onClick={() => setShowStudio(!showStudio)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              showStudio 
                ? "bg-emerald-500 text-black border-emerald-400" 
                : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-emerald-500/30"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {showStudio ? "Hide Parameters" : "Customize Parameters"}
          </button>

          <button
            onClick={handleReCalculate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" /> Calculating AI Roadmap...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" /> Re-Calculate AI Roadmap
              </>
            )}
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            title="Download vector PDF / Print"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            Download Vector PDF
          </button>
        </div>
      </div>

      {/* UNIVERSAL FIELD ENGINE - INTERACTIVE DOMAIN SWITCHER STRIP */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-4 space-y-3 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
              Universal Field Engine — Select Target Domain
            </h3>
          </div>
          <span className="text-[10px] text-white/40 font-mono">
            Active Domain: <strong className="text-emerald-400">{customParams.preferredIndustry}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-500/20">
          {MAJOR_CAREER_DOMAINS.map((dom) => {
            const isSelected = customParams.preferredIndustry === dom.name;
            return (
              <button
                key={dom.id}
                onClick={() => {
                  const firstRole = dom.commonRoles?.[0];
                  const suggestedRole = typeof firstRole === "string" ? firstRole : ((firstRole as any)?.title || customParams.targetRole);
                  const updatedParams: EnterpriseRoadmapParams = {
                    ...customParams,
                    preferredIndustry: dom.name,
                    targetRole: suggestedRole
                  };
                  setCustomParams(updatedParams);
                  if (onTargetRoleChange) {
                    onTargetRoleChange(suggestedRole, dom.name);
                  }
                  onGenerate(updatedParams);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span>{dom.name}</span>
                {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* PARAMETER CUSTOMIZATION STUDIO DRAWER / MODAL */}
      {showStudio && (
        <div className="bg-[#111] border border-emerald-500/30 p-6 rounded-2xl shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 no-print">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base">Career Roadmap Parameter Studio</h3>
            </div>
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Configure Parameters for AI Re-generation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-white/70 block">Target Role</label>
                {onTargetRoleChange && (
                  <button
                    type="button"
                    onClick={() => {
                      if (customParams.targetRole) {
                        onTargetRoleChange(customParams.targetRole, customParams.preferredIndustry);
                      }
                    }}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Sync Target
                  </button>
                )}
              </div>
              <input
                type="text"
                value={customParams.targetRole || ""}
                onChange={(e) => setCustomParams({ ...customParams, targetRole: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
                placeholder="e.g. Fullstack Engineer, Clinical Research Lead, Corporate Attorney"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Target Country / Market</label>
              <input
                type="text"
                value={customParams.country || ""}
                onChange={(e) => setCustomParams({ ...customParams, country: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
                placeholder="e.g. United States, India, Germany, Remote"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Preferred Industry (Universal Field Engine)</label>
              <select
                value={customParams.preferredIndustry || "Engineering & Technology"}
                onChange={(e) => {
                  const newInd = e.target.value;
                  const foundDomain = MAJOR_CAREER_DOMAINS.find(d => d.name === newInd);
                  const firstRole = foundDomain?.commonRoles?.[0];
                  const suggestedRole = typeof firstRole === "string" ? firstRole : ((firstRole as any)?.title || customParams.targetRole);
                  setCustomParams({ 
                    ...customParams, 
                    preferredIndustry: newInd,
                    targetRole: suggestedRole || customParams.targetRole
                  });
                  if (onTargetRoleChange && suggestedRole) {
                    onTargetRoleChange(suggestedRole, newInd);
                  }
                }}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
              >
                {MAJOR_CAREER_DOMAINS.map((domain) => (
                  <option key={domain.id} value={domain.name}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Learning Speed</label>
              <select
                value={customParams.learningSpeed || "Standard (1x)"}
                onChange={(e) => setCustomParams({ ...customParams, learningSpeed: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
              >
                <option value="Accelerated Sprints (2x)">Accelerated Sprints (2x)</option>
                <option value="Standard (1x)">Standard Pace (1x)</option>
                <option value="Steady Part-time (0.5x)">Steady Part-time (0.5x)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Available Daily Time</label>
              <input
                type="text"
                value={customParams.availableTime || ""}
                onChange={(e) => setCustomParams({ ...customParams, availableTime: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
                placeholder="e.g. 2-3 hours/day, 6 hours/day"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white/70 block mb-1">Budget Tier</label>
              <select
                value={customParams.budget || "$0 (Free / Open Source)"}
                onChange={(e) => setCustomParams({ ...customParams, budget: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
              >
                <option value="$0 (Free / Open Source)">$0 (Free / Open Source Resources)</option>
                <option value="< $500">&lt; $500 (Coursera, Udemy, Certifications)</option>
                <option value="$500 - $2,000">$500 - $2,000 (Bootcamp / Advanced Certifications)</option>
                <option value="Flexible / Employer Funded">Flexible / Employer Funded</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="text-xs font-bold text-white/70 block mb-1">Education & Degree Focus</label>
              <input
                type="text"
                value={customParams.education || ""}
                onChange={(e) => setCustomParams({ ...customParams, education: e.target.value })}
                className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none font-semibold"
                placeholder="e.g. Bachelor of Technology in Computer Science (2025)"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleReCalculate}
              disabled={isGenerating}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all cursor-pointer shadow-xl flex items-center gap-2"
            >
              {isGenerating ? <Clock className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Apply Parameters & Compute New AI Plan
            </button>
          </div>
        </div>
      )}

      {/* STEP 0: AI PROFESSION CLASSIFICATION & CONFIDENCE DIAGNOSTIC */}
      <div className="bg-[#111]/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight">AI Profession Classification Diagnostic</h3>
              <p className="text-[11px] text-white/50">Verified AI Taxonomy & Candidate Sub-Specialization Detection</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase">AI Confidence Score:</span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono border ${
              (analysis.classificationConfidenceScore || 90) >= 80 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}>
              {analysis.classificationConfidenceScore || 92}% Confidence
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-black/50 border border-white/5 p-3 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-white/40 uppercase block">Detected Industry</span>
            <span className="text-xs font-black text-white block truncate">{analysis.classifiedIndustry || customParams.preferredIndustry}</span>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-white/40 uppercase block">Primary Profession</span>
            <span className="text-xs font-black text-emerald-400 block truncate">{analysis.classifiedProfession || customParams.targetRole}</span>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-white/40 uppercase block">Sub-Specialization</span>
            <span className="text-xs font-bold text-amber-300 block truncate">{analysis.classifiedSubSpecialization || "Domain Practice"}</span>
          </div>

          <div className="bg-black/50 border border-white/5 p-3 rounded-xl space-y-1">
            <span className="text-[9px] font-mono text-white/40 uppercase block">Technical / Field Type</span>
            <span className="text-xs font-bold text-sky-400 block truncate">
              {analysis.isTechnicalProfile !== undefined ? (analysis.isTechnicalProfile ? "Technical / Engineering" : "Applied / Domain Specialist") : "Domain Specialist"}
            </span>
          </div>
        </div>

        {/* AI Clarification Prompt if Confidence < 80% */}
        {analysis.classificationConfidenceScore && analysis.classificationConfidenceScore < 80 && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Clarification Needed for Higher Precision</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              To guarantee 100% precision for your roadmap, please clarify:
            </p>
            <ul className="list-disc list-inside text-xs text-amber-200/90 space-y-1">
              {(analysis.clarificationQuestions || [
                "Which specific sub-specialization do you plan to focus on?",
                "Are you seeking entry-level, mid-tier, or executive-level placement?"
              ]).map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowStudio(true)}
              className="mt-2 text-xs font-bold px-3 py-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Refine Parameters & Clarify AI Prompt
            </button>
          </div>
        )}
      </div>

      {/* STEP 1: CANDIDATE DIAGNOSTIC ANALYSIS DASHBOARD */}
      <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Step 1: AI Candidate Diagnostic Analysis</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/40 uppercase">Career Stage:</span>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {analysis.currentCareerStage}
            </span>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Skill Gap Index */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Skill Gap Index</span>
              <span className="text-sm font-black text-rose-400 font-mono">{analysis.skillGapScore}% Gap</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: `${analysis.skillGapScore}%` }} />
            </div>
            <p className="text-[11px] text-white/60 leading-tight line-clamp-2 font-medium">
              {analysis.skillGapSummary}
            </p>
          </div>

          {/* Resume Strength */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Resume Strength</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{analysis.resumeStrengthScore}/100</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analysis.resumeStrengthScore}%` }} />
            </div>
            <p className="text-[11px] text-white/60 leading-tight line-clamp-2 font-medium">
              {analysis.resumeStrengthSummary}
            </p>
          </div>

          {/* Interview Readiness */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Interview Readiness</span>
              <span className="text-sm font-black text-amber-400 font-mono">{analysis.interviewReadinessScore}/100</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${analysis.interviewReadinessScore}%` }} />
            </div>
            <p className="text-[11px] text-white/60 leading-tight line-clamp-2 font-medium">
              {analysis.interviewReadinessSummary}
            </p>
          </div>

          {/* Total Milestones Tracker */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Roadmap Completion</span>
              <span className="text-sm font-black text-emerald-400 font-mono">{overallPct}%</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="text-[11px] text-white/60 font-semibold block">
              {totalRoadmapCompletedCount} of {totalRoadmapMilestonesCount} Milestones Done
            </span>
          </div>

        </div>

        {/* Executive Mentor Verdict */}
        <div className="bg-gradient-to-r from-emerald-950/20 to-black border-l-4 border-emerald-500 p-4 rounded-r-xl space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Vorynexa Chief Career Mentor Memo
          </span>
          <p className="text-xs text-white/90 italic font-medium leading-relaxed">
            "{analysis.mentorExecutiveVerdict}"
          </p>
        </div>

        {/* Current Skills vs Missing Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider block font-mono">
              Verified Current Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(analysis?.currentSkills || []).map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ✓ {sk}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block font-mono">
              Critical Skill Gaps to Bridge
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(analysis?.missingSkills || []).map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  ! {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* STEP 2: COMPLETE 4-STAGE ROADMAP MATRIX */}
      <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        
        {/* Stage Navigation Stepper / Tabs */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold text-white tracking-tight">Step 2: 4-Stage Execution Roadmap</h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono font-bold">
              <span>Stage Completion:</span>
              <span className="text-emerald-400">{currentStagePct}%</span>
            </div>
          </div>

          {/* 4 Stage Selector Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveStage("beginner")}
              className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                activeStage === "beginner"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20 font-black"
                  : "bg-black/40 hover:bg-black/60 text-white/70 border-white/10"
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">Stage 01</div>
              <div className="text-xs font-black mt-0.5 flex items-center justify-between">
                <span>Beginner Stage</span>
                {activeStage === "beginner" && <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={() => setActiveStage("intermediate")}
              className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                activeStage === "intermediate"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20 font-black"
                  : "bg-black/40 hover:bg-black/60 text-white/70 border-white/10"
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">Stage 02</div>
              <div className="text-xs font-black mt-0.5 flex items-center justify-between">
                <span>Intermediate Stage</span>
                {activeStage === "intermediate" && <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={() => setActiveStage("advanced")}
              className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                activeStage === "advanced"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20 font-black"
                  : "bg-black/40 hover:bg-black/60 text-white/70 border-white/10"
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">Stage 03</div>
              <div className="text-xs font-black mt-0.5 flex items-center justify-between">
                <span>Advanced Stage</span>
                {activeStage === "advanced" && <ChevronRight className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={() => setActiveStage("expert")}
              className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                activeStage === "expert"
                  ? "bg-emerald-500 text-black border-emerald-400 shadow-lg shadow-emerald-500/20 font-black"
                  : "bg-black/40 hover:bg-black/60 text-white/70 border-white/10"
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-70">Stage 04</div>
              <div className="text-xs font-black mt-0.5 flex items-center justify-between">
                <span>Expert Stage</span>
                {activeStage === "expert" && <ChevronRight className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE STAGE CONTENT CONTAINER */}
        <div className="space-y-8 pt-2">
          
          {/* Active Stage Banner & Mentor Guidance */}
          <div className="bg-black/50 border border-white/10 p-5 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                  {currentStageObj.stageName}
                </span>
                <h3 className="text-lg font-black text-white">{currentStageObj.stageTitle}</h3>
              </div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/80 font-mono">
                🕒 {currentStageObj.timeline}
              </div>
            </div>

            <p className="text-xs text-white/70 font-semibold leading-relaxed">
              💡 <strong className="text-white">Mentor Advice:</strong> {currentStageObj.mentorAdvice}
            </p>
          </div>

          {/* 1. ACTIONABLE MILESTONES & CHECKLIST */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-extrabold text-white">Stage Milestones & Interactive Task Checklist</h3>
              </div>
              <button
                onClick={() => setShowAddMilestoneModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-all cursor-pointer no-print"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Task
              </button>
            </div>

            <div className="space-y-3">
              {(allCurrentStageMilestones || []).map((m) => {
                const isDone = !!completedMilestones[m.id];
                const note = userNotes[m.id] || "";
                const isCustom = m.id.startsWith("custom_");

                return (
                  <div
                    key={m.id}
                    className={`border rounded-xl p-4 transition-all duration-200 bg-black/40 hover:bg-black/60 ${
                      isDone ? "border-emerald-500/30 opacity-60" : "border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleMilestone(m.id)}
                        className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-md border transition-all cursor-pointer shrink-0 ${
                          isDone 
                            ? "bg-emerald-500 border-emerald-500 text-black" 
                            : "border-white/20 bg-black/40 hover:border-emerald-500"
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>

                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-xs font-black text-white ${isDone ? "line-through text-white/40" : ""}`}>
                            {m.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${getPriorityStyle(m.priority)}`}>
                              {m.priority}
                            </span>
                            {isCustom && (
                              <button
                                onClick={() => handleDeleteCustomMilestone(m.id)}
                                className="text-rose-400 hover:text-rose-300 transition-all p-0.5 cursor-pointer no-print"
                                title="Delete Custom Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed font-semibold">{m.description}</p>

                        {/* Editable User Note Section */}
                        <div className="pt-2 no-print">
                          <input
                            type="text"
                            value={note}
                            onChange={(e) => handleSaveNote(m.id, e.target.value)}
                            placeholder="+ Add personal notes / links for this milestone..."
                            className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white/80 focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. LEARNING TOPICS & RECOMMENDED TOOLS STACK */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Learning Topics */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Core Learning Topics</h3>
              </div>
              <ul className="space-y-2">
                {(currentStageObj?.learningTopics || []).map((tp, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/80 font-semibold">
                    <span className="text-emerald-400 font-mono font-bold">•</span>
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Tools */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Recommended Tool Stack</h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(currentStageObj?.recommendedTools || []).map((tl, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 text-white border border-white/10 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> {tl}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* 3. RECOMMENDED PROJECTS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white">Recommended Portfolio Projects</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(currentStageObj?.recommendedProjects || []).map((prj, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Project Sprint 0{idx + 1}</span>
                    <h4 className="text-sm font-black text-white">{prj.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-semibold">{prj.description}</p>
                    
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase block">Deliverables:</span>
                      <div className="flex flex-wrap gap-1">
                        {(prj?.keyDeliverables || []).map((d, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/80 font-mono border border-white/5">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] text-emerald-300 font-semibold">
                    ⭐ <strong className="text-white">CV Impact:</strong> {prj.portfolioImpact}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CERTIFICATIONS & COURSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Certifications */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Target Certifications</h3>
              </div>

              <div className="space-y-3">
                {(currentStageObj?.recommendedCertifications || []).map((cert, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-white">{cert.name}</h4>
                      <span className="text-[11px] text-white/50 block font-semibold">{cert.issuer} • {cert.relevance}</span>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-mono font-bold shrink-0 border border-emerald-500/20">
                      {cert.estimatedCost}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Recommended Courses</h3>
              </div>

              <div className="space-y-3">
                {(currentStageObj?.courses || []).map((crs, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-white">{crs.title}</h4>
                      <span className="text-[11px] text-white/50 block font-semibold">{crs.platform} ({crs.urlOrProvider})</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold shrink-0 border ${
                      crs.type === "Free" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {crs.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 5. BOOKS & PRACTICE PLATFORMS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Books */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Recommended Books</h3>
              </div>

              <div className="space-y-3">
                {(currentStageObj?.books || []).map((bk, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white">"{bk.title}"</h4>
                      <span className="text-[10px] font-mono text-white/40">By {bk.author}</span>
                    </div>
                    <p className="text-[11px] text-white/60 font-medium leading-relaxed">{bk.whyRead}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Platforms */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Practice Platforms</h3>
              </div>

              <div className="space-y-3">
                {(currentStageObj?.practicePlatforms || []).map((pf, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-white">{pf.name}</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">{pf.focus}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 6. INTERVIEW PREPARATION & PORTFOLIO TASKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Interview Prep */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Interview Preparation Focus</h3>
              </div>

              <div className="space-y-4">
                {(currentStageObj?.interviewPreparation || []).map((ip, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl space-y-2">
                    <h4 className="text-xs font-black text-white">{ip.topic}</h4>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase block">Sample Questions:</span>
                      <ul className="space-y-1">
                        {(ip?.keyQuestions || []).map((q, i) => (
                          <li key={i} className="text-[11px] text-white/70 italic font-medium">• "{q}"</li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-[11px] text-emerald-300 font-semibold pt-1 border-t border-white/5">
                      Strategy: {ip.strategy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Tasks */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Portfolio & Showcase Deliverables</h3>
              </div>

              <ul className="space-y-2.5">
                {(currentStageObj?.portfolioTasks || []).map((pt, idx) => (
                  <li key={idx} className="bg-black/50 border border-white/5 p-3 rounded-xl flex items-center gap-2.5 text-xs text-white/80 font-semibold">
                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* 7. NETWORKING & JOB APPLICATION STRATEGY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Networking Suggestions */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Networking Tactics</h3>
              </div>

              <ul className="space-y-2">
                {(currentStageObj?.networkingSuggestions || []).map((net, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/80 font-semibold">
                    <span className="text-emerald-400 font-mono font-bold font-mono">{idx + 1}.</span>
                    <span>{net}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Application Strategy */}
            <div className="bg-black/30 border border-white/10 p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Job Application Strategy</h3>
              </div>

              <ul className="space-y-2">
                {(currentStageObj?.jobApplicationStrategy || []).map((jas, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/80 font-semibold">
                    <span className="text-emerald-400 font-mono font-bold font-mono">→</span>
                    <span>{jas}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* STEP 3 & 4: CAREER INTELLIGENCE & MARKET INSIGHTS PANEL */}
      <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">Steps 3 & 4: Profession Intelligence & Market Insights</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            {analysis.classifiedProfession || customParams.targetRole} Domain Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Salary Progression & Compensation */}
          <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Salary & Progression Trajectory</h3>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {analysis.salaryProgressionGuidance || `Entry-level ${customParams.targetRole} positions start competitively with rapid 30-50% comp jumps upon reaching Senior/Lead milestones and mastering core domain tools.`}
            </p>

            {analysis.alternativeCareerPaths && analysis.alternativeCareerPaths.length > 0 && (
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[10px] font-mono uppercase text-white/40 block font-bold">Adjacent / Alternative Roles:</span>
                <div className="space-y-2">
                  {(analysis?.alternativeCareerPaths || []).map((alt, idx) => (
                    <div key={idx} className="bg-black/50 border border-white/5 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">{alt.roleTitle}</span>
                        <span className="text-[10px] font-mono text-amber-400">Effort: {alt.transitionEffort}</span>
                      </div>
                      <p className="text-[11px] text-white/60">{alt.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Industry Trends & Emerging Skills */}
          <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Industry Trends & Emerging Skills</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40 block font-bold mb-1">Key Industry Shifts:</span>
                <ul className="space-y-1.5">
                  {(analysis.industryTrends || [
                    `AI augmentation and automation in ${customParams.targetRole} workflows`,
                    "Emphasis on cross-functional domain communication and quantitative impact",
                    "Shift towards specialized sub-domain tool mastery"
                  ]).map((tr, idx) => (
                    <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{tr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-white/40 block font-bold mb-1">Emerging Skills to Acquire:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(analysis?.emergingSkills) ? analysis.emergingSkills : ["AI Co-pilots", "Data Literacy", "Cloud Operations", "Domain Compliance"]).map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-bold rounded-md">
                      ⚡ {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Pitfalls to Avoid & LinkedIn Optimization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Common Pitfalls to Avoid</h3>
            </div>
            <ul className="space-y-2">
              {(analysis.commonMistakesToAvoid || [
                "Learning frameworks without mastering core fundamental domain principles.",
                "Neglecting real-world portfolio deliverables and verified case studies.",
                "Relying solely on online job boards without direct alumni networking."
              ]).map((pm, idx) => (
                <li key={idx} className="text-xs text-rose-200/90 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl font-medium flex items-start gap-2">
                  <span className="text-rose-400 font-bold shrink-0">⚠️</span>
                  <span>{pm}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">LinkedIn & Personal Branding Protocol</h3>
            </div>
            <ul className="space-y-2">
              {(analysis.linkedInOptimizationTips || [
                `Optimize headline: "${customParams.targetRole} | Specialist in ${customParams.preferredIndustry}"`,
                "Featured Section: Pin top capstone deliverable and case study link.",
                "Post weekly breakdown of a real-world problem solved during roadmap execution."
              ]).map((tip, idx) => (
                <li key={idx} className="text-xs text-white/80 font-medium flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* STEP 6: MOTIVATION & WELL-BEING MENTORSHIP BANNER */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-black to-slate-950 border border-emerald-500/30 p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white tracking-tight">Step 6: Career Resilience & Mindset Coach</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Daily Mindset Protocol</span>
        </div>

        <p className="text-xs text-white/80 leading-relaxed font-medium">
          Remember: Transforming into a top 1% {customParams.targetRole} is a marathon of consistency, not an overnight sprint. Breakdown intimidating goals into 25-minute focused daily deep-work blocks. Celebrate every milestone checked off in this roadmap!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-white/40 block uppercase">Daily Target</span>
            <span className="text-xs font-black text-emerald-400 block">{customParams.availableTime || "2 Hours / Day"}</span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-white/40 block uppercase">Learning Pace</span>
            <span className="text-xs font-black text-amber-300 block">{customParams.learningSpeed || "Standard (1x)"}</span>
          </div>

          <div className="bg-black/40 border border-white/10 p-3 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-mono text-white/40 block uppercase">Consistency Strategy</span>
            <span className="text-xs font-black text-sky-400 block">1 Milestone Every 3 Days</span>
          </div>
        </div>
      </div>

      {/* ADD CUSTOM MILESTONE MODAL */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-[#111] border border-white/15 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-black text-white">Add Custom Milestone Task</h3>
              <button onClick={() => setShowAddMilestoneModal(false)} className="text-white/40 hover:text-white text-xs font-mono">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Build AWS CloudFormation Template"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Task Description</label>
                <textarea
                  value={newMilestoneDesc}
                  onChange={(e) => setNewMilestoneDesc(e.target.value)}
                  placeholder="Details and deliverables for this action item..."
                  rows={3}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1">Priority Level</label>
                <select
                  value={newMilestonePriority}
                  onChange={(e) => setNewMilestonePriority(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomMilestone}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl"
              >
                Save Custom Task
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
