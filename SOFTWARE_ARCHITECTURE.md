# VORYNEXA — SOFTWARE ARCHITECTURE BIBLE & ENGINEERING STANDARD

**Document Version:** 1.0.0  
**Status:** Official Technical Architecture & Software Engineering Standard  
**Classification:** Enterprise Engineering Blueprint & System Architecture  
**Last Updated:** July 2026  

---

## SECTION 1: Executive Architecture Overview

### System Architecture Paradigm
Vorynexa is engineered as a **Full-Stack Modular SaaS Platform** with a decoupled frontend interface, server-side secure API proxy layer, provider-agnostic AI intelligence abstraction, and dual-persistence synchronization.

The architecture is specifically designed to eliminate the common pitfalls of early AI startups—namely API key exposure in client bundles, tight coupling to a single LLM vendor, database single points of failure, and unhandled client-side runtime exceptions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (BROWSER / SPA)                    │
│   React 18 + Vite SPA + Tailwind CSS + motion/react + WebRTC Voice     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    API PROXY & EXPRESS SERVER (NODE.JS)                │
│    Express.js + Middleware + Rate Limiter + ESBuild Bundle (dist/server.cjs) │
└─────────┬─────────────────────────┬─────────────────────────┬──────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  AI ADAPTER      │      │ FIRESTORE DB     │      │ SUPABASE DB      │
│  @google/genai   │      │ (Primary Store)  │      │ (Failover Store) │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### Key Architectural Decisions
1. **Full-Stack Express + React SPA Architecture:** Port 3000 ingress with Vite development middleware and compiled CommonJS (`dist/server.cjs`) production execution.
2. **Server-Side API Gateway:** All Gemini API keys, third-party tokens, and database secret credentials remain strictly locked on the server side (`process.env`).
3. **Dual Persistence Engine:** Firebase Firestore serves as the primary real-time document store, synchronized alongside Supabase PostgreSQL for failover security and relational analytical queries.
4. **Provider-Agnostic AI Adapter Pattern:** AI capabilities (Resume ATS Engine, Voice Interview Simulator, Career Roadmap Generator) interact with a unified AI Service layer, supporting seamless model switching (Gemini 2.5 Flash / Pro) without impacting UI code.

---

## SECTION 2: Technology Stack & Technical Rationale

| Layer | Primary Technology | Technical Justification |
| :--- | :--- | :--- |
| **Frontend Runtime** | React 18, TypeScript, Vite | Sub-second build speeds, strong static typing, functional hook composition. |
| **Styling & Motion** | Tailwind CSS, motion/react | Utility-first CSS, zero bundle bloat, hardware-accelerated 60fps animations. |
| **Icons & Visuals** | Lucide-React, Recharts | Consistent vector iconography, WCAG compliant data charts. |
| **Backend Server** | Express.js, ESBuild, Node.js (v20+) | Native TypeScript type stripping, CJS compilation for container cold-start speed. |
| **Primary Database** | Google Cloud Firestore | Serverless NoSQL document store, real-time listeners, instant scalability. |
| **Secondary Database** | Supabase PostgreSQL | Relational queries, SQL schema strictness, Row Level Security (RLS) enforcement. |
| **AI Intelligence** | `@google/genai` TypeScript SDK | Modern Gemini API SDK supporting JSON schema output, streaming, and speech. |
| **Deployment Engine** | Cloud Run Containers / Vercel | Auto-scaling container infrastructure, sub-second cold starts, port 3000 reverse proxy. |

---

## SECTION 3: Repository & Directory Structure

Vorynexa follows a strict feature-driven modular structure:

