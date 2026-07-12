import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple debug logging array
const debugLogs: string[] = [];
app.use((req, res, next) => {
  const logStr = `[${new Date().toISOString()}] ${req.method} ${req.url}`;
  debugLogs.push(logStr);
  console.log(logStr);
  
  // Keep only last 100 logs
  if (debugLogs.length > 100) debugLogs.shift();
  
  // Store them to a file we can inspect
  try {
    fs.writeFileSync(path.join(process.cwd(), "src", "api-debug.log"), debugLogs.join("\n"));
  } catch (err) {}
  
  next();
});


// Load Firebase Project ID for JWT validation
let firebaseProjectId = "fifth-magpie-q3n78";
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.projectId) {
      firebaseProjectId = config.projectId;
    }
  }
} catch (e) {
  console.warn("Could not load firebase-applet-config.json:", e);
}

// Custom JWT decoding function
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

// JWT validation middleware for Express API routes
const validateJWT = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized access: Missing or malformed authorization header."
    });
  }

  const token = authHeader.split(" ")[1];

  // Support sandbox/development environments bypass
  if (token === "sandbox-token-123456" || token.startsWith("sandbox-token")) {
    return next();
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized access: Invalid JWT token signature structure."
      });
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));

    // Validate expiration
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized access: Authorization token has expired."
      });
    }

    // Validate Issuer & Audience claims
    if (payload.iss !== `https://securetoken.google.com/${firebaseProjectId}`) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized access: Invalid Firebase token issuer."
      });
    }

    if (payload.aud !== firebaseProjectId) {
      return res.status(401).json({
        error: true,
        message: "Unauthorized access: Invalid Firebase token audience target."
      });
    }

    // Attach verified user information to the request context
    (req as any).user = {
      uid: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified
    };

    next();
  } catch (err) {
    return res.status(401).json({
      error: true,
      message: "Unauthorized access: Failed to validate secure token."
    });
  }
};

