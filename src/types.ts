export interface StudentProfile {
  name: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  gpa: string;
  backlogs: string;
  location: string;
  preferredLocation: string;
  technicalSkills: string[];
  nonTechnicalSkills: string[];
  projects: string;
  internships: string;
  certifications: string;
  extracurriculars: string;
  communicationLevel: string;
  careerGoals: string;
  targetRoles: string[];
  targetCompanies: string[];
  salaryExpectation: string;
  workMode: string;
  timeAvailable: string;
  placementDeadline: string;
  resumeStatus: string;
  linkedInStatus: string;
  portfolioStatus: string;
  codingLevel: string;
  confidenceLevel: string;
  constraints: string;
  linkedinUrl?: string;
  githubUrl?: string;
  email?: string;
  phone?: string;
  vorynexaId?: string;
}

export interface CareerClassification {
  industry: string;
  profession: string;
  specialization: string;
  careerLevel: string;
  futureGoal: string;
  targetCompany: string;
  targetCompanyTier: string;
  targetSalary: string;
  skillGapSummary: string;
  careerTransition: {
    transitionType: 'Direct Progression' | 'Vertical Acceleration' | 'Lateral Pivot' | 'Domain Switch' | 'Career Re-entry' | string;
    complexityLevel: 'Low (0-3 mos)' | 'Moderate (3-6 mos)' | 'High (6-12 mos)' | string;
    feasibilityScore: number;
    explainableReasoning: string;
  };
}

export interface CareerAnalysisSummary {
  overallMarketPositioning: string;
  explainableReasoning: string;
  truthVerifiedAssessment: string;
  coreValueProposition: string;
  competitiveMoat: string[];
}

export interface ResumeQualityAnalysis {
  overallScore: number;
  atsScore: number;
  bulletImpactScore: number;
  formattingScore: number;
  keyStrengths: string[];
  criticalFlaws: string[];
  actionableImprovements: string[];
}

export interface InterviewReadinessAnalysis {
  overallReadiness: number;
  technicalReadiness: number;
  behavioralReadiness: number;
  hrReadiness: number;
  keyStrengths: string[];
  recommendedFocusAreas: string[];
}

export interface LearningPlanStep {
  phase: string;
  timeframe: string;
  coreSkillFocus: string[];
  milestones: string[];
  actionItems: string[];
}

export interface CareerGrowthOpportunity {
  opportunityTitle: string;
  description: string;
  impactMultiplier: string;
  actionRequired: string;
}

export interface TargetCompanyRecommendation {
  companyName: string;
  tier: 'Dream Tier' | 'Core Match Tier' | 'Strategic Growth Tier' | string;
  whyFit: string;
  keyHiringCriteria: string[];
}

export interface FutureCareerPath {
  timeframe: '1 Year' | '3 Years' | '5 Years' | string;
  roleTitle: string;
  expectedScope: string;
  keyMilestones: string[];
}

export interface AlternativeCareerOption {
  roleTitle: string;
  industry: string;
  skillOverlapPercentage: number;
  transitionEffort: string;
  whyConsider: string;
}

export interface EnterpriseCareerIntelligence {
  classification: CareerClassification;
  careerAnalysis: CareerAnalysisSummary;
  resumeQuality: ResumeQualityAnalysis;
  interviewReadiness: InterviewReadinessAnalysis;
  learningPlan: LearningPlanStep[];
  careerGrowthOpportunities: CareerGrowthOpportunity[];
  recommendedCertifications: {
    name: string;
    issuingBody: string;
    relevance: string;
    roiScore: string;
  }[];
  recommendedProjects: {
    title: string;
    objective: string;
    technologiesOrTools: string[];
    keyDeliverables: string[];
    resumeImpactLine: string;
  }[];
  recommendedTechnologies: string[];
  recommendedSoftSkills: string[];
  targetCompanies: TargetCompanyRecommendation[];
  futureCareerPaths: FutureCareerPath[];
  alternativeCareerOptions: AlternativeCareerOption[];
  salaryGrowthSuggestions: {
    marketRangeGuidance: string;
    keySalaryMultipliers: string[];
    negotiationLeveragePoints: string[];
    disclaimer: string;
  };
}

