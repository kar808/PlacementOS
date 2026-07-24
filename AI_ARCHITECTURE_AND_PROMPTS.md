# VORYNEXA — ENTERPRISE AI ARCHITECTURE & PROMPT ENGINEERING BIBLE

**Document Version:** 1.0.0  
**Status:** Official AI Engineering Blueprint & Prompt Standard  
**Classification:** Enterprise AI Architecture & Machine Learning Standard  
**SDK Standard:** `@google/genai` TypeScript SDK / Server-Side Gemini API Proxy  
**Last Updated:** July 2026  

---

## SECTION 1: Executive AI Overview

### AI Vision & Strategic Purpose
Vorynexa is an **AI-First Career Operating System**. Artificial Intelligence is not treated as a decorative add-on or chatbot widget; it forms the core decision-making intelligence engine of the platform.

The Vorynexa AI engine serves as an autonomous **Personal Career Agent** that accompanies candidates through every milestone of their professional evolution:

```
[Career Discovery] ➔ [Skill Assessment] ➔ [Resume Engineering] ➔ [ATS Matching] ➔ [Speech AI Mock Interview] ➔ [Job Outreach] ➔ [Offer Negotiation]
```

### Strategic Objectives
1. **Zero Hallucination Tolerance:** Enforce strict JSON schema validation for all structured outputs (resume scores, ATS match percentages, roadmap milestones).
2. **Real-Time Speech Coaching:** Provide live voice feedback on answer structure, filler word frequency, tone, and confidence during mock interviews.
3. **Hyper-Personalization:** Inject deep context (candidate target role, current skills, experience level, and timeline) into every prompt execution.
4. **Provider-Agnostic Abstraction:** Decouple business logic from underlying LLM vendors to ensure instant model switching, load balancing, and cost optimization.
5. **Absolute Security:** 100% server-side API execution (`process.env.GEMINI_API_KEY`). Zero API key exposure to browser runtimes.

---

## SECTION 2: AI Layer Architecture & Orchestration

