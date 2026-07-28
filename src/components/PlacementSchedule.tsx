import React, { useState, useEffect } from "react";
import { StudentProfile } from "../types";
import { 
  Calendar, 
  Download, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Briefcase, 
  Flame, 
  Search, 
  ChevronRight, 
  Award,
  Filter,
  CheckCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Bell,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  X,
  CalendarDays,
  Info,
  Compass,
  Target,
  RefreshCw,
  Edit3,
  Layers,
  Send,
  Check
} from "lucide-react";

interface PlacementScheduleProps {
  profile: StudentProfile;
  onTargetRoleChange?: (newRole: string, newIndustry?: string) => void;
}

interface CalendarTask {
  day: number;
  title: string;
  category: "Study" | "Application" | "Outreach" | "Portfolio";
  description: string;
  duration: string;
  deliverable: string;
  isCompleted?: boolean;
  skillGaps?: string[];
  deadlineDate?: string;
}

interface CompanyDeadline {
  id: string;
  company: string;
  role: string;
  date: string; // YYYY-MM-DD
  skillGaps: string[];
}

export const MAJOR_CAREER_DOMAINS = [
  { id: "software", name: "Software & Tech", defaultRole: "Software Engineer" },
  { id: "datascience", name: "Data Science & AI", defaultRole: "Data Scientist" },
  { id: "product", name: "Product Management", defaultRole: "Product Manager" },
  { id: "cybersecurity", name: "Cybersecurity", defaultRole: "Cybersecurity Analyst" },
  { id: "finance", name: "Finance & Banking", defaultRole: "Financial Analyst" },
  { id: "healthcare", name: "Healthcare & Clinical", defaultRole: "Clinical Specialist" },
  { id: "marketing", name: "Marketing & Growth", defaultRole: "Growth Marketer" },
  { id: "engineering", name: "Core Engineering", defaultRole: "Mechanical Engineer" },
  { id: "universal", name: "Universal General", defaultRole: "Professional Analyst" }
];

export const getDomainCategory = (role: string = "", domain: string = ""): string => {
  const combined = `${role} ${domain}`.toLowerCase();
  if (combined.includes("data") || combined.includes("ai") || combined.includes("machine learning") || combined.includes("analytics") || combined.includes("intelligence")) {
    return "Data Science & AI";
  }
  if (combined.includes("product") || combined.includes("program manager") || combined.includes("business analyst")) {
    return "Product Management";
  }
  if (combined.includes("cyber") || combined.includes("security") || combined.includes("soc") || combined.includes("network")) {
    return "Cybersecurity";
  }
  if (combined.includes("finance") || combined.includes("banking") || combined.includes("investment") || combined.includes("accounting") || combined.includes("fintech")) {
    return "Finance & Banking";
  }
  if (combined.includes("health") || combined.includes("clinical") || combined.includes("medical") || combined.includes("nursing") || combined.includes("biotech")) {
    return "Healthcare & Clinical";
  }
  if (combined.includes("marketing") || combined.includes("growth") || combined.includes("ui") || combined.includes("ux") || combined.includes("design")) {
    return "Marketing & Design";
  }
  if (combined.includes("mechanical") || combined.includes("electrical") || combined.includes("civil") || combined.includes("robotics") || combined.includes("hardware") || combined.includes("cad")) {
    return "Core Engineering";
  }
  return "Software Engineering";
};

export const getGapsForTaskAndDomain = (day: number, category: string, domainCat: string): string[] => {
  if (domainCat === "Data Science & AI") {
    if (category === "Study") return day <= 15 ? ["SQL Complex Joins & Window Functions", "Exploratory Data Analysis (EDA)"] : ["Scikit-Learn Feature Pipelines", "Model Hyperparameter Tuning"];
    if (category === "Portfolio") return ["Interactive Streamlit AI Dashboard", "Kaggle Dataset Documentation"];
    if (category === "Outreach") return ["Data Science Lead Cold Messages", "AI Research Alumni Networking"];
    return ["Quantifiable Analytics Accomplishments", "Jupyter Notebook Case Studies"];
  }

  if (domainCat === "Product Management") {
    if (category === "Study") return day <= 15 ? ["PRD Drafting & User Personas", "RICE / ICE Feature Prioritization"] : ["North Star Metrics & Funnel Analysis", "A/B Testing Experimentation"];
    if (category === "Portfolio") return ["Figma Interactive Wireframe Prototype", "Product Strategy Deck PDF"];
    if (category === "Outreach") return ["Senior PM & Group PM Coffee Chats", "Product School Alumni Outreach"];
    return ["Measurable Business Outcome Metrics", "Product Teardown Case Studies"];
  }

  if (domainCat === "Cybersecurity") {
    if (category === "Study") return day <= 15 ? ["OWASP Top 10 Web Vulnerabilities", "Wireshark Packet Analysis"] : ["Threat Modeling & MITRE ATT&CK", "Cloud IAM Policy Security Audits"];
    if (category === "Portfolio") return ["Pen-Testing Vulnerability Report", "SIEM Log Analysis Dashboard"];
    if (category === "Outreach") return ["CISO & SOC Lead Networking", "InfoSec Guild Connections"];
    return ["Security Certifications (CompTIA/CISSP)", "Vulnerability Remediation Logs"];
  }

  if (domainCat === "Finance & Banking") {
    if (category === "Study") return day <= 15 ? ["3-Statement Financial Modeling", "Discounted Cash Flow (DCF) Valuation"] : ["LBO Fundamentals & Sensitivity Analysis", "Bloomberg/Refinitiv Terminal Drills"];
    if (category === "Portfolio") return ["Comprehensive Equity Research Report", "Financial Valuation Excel Model"];
    if (category === "Outreach") return ["Investment Banking Analyst Outreach", "Finance Guild Alumni Cold Intro"];
    return ["Transaction Summaries & Financial Ratios", "Valuation Assumptions Rationale"];
  }

  if (domainCat === "Healthcare & Clinical") {
    if (category === "Study") return day <= 15 ? ["Clinical Care Guidelines & Protocols", "Medical Ethics & HIPAA Compliance"] : ["NCLEX / Licensure Drill Question Sets", "EHR Workflow & Patient Care Audits"];
    if (category === "Portfolio") return ["Clinical Case Study Analysis", "Healthcare Operations Protocol Guide"];
    if (category === "Outreach") return ["Clinical Director & Nursing Leads", "Health System Alumni Connections"];
    return ["Licensure Verification Credentials", "Clinical Hours Documentation"];
  }

  if (domainCat === "Marketing & Design") {
    if (category === "Study") return day <= 15 ? ["Conversion Funnel & CAC/LTV Metrics", "Figma Design System Best Practices"] : ["Google/Meta Analytics Certifications", "Growth A/B Testing Copy Writing"];
    if (category === "Portfolio") return ["Figma Component Design System", "Growth Marketing Campaign Case Study"];
    if (category === "Outreach") return ["Creative Director & Growth Lead Introductions", "Dribbble/Behance Networking"];
    return ["User Acquisition Growth Charts", "Conversion Rate Optimization Metrics"];
  }

  if (domainCat === "Core Engineering") {
    if (category === "Study") return day <= 15 ? ["CAD / SolidWorks 3D Modeling", "FE / Fundamentals of Engineering Review"] : ["Circuit Simulation / Microcontrollers", "Project Costing & Quality ISO Standards"];
    if (category === "Portfolio") return ["Engineering Technical Spec Sheet", "3D Schematic Assembly Manual"];
    if (category === "Outreach") return ["Plant Manager & Senior Engineer Outreach", "IEEE / ASME Guild Connections"];
    return ["Quality Standards Compliance", "CAD Assembly Documentation"];
  }

  // Default Software Engineering
  if (category === "Study") return day <= 15 ? ["Core Data Structures", "LeetCode Easy-Medium Drills"] : ["Advanced BST Traversals", "System Design Load Balancers"];
  if (category === "Portfolio") return ["ATS-Optimized Project Architecture", "GitHub README Best Practices"];
  if (category === "Outreach") return ["LinkedIn Connection Pitching", "Alumni Outreach Engagement"];
  return ["Active Keyword Optimization", "Job Matching Outlines"];
};

