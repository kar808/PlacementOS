# VORYNEXA — MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Document Version:** 1.0.0  
**Status:** Official Product Blueprint & Engineering Standard  
**Target Audience:** Product Management, Software Engineering, Design, QA, DevOps, Security & Executive Leadership  
**Last Updated:** July 2026  

---

## SECTION 1: Executive Product Overview

### Purpose
Vorynexa is an enterprise-grade **AI Career Operating System (Career OS)** engineered to unify the entire career development lifecycle. Rather than acting as a collection of fragmented, single-utility tools, Vorynexa provides an integrated ecosystem that actively guides candidates from career discovery, skill development, and resume engineering through AI mock interview preparation, job application tracking, offer negotiation, and long-term career growth.

### Vision
To serve as the global standard for professional talent readiness and AI-driven career guidance—delivering an autonomous personal career agent for every candidate that eliminates ambiguity and turns effort into measurable career velocity.

### Business & Operational Objectives
1. **Unify Career Workflows:** Consolidate resume building, ATS parsing, skill gap roadmapping, voice mock interviews, LinkedIn auditing, and application tracking into a single, seamless platform.
2. **Maximize Candidate Conversion:** Achieve a 3x increase in candidate recruiter callback rates by delivering ATS-optimized profiles and voice-verified interview readiness.
3. **Institutional Scale:** Enable academic institutions (universities, colleges, bootcamps) to automate placement cell operations, track cohort readiness analytics, and boost placement rates.
4. **SaaS Revenue Engine:** Establish a high-margin B2C freemium and B2B campus enterprise subscription model with robust customer lifetime value (LTV) metrics.

### Target Users & Primary Problems
* **Students & Fresh Graduates:** Facing placement panic, lack of directional clarity, generic resumes, and poor interview speech fluency under pressure.
* **Working Professionals & Career Switchers:** Experiencing tight preparation time windows, imposter syndrome, and difficulty converting past experience into new tech role bullet points.
* **Recruiters & Talent Acquisition Teams:** Overwhelmed by thousands of low-quality generic resumes, incurring high screening costs and long time-to-hire cycles.
* **University Placement Officers (TPOs):** Lacking real-time data visibility into student preparation habits, cohort skill deficiencies, and automated placement reporting.

### Expected Outcomes
* **Zero Career Ambiguity:** Every user receives an immediate answer to "What is my highest-impact action today?" via the 5-point Decision Support Matrix.
* **Data-Backed Readiness:** Candidate progress is tracked via an objective, multi-factor Readiness Index score (0–100%).
* **Production Reliability:** 99.9% uptime, zero unhandled client-side exceptions, and instant multi-backend failover sync.

---

## SECTION 2: Product Principles

1. **Simplicity Over Complexity:** Clear, actionable next steps always take precedence over static content overload or dense dashboard clutter.
2. **Radical Candor & High Integrity:** Uncompromising, honest HR ratings and ATS evaluations over sugarcoated false praise.
3. **Trust & Privacy First:** Candidate resume data, speech transcripts, and career targets are encrypted, private, and never used to train public AI models.
4. **AI-First & Value-Driven:** AI capabilities must directly reduce manual friction, improve recommendations, or coach communication—never added as superficial gimmicks.
5. **Sub-Second Speed & Responsiveness:** Instant UI state updates, optimistic data updates, and lazy-loaded heavy voice/canvas modules.
6. **Accessibility (WCAG 2.1 AA):** Full keyboard navigability, high color contrast, screen reader aria-labels, and fluid responsive scaling across mobile, tablet, and desktop.
7. **Architectural Reliability:** Dual-persistence state sync (Firestore & Supabase), graceful error boundaries, offline fallbacks, and zero white-screen crashes.
8. **Consistent Visual Craft:** Dark luxury aesthetic system, mathematical padding scales, standardized typography hierarchy, and zero "AI Slop" templates.

---

## SECTION 3: User Personas

### Persona 1: Student / Fresh Graduate (Rohan, 21)
* **Goal:** Secure a campus placement or off-campus entry-level Software Engineer offer ($80k+ / ₹12-18 LPA).
* **Pain Points:** Overwhelmed by fragmented advice, gets rejected by ATS screeners, freezes during live voice interviews.
* **Motivations:** Wants a daily 15-minute structured sprint so he knows his effort is aligned with recruiter expectations.
* **Workflow:** Daily login ➔ Complete 15-min sprint ➔ Practice 1 AI mock interview ➔ Refine resume bullets based on AI score.
* **Success Metric:** Reaching an 85%+ Overall Career Readiness Index and securing 3+ recruiter screening calls.

