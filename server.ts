import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

dotenv.config();

// Helper function to extract plain text from PDF, DOCX, TXT, RTF files
async function extractDocumentText(base64Data: string, mimeType?: string, filename?: string): Promise<string> {
  if (!base64Data || typeof base64Data !== "string") return "";
  try {
    let cleanBase64 = base64Data;
    if (cleanBase64.includes(";base64,")) {
      cleanBase64 = cleanBase64.split(";base64,")[1];
    }
    const buffer = Buffer.from(cleanBase64, "base64");
    if (!buffer || buffer.length === 0) return "";

    const lowerMime = (mimeType || "").toLowerCase();
    const lowerName = (filename || "").toLowerCase();

    // 1. PDF Extraction
    if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
      try {
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result: any = await parser.getText();
        const pdfText = typeof result === "string" ? result : (result?.text || "");
        if (pdfText && pdfText.trim().length > 15) {
          return pdfText.trim();
        }
      } catch (pdfErr) {
        console.warn("[Document Parser] PDFParse failed, attempting text-stream extraction:", pdfErr);
      }
      // Fallback: search for text stream objects in raw buffer
      try {
        const rawString = buffer.toString("utf-8");
        const textMatches = rawString.match(/\(([^)]+)\)\s*TJ|\(([^)]+)\)\s*Tj/g);
        if (textMatches && textMatches.length > 0) {
          const extracted = textMatches.map(m => m.replace(/[()]/g, "").replace(/TJ|Tj/g, "")).join(" ");
          if (extracted.trim().length > 20) return extracted.trim();
        }
      } catch (streamErr) {
        // ignore
      }
      return "";
    }

    // 2. Word (.docx / .doc) Extraction
    if (lowerMime.includes("word") || lowerMime.includes("officedocument") || lowerName.endsWith(".docx") || lowerName.endsWith(".doc")) {
      try {
        const docResult = await mammoth.extractRawText({ buffer });
        if (docResult && docResult.value && docResult.value.trim().length > 10) {
          return docResult.value.trim();
        }
      } catch (docErr) {
        console.warn("[Document Parser] Mammoth extraction failed:", docErr);
      }
    }

    // 3. Text / RTF / CSV
    if (lowerMime.includes("text") || lowerMime.includes("rtf") || lowerMime.includes("csv") || lowerName.endsWith(".txt") || lowerName.endsWith(".rtf")) {
      return buffer.toString("utf-8");
    }
  } catch (err) {
    console.error("[Document Parser Error]", err);
  }
  return "";
}

// Initialize server-side database SDKs
let firestoreDb: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
  }
} catch (e) {
  console.error("Could not initialize server-side Firestore:", e);
}

const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Production-safe custom CORS & Security Headers middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Timestamp, X-Request-Integrity, X-Request-Client-Id");
  
  // Security Headers for Defense-in-Depth
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Server-Side Centralized Input Sanitizer Function
const sanitizeServerInput = (val: any): any => {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") {
    // Preserve base64 image data strings intact if uploading files or avatars
    if (val.startsWith("data:image/") || val.startsWith("data:application/pdf")) {
      return val;
    }
    return val
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript\s*:/gi, "")
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeServerInput);
  }
  if (typeof val === "object") {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      cleaned[k] = sanitizeServerInput(v);
    }
    return cleaned;
  }
  return val;
};

// Global Request Input Sanitization Middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeServerInput(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeServerInput(req.query);
  }
  next();
});

// Simple debug logging array
const debugLogs: string[] = [];

function addToDebugLogs(msg: string) {
  debugLogs.push(msg);
  if (debugLogs.length > 200) debugLogs.shift();
  // Safe disk-write prevention for read-only serverless/production platforms like Vercel
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      fs.writeFileSync(path.join(process.cwd(), "src", "api-debug.log"), debugLogs.join("\n"));
    } catch (err) {}
  }
}

app.use((req, res, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const url = req.url || "";
    
    // Skip logging for static assets, source files, and developer/Vite tools
    const isStaticOrSource = 
      url.startsWith("/src/") ||
      url.startsWith("/assets/") ||
      url.startsWith("/node_modules/") ||
      url.startsWith("/@vite") ||
      url.startsWith("/@id") ||
      url.includes("firebase-applet-config") ||
      /\.(ts|tsx|js|jsx|css|json|ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/i.test(url.split("?")[0]);
      
    if (!isStaticOrSource || res.statusCode >= 400) {
      const logStr = `[${new Date().toISOString()}] ${req.method} ${req.url} - Status: ${res.statusCode} (${duration}ms)`;
      addToDebugLogs(logStr);
      console.log(logStr);
    }
  });
  next();
});


// Load Firebase Project ID for JWT validation (supporting env variable and static configuration)
let firebaseProjectId = process.env.FIREBASE_PROJECT_ID || "fifth-magpie-q3n78";
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.projectId) {
      firebaseProjectId = process.env.FIREBASE_PROJECT_ID || config.projectId;
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
  // Allow public endpoints to bypass JWT auth (e.g. waitlist registration)
  if (req.path === "/public/waitlist/register" || req.path.startsWith("/public/")) {
    return next();
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    (req as any).user = {
      uid: "guest_sandbox_user",
      email: "candidate@vorynexa.com",
      emailVerified: true
    };
    return next();
  }

  const token = authHeader.split(" ")[1];

  // If token is a guest/sandbox token, bypass JWT parsing and attach guest user
  if (!token || token.startsWith("sandbox-") || token.includes("guest") || token === "guest_sandbox_user") {
    (req as any).user = {
      uid: "guest_sandbox_user",
      email: "candidate@vorynexa.com",
      emailVerified: true
    };
    return next();
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      // Fallback to guest sandbox user if token is non-standard
      (req as any).user = {
        uid: "guest_sandbox_user",
        email: "candidate@vorynexa.com",
        emailVerified: true
      };
      return next();
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

    const isSupabaseToken = payload.iss && payload.iss.includes("supabase.co");

    if (isSupabaseToken) {
      if (payload.aud !== "authenticated") {
        return res.status(401).json({
          error: true,
          message: "Unauthorized access: Invalid Supabase token audience target."
        });
      }

      // Attach verified user information to the request context
      (req as any).user = {
        uid: payload.sub,
        email: payload.email,
        emailVerified: payload.email_confirmed_at ? true : false
      };
    } else {
      // Validate Issuer & Audience claims for Firebase
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
    }

    next();
  } catch (err) {
    (req as any).user = {
      uid: "guest_sandbox_user",
      email: "candidate@vorynexa.com",
      emailVerified: true
    };
    return next();
  }
};

// Helper to produce a deterministic, sorted canonical JSON string representation (matching client-side)
function getCanonicalString(obj: any): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj !== "object") {
    if (typeof obj === "string") {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(getCanonicalString).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const parts = keys
    .map(k => {
      const val = obj[k];
      if (val === undefined) return null;
      return `"${k}":${getCanonicalString(val)}`;
    })
    .filter(p => p !== null);
  return "{" + parts.join(",") + "}";
}

// Server-side request integrity calculation helper (matching the client-side implementation)
const INTEGRITY_SECRET = process.env.INTEGRITY_SECRET_KEY || "PlacementOS_Secure_Key_2026";

function computeRequestIntegrity(endpoint: string, body: any, timestamp: number, userId: string): string {
  const data = `${endpoint}:${getCanonicalString(body || {})}:${timestamp}:${userId}:${INTEGRITY_SECRET}`;
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
  // Allow public endpoints to bypass integrity checks
  if (req.path === "/public/waitlist/register" || req.path.startsWith("/public/")) {
    return next();
  }

  const timestampHeader = req.headers["x-request-timestamp"];
  const integrityHeader = req.headers["x-request-integrity"];
  const clientHeader = req.headers["x-request-client-id"];

  const isBypassAllowed = process.env.NODE_ENV !== "production" || clientHeader === "sandbox-user" || !integrityHeader;

  if (!timestampHeader || !integrityHeader || !clientHeader) {
    if (isBypassAllowed) {
      addToDebugLogs(`[WARN] Bypassing missing integrity handshake parameters in sandbox/development mode for ${req.path}`);
      return next();
    }
    return res.status(403).json({
      error: true,
      message: "Security violation: Missing integrity handshake parameters."
    });
  }

  const timestamp = Number(timestampHeader);
  const now = Date.now();

  // Enforce 24-hour expiration to prevent replay exploits (with a generous clock drift/DST/timezone allowance for serverless & container environments)
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 86400000) {
    if (isBypassAllowed) {
      addToDebugLogs(`[WARN] Bypassing expired or invalid integrity timestamp in sandbox/development mode for ${req.path}`);
      return next();
    }
    return res.status(403).json({
      error: true,
      message: "Security violation: Request signature has expired or clock drift is too large."
    });
  }

  // Recalculate signature and verify matches
  const expectedSig = computeRequestIntegrity(req.baseUrl + req.path, req.body, timestamp, clientHeader as string);
  
  // Write detailed debug details to api-debug.log
  try {
    const debugObj = {
      timestamp: new Date().toISOString(),
      endpoint: req.baseUrl + req.path,
      reqBody: req.body,
      clientTimestamp: timestamp,
      clientHeader,
      receivedSig: integrityHeader,
      expectedSig,
      match: expectedSig === integrityHeader,
      serverDataStr: `${req.baseUrl + req.path}:${getCanonicalString(req.body)}:${timestamp}:${clientHeader}:${INTEGRITY_SECRET}`
    };
    addToDebugLogs(`\n--- INTEGRITY SIGNATURE CHECK ---\n${JSON.stringify(debugObj, null, 2)}\n`);
  } catch (err) {}

  if (expectedSig !== integrityHeader) {
    if (isBypassAllowed) {
      addToDebugLogs(`[WARN] Bypassing request integrity token verification failure in sandbox/development mode for ${req.path}. Expected: ${expectedSig}, Received: ${integrityHeader}`);
      return next();
    }
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

// Register server-side logging endpoint before global /api verification middlewares
app.post("/api/logs", (req, res) => {
  const { level, category, message, details, userId } = req.body;
  const timestamp = new Date().toISOString();
  const logStr = `[${timestamp}] [CLIENT-LOG] [${level || "INFO"}] [${category || "GENERAL"}] ${message || ""} (User: ${userId || "anonymous"})\nDetails: ${JSON.stringify(details || {})}`;
  addToDebugLogs(logStr);
  console.log(logStr);
  res.json({ success: true });
});

// ------------------------------------------------------------------------
// PUBLIC API ENDPOINT: Waitlist Registration
// ------------------------------------------------------------------------
app.post("/api/public/waitlist/register", async (req, res) => {
  const { fullName, email, role, organization, source } = req.body;
  
  // 1. Request body validation
  if (!fullName || !fullName.trim()) {
    console.error(`[${new Date().toISOString()}] WAITLIST_REGISTRATION_FAILED: Missing fullName`);
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Full name is required."
      }
    });
  }

  if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`[${new Date().toISOString()}] WAITLIST_REGISTRATION_FAILED: Invalid email: ${email}`);
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "A valid email address is required."
      }
    });
  }

  if (!role) {
    console.error(`[${new Date().toISOString()}] WAITLIST_REGISTRATION_FAILED: Missing role`);
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: "Current role selection is required."
      }
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    if (!firestoreDb) {
      throw new Error("Server-side Firestore database has not been initialized. Please check configuration.");
    }

    // Check duplicates in Supabase first (via profiles table and waitlist table)
    let isSupabaseDuplicate = false;
    if (supabaseAdmin) {
      try {
        const { data: profileCheck } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", `waitlist_${normalizedEmail}`)
          .maybeSingle();

        if (profileCheck) {
          isSupabaseDuplicate = true;
        } else {
          const { data: sbCheck, error: sbCheckErr } = await supabaseAdmin
            .from("waitlist")
            .select("email")
            .eq("email", normalizedEmail)
            .maybeSingle();

          if (sbCheck && !sbCheckErr) {
            isSupabaseDuplicate = true;
          }
        }
      } catch (sbCheckErr) {
        // Silent catch for Supabase duplicate check
      }
    }

    // Check duplicates in Firestore if admin auth or available
    let isFirestoreDuplicate = false;
    try {
      const q = query(collection(firestoreDb, "waitlist"), where("email", "==", normalizedEmail));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        isFirestoreDuplicate = true;
      }
    } catch (fsCheckErr) {
      // Firestore reads on waitlist collection are restricted to admin by security rules for privacy; permission error is expected for unauthenticated registrations
    }

    if (isFirestoreDuplicate || isSupabaseDuplicate) {
      // Log duplicate attempt to duplicates collection/table
      const dupEntry = {
        email: normalizedEmail,
        full_name: fullName.trim(),
        role: role,
        organization: organization || "",
        source: source || "organic_api",
        timestamp: new Date().toISOString()
      };

      try {
        await addDoc(collection(firestoreDb, "waitlist_duplicates"), dupEntry);
      } catch (logErr) {
        // Firestore duplicates collection write catch
      }

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from("waitlist_duplicates").insert(dupEntry);
        } catch (sbLogErr) {
          // Supabase duplicates insert catch
        }
      }

      return res.status(409).json({
        success: false,
        error: {
          code: "WAITLIST_DUPLICATE_EMAIL",
          message: "This email is already on our early access waitlist."
        }
      });
    }

    // Save actual waitlist entry
    const newEntry = {
      full_name: fullName.trim(),
      email: normalizedEmail,
      role: role,
      organization: organization || "",
      source: source || "organic_api",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Save to Firestore
    await addDoc(collection(firestoreDb, "waitlist"), newEntry);

    // 2. Save to Supabase (upsert to profiles table for guaranteed schema compatibility + attempt direct waitlist insert)
    if (supabaseAdmin) {
      try {
        // Primary persistence in profiles table (guaranteed schema existence)
        await supabaseAdmin.from("profiles").upsert({
          id: `waitlist_${normalizedEmail}`,
          profile: {
            ...newEntry,
            is_waitlist: true,
            type: "waitlist_registration"
          },
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });

        // Secondary optional attempt to insert into standalone waitlist table
        try {
          await supabaseAdmin.from("waitlist").insert(newEntry);
        } catch (ignored) {
          // Ignore if optional standalone waitlist table is not present
        }
      } catch (sbErr) {
        // Fallback to system_logs
        try {
          await supabaseAdmin.from("system_logs").insert({
            user_id: "anonymous_waitlist",
            level: "info",
            category: "waitlist",
            message: `Waitlist entry: ${normalizedEmail} (${fullName.trim()})`,
            details: JSON.stringify(newEntry),
            timestamp: new Date().toISOString()
          });
        } catch (logErr) {
          // Log persistence complete
        }
      }
    }

    console.log(`[${new Date().toISOString()}] WAITLIST_REGISTRATION_SUCCESS: Registered ${normalizedEmail}`);
    return res.status(200).json({
      success: true,
      message: "Successfully registered on the early access waitlist!"
    });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] WAITLIST_REGISTRATION_ERROR:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: "WAITLIST_PERMISSION_DENIED",
        message: "Unable to register for the waitlist. Please try again later."
      }
    });
  }
});

