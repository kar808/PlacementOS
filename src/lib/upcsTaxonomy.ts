/**
 * Vorynexa Universal Profession Classification System (UPCS)
 * Volume 2 — Architectural Blueprint & Multi-Signal Classification Engine
 */

export interface UPCSClassificationResult {
  primaryIndustry: string;
  industrySector: string;
  subSector: string;
  profession: string;
  specialization: string;
  careerStage: string;
  employmentType: string;
  experienceLevel: string;
  profileType: "Technical" | "Non-Technical" | "Hybrid" | "Academic" | "Creative";
  careerTrack: "Individual Contributor" | "Leadership / Management" | "Research & Academic" | "Entrepreneurial / Freelance";
  confidenceScore: number; // 0 - 100
  domainConfidence: "High" | "Medium" | "Low";
  targetRoleAlignment: number; // 0 - 100
  resumeStrategy: "Hybrid STAR" | "Reverse Chronological" | "Functional Skill-Based" | "Targeted Executive" | "Academic Curriculum Vitae";
  recommendedTemplate: "Modern Technical" | "Executive Corporate" | "Creative Showcase" | "Academic Research" | "Minimalist Minimal";
  recommendedTone: "Impact-Driven & Metric-Focused" | "Executive & Strategic" | "Academic & Methodological" | "Innovative & Direct";
  atsKeywordsSet: string[];
  missingInformation: string[];
  clarificationQuestions: string[];
  specialCasesDetected: string[];
  multiDisciplinarySignals?: string[];
}

export const UPCS_INDUSTRY_TAXONOMY = {
  SOFTWARE_IT: {
    id: "SOFTWARE_IT",
    label: "Software & Information Technology",
    sectors: [
      "Artificial Intelligence & Machine Learning",
      "Full-Stack & Cloud Backend",
      "Frontend UI/UX Engineering",
      "Data Science, Data Engineering & Analytics",
      "Cybersecurity, Infosec & Cryptography",
      "Cloud Infrastructure, DevOps & Platform Engineering",
      "Embedded Systems, IoT & Robotics",
      "Mobile App Development (iOS/Android)",
      "Game Development & Computer Graphics",
      "Enterprise Systems (SAP, Salesforce, ERP)"
    ]
  },
  ENGINEERING_MANUFACTURING: {
    id: "ENGINEERING_MANUFACTURING",
    label: "Engineering & Applied Sciences",
    sectors: [
      "Mechanical & Mechatronics Engineering",
      "Electrical, Electronics & Microelectronics",
      "Civil, Structural & Environmental Engineering",
      "Aerospace, Avionics & Aviation Tech",
      "Automotive & Autonomous Vehicle Systems",
      "Chemical & Process Engineering",
      "Industrial & Supply Chain Engineering",
      "Robotics, Automation & Control Systems"
    ]
  },
  HEALTHCARE_MEDICINE: {
    id: "HEALTHCARE_MEDICINE",
    label: "Healthcare & Life Sciences",
    sectors: [
      "Clinical Medicine & Surgery",
      "Nursing & Patient Care",
      "Pharmacy & Pharmaceutical Research",
      "Biotechnology & Genetic Engineering",
      "Dentistry & Oral Health",
      "Public Health, Epidemiology & Health Admin",
      "Medical Devices & Biomedical Engineering",
      "Psychology, Mental Health & Neuroscience"
    ]
  },
  FINANCE_COMMERCE: {
    id: "FINANCE_COMMERCE",
    label: "Finance, Banking & Economics",
    sectors: [
      "Investment Banking & Venture Capital",
      "Corporate Finance & Financial Analysis",
      "Quantitative Finance & Algorithmic Trading",
      "Accounting, Auditing & Taxation",
      "Commercial Banking & Fintech",
      "Risk Management & Compliance",
      "Actuarial Science & Insurance"
    ]
  },
  BUSINESS_MANAGEMENT: {
    id: "BUSINESS_MANAGEMENT",
    label: "Business, Strategy & Management",
    sectors: [
      "Product Management & Product Ops",
      "Management Consulting & Strategy",
      "Operations & Supply Chain Management",
      "Human Resources, People Ops & Talent Acquisition",
      "Marketing, Growth & Digital Media",
      "Sales, Business Development & Account Mgmt",
      "Project & Program Management (PMP, Agile)"
    ]
  },
  CREATIVE_MEDIA_DESIGN: {
    id: "CREATIVE_MEDIA_DESIGN",
    label: "Creative Arts, Design & Media",
    sectors: [
      "UI/UX Design & Product Design",
      "Graphic Design, Branding & Visual Identity",
      "Content Writing, Copywriting & Technical Writing",
      "Digital Marketing & SEO/SEM Strategy",
      "Film, Video Production & Animation",
      "Architecture, Interior & Industrial Design",
      "Journalism, PR & Communications"
    ]
  },
  LAW_GOVERNMENT_PUBLIC: {
    id: "LAW_GOVERNMENT_PUBLIC",
    label: "Law, Government & Public Policy",
    sectors: [
      "Corporate Law, IP & Technology Law",
      "Litigation & Legal Research",
      "Public Policy, Governance & Civil Services",
      "Defense, Military & Public Safety",
      "NGO, Non-Profit & International Development"
    ]
  },
  EDUCATION_RESEARCH: {
    id: "EDUCATION_RESEARCH",
    label: "Education, Academia & Research",
    sectors: [
      "Higher Education, Professorship & Research",
      "K-12 Education & Curriculum Design",
      "EdTech & Instructional Engineering",
      "Scientific Research & Laboratory Research"
    ]
  }
};