### Persona 2: Career Switcher / Working Professional (Ananya, 27)
* **Goal:** Transition from Operations Associate to Junior Frontend / Full-Stack Developer within 6 months.
* **Pain Points:** Only has 45 minutes a day after work; struggles to frame non-CS background into technical achievements.
* **Motivations:** Needs high efficiency—wants to learn only the exact skills and interview patterns target companies test for.
* **Workflow:** Evening login ➔ Review AI Roadmap gap analysis ➔ Work through targeted project advisor suggestions ➔ Generate tailored cover letter.
* **Success Metric:** Converting past projects into ATS-passing resumes and passing technical screening rounds.

### Persona 3: University Placement Officer / TPO (Prof. Sharma, 52)
* **Goal:** Achieve a 90%+ placement rate for a cohort of 500+ engineering students.
* **Pain Points:** Manual tracking in Google Sheets is broken; impossible to provide 1-on-1 coaching to hundreds of candidates.
* **Motivations:** Wants an admin dashboard to instantly spot weak students before campus hiring drives begin.
* **Workflow:** Weekly login ➔ Export cohort skill gap report ➔ Identify at-risk students (<50% readiness score) ➔ Send targeted preparation notices.
* **Success Metric:** Increasing campus placement percentage by 15% year-over-year.

### Persona 4: Enterprise Tech Recruiter (Sarah, 32)
* **Goal:** Source top 5% pre-screened technical talent with verified communication and coding skills.
* **Pain Points:** Receives 2,000+ unvetted resumes per posting; high candidate drop-off during preliminary HR calls.
* **Motivations:** Access a talent pool with pre-verified ATS scores, voice fluency metrics, and roadmap verification badges.
* **Workflow:** Weekly portal check ➔ Filter candidates by target role, readiness index, and verified skills ➔ Direct outreach to top candidates.
* **Success Metric:** Reducing time-to-hire by 50% and improving candidate interview pass rates.

---

## SECTION 4: Complete Feature Inventory

```
VORYNEXA ECOSYSTEM
├── 1. Landing Website & Marketing Engine (Public)
├── 2. Auth & Identity System (Custom Username, Vorynexa ID, Google OAuth)
├── 3. Onboarding Wizard & Goal Customizer (Multi-step Profile Engine)
├── 4. Decision Support Dashboard (The 5-Question Daily Matrix & Sprints)
├── 5. AI Career Agent & Assistant (Personalized Co-pilot)
├── 6. Resume Studio (Builder, AI Bullet Optimizer, ATS Parser & PDF Exporter)
├── 7. Interview Lab (Voice/Speech Simulator, STAR Behavioral & Technical Coach)
├── 8. Career Roadmap & Skill Gap Analyzer (Interactive Track Engine)
├── 9. HR Socials & Profile Rating (LinkedIn & GitHub Auditor)
├── 10. Job Search, Outreach & Negotiation Coach (Offer Maximizer)
├── 11. Project & Technical Advisor (Architecture & Code Reviewer)
├── 12. Placement Schedule & Milestone Calendar (Campus Drive Engine)
├── 13. Admin & Placement Officer Dashboard (Cohort Analytics & CSV Exports)
└── 14. Settings, Billing & Data Security Panel (Dual Persistence & Account Controls)
```

---

## SECTION 5: Detailed Feature Specifications

### 5.1 Resume Studio & ATS Analyzer
* **Purpose:** Enable candidates to build, analyze, optimize, and export ATS-compliant resumes tailored to target job descriptions.
* **Business Value:** High conversion trigger for B2C Pro upgrades; core deliverable demonstrating immediate user value.
* **User Value:** Eliminates rejection by automated ATS filters and transforms weak descriptions into high-impact, quantifiable bullets.
* **Functional Requirements:**
  1. Multi-section editor (Summary, Experience, Projects, Skills, Education, Certifications).
  2. Real-time AI Bullet Enhancer utilizing action-verb metrics (e.g., "Google XYZ formula").
  3. Job Description (JD) Matcher: Paste job description to generate instant match percentage (0–100%) and missing keyword checklist.
  4. Instant PDF generation with standard ATS-friendly layout guidelines.