export interface IntelligenceMap {
  summary: string;
  hiddenStrengths: string[];
  missingAssets: string[];
  roleMismatchRisk: string;
  careerIntelligence?: EnterpriseCareerIntelligence;
}

export interface ReadinessScoreDetail {
  score: number;
  loweringFactors: string[];
  fastestFix: string;
}

export interface ReadinessScores {
  overall: number;
  resume: ReadinessScoreDetail;
  linkedIn: ReadinessScoreDetail;
  skills: ReadinessScoreDetail;
  interview: ReadinessScoreDetail;
  aptitude: ReadinessScoreDetail;
  communication: ReadinessScoreDetail;
}

export interface RecommendedRole {
  role: string;
  type: 'dream' | 'safe' | 'alternative';
  probability: number; // 0-100
  salaryUpside: string;
  learningFit: string;
  reason: string;
}

export interface RoadmapTask {
  dayOrWeek: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface RoadmapMilestoneItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  userNotes?: string;
}

export interface RoadmapStageContent {
  stageName: 'Beginner Stage' | 'Intermediate Stage' | 'Advanced Stage' | 'Expert Stage' | string;
  stageTitle: string;
  timeline: string;
  mentorAdvice: string;
  learningTopics: string[];
  recommendedProjects: {
    title: string;
    description: string;
    keyDeliverables: string[];
    portfolioImpact: string;
  }[];
  recommendedCertifications: {
    name: string;
    issuer: string;
    relevance: string;
    estimatedCost: string;
  }[];
  recommendedTools: string[];
  books: {
    title: string;
    author: string;
    whyRead: string;
  }[];
  courses: {
    title: string;
    platform: string;
    urlOrProvider: string;
    type: 'Free' | 'Paid' | 'Freemium' | string;
  }[];
  practicePlatforms: {
    name: string;
    focus: string;
  }[];
  interviewPreparation: {
    topic: string;
    keyQuestions: string[];
    strategy: string;
  }[];
  portfolioTasks: string[];
  networkingSuggestions: string[];
  jobApplicationStrategy: string[];
  milestones: RoadmapMilestoneItem[];
}

export interface EnterpriseUserAnalysis {
  currentCareerStage: string;
  currentSkills: string[];
  missingSkills: string[];
  targetProfession: string;
  skillGapSummary: string;
  skillGapScore: number;
  resumeStrengthScore: number;
  resumeStrengthSummary: string;
  interviewReadinessScore: number;
  interviewReadinessSummary: string;
  mentorExecutiveVerdict: string;
  classifiedIndustry?: string;
  classifiedProfession?: string;
  classifiedDomain?: string;
  classifiedSpecialisation?: string;
  classifiedSubSpecialization?: string;
  classifiedCareerStage?: string;
  classifiedCareerLevel?: string;
  classifiedExperienceLevel?: string;
  classifiedCountry?: string;
  classifiedCareerGoal?: string;
  isTechnicalProfile?: boolean;
  classificationConfidenceScore?: number;
  clarificationQuestions?: string[];
  salaryProgressionGuidance?: string;
  alternativeCareerPaths?: { roleTitle: string; rationale: string; transitionEffort: string }[];
  commonMistakesToAvoid?: string[];
  industryTrends?: string[];
  emergingSkills?: string[];
  linkedInOptimizationTips?: string[];
  resumeImprovements?: string[];
  atsScore?: number;
}

export interface EnterpriseRoadmapParams {
  education?: string;
  currentSkills?: string[];
  experience?: string;
  careerGoal?: string;
  targetRole?: string;
  country?: string;
  preferredIndustry?: string;
  learningSpeed?: 'Standard (1x)' | 'Accelerated Sprints (2x)' | 'Steady Part-time (0.5x)' | string;
  availableTime?: string;
  budget?: '$0 (Free / Open Source)' | '< $500' | '$500 - $2,000' | 'Flexible / Employer Funded' | string;
  existingResumeText?: string;
}

export interface EnterpriseCareerRoadmap {
  id?: string;
  generatedAt?: string;
  inputs: EnterpriseRoadmapParams;
  userAnalysis: EnterpriseUserAnalysis;
  stages: {
    beginner: RoadmapStageContent;
    intermediate: RoadmapStageContent;
    advanced: RoadmapStageContent;
    expert: RoadmapStageContent;
  };
}

