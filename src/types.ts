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

export interface IntelligenceMap {
  summary: string;
  hiddenStrengths: string[];
  missingAssets: string[];
  roleMismatchRisk: string;
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

export interface RoadmapPlan {
  plan7Day: RoadmapTask[];
  plan30Day: RoadmapTask[];
  plan90Day: RoadmapTask[];
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
  type: 'technical' | 'behavioral' | 'hr';
  expectedFocus: string;
}

export interface MockInterviewChatHistoryItem {
  role: 'interviewer' | 'student';
  text: string;
  feedback?: string;
  score?: number;
  suggestedStarAnswer?: string;
  technicalDepth?: number;
  communicationClarity?: number;
  confidence?: number;
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
}

export interface UploadedFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  base64Data?: string;
  linkUrl?: string;
  category: 'resume_photo' | 'document_pdf' | 'portfolio_link' | 'certificate_photo' | 'transcript' | 'other';
  previewUrl?: string;
}

export interface FileAnalysisResult {
  overallScore: number;
  fileTypeDetected: string;
  extractedText: string;
  documentQualityScore: number;
  atsCompatibilityScore: number;
  extractedDetails: {
    name?: string;
    email?: string;
    phone?: string;
    college?: string;
    degree?: string;
    technicalSkills?: string[];
    projects?: string[];
    internships?: string[];
    certifications?: string[];
  };
  keyStrengths: string[];
  criticalFlawsAndRisks: string[];
  missingKeywords: string[];
  formattingSuggestions: string[];
  atsBulletImprovements: { before: string; after: string; explanation: string }[];
  overallVerdict: string;
  recommendedActionableSteps: string[];
}

export interface PastInterviewSession {
  id: string;
  role: string;
  timestamp: string;
  overallScore: number;
  metrics: {
    technicalDepth: number;
    communicationClarity: number;
    confidence: number;
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
    metrics: {
      technicalDepth: number;
      communicationClarity: number;
      confidence: number;
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