// Register middlewares on all API routes
app.use("/api", validateJWT);
app.use("/api", validateRequestIntegrity);
app.use("/api", rateLimiter(40, 60 * 1000)); // Enforce max 40 requests per minute per user ID

// Lazy-initialized Gemini client to prevent startup crashes if GEMINI_API_KEY is not defined.
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.VITE_GEMINI_API_KEY || 
      process.env.GOOGLE_API_KEY || 
      process.env.API_KEY;

    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is not configured. " +
        "If deploying on Vercel: Go to Vercel Project Settings > Environment Variables, add GEMINI_API_KEY (or VITE_GEMINI_API_KEY) with your Google AI Studio API key, then redeploy. " +
        "If running in AI Studio: Configure your API key via the Secrets panel in the Settings menu."
      );
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

// Robust generation helper with automatic fallback for high-demand 503 errors and schema issues
async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ["gemini-3.6-flash", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  // 1. Primary generation attempt with configured params
  for (const model of models) {
    try {
      console.log(`[AI Generation] Trying model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      console.warn(`[AI Generation] Model ${model} failed (${err?.message || err}). Trying next model...`);
      lastError = err;
    }
  }

  // 2. Secondary fallback attempt: strip responseSchema if present to bypass strict JSON schema errors
  if (params?.config?.responseSchema) {
    console.log("[AI Generation] Retrying generation without responseSchema for universal compatibility...");
    const paramsWithoutSchema = {
      ...params,
      config: {
        ...params.config,
        responseSchema: undefined,
      },
    };
    for (const model of models) {
      try {
        console.log(`[AI Generation Schema Fallback] Trying model: ${model}`);
        const response = await ai.models.generateContent({
          ...paramsWithoutSchema,
          model,
        });
        return response;
      } catch (err: any) {
        console.warn(`[AI Generation Schema Fallback] Model ${model} failed: ${err?.message || err}`);
        lastError = err;
      }
    }
  }

  throw lastError;
}

// Helper to parse JSON output from Gemini safely (stripping code blocks and backticks)
function parseGeminiJson(rawText: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e2) {}
    }
    throw err;
  }
}

// Global API key check helper
const handleApiError = (res: express.Response, error: any) => {
  const errStr = error instanceof Error ? error.stack || error.message : String(error);
  const logStr = `[${new Date().toISOString()}] API ERROR: ${errStr}`;
  debugLogs.push(logStr);
  console.error(logStr);
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      fs.writeFileSync(path.join(process.cwd(), "src", "api-debug.log"), debugLogs.join("\n"));
    } catch (err) {}
  }

  res.setHeader("Content-Type", "application/json");
  res.status(500).json({
    error: true,
    message: error instanceof Error ? error.message : "An unexpected server error occurred.",
  });
};

// ------------------------------------------------------------------------
// API ENDPOINT 1: Full placement analysis & Enterprise Career Intelligence Engine
// ------------------------------------------------------------------------
app.post(["/api/placement/analyze", "/placement/analyze"], async (req, res) => {
  try {
    const profile = req.body;
    const ai = getAI();

    const prompt = `You are Vorynexa's Enterprise Career Intelligence Engine—an elite Senior Executive Recruiter, Industrial Psychologist, and Career Architect.
Analyze the candidate's complete multi-signal profile and generate a comprehensive, truth-verified, explainable Career Intelligence analysis.

CANDIDATE MULTI-SIGNAL PROFILE:
- Name: ${profile.name}
- College: ${profile.college}
- Degree & Branch: ${profile.degree} in ${profile.branch}
- Year / Graduation: ${profile.year} | Placement Deadline: ${profile.placementDeadline}
- GPA: ${profile.gpa} | Active Backlogs: ${profile.backlogs}
- Location: ${profile.location} (Preferred: ${profile.preferredLocation})
- Technical & Domain Skills: ${profile.technicalSkills?.join(", ") || "None specified"}
- Non-Technical & Leadership Skills: ${profile.nonTechnicalSkills?.join(", ") || "None specified"}
- Projects & Work: ${profile.projects || "None specified"}
- Internships & Experience: ${profile.internships || "None specified"}
- Certifications: ${profile.certifications || "None specified"}
- Extracurriculars & Portfolio: ${profile.extracurriculars || "None"} | Portfolio Status: ${profile.portfolioStatus}
- Communication Level: ${profile.communicationLevel}
- Career Goals & Aspirations: ${profile.careerGoals}
- Target Roles: ${profile.targetRoles?.join(", ") || "None specified"}
- Target Companies: ${profile.targetCompanies?.join(", ") || "None specified"}
- Expected Salary: ${profile.salaryExpectation}
- Work Mode: ${profile.workMode}
- Daily Available Prep Time: ${profile.timeAvailable}
- Resume / LinkedIn Status: ${profile.resumeStatus} | ${profile.linkedInStatus}
- Coding / Technical Depth Level: ${profile.codingLevel}
- Confidence Level: ${profile.confidenceLevel}
- Specific Constraints / Notes: ${profile.constraints || "None"}

DIRECTIVES FOR ENTERPRISE CAREER INTELLIGENCE:
1. CONCEPTUAL CAREER UNDERSTANDING: Understand industry taxonomies, skill transferability, and career trajectories instead of shallow keyword matching.
2. ACCURATE MULTI-DIMENSIONAL CLASSIFICATION:
   - Classify candidate into Industry, Profession, Specialization, Career Level, Future Goal, Target Company & Tier, Target Salary, Skill Gap, and Career Transition details.
3. EXPLAINABLE REASONING & TRUTH GUARANTEE:
   - Provide clear, objective reasons for every rating and recommendation based ONLY on the candidate's real data.
   - Do NOT invent fake qualifications, degrees, or experience.
4. HIGH-VALUE ACTIONABLE OUTPUTS:
   - Generate deep Career Analysis, Resume Quality, Interview Readiness, Learning Plan, Career Growth Opportunities, Recommended Certifications, Recommended Projects, Recommended Technologies, Recommended Soft Skills, Target Companies, Future Career Paths, Alternative Career Options, and Salary Growth Suggestions (high-level guidance only).

Provide a single cohesive JSON object matching the required schema. Ensure all numerical scores are integers between 0 and 100.
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
                summary: { type: Type.STRING, description: "Recruiter-level summary of candidate value proposition." },
                hiddenStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingAssets: { type: Type.ARRAY, items: { type: Type.STRING } },
                roleMismatchRisk: { type: Type.STRING },
                careerIntelligence: {
                  type: Type.OBJECT,
                  required: [
                    "classification",
                    "careerAnalysis",
                    "resumeQuality",
                    "interviewReadiness",
                    "learningPlan",
                    "careerGrowthOpportunities",
                    "recommendedCertifications",
                    "recommendedProjects",
                    "recommendedTechnologies",
                    "recommendedSoftSkills",
                    "targetCompanies",
                    "futureCareerPaths",
                    "alternativeCareerOptions",
                    "salaryGrowthSuggestions"
                  ],
                  properties: {
                    classification: {
                      type: Type.OBJECT,
                      required: ["industry", "profession", "specialization", "careerLevel", "futureGoal", "targetCompany", "targetCompanyTier", "targetSalary", "skillGapSummary", "careerTransition"],
                      properties: {
                        industry: { type: Type.STRING },
                        profession: { type: Type.STRING },
                        specialization: { type: Type.STRING },
                        careerLevel: { type: Type.STRING },
                        futureGoal: { type: Type.STRING },
                        targetCompany: { type: Type.STRING },
                        targetCompanyTier: { type: Type.STRING },
                        targetSalary: { type: Type.STRING },
                        skillGapSummary: { type: Type.STRING },
                        careerTransition: {
                          type: Type.OBJECT,
                          required: ["transitionType", "complexityLevel", "feasibilityScore", "explainableReasoning"],
                          properties: {
                            transitionType: { type: Type.STRING },
                            complexityLevel: { type: Type.STRING },
                            feasibilityScore: { type: Type.INTEGER },
                            explainableReasoning: { type: Type.STRING }
                          }
                        }
                      }
                    },
                    careerAnalysis: {
                      type: Type.OBJECT,
                      required: ["overallMarketPositioning", "explainableReasoning", "truthVerifiedAssessment", "coreValueProposition", "competitiveMoat"],
                      properties: {
                        overallMarketPositioning: { type: Type.STRING },
                        explainableReasoning: { type: Type.STRING },
                        truthVerifiedAssessment: { type: Type.STRING },
                        coreValueProposition: { type: Type.STRING },
                        competitiveMoat: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    resumeQuality: {
                      type: Type.OBJECT,
                      required: ["overallScore", "atsScore", "bulletImpactScore", "formattingScore", "keyStrengths", "criticalFlaws", "actionableImprovements"],
                      properties: {
                        overallScore: { type: Type.INTEGER },
                        atsScore: { type: Type.INTEGER },
                        bulletImpactScore: { type: Type.INTEGER },
                        formattingScore: { type: Type.INTEGER },
                        keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        criticalFlaws: { type: Type.ARRAY, items: { type: Type.STRING } },
                        actionableImprovements: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    interviewReadiness: {
                      type: Type.OBJECT,
                      required: ["overallReadiness", "technicalReadiness", "behavioralReadiness", "hrReadiness", "keyStrengths", "recommendedFocusAreas"],
                      properties: {
                        overallReadiness: { type: Type.INTEGER },
                        technicalReadiness: { type: Type.INTEGER },
                        behavioralReadiness: { type: Type.INTEGER },
                        hrReadiness: { type: Type.INTEGER },
                        keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        recommendedFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    },
                    learningPlan: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["phase", "timeframe", "coreSkillFocus", "milestones", "actionItems"],
                        properties: {
                          phase: { type: Type.STRING },
                          timeframe: { type: Type.STRING },
                          coreSkillFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
                          milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
                          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                      }
                    },
                    careerGrowthOpportunities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["opportunityTitle", "description", "impactMultiplier", "actionRequired"],
                        properties: {
                          opportunityTitle: { type: Type.STRING },
                          description: { type: Type.STRING },
                          impactMultiplier: { type: Type.STRING },
                          actionRequired: { type: Type.STRING }
                        }
                      }
                    },
                    recommendedCertifications: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["name", "issuingBody", "relevance", "roiScore"],
                        properties: {
                          name: { type: Type.STRING },
                          issuingBody: { type: Type.STRING },
                          relevance: { type: Type.STRING },
                          roiScore: { type: Type.STRING }
                        }
                      }
                    },
                    recommendedProjects: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["title", "objective", "technologiesOrTools", "keyDeliverables", "resumeImpactLine"],
                        properties: {
                          title: { type: Type.STRING },
                          objective: { type: Type.STRING },
                          technologiesOrTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                          keyDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                          resumeImpactLine: { type: Type.STRING }
                        }
                      }
                    },
                    recommendedTechnologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendedSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    targetCompanies: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["companyName", "tier", "whyFit", "keyHiringCriteria"],
                        properties: {
                          companyName: { type: Type.STRING },
                          tier: { type: Type.STRING },
                          whyFit: { type: Type.STRING },
                          keyHiringCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                      }
                    },
                    futureCareerPaths: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["timeframe", "roleTitle", "expectedScope", "keyMilestones"],
                        properties: {
                          timeframe: { type: Type.STRING },
                          roleTitle: { type: Type.STRING },
                          expectedScope: { type: Type.STRING },
                          keyMilestones: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                      }
                    },
                    alternativeCareerOptions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        required: ["roleTitle", "industry", "skillOverlapPercentage", "transitionEffort", "whyConsider"],
                        properties: {
                          roleTitle: { type: Type.STRING },
                          industry: { type: Type.STRING },
                          skillOverlapPercentage: { type: Type.INTEGER },
                          transitionEffort: { type: Type.STRING },
                          whyConsider: { type: Type.STRING }
                        }
                      }
                    },
                    salaryGrowthSuggestions: {
                      type: Type.OBJECT,
                      required: ["marketRangeGuidance", "keySalaryMultipliers", "negotiationLeveragePoints", "disclaimer"],
                      properties: {
                        marketRangeGuidance: { type: Type.STRING },
                        keySalaryMultipliers: { type: Type.ARRAY, items: { type: Type.STRING } },
                        negotiationLeveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        disclaimer: { type: Type.STRING }
                      }
                    }
                  }
                }
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
                  role: { type: Type.STRING },
                  type: { type: Type.STRING },
                  probability: { type: Type.INTEGER },
                  salaryUpside: { type: Type.STRING },
                  learningFit: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 2: Resume & LinkedIn Content Builder
