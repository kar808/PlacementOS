# VORYNEXA — API ARCHITECTURE & ENGINEERING STANDARDS BIBLE

**Document Version:** 1.0.0  
**Status:** Official Engineering Handbook & Code Standard  
**Classification:** Enterprise Engineering Specification  
**Target Audience:** Software Engineers, System Architects, QA Engineers, DevOps & Engineering Leadership  
**Last Updated:** July 2026  

---

## SECTION 1: Executive Engineering Overview

### Engineering Philosophy
Vorynexa is an enterprise-grade AI Career Operating System. Engineering at Vorynexa is guided by five foundational principles:

1. **Craftsmanship & Type Safety:** Clean, self-documenting TypeScript code with strict compiler flags (`noImplicitAny`, `strictNullChecks`). Zero reliance on loose `any` types.
2. **Defensive Programming & Fail-Safe Architecture:** Every external call (API, AI LLM provider, database) must handle timeouts, rate limits, and network dropouts gracefully without crashing the client UI.
3. **Sub-Second Latency & Optimistic State:** UI components update state optimistically while dispatching background API sync tasks, ensuring instant visual feedback for the user.
4. **Security by Isolation:** Secrets (`GEMINI_API_KEY`, database admin keys, OAuth secrets) are strictly isolated on the server side (`process.env`). They are never exposed to browser client bundles.
5. **Decoupled Provider Architecture:** AI models, persistent storage backends, and external services are wrapped behind standardized service interfaces, enabling seamless provider replacement or failover.

---

## SECTION 2: API Design Principles

Vorynexa's RESTful API conforms to the OpenAPI 3.0 specification guidelines:

### Resource Naming & URI Conventions
* **Plural Nouns for Resources:** URIs identify resources using plural nouns (`/api/v1/resumes`, `/api/v1/interviews`, `/api/v1/users`).
* **Kebab-Case Path Names:** Path segments use lowercase kebab-case (`/api/v1/mock-interviews`, `/api/v1/daily-sprints`).
* **Resource Hierarchy:** Sub-resources reflect natural parent-child relationships (`/api/v1/mock-interviews/{interviewId}/answers`).

### Standard HTTP Verbs

| Verb | Usage | Idempotent | Success Code |
| :--- | :--- | :--- | :--- |
| **GET** | Retrieve resource or collection | Yes | `200 OK` |
| **POST** | Create a new resource or trigger an AI action | No | `201 Created` / `200 OK` |
| **PUT** | Replace an existing resource completely | Yes | `200 OK` |
| **PATCH** | Partially update a resource | No | `200 OK` |
| **DELETE** | Remove a resource (soft-delete preferred) | Yes | `200 OK` / `204 No Content` |

---

## SECTION 3: Standard API Response Format

All API routes return a unified JSON payload structure:

### Standard Success Response
```json
{
  "success": true,
  "data": {
    "resumeId": "res_8f9a2b1c",
    "atsScore": 88,
    "missingKeywords": ["GraphQL", "Docker"]
  },
  "error": null,
  "meta": {
    "timestamp": "2026-07-23T04:50:00Z",
    "requestId": "req_vorynexa_99201a",
    "version": "v1"
  }
}
```