* **Acceptance Criteria:** PDF export renders cleanly on standard A4/Letter size without wrapping or truncated text; ATS score calculates in <2.5 seconds.
* **Performance:** Real-time character/bullet linting (<100ms response).

### 5.2 Speech & Voice AI Interview Simulator
* **Purpose:** Conduct live interactive voice/speech mock interviews with real-time feedback on answer content, speech fluency, filler words, and sentiment.
* **Business Value:** Key competitive differentiator and high-engagement feature.
* **User Value:** Eliminates interview anxiety by practicing speech delivery under simulated pressure.
* **Functional Requirements:**
  1. WebRTC / Browser Speech-to-Text and Text-to-Speech integration with fallback to structured text input.
  2. Question categories: Technical Algorithms, System Design, Behavioral (STAR Method), HR Culture Fit.
  3. Post-interview feedback card detailing: Overall Score, Filler Word Count (e.g., "um", "like"), Clarity Rating, and Suggested Ideal Answer.
* **Acceptance Criteria:** Audio recording captures accurately; transcript renders within 1.5s of speech pause; feedback report generated instantly upon session end.

### 5.3 AI Career Roadmap & Skill Gap Engine
* **Purpose:** Generate a personalized, week-by-week learning and practice roadmap based on target role, current skills, and weekly available hours.
* **Business Value:** Drives daily retention and long-term user engagement.
* **User Value:** Replaces overwhelming options with a clear, step-by-step path to job readiness.
* **Functional Requirements:**
  1. Interactive node graph showing completed, in-progress, and locked skill milestones.
  2. One-click progress toggle with instant recalculation of readiness score.
  3. Contextual resource recommendations (curated articles, documentation links, and coding challenges).
* **Acceptance Criteria:** Roadmap dynamically updates when user edits profile skills or target role; state persists across devices.

---

## SECTION 6: Complete User Journey

```
[Visitor on Landing Page]
       │
       ▼
[Interactive Signup / Auth Screen] (Google / Username Login)
       │
       ▼
[Onboarding Wizard] (Target Role, Skill Survey, Available Hours, Deadline)
       │
       ▼
[Decision Support Dashboard] ◄────────────────────────────────────────┐
       │                                                             │
       ├──────► [Step 1: Check Roadmap & Skill Gap] ────────────────┤
       │                                                             │
       ├──────► [Step 2: Resume Studio ATS Optimization] ────────────┤ (Daily 15-Min
       │                                                             │  Career Sprint Loop)
       ├──────► [Step 3: Voice AI Mock Interview Practice] ──────────┤
       │                                                             │
       └──────► [Step 4: Job Outreach & Offer Negotiation] ──────────┘
```

---

## SECTION 7: User Stories & Acceptance Criteria

### US-01: Candidate Onboarding
* **User Story:** *As a new student, I want to complete a guided 3-step onboarding wizard so that Vorynexa can generate my custom readiness score and roadmap.*
* **Acceptance Criteria:**
  - Given a newly registered account, when the user logs in, they are immediately directed to `/onboarding`.
  - When the user selects "Software Engineer", inputs "React, Node.js", and sets "10 hrs/week", clicking "Complete Onboarding" creates their user profile record in Firestore/Supabase and routes them to `/dashboard`.

### US-02: Resume ATS Keyword Match
* **User Story:** *As a job applicant, I want to paste a job description against my resume so that I can see missing keywords before applying.*
* **Acceptance Criteria:**
  - Given an existing resume in Resume Studio, when the user pastes a target job description and clicks "Analyze ATS Match", the system returns a keyword breakdown (Found vs. Missing) and a score from 0 to 100 within 3 seconds.

### US-03: Voice Mock Interview
* **User Story:** *As a candidate preparing for interviews, I want to speak my answer to an AI interviewer so that I can get feedback on my speech tone and structure.*
* **Acceptance Criteria:**
  - Given an active session in Interview Simulator, when the user clicks "Start Recording" and speaks for 45 seconds, the audio transcript appears accurately, and clicking "Submit" generates a communication rating with filler word counts.

---

## SECTION 8: User Flows