export const generateDomainSchedule = (
  profile: StudentProfile, 
  targetRole: string = "Software Engineer", 
  targetDomain: string = "Technology"
): CalendarTask[] => {
  const domainCat = getDomainCategory(targetRole, targetDomain);
  const primarySkill = profile.technicalSkills?.[0] || "Core Competency";
  const targetCompany = profile.targetCompanies?.[0] || "Tier-1 Enterprise";
  const eduDegree = profile.degree || "Bachelor's Degree";

  const getRoleTitle = () => targetRole || "Professional";

  let tasks: CalendarTask[] = [];

  if (domainCat === "Data Science & AI") {
    tasks = [
      { day: 1, title: `Align Data Profile for ${getRoleTitle()}`, category: "Study", description: `Research exact ATS keywords for ${getRoleTitle()} roles. Map required SQL, Python, and ML frameworks.`, duration: "2 hours", deliverable: "Data skill competency ledger." },
      { day: 2, title: `Tailor Data Science Resume`, category: "Portfolio", description: `Refine your resume summary to highlight data modeling, statistical rigor, and machine learning pipelines.`, duration: "3 hours", deliverable: "ATS-optimized Data Science resume PDF." },
      { day: 3, title: `Audit LinkedIn for AI & Data Roles`, category: "Outreach", description: `Update headline to '${getRoleTitle()} | SQL & ML Specialist'. Quantify model accuracy and dataset scale.`, duration: "2 hours", deliverable: "Updated LinkedIn headline and about section." },
      { day: 4, title: `Compile Data Alumni Outreach Ledger`, category: "Outreach", description: `Identify 15 Data Scientists or ML Engineers at ${targetCompany} or target firms on LinkedIn.`, duration: "2 hours", deliverable: "Outreach ledger with customized connection notes." },
      { day: 5, title: `SQL Window Functions & Complex Joins`, category: "Study", description: `Master ROW_NUMBER(), DENSE_RANK(), LAG/LEAD, and multi-table aggregations for data screening tests.`, duration: "3.5 hours", deliverable: "GitHub SQL problem set with verified solutions." },
      { day: 6, title: `Exploratory Data Analysis (EDA) Drills`, category: "Study", description: `Perform end-to-end EDA on a complex dataset using Pandas, Seaborn, and Matplotlib. Clean missing values.`, duration: "3.5 hours", deliverable: "Executable Jupyter Notebook containing EDA charts." },
      { day: 7, title: `Design ML Capstone Architecture`, category: "Portfolio", description: `Brainstorm a predictive analytics or NLP model capstone relevant to ${targetDomain} industries.`, duration: "3 hours", deliverable: "Project spec document with feature pipeline architecture." },
      { day: 8, title: `Initialize ML Repository on GitHub`, category: "Portfolio", description: `Set up a structured repository with data pipeline modules, requirements.txt, and setup instructions.`, duration: "2.5 hours", deliverable: "Active GitHub repo with clean commit history." },
      { day: 9, title: `Outreach Phase 1: Data Alumni Inquiries`, category: "Outreach", description: `Send 5 personalized connection invitations to Data Leads asking about their analytics stack.`, duration: "2 hours", deliverable: "5 dispatched connection requests." },
      { day: 10, title: `Feature Engineering & Transformation`, category: "Study", description: `Practice one-hot encoding, feature scaling, log transforms, and principal component analysis (PCA).`, duration: "3.5 hours", deliverable: "Feature transformation script repository." },
      { day: 11, title: `Develop Baseline Machine Learning Model`, category: "Portfolio", description: `Train baseline Logistic Regression, Random Forest, or XGBoost classification/regression models.`, duration: "4 hours", deliverable: "Model training script with confusion matrix evaluation." },
      { day: 12, title: `Interactive Dashboard Construction`, category: "Portfolio", description: `Build an interactive user dashboard using Streamlit or Gradio to showcase model predictions.`, duration: "4 hours", deliverable: "Operational local web UI displaying model inputs/outputs." },
      { day: 13, title: `Outreach Phase 2: Coffee Chat Requests`, category: "Outreach", description: `Follow up with connected alumni to request brief 15-minute chats regarding real-world data pipelines.`, duration: "2 hours", deliverable: "At least 1 scheduled informational interview." },
      { day: 14, title: `Model Evaluation & Cross-Validation`, category: "Study", description: `Evaluate Precision, Recall, F1-Score, ROC-AUC, and perform k-fold cross-validation.`, duration: "3 hours", deliverable: "Evaluation metrics summary document." },
      { day: 15, title: `Mid-way Data Job Postings Audit`, category: "Application", description: `Review live postings for ${getRoleTitle()} in ${targetDomain}. Identify key recurring tool requirements.`, duration: "2 hours", deliverable: "5 curated job postings mapped to your skills." },
      { day: 16, title: `Optimize ML Model Hyperparameters`, category: "Portfolio", description: `Tune model hyperparameters using Optuna or GridSearchCV. Improve cross-validation accuracy.`, duration: "3.5 hours", deliverable: "Optimized model checkpoint saved with evaluation logs." },
      { day: 17, title: `Deploy Streamlit App to Streamlit Community Cloud`, category: "Portfolio", description: `Deploy your ML dashboard to a live public cloud URL and embed the link in your GitHub README.`, duration: "3 hours", deliverable: "Live public web link for recruiters." },
      { day: 18, title: `A/B Testing & Statistical Inference`, category: "Study", description: `Review hypothesis testing, t-tests, p-values, confidence intervals, and experiment design.`, duration: "3 hours", deliverable: "Statistical concepts cheat sheet." },
      { day: 19, title: `Mock Technical Round: Data Science & SQL`, category: "Study", description: `Complete a 60-minute timed SQL test and present your ML capstone methodology out loud.`, duration: "2.5 hours", deliverable: "Recorded response self-audit." },
      { day: 20, title: `Submit Data Application Wave 1`, category: "Application", description: `Tailor your resume for 3 target data roles and submit formal online applications.`, duration: "3 hours", deliverable: "3 confirmed job application submissions." },
      { day: 21, title: `Data STAR Narrative Formulations`, category: "Study", description: `Craft 5 STAR stories focusing on data insights that influenced stakeholder decisions or revenue.`, duration: "3 hours", deliverable: "STAR behavioral story bank." },
      { day: 22, title: `Outreach Wave 3: Analytics Managers`, category: "Outreach", description: `Reach out directly to Analytics Directors or Data Science Hiring Managers with tailored messages.`, duration: "2 hours", deliverable: "5 high-conversion intro messages sent." },
      { day: 23, title: `Deep Learning / Advanced NLP Review`, category: "Study", description: `Review neural network basics, embedding models, transformers, or time-series forecasting.`, duration: "3.5 hours", deliverable: "Summary notes on modern deep learning architectures." },
      { day: 24, title: `Live Mock Data Interview Simulation`, category: "Study", description: `Simulate a live technical case study interview focusing on metric trade-offs and modeling.`, duration: "2 hours", deliverable: "Interview feedback evaluation score." },
      { day: 25, title: `Polishing GitHub Data Science Portfolio`, category: "Portfolio", description: `Pin your top ML capstone repository, add clean README badges, data flow diagrams, and conclusions.`, duration: "3 hours", deliverable: "Pristine GitHub profile tailored for recruiters." },
      { day: 26, title: `Submit Data Application Wave 2`, category: "Application", description: `Apply to 5 additional target companies, customizing your cover letter for each data stack.`, duration: "3 hours", deliverable: "5 active job application logs." },
      { day: 27, title: `Quantitative Aptitude & Logic Sprint`, category: "Study", description: `Review probability puzzles, Bayes theorem, expected values, and linear algebra fundamentals.`, duration: "2 hours", deliverable: "Solved probability drill problem set." },
      { day: 28, title: `Outreach Wave 4: Referral Solicitations`, category: "Outreach", description: `Request internal referrals from contacts established during earlier networking weeks.`, duration: "2 hours", deliverable: "At least 1 secured internal job referral." },
      { day: 29, title: `Final Technical & Behavioral Polish`, category: "Study", description: `Review your SQL syntax, ML model assumptions, STAR stories, and camera/mic setup.`, duration: "3 hours", deliverable: "Final readiness checklist verified." },
      { day: 30, title: `Campaign Analytics Audit & Pipeline Review`, category: "Application", description: `Track application response rates, interview invitations, and schedule follow-ups for month 2.`, duration: "2 hours", deliverable: "Updated placement tracking spreadsheet." }
    ];
  } else if (domainCat === "Product Management") {
    tasks = [
      { day: 1, title: `Align Profile for ${getRoleTitle()}`, category: "Study", description: `Study product management competencies (product sense, execution, leadership) for ${getRoleTitle()} roles.`, duration: "2 hours", deliverable: "PM skill competency matrix." },
      { day: 2, title: `Draft Product Management Resume`, category: "Portfolio", description: `Highlight product launches, feature metrics (DAU, retention, revenue), and cross-functional leadership.`, duration: "3 hours", deliverable: "ATS-compliant PM resume PDF." },
      { day: 3, title: `Audit LinkedIn for Product Roles`, category: "Outreach", description: `Update headline to '${getRoleTitle()} | Product Strategy & User Growth'. Emphasize business impact.`, duration: "2 hours", deliverable: "Polished LinkedIn profile headline." },
      { day: 4, title: `Compile Product Leaders Network`, category: "Outreach", description: `Identify 15 Product Managers or Product Leaders at ${targetCompany} or target tech firms.`, duration: "2 hours", deliverable: "Outreach list with custom connection notes." },
      { day: 5, title: `Master PRD (Product Requirements Document) Layout`, category: "Study", description: `Study industry-standard PRD structures: Problem statement, user stories, success metrics, and edge cases.`, duration: "3 hours", deliverable: "PRD template document." },
      { day: 6, title: `User Persona & Journey Mapping`, category: "Study", description: `Create 2 detailed user personas and map their end-to-end journey for a popular product in ${targetDomain}.`, duration: "3 hours", deliverable: "User journey visual diagram." },
      { day: 7, title: `Draft Product Teardown Capstone Concept`, category: "Portfolio", description: `Select a popular application and identify a key user friction point to solve with a new feature.`, duration: "3 hours", deliverable: "Product teardown proposal brief." },
      { day: 8, title: `Figma Wireframe & Prototype Initial Layout`, category: "Portfolio", description: `Design low-fidelity wireframes in Figma illustrating the proposed solution screens.`, duration: "3.5 hours", deliverable: "Figma wireframe file link." },
      { day: 9, title: `Outreach Phase 1: Product Alumni Messages`, category: "Outreach", description: `Send 5 personalized connection requests to Associate PMs and PMs asking about their product culture.`, duration: "2 hours", deliverable: "5 dispatched outreach requests." },
      { day: 10, title: `Product Metrics & Frameworks (RICE / ICE)`, category: "Study", description: `Practice prioritizing feature backlogs using RICE (Reach, Impact, Confidence, Effort) scoring.`, duration: "3 hours", deliverable: "Prioritized feature backlog matrix." },
      { day: 11, title: `Draft Comprehensive PRD Capstone`, category: "Portfolio", description: `Write a 4-page PRD for your capstone feature, defining North Star metrics, KPIs, and rollout phases.`, duration: "4 hours", deliverable: "Completed PRD document in PDF format." },
      { day: 12, title: `Interactive Figma Prototype Polish`, category: "Portfolio", description: `Transform wireframes into high-fidelity clickable interactive prototypes in Figma.`, duration: "4 hours", deliverable: "Clickable Figma prototype link." },
      { day: 13, title: `Outreach Phase 2: Informational Interview Scheduling`, category: "Outreach", description: `Follow up with accepted connections to schedule brief 15-minute product strategy chats.`, duration: "2 hours", deliverable: "1 scheduled informational interview." },
      { day: 14, title: `A/B Testing & Experimentation Strategy`, category: "Study", description: `Learn how to design A/B test hypotheses, sample size calculations, and metric trade-off analysis.`, duration: "3 hours", deliverable: "Experimentation framework notes." },
      { day: 15, title: `Mid-way Product Openings Audit`, category: "Application", description: `Identify 5 active APM or Junior Product Manager listings in ${targetDomain}.`, duration: "2 hours", deliverable: "5 target job URLs with application notes." },
      { day: 16, title: `Construct Product Presentation Deck`, category: "Portfolio", description: `Build a 10-slide executive presentation summarizing your product teardown, PRD, and Figma prototype.`, duration: "4 hours", deliverable: "Executive PDF presentation deck." },
      { day: 17, title: `Publish Product Case Study on Notion / Medium`, category: "Portfolio", description: `Publish your case study publicly online and link it in your resume and LinkedIn portfolio.`, duration: "3 hours", deliverable: "Live case study URL." },
      { day: 18, title: `Product Sense Interview Drills`, category: "Study", description: `Practice answering 'Design a product for X' questions using structured frameworks.`, duration: "3 hours", deliverable: "5 solved product design prompts." },
      { day: 19, title: `Product Execution Interview Drills`, category: "Study", description: `Practice answering 'How would you measure success for feature Y?' and 'Metrics dropped by 10%, what do you do?'`, duration: "3 hours", deliverable: "Execution framework cheat sheet." },
      { day: 20, title: `Submit Product Application Wave 1`, category: "Application", description: `Apply to 3 target APM / Junior PM roles attaching your published case study URL.`, duration: "3 hours", deliverable: "3 confirmed application submissions." },
      { day: 21, title: `Behavioral Leadership STAR Stories`, category: "Study", description: `Prepare 5 STAR stories demonstrating cross-functional influence without authority.`, duration: "3 hours", deliverable: "Behavioral narrative ledger." },
      { day: 22, title: `Outreach Wave 3: Product Directors & Recruiter Pitching`, category: "Outreach", description: `Reach out directly to Product Directors and Tech Recruiters highlighting your case study.`, duration: "2 hours", deliverable: "5 direct hiring outreach messages sent." },
      { day: 23, title: `Technical Architecture for Product Managers`, category: "Study", description: `Review API protocols (REST/GraphQL), databases (SQL/NoSQL), system scalability, and tech stack trade-offs.`, duration: "3 hours", deliverable: "Technical literacy summary." },
      { day: 24, title: `Live Mock Product Interview Panel`, category: "Study", description: `Conduct a timed mock product sense and execution interview out loud.`, duration: "2 hours", deliverable: "Self-evaluation rubric score." },
      { day: 25, title: `Refine Product Portfolio Landing Page`, category: "Portfolio", description: `Ensure all case study links, Figma prototypes, and PRDs are accessible and beautifully formatted.`, duration: "3 hours", deliverable: "Complete portfolio review." },
      { day: 26, title: `Submit Product Application Wave 2`, category: "Application", description: `Submit applications to 5 additional product listings customizing your cover notes.`, duration: "3 hours", deliverable: "5 active job applications logged." },
      { day: 27, title: `Product Guesstimate & Logic Drills`, category: "Study", description: `Practice market sizing and guesstimate estimation questions (e.g., 'How many smartphones sold in X country?').`, duration: "2 hours", deliverable: "3 solved guesstimate problems." },
      { day: 28, title: `Outreach Wave 4: Internal Referral Solicitations`, category: "Outreach", description: `Request internal referrals for open product roles from warm network contacts.`, duration: "2 hours", deliverable: "At least 1 secured PM internal referral." },
      { day: 29, title: `Final Product Interview Warm-up`, category: "Study", description: `Review your PRD deck, key product metrics, STAR stories, and setup your interview workspace.`, duration: "3 hours", deliverable: "Final interview readiness check." },
      { day: 30, title: `Pipeline Review & Month 2 Product Campaign`, category: "Application", description: `Evaluate response rates, follow up on pending applications, and plan active pipeline tracking.`, duration: "2 hours", deliverable: "Updated pipeline tracking sheet." }
    ];
  } else {
    // Standard Software Engineering / Tech / Core Domain Generator
    tasks = [
      { day: 1, title: `Align Profile for ${getRoleTitle()}`, category: "Study", description: `Research exact ATS keywords and core competencies expected for a junior/entry-level ${getRoleTitle()} role. Map these against your current skill checklist.`, duration: "2 hours", deliverable: "Target keyword ledger and specific competency checklist." },
      { day: 2, title: `Tailor Resume Base Draft`, category: "Portfolio", description: `Rewrite your resume summary and title line to directly target ${getRoleTitle()} positions. Refine internships/projects to highlight ${primarySkill}.`, duration: "3 hours", deliverable: "Optimized primary ATS-compliant resume PDF draft." },
      { day: 3, title: `Audit LinkedIn Profile`, category: "Outreach", description: "Update your professional headline, about summary, and experience sections with quantitative outcomes (e.g. metrics, scale, percentages).", duration: "2.5 hours", deliverable: "Perfected LinkedIn URL with a strong headline banner." },
      { day: 4, title: `Construct LinkedIn Dream List`, category: "Outreach", description: `Search and compile 15 alumni or professionals working as ${getRoleTitle()}s at ${targetCompany} or nearby companies. Save their profiles.`, duration: "2 hours", deliverable: "Excel ledger containing names, links, and customized connection message templates." },
      { day: 5, title: `Deep-dive on ${primarySkill} Basics`, category: "Study", description: `Review intermediate to advanced syntax, structures, memory models, or fundamental paradigms of ${primarySkill}. Complete 3 simple drills.`, duration: "4 hours", deliverable: "GitHub repository with basic drills and structured notes." },
      { day: 6, title: "LeetCode / Core Technical Foundations", category: "Study", description: "Review essential data structures, algorithms, or domain core principles. Implement 3 standard problem solutions.", duration: "3 hours", deliverable: "Clean implementations documented on your technical dashboard." },
      { day: 7, title: "Draft Primary Capstone Architecture", category: "Portfolio", description: `Brainstorm a unique capstone project focusing on ${getRoleTitle()} duties using ${primarySkill} as the foundational framework.`, duration: "3 hours", deliverable: "System architecture diagram, data flow diagram, and README layout." },
      { day: 8, title: "Build Capstone Project Repository", category: "Portfolio", description: "Initialize a standard GitHub/portfolio repository with high-quality README, setup instructions, license, and initial environment scripts.", duration: "3 hours", deliverable: "Active project link with standard repository assets and initial commit." },
      { day: 9, title: "Outreach Phase 1: Alumni Messages", category: "Outreach", description: "Send personalized connection requests with short, conversational messages to the first 5 professionals compiled on your ledger.", duration: "2 hours", deliverable: "5 active personalized outreach invitations dispatched." },
      { day: 10, title: "Technical Core Patterns & Navigation", category: "Study", description: "Master domain core patterns, data structures, or technical protocols. Solve 3 standard challenges.", duration: "3.5 hours", deliverable: "Successfully passing test constraints and saving source files." },
      { day: 11, title: "Develop Core Capstone Features", category: "Portfolio", description: `Implement the primary controllers, schema layout, and essential logic handlers for your ${primarySkill} project.`, duration: "4 hours", deliverable: "Operational core server/engine running locally." },
      { day: 12, title: "Configure API / Integration Layer", category: "Portfolio", description: "Integrate a real-world API or mock service layer to bring live dynamic data to your capstone project.", duration: "3.5 hours", deliverable: "Dynamic data rendered cleanly on the system view." },
      { day: 13, title: "Outreach Phase 2: Warm Follow-ups", category: "Outreach", description: "Check LinkedIn response rates. For any accepted requests, propose a brief 10-minute coffee chat asking about target-role preparation.", duration: "2 hours", deliverable: "Successfully schedule at least 1 informal mentoring or coffee chat." },
      { day: 14, title: "Advanced Technical Concepts Review", category: "Study", description: "Study advanced algorithms, design patterns, or technical specifications. Solve 2 complex pathfinding/system challenges.", duration: "4 hours", deliverable: "Document technical solutions in your study hub." },
      { day: 15, title: "Perform Mid-way Calendar Sync", category: "Application", description: `Review current local recruitment postings for junior/associate ${getRoleTitle()} positions. Save 5 live postings that align with your stack.`, duration: "2 hours", deliverable: "5 target job URLs compiled with specific tailoring outlines." },
      { day: 16, title: "Perfect Project Styling & Handling", category: "Portfolio", description: "Add robust error-handling states, loading indicators, styling, and basic responsive behavior to your capstone project draft.", duration: "4 hours", deliverable: "Fully styled view with zero console warnings." },
      { day: 17, title: "Deploy Capstone Portfolio Asset", category: "Portfolio", description: "Deploy the project to a cloud container platform (e.g. Vercel, Netlify, Render, Cloud Run) and verify operational readiness.", duration: "3 hours", deliverable: "Live URL link added to the main GitHub README file." },
      { day: 18, title: "System Design & Architecture Essentials", category: "Study", description: "Study basic load balancers, caching strategies, horizontal vs vertical scaling, and microservice basics.", duration: "3 hours", deliverable: "1-page summary chart on distributed system fundamentals." },
      { day: 19, title: "Mock Interview Round: Technical", category: "Study", description: `Practice answering high-intensity technical questions focusing on ${primarySkill} and core design patterns.`, duration: "2.5 hours", deliverable: "Evaluate responses using real-time simulation tools." },
      { day: 20, title: "Submit Application Wave 1", category: "Application", description: `Customize your optimized resume for the first 3 job postings compiled on Day 15 and submit formal applications.`, duration: "3 hours", deliverable: "3 verified job submissions with application confirmations." },
      { day: 21, title: "Behavioral Star Formula Grid", category: "Study", description: "Write down 5 concrete professional or academic stories formatted precisely in Situation, Task, Action, and Result (STAR) formulas.", duration: "3 hours", deliverable: "A comprehensive cheat-sheet of behavioral narratives." },
      { day: 22, title: "Outreach Wave 3: Hiring Managers", category: "Outreach", description: `Identify recruiters or hiring managers listing ${getRoleTitle()} openings at target companies. Craft a high-impact cold intro pitch.`, duration: "2 hours", deliverable: "5 high-conversion pitches sent directly via LinkedIn or email." },
      { day: 23, title: "Advanced Problem Solving Foundations", category: "Study", description: "Understand complex recursion memoization, tabular approaches, or domain design trade-offs.", duration: "4 hours", deliverable: "2 classic complex solutions written out with analysis." },
      { day: 24, title: "Conduct Live Mock Interview", category: "Study", description: "Practice vocal responses under pressure. Set a 45-minute countdown and answer 5 random intermediate questions out loud.", duration: "2 hours", deliverable: "Speech analysis report evaluating filler-words and sentiment." },
      { day: 25, title: "Polishing Technical Case Studies", category: "Portfolio", description: "Refine your GitHub/portfolio page. Pin your top 2 capstone projects, add elegant descriptions, and write brief, easy-to-digest case studies.", duration: "3.5 hours", deliverable: "A pristine portfolio page targeting recruiters." },
      { day: 26, title: "Submit Application Wave 2", category: "Application", description: "Submit 5 additional applications to active postings, adapting keywords in your cover letter and experience sections.", duration: "3 hours", deliverable: "5 completed application dashboard statuses." },
      { day: 27, title: "Aptitude & Logical Reasoning Sprint", category: "Study", description: "Review common quantitative pattern puzzles, logical sequence questions, and probability matrices used in screening tests.", duration: "2 hours", deliverable: "1 conceptual practice sheet with solved exercises." },
      { day: 28, title: "Outreach Wave 4: Referral Solicit", category: "Outreach", description: "Engage warm connections established in earlier weeks. Respectfully ask if they'd be comfortable referring you to relevant listings.", duration: "2 hours", deliverable: "Secure at least 1 direct internal referral lead." },
      { day: 29, title: "Final Interview Polish & Drills", category: "Study", description: "Simulate a mock behavioral interview panel using your STAR stories. Review system design architectures and core technical traps.", duration: "3 hours", deliverable: "Full physical check, workspace camera setting setup, and audio check." },
      { day: 30, title: "Strategy Audit & Launch Plan", category: "Application", description: "Review response rates, follow-ups, and calendar invitations. Map out your next 30 days of active pipeline tracking.", duration: "2 hours", deliverable: "Updated active pipeline spreadsheet with future action dates." }
    ];
  }

  return tasks.map(task => ({
    ...task,
    skillGaps: getGapsForTaskAndDomain(task.day, task.category, domainCat)
  }));
};