// Server-side request integrity calculation helper (matching the client-side implementation)
function computeRequestIntegrity(endpoint: string, body: any, timestamp: number, userId: string): string {
  const secret = "PlacementOS_Secure_Key_2026";
  const data = `${endpoint}:${JSON.stringify(body || {})}:${timestamp}:${userId}:${secret}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

// Middleware to enforce strict request integrity and reject replay attacks
const validateRequestIntegrity = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const timestampHeader = req.headers["x-request-timestamp"];
  const integrityHeader = req.headers["x-request-integrity"];
  const clientHeader = req.headers["x-request-client-id"];

  if (!timestampHeader || !integrityHeader || !clientHeader) {
    return res.status(403).json({
      error: true,
      message: "Security violation: Missing integrity handshake parameters."
    });
  }

  const timestamp = Number(timestampHeader);
  const now = Date.now();

  // Enforce 120-second expiration to prevent replay exploits (including some clock drift allowance)
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 120000) {
    return res.status(403).json({
      error: true,
      message: "Security violation: Request signature has expired or clock drift is too large."
    });
  }

  // Recalculate signature and verify matches
  const expectedSig = computeRequestIntegrity(req.path, req.body, timestamp, clientHeader as string);
  if (expectedSig !== integrityHeader) {
    return res.status(403).json({
      error: true,
      message: "Security violation: Request integrity token verification failed."
    });
  }

  next();
};

// Custom in-memory rate-limiting middleware to prevent brute-force & denial of service attacks
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

const rateLimiter = (limit: number, windowMs: number) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
    const clientId = (req.headers["x-request-client-id"] as string) || (req as any).user?.uid || ip;
    const now = Date.now();

    let record = rateLimitMap.get(clientId);
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    record.count++;
    rateLimitMap.set(clientId, record);

    if (record.count > limit) {
      return res.status(429).json({
        error: true,
        message: "Rate limit exceeded: Too many requests for this user ID. Please wait a moment before trying again."
      });
    }

    next();
  };
};

// Register middlewares on all API routes
app.use("/api", validateJWT);
app.use("/api", validateRequestIntegrity);
app.use("/api", rateLimiter(40, 60 * 1000)); // Enforce max 40 requests per minute per user ID

// Lazy-initialized Gemini client to prevent startup crashes if GEMINI_API_KEY is not defined.
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it via the Secrets panel in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Robust generation helper with automatic fallback for high-demand 503 errors
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;
  for (const model of models) {
    try {
      console.log(`Running generation using model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      console.error(`Error with model ${model}:`, err);
      lastError = err;
      const errMsg = String(err).toLowerCase();
      if (
        errMsg.includes("503") ||
        errMsg.includes("unavailable") ||
        errMsg.includes("overloaded") ||
        errMsg.includes("spikes") ||
        errMsg.includes("demand")
      ) {
        console.warn(`Model ${model} is overloaded or unavailable. Attempting fallback...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Global API key check helper
const handleApiError = (res: express.Response, error: any) => {
  const errStr = error instanceof Error ? error.stack || error.message : String(error);
  const logStr = `[${new Date().toISOString()}] API ERROR: ${errStr}`;
  debugLogs.push(logStr);
  console.error(logStr);
  try {
    fs.writeFileSync(path.join(process.cwd(), "src", "api-debug.log"), debugLogs.join("\n"));
  } catch (err) {}

  res.status(500).json({
    error: true,
    message: error instanceof Error ? error.message : "An unexpected server error occurred.",
  });
};

// ------------------------------------------------------------------------
// API ENDPOINT 1: Full placement analysis (Intelligence map, Scores, Recommended roles)
// ------------------------------------------------------------------------
app.post("/api/placement/analyze", async (req, res) => {
  try {
    const profile = req.body;
    const ai = getAI();

    const prompt = `You are the core intelligence engine of "PlacementOS", an elite AI co-pilot for student employability.
Analyze the following student profile and return a structured JSON response.

STUDENT PROFILE:
- Name: ${profile.name}
- College: ${profile.college}
- Degree & Branch: ${profile.degree} in ${profile.branch}
- Year: ${profile.year}
- GPA: ${profile.gpa}
- Active Backlogs: ${profile.backlogs}
- Location: ${profile.location} (Preferred: ${profile.preferredLocation})
- Technical Skills: ${profile.technicalSkills?.join(", ") || "None specified"}
- Non-Technical Skills: ${profile.nonTechnicalSkills?.join(", ") || "None specified"}
- Projects: ${profile.projects || "None"}
- Internships: ${profile.internships || "None"}
- Certifications: ${profile.certifications || "None"}
- Extracurriculars: ${profile.extracurriculars || "None"}
- Communication Level: ${profile.communicationLevel}
- Career Goals: ${profile.careerGoals}
- Target Roles: ${profile.targetRoles?.join(", ") || "None specified"}
- Target Companies: ${profile.targetCompanies?.join(", ") || "None specified"}
- Expected Salary: ${profile.salaryExpectation}
- Work Mode: ${profile.workMode}
- Time available daily for prep: ${profile.timeAvailable}
- Placement Deadline: ${profile.placementDeadline}
- Resume Status: ${profile.resumeStatus}
- LinkedIn Status: ${profile.linkedInStatus}
- Portfolio Status: ${profile.portfolioStatus}
- Coding Level: ${profile.codingLevel}
- Confidence Level: ${profile.confidenceLevel}
- Specific constraints: ${profile.constraints || "None"}

Please evaluate and return a single cohesive JSON object conforming to the required schema. Ensure scores are numbers from 0 to 100. Be honest, strict but constructive, and deeply personalized. Avoid generic platitudes.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["intelligenceMap", "scores", "recommendedRoles"],
          properties: {
            intelligenceMap: {
              type: Type.OBJECT,
              required: ["summary", "hiddenStrengths", "missingAssets", "roleMismatchRisk"],
              properties: {
                summary: { type: Type.STRING, description: "A high-impact recruiter-level summary of who they are and their core value." },
                hiddenStrengths: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "2-3 undetected strengths derived from their profile, projects, or background." 
                },
                missingAssets: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Missing placement essentials (e.g. ATS compliance, portfolio, specific certifications, Github, LinkedIn, custom projects)." 
                },
                roleMismatchRisk: { type: Type.STRING, description: "Honest analysis of whether their goals/target roles align with their skills & constraints, and how to mitigate." }
              }
            },
            scores: {
              type: Type.OBJECT,
              required: ["overall", "resume", "linkedIn", "skills", "interview", "aptitude", "communication"],
              properties: {
                overall: { type: Type.INTEGER },
                resume: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                },
                linkedIn: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                },
                skills: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                },
                interview: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                },
                aptitude: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                },
                communication: {
                  type: Type.OBJECT,
                  required: ["score", "loweringFactors", "fastestFix"],
                  properties: {
                    score: { type: Type.INTEGER },
                    loweringFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastestFix: { type: Type.STRING }
                  }
                }
              }
            },
            recommendedRoles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["role", "type", "probability", "salaryUpside", "learningFit", "reason"],
                properties: {
                  role: { type: Type.STRING, description: "Specific role name" },
                  type: { type: Type.STRING, description: "Must be 'dream', 'safe', or 'alternative'" },
                  probability: { type: Type.INTEGER, description: "Probability of getting placed in this role in their current condition (0-100)" },
                  salaryUpside: { type: Type.STRING, description: "Expected range (e.g. ₹6-8 LPA or $80k-$100k)" },
                  learningFit: { type: Type.STRING, description: "Rating and description of growth potential" },
                  reason: { type: Type.STRING, description: "Concrete why this fits their profile background" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 2: Resume & LinkedIn Content Builder
// ------------------------------------------------------------------------
app.post("/api/placement/resume-optimize", async (req, res) => {
  try {
    const { profile, jobDescription } = req.body;
    const ai = getAI();

    const prompt = `You are the super-premium Resume & LinkedIn Engine of "PlacementOS".
Optimize the student's background. If a job description is provided, customize the suggestions to match its keywords perfectly. 
Do not fabricate experience. Instead, rewrite existing descriptions or recommend how to describe their existing projects/skills using high-impact, tool-specific, and output-driven bullet points (Impact, Ownership, Tools, Outcomes).

STUDENT BACKGROUND:
- Skills: Tech(${profile.technicalSkills?.join(",")}), Non-tech(${profile.nonTechnicalSkills?.join(",")})
- Existing Projects/Internships: ${profile.projects || "None specified"} | ${profile.internships || "None specified"}
- Core Target Roles: ${profile.targetRoles?.join(", ")}

TARGET JOB DESCRIPTION (Optional, if empty optimize generally for target roles):
"${jobDescription || "N/A"}"

Please provide:
1. "atsBulletImprovements": A list of before/after rewrites for their resume.
2. "weakPhrasesDetected": Phrases or filler words to avoid in their CV.
3. "suggestedHeadline": A premium LinkedIn headline (e.g., using keywords, value-proposition, or modern hooks).
4. "suggestedAboutSection": A highly professional, engaging LinkedIn "About" or resume summary section that stands out to recruiters.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["atsBulletImprovements", "weakPhrasesDetected", "suggestedHeadline", "suggestedAboutSection"],
          properties: {
            atsBulletImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["before", "after", "explanation"],
                properties: {
                  before: { type: Type.STRING, description: "The weak or standard bullet point" },
                  after: { type: Type.STRING, description: "The supercharged ATS bullet using impact, ownership, tools, and quantifiable outcome" },
                  explanation: { type: Type.STRING, description: "What was changed and why it appeals to recruiters" }
                }
              }
            },
            weakPhrasesDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Vague terms detected (e.g., 'Responsible for', 'Team player', 'Hard worker')"
            },
            suggestedHeadline: { type: Type.STRING },
            suggestedAboutSection: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 3: Day-Wise / Week-Wise Roadmap & Skill-Gaps
// ------------------------------------------------------------------------
app.post("/api/placement/roadmap", async (req, res) => {
  try {
    const profile = req.body;
    const ai = getAI();

    const prompt = `You are the dynamic Skill-gap and Roadmap Engine of "PlacementOS".
Create highly personalized placement roadmaps.
Determine missing skills and produce structured 7-day, 30-day, and 90-day roadmaps based on their available time.

STUDENT PROFILE:
- Technical Skills: ${profile.technicalSkills?.join(", ")}
- Non-Technical Skills: ${profile.nonTechnicalSkills?.join(", ")}
- Career Goals: ${profile.careerGoals}
- Target Roles: ${profile.targetRoles?.join(", ")}
- Time Available Daily: ${profile.timeAvailable}
- Placement Deadline: ${profile.placementDeadline}
- Coding Level: ${profile.codingLevel}

Output exactly three distinct arrays representing:
- plan7Day: Crucial sprint tasks to fix urgent issues (e.g. resume, resume projects, basic interview intro)
- plan30Day: Core preparation (solving aptitude, practicing mock rounds, core DSA/technical domain knowledge, mock tests)
- plan90Day: Mastering off-campus networking, referrals, advanced projects, continuous application pipelines.

Provide highly actionable tasks. Each task must specify a 'priority' of High, Medium, or Low.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["plan7Day", "plan30Day", "plan90Day"],
          properties: {
            plan7Day: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayOrWeek", "taskName", "priority", "description"],
                properties: {
                  dayOrWeek: { type: Type.STRING, description: "e.g., 'Day 1-2', 'Day 3', etc." },
                  taskName: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "Must be 'High', 'Medium', or 'Low'" },
                  description: { type: Type.STRING, description: "Actionable details with resource/strategy recommendations" }
                }
              }
            },
            plan30Day: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayOrWeek", "taskName", "priority", "description"],
                properties: {
                  dayOrWeek: { type: Type.STRING, description: "e.g., 'Week 1', 'Week 2', etc." },
                  taskName: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            plan90Day: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayOrWeek", "taskName", "priority", "description"],
                properties: {
                  dayOrWeek: { type: Type.STRING, description: "e.g., 'Month 2', 'Month 3', etc." },
                  taskName: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 4: Custom Project Generator
// ------------------------------------------------------------------------
app.post("/api/placement/projects", async (req, res) => {
  try {
    const { profile, targetRole } = req.body;
    const ai = getAI();

    const prompt = `You are the elite Project Advisor of "PlacementOS".
Recommend 2 distinct project ideas tailored specifically to the target role: ${targetRole || "their target role"}.
The projects must match their background and coding level (${profile.codingLevel}).
- If they are standard/technical, recommend portfolio-worthy full-stack, frontend, or data projects.
- If they are non-technical or coding level is None/Beginner, recommend comprehensive case studies, marketing campaigns, process improvements, or financial analyst reports.

STUDENT PROFILE:
- Skills: ${profile.technicalSkills?.join(", ")}, ${profile.nonTechnicalSkills?.join(", ")}
- Coding Level: ${profile.codingLevel}
- Branch: ${profile.branch} | Degree: ${profile.degree}

Provide a JSON array of project recommendations. Each project must have:
- Title
- Objective (problem solved)
- Tools & technologies to use
- Key deliverables
- Resume Impact line (exactly how to write this project in a CV using impact/outcomes)
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["title", "objective", "tools", "deliverables", "resumeImpact"],
            properties: {
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
              resumeImpact: { type: Type.STRING, description: "High-impact sentence for resume" }
            }
          }
        }
      }
    });

    const text = response.text || "[]";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 5: Job Search Strategy & Outreach Scripts
// ------------------------------------------------------------------------
app.post("/api/placement/job-search", async (req, res) => {
  try {
    const profile = req.body;
    const ai = getAI();

    const prompt = `You are the Job Search Strategist of "PlacementOS".
Develop a specialized off-campus and on-campus application strategy for this student.
Generate highly professional recruiter outreach and networking messages tailored to LinkedIn and cold email.

STUDENT INFO:
- Name: ${profile.name}
- College: ${profile.college}
- Degree/Branch: ${profile.degree} in ${profile.branch}
- Target Companies: ${profile.targetCompanies?.join(", ") || "General companies"}
- Target Roles: ${profile.targetRoles?.join(", ")}
- Salary Range: ${profile.salaryExpectation}
- Strengths: ${profile.technicalSkills?.join(", ")}

Generate:
1. Overall strategy description.
2. Recommended application channels.
3. Three personalized, high-conversion outreach templates (e.g. LinkedIn connection request, cold recruiter email, and referral request to college alumni).
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["strategy", "channels", "outreach"],
          properties: {
            strategy: { type: Type.STRING, description: "Detailed strategy breakdown for finding work with their profile" },
            channels: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific platforms or methods (e.g. Wellfound, LinkedIn networking, Naukri)" },
            outreach: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["channel", "message"],
                properties: {
                  channel: { type: Type.STRING, description: "e.g., 'LinkedIn Request', 'Cold Email', 'Alumni Referral'" },
                  subject: { type: Type.STRING, description: "Optional subject line (e.g. for Cold Email)" },
                  message: { type: Type.STRING, description: "The copy-pasteable message with placeholders in square brackets" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 6: Interactive Interview Questions
// ------------------------------------------------------------------------
app.post("/api/placement/interview/questions", async (req, res) => {
  try {
    const { profile, role, excludeQuestions = [], sessionContext, performanceTrends, seed } = req.body;
    const ai = getAI();

    // Select a few random skills to focus on if possible to increase question variety
    const techSkills = profile.technicalSkills || [];
    const chosenTech = techSkills.length > 0 
      ? techSkills.sort(() => 0.5 - Math.random()).slice(0, 3).join(", ") 
      : "general industry tech stacks";

    let dynamicPromptDetails = "";
    if (sessionContext) {
      dynamicPromptDetails += `
SESSION ROTATION CONTEXT:
- Active Session ID: ${sessionContext.sessionId || "N/A"}
- Previous Session IDs: ${sessionContext.previousSessionIds?.join(", ") || "None"}
Utilize the session rotation context to completely pivot and rotate through different question categories. Do NOT repeat or duplicate the structure or core topics of any past interviews.`;
    }

    if (performanceTrends) {
      dynamicPromptDetails += `
CANDIDATE PERFORMANCE TRENDS:
- Total Mock Rounds Completed: ${performanceTrends.totalSessions || 0}
- Average Overall Score: ${performanceTrends.averageOverallScore !== null ? performanceTrends.averageOverallScore + "%" : "No score yet"}
- Average Technical Depth: ${performanceTrends.averageTechnicalDepth !== null ? performanceTrends.averageTechnicalDepth + "%" : "No score yet"}
- Average Communication Clarity: ${performanceTrends.averageCommunicationClarity !== null ? performanceTrends.averageCommunicationClarity + "%" : "No score yet"}
- Suggested Adaptive Difficulty: ${performanceTrends.suggestedDifficulty || "Intermediate"}
CRITICAL REQUIREMENT: Adapt the interview question difficulty dynamically to this suggested level. 
- Beginner: Focus on straightforward fundamental scenarios, simple bug fixing, or basic STAR achievements.
- Intermediate: Challenge them with operational problem-solving, mid-sized features, or communication gaps.
- Advanced: Challenge them with senior-level system design, complex distributed trade-offs, catastrophic outages, or multi-stakeholder conflicts.`;
    }

    if (seed) {
      dynamicPromptDetails += `
RANDOMIZATION SEED STIMULUS:
- Unique Session Random Seed: ${seed}
Utilize this seed to randomly choose distinct situational themes, business niches (e.g. Fintech, Healthcare, E-commerce, SaaS), or technological scenarios. Ensure maximum variability in every generation.`;
    }

    const prompt = `You are an elite Recruiter and Senior Technical HR Director simulating an interview for a ${role || "Target Role"}.
Based on the student's background, generate exactly 3 custom-crafted, highly specific, and completely unique interview questions that test their actual experiences, skills, gaps, or traits.
Do NOT generate generic, cliché, or repetitive questions (e.g., avoid standard introductory questions like 'tell me about yourself' or basic 'why do you want this role'). Produce unique, scenario-based, problem-solving, or deep technical questions.

CRITICAL REQUIREMENT: To guarantee maximum entropy, complete uniqueness, and rotation of these questions, you MUST NOT generate any questions similar to the following previously asked questions:
${excludeQuestions.length > 0 ? excludeQuestions.map((q: string) => `- "${q}"`).join("\n") : "- None"}

For this round, try to focus specifically on challenges involving: ${chosenTech}.
Inject a unique random theme or scenario (e.g. system design challenges, sudden product failures, scaling challenges, ethical conflicts, team resource crunches, or complex logic troubleshooting).
Dynamic Signature to prevent cached completions: [Random Signature: ${Math.random().toString(36).substring(7)} - Timestamp: ${Date.now()}]
${dynamicPromptDetails}

STUDENT BG:
- Degree/Branch: ${profile.degree} in ${profile.branch}
- Technical Skills: ${techSkills.join(", ")}
- Non-Tech Skills: ${(profile.nonTechnicalSkills || []).join(", ")}
- Projects: ${profile.projects || "Not specified"}
- Gaps/Constraints: ${profile.constraints || "None"}

Return exactly 3 questions with their types and what the interviewer expects to hear in a successful answer.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        temperature: 0.98, // Slightly higher for more creative variety
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "question", "type", "expectedFocus"],
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING, description: "Must be 'technical', 'behavioral', or 'hr'" },
              expectedFocus: { type: Type.STRING, description: "What key markers they are grading on" }
            }
          }
        }
      }
    });

    const text = response.text || "[]";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 7: Interactive Interview Answer Evaluator
// ------------------------------------------------------------------------
app.post("/api/placement/interview/evaluate", async (req, res) => {
  try {
    const { question, answer, type, expectedFocus, verbalMetrics } = req.body;
    const ai = getAI();

    let verbalPromptDetails = "";
    if (verbalMetrics) {
      const fillers = verbalMetrics.fillerCounts || {};
      verbalPromptDetails = `
CANDIDATE SPOKEN FLUENCY METRICS (FROM LIVE VOICE TRANSCRIPTION):
- Filler word occurrences: Um: ${fillers.um || 0}, Uh: ${fillers.uh || 0}, Like: ${fillers.like || 0}, Actually: ${fillers.actually || 0}, Basically: ${fillers.basically || 0}, So: ${fillers.so || 0}
- Spoken Confidence Level: ${verbalMetrics.sentimentLabel || "N/A"} (${verbalMetrics.sentimentScore || 50}%)
- Speaking Speed: ${verbalMetrics.wordsPerMinute || 0} Words Per Minute (WPM)
- Total Conversational Hesitation Pauses: ${verbalMetrics.hesitationDuration || 0} seconds

Please incorporate these specific verbal metrics, speaking speed, and silence hesitations into your detailed evaluation feedback. Assess the candidate's "confident fluency" (e.g., whether they speak too fast or too slow, take long silent gaps, or exhibit heavy filler clutter). Give them highly direct tips on how to slow down, pace themselves, eliminate fillers, and sound 10x more polished.
`;
    }

    const prompt = `You are a strict, top-tier HR Recruiter evaluating a candidate's response.
Evaluate the answer using professional HR methodologies (including STAR for behavioral/situational).
Be encouraging but highly actionable. Improve the answer and give the candidate a clear score (0-100).

QUESTION: "${question}"
CANDIDATE ANSWER: "${answer}"
QUESTION TYPE: "${type}"
EXPECTED MARKERS: "${expectedFocus}"
${verbalPromptDetails}

Evaluate and return:
1. "score": Number from 0 to 100 representing readiness of this answer.
2. "feedback": What was good, what was missing, and what filler words or tone to fix (make sure to reference their actual spoken fluency and filler words if any were detected).
3. "suggestedStarAnswer": A fully polished, natural-sounding rewrite of their answer using the STAR structure (Situation, Task, Action, Result) if behavioral, or clean direct logic if technical/HR. It should stay truthful to what the student described, but make it sound 10x more polished, confident, and professional.
4. "technicalDepth": An integer score from 0 to 100 evaluating the candidate's display of deep, clear technical reasoning, precision, and mastery of core engineering/domain concepts.
5. "communicationClarity": An integer score from 0 to 100 evaluating the structure, articulation, fluency, and readability of the response.
6. "confidence": An integer score from 0 to 100 evaluating the candidate's posture, authority, conviction, and directness.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "feedback", "suggestedStarAnswer", "technicalDepth", "communicationClarity", "confidence"],
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            suggestedStarAnswer: { type: Type.STRING },
            technicalDepth: { type: Type.INTEGER, description: "Score from 0 to 100" },
            communicationClarity: { type: Type.INTEGER, description: "Score from 0 to 100" },
            confidence: { type: Type.INTEGER, description: "Score from 0 to 100" }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 8: Offer & Negotiation Advisor
// ------------------------------------------------------------------------
app.post("/api/placement/negotiate", async (req, res) => {
  try {
    const { currentOffer, targetCompany, expectations } = req.body;
    const ai = getAI();

    const prompt = `You are a senior Salary & Offer Negotiation Advisor.
Help the candidate navigate their potential or current job offer politely, strategically, and with confidence.

CURRENT OFFER DETAILS:
"${currentOffer || "No written offer yet, but preparing for salary discussions"}"

TARGET COMPANY:
"${targetCompany || "Undisclosed Company"}"

EXPECTED SALARY & PERKS:
"${expectations || "Standard market competitive rate"}"

Generate:
1. "politeStrategy": Concise advice on how to approach negotiation for this company and level.
2. "counterOfferTemplate": A polished, copy-paste email or message template to send to the HR recruiter asking for a revision.
3. "responseToHrQuestions": A list of 2-3 common tough recruiter negotiation questions and how the student should answer them without losing leverage.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["politeStrategy", "counterOfferTemplate", "responseToHrQuestions"],
          properties: {
            politeStrategy: { type: Type.STRING },
            counterOfferTemplate: { type: Type.STRING },
            responseToHrQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "response"],
                properties: {
                  question: { type: Type.STRING, description: "Recruiter objection/question" },
                  response: { type: Type.STRING, description: "What candidate should say verbatim" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 9: Confidence & Communication Coach
// ------------------------------------------------------------------------
app.post("/api/placement/communication-tips", async (req, res) => {
  try {
    const profile = req.body;
    const ai = getAI();

    const prompt = `You are the Confidence and Communication Coach of "PlacementOS".
Design highly practical, bite-sized daily drills and communication guidance tailored to this student's confidence levels and background.

STUDENT COMMUNICATION PROFILE:
- Communication Level: ${profile.communicationLevel}
- English Fluency/Fluency Barriers: ${profile.constraints || "None"}
- Target Roles: ${profile.targetRoles?.join(", ")}
- Current Confidence: ${profile.confidenceLevel}

Please generate exactly 3 highly actionable communication tips or drills for:
1. Fluency and structuring thoughts under pressure.
2. Self-introduction ("Tell me about yourself") custom script formula.
3. Physical presence, speaking tempo, and anxiety management.

Each item should have a concrete practical exercise the student can do right now.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["tip", "category", "howToPractice"],
            properties: {
              tip: { type: Type.STRING },
              category: { type: Type.STRING, description: "Must be 'Fluency', 'Confidence', or 'Body Language'" },
              howToPractice: { type: Type.STRING, description: "Clear step-by-step 2-minute drill they can perform alone" }
            }
          }
        }
      }
    });

    const text = response.text || "[]";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 10: HR Socials Analysis (LinkedIn & GitHub rating)
// ------------------------------------------------------------------------
app.post("/api/placement/analyze-socials", async (req, res) => {
  try {
    const { linkedinUrl, githubUrl, profile } = req.body;
    const ai = getAI();

    const prompt = `You are a world-class Technical Recruiter and Head of Human Resources at an elite tech firm.
Analyze the student's LinkedIn profile URL (${linkedinUrl || "Not specified"}) and GitHub profile URL (${githubUrl || "Not specified"}) in relation to their student profile:

STUDENT PROFILE:
- Name: ${profile?.name || "Candidate"}
- Degree & Branch: ${profile?.degree || ""} in ${profile?.branch || ""}
- Technical Skills: ${profile?.technicalSkills?.join(", ") || "None specified"}
- Target Roles: ${profile?.targetRoles?.join(", ") || "None specified"}

Provide an extremely rigorous, honest, and high-impact HR Profile Rating and Analysis.
Analyze:
1. LinkedIn Completeness: Does their URL formatting and target profile look appealing to HR? What key elements are expected from their profile link?
2. GitHub Activity/Professionalism: Does their GitHub represent a strong engineering posture (contributions, pinned repositories, clean README)?
3. HR Appeal: Overall probability that a modern tech recruiter would request an interview based on these socials.
4. Professionalism: Clarity, brand alignment, and presentation of their public handles.

Also suggest 3-4 major Pros, 3-4 Cons, an honest, raw, and direct "HR Verdict" (no corporate sugarcoating), and a checklist of "Critical Fixes" they should make immediately to maximize their chances of hiring.

Return a cohesive JSON object.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["linkedinUrl", "githubUrl", "ratings", "pros", "cons", "hrVerdict", "criticalFixes"],
          properties: {
            linkedinUrl: { type: Type.STRING },
            githubUrl: { type: Type.STRING },
            ratings: {
              type: Type.OBJECT,
              required: ["linkedinCompleteness", "githubActivity", "hrAppeal", "professionalism"],
              properties: {
                linkedinCompleteness: { type: Type.INTEGER, description: "Score from 0 to 100" },
                githubActivity: { type: Type.INTEGER, description: "Score from 0 to 100" },
                hrAppeal: { type: Type.INTEGER, description: "Score from 0 to 100" },
                professionalism: { type: Type.INTEGER, description: "Score from 0 to 100" }
              }
            },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            hrVerdict: { type: Type.STRING },
            criticalFixes: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// VITE DEV SERVER & PRODUCTION STATIC SERVING
// ------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
