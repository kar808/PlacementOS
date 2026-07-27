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
      skillGapSummary: `Calculated a 32% skill gap focused on production distributed systems and cloud infrastructure.`,
      skillGapScore: 32,
      resumeStrengthScore: 78,
      resumeStrengthSummary: `Solid educational background from ${profile.college || "University"}. Needs quantified bullet points and live project metrics.`,
      interviewReadinessScore: 70,
      interviewReadinessSummary: "Strong theoretical knowledge; needs structured System Design whiteboarding practice.",
      mentorExecutiveVerdict: `Targeting ${role} in ${country} within ${ind} is highly feasible within 60-90 days. Follow this personalized 4-stage execution matrix.`
    },
    stages: {
      beginner: {
        stageName: "Beginner Stage",
        stageTitle: "Foundations & Core Principles",
        timeline: "Weeks 1-3 (Estimated 50 Hours)",
        mentorAdvice: "Build non-negotiable fundamentals. Master language nuances, Git workflows, and baseline problem-solving before moving to complex frameworks.",
        learningTopics: ["Data Structures (Arrays, HashMaps, Trees)", "Algorithms (Sorting, Searching, Recursion)", "Clean Code & Refactoring Principles", "Version Control (Git/GitHub)", "RESTful API Specification"],
        recommendedProjects: [
          { title: `${role} Baseline Service Engine`, description: "Build a clean REST API service with input validation, modular routing, and persistent DB storage.", keyDeliverables: ["REST Endpoints", "Input Validation", "Unit Tests"], portfolioImpact: "Demonstrates production code structure and hygiene." },
          { title: "Algorithmic Solver Suite", description: "Implement core algorithms from scratch with space/time complexity benchmarks.", keyDeliverables: ["Custom Implementations", "Benchmark Report", "Documentation"], portfolioImpact: "Proves deep computer science fundamentals." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", relevance: "High for Cloud Fundamentals", estimatedCost: "$100" },
          { name: "Meta Professional Software Certificate", issuer: "Meta / Coursera", relevance: "Strong for Industry Basics", estimatedCost: "Free / $39/mo" }
        ],
        recommendedTools: ["VS Code / JetBrains", "Git & GitHub CLI", "Postman", "Docker Desktop", "Terminal / Bash"],
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
        jobApplicationStrategy: ["Audit resume against target role job descriptions", "Identify 20 target companies for early bookmarking", "Setup job alerts on LinkedIn and Wellfound"],
        milestones: beginnerMilestones
      },
      intermediate: {
        stageName: "Intermediate Stage",
        stageTitle: "Architecture & Framework Mastery",
        timeline: "Weeks 4-7 (Estimated 80 Hours)",
        mentorAdvice: "Transition from writing code to engineering software. Focus on database design, asynchronous processing, and automated testing.",
        learningTopics: ["Relational & NoSQL Database Schema Design", "Asynchronous Programming & Event Loops", "Authentication (JWT, OAuth2, Session)", "Caching Strategies (Redis)", "Docker Containerization"],
        recommendedProjects: [
          { title: "Real-time Collaborative Dashboard", description: "Build a multi-user platform featuring WebSockets, caching, and state synchronization.", keyDeliverables: ["WebSocket Server", "Redis Cache", "Role-based Access"], portfolioImpact: "Proves ability to engineer responsive real-time applications." },
          { title: "E-Commerce Micro-services API", description: "Design order processing and inventory modules with transaction isolation.", keyDeliverables: ["DB Transactions", "Stripe API Integration", "Docker Compose"], portfolioImpact: "Shows readiness for real-world commercial software." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified Developer Associate", issuer: "Amazon Web Services", relevance: "Very High for Backend & Cloud", estimatedCost: "$150" },
          { name: "MongoDB Certified Developer", issuer: "MongoDB Inc", relevance: "High for NoSQL Systems", estimatedCost: "$150" }
        ],
        recommendedTools: ["Redis", "PostgreSQL / MongoDB", "Docker Compose", "GitHub Actions", "Swagger / OpenAPI"],
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
        jobApplicationStrategy: ["Apply to 10 safe companies to build interview momentum", "Customize resume keywords for each application", "Leverage campus or alumni referral requests"],
        milestones: intermediateMilestones
      },
      advanced: {
        stageName: "Advanced Stage",
        stageTitle: "System Design & Enterprise Scale",
        timeline: "Weeks 8-10 (Estimated 90 Hours)",
        mentorAdvice: "Focus on scalability, fault tolerance, and CI/CD pipelines. Demonstrate that you can write code that runs reliably at scale.",
        learningTopics: ["Distributed Systems Architecture", "Microservices vs Monoliths", "Message Queues (Kafka / RabbitMQ)", "CI/CD Pipeline Automation", "Performance Monitoring & Logging"],
        recommendedProjects: [
          { title: "Distributed Task Scheduler & Queue", description: "Engineered a fault-tolerant message queue supporting retry policies and dead-letter queues.", keyDeliverables: ["Worker Pool", "DLQ Handling", "Prometheus Metrics"], portfolioImpact: "Distinguishes you as an advanced systems engineer." },
          { title: "High-Throughput Analytics Service", description: "Process millions of events with streaming ingestion and automated aggregation.", keyDeliverables: ["Kafka Pipeline", "Grafana Dashboard", "Load Testing"], portfolioImpact: "Demonstrates enterprise-grade data engineering capability." }
        ],
        recommendedCertifications: [
          { name: "AWS Solutions Architect Associate", issuer: "AWS", relevance: "Top Industry Standard", estimatedCost: "$150" },
          { name: "CKAD: Certified Kubernetes Application Developer", issuer: "Linux Foundation", relevance: "Gold standard for Kubernetes", estimatedCost: "$395" }
        ],
        recommendedTools: ["Kubernetes", "Apache Kafka", "Prometheus & Grafana", "Terraform", "JMeter / k6"],
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
        jobApplicationStrategy: ["Target tier-1 companies and high-growth startups", "Follow up on all applications after 5 business days", "Pitch customized value propositions in cold emails"],
        milestones: advancedMilestones
      },
      expert: {
        stageName: "Expert Stage",
        stageTitle: "Production Mastery & Career Acceleration",
        timeline: "Weeks 11-12+ (Ongoing Mastery)",
        mentorAdvice: "Position yourself as an indispensable asset. Focus on high-level production optimization, executive presence, and salary negotiation.",
        learningTopics: ["Production Zero-Downtime Deployments", "Security Audit & Vulnerability Scanning", "FinOps & Cloud Cost Optimization", "Technical Leadership & Mentorship", "Executive Compensation Negotiation"],
        recommendedProjects: [
          { title: "Open-Source Infrastructure SDK / Plugin", description: "Created and published an open-source library on npm/PyPI with thorough test coverage and automated release workflow.", keyDeliverables: ["NPM Package", "95%+ Test Coverage", "Documentation"], portfolioImpact: "Establishes industry authority and technical leadership." },
          { title: "Enterprise Security & Performance Audit", description: "Audited multi-service application for OWASP Top 10 vulnerabilities and reduced cloud bill by 30%.", keyDeliverables: ["Audit Report", "Cost Breakdown", "Remediation PRs"], portfolioImpact: "Demonstrates executive business mindset and production vigilance." }
        ],
        recommendedCertifications: [
          { name: "AWS Certified DevOps Engineer Professional", issuer: "AWS", relevance: "Elite Senior Level Credential", estimatedCost: "$300" },
          { name: "Google Professional Cloud Architect", issuer: "Google Cloud", relevance: "Elite Cloud Credential", estimatedCost: "$200" }
        ],
        recommendedTools: ["Snyk / SonarQube", "AWS CloudWatch / Datadog", "OpenTelemetry", "Helm", "GitLab CI"],
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
        jobApplicationStrategy: ["Execute high-touch multi-channel application campaign", "Leverage competing job offers for negotiation leverage", "Evaluate total compensation package including equity & benefits"],
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
              {analysis.currentSkills.map((sk, idx) => (
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
              {analysis.missingSkills.map((sk, idx) => (
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
              {allCurrentStageMilestones.map((m) => {
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
                {currentStageObj.learningTopics.map((tp, idx) => (
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
                {currentStageObj.recommendedTools.map((tl, idx) => (
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
              {currentStageObj.recommendedProjects.map((prj, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Project Sprint 0{idx + 1}</span>
                    <h4 className="text-sm font-black text-white">{prj.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed font-semibold">{prj.description}</p>
                    
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase block">Deliverables:</span>
                      <div className="flex flex-wrap gap-1">
                        {prj.keyDeliverables.map((d, i) => (
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
                {currentStageObj.recommendedCertifications.map((cert, idx) => (
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
                {currentStageObj.courses.map((crs, idx) => (
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
                {currentStageObj.books.map((bk, idx) => (
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
                {currentStageObj.practicePlatforms.map((pf, idx) => (
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
                {currentStageObj.interviewPreparation.map((ip, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-3.5 rounded-xl space-y-2">
                    <h4 className="text-xs font-black text-white">{ip.topic}</h4>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-white/40 uppercase block">Sample Questions:</span>
                      <ul className="space-y-1">
                        {ip.keyQuestions.map((q, i) => (
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
                {currentStageObj.portfolioTasks.map((pt, idx) => (
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
                {currentStageObj.networkingSuggestions.map((net, idx) => (
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
                {currentStageObj.jobApplicationStrategy.map((jas, idx) => (
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
                  {analysis.alternativeCareerPaths.map((alt, idx) => (
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
                  {(analysis.emergingSkills || ["AI Co-pilots", "Data Literacy", "Cloud Operations", "Domain Compliance"]).map((sk, idx) => (
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
