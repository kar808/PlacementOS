# VORYNEXA — SECURITY, DEVOPS, RELIABILITY & OPERATIONS BIBLE

**Document Version:** 1.0.0  
**Status:** Official Production Operations Handbook & Infrastructure Standard  
**Classification:** Enterprise Infrastructure & Security Policy  
**Last Updated:** July 2026  

---

## SECTION 1: Executive Overview

### Operational Philosophy
Vorynexa operates on a **Zero-Trust, High-Availability, Continuous-Observability** model. As an AI-powered Career Operating System handling sensitive user career histories, resume assets, audio interview transcripts, and enterprise placement records, security and uptime are non-negotiable foundations of user trust.

### Core Operations Directives
1. **Zero-Trust Access Model:** All service-to-service communications, database queries, and client requests are authenticated, authorized, and logged.
2. **Infrastructure as Code (IaC):** Server configurations, container specs, network rules, and firewalls are version-controlled and reproducible.
3. **Automated Verification:** Every deployment passes linting, type-safety compilation, automated vulnerability scans, and health checks before routing production traffic.
4. **Self-Healing & Auto-Scaling:** Application containers automatically scale under load and recover from process crashes without manual operator intervention.
5. **Data Isolation & Encryption:** Data at rest is encrypted via AES-256; data in transit is encrypted via TLS 1.3. Secret keys never touch client runtimes.

---

## SECTION 2: Production Infrastructure Architecture

Vorynexa is deployed on a cloud-native, containerized Cloud Run / GCP infrastructure behind an Nginx reverse proxy layer:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC CLIENT ACCESS (HTTPS)                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ TLS 1.3 / Port 443
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   INGRESS & REVERSE PROXY LAYER (NGINX)                │
│  - Static Asset Caching & Compression                                  │
│  - Port 3000 Routing & SSL Termination                                 │
│  - Web Application Firewall (WAF) & Rate Limiter                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   APPLICATION CONTAINERS (CLOUD RUN / NODE)            │
│  - Express.js Backend Gateway + Vite SPA Fallback                       │
│  - Compiled Standalone Server (dist/server.cjs)                        │
│  - Auto-scaling (1 to 50 Instances)                                    │
└─────────┬─────────────────────────┬─────────────────────────┬──────────┘
          │                         │                         │
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  FIREBASE STORE  │      │ SUPABASE POSTGRES│      │ GEMINI AI PROXY  │
│  Real-time Sync  │      │ Relational DB    │      │ Server-Side SDK  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## SECTION 3: Environment Strategy & Secrets Governance

### Environments
* **Development (`dev`):** Local sandbox environment running Vite dev server on `0.0.0.0:3000`.
* **Staging / Preview (`staging`):** Ephemeral Cloud Run previews triggered on GitHub pull requests.
* **Production (`prod`):** High-availability production cluster serving live traffic.

### Secrets Governance Rules
1. **No Hardcoded Secrets:** `GEMINI_API_KEY`, database admin tokens, and OAuth client secrets are declared in `.env.example` and injected securely via GCP Secret Manager / environment variables at runtime.
2. **Least Privilege Service Accounts:** Application containers run under restricted IAM service accounts with access limited strictly to required database and AI endpoints.
3. **Secret Rotation Policy:** All production API keys and database tokens undergo automated or scheduled rotation every 90 days.

---

## SECTION 4: Deployment & CI/CD Pipeline Architecture

```
[Git Commit to Main] 
       │
       ▼
[Linting & Static Analysis] ➔ `npm run lint` (tsc --noEmit)
       │
       ▼
[Production Build Test]    ➔ `npm run build` (Vite + ESBuild dist/server.cjs)
       │
       ▼
[Security Vulnerability Audit] ➔ `npm audit` / Dependency Scan
       │
       ▼
[Container Image Compilation]  ➔ Docker build with node:20-alpine
       │
       ▼
[Zero-Downtime Deployment]     ➔ Cloud Run traffic migration to new revision
       │
       ▼
[Post-Deploy Health Check]     ➔ GET /api/health (200 OK verification)
```

---

## SECTION 5: Application & API Security