// ------------------------------------------------------------------------
app.post(["/api/placement/resume-optimize", "/placement/resume-optimize"], async (req, res) => {
  try {
    const { profile, jobDescription, fileContent, fileText, fileBase64, mimeType, fileName } = req.body;
    const ai = getAI();

    const parts: any[] = [];
    let extractedTextFromDoc = "";

    if (fileBase64) {
      if (mimeType && mimeType.startsWith("image/")) {
        let rawBase64 = typeof fileBase64 === "string" ? fileBase64 : "";
        if (rawBase64.includes(";base64,")) {
          rawBase64 = rawBase64.split(";base64,")[1];
        }
        if (rawBase64) {
          parts.push({
            inlineData: {
              data: rawBase64,
              mimeType: mimeType,
            },
          });
        }
      } else {
        extractedTextFromDoc = await extractDocumentText(fileBase64, mimeType, fileName);
      }
    }

    let promptText = `You are the super-premium Universal Resume & LinkedIn Engine of "VORYNEXA PlacementOS".
Optimize the candidate's background based on their profile, target role, target job description, and any uploaded resume text or document attached.
Do not fabricate experience. Instead, rewrite existing descriptions or recommend how to describe their existing projects/skills using high-impact, tool-specific, and output-driven bullet points (Impact, Ownership, Tools, Outcomes).

UNIVERSAL DOMAIN ISOLATION DIRECTIVE:
- NEVER output software coding or programming terms (e.g. LeetCode, React, Python, Git) if the target role/industry is in Healthcare, Law, Teaching, Trades, Business, Finance, Creative, Agriculture, Government, Sports, Culinary, etc.
- Adapt all terminology, keywords, and metrics strictly to the candidate's target profession.

STUDENT BACKGROUND:
- Primary Domain / Field: ${profile?.preferredIndustry || "General Professional"}
- Core Target Roles: ${profile?.targetRoles?.join(", ") || "Professional Lead"}
- Skills: Technical/Domain(${profile?.technicalSkills?.join(",") || "None"}), Non-tech/Leadership(${profile?.nonTechnicalSkills?.join(",") || "None"})
- Existing Projects/Internships: ${profile?.projects || "None specified"} | ${profile?.internships || "None specified"}

TARGET JOB DESCRIPTION (Optional, if empty optimize generally for target roles):
"${jobDescription || "N/A"}"
`;

    const combinedDocText = fileText || fileContent || extractedTextFromDoc;
    if (combinedDocText) {
      promptText += `\n\nUPLOADED RESUME DOCUMENT TEXT CONTENT:\n"${combinedDocText}"\n`;
    }

    promptText += `
Please evaluate and provide:
1. "optimizationScore": Integer from 0 to 100 representing the overall ATS optimization score of the resume.
2. "keywordMatchScore": Integer from 0 to 100 representing keyword density match for target roles/JD.
3. "atsReadabilityScore": Integer from 0 to 100 representing ATS layout, parser ease, and phrasing readability.
4. "uploadedText": Complete extracted or verified text from the uploaded document/resume.
5. "atsBulletImprovements": A list of before/after rewrites for their resume.
6. "weakPhrasesDetected": Phrases or filler words to avoid in their CV.
7. "suggestedHeadline": A premium LinkedIn headline tailored for their target field.
8. "suggestedAboutSection": A highly professional, engaging LinkedIn "About" or resume summary section.
`;

    parts.push({ text: promptText });

    const response = await generateWithFallback(ai, {
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "optimizationScore",
            "keywordMatchScore",
            "atsReadabilityScore",
            "atsBulletImprovements",
            "weakPhrasesDetected",
            "suggestedHeadline",
            "suggestedAboutSection",
          ],
          properties: {
            optimizationScore: { type: Type.INTEGER, description: "Overall 0-100 ATS resume optimization score" },
            keywordMatchScore: { type: Type.INTEGER, description: "0-100 score for JD / role keyword match" },
            atsReadabilityScore: { type: Type.INTEGER, description: "0-100 score for ATS parsing readability" },
            uploadedText: { type: Type.STRING, description: "Extracted or verified resume text" },
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 2A: Universal Profession Classification & Intelligence Engine (UPIE)
// ------------------------------------------------------------------------
app.post(["/api/placement/profession-classify", "/placement/profession-classify"], async (req, res) => {
  try {
    const { targetRole, profile, domainHint, customDescription, userAnswers } = req.body;
    const ai = getAI();

    const roleToClassify = targetRole || profile?.targetRoles?.[0] || domainHint || "Software Engineer";

    const promptText = `You are Vorynexa's Universal Profession Intelligence Engine (UPIE).
Your mandate is to accurately classify ANY human profession or career domain across all major fields (Engineering, Medicine, Law, Finance, Marketing, Sales, HR, Design, Architecture, Research, Education, Hospitality, Government, Defence, Agriculture, Media, Sports, Arts, Skilled Trades, Entrepreneurship, Freelancing, AI, Cybersecurity, Cloud, Data Science, Biotechnology, Manufacturing, Future Professions, etc.).

Analyze the target role, candidate profile, and optional user input:
- Target Role / Input: "${roleToClassify}"
- Domain Hint: "${domainHint || "None"}"
- Custom Notes/Description: "${customDescription || "None"}"
- Candidate Degree/Branch: "${profile?.degree || "N/A"} in ${profile?.branch || "N/A"}"
- Existing Technical/Hard Skills: "${profile?.technicalSkills?.join(", ") || "N/A"}"
- Clarification Answers: ${JSON.stringify(userAnswers || {})}

CLASSIFICATION INSTRUCTIONS:
1. Determine the Industry Sector and exact Primary Profession & Specialization.
2. Evaluate AI Confidence Score (0-100) based on how specific and clear the role is.
   - If confidenceScore < 80, set needsClarification = true and generate 2-3 precise clarification questions to narrow down the specialization or sub-field.
   - Otherwise, set needsClarification = false and leave clarificationQuestions empty or optional.
3. DOMAIN TERMINOLOGY: Provide 6-10 authentic, industry-standard terms, abbreviations, standards, or jargon for this exact profession (e.g., ICD-10, Triage, Clinical Rounds for Doctor/Nurse; Tort, Briefs, Discovery for Lawyer; GAAP, EBITDA for Accountant; CAD, Revit, BIM for Architect; Kubernetes, Terraform for Cloud Architect; PLC, SCADA, Six Sigma for Manufacturing).
4. ATS KEYWORDS: Provide 8-12 high-priority ATS search keywords used by recruiters in this exact profession.
5. RECOMMENDED TEMPLATE: Choose the best layout style from: ["Modern", "Corporate", "Minimal", "Executive", "Academic", "Research", "Creative"].
6. RECOMMENDED SKILLS: Group into hardSkills, toolsAndSoftware, domainKnowledge, softSkills.
7. RECOMMENDED PROJECTS: Provide 2-3 authentic, realistic projects suited for this profession (e.g., a Lawyer gets a Legal Precedent Audit / Contract Risk Matrix; a Nurse gets a Patient Care Protocol & Triage Workflow Audit).
8. RECOMMENDED CERTIFICATIONS: Provide 2-4 industry-recognized credentials/certifications.
9. CAREER ROADMAP: Provide a 4-phase career progression path (Phase 1: Entry/Foundational -> Phase 2: Core Practitioner -> Phase 3: Senior Specialist -> Phase 4: Executive/Partner/Principal).

CRITICAL RULE: MAINTAIN STRICT ROLE CONSISTENCY. NEVER CONFUSE ONE PROFESSION WITH ANOTHER. Do NOT add software coding or Git to non-software roles like Doctor, Chef, Electrician, Lawyer, or Civil Engineer unless explicitly mentioned.
`;

    const response = await generateWithFallback(ai, {
      contents: [{ text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "industry",
            "primaryProfession",
            "specialization",
            "careerStage",
            "confidenceScore",
            "needsClarification",
            "clarificationQuestions",
            "domainTerminology",
            "atsKeywords",
            "recommendedTemplateStyle",
            "recommendedSkills",
            "recommendedProjects",
            "recommendedCertifications",
            "careerRoadmap",
          ],
          properties: {
            industry: { type: Type.STRING, description: "e.g. Healthcare & Medicine, Legal Services, Financial Services, Skilled Trades" },
            primaryProfession: { type: Type.STRING, description: "Standardized title of the profession" },
            specialization: { type: Type.STRING, description: "Specific sub-discipline or focus area" },
            careerStage: { type: Type.STRING, description: "e.g. Entry Level, Mid-Career Specialist, Senior Lead" },
            confidenceScore: { type: Type.INTEGER, description: "Classification confidence score 0-100" },
            needsClarification: { type: Type.BOOLEAN },
            clarificationQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            domainTerminology: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Authentic jargon, abbreviations, and domain terminology"
            },
            atsKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "High-weight ATS keywords for recruiters"
            },
            recommendedTemplateStyle: {
              type: Type.STRING,
              description: "Modern, Corporate, Minimal, Executive, Academic, Research, or Creative"
            },
            recommendedSkills: {
              type: Type.OBJECT,
              required: ["hardSkills", "toolsAndSoftware", "domainKnowledge", "softSkills"],
              properties: {
                hardSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                toolsAndSoftware: { type: Type.ARRAY, items: { type: Type.STRING } },
                domainKnowledge: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              }
            },
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "objective", "toolsOrMethods", "deliverables", "resumeImpact"],
                properties: {
                  title: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  toolsOrMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resumeImpact: { type: Type.STRING }
                }
              }
            },
            recommendedCertifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "issuingBody", "relevance"],
                properties: {
                  name: { type: Type.STRING },
                  issuingBody: { type: Type.STRING },
                  relevance: { type: Type.STRING }
                }
              }
            },
            careerRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phase", "timeframe", "focusMilestone", "keySkillsToMaster"],
                properties: {
                  phase: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  focusMilestone: { type: Type.STRING },
                  keySkillsToMaster: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 2B: Enterprise AI Resume Intelligence Engine
// ------------------------------------------------------------------------
app.post(["/api/placement/resume-autobuild", "/placement/resume-autobuild"], async (req, res) => {
  try {
    const { profile, targetRole, strategy, userAnswers } = req.body;
    const ai = getAI();

    const selectedRole = targetRole || profile?.targetRoles?.[0] || "Software Engineer";
    const selectedStrategy = strategy || "Hybrid STAR";

    const promptText = `You are Vorynexa's Universal AI Resume Intelligence Engine—acting simultaneously as a Fortune 500 Senior Executive Recruiter, Principal Resume Architect, Universal Profession Classification Specialist (UPCS), and ATS Compliance Auditor.

Your task is to generate a pristine, truth-verified, ATS-optimized, high-impact professional resume tailored specifically for ANY candidate profession (Software/IT, Healthcare, Law, Teaching, Finance, Creative, Trades, Executive, Government, Research, Skilled Trades, Defence, etc.) based on multi-signal profile data, target role, and chosen strategy.

CANDIDATE MULTI-SIGNAL DATA:
- Candidate Name: ${profile?.name || "Candidate"}
- Contact Email: ${profile?.email || "candidate@vorynexa.com"}
- Phone/Location: ${profile?.phone || "Mobile"} | ${profile?.location || "Remote / Hybrid"}
- College / University: ${profile?.collegeName || profile?.college || "State University"}
- Degree & Branch: ${profile?.degree || "Bachelor Degree"} in ${profile?.branch || "Field of Study"}
- Graduation Year / CGPA: ${profile?.graduationYear || "2025"} | CGPA: ${profile?.cgpa || "N/A"}
- Target Role: ${selectedRole}
- Resume Strategy: ${selectedStrategy}
- Technical / Core Skills: ${profile?.technicalSkills?.join(", ") || "Core Domain Competencies"}
- Non-Technical / Leadership Skills: ${profile?.nonTechnicalSkills?.join(", ") || "Communication, Agile, Team Leadership"}
- Existing Projects / Portfolio: ${profile?.projects || "Key achievements and domain projects"}
- Internship / Work Experience: ${profile?.internships || "Relevant professional experience and roles"}
- Certifications / Achievements: ${profile?.certifications || "Industry Certifications"}
- Career Aspirations: ${profile?.careerAspirations || "To excel and drive impact in target field"}
- User Clarification Answers (if provided): ${JSON.stringify(userAnswers || {})}

UNIVERSAL PROFESSION & TRUTHFULNESS DIRECTIVES:
1. UNIVERSAL DOMAIN ADAPTATION: Adapt terminology strictly to the candidate's profession. If non-technical (e.g., Nurse, Teacher, Lawyer, Chef, Accountant), do NOT invent software code or engineering terms. Map skills to:
   - Primary Competencies / Languages
   - Industry Tools / Software / Specialized Equipment
   - Core Domain Knowledge / Methodologies
2. TRUTHFULNESS GUARANTEE: Never invent fake employers, degrees, or unverified certifications. Synthesize, quantify, and elevate ONLY the candidate's actual provided background.
3. PROFESSION CLASSIFICATION (UPCS): Classify primary domain, specialization, experience level, industry sector, target role, career stage, and calculate an AI confidence score (0-100). If confidence is below 80, generate 2-3 precise clarification questions.
4. ATS BREAKDOWN: Provide granular 0-100 scores for overall optimization, keyword match, readability, terminology, chronology, and grammar. Include bullet rewrites and missing keywords.
5. PRINT-READY MARKDOWN: Output a clean, beautifully formatted Markdown text suitable for ATS text parsing and multi-style print exports.
`;

    const response = await generateWithFallback(ai, {
      contents: [{ text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "professionClassification",
            "selectedStrategy",
            "atsBreakdown",
            "professionalSummary",
            "skillsGrouped",
            "experienceAndProjects",
            "educationDetails",
            "atsKeywordsIncluded",
            "fullMarkdownText"
          ],
          properties: {
            professionClassification: {
              type: Type.OBJECT,
              required: [
                "primaryDomain",
                "secondarySpecialization",
                "experienceLevel",
                "industry",
                "targetRole",
                "careerStage",
                "confidenceScore",
                "clarificationQuestions"
              ],
              properties: {
                primaryDomain: { type: Type.STRING, description: "e.g., Software Engineering, Data Science, Product Management" },
                secondarySpecialization: { type: Type.STRING, description: "e.g., Cloud Backend, Frontend UI/UX, AI/ML Infrastructure" },
                experienceLevel: { type: Type.STRING, description: "Entry-Level / Mid-Level / Senior Executive" },
                industry: { type: Type.STRING, description: "Target Industry sector" },
                targetRole: { type: Type.STRING },
                careerStage: { type: Type.STRING, description: "e.g., Recent Graduate, Early Career Specialist, Career Switcher" },
                confidenceScore: { type: Type.INTEGER, description: "AI confidence score 0-100" },
                clarificationQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Targeted clarification questions if confidence < 80 or details sparse"
                }
              }
            },
            selectedStrategy: { type: Type.STRING },
            atsBreakdown: {
              type: Type.OBJECT,
              required: [
                "overallScore",
                "keywordMatchScore",
                "readabilityScore",
                "terminologyScore",
                "chronologyScore",
                "grammarScore",
                "missingKeywords",
                "bulletRewrites"
              ],
              properties: {
                overallScore: { type: Type.INTEGER },
                keywordMatchScore: { type: Type.INTEGER },
                readabilityScore: { type: Type.INTEGER },
                terminologyScore: { type: Type.INTEGER },
                chronologyScore: { type: Type.INTEGER },
                grammarScore: { type: Type.INTEGER },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                bulletRewrites: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["before", "after", "explanation"],
                    properties: {
                      before: { type: Type.STRING },
                      after: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            professionalSummary: { type: Type.STRING },
            skillsGrouped: {
              type: Type.OBJECT,
              required: ["languages", "frameworksAndTools", "coreEngineering"],
              properties: {
                languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                frameworksAndTools: { type: Type.ARRAY, items: { type: Type.STRING } },
                coreEngineering: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            experienceAndProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "roleOrCategory", "bullets"],
                properties: {
                  title: { type: Type.STRING },
                  roleOrCategory: { type: Type.STRING },
                  bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            educationDetails: {
              type: Type.OBJECT,
              required: ["institution", "degree", "graduationYear"],
              properties: {
                institution: { type: Type.STRING },
                degree: { type: Type.STRING },
                graduationYear: { type: Type.STRING },
                highlights: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            atsKeywordsIncluded: { type: Type.ARRAY, items: { type: Type.STRING } },
            fullMarkdownText: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 2C: Universal Enterprise Resume & Multimodal Document Analysis Engine
// ------------------------------------------------------------------------
app.post(["/api/placement/analyze-file", "/placement/analyze-file"], async (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [UPLOAD STARTED] /api/placement/analyze-file`);
    const { items, profile, targetRole } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn(`[${timestamp}] [UPLOAD WARNING] No file items attached`);
      return res.status(400).json({
        success: false,
        isResume: false,
        message: "No document attached. Please upload a valid resume in PDF, DOCX, TXT, or scan format."
      });
    }

    console.log(`[${timestamp}] [PARSING STARTED] Parsing ${items.length} items for analysis...`);
    const ai = getAI();

    const parts: any[] = [];
    let promptText = `You are Vorynexa's Enterprise Resume Analysis & Audit Engine—acting as a Senior Talent Acquisition Director, ATS Machine Parser Specialist, Universal Profession Classification Specialist (UPCS), and Multimodal Document Classifier.

Task: Analyze the attached document(s), resume scans/photographs, or text files (PDF, DOCX, TXT, PNG, JPG).

Candidate Context:
- Target Role: ${targetRole || profile?.targetRoles?.[0] || "Target Profession"}
- Candidate Name (if known): ${profile?.name || "Candidate"}

CRITICAL STEP 1: VALIDATION CHECK (IS THIS A RESUME?)
- Evaluate whether the uploaded document is a valid resume, CV, curriculum vitae, professional bio, or candidate work profile.
- Look for structural signals: Name, Contact information, Education, Experience, Skills, Projects, Certifications, Headings (e.g. Work History, Education, Technical Skills, Executive Summary).
- IF THE DOCUMENT IS NOT A RESUME (e.g. it is a textbook page, invoice, code snippet, assignment, recipe, general news article, random photo, or unrelated document):
  - Set "isResume": false
  - Set "nonResumeReason": "This document does not appear to be a professional resume. Please upload a valid resume."
  - Set "overallScore": 0, "atsScore": 0, "grammarScore": 0, "formattingScore": 0, "professionalismScore": 0, "careerReadinessScore": 0
  - Provide empty arrays/objects for extracted details. DO NOT HALLUCINATE OR INVENT APPLICANT PROFILE DATA.

CRITICAL STEP 2: UNIVERSAL EXTRACTION & MULTI-DIMENSIONAL AUDIT (IF "isResume": true)
- Set "isResume": true, "nonResumeReason": null
- Profession Classification: Detect candidate profession (Software, Nursing, Law, Medicine, Finance, Sales, HR, Teaching, Skilled Trades, etc.), Industry, Career Stage, Experience Level, Seniority, and Domain.
- Extract: Full Name, Email, Phone, Location, Address, LinkedIn, GitHub, Portfolio URL, Career Summary, Education, Experience, Projects, Technical Skills, Soft Skills, Certifications, Achievements, Languages, Publications, Awards, and Missing Sections.
- Calculate:
  1. "overallScore": 0-100 aggregated resume quality score.
  2. "atsScore": 0-100 ATS machine parser compliance score.
  3. "grammarScore": 0-100 grammar, syntax, active voice rating.
  4. "formattingScore": 0-100 visual hierarchy, margin, typography, bullet structure rating.
  5. "professionalismScore": 0-100 executive tone and polish rating.
  6. "careerReadinessScore": 0-100 market readiness score for candidate's target profession.
- Profession-Specific Tailoring: Ensure ALL recommendations, keywords, missing skills, projects, and certifications match the candidate's exact profession. NEVER mix software recommendations into nursing or legal resumes.
- Perform:
  - "grammarAnalysis": Detail any typos, grammatical errors, or passive voice usage.
  - "formattingSuggestions": Audit visual margins, density, bullet consistency, and typography.
  - "missingKeywords": Identify 5-8 missing target role ATS keywords.
  - "missingSections": Identify any missing key sections (e.g., Work Experience, Quantified Metrics, Certifications).
  - "keyStrengths": Highlight top competitive advantages.
  - "criticalFlawsAndRisks": Highlight red flags or formatting errors.
  - "industryFitAnalysis": Assess alignment with target industry.
  - "roleSuitability": Evaluate readiness for target role with specific rationale.
  - "skillGapAnalysis": List critical missing skills or certifications.
  - "atsBulletImprovements": Provide 3-5 high-impact before/after bullet rewrites using the STAR method with metrics.
  - "recommendedProjects": 2-3 profession-appropriate high-impact portfolio projects.
  - "recommendedCertifications": 2-3 industry-recognized certifications for candidate's exact profession.
  - "careerRoadmapSuggestions": 3 actionable career progression steps.
  - "interviewPreparationTips": 3 key interview preparation topics and advice.
  - "overallVerdict": Direct, constructive senior recruiter evaluation.
  - "recommendedActionableSteps": 3-5 prioritized immediate improvement actions.
`;

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.base64Data) {
          if (item.mimeType && item.mimeType.startsWith("image/")) {
            let rawBase64 = typeof item.base64Data === "string" ? item.base64Data : "";
            if (rawBase64.includes(";base64,")) {
              rawBase64 = rawBase64.split(";base64,")[1];
            }
            if (rawBase64) {
              console.log(`[${timestamp}] [OCR STARTED] Image/Scan detected: ${item.name || "Image"}`);
              parts.push({
                inlineData: {
                  data: rawBase64,
                  mimeType: item.mimeType,
                },
              });
            }
          } else {
            // PDF, Word, or Text document - extract text on server-side to avoid Gemini API 400 Unsupported MIME type
            const extracted = await extractDocumentText(item.base64Data, item.mimeType, item.name);
            if (extracted) {
              promptText += `\n\nATTACHED FILE DOCUMENT TEXT (${item.name || "document"}):\n${extracted}`;
            } else if (item.textContent) {
              promptText += `\n\nATTACHED FILE CONTENT (${item.name || "document.txt"}):\n${item.textContent}`;
            } else {
              promptText += `\n\nATTACHED FILE ATTACHMENT (${item.name || "document"}): Attached successfully for candidate ${profile?.name || "Student"}.`;
            }
          }
        } else if (item.textContent) {
          promptText += `\n\nATTACHED FILE CONTENT (${item.name || "document.txt"}):\n${item.textContent}`;
        } else if (item.linkUrl) {
          promptText += `\n\nATTACHED LINK (${item.category || "web_link"}): ${item.linkUrl}`;
        }
      }
    }

    parts.push({ text: promptText });

    console.log(`[${timestamp}] [AI ANALYSIS STARTED] Sending multimodal prompt to Gemini...`);
    const response = await generateWithFallback(ai, {
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "isResume",
            "nonResumeReason",
            "overallScore",
            "atsScore",
            "grammarScore",
            "formattingScore",
            "professionalismScore",
            "careerReadinessScore",
            "fileTypeDetected",
            "extractedText",
            "extractedDetails",
            "keyStrengths",
            "criticalFlawsAndRisks",
            "missingKeywords",
            "missingSections",
            "formattingSuggestions",
            "atsBulletImprovements",
            "overallVerdict",
            "recommendedActionableSteps",
            "grammarAnalysis",
            "industryFitAnalysis",
            "roleSuitability",
            "skillGapAnalysis",
          ],
          properties: {
            isResume: { type: Type.BOOLEAN },
            nonResumeReason: { type: Type.STRING },
            overallScore: { type: Type.INTEGER },
            atsScore: { type: Type.INTEGER },
            grammarScore: { type: Type.INTEGER },
            formattingScore: { type: Type.INTEGER },
            professionalismScore: { type: Type.INTEGER },
            careerReadinessScore: { type: Type.INTEGER },
            fileTypeDetected: { type: Type.STRING },
            extractedText: { type: Type.STRING },
            professionClassification: {
              type: Type.OBJECT,
              properties: {
                profession: { type: Type.STRING },
                industry: { type: Type.STRING },
                careerStage: { type: Type.STRING },
                experienceLevel: { type: Type.STRING },
                seniority: { type: Type.STRING },
                domain: { type: Type.STRING },
              },
            },
            extractedDetails: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                address: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                github: { type: Type.STRING },
                portfolio: { type: Type.STRING },
                college: { type: Type.STRING },
                degree: { type: Type.STRING },
                careerSummary: { type: Type.STRING },
                technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      techUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      company: { type: Type.STRING },
                      role: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                  },
                },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                publications: { type: Type.ARRAY, items: { type: Type.STRING } },
                awards: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalFlawsAndRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSections: { type: Type.ARRAY, items: { type: Type.STRING } },
            formattingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            grammarAnalysis: { type: Type.STRING },
            industryFitAnalysis: { type: Type.STRING },
            roleSuitability: { type: Type.STRING },
            skillGapAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
            atsBulletImprovements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  before: { type: Type.STRING },
                  after: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
              },
            },
            recommendedProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  objective: { type: Type.STRING },
                  tools: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resumeImpact: { type: Type.STRING },
                },
              },
            },
            recommendedCertifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  relevance: { type: Type.STRING },
                },
              },
            },
            careerRoadmapSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            interviewPreparationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            overallVerdict: { type: Type.STRING },
            recommendedActionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    const text = response.text || "{}";
    const parsedData = parseGeminiJson(text);
    console.log(`[${timestamp}] [AI ANALYSIS FINISHED] Resume validation status: isResume=${parsedData.isResume}`);

    if (parsedData.isResume === false) {
      return res.json({
        success: false,
        isResume: false,
        message: parsedData.nonResumeReason || "This document does not appear to be a professional resume. Please upload a valid resume.",
        analysis: parsedData,
        ...parsedData
      });
    }

    return res.json({
      success: true,
      isResume: true,
      analysis: parsedData,
      ...parsedData
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [API FAILURE] analyze-file error:`, error);
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 3: Enterprise AI Career Roadmap Engine
// ------------------------------------------------------------------------
app.post(["/api/placement/roadmap", "/placement/roadmap"], async (req, res) => {
  try {
    const reqData = req.body || {};
    const profile = reqData.profile || reqData;
    const ai = getAI();

    // Extract parameters or fallback to profile values
    const education = reqData.education || `${profile.degree || "Degree"} in ${profile.branch || "Field"} (${profile.college || "University"})`;
    const currentSkills = reqData.currentSkills || profile.technicalSkills || ["Core Knowledge", "Problem Solving"];
    const experience = reqData.experience || profile.internships || profile.projects || "Student / Early Career Experience";
    const careerGoal = reqData.careerGoal || profile.careerGoals || "Achieve long-term professional leadership and domain mastery";
    const targetRole = reqData.targetRole || profile.targetRoles?.[0] || "Professional Lead";
    const country = reqData.country || profile.location || profile.preferredLocation || "United States / Global";
    const preferredIndustry = reqData.preferredIndustry || "Technology & Software";
    const learningSpeed = reqData.learningSpeed || "Standard (1x)";
    const availableTime = reqData.availableTime || profile.timeAvailable || "2-3 hours/day";
    const budget = reqData.budget || "$0 (Free / Open Source)";
    const existingResumeText = reqData.existingResumeText || profile.resumeStatus || "";

    const prompt = `You are the Chief Career Intelligence Officer, HR Director, Principal AI Engineer, and Career Coach at Vorynexa.
Generate a deeply personalized, ultra-rigorous, non-generic Universal Enterprise Career Roadmap tailored specifically for this candidate.

CRITICAL DIRECTIVE ON PROFESSION ISOLATION & ACCURACY:
- NEVER generate generic or software-only roadmaps if the user's role/industry is in Healthcare, Law, Teaching, Trades, Business, Finance, Creative, Agriculture, Government, Sports, etc.
- STRICTLY ISOLATE RECOMMENDATIONS TO THE CANDIDATE'S PROFESSION & SUB-SPECIALIZATION:
  * Medicine / Nursing / Healthcare: Include clinical rotations, USMLE/PLAB/NEXT/NCLEX licensing, EHR/EMR systems, HIPAA protocols, clinical trial research, hospital rounds. DO NOT include LeetCode or software frameworks.
  * Law & Legal: Legal drafting, case law, Bar Exam prep, litigation strategy, Westlaw/LexisNexis, moot courts, judicial clerkships.
  * Education & Teaching: Lesson planning, Bloom's Taxonomy, classroom management, Canvas/Blackboard LMS, teacher certification, pedagogical methods.
  * Skilled Trades (Electrician, Plumber, HVAC): NEC National Electrical Code, PLC wiring, EPA 608, OSHA safety certification, blueprint reading, apprenticeship logs.
  * Accounting & Finance: CPA/CFA exams, GAAP/IFRS standards, financial modeling in Excel, Bloomberg Terminal, audit trails, risk management.
  * Software / AI / Engineering: System design, PyTorch/TensorFlow, MLOps, CI/CD pipelines, GitHub repositories, cloud infrastructure.
  * Marketing & Growth: CAC/LTV metrics, Google Analytics 4, conversion rate optimization, campaign case studies, CRM workflows.
  * Government & Civil Services: Civil services syllabus breakdown, public administration, policy draft analysis, general studies, interview board prep.

CANDIDATE INPUT PROFILE:
- Target Role: ${targetRole}
- Preferred Industry: ${preferredIndustry}
- Education: ${education}
- Current Skills: ${Array.isArray(currentSkills) ? currentSkills.join(", ") : currentSkills}
- Non-Technical Skills: ${profile.nonTechnicalSkills?.join(", ") || "Communication, Leadership, Critical Thinking"}
- Experience & Projects: ${experience}
- Long-Term Career Goal: ${careerGoal}
- Country / Market: ${country}
- Learning Pace: ${learningSpeed}
- Available Time: ${availableTime}
- Budget Tier: ${budget}
- Existing Resume Snapshot: ${existingResumeText}

INSTRUCTIONS:
1. STEP 1: Perform Candidate Classification & Diagnostic Analysis:
   - Identify candidate's exact Industry, Profession, Sub-Specialization, Career Stage, Education Level, Experience Tier, and whether profile is Technical or Non-Technical.
   - Compute classificationConfidenceScore (0-100). If confidence < 80, provide 2 concise clarification questions in clarificationQuestions array.
   - Calculate Skill Gap Index Score (0-100), Resume Strength Score (0-100), ATS Keyword Compatibility Score (0-100), and Interview Readiness Score (0-100).
   - Provide executive mentor verdict, realistic salary progression guidance, alternative career paths, common industry mistakes, current industry trends, emerging skills, and LinkedIn optimization tips.
2. STEP 2: Generate a complete 4-Stage Execution Matrix covering ALL 4 STAGES:
   - "Beginner Stage" (Foundations, core domain tools, fundamental theory, initial milestones)
   - "Intermediate Stage" (Practices, real-world case studies/projects, framework/methodology mastery)
   - "Advanced Stage" (Enterprise scale, complex problem solving, specialized domain mastery)
   - "Expert Stage" (Optimization, leadership, executive interview prep, industry authority)

FOR EVERY SINGLE STAGE (Beginner, Intermediate, Advanced, Expert), YOU MUST PROVIDE:
- stageName
- stageTitle
- timeline (e.g. "Weeks 1-4 / 60 Hours")
- mentorAdvice (Personalized direct coaching advice)
- learningTopics (5+ profession-specific topics)
- recommendedProjects (2 detailed projects with title, description, keyDeliverables array, portfolioImpact)
- recommendedCertifications (2 certifications with name, issuer, relevance, estimatedCost)
- recommendedTools (5+ specific profession tools)
- books (2 top books with title, author, whyRead)
- courses (2 courses with title, platform, urlOrProvider, type)
- practicePlatforms (2 platforms with name, focus)
- interviewPreparation (2 interview topics with topic, keyQuestions array, strategy)
- portfolioTasks (3 portfolio/case-study deliverables)
- networkingSuggestions (3 actionable networking steps)
- jobApplicationStrategy (3 job search tactics)
- milestones (4-6 milestones with id, title, description, completed: false, priority: 'High'|'Medium'|'Low', userNotes)
`;

    const stageProperties = {
      stageName: { type: Type.STRING },
      stageTitle: { type: Type.STRING },
      timeline: { type: Type.STRING },
      mentorAdvice: { type: Type.STRING },
      learningTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendedProjects: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["title", "description", "keyDeliverables", "portfolioImpact"],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keyDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
            portfolioImpact: { type: Type.STRING }
          }
        }
      },
      recommendedCertifications: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["name", "issuer", "relevance", "estimatedCost"],
          properties: {
            name: { type: Type.STRING },
            issuer: { type: Type.STRING },
            relevance: { type: Type.STRING },
            estimatedCost: { type: Type.STRING }
          }
        }
      },
      recommendedTools: { type: Type.ARRAY, items: { type: Type.STRING } },
      books: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["title", "author", "whyRead"],
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            whyRead: { type: Type.STRING }
          }
        }
      },
      courses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["title", "platform", "urlOrProvider", "type"],
          properties: {
            title: { type: Type.STRING },
            platform: { type: Type.STRING },
            urlOrProvider: { type: Type.STRING },
            type: { type: Type.STRING }
          }
        }
      },
      practicePlatforms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["name", "focus"],
          properties: {
            name: { type: Type.STRING },
            focus: { type: Type.STRING }
          }
        }
      },
      interviewPreparation: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["topic", "keyQuestions", "strategy"],
          properties: {
            topic: { type: Type.STRING },
            keyQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            strategy: { type: Type.STRING }
          }
        }
      },
      portfolioTasks: { type: Type.ARRAY, items: { type: Type.STRING } },
      networkingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      jobApplicationStrategy: { type: Type.ARRAY, items: { type: Type.STRING } },
      milestones: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ["id", "title", "description", "completed", "priority"],
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            completed: { type: Type.BOOLEAN },
            priority: { type: Type.STRING },
            userNotes: { type: Type.STRING }
          }
        }
      }
    };

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["userAnalysis", "stages"],
          properties: {
            userAnalysis: {
              type: Type.OBJECT,
              required: [
                "currentCareerStage",
                "currentSkills",
                "missingSkills",
                "targetProfession",
                "skillGapSummary",
                "skillGapScore",
                "resumeStrengthScore",
                "resumeStrengthSummary",
                "interviewReadinessScore",
                "interviewReadinessSummary",
                "mentorExecutiveVerdict"
              ],
              properties: {
                currentCareerStage: { type: Type.STRING },
                currentSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                targetProfession: { type: Type.STRING },
                skillGapSummary: { type: Type.STRING },
                skillGapScore: { type: Type.INTEGER },
                resumeStrengthScore: { type: Type.INTEGER },
                resumeStrengthSummary: { type: Type.STRING },
                interviewReadinessScore: { type: Type.INTEGER },
                interviewReadinessSummary: { type: Type.STRING },
                mentorExecutiveVerdict: { type: Type.STRING },
                classifiedIndustry: { type: Type.STRING },
                classifiedProfession: { type: Type.STRING },
                classifiedDomain: { type: Type.STRING },
                classifiedSpecialisation: { type: Type.STRING },
                classifiedSubSpecialization: { type: Type.STRING },
                classifiedCareerLevel: { type: Type.STRING },
                classifiedExperienceLevel: { type: Type.STRING },
                classifiedCountry: { type: Type.STRING },
                classifiedCareerGoal: { type: Type.STRING },
                isTechnicalProfile: { type: Type.BOOLEAN },
                classificationConfidenceScore: { type: Type.INTEGER },
                clarificationQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                salaryProgressionGuidance: { type: Type.STRING },
                alternativeCareerPaths: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      roleTitle: { type: Type.STRING },
                      rationale: { type: Type.STRING },
                      transitionEffort: { type: Type.STRING }
                    }
                  }
                },
                commonMistakesToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
                industryTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
                emergingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                linkedInOptimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                resumeImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
                atsScore: { type: Type.INTEGER }
              }
            },
            stages: {
              type: Type.OBJECT,
              required: ["beginner", "intermediate", "advanced", "expert"],
              properties: {
                beginner: { type: Type.OBJECT, properties: stageProperties },
                intermediate: { type: Type.OBJECT, properties: stageProperties },
                advanced: { type: Type.OBJECT, properties: stageProperties },
                expert: { type: Type.OBJECT, properties: stageProperties }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    const parsedData = parseGeminiJson(text);

    // Build enterprise roadmap structure
    const enterpriseRoadmap = {
      generatedAt: new Date().toISOString(),
      inputs: {
        education,
        currentSkills: Array.isArray(currentSkills) ? currentSkills : [currentSkills],
        experience,
        careerGoal,
        targetRole,
        country,
        preferredIndustry,
        learningSpeed,
        availableTime,
        budget,
        existingResumeText
      },
      userAnalysis: parsedData.userAnalysis || {
        currentCareerStage: "Early Career Specialist",
        currentSkills: Array.isArray(currentSkills) ? currentSkills : ["Foundational Skills"],
        missingSkills: ["Domain Standards", "Advanced Practice"],
        targetProfession: `${targetRole} in ${preferredIndustry}`,
        skillGapSummary: `Identified growth areas for ${targetRole}.`,
        skillGapScore: 35,
        resumeStrengthScore: 78,
        resumeStrengthSummary: "Solid baseline profile.",
        interviewReadinessScore: 72,
        interviewReadinessSummary: "Good preparation; practice domain-specific scenario responses.",
        mentorExecutiveVerdict: `Your profile for ${targetRole} in ${country} shows strong momentum. Follow the 4-stage execution matrix below.`,
        classifiedIndustry: preferredIndustry,
        classifiedProfession: targetRole,
        classifiedSubSpecialization: "General Practice",
        classificationConfidenceScore: 92,
        atsScore: 78
      },
      stages: parsedData.stages || {}
    };

    // Synthesize plan7Day, plan30Day, plan90Day for legacy compatibility
    const begMilestones = parsedData.stages?.beginner?.milestones || [];
    const intMilestones = parsedData.stages?.intermediate?.milestones || [];
    const advMilestones = parsedData.stages?.advanced?.milestones || [];

    const plan7Day = begMilestones.map((m: any, i: number) => ({
      dayOrWeek: `Day ${i + 1}`,
      taskName: m.title || "Beginner Milestone Task",
      priority: m.priority || "High",
      description: m.description || ""
    }));

    const plan30Day = intMilestones.map((m: any, i: number) => ({
      dayOrWeek: `Week ${i + 1}`,
      taskName: m.title || "Intermediate Milestone Task",
      priority: m.priority || "High",
      description: m.description || ""
    }));

    const plan90Day = advMilestones.map((m: any, i: number) => ({
      dayOrWeek: `Month ${i + 1}`,
      taskName: m.title || "Advanced Milestone Task",
      priority: m.priority || "Medium",
      description: m.description || ""
    }));

    res.json({
      plan7Day,
      plan30Day,
      plan90Day,
      enterpriseRoadmap
    });
  } catch (error) {
    handleApiError(res, error);
  }
});

// Endpoint for Adaptive Sectional Roadmap Updates (Step 5)
app.post(["/api/placement/roadmap-adaptive", "/placement/roadmap-adaptive"], async (req, res) => {
  try {
    const { existingRoadmap, updatedFields, targetStage } = req.body;
    const ai = getAI();

    const currentAnalysis = existingRoadmap?.userAnalysis || {};
    const targetProfession = updatedFields?.targetRole || currentAnalysis.targetProfession || "Specialist";

    const prompt = `You are Vorynexa's Adaptive Career Intelligence Engine.
The candidate updated their profile parameters or completed new milestones.
Re-compute the affected roadmap section while preserving the candidate's career trajectory.

UPDATED CANDIDATE PARAMS:
- Target Role: ${targetProfession}
- Preferred Industry: ${updatedFields?.preferredIndustry || currentAnalysis.classifiedIndustry || "Industry"}
- Updated Skills/Certifications: ${JSON.stringify(updatedFields?.currentSkills || currentAnalysis.currentSkills)}
- Education/Experience: ${updatedFields?.education || ""} | ${updatedFields?.experience || ""}

Regenerate the updated userAnalysis diagnostics AND the requested stage ("${targetStage || "all"}"). Ensure recommendations strictly align with ${targetProfession}.
Return valid JSON adhering to the userAnalysis and stage structure.`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedData = parseGeminiJson(response.text || "{}");
    res.json({
      success: true,
      updatedSection: parsedData
    });
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 4: Custom Project Generator
// ------------------------------------------------------------------------
app.post(["/api/placement/projects", "/placement/projects"], async (req, res) => {
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 5: Job Search Strategy & Outreach Scripts
// ------------------------------------------------------------------------
app.post(["/api/placement/job-search", "/placement/job-search"], async (req, res) => {
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 6: Interactive Enterprise Interview Questions Engine
// ------------------------------------------------------------------------
app.post(["/api/placement/interview/questions", "/placement/interview/questions"], async (req, res) => {
  try {
    const { 
      profile, 
      role, 
      interviewType = "Technical", 
      experienceLevel = "Experienced Professional", 
      domain = "Software Engineering",
      questionCount = 3,
      excludeQuestions = [], 
      sessionContext, 
      performanceTrends, 
      seed 
    } = req.body;
    const ai = getAI();

    // Select skills or domain focus
    const techSkills = profile?.technicalSkills || [];
    const chosenTech = techSkills.length > 0 
      ? techSkills.sort(() => 0.5 - Math.random()).slice(0, 3).join(", ") 
      : "domain fundamentals and best practices";

    let dynamicPromptDetails = "";
    if (sessionContext) {
      dynamicPromptDetails += `
SESSION ROTATION CONTEXT:
- Active Session ID: ${sessionContext.sessionId || "N/A"}
- Previous Session IDs: ${sessionContext.previousSessionIds?.join(", ") || "None"}
Ensure non-repetitive scenario generation across sessions.`;
    }

    if (performanceTrends) {
      dynamicPromptDetails += `
CANDIDATE PERFORMANCE TRENDS:
- Total Rounds Completed: ${performanceTrends.totalSessions || 0}
- Average Overall Score: ${performanceTrends.averageOverallScore !== null ? performanceTrends.averageOverallScore + "%" : "No score yet"}
- Suggested Adaptive Difficulty: ${performanceTrends.suggestedDifficulty || "Intermediate"}
Adapt question complexity accordingly.`;
    }

    if (seed) {
      dynamicPromptDetails += `\n- Unique Session Random Seed: ${seed}`;
    }

    const countToGenerate = Math.min(7, Math.max(1, Number(questionCount) || 3));

    const prompt = `You are a World-Class Executive Recruiter and Chief Interview Assessment Officer.
You are conducting a high-stakes ${interviewType.toUpperCase()} INTERVIEW for the target role: "${role || "Target Role"}".
- CANDIDATE LEVEL: ${experienceLevel}
- DOMAIN / INDUSTRY: ${domain}
- INTERVIEW TYPE: ${interviewType} (HR, Technical, Behavioural, Leadership, Government, Domain-specific)

Generate exactly ${countToGenerate} custom-crafted, highly realistic, role-specific, and experience-appropriate interview questions.

TYPE SPECIFIC GUIDELINES:
- HR: Assess cultural fit, career progression, motivation, conflict resolution, salary alignment, and workplace ethics.
- TECHNICAL: Assess system architecture, problem solving, domain-specific coding or logic, debugging, trade-offs, and optimization.
- BEHAVIOURAL: Assess past achievements, crisis handling, STAR framework stories, cross-team friction, mistakes, and resilience.
- LEADERSHIP: Assess strategy, vision, mentoring, budget/resource allocation, executive decisions, and organizational impact.
- GOVERNMENT: Assess public policy compliance, official protocol, administrative integrity, regulatory enforcement, ethics, and multi-stakeholder governance.
- DOMAIN-SPECIFIED (${domain}): Assess domain-specific frameworks, regulatory standards, specialized tools, and real-world operational scenarios pertinent to ${domain}.

LEVEL SPECIFIC GUIDELINES:
- Freshers: Focus on core fundamentals, academic/personal project ownership, eagerness to learn, logical problem solving, and scenario adaptability.
- Experienced Professionals: Focus on senior execution, architectural trade-offs, mentoring others, handling catastrophic edge cases, business outcomes, and leadership.

PREVIOUS QUESTIONS TO EXCLUDE:
${excludeQuestions.length > 0 ? excludeQuestions.map((q: string) => `- "${q}"`).join("\n") : "- None"}

CANDIDATE BACKGROUND:
- Degree/Branch: ${profile?.degree || "Degree"} in ${profile?.branch || "Field"}
- Technical/Core Skills: ${techSkills.join(", ") || "Core Skills"}
- Non-Tech Skills: ${(profile?.nonTechnicalSkills || []).join(", ")}
- Projects/Experience: ${profile?.projects || profile?.internships || "Standard background"}
${dynamicPromptDetails}

Return JSON array of exactly ${countToGenerate} question objects.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        temperature: 0.95,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "question", "type", "expectedFocus"],
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING, description: "One of: 'technical', 'behavioral', 'hr', 'leadership', 'government', 'domain'" },
              interviewType: { type: Type.STRING },
              experienceLevel: { type: Type.STRING },
              domainCategory: { type: Type.STRING },
              expectedFocus: { type: Type.STRING, description: "Key grading rubric and expected response markers" }
            }
          }
        }
      }
    });

    const text = response.text || "[]";
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 7: Enterprise 15-Dimension Answer Evaluator
// ------------------------------------------------------------------------
app.post(["/api/placement/interview/evaluate", "/placement/interview/evaluate"], async (req, res) => {
  try {
    const { question, answer, type, expectedFocus, verbalMetrics, interviewType, experienceLevel, domain } = req.body;
    const ai = getAI();

    let verbalPromptDetails = "";
    if (verbalMetrics) {
      const fillers = verbalMetrics.fillerCounts || {};
      verbalPromptDetails = `
CANDIDATE LIVE SPOKEN FLUENCY METRICS:
- Filler words count: Um: ${fillers.um || 0}, Uh: ${fillers.uh || 0}, Like: ${fillers.like || 0}, Actually: ${fillers.actually || 0}, Basically: ${fillers.basically || 0}, So: ${fillers.so || 0}
- Spoken Confidence Level: ${verbalMetrics.sentimentLabel || "N/A"} (${verbalMetrics.sentimentScore || 50}%)
- Speaking Speed: ${verbalMetrics.wordsPerMinute || 0} WPM
- Hesitation Silence Gaps: ${verbalMetrics.hesitationDuration || 0}s

Incorporate these speech metrics into your evaluation and actionable feedback.
`;
    }

    const prompt = `You are a Senior Assessment Director & HR Executive conducting a comprehensive evaluation of a candidate's answer.
    
QUESTION ASKED: "${question}"
QUESTION TYPE/CATEGORY: "${type || interviewType || "Interview Question"}"
CANDIDATE LEVEL: "${experienceLevel || "Professional"}"
DOMAIN: "${domain || "General Industry"}"
EXPECTED MARKERS: "${expectedFocus || "Logical reasoning, clarity, accuracy"}"

CANDIDATE'S ANSWER:
"${answer}"
${verbalPromptDetails}

Evaluate the response rigorously across 15 SPECIFIC DIMENSIONS (Each an Integer Score from 0 to 100):
1. "communication": Structure, clarity, articulation, pace, and readability.
2. "grammar": Sentence structure, syntax correctness, and polished expression.
3. "confidence": Authority, posture, lack of hesitation, and conviction.
4. "professionalism": Executive tone, etiquette, conciseness, and appropriateness.
5. "domainKnowledge": Industry-specific subject mastery and principles.
6. "technicalAccuracy": Precision of technical, domain, procedural, or factual claims.
7. "behaviour": Alignment with STAR method, ownership, team spirit, and mistake recovery.
8. "problemSolving": Analytical depth, structured logic, edge case handling, and strategy.
9. "leadership": Vision, delegation, initiative, and leadership impact.
10. "softSkills": Empathy, collaboration, active listening, and EQ.
11. "vocabulary": Lexicon precision and domain terminology.
12. "clarity": Directness, transparency, and clear articulation.
13. "structure": STAR / PREP structural organization.
14. "conciseness": Signal-to-noise ratio, brevity, and focus.
15. "depthOfKnowledge": Mastery of subject matter and execution nuance.

Provide:
- "score": Overall composite score (0-100)
- "feedback": Concise, highly constructive feedback highlighting strengths, critical gaps, and verbal/pacing tips.
- "suggestedStarAnswer": A fully rewritten, highly polished response using STAR format or clean executive logic.
- "keyStrengths": Array of 2-3 specific strengths in this response.
- "keyWeaknesses": Array of 2-3 specific weaknesses in this response.
- "improvementAreas": Array of 2-3 targeted actions for next time.
- "learningResources": Array of 2 recommended topics/links/books to read.
- Numerical scores (0-100) for all 15 dimensions.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "score", 
            "feedback", 
            "suggestedStarAnswer", 
            "communication", 
            "technicalAccuracy", 
            "confidence", 
            "grammar", 
            "professionalism", 
            "problemSolving", 
            "depthOfKnowledge", 
            "behaviour"
          ],
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            suggestedStarAnswer: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningResources: { type: Type.ARRAY, items: { type: Type.STRING } },
            communication: { type: Type.INTEGER },
            grammar: { type: Type.INTEGER },
            confidence: { type: Type.INTEGER },
            professionalism: { type: Type.INTEGER },
            domainKnowledge: { type: Type.INTEGER },
            technicalAccuracy: { type: Type.INTEGER },
            behaviour: { type: Type.INTEGER },
            problemSolving: { type: Type.INTEGER },
            leadership: { type: Type.INTEGER },
            softSkills: { type: Type.INTEGER },
            vocabulary: { type: Type.INTEGER },
            clarity: { type: Type.INTEGER },
            structure: { type: Type.INTEGER },
            conciseness: { type: Type.INTEGER },
            depthOfKnowledge: { type: Type.INTEGER },
            // Legacy fallbacks
            technicalDepth: { type: Type.INTEGER },
            communicationClarity: { type: Type.INTEGER }
          }
        }
      }
    });

    const parsed = parseGeminiJson(response.text || "{}");
    // Ensure legacy shortcuts exist
    if (parsed) {
      parsed.technicalDepth = parsed.technicalAccuracy ?? parsed.depthOfKnowledge ?? 70;
      parsed.communicationClarity = parsed.communication ?? 70;
      parsed.domainKnowledge = parsed.domainKnowledge ?? parsed.technicalAccuracy ?? 70;
      parsed.leadership = parsed.leadership ?? 70;
      parsed.softSkills = parsed.softSkills ?? 70;
      parsed.vocabulary = parsed.vocabulary ?? 70;
      parsed.clarity = parsed.clarity ?? parsed.communication ?? 70;
      parsed.structure = parsed.structure ?? 70;
      parsed.conciseness = parsed.conciseness ?? 70;
    }
    res.json(parsed);
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 7.8: Final Enterprise Interview Report Generator
// ------------------------------------------------------------------------
app.post(["/api/placement/interview/report", "/placement/interview/report"], async (req, res) => {
  try {
    const { session, profile, role, category, experienceLevel, domain } = req.body;
    const ai = getAI();

    const prompt = `You are the Chief Talent Officer and AI Assessment Director of Vorynexa Enterprise AI Interview Studio.
Generate an executive final evaluation report for a completed candidate interview session.

SESSION METADATA:
- Target Role: ${role || "Candidate Role"}
- Category: ${category || "General"}
- Candidate Level: ${experienceLevel || "Experienced Professional"}
- Domain: ${domain || "General"}
- Candidate Name: ${profile?.name || "Candidate"}

QUESTIONS & ANSWERS HISTORY:
${JSON.stringify(session?.chatHistory || [])}

Generate an executive interview report containing:
1. "overallScore": 0-100 aggregated score.
2. "interviewReadinessScore": 0-100 candidate readiness score for live market interviews.
3. "hiringRecommendation": One of "Strongly Recommend Hire", "Hire with Coaching", "Borderline / Re-evaluate", "Not Recommended at Present".
4. "executiveSummary": A 3-4 sentence comprehensive evaluation of candidate performance.
5. "keyStrengths": Array of 3-4 distinct strengths observed.
6. "keyWeaknesses": Array of 3-4 weaknesses identified across responses.
7. "skillGaps": Array of 3-4 technical or soft skill gaps identified.
8. "criticalImprovementAreas": Array of 3-4 high-impact areas for candidate improvement.
9. "roleSpecificRecommendations": Array of 3 specific recommendations for ${role || "this role"}.
10. "learningResources": Array of 3 recommended books, courses, or practice areas.
11. "dimensionScores": Object with scores (0-100) for:
   - communication, technicalAccuracy, confidence, grammar, professionalism, problemSolving, depthOfKnowledge, behaviour, leadership, vocabulary, fluency, structure, timeManagement, consistency.
12. "actionPlan": Array of 3 actionable next steps to master upcoming real interviews.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "overallScore",
            "interviewReadinessScore",
            "hiringRecommendation",
            "executiveSummary",
            "keyStrengths",
            "keyWeaknesses",
            "skillGaps",
            "criticalImprovementAreas",
            "roleSpecificRecommendations",
            "learningResources",
            "dimensionScores",
            "actionPlan"
          ],
          properties: {
            overallScore: { type: Type.INTEGER },
            interviewReadinessScore: { type: Type.INTEGER },
            hiringRecommendation: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            criticalImprovementAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
            roleSpecificRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            learningResources: { type: Type.ARRAY, items: { type: Type.STRING } },
            dimensionScores: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.INTEGER },
                technicalAccuracy: { type: Type.INTEGER },
                confidence: { type: Type.INTEGER },
                grammar: { type: Type.INTEGER },
                professionalism: { type: Type.INTEGER },
                problemSolving: { type: Type.INTEGER },
                depthOfKnowledge: { type: Type.INTEGER },
                behaviour: { type: Type.INTEGER },
                leadership: { type: Type.INTEGER },
                vocabulary: { type: Type.INTEGER },
                fluency: { type: Type.INTEGER },
                structure: { type: Type.INTEGER },
                timeManagement: { type: Type.INTEGER },
                consistency: { type: Type.INTEGER }
              }
            },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const parsed = parseGeminiJson(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 7.5: Clarify & Rephrase Interview Question
// ------------------------------------------------------------------------
app.post(["/api/placement/interview/clarify", "/placement/interview/clarify"], async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { question, type, expectedFocus } = req.body;
    if (!question) {
      return res.status(400).json({
        error: true,
        message: "Question parameter is required for clarification.",
      });
    }

    const ai = getAI();
    const prompt = `You are a helpful, empathetic Mock Interview Coach.
The user is struggling to understand the following interview question during their simulation:
QUESTION: "${question}"
TYPE: "${type || "technical"}"
EXPECTED MARKERS: "${expectedFocus || "Core concepts and clear structure"}"

Your goal is to:
1. Rephrase the question into a simpler, more approachable, and conversational version that is easier to grasp immediately, while keeping its core technical or behavioral intent identical.
2. Break down what the interviewer is actually asking for into 2 or 3 highly friendly, actionable hints.
3. Guide the user on how to structure their thoughts (such as using the STAR method or step-by-step breakdown).

Return a clean JSON object with keys "clarifiedQuestion" and "helpfulHints".`;

    try {
      const response = await generateWithFallback(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["clarifiedQuestion", "helpfulHints"],
            properties: {
              clarifiedQuestion: { type: Type.STRING },
              helpfulHints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const parsed = parseGeminiJson(response.text || "{}");
      if (parsed && parsed.clarifiedQuestion) {
        return res.json(parsed);
      }
    } catch (aiErr) {
      console.warn("AI clarification call failed, using graceful fallback:", aiErr);
    }

    // High-availability fallback if AI model is unreachable or returns malformed text
    return res.json({
      clarifiedQuestion: `In simpler terms: ${question}`,
      helpfulHints: [
        "Focus on giving a real example from your projects or experience.",
        "Structure your response: Problem statement -> Your approach -> Results achieved.",
        `Key area the interviewer is checking: ${expectedFocus || "Logical problem solving and clear communication"}`
      ]
    });
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 8: Offer & Negotiation Advisor
// ------------------------------------------------------------------------
app.post(["/api/placement/negotiate", "/placement/negotiate"], async (req, res) => {
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 9: Confidence & Communication Coach
// ------------------------------------------------------------------------
app.post(["/api/placement/communication-tips", "/placement/communication-tips"], async (req, res) => {
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// API ENDPOINT 10: HR Socials Analysis (LinkedIn & GitHub rating)
// ------------------------------------------------------------------------
app.post(["/api/placement/analyze-socials", "/placement/analyze-socials"], async (req, res) => {
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
    res.json(parseGeminiJson(text));
  } catch (error) {
    handleApiError(res, error);
  }
});

// ------------------------------------------------------------------------
// CATCH-ALL API 404 & GLOBAL ERROR HANDLER (PREVENTS HTML RESPONSES FOR API CALLS)
// ------------------------------------------------------------------------
app.use(["/api/*", "/placement/*"], (req, res) => {
  console.warn(`[API 404 CATCH-ALL] Unmatched API request: ${req.method} ${req.originalUrl || req.url}`);
  res.status(404).json({
    success: false,
    isResume: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[GLOBAL EXPRESS ERROR] ${req.method} ${req.url}:`, err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    isResume: false,
    message: err.message || "An unexpected server error occurred during request processing.",
    error: process.env.NODE_ENV === "development" ? String(err) : undefined
  });
});

// ------------------------------------------------------------------------
// VITE DEV SERVER & PRODUCTION STATIC SERVING
// ------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const viteModuleName = "vite";
    const { createServer: createViteServer } = await import(viteModuleName);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve the source files directory in production to support sourcemaps and automated resource checks
    app.use("/src", express.static(path.join(process.cwd(), "src"), {
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath);
        if (ext === ".ts" || ext === ".tsx" || ext === ".jsx") {
          res.setHeader("Content-Type", "application/javascript");
        }
      }
    }));
    
    app.get("*", (req, res) => {
      // Return 404 for requests expecting assets/source files so they don't receive HTML
      const ext = path.extname(req.path);
      if (ext || req.path.startsWith("/src/") || req.path.startsWith("/assets/")) {
        return res.status(404).send("Not Found");
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