export const UPCS_CAREER_STAGES = [
  "High School Student",
  "Undergraduate College Student",
  "Postgraduate / Masters Student",
  "PhD / Doctoral Researcher",
  "Fresh Graduate",
  "Intern / Apprentice",
  "Entry-Level Professional (0-2 yrs)",
  "Mid-Level Professional (3-5 yrs)",
  "Senior Specialist (6-8 yrs)",
  "Technical Lead / Engineering Manager",
  "Director / VP of Engineering",
  "Executive / C-Suite (CTO, CEO, VP)",
  "Founder / Co-Founder",
  "Career Switcher / Transitioning Professional",
  "Freelance Consultant / Independent Contractor",
  "Research Fellow / Postdoc"
];

/**
 * Universal Multi-Signal Classification Engine Rule Assessor
 */
export function assessMultiSignalProfile(profile: Record<string, any>): Partial<UPCSClassificationResult> {
  const skills = [...(profile.technicalSkills || []), ...(profile.nonTechnicalSkills || [])].join(" ").toLowerCase();
  const degree = (profile.degree || profile.branch || "").toLowerCase();
  const projects = (profile.projects || "").toLowerCase();
  const experience = (profile.internships || profile.experience || "").toLowerCase();

  let isTech = false;
  let isDesign = false;
  let isBusiness = false;

  if (skills.includes("react") || skills.includes("python") || skills.includes("sql") || skills.includes("java") || degree.includes("computer") || degree.includes("engineering")) {
    isTech = true;
  }
  if (skills.includes("figma") || skills.includes("ui/ux") || skills.includes("design") || projects.includes("prototype")) {
    isDesign = true;
  }
  if (skills.includes("marketing") || skills.includes("agile") || skills.includes("sales") || skills.includes("finance")) {
    isBusiness = true;
  }

  const specialCases: string[] = [];
  if (isTech && isBusiness) specialCases.push("Multidisciplinary Tech-Business Profile (e.g. Product Manager / Tech Entrepreneur)");
  if (isTech && isDesign) specialCases.push("Hybrid UI/UX Engineer Profile");
  if (!experience && projects) specialCases.push("Project-Heavy Early Career Candidate");

  let confidence = 85;
  if (!skills) confidence -= 20;
  if (!experience && !projects) confidence -= 25;

  return {
    confidenceScore: Math.max(40, Math.min(98, confidence)),
    domainConfidence: confidence >= 80 ? "High" : confidence >= 60 ? "Medium" : "Low",
    specialCasesDetected: specialCases,
  };
}