### Flow 1: Resume Builder & ATS Analysis
1. User navigates to `/resume`.
2. System loads saved resume data from DB (or presents empty layout).
3. User edits experience section or clicks "AI Enhance Bullet".
4. User clicks "ATS Scan", enters target Job Title and JD.
5. AI processes text, updates ATS score gauge, and highlights missing keywords in amber.
6. User clicks "Export PDF" ➔ Clean, print-ready PDF downloads locally.

### Flow 2: Student Cohort Inspection (Admin / TPO)
1. Admin logs into `/admin`.
2. Admin Dashboard queries Firestore `users` and `placement_stats`.
3. Admin views high-level metrics: Total Students, Avg Readiness Index, At-Risk Count.
4. Admin filters student table by "Readiness < 50%".
5. Admin clicks "Export Cohort CSV" ➔ System generates downloadable CSV report.

---

## SECTION 9: Functional Requirements & Business Rules

1. **Authentication Rules:**
   - Password must be minimum 8 characters with at least 1 number and 1 special character.
   - User identity assigned a unique, immutable Vorynexa UUID upon creation.
2. **Dual-Persistence Sync:**
   - Client writes state to local cache immediately (optimistic UI update).
   - Async write pushed to Firebase Firestore.
   - Secondary backup write pushed to Supabase database with error catch fallback.
3. **AI Generation Limits:**
   - Free users: 3 AI Resume Scans / 2 Mock Interviews per day.
   - Pro users: Unlimited AI Resume Scans / Unlimited Mock Interviews.
   - Rate limit enforcement enforced via server-side API middleware (`/api/ai/*`).

---

## SECTION 10: Non-Functional Requirements

* **Performance:** Initial HTML/JS bundle payload <250KB compressed; First Contentful Paint (FCP) <1.2s; API route response latency <800ms.
* **Scalability:** System architecture capable of handling 50,000 concurrent active users and 5,000 simultaneous speech-to-text API requests.
* **Availability:** 99.9% uptime powered by Cloud Run container auto-scaling and multi-region database replication.
* **Security & Compliance:** SSL/TLS forced encryption in transit; AES-256 encryption at rest; zero storage of raw audio files beyond active session processing.
* **Accessibility:** Full compliance with WCAG 2.1 Level AA; screen reader navigable controls (`aria-expanded`, `aria-label`, `role="dialog"`).

---

## SECTION 11: Role-Based Access Control (RBAC)

| Role | Access Permissions |
| :--- | :--- |
| **Guest / Public** | View Landing Page, Public Features Preview, FAQs, Privacy Policy, Terms. |
| **Student / Candidate** | Access Personal Dashboard, Resume Studio, Interview Simulator, Roadmap, Outreach, Settings. |
| **Recruiter** | Access Recruiter Portal, Search Candidate Profiles, View Verified Readiness Scores. |
| **University Admin / TPO** | Access Admin Dashboard, Cohort Analytics, Student Management, CSV Exports. |
| **Super Admin** | System Configuration, User Management, Global AI Model Parameters, Platform Telemetry. |

---

## SECTION 12: Notification & Alert Architecture

* **In-App Toast System:** Real-time feedback for saved changes, background sync status, and API error recoveries.
* **Daily Mission Reminders:** Contextual in-app banner encouraging streak maintenance ("You are on a 5-Day Streak! Complete today's 15-min sprint").
* **Email System (Post-MVP Integration):** Weekly progress digest, cohort invitation notices, and account security alerts.

---

## SECTION 13: AI Engineering & Fallback Architecture

```
                  ┌─────────────────────────────────────────┐
                  │           CLIENT AI REQUEST             │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    EXPRESS SERVER-SIDE PROXY (/api/*)   │
                  │     (API Key Security & Rate Limiter)    │
                  └────────────────────┬────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
      ┌───────────────────────────┐         ┌───────────────────────────┐
      │  PRIMARY: Gemini 2.5 Flash│         │   FALLBACK: Gemini Pro    │
      │   (Fast JSON Schema)      │         │   (High Reasoning Engine) │
      └─────────────┬─────────────┘         └─────────────┬─────────────┘
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    JSON VALIDATOR & SANITIZER ENGINE    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   UI STATE UPDATE & FIRESTORE SYNC     │
                  └─────────────────────────────────────────┘
```

* **Model Allocation:** `@google/genai` SDK using `gemini-2.5-flash` for fast real-time structured output (JSON schema) and `gemini-2.5-pro` for deep complex project architectures.
* **Fallback Strategy:** If primary Gemini model API call times out (>5s) or returns rate-limit error 429, retry with exponential backoff up to 3 attempts, then gracefully fallback to local heuristic evaluation rules without breaking UI layout.

