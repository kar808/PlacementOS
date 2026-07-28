import React, { useState } from "react";
import { StudentProfile, UniversalProfessionClassification, UniversalProfessionDomain } from "../types";
import {
  Compass,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  Key,
  Layout,
  Award,
  Layers,
  TrendingUp,
  FolderGit,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Briefcase,
  Sliders,
  Cpu,
  Stethoscope,
  Scale,
  DollarSign,
  Megaphone,
  Users,
  Palette,
  Building,
  Microscope,
  GraduationCap,
  Utensils,
  Landmark,
  ShieldAlert,
  Sprout,
  Tv,
  Trophy,
  Hammer,
  Rocket,
  Globe,
  Lock,
  Cloud,
  BarChart,
  Dna,
  Factory,
  Radio
} from "lucide-react";

interface UniversalProfessionEngineProps {
  profile: StudentProfile;
  callServerEndpoint?: (endpoint: string, body: any) => Promise<any>;
  onSelectProfessionForResume?: (classification: UniversalProfessionClassification) => void;
}

// Preset Major Career Domains to support instant exploration across all requested categories
export const MAJOR_CAREER_DOMAINS: UniversalProfessionDomain[] = [
  {
    id: "engineering",
    name: "Engineering & Technology",
    category: "STEM & Infrastructure",
    description: "Civil, Mechanical, Electrical, Chemical, Structural, and Environmental Systems Engineering.",
    commonRoles: ["Mechanical Design Engineer", "Civil Structural Engineer", "Electrical Systems Lead", "Chemical Process Engineer"],
    iconName: "Building",
    sampleTerminology: ["CAD/CAM", "Finite Element Analysis (FEA)", "HVAC", "SCADA", "Thermal Dynamics", "BIM"],
    sampleAtsKeywords: ["Root Cause Analysis", "Tolerance Stackup", "DFMEA", "Process Optimization", "SolidWorks"],
    defaultTemplate: "Modern"
  },
  {
    id: "medicine",
    name: "Medicine & Healthcare",
    category: "Health & Clinical Sciences",
    description: "Clinical Practice, Nursing, Surgery, Pharmacy, Physical Therapy, and Telehealth.",
    commonRoles: ["Clinical Nurse Specialist", "Attending Physician", "Pharmaceutical Researcher", "Physical Therapist"],
    iconName: "Stethoscope",
    sampleTerminology: ["ICD-10", "EHR / EMR", "HIPAA Compliance", "Clinical Triage", "Patient Vitals", "Pharmacokinetics"],
    sampleAtsKeywords: ["Patient Care Management", "Diagnostic Accuracy", "Clinical Rounds", "Protocol Compliance"],
    defaultTemplate: "Executive"
  },
  {
    id: "law",
    name: "Law & Legal Services",
    category: "Legal & Judiciary",
    description: "Corporate Law, Criminal Defense, Intellectual Property, Litigation, and Paralegal Services.",
    commonRoles: ["Corporate Associate", "IP & Patent Attorney", "Commercial Litigator", "Legal Compliance Officer"],
    iconName: "Scale",
    sampleTerminology: ["Tort Law", "Discovery Phase", "Deposition", "Legal Briefs", "Contract Drafting", "Affidavits"],
    sampleAtsKeywords: ["Risk Mitigation", "Regulatory Filing", "Due Diligence", "Case Precedent Analysis", "Jurisdiction"],
    defaultTemplate: "Executive"
  },
  {
    id: "finance",
    name: "Finance & Investment",
    category: "Financial Services",
    description: "Investment Banking, Accounting (CPA), Equity Research, Wealth Management, and Corporate Treasury.",
    commonRoles: ["Financial Analyst", "Investment Banker", "Corporate Accountant (CPA)", "Risk Quant"],
    iconName: "DollarSign",
    sampleTerminology: ["GAAP / IFRS", "EBITDA", "DCF Valuation", "Financial Modeling", "Portfolio Rebalancing"],
    sampleAtsKeywords: ["Capital Allocation", "Variance Analysis", "Financial Reporting", "Audit Risk", "Bloomberg Terminal"],
    defaultTemplate: "Corporate"
  },
  {
    id: "marketing",
    name: "Marketing & Growth",
    category: "Commercial & Brand Strategy",
    description: "Digital Growth, Performance Marketing, Product Marketing, SEO, Content, and Brand Strategy.",
    commonRoles: ["Growth Marketing Manager", "Product Marketing Lead", "SEO / Content Specialist", "Brand Strategist"],
    iconName: "Megaphone",
    sampleTerminology: ["CAC / LTV Ratio", "Conversion Rate Optimization (CRO)", "A/B Testing", "ROAS", "Funnel Metrics"],
    sampleAtsKeywords: ["Multi-Channel Campaigns", "Audience Segmentation", "Google Analytics 4", "Demand Generation"],
    defaultTemplate: "Creative"
  },
  {
    id: "sales",
    name: "Sales & Account Management",
    category: "Revenue & Commercial",
    description: "Enterprise Sales (AE), Business Development, SDR, Solutions Engineering, and Key Account Management.",
    commonRoles: ["Enterprise Account Executive", "Solutions Consultant", "Business Development Manager"],
    iconName: "Briefcase",
    sampleTerminology: ["Salesforce CRM", "MEDDPICC Framework", "Annual Contract Value (ACV)", "Pipeline Velocity"],
    sampleAtsKeywords: ["Quota Attainment", "Territory Expansion", "Deal Closing", "Key Account Management", "Churn Reduction"],
    defaultTemplate: "Corporate"
  },
  {
    id: "human_resources",
    name: "Human Resources & People Ops",
    category: "Corporate Management",
    description: "Talent Acquisition, People Operations, HR Business Partner (HRBP), Compensation & Benefits.",
    commonRoles: ["Technical Recruiter", "HR Business Partner", "People Operations Lead", "Talent Development Manager"],
    iconName: "Users",
    sampleTerminology: ["Workday ATS", "Employee Retention", "Performance Appraisals", "DEI Programs", "eNPS"],
    sampleAtsKeywords: ["Talent Pipeline", "Onboarding Workflows", "HR Policy Compliance", "Succession Planning"],
    defaultTemplate: "Corporate"
  },
  {
    id: "design",
    name: "Design & User Experience",
    category: "Creative & Product UI/UX",
    description: "UI/UX Design, Product Design, Visual Brand Identity, Interaction Design, and Motion Graphics.",
    commonRoles: ["Senior Product Designer", "UI/UX Researcher", "Brand Identity Designer", "Design Systems Lead"],
    iconName: "Palette",
    sampleTerminology: ["Figma Design Systems", "User Journey Mapping", "Wireframing", "Usability Testing", "Design Tokens"],
    sampleAtsKeywords: ["Heuristic Evaluation", "Accessibility (WCAG)", "Prototyping", "Design System Architecture"],
    defaultTemplate: "Creative"
  },
  {
    id: "architecture",
    name: "Architecture & Urban Planning",
    category: "Built Environment",
    description: "Architectural Design, BIM Management, Sustainable Urban Planning, and Interior Architecture.",
    commonRoles: ["Licensed Architect", "BIM Specialist", "Urban Designer", "Sustainable Building Consultant"],
    iconName: "Building",
    sampleTerminology: ["Autodesk Revit", "BIM Level 2", "LEED Accreditation", "Building Codes", "Structural Detailing"],
    sampleAtsKeywords: ["Construction Documentation", "Zoning Compliance", "Spatial Planning", "Schematic Design"],
    defaultTemplate: "Executive"
  },
  {
    id: "research",
    name: "Research & Development (R&D)",
    category: "Scientific & Academic",
    description: "Scientific Investigation, Industrial R&D, Clinical Trial Design, Social Sciences, and Quantitative Research.",
    commonRoles: ["R&D Scientist", "Principal Researcher", "Clinical Trial Manager", "Quantitative Research Associate"],
    iconName: "Microscope",
    sampleTerminology: ["Peer-Reviewed Publication", "Experimental Protocol", "Hypothesis Testing", "SPSS / R Analysis"],
    sampleAtsKeywords: ["Grant Writing", "Data Collection Protocol", "Statistical Significance", "Laboratory Safety"],
    defaultTemplate: "Research"
  },
  {
    id: "education",
    name: "Education & Pedagogy",
    category: "Academia & Training",
    description: "Higher Education Faculty, K-12 Teaching, Curriculum Development, Educational Leadership, and EdTech.",
    commonRoles: ["University Assistant Professor", "Instructional Designer", "Curriculum Specialist", "EdTech Product Lead"],
    iconName: "GraduationCap",
    sampleTerminology: ["Bloom's Taxonomy", "LMS (Canvas/Blackboard)", "Pedagogical Strategy", "Differentiated Instruction"],
    sampleAtsKeywords: ["Curriculum Mapping", "Student Learning Outcomes", "Formative Assessment", "Classroom Management"],
    defaultTemplate: "Academic"
  },
  {
    id: "hospitality",
    name: "Hospitality & Culinary Arts",
    category: "Service & Tourism",
    description: "Hotel Operations, Executive Culinary Management, Event Planning, and Food & Beverage Strategy.",
    commonRoles: ["General Manager - Hotel", "Executive Chef", "Director of Event Operations", "F&B Manager"],
    iconName: "Utensils",
    sampleTerminology: ["HACCP Standards", "Food Cost Margin", "RevPAR (Revenue Per Room)", "Banquet Event Orders (BEO)"],
    sampleAtsKeywords: ["Guest Satisfaction Index", "Menu Engineering", "Inventory Auditing", "Staff Leadership"],
    defaultTemplate: "Minimal"
  },
  {
    id: "government",
    name: "Government & Public Policy",
    category: "Public Sector",
    description: "Civil Service Administration, Policy Analysis, Diplomatic Service, and Foreign Relations.",
    commonRoles: ["Public Policy Analyst", "Civil Service Administrator", "Legislative Assistant", "Urban Planner"],
    iconName: "Landmark",
    sampleTerminology: ["FOIA Requests", "Regulatory Impact Analysis", "Interagency Coordination", "Public Appropriations"],
    sampleAtsKeywords: ["Policy Evaluation", "Stakeholder Engagement", "Bipartisan Consensus", "Statutory Compliance"],
    defaultTemplate: "Executive"
  },
  {
    id: "defence",
    name: "Defence & National Security",
    category: "Security & Operations",
    description: "Military Leadership, Intelligence Analysis, Defence Systems Technology, Strategic Logistics.",
    commonRoles: ["Intelligence Analyst", "Defence Systems Project Manager", "Logistics Operations Lead"],
    iconName: "ShieldAlert",
    sampleTerminology: ["COMSEC / OPSEC", "SIGINT / HUMINT", "Tactical Command", "Supply Chain Readiness"],
    sampleAtsKeywords: ["Security Clearance (TS/SCI)", "Risk Assessment", "Tactical Execution", "Asset Management"],
    defaultTemplate: "Executive"
  },
  {
    id: "agriculture",
    name: "Agriculture & Agritech",
    category: "Bio-Resources & Food Systems",
    description: "Agronomy, Precision Agriculture, Sustainable Farming Systems, and Agribusiness Management.",
    commonRoles: ["Agronomist", "Precision Ag Specialist", "Farm Operations Manager", "Agribusiness Supply Lead"],
    iconName: "Sprout",
    sampleTerminology: ["Soil Chemistry (pH/NPK)", "Crop Yield Optimization", "Drip Irrigation", "USDA Organic Standards"],
    sampleAtsKeywords: ["Sustainable Agriculture", "Pest Management (IPM)", "Satellite Imagery Analysis", "Harvest Planning"],
    defaultTemplate: "Minimal"
  },
  {
    id: "media",
    name: "Media, Journalism & Broadcasting",
    category: "Creative Media",
    description: "Broadcast Journalism, Film Production, Digital Publishing, Public Relations, and Audio Broadcasting.",
    commonRoles: ["Investigative Journalist", "Video Producer & Editor", "PR Communications Manager", "Podcast Producer"],
    iconName: "Tv",
    sampleTerminology: ["Adobe Premiere / DaVinci", "Press Releases", "Media Syndication", "Audio Mixing", "Editorial Calendar"],
    sampleAtsKeywords: ["Media Relations", "Crisis Communications", "Storyboarding", "Broadcast Quality", "Copywriting"],
    defaultTemplate: "Creative"
  },
  {
    id: "sports",
    name: "Sports & Athletics",
    category: "Sports Industry",
    description: "Sports Management, Athletic Performance, Sports Analytics, Coaching, and Franchise Operations.",
    commonRoles: ["Sports Analytics Specialist", "Athletic Trainer", "Sports Agent / Manager", "Performance Coach"],
    iconName: "Trophy",
    sampleTerminology: ["Biometrics Tracking", "Kinematics Analysis", "Player Evaluation Models", "Sponsorship Contracts"],
    sampleAtsKeywords: ["Athletic Performance", "Injury Prevention Protocol", "Data-Driven Scouting", "Game Planning"],
    defaultTemplate: "Modern"
  },
  {
    id: "arts",
    name: "Arts & Humanities",
    category: "Culture & Creative",
    description: "Fine Arts, Performing Arts, Museum Curation, Art History, and Creative Literary Writing.",
    commonRoles: ["Museum Curator", "Fine Artist / Sculptor", "Creative Writer & Dramaturg", "Gallery Director"],
    iconName: "Palette",
    sampleTerminology: ["Provenance Verification", "Curatorial Concept", "Exhibition Design", "Archival Conservation"],
    sampleAtsKeywords: ["Art Installation", "Gallery Curation", "Grant Acquisition", "Artistic Direction"],
    defaultTemplate: "Creative"
  },
  {
    id: "trades",
    name: "Skilled Trades & Craftsmanship",
    category: "Applied Skilled Industry",
    description: "Electrical Systems, Master Plumbing, HVAC Installation, Machining, Welding, and Carpentry.",
    commonRoles: ["Master Electrician", "HVAC Systems Lead", "CNC Machining Technician", "Structural Welder"],
    iconName: "Hammer",
    sampleTerminology: ["NEC (National Electrical Code)", "Blueprint Reading", "PLC Wiring", "Refrigerant Handling (EPA 608)"],
    sampleAtsKeywords: ["OSHA Safety Certified", "Preventive Maintenance", "Equipment Calibration", "Troubleshooting"],
    defaultTemplate: "Minimal"
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship & Startup Founders",
    category: "Business Venture",
    description: "Startup Founders, Venture Builders, Product Visionaries, and Small Business Owners.",
    commonRoles: ["Co-Founder & CEO", "Head of Product & Growth", "Venture Builder", "Franchise Owner"],
    iconName: "Rocket",
    sampleTerminology: ["Product-Market Fit (PMF)", "Pitch Decks", "Venture Capital / Seed", "Cap Table Management", "KPI Metrics"],
    sampleAtsKeywords: ["0-to-1 Product Launch", "P&L Management", "Investor Relations", "Team Scaling", "Unit Economics"],
    defaultTemplate: "Modern"
  },
  {
    id: "freelancing",
    name: "Freelancing & Independent Consulting",
    category: "Independent Professional",
    description: "Independent Contractors, Specialized Consultants, Fractional Executives, and Solopreneurs.",
    commonRoles: ["Fractional CMO", "Independent IT Consultant", "Contract Copywriter", "Freelance Developer"],
    iconName: "Globe",
    sampleTerminology: ["Scope of Work (SOW)", "Retainer Agreements", "Client Onboarding", "Milestone Delivery"],
    sampleAtsKeywords: ["Client Acquisition", "Project Management", "Multi-Client Delivery", "Value-Based Pricing"],
    defaultTemplate: "Minimal"
  },
  {
    id: "ai",
    name: "Artificial Intelligence & ML",
    category: "Emerging Tech",
    description: "Machine Learning Engineering, AI Research, LLM Fine-Tuning, Computer Vision, and Prompt Engineering.",
    commonRoles: ["AI / ML Engineer", "LLM Research Scientist", "Computer Vision Specialist", "AI Ethics & Safety Lead"],
    iconName: "Cpu",
    sampleTerminology: ["PyTorch / TensorFlow", "Transformer Architecture", "RAG Pipelines", "Reinforcement Learning (RLHF)"],
    sampleAtsKeywords: ["Model Evaluation", "Hyperparameter Tuning", "Fine-Tuning LLMs", "Vector Databases", "MLOps"],
    defaultTemplate: "Modern"
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & InfoSec",
    category: "Security & Risk",
    description: "Penetration Testing, SOC Operations, Security Architecture, Incident Response, and Governance (GRC).",
    commonRoles: ["Penetration Tester", "SOC Security Analyst", "Information Security Architect", "GRC Lead"],
    iconName: "Lock",
    sampleTerminology: ["SIEM (Splunk/QRadar)", "Zero Trust Architecture", "NIST Framework", "Vulnerability Assessment", "SOC 2"],
    sampleAtsKeywords: ["Threat Hunting", "Incident Response", "Penetration Testing", "PenTest Reports", "Cryptographic Protocols"],
    defaultTemplate: "Corporate"
  },
  {
    id: "cloud",
    name: "Cloud Computing & DevOps",
    category: "Infrastructure & Platform",
    description: "Cloud Architecture (AWS/GCP/Azure), Kubernetes, Infrastructure-as-Code (IaC), and SRE.",
    commonRoles: ["Cloud Systems Architect", "DevOps Engineer", "Site Reliability Engineer (SRE)", "Platform Lead"],
    iconName: "Cloud",
    sampleTerminology: ["Kubernetes (K8s)", "Terraform IaC", "CI/CD Pipelines", "Docker Containerization", "AWS Lambda"],
    sampleAtsKeywords: ["High Availability (HA)", "Disaster Recovery", "Cloud Security", "Cost Optimization (FinOps)", "Microservices"],
    defaultTemplate: "Modern"
  },
  {
    id: "data_science",
    name: "Data Science & Big Data",
    category: "Data Analytics",
    description: "Data Engineering, Business Intelligence, Big Data Analytics, Statistical Modeling, and Quantitative Research.",
    commonRoles: ["Senior Data Engineer", "Data Scientist", "BI Analytics Manager", "Quantitative Analyst"],
    iconName: "BarChart",
    sampleTerminology: ["Apache Spark / Snowflake", "ETL / ELT Pipelines", "SQL Analytics", "Predictive Modeling", "Pandas"],
    sampleAtsKeywords: ["Data Warehousing", "Feature Engineering", "A/B Experimentation", "Statistical Inference", "dbt"],
    defaultTemplate: "Modern"
  },
  {
    id: "biotechnology",
    name: "Biotechnology & Life Sciences",
    category: "Biomedical & Bio-Tech",
    description: "Genomics, Computational Biology, Bioprocess Engineering, Bioinformatics, and Molecular Diagnostics.",
    commonRoles: ["Bioinformatics Specialist", "Bioprocess Development Engineer", "Genomics Researcher"],
    iconName: "Dna",
    sampleTerminology: ["CRISPR Gene Editing", "Next-Gen Sequencing (NGS)", "HPLC Analysis", "Bioreactor Scaling", "GMP Compliance"],
    sampleAtsKeywords: ["Assay Development", "Molecular Biology", "Clinical Trial Protocol", "Bio-Analytical Validation"],
    defaultTemplate: "Research"
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Supply Chain",
    category: "Industrial & Logistics",
    description: "Industrial Automation, Lean Manufacturing, Six Sigma Quality Control, and Global Supply Chain Management.",
    commonRoles: ["Industrial Engineer", "Plant Operations Manager", "Quality Assurance Manager", "Supply Chain Director"],
    iconName: "Factory",
    sampleTerminology: ["Six Sigma Green/Black Belt", "Kanban / Kaizen", "PLC Automation", "ERP (SAP/Oracle)", "OEE"],
    sampleAtsKeywords: ["Process Optimization", "Supply Chain Planning", "Root Cause Corrective Action (RCCA)", "Inventory Turnover"],
    defaultTemplate: "Corporate"
  },
  {
    id: "future",
    name: "Future & Emerging Professions",
    category: "Frontier Professions",
    description: "Space Technology, Quantum Computing, Climate Decarbonization, Synthetic Biology, and Autonomous Systems.",
    commonRoles: ["Quantum Algorithm Developer", "Decarbonization Engineer", "Spacecraft Systems Engineer", "Autonomous Mobility Specialist"],
    iconName: "Radio",
    sampleTerminology: ["Qiskit / Cirq", "Carbon Capture (CCUS)", "Orbital Mechanics", "ROS2 (Robot Operating System)"],
    sampleAtsKeywords: ["Frontier Technology", "Cross-Disciplinary R&D", "Prototype Validation", "Patent Disclosures"],
    defaultTemplate: "Research"
  }
];