```
/
├── .env.example               # Declared environment variables schema
├── AGENTS.md                  # Project rules & founder manifesto
├── COMPANY_FOUNDATION.md      # Official company blueprint
├── PRODUCT_REQUIREMENTS_DOCUMENT.md # Master PRD
├── DESIGN_SYSTEM.md           # Enterprise UI/UX Design System
├── SOFTWARE_ARCHITECTURE.md   # This Architecture Bible
├── metadata.json              # Applet capabilities & frame permissions
├── package.json               # Dependencies & build scripts
├── server.ts                  # Express backend entry point
├── firestore.rules            # Firebase Security Rules
├── src/
│   ├── main.tsx               # Client entry point
│   ├── App.tsx                # Primary application router & layout state
│   ├── types.ts               # Global TypeScript interfaces & enums
│   ├── components/            # Isolated UI & Feature Modules
│   │   ├── AdminDashboard.tsx # Cohort analytics & placement control
│   │   ├── UserDashboard.tsx  # Decision support matrix & daily goals
│   │   ├── ResumeBuilder.tsx  # ATS parser & AI bullet enhancer
│   │   ├── InterviewSimulator.tsx # Voice AI interview simulator
│   │   ├── RoadmapView.tsx    # Interactive skill roadmap
│   │   ├── LandingPage.tsx    # Public marketing & lead magnet
│   │   └── ...                # Dedicated sub-components
│   ├── lib/                   # Database adapters, Firebase & Supabase SDKs
│   ├── services/              # Server-side API connectors & AI client wrappers
│   └── utils/                 # Utility functions, text parsers & helpers
```

---

## SECTION 4: Frontend Architecture & React State Management

### Component Isolation & Types
1. **Explicit TypeScript Props:** Every component interface is declared at the top of the file or in `/src/types.ts`. The use of `any` is strictly prohibited.
2. **State Hierarchy:**
   - **Local State (`useState`):** Form inputs, modal toggles, accordion expansions.
   - **Persistent User State (`userProfile`, `resumeData`):** Lifted to `App.tsx` context with optimistic local caching and background Firestore sync.
   - **UI Flags (`isLoading`, `error`):** Explicit state handlers ensuring zero silent failures or unrendered blank boxes.

### Error Isolation & Boundaries
Every major route view is wrapped inside `<AppErrorBoundary>`. If an unhandled error occurs within a sub-component (e.g., audio API failure in Interview Simulator), the error boundary catches it, presents a friendly recovery button, and logs technical details to server telemetry without crashing the user dashboard.

---

## SECTION 5: Backend & API Proxy Architecture

### Server Entry Point (`server.ts`)
```typescript
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side secure Gemini AI proxy route
app.post("/api/ai/generate", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key not configured on server" });
    }
    const ai = new GoogleGenAI({ apiKey });
    // AI processing execution...
  } catch (error: any) {
    res.status(500).json({ error: error.message || "AI generation failed" });
  }
});
```

---

## SECTION 6: Database Architecture & Schema Design

### Primary Store: Firestore Collection Schemas

#### Collection: `users` (Document ID: `{userId}`)
```typescript
interface UserProfileDoc {
  id: string;
  email: string;
  fullName: string;
  targetRoles: string[];
  technicalSkills: string[];
  softSkills: string[];
  experienceLevel: "student" | "entry" | "mid" | "senior";
  studyHoursPerWeek: number;
  placementDeadline: string;
  readinessScore: number;
  createdAt: string;
  updatedAt: string;
}
```

#### Collection: `resumes` (Document ID: `{resumeId}`)
```typescript
interface ResumeDoc {
  id: string;
  userId: string;
  personalInfo: { fullName: string; email: string; phone: string; linkedin: string; github: string };
  summary: string;
  experience: Array<{ company: string; role: string; duration: string; bullets: string[] }>;
  projects: Array<{ title: string; techStack: string[]; description: string }>;
  education: Array<{ degree: string; institution: string; year: string }>;
  skills: string[];
  atsScore: number;
  missingKeywords: string[];
  updatedAt: string;
}
```

---

## SECTION 7: Authentication & Authorization Strategy

1. **Authentication Flow:**
   - Supports Google OAuth and Custom Username/Vorynexa Internal ID.
   - Tokens verified server-side via Firebase Admin SDK / Supabase Auth middleware.
2. **Role-Based Access Control (RBAC):**
   - `Student`: Access personal roadmaps, resume studio, interview lab, and job outreach.
   - `Admin`: Access cohort placement analytics, candidate performance logs, and CSV data export controls.