export const generateDomainDeadlines = (
  profile: StudentProfile, 
  targetRole: string = "Software Engineer", 
  targetDomain: string = "Technology"
): CompanyDeadline[] => {
  const domainCat = getDomainCategory(targetRole, targetDomain);
  const today = new Date();
  const relativeDate = (daysFromToday: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysFromToday);
    return d.toISOString().split('T')[0];
  };

  const userCompanies = profile.targetCompanies || [];

  if (domainCat === "Data Science & AI") {
    return [
      { id: "dl-ds-1", company: userCompanies[0] || "OpenAI", role: targetRole || "AI Research Scientist", date: relativeDate(4), skillGaps: ["PyTorch Model Architecture", "Transformer Attention Scaling"] },
      { id: "dl-ds-2", company: userCompanies[1] || "Snowflake", role: "Data Engineer", date: relativeDate(8), skillGaps: ["Snowflake SQL Windowing", "dbt Data Modeling"] },
      { id: "dl-ds-3", company: "Palantir", role: "Forward Deployed Data Scientist", date: relativeDate(14), skillGaps: ["Exploratory Data Analysis", "Client Presentation Storytelling"] }
    ];
  }

  if (domainCat === "Product Management") {
    return [
      { id: "dl-pm-1", company: userCompanies[0] || "Microsoft", role: targetRole || "Product Manager", date: relativeDate(3), skillGaps: ["Product Vision PRD", "North Star Metric Formulation"] },
      { id: "dl-pm-2", company: userCompanies[1] || "Uber", role: "Associate Product Manager", date: relativeDate(7), skillGaps: ["Figma Interactive Wireframing", "A/B Experimentation Design"] },
      { id: "dl-pm-3", company: "Airbnb", role: "Product Strategy Analyst", date: relativeDate(11), skillGaps: ["User Acquisition Funnel Analysis", "Market Sizing Guesstimate"] }
    ];
  }

  if (domainCat === "Cybersecurity") {
    return [
      { id: "dl-sec-1", company: userCompanies[0] || "CrowdStrike", role: targetRole || "Security Analyst", date: relativeDate(5), skillGaps: ["SIEM Log Inspection", "Threat Hunting Playbooks"] },
      { id: "dl-sec-2", company: userCompanies[1] || "Palo Alto Networks", role: "Cloud Security Engineer", date: relativeDate(9), skillGaps: ["OWASP Web Audit", "AWS IAM Security Policies"] }
    ];
  }

  if (domainCat === "Finance & Banking") {
    return [
      { id: "dl-fin-1", company: userCompanies[0] || "Goldman Sachs", role: targetRole || "Investment Banking Analyst", date: relativeDate(4), skillGaps: ["3-Statement Financial Modeling", "DCF Valuation Sensitivity"] },
      { id: "dl-fin-2", company: userCompanies[1] || "J.P. Morgan", role: "Financial Analyst", date: relativeDate(10), skillGaps: ["LBO Assumptions", "Equity Research Pitch"] }
    ];
  }

  // Default Software Engineering
  return [
    { id: "dl-1", company: userCompanies[0] || "Google", role: targetRole || "Software Engineer", date: relativeDate(3), skillGaps: ["Advanced Tree Algorithms", "System Design Scalability"] },
    { id: "dl-2", company: userCompanies[1] || "Stripe", role: "Full-Stack Developer", date: relativeDate(6), skillGaps: ["CORS & Security Configurations", "Database Schema Tuning"] },
    { id: "dl-3", company: "Amazon", role: targetRole || "SDE-1", date: relativeDate(12), skillGaps: ["Mock Interview Verbal Confidence", "Behavioral STAR Formulations"] }
  ];
};