export default function UniversalProfessionEngine({
  profile,
  callServerEndpoint,
  onSelectProfessionForResume
}: UniversalProfessionEngineProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<UniversalProfessionDomain>(MAJOR_CAREER_DOMAINS[0]);
  const [customRoleInput, setCustomRoleInput] = useState<string>("");
  
  // AI Classification state
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [classificationResult, setClassificationResult] = useState<UniversalProfessionClassification | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(null);
  
  // Clarification questions state
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>({});

  // Filtered list of domains
  const filteredDomains = MAJOR_CAREER_DOMAINS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.commonRoles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger AI Classification
  const handleClassifyRole = async (roleToRun?: string, answersToPass?: Record<string, string>) => {
    const roleInput = roleToRun || customRoleInput.trim() || selectedDomain.commonRoles[0] || profile.targetRoles?.[0] || "Software Engineer";
    
    setIsClassifying(true);
    setClassificationError(null);

    try {
      let result: UniversalProfessionClassification;
      const payload = {
        targetRole: roleInput,
        profile,
        domainHint: selectedDomain.name,
        customDescription: searchQuery,
        userAnswers: answersToPass || clarificationAnswers
      };

      if (callServerEndpoint) {
        result = await callServerEndpoint("/api/placement/profession-classify", payload);
      } else {
        const res = await fetch("/api/placement/profession-classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        result = await res.json();
      }

      setClassificationResult(result);
    } catch (err: any) {
      console.error("Profession classification error:", err);
      setClassificationError(err.message || "Failed to classify profession. Please check connection and try again.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAnswerSubmit = (qIndex: number, answerText: string) => {
    const updated = { ...clarificationAnswers, [`question_${qIndex}`]: answerText };
    setClarificationAnswers(updated);
  };

  const handleApplyClarification = () => {
    handleClassifyRole(undefined, clarificationAnswers);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Universal Profession Intelligence Engine (UPIE)
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Classify Any Industry & Profession Before Resume Generation
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Vorynexa automatically adapts terminology, ATS keywords, layout templates, certifications, and career roadmaps strictly to your target profession—guaranteeing zero domain confusion whether you are in Medicine, Law, Engineering, Skilled Trades, or AI.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleClassifyRole()}
              disabled={isClassifying}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isClassifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" /> Classifying Profession...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-yellow-300" /> Classify Active Role
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Profession Classifier Input & Domain Library */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Domain Selector & Quick Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" /> Career Domain Library
              </h3>
              <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {MAJOR_CAREER_DOMAINS.length} Domains
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search Medicine, Law, Trades, AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Domain List */}
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredDomains.map((domain) => {
                const isSelected = selectedDomain.id === domain.id;
                return (
                  <button
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomain(domain);
                      setCustomRoleInput(domain.commonRoles[0] || "");
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/50 text-white shadow-md shadow-blue-500/10"
                        : "bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold truncate text-white">{domain.name}</p>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{domain.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Custom Input & AI Intelligence Display */}
        <div className="lg:col-span-8 space-y-6">
          {/* Custom Role Input Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" /> AI Profession Classification Engine
            </h3>
            <p className="text-xs text-slate-400">
              Type your exact target role or custom job title to analyze its industry classification, domain jargon, recruiter ATS keywords, and optimal resume template before building.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={`e.g. ${selectedDomain.commonRoles[0] || "Orthopedic Surgeon, M&A Litigator, Solar Technician, Quantum Developer"}`}
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                onClick={() => handleClassifyRole(customRoleInput)}
                disabled={isClassifying}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isClassifying ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Classify Profession
                  </>
                )}
              </button>
            </div>

            {/* Quick Preset Roles for Current Domain */}
            <div className="pt-2">
              <p className="text-[11px] font-medium text-slate-400 mb-2">Common Roles in {selectedDomain?.name || "Selected Domain"}:</p>
              <div className="flex flex-wrap gap-2">
                {(selectedDomain?.commonRoles || []).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCustomRoleInput(role);
                      handleClassifyRole(role);
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs text-slate-200 transition-colors"
                  >
                    + {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Classification Error Alert */}
          {classificationError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{classificationError}</span>
            </div>
          )}

          {/* AI Classification Intelligence Results */}
          {classificationResult ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Classification Summary Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-semibold border border-blue-500/20">
                        {classificationResult.industry}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-semibold border border-purple-500/20">
                        {classificationResult.careerStage}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-2">
                      {classificationResult.primaryProfession}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Specialization: <span className="text-slate-200 font-medium">{classificationResult.specialization}</span>
                    </p>
                  </div>

                  {/* Confidence Score Gauge */}
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Confidence</p>
                      <p className={`text-lg font-extrabold ${classificationResult.confidenceScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}>
                        {classificationResult.confidenceScore}%
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${classificationResult.confidenceScore >= 80 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {classificationResult.confidenceScore >= 80 ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Clarification Step if Confidence < 80 */}
                {classificationResult.needsClarification && classificationResult.clarificationQuestions && classificationResult.clarificationQuestions.length > 0 && (
                  <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                      <HelpCircle className="w-4 h-4 text-amber-400" /> Low Confidence Clarification Required
                    </div>
                    <p className="text-xs text-slate-300">
                      The AI detected multiple sub-specializations for this role. Answering these quick questions will refine terminology and prevent domain confusion:
                    </p>
                    <div className="space-y-3">
                      {classificationResult.clarificationQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-xs text-slate-200 font-medium">{q}</label>
                          <input
                            type="text"
                            placeholder="Type specific details..."
                            value={clarificationAnswers[`question_${idx}`] || ""}
                            onChange={(e) => handleAnswerSubmit(idx, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleApplyClarification}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Refine & Re-Classify
                    </button>
                  </div>
                )}

                {/* Terminology & ATS Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Domain Terminology */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Domain Terminology & Jargon
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(classificationResult?.domainTerminology || []).map((term, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-mono">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* High-Impact ATS Keywords */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-emerald-400" /> Recruiter ATS Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(classificationResult?.atsKeywords || []).map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Resume Template & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Template Recommendation */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-purple-400" /> Recommended Template Style
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-300">{classificationResult.recommendedTemplateStyle} Layout</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-semibold rounded">
                        Optimal for {classificationResult.primaryProfession}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Standardized structure tailored to expectations of recruiters in {classificationResult.industry}.
                    </p>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-yellow-400" /> Recommended Certifications
                    </h4>
                    <ul className="space-y-1">
                      {classificationResult.recommendedCertifications?.map((c, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-medium text-white">{c.name}</span> <span className="text-slate-500">({c.issuingBody})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Projects */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <FolderGit className="w-3.5 h-3.5 text-indigo-400" /> Recommended Role-Authentic Projects
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classificationResult.recommendedProjects?.map((proj, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <p className="text-xs font-semibold text-white">{proj.title}</p>
                        <p className="text-[11px] text-slate-400">{proj.objective}</p>
                        <p className="text-[10px] text-emerald-400 font-medium">Impact: {proj.resumeImpact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Roadmap Milestones */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Career Progression Roadmap
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {classificationResult.careerRoadmap?.map((stage, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                        <span className="text-[10px] text-cyan-400 font-bold uppercase">{stage.phase} ({stage.timeframe})</span>
                        <p className="text-xs font-semibold text-white">{stage.focusMilestone}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {stage.keySkillsToMaster?.map((sk, skIdx) => (
                            <span key={skIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate Resume Action */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      if (onSelectProfessionForResume && classificationResult) {
                        onSelectProfessionForResume(classificationResult);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                  >
                    Generate Resume for {classificationResult.primaryProfession} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Fallback Card when no custom classification active yet */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-semibold border border-blue-500/20">
                    {selectedDomain.category}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedDomain.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{selectedDomain.description}</p>
                </div>
              </div>

              {/* Sample Jargon & ATS Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Standard Domain Terminology
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDomain?.sampleTerminology || []).map((term, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-xs font-mono border border-blue-500/20">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-emerald-400" /> High-Weight ATS Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedDomain?.sampleAtsKeywords || []).map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Common Roles Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  Click <span className="text-white font-medium">"Classify Profession"</span> to run real-time AI classification for any role in this domain.
                </p>
                <button
                  onClick={() => handleClassifyRole(selectedDomain.commonRoles[0])}
                  disabled={isClassifying}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50"
                >
                  {isClassifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Classify {selectedDomain.commonRoles[0]}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