### Standard Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      {
        "field": "targetRole",
        "issue": "targetRole is required and must be a string"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-23T04:50:00Z",
    "requestId": "req_vorynexa_99201b",
    "version": "v1"
  }
}
```

---

## SECTION 4: API Versioning Strategy

* **URL Path Versioning:** All public and internal API endpoints include explicit version prefixes (`/api/v1/*`, `/api/v2/*`).
* **Deprecation Policy:** Major breaking changes trigger a new API version. Older endpoints remain supported for a minimum 6-month deprecation window with `Sunset` and `Deprecation` HTTP headers.

---

## SECTION 5: Authentication & Session Management

1. **Server-Side Authentication Proxy:** Requests to secured endpoints pass a Bearer JWT or Vorynexa Session Token in the HTTP `Authorization` header (`Authorization: Bearer <token>`).
2. **Session Verification Middleware (`server.ts`):**
```typescript
import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

export function authenticateSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      data: null,
      error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" },
      meta: { timestamp: new Date().toISOString(), requestId: req.headers["x-request-id"] || "req_anon" }
    });
  }
  
  const token = authHeader.split(" ")[1];
  // Verify token against Firebase Admin / Supabase JWT...
  req.user = { uid: "usr_123", email: "candidate@vorynexa.com", role: "student" };
  next();
}
```

---

## SECTION 6: Authorization Standards (RBAC)

Vorynexa enforces strict Role-Based Access Control (RBAC) across API routes:

```typescript
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { code: "FORBIDDEN", message: "Insufficient permissions to access this resource" },
        meta: { timestamp: new Date().toISOString() }
      });
    }
    next();
  };
}
```

---

## SECTION 7: Input Validation & Sanitization

1. **Schema Validation:** All incoming request bodies are validated using Zod / JSON schemas prior to business logic processing.
2. **XSS Sanitization:** User text strings are sanitized against malicious script tags or prompt injection overrides.

```typescript
import { z } from "zod";

export const ResumeScanRequestSchema = z.object({
  targetRole: z.string().min(2, "Target role is required"),
  jobDescription: z.string().min(20, "Job description must be at least 20 characters"),
  resumeText: z.string().min(50, "Resume text must be at least 50 characters")
});
```

---

## SECTION 8: Error Handling Standards

* **Zero Unhandled Promise Rejections:** All async route handlers wrap execution in `try-catch` blocks or use an async error handler wrapper.
* **No Stack Traces in Production:** Stack traces are captured in server logs (`console.error` / Cloud Logging) but never returned in user-facing JSON responses.

---

## SECTION 9: Folder Structure & Naming Conventions

### File & Directory Naming Rules
* **React Components:** PascalCase (`UserDashboard.tsx`, `ResumeBuilder.tsx`).
* **Utility Modules & Services:** camelCase (`geminiAdapter.ts`, `formatters.ts`).
* **Type Interfaces & Enums:** PascalCase (`UserProfile`, `UserRole`, `ATSScanResult`).
* **CSS & Styles:** Utility classes via Tailwind CSS (`index.css`).

---

## SECTION 10: Code Quality Standards & TypeScript Discipline

* **Strict Compilation:** `tsconfig.json` enforces `"strict": true`, `"noImplicitAny": true`, `"noUnusedLocals": true`.
* **DRY (Don't Repeat Yourself):** Shared utility functions reside in `/src/lib/` or `/src/utils/`.
* **Explicit Function Return Types:** All exported functions specify explicit TypeScript return types.

---

## SECTION 11: Frontend Engineering Standards

1. **Component Modularization:** Components are restricted to <300 lines of code. Larger views are broken into sub-components under `/src/components/`.
2. **React Hooks Discipline:** `useEffect` dependencies must be primitive values or stabilized via `useCallback`/`useMemo` to prevent infinite render loops.
3. **Accessibility (a11y):** All interactive elements include proper `aria-label`, `role`, and keyboard focus indicators.

---

## SECTION 12: Backend Engineering Standards

1. **Single Entry Execution (`server.ts`):** Express app initializes API middleware, handles static SPA fallback, and binds to `0.0.0.0:3000`.
2. **Build Compilation:** Backend TypeScript is compiled into `dist/server.cjs` via `esbuild` for maximum container execution speed.

---

## SECTION 13: AI Service Engineering Standards

1. **Server Proxy Isolation:** Client code dispatches requests to `/api/ai/*`. The Gemini API client executes strictly on the server.
2. **Structured JSON Validation:** AI responses pass through schema verification before being dispatched back to the UI.

---

## SECTION 14: Security Standards & Secrets Governance

1. **Zero Client Secrets:** Search client code bundles for `GEMINI_API_KEY` or database master keys. Verify zero exposure.
2. **CORS Hardening:** API headers restrict cross-origin requests to trusted Vorynexa domains.

---

## SECTION 15: Performance Benchmarks & SLAs

* **API Response Target:** Non-AI CRUD operations respond in <150ms; AI processing endpoints respond in <2.0s.
* **Lighthouse Score:** Web Vitals Performance >90, Accessibility 100, Best Practices 100.

---

## SECTION 16: Git & Development Workflow

* **Branching Model:** `main` (Production), `feature/<feature-name>` (Short-lived topic branches).
* **Commit Message Format:** Conventional Commits (`feat: add resume ATS scanner`, `fix: handle null voice transcript`).

---

## SECTION 17: Engineering Governance & Audit Checklist

Before releasing any new component or feature:
1. Run `lint_applet` ➔ Confirm zero TypeScript compilation or linter errors.
2. Run `compile_applet` ➔ Confirm clean production build output.
3. Test empty, loading, error, and offline recovery states.

---

**Approved by Engineering Leadership:**  
*Vorynexa Chief Technology Officer & Engineering Standards Council*  
*July 2026*