---

## SECTION 14: Analytics & Event Tracking

The system logs high-integrity telemetry events:
* `user_registered` (Method, UserID, Timestamp)
* `onboarding_completed` (TargetRole, HoursPerWeek)
* `resume_analyzed` (ATS_Score, MissingKeywordCount)
* `interview_session_completed` (SessionType, Score, FillerWords)
* `daily_sprint_completed` (StreakCount, UserID)
* `cohort_data_exported` (AdminID, StudentCount)

---

## SECTION 15: Security Architecture

1. **Zero Secret Exposure:** `GEMINI_API_KEY` and database admin credentials strictly locked inside server-side environment (`process.env`). Never exposed to browser bundle.
2. **Input Sanitization:** All user text inputs (resumes, job descriptions, chat prompts) sanitized against XSS injection attacks.
3. **Database Security Rules:** Firestore security rules enforce user-level isolation (`request.auth.uid == userId`), preventing unauthorized profile reads or modifications.

---

## SECTION 16: Performance Benchmarks & SLA

* **Page Load:** Initial DOM Interactive <800ms on standard 4G network.
* **AI Processing:** Resume ATS score return <2.5 seconds; Mock interview speech transcript feedback <1.8 seconds.
* **Memory Footprint:** Browser JS heap size remains under 85MB during extended 30-minute user sessions.

---

## SECTION 17: Error Handling & Resiliency Patterns

* **Boundary Isolation:** React `<AppErrorBoundary>` wraps major section views. If a component fails, only that panel shows a friendly retry button while the rest of the workspace remains interactive.
* **User-Facing Toast Error Handling:** Technical stack traces are captured in server logs while the user sees clean, helpful messages (e.g., *"We couldn't connect to the AI engine. Retrying automatically..."*).

---

## SECTION 18: Strategic Future Roadmap

* **Phase 1 (Current - Live V1.0):** Core AI Career OS, Decision Support Matrix, Resume Studio, Speech Mock Interview Simulator, Admin Dashboard, Firestore/Supabase dual persistence.
* **Phase 2 (Q4 2026):** Multi-modal video posture/eye-contact feedback in Interview Simulator, automated GitHub repository code quality scanner.
* **Phase 3 (Q1 2027):** Institutional Campus SaaS Portal with automated university SSO (SAML/OAuth) and recruiter matching hub.
* **Phase 4 (Q2 2027):** Mobile application companion (iOS/Android React Native) for quick daily mission sprints on the go.

---

## SECTION 19: Product KPIs & Business Health Metrics

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VORYNEXA HEALTH SCOREBOARD                        │
├────────────────────────┬──────────────────────┬────────────────────────┤
│ Metric                 │ Target Benchmark     │ Measurement Frequency  │
├────────────────────────┼──────────────────────┼────────────────────────┤
│ Onboarding Completion  │ > 85%                │ Daily                  │
│ Daily Mission Sprints  │ > 60% Active Users   │ Daily                  │
│ 30-Day User Retention  │ > 45%                │ Monthly                │
│ Resume Score Lift      │ +30 Points Average   │ Per Session            │
│ Free-to-Paid Conversion│ > 4.5%               │ Monthly                │
│ System SLA Uptime      │ 99.9%                │ Continuous Real-Time   │
└────────────────────────┴──────────────────────┴────────────────────────┘
```

---

## SECTION 20: Final Product Audit & Strategic Assurance

### Audit Summary
A comprehensive end-to-end review of the Vorynexa codebase and platform architecture confirms:
1. **Core Feature Parity:** 100% alignment across all requested modules—Landing Page, Onboarding, Decision Support Dashboard, AI Agent, Resume Studio, Interview Simulator, Roadmap Engine, Project Advisor, Communication Coach, Negotiation Coach, Placement Calendar, and Admin Analytics.
2. **Zero Technical Regression:** Production build passes all TypeScript type checks and linter rules with zero fatal errors.
3. **Enterprise Compliance:** Fully satisfies all requirements defined in the Founder Constitution, Master PRD, and Engineering Blueprint.

**Signed off by Product & Engineering Leadership:**  
*Vorynexa Chief Product Officer & Chief Technology Officer*  
*July 2026*