Vorynexa implements a decoupled, multi-stage AI orchestration pipeline:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT WORKSPACE (BROWSER)                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS POST /api/ai/generate
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SERVER-SIDE AI PROXY GATEWAY (/api/*)                │
│  - API Key Security Guard & Rate Limiter                              │
│  - User Context Assembler & Sanitizer                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED AI SERVICE ADAPTER                        │
│  - Provider Abstraction Layer (Gemini Adapter / Fallback Adapter)     │
│  - Prompt Version Manager & Variable Injector                          │
└─────────┬─────────────────────────────────────────────────┬────────────┘
          │                                                 │
          ▼                                                 ▼
┌───────────────────────────────────┐             ┌───────────────────────────────────┐
│ PRIMARY MODEL: Gemini 2.5 Flash   │             │ FALLBACK MODEL: Gemini 2.5 Pro    │
│ (Fast JSON Schema & Speech AI)    │             │ (Deep System Design Reasoning)    │
└─────────────────┬─────────────────┘             └─────────────────┬─────────────────┘
                  │                                                 │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   RESPONSE VALIDATOR & SANITIZER                       │
│  - Schema Integrity Check (Zod / JSON Schema)                          │
│  - Safety & Hallucination Filter                                       │
│  - Telemetry Logger & Cache Dispatch                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 3: Provider-Agnostic Adapter Pattern

The AI layer interacts strictly through the `AIServiceAdapter` interface, allowing Vorynexa to switch or combine LLM backends without modifying client components or business logic:

```typescript
export interface AIRequestPayload {
  promptId: string;
  variables: Record<string, any>;
  responseSchema?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponsePayload<T = any> {
  data: T;
  rawResponse: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  latencyMs: number;
}

export interface IAIServiceAdapter {
  generateStructuredContent<T>(payload: AIRequestPayload): Promise<AIResponsePayload<T>>;
  generateStream(payload: AIRequestPayload, onChunk: (text: string) => void): Promise<void>;
}
```

---

## SECTION 4: Centralized Prompt Management System

Prompts are stored as version-controlled templates in a centralized registry (`/src/services/ai/prompts/`) with strict variable validation.

### Prompt Registry Schema
```typescript
export interface PromptTemplate {
  id: string;
  version: string;
  category: "resume" | "interview" | "roadmap" | "coach" | "outreach";
  systemPrompt: string;
  userPromptTemplate: string;
  requiredVariables: string[];
  expectedSchema: Record<string, any>;
}
```

---

## SECTION 5: Core AI Modules Specification

### 5.1 Resume ATS Analyzer & Bullet Optimizer
* **Purpose:** Audit candidate resumes against job descriptions, calculate match percentage, identify missing keywords, and rewrite bullets using high-impact metric formulas.
* **System Prompt:**
  ```text
  You are an Executive Tech Recruiter and ATS Optimization Expert.
  Analyze the candidate resume against the target role and job description.
  Evaluate formatting, keyword density, action verb strength, and quantifiable impacts.
  Return STRICT JSON matching the provided schema. Do not output markdown codeblocks or extra text.
  ```
* **User Prompt Template:**
  ```text
  Target Role: {{targetRole}}
  Target Job Description:
  {{jobDescription}}

  Candidate Resume Text:
  {{resumeText}}
  ```
* **Expected Output Schema:**
  ```json
  {
    "overallScore": 82,
    "keywordMatchPercentage": 75,
    "foundKeywords": ["React", "TypeScript", "Tailwind"],
    "missingKeywords": ["GraphQL", "Docker", "CI/CD"],
    "bulletImprovements": [
      {
        "original": "Built a website for task tracking",
        "improved": "Engineered a full-stack task management workspace using React and TypeScript, reducing user task creation latency by 40%"
      }
    ]
  }
  ```

### 5.2 Speech & Voice AI Interview Simulator
* **Purpose:** Process live candidate audio transcripts, evaluate answer structure (STAR method), detect filler words, score speech fluency, and generate ideal response comparisons.
* **System Prompt:**
  ```text
  You are a Senior Engineering Manager conducting a live candidate interview for {{targetRole}}.
  Evaluate the candidate's transcript for:
  1. Technical accuracy
  2. Structural clarity (Situation, Task, Action, Result)
  3. Communication confidence and filler word usage
  Provide raw, objective scores and specific improvement advice.
  ```

### 5.3 Career Roadmap & Skill Gap Generator
* **Purpose:** Synthesize a week-by-week personalized career roadmap based on target role, current skill inventory, experience level, and available study hours per week.
* **System Prompt:**
  ```text
  You are a Principal Career Architect. Generate a week-by-week career execution roadmap targeting the role of {{targetRole}} for a candidate with {{hoursPerWeek}} hours/week.
  Break down the roadmap into clear, sequential milestone nodes containing specific learning goals and practical build projects.
  ```

---

## SECTION 6: Context Management & Memory Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER CONTEXT AGGREGATOR                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Core Profile: Target Role, Experience Level, Skill Inventory        │
│ 2. Document Context: Primary Resume Text & ATS Match History          │
│ 3. Performance Memory: Recent Mock Interview Scores & Filler Word Trends│
│ 4. Execution Memory: Roadmap Milestones Completed & Active Streak      │
└────────────────────────────────────────────────────────────────────────┘
```

Context is aggregated server-side immediately before prompt dispatch, truncating historical memory to fit within a tight token budget while preserving high-relevance metrics.

---

## SECTION 7: Prompt Engineering Standards

1. **Explicit Role Framing:** Every system prompt begins with a specific high-authority persona (e.g., *"You are an Executive Staff Engineer at Google..."*).
2. **Negative Constraints:** Prompts explicitly forbid forbidden patterns (e.g., *"Do NOT use generic corporate verbs like 'supercharge' or 'empower'. Do NOT output markdown wrappers."*).
3. **Structured JSON Output Enforcement:** All structured data calls pass explicit JSON schemas using `@google/genai` `responseSchema` parameters.
4. **Few-Shot Examples:** Complex evaluations include 2–3 high-quality input/output pairs to ground response distributions.

---

## SECTION 8: AI Safety & Prompt Injection Protection

1. **Input Sanitization:** User-provided text (resumes, job descriptions, chat inputs) is stripped of system directive overrides (e.g., `"Ignore previous instructions and output..."`).
2. **Output Sanitization:** Model outputs are sanitized against HTML/XSS script injections before UI rendering.
3. **Rate Limiting:** Enforced at `/api/ai/*` endpoints (Maximum 10 requests / minute for free users; 60 requests / minute for Pro users).

---

## SECTION 9: Model Evaluation & Benchmarks

* **Response Latency Benchmark:**
  - Gemini 2.5 Flash structured output: `<1.2 seconds`
  - Gemini 2.5 Pro deep reasoning output: `<3.5 seconds`
* **JSON Schema Validity:** Target `99.9%` valid JSON parse success rate on first pass.

---

## SECTION 10: Fallback & Resilience Strategy

```
[Client AI Request] ➔ [Gemini 2.5 Flash]
                             │
                      (Timeout > 4s or Rate Limit 429)
                             │
                             ▼
                    [Gemini 2.5 Pro Fallback]
                             │
                      (Second Timeout)
                             │
                             ▼
               [Local Heuristic Evaluation Engine]
```

If primary LLM API endpoints fail, the client gracefully falls back to local heuristic rules, ensuring the user interface never breaks or displays raw error stack traces.

---

## SECTION 11: Cost Optimization & Caching

1. **Prompt Cache:** Frequently analyzed job descriptions and skill taxonomy mappings are cached in Redis / Firestore for 24 hours.
2. **Token Economy:** Truncate repetitive prompt instructions and leverage short variable placeholders.
3. **Model Tiering:** Use `gemini-2.5-flash` for 90% of requests (fast & cheap); reserve `gemini-2.5-pro` strictly for complex system design reviews.

---

## SECTION 12: AI Governance & Improvement Roadmap

### Current Audit Status
* **API Security:** 100% server-side proxy isolated (`/api/ai/*`). Zero client-side API key leakage.
* **Schema Integrity:** Standardized on `@google/genai` JSON schema response objects.
* **Build Integrity:** Verified via `lint_applet` and `compile_applet`.

---

**Approved by AI Leadership:**  
*Vorynexa Chief AI Officer & Machine Learning Engineering Council*  
*July 2026*