3. **Database Security Rules (`firestore.rules`):**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /admin/{document=**} {
         allow read, write: if request.auth.token.admin == true;
       }
     }
   }
   ```

---

## SECTION 8: AI Layer Architecture & Prompt Engineering

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI REQUEST PROCESSOR                            │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Inject User Context (Target Role, Current Skills, Resume Text)     │
│ 2. Enforce Strict Output Schema (responseSchema: { type: "OBJECT" })  │
│ 3. Execute Primary Model (gemini-2.5-flash)                            │
│ 4. Fallback Model on Rate Limit / Error (gemini-2.5-pro)               │
│ 5. Sanitize & Validate Output JSON                                     │
└────────────────────────────────────────────────────────────────────────┘
```

### Prompt Engineering Guidelines
* **Strict JSON Enforcement:** Every AI prompt explicitly specifies structured JSON output rules to prevent conversational markdown wrapping when building structured data (e.g., roadmap nodes or ATS keywords).
* **System Persona:** Prompts instruct the AI to act as an *Elite Senior Tech Recruiter and Systems Architect*, delivering candid, actionable evaluations rather than generic praise.

---

## SECTION 9: Dual Persistence & Offline Synchronization

Vorynexa implements a **Fail-Safe Multi-Backend Sync** strategy:
1. **Optimistic Local Execution:** Client state updates instantly in React memory for zero-latency UI interactions.
2. **Primary Firestore Write:** Async dispatch writes updated state to Firebase Firestore.
3. **Secondary Supabase Fallback:** If Firestore encounters network issues or quota limits, the client writes data to Supabase database tables, logging warning metrics without throwing unhandled exceptions.

---

## SECTION 10: Security Architecture & OWASP Hardening

1. **Secret Isolation:** Zero raw secrets inside `.js`/`.ts` client code. Verified via build linter.
2. **XSS & Injection Protection:** All user inputs sanitized before rendering or passing to AI model prompts.
3. **CORS & Ingress Security:** Server restricts API route access to authorized origin domains.
4. **Content Security Policy (CSP):** Disallows inline scripts in production execution builds.

---

## SECTION 11: Observability, Logging & Telemetry

* **Structured Logging:** Express API routes format errors into structured JSON with timestamps, request paths, and status codes.
* **Telemetry Telemetrics:** Track client side events (`resume_analyzed`, `interview_session_completed`, `daily_sprint_completed`) for product usage analytics.
* **Health Checks:** `/api/health` endpoint monitored continuously for platform SLA compliance.

---

## SECTION 12: Performance Benchmarks & SLAs

* **Build Bundle Optimization:** Single, bundled CommonJS server (`dist/server.cjs`) output via `esbuild` for ultra-fast Node container startups.
* **Sub-Second API Response:** Cached roadmap nodes and ATS score lookups execute in <800ms.
* **Code Splitting:** Lazy loading of heavy secondary modules (Recharts, WebRTC speech recorder) to keep initial bundle size under 250KB.

---

## SECTION 13: CI/CD Pipeline & Deployment Flow

```
[Git Commit / PR] ➔ [Lint Checks (tsc --noEmit)] ➔ [Production Build (npm run build)] ➔ [Container Deployment (Cloud Run)] ➔ [Live SLA Verification]
```

1. **Pre-Commit Verification:** Run `lint_applet` to catch type errors and broken imports.
2. **Build Phase:** `vite build` produces static SPA artifacts in `dist/` while `esbuild` compiles `server.ts` into CommonJS `dist/server.cjs`.
3. **Production Start:** Container executes `node dist/server.cjs` binding to `0.0.0.0:3000`.

---

## SECTION 14: Future Architecture Evolution Roadmap

* **Phase 1 (Live Current V1.0):** Modular Full-Stack Express + React SPA, Dual Persistence (Firestore + Supabase), Gemini 2.5 Flash API proxy, Voice Simulator, Decision Matrix.
* **Phase 2 (Q4 2026):** Native WebRTC multi-modal video/audio streaming integration for AI posture & eye-contact evaluation.
* **Phase 3 (Q1 2027):** Enterprise SSO (SAML 2.0 / Okta) for campus university deployments and automated recruiter ATS webhook connectors.

---

**Approved by Engineering Leadership:**  
*Vorynexa Chief Technology Officer & Software Architecture Council*  
*July 2026*