1. **Server-Side API Shielding:** Client components never initiate direct LLM calls using raw keys. All requests route through `/api/ai/*` server endpoints.
2. **Content Security Policy (CSP) & Headers:**
   ```http
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   X-Content-Type-Options: nosniff
   X-Frame-Options: SAMEORIGIN
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   ```
3. **Rate Limiting:**
   - Public IP / Auth Endpoints: 10 requests / minute.
   - Standard API / Resume Scans: 60 requests / minute.

---

## SECTION 6: Database Security & Backup Operations

1. **Row Level Security (RLS):** Supabase database policies enforce user tenant isolation (`auth.uid() = user_id`).
2. **Point-In-Time Recovery (PITR):** Continuous Write-Ahead Logging (WAL) enables point-in-time recovery to any second within the past 7 days.
3. **Encrypted Backups:** Daily full snapshot backups stored in isolated cross-region storage buckets with 30-day retention.

---

## SECTION 7: AI Operations & Safety Protocol

1. **Prompt Injection Guardrails:** User inputs (resumes, job descriptions) pass through sanitizer functions stripping system command overrides (e.g., `"Ignore previous instructions..."`).
2. **JSON Output Validation:** AI responses pass Zod schema validation before UI rendering. Malformed outputs trigger an automatic retry or fallback.
3. **Cost Control & Token Monitoring:** Track token consumption per feature (`resume_ats_scan`, `voice_interview`) to detect runaway loops or abnormal user activity.

---

## SECTION 8: Observability, Logging & Alerting

### Structured Logging Standard
All server logs are emitted in structured JSON format to stdout/stderr:
```json
{
  "timestamp": "2026-07-23T04:54:00.000Z",
  "severity": "ERROR",
  "requestId": "req_99a81b2c",
  "path": "/api/ai/generate",
  "message": "Gemini API rate limit exceeded",
  "statusCode": 429,
  "latencyMs": 1420
}
```

### Alert Thresholds
* **P1 Critical (Immediate On-Call Page):** HTTP 5xx error rate >2% for 5 minutes; `/api/health` failing.
* **P2 Warning (Slack/Email Notification):** AI API latency >3000ms; database CPU utilization >80%.

---

## SECTION 9: Incident Response & Disaster Recovery

### Incident Severity Levels
* **SEV-1 (Critical):** Core application down; users unable to access dashboard or resumes. Target Resolution: <30 mins.
* **SEV-2 (Major):** AI module degraded (e.g., Voice Simulator slow) with functional fallback active. Target Resolution: <2 hours.
* **SEV-3 (Minor):** Non-blocking visual defect or cosmetic error. Target Resolution: Next release cycle.

### Emergency Rollback Procedure
If a production deployment introduces a critical bug:
1. Trigger immediate revision rollback via Cloud Run CLI:
   `gcloud run services update-traffic vorynexa-app --to-revisions=PREVIOUS_REVISION=100`
2. Verify system recovery via `/api/health`.
3. Conduct post-mortem review and document root cause analysis (RCA).

---

## SECTION 10: Performance Operations & Service Level Agreements (SLAs)

* **Uptime Target:** 99.9% monthly availability (excluding scheduled maintenance).
* **Core Web Vitals Thresholds:**
  - First Contentful Paint (FCP): `<1.2s`
  - Largest Contentful Paint (LCP): `<2.2s`
  - Cumulative Layout Shift (CLS): `<0.05`
* **API Latency Target:** 95th percentile latency `<250ms` for standard CRUD; `<1800ms` for AI generation.

---

## SECTION 11: Production Verification & Audit Checklist

Before declaring production readiness for any version:
- [x] Run `lint_applet` ➔ Confirm zero TypeScript compilation or linter errors.
- [x] Run `compile_applet` ➔ Confirm successful production bundle generation (`dist/server.cjs`).
- [x] Verify `.env.example` contains all runtime environment variable declarations.
- [x] Verify `metadata.json` accurately reflects name, description, frame permissions, and major capabilities.
- [x] Confirm zero plain-text API keys or secrets in source code.

---

**Approved by Operations Leadership:**  
*Vorynexa Chief Information Security Officer & Operations Lead*  
*July 2026*