export interface RoadmapPlan {
  plan7Day: RoadmapTask[];
  plan30Day: RoadmapTask[];
  plan90Day: RoadmapTask[];
  enterpriseRoadmap?: EnterpriseCareerRoadmap;
}

export interface ProjectIdea {
  title: string;
  objective: string;
  tools: string[];
  deliverables: string[];
  resumeImpact: string;
}

export interface OutreachTemplate {
  channel: 'LinkedIn' | 'Email' | 'Referral Request';
  subject?: string;
  message: string;
}

export interface JobSearchStrategy {
  strategy: string;
  channels: string[];
  outreach: OutreachTemplate[];
}

export interface ResumeLinkedInSuggestion {
  optimizationScore?: number;
  keywordMatchScore?: number;
  atsReadabilityScore?: number;
  uploadedText?: string;
  atsBulletImprovements: { before: string; after: string; explanation: string }[];
  weakPhrasesDetected: string[];
  suggestedHeadline: string;
  suggestedAboutSection: string;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  type: 'technical' | 'behavioral' | 'hr' | 'leadership' | 'government' | 'domain' | string;
  interviewType?: 'HR' | 'Technical' | 'Behavioural' | 'Leadership' | 'Government' | 'Domain-specific' | string;
  experienceLevel?: 'Fresher' | 'Experienced Professional' | string;
  domainCategory?: string;
  expectedFocus: string;
}

export interface EvaluationDimensions {
  communication: number;        // Communication clarity & structure
  technicalAccuracy: number;    // Technical / domain accuracy
  confidence: number;           // Spoken & written confidence
  grammar: number;              // Grammar & syntax correctness
  professionalism: number;      // Executive tone & etiquette
  problemSolving: number;       // Problem solving & analytical logic
  depthOfKnowledge: number;     // Knowledge depth & domain mastery
  behaviour: number;            // Behavioral / STAR alignment & ownership
  leadership?: number;          // Vision, delegation, & leadership impact
  softSkills?: number;          // Empathy, collaboration, & active listening
  vocabulary?: number;          // Lexicon precision & domain terminology
  clarity?: number;             // Directness & articulation
  structure?: number;           // STAR / PREP structural organization
  conciseness?: number;         // Signal-to-noise ratio & brevity
  domainKnowledge?: number;     // Industry-specific subject mastery
}

export interface MockInterviewChatHistoryItem {
  role: 'interviewer' | 'student';
  text: string;
  feedback?: string;
  score?: number;
  suggestedStarAnswer?: string;
  dimensions?: EvaluationDimensions;
  // Legacy / convenience shortcuts
  technicalDepth?: number;
  communicationClarity?: number;
  confidence?: number;
  grammar?: number;
  professionalism?: number;
  problemSolving?: number;
  depthOfKnowledge?: number;
  behaviour?: number;
  hesitationDuration?: number;
  wordsPerMinute?: number;
  totalFillerCount?: number;
  audioUrl?: string;
}

export interface MockInterviewSession {
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  chatHistory: MockInterviewChatHistoryItem[];
  status: 'idle' | 'ongoing' | 'completed';
  category?: string;
  experienceLevel?: string;
  domain?: string;
  role?: string;
  hiringRecommendation?: string;
  finalReportSummary?: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  base64Data?: string;
  textContent?: string;
  linkUrl?: string;
  category: 'resume_photo' | 'document_pdf' | 'portfolio_link' | 'certificate_photo' | 'transcript' | 'other';
  previewUrl?: string;
}