export default function PlacementSchedule({ profile, onTargetRoleChange }: PlacementScheduleProps) {
  // Sync state with profile prop
  const [activeRole, setActiveRole] = useState<string>(profile.targetRoles?.[0] || "Software Engineer");
  const [activeDomain, setActiveDomain] = useState<string>(profile.preferredIndustry || "Engineering & Technology");
  
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Drag and drop states
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Deadlines states
  const [deadlines, setDeadlines] = useState<CompanyDeadline[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newGaps, setNewGaps] = useState("");

  // Sync modal & custom role edit states
  const [showSyncInstructions, setShowSyncInstructions] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [isSyncingRole, setIsSyncingRole] = useState(false);

  // Sync activeRole/Domain when profile prop changes
  useEffect(() => {
    if (profile.targetRoles?.[0] && profile.targetRoles[0] !== activeRole) {
      setActiveRole(profile.targetRoles[0]);
    }
    if (profile.preferredIndustry && profile.preferredIndustry !== activeDomain) {
      setActiveDomain(profile.preferredIndustry);
    }
  }, [profile]);

  // Load schedule based on profile, activeRole, and activeDomain
  useEffect(() => {
    const cacheKey = `placement_schedule_${profile.name}_${activeRole}_${activeDomain}`;
    const cachedSchedule = localStorage.getItem(cacheKey);

    if (cachedSchedule) {
      try {
        const parsed = JSON.parse(cachedSchedule);
        const domainCat = getDomainCategory(activeRole, activeDomain);
        const backfilled = parsed.map((task: any) => ({
          ...task,
          skillGaps: task.skillGaps || getGapsForTaskAndDomain(task.day, task.category, domainCat)
        }));
        setTasks(backfilled);
        setSelectedTask(backfilled[0] || null);
      } catch (e) {
        console.warn("Failed to parse cached schedule", e);
        const fresh = generateDomainSchedule(profile, activeRole, activeDomain);
        setTasks(fresh);
        setSelectedTask(fresh[0] || null);
      }
    } else {
      const fresh = generateDomainSchedule(profile, activeRole, activeDomain);
      setTasks(fresh);
      setSelectedTask(fresh[0] || null);
      localStorage.setItem(cacheKey, JSON.stringify(fresh));
    }

    // Load or generate deadlines
    const deadlineCacheKey = `placement_deadlines_${profile.name}_${activeRole}`;
    const cachedDeadlines = localStorage.getItem(deadlineCacheKey);
    if (cachedDeadlines) {
      try {
        setDeadlines(JSON.parse(cachedDeadlines));
      } catch (e) {
        const freshDl = generateDomainDeadlines(profile, activeRole, activeDomain);
        setDeadlines(freshDl);
      }
    } else {
      const freshDl = generateDomainDeadlines(profile, activeRole, activeDomain);
      setDeadlines(freshDl);
      localStorage.setItem(deadlineCacheKey, JSON.stringify(freshDl));
    }
  }, [profile.name, activeRole, activeDomain]);

  const saveTasks = (updatedTasks: CalendarTask[]) => {
    setTasks(updatedTasks);
    const cacheKey = `placement_schedule_${profile.name}_${activeRole}_${activeDomain}`;
    localStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
    if (selectedTask) {
      const currentSelected = updatedTasks.find(t => t.day === selectedTask.day);
      if (currentSelected) {
        setSelectedTask(currentSelected);
      }
    }
  };

  const handleSyncToRole = (newRole: string, newDomain?: string) => {
    setIsSyncingRole(true);
    const targetR = newRole.trim() || activeRole;
    const targetD = newDomain?.trim() || activeDomain;

    setActiveRole(targetR);
    setActiveDomain(targetD);

    if (onTargetRoleChange) {
      onTargetRoleChange(targetR, targetD);
    }

    const freshTasks = generateDomainSchedule(profile, targetR, targetD);
    const freshDeadlines = generateDomainDeadlines(profile, targetR, targetD);

    setTasks(freshTasks);
    setSelectedTask(freshTasks[0] || null);
    setDeadlines(freshDeadlines);

    const cacheKey = `placement_schedule_${profile.name}_${targetR}_${targetD}`;
    const dlCacheKey = `placement_deadlines_${profile.name}_${targetR}`;

    localStorage.setItem(cacheKey, JSON.stringify(freshTasks));
    localStorage.setItem(dlCacheKey, JSON.stringify(freshDeadlines));

    setTimeout(() => {
      setIsSyncingRole(false);
      setShowRoleModal(false);
    }, 400);
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole || !newDate) return;

    const newDl: CompanyDeadline = {
      id: `dl-custom-${Date.now()}`,
      company: newCompany,
      role: newRole,
      date: newDate,
      skillGaps: newGaps ? newGaps.split(",").map(s => s.trim()).filter(Boolean) : ["General Application Requirements"]
    };

    const updated = [...deadlines, newDl];
    setDeadlines(updated);
    const dlCacheKey = `placement_deadlines_${profile.name}_${activeRole}`;
    localStorage.setItem(dlCacheKey, JSON.stringify(updated));

    setNewCompany("");
    setNewRole("");
    setNewDate("");
    setNewGaps("");
    setShowAddForm(false);
  };

  const handleDeleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    const dlCacheKey = `placement_deadlines_${profile.name}_${activeRole}`;
    localStorage.setItem(dlCacheKey, JSON.stringify(updated));
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, day: number) => {
    setDraggedDay(day);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    setDragOverDay(null);
    if (draggedDay === null || draggedDay === targetDay) return;

    const updated = [...tasks];
    const dragIdx = updated.findIndex(t => t.day === draggedDay);
    const targetIdx = updated.findIndex(t => t.day === targetDay);

    if (dragIdx !== -1 && targetIdx !== -1) {
      const temp = { ...updated[dragIdx] };
      updated[dragIdx] = {
        ...updated[targetIdx],
        day: draggedDay
      };
      updated[targetIdx] = {
        ...temp,
        day: targetDay
      };
      
      saveTasks(updated);
    }
    setDraggedDay(null);
  };

  const handleToggleComplete = (day: number) => {
    const updated = tasks.map(t => {
      if (t.day === day) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleExportICS = () => {
    const today = new Date();
    
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VORYNEXA//Tactical Placement Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    tasks.forEach(task => {
      const taskDate = new Date();
      taskDate.setDate(today.getDate() + (task.day - 1));
      
      const year = taskDate.getFullYear();
      const month = String(taskDate.getMonth() + 1).padStart(2, '0');
      const day = String(taskDate.getDate()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}`;
      const gapsStr = task.skillGaps ? task.skillGaps.join(', ') : '';

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:placementos-day-${task.day}-${profile.name.replace(/\s+/g, '-')}-${Date.now()}@placementos.com`,
        `DTSTAMP:${year}${month}${day}T090000Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:VORYNEXA Day ${task.day} [${activeRole}]: ${task.title}`,
        `DESCRIPTION:${task.description.replace(/,/g, '\\,')}\\n\\nDuration: ${task.duration}\\nDeliverable: ${task.deliverable.replace(/,/g, '\\,')}\\nRequired Skill Gaps: ${gapsStr.replace(/,/g, '\\,')}`,
        `CATEGORIES:${task.category}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    deadlines.forEach(dl => {
      const dateParts = dl.date.split('-');
      if (dateParts.length === 3) {
        const dateStr = dateParts.join('');
        icsContent.push(
          "BEGIN:VEVENT",
          `UID:placementos-deadline-${dl.id}-${profile.name.replace(/\s+/g, '-')}-${Date.now()}@placementos.com`,
          `DTSTAMP:${dateStr}T090000Z`,
          `DTSTART;VALUE=DATE:${dateStr}`,
          `DTEND;VALUE=DATE:${dateStr}`,
          `SUMMARY:🔴 DEADLINE: Apply to ${dl.company} (${dl.role})`,
          `DESCRIPTION:Critical Application Deadline!\\n\\nRequired Skill Gaps to Address: ${dl.skillGaps.join(', ').replace(/,/g, '\\,')}`,
          `CATEGORIES:Placement Deadline`,
          "STATUS:CONFIRMED",
          "END:VEVENT"
        );
      }
    });

    icsContent.push("END:VCALENDAR");

    const fullIcsString = icsContent.join("\r\n");
    const blob = new Blob([fullIcsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VORYNEXA_Placement_Schedule_${activeRole.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filterCategory === "All" || task.category === filterCategory;
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Completed" && task.isCompleted) || 
      (filterStatus === "Pending" && !task.isCompleted);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deliverable.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Study":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Application":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Outreach":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Portfolio":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-white/60 bg-white/5 border-white/10";
    }
  };

  return (
    <div id="placement-schedule-container" className="space-y-8">
      {/* Target Role & Field Synchronization Banner */}
      <div className="bg-[#111] border border-emerald-500/30 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Universal Field Placement Engine
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[9px] font-extrabold uppercase font-mono rounded">
                  ✓ Synced
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Active Role: <strong className="text-emerald-400 font-mono">{activeRole}</strong> • Domain: <strong className="text-emerald-400 font-mono">{activeDomain}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCustomRoleInput(activeRole);
                setCustomDomainInput(activeDomain);
                setShowRoleModal(true);
              }}
              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Re-Sync Target Role
            </button>
          </div>
        </div>

        {/* Quick Domain Switcher Buttons */}
        <div className="pt-2 border-t border-white/10">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono mb-2">
            Switch Target Domain & Auto-Realign Schedule:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-500/20">
            {MAJOR_CAREER_DOMAINS.map((dom) => {
              const isSelected = activeDomain === dom.name;
              return (
                <button
                  key={dom.id}
                  onClick={() => handleSyncToRole(dom.defaultRole, dom.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer shrink-0 font-mono ${
                    isSelected
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{dom.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Role Edit Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">Sync Placement Target Role</h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="block text-white/70 font-bold uppercase tracking-wider text-[10px]">Target Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Data Scientist, AI Engineer, Clinical Specialist..."
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-white/70 font-bold uppercase tracking-wider text-[10px]">Preferred Industry / Field</label>
                <input
                  type="text"
                  placeholder="e.g. Data Science & AI, Healthcare, Finance..."
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 font-bold text-xs rounded-xl font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSyncToRole(customRoleInput, customDomainInput)}
                disabled={isSyncingRole}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl font-mono flex items-center gap-1.5 cursor-pointer"
              >
                {isSyncingRole ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Re-Sync 30-Day Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Header Dashboard */}
      <div className="bg-[#111] p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <Sparkles className="w-3 h-3 animate-pulse" /> 30-Day Tactical Campaign Planner
            </div>
            <h2 id="schedule-heading" className="text-xl md:text-2xl font-black text-white">
              Tactical Campaign Schedule — <span className="text-emerald-400">{activeRole}</span>
            </h2>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Based on your target role (<strong className="text-white">{activeRole}</strong>) in <strong className="text-white">{activeDomain}</strong> and placement deadline (<strong className="text-white">{profile.placementDeadline || "Immediate Target"}</strong>), we've generated a customized day-by-day tactical action map.
            </p>
          </div>

          <button
            onClick={() => {
              handleExportICS();
              setShowSyncInstructions(true);
            }}
            id="btn-sync-calendar"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 shrink-0 animate-pulse font-mono"
          >
            <CalendarDays className="w-4 h-4" /> Export iCal / Google Calendar
          </button>
        </div>

        {/* Progress Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 mt-6 pt-6">
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Campaign Progress</span>
              <span className="text-2xl font-extrabold text-white font-mono">{progressPercent}%</span>
            </div>
            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Tasks Completed</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{completedCount} <span className="text-white/40 text-sm">/ {tasks.length}</span></span>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/20" />
          </div>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Target Deadline</span>
              <span className="text-sm font-extrabold text-white truncate font-mono block max-w-[150px]">{profile.placementDeadline || "Immediate Target"}</span>
            </div>
            <Clock className="w-8 h-8 text-white/10" />
          </div>
        </div>
      </div>

      {/* DEADLINE NOTIFICATION AND ACTIVE APPLICATION TRACKER */}
      {(() => {
        const urgentCount = deadlines.filter(d => {
          const rem = getDaysRemaining(d.date);
          return rem >= 0 && rem <= 7;
        }).length;

        return (
          <div className="space-y-4">
            {urgentCount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-xs text-rose-300 font-medium leading-relaxed">
                  <strong className="font-black">CRITICAL ALERTS:</strong> You have {urgentCount} high-priority placement applications closing within 7 days! Prepare to bridge your required skill gaps immediately.
                </p>
              </div>
            )}

            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Active Placement Deadlines for {activeRole}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Application
                </button>
              </div>

              {/* Add Deadline Form */}
              {showAddForm && (
                <form onSubmit={handleAddDeadline} className="p-4 bg-black/60 border border-white/10 rounded-xl space-y-3 font-mono">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Company Name (e.g. Google)"
                      value={newCompany}
                      onChange={e => setNewCompany(e.target.value)}
                      className="bg-black border border-white/20 p-2 text-xs text-white rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role Title"
                      value={newRole}
                      onChange={e => setNewRole(e.target.value)}
                      className="bg-black border border-white/20 p-2 text-xs text-white rounded-lg"
                      required
                    />
                    <input
                      type="date"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="bg-black border border-white/20 p-2 text-xs text-white rounded-lg"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Skill Gaps to Bridge (comma-separated)"
                    value={newGaps}
                    onChange={e => setNewGaps(e.target.value)}
                    className="w-full bg-black border border-white/20 p-2 text-xs text-white rounded-lg"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 bg-emerald-500 text-black font-bold text-xs rounded-lg"
                    >
                      Save Application
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {deadlines.map(dl => {
                  const daysLeft = getDaysRemaining(dl.date);
                  const isUrgent = daysLeft >= 0 && daysLeft <= 7;
                  return (
                    <div
                      key={dl.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                        isUrgent 
                          ? "bg-rose-500/[0.03] border-rose-500/30 shadow-md shadow-rose-500/5" 
                          : "bg-black/20 border-white/5"
                      }`}
                    >
                      {isUrgent && (
                        <span className="absolute -top-2 -right-1 px-2 py-0.5 bg-rose-500 text-black text-[8px] font-black uppercase tracking-wider rounded-full shadow font-mono animate-pulse">
                          Urgent ({daysLeft}d left)
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">{dl.company}</h4>
                            <p className="text-[10px] text-white/50 font-medium">{dl.role}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteDeadline(dl.id)}
                            className="text-white/30 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                            title="Delete Tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest font-mono block">Required Skill Gaps</span>
                          <div className="flex flex-wrap gap-1">
                            {(dl?.skillGaps || []).map((gap, idx) => (
                              <span key={idx} className="text-[9px] bg-white/5 border border-white/5 text-white/70 px-1.5 py-0.5 rounded font-mono">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono font-bold">
                        <span className="text-white/40">CLOSES: {dl.date}</span>
                        <span className={isUrgent ? "text-rose-400 animate-pulse" : "text-emerald-400"}>
                          {daysLeft < 0 ? "PASSED" : daysLeft === 0 ? "TODAY" : `${daysLeft} DAYS REMAINING`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Control Toolbar */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search schedule tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-white/10 rounded-lg text-white bg-black/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-lg p-1">
            {["All", "Study", "Application", "Outreach", "Portfolio"].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterCategory === cat 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-bold font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View / List View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Day Map (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#111]/40 border border-white/5 py-16 text-center rounded-2xl">
              <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white/80 font-mono">No Matching Scheduled Activities</h4>
              <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">Try relaxing your search terms or selecting different filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {filteredTasks.map((task) => {
                const isDragOver = dragOverDay === task.day;
                const isStudyTask = task.category === "Study";
                
                return (
                  <div
                    key={task.day}
                    draggable={isStudyTask}
                    onDragStart={(e) => handleDragStart(e, task.day)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, task.day)}
                    onDrop={(e) => handleDrop(e, task.day)}
                    id={`schedule-day-${task.day}`}
                    onClick={() => setSelectedTask(task)}
                    className={`group relative p-3.5 bg-gradient-to-b text-left rounded-xl border transition-all duration-300 min-h-[110px] flex flex-col justify-between cursor-pointer ${
                      selectedTask?.day === task.day
                        ? "from-[#1b2a1e] to-black border-emerald-500/80 shadow-md shadow-emerald-500/10 scale-[1.03] z-10"
                        : "from-[#111] to-black border-white/5 hover:border-white/20 hover:scale-[1.02]"
                    } ${
                      isDragOver ? "border-dashed border-emerald-400 bg-emerald-500/15 scale-[1.05]" : ""
                    } ${
                      isStudyTask ? "hover:shadow-lg hover:shadow-blue-500/5 cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[10px] font-black font-mono text-white/30">DAY {task.day}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(task.day);
                        }}
                        className="p-0.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20 hover:text-white/40" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-2.5">
                      <p className={`text-[10px] font-black truncate text-white leading-normal ${task.isCompleted ? "line-through text-white/30" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`inline-block text-[8px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/95 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-left space-y-2 scale-95 group-hover:scale-100">
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Bridge Skill Gaps</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {task.skillGaps && task.skillGaps.length > 0 ? (
                          task.skillGaps.map((gap, gIdx) => (
                            <span key={gIdx} className="text-[10px] text-white/80 leading-snug">
                              • {gap}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-white/40 italic">No specific skill gaps</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.day}
                  id={`schedule-list-day-${task.day}`}
                  onClick={() => setSelectedTask(task)}
                  className={`group relative p-4 bg-gradient-to-r rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                    selectedTask?.day === task.day
                      ? "from-[#15251a] to-black border-emerald-500/60"
                      : "from-[#111] to-black border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(task.day);
                      }}
                      className="p-1"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/20" />
                      )}
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 font-mono">DAY {task.day}</span>
                      <h4 className={`text-xs font-bold text-white ${task.isCompleted ? "line-through text-white/40" : ""}`}>{task.title}</h4>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded border font-mono font-bold ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Task Detail Inspector (Right Column) */}
        <div className="space-y-6">
          {selectedTask ? (
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6 sticky top-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                    DAY {selectedTask.day}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold ${getCategoryColor(selectedTask.category)}`}>
                    {selectedTask.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(selectedTask.day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTask.isCompleted
                      ? "bg-emerald-500 text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedTask.isCompleted ? "Completed" : "Mark Done"}
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-extrabold text-white leading-snug">
                  {selectedTask.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  {selectedTask.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40 font-mono">ESTIMATED TIME:</span>
                  <span className="font-bold text-white font-mono">{selectedTask.duration}</span>
                </div>

                <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">Expected Deliverable</span>
                  <p className="text-xs text-white/80 font-medium">{selectedTask.deliverable}</p>
                </div>

                {selectedTask.skillGaps && selectedTask.skillGaps.length > 0 && (
                  <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block font-mono">Skill Gaps to Bridge</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedTask?.skillGaps || []).map((gap, idx) => (
                        <span key={idx} className="text-[10px] bg-white/5 border border-white/10 text-white/80 px-2 py-0.5 rounded font-mono">
                          • {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center space-y-3">
              <Calendar className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-xs text-white/40 font-mono">Select any calendar day to inspect detailed task instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