export interface FileAnalysisResult {
  isResume?: boolean;
  nonResumeReason?: string | null;
  overallScore: number;
  atsScore?: number;
  grammarScore?: number;
  formattingScore?: number;
  professionalismScore?: number;
  careerReadinessScore?: number;
  fileTypeDetected: string;
  extractedText: string;
  documentQualityScore?: number;
  atsCompatibilityScore?: number;
  professionClassification?: {
    profession?: string;
    industry?: string;
    careerStage?: string;
    experienceLevel?: string;
    seniority?: string;
    domain?: string;
  };
  extractedDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    address?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    college?: string;
    degree?: string;
    careerSummary?: string;
    technicalSkills?: string[];
    softSkills?: string[];
    projects?: Array<{ title: string; description?: string; techUsed?: string[] } | string>;
    experience?: Array<{ company: string; role: string; duration?: string; highlights?: string[] }>;
    internships?: string[];
    certifications?: string[];
    achievements?: string[];
    languages?: string[];
    publications?: string[];
    awards?: string[];
  };
  keyStrengths?: string[];
  criticalFlawsAndRisks?: string[];
  missingKeywords?: string[];
  missingSections?: string[];
  formattingSuggestions?: string[];
  grammarAnalysis?: string;
  industryFitAnalysis?: string;
  roleSuitability?: string;
  skillGapAnalysis?: string[];
  atsBulletImprovements?: { before: string; after: string; explanation: string }[];
  recommendedProjects?: Array<{ title: string; objective?: string; tools?: string[]; deliverables?: string[]; resumeImpact?: string }>;
  recommendedCertifications?: Array<{ name: string; issuer?: string; relevance?: string }>;
  careerRoadmapSuggestions?: string[];
  interviewPreparationTips?: string[];
  overallVerdict?: string;
  recommendedActionableSteps?: string[];
}

export interface PastInterviewSession {
  id: string;
  role: string;
  category?: string;
  experienceLevel?: string;
  domain?: string;
  timestamp: string;
  overallScore: number;
  hiringRecommendation?: string;
  metrics: {
    communication: number;
    technicalAccuracy: number;
    confidence: number;
    grammar: number;
    professionalism: number;
    problemSolving: number;
    depthOfKnowledge: number;
    behaviour: number;
    // Legacy shortcuts
    technicalDepth?: number;
    communicationClarity?: number;
    averageHesitationDuration?: number;
    averageWordsPerMinute?: number;
    totalFillerCount?: number;
  };
  questionsAndAnswers: {
    question: string;
    answer: string;
    feedback: string;
    score: number;
    suggestedStarAnswer: string;
    type: string;
    audioUrl?: string;
    dimensions?: EvaluationDimensions;
    metrics: {
      communication: number;
      technicalAccuracy: number;
      confidence: number;
      grammar: number;
      professionalism: number;
      problemSolving: number;
      depthOfKnowledge: number;
      behaviour: number;
      technicalDepth?: number;
      communicationClarity?: number;
      hesitationDuration?: number;
      wordsPerMinute?: number;
      totalFillerCount?: number;
    };
  }[];
}

export interface NegotiationAdvisorResponse {
  politeStrategy: string;
  counterOfferTemplate: string;
  responseToHrQuestions: { question: string; response: string }[];
}

export interface CommunicationTip {
  tip: string;
  category: 'Fluency' | 'Confidence' | 'Body Language';
  howToPractice: string;
}

export interface HRProfileAnalysis {
  linkedinUrl: string;
  githubUrl: string;
  ratings: {
    linkedinCompleteness: number;
    githubActivity: number;
    hrAppeal: number;
    professionalism: number;
  };
  pros: string[];
  cons: string[];
  hrVerdict: string;
  criticalFixes: string[];
}

export interface UniversalProfessionClassification {
  industry: string;
  primaryProfession: string;
  specialization: string;
  careerStage: string;
  confidenceScore: number;
  needsClarification: boolean;
  clarificationQuestions?: string[];
  domainTerminology: string[];
  atsKeywords: string[];
  recommendedTemplateStyle: 'Modern' | 'Corporate' | 'Minimal' | 'Executive' | 'Academic' | 'Research' | 'Creative';
  recommendedSkills: {
    hardSkills: string[];
    toolsAndSoftware: string[];
    domainKnowledge: string[];
    softSkills: string[];
  };
  recommendedProjects: {
    title: string;
    objective: string;
    toolsOrMethods: string[];
    deliverables: string[];
    resumeImpact: string;
  }[];
  recommendedCertifications: {
    name: string;
    issuingBody: string;
    relevance: string;
  }[];
  careerRoadmap: {
    phase: string;
    timeframe: string;
    focusMilestone: string;
    keySkillsToMaster: string[];
  }[];
}

export interface UniversalProfessionDomain {
  id: string;
  name: string;
  category: string;
  description: string;
  commonRoles: string[];
  iconName: string;
  sampleTerminology: string[];
  sampleAtsKeywords: string[];
  defaultTemplate: 'Modern' | 'Corporate' | 'Minimal' | 'Executive' | 'Academic' | 'Research' | 'Creative';
}


