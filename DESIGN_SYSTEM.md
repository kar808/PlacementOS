# VORYNEXA — ENTERPRISE UI/UX DESIGN SYSTEM & VISUAL SPECIFICATION

**Document Version:** 1.0.0  
**Status:** Official Corporate Design System & Design Tokens  
**Classification:** Product Design, Design Engineering & Frontend Architecture Standard  
**Last Updated:** July 2026  

---

## SECTION 1: Design Vision

### Long-Term Design Philosophy
Vorynexa's visual identity and interaction architecture are anchored in the concept of **"Quiet Precision & Autonomous Guidance"**. 

In an era saturated with hyper-vibrant, noisy "AI Slop" templates—characterized by rainbow gradients, floating 3D shapes, and distracting glassmorphism blur filters—Vorynexa takes a radically disciplined approach inspired by aviation instruments, high-frequency trading terminals, and world-class developer tools (Stripe, Linear, Vercel, Apple).

Every pixel, margin, color token, and animation serves a single purpose: **eliminating cognitive friction so candidates can execute high-leverage career actions with absolute confidence.**

### Emotional Experience Goals
When a candidate logs into Vorynexa, the UI must make them feel:
1. **In Control:** Calm, clear, and structured—counteracting placement and job search anxiety.
2. **Directed:** An instant, unambiguous sense of what needs to be done today without scrolling or searching.
3. **Respected:** Interacting with professional, high-integrity software that treats them as a serious candidate rather than a target for attention-economy monetization.
4. **Empowered:** Armed with state-of-the-art AI intelligence presented with absolute visual honesty.

---

## SECTION 2: Brand Identity & Visual Language

### Brand Personality Matrix
* **Tone:** Authoritative, direct, encouraging, precise.
* **Voice Style:** Concise, active voice ("Optimize Resume Bullet", "Start Voice Sprint") with zero corporate jargon or patronizing false praise.
* **Visual Aesthetic:** Dark luxury canvas (`#09090b`) contrasted against vivid, functional neon accents (Cyan `#06b6d4`, Emerald `#10b981`, Purple `#a855f7`).
* **Iconography:** Clean 1.5px stroke Lucide vector icons with strict semantic meaning.
* **Photography & Visual Assets:** High-contrast data visualizations, mathematical graphs, clean code blocks, and dark typography previews. Zero stock photos of smiling candidates or generic handshake images.

---

## SECTION 3: Color System & Tokens

Vorynexa utilizes a strictly governed, WCAG AA compliant color palette defined using Tailwind CSS variables and utility classes.

### Neutral Canvas & Surfaces
* **Background Canvas (Layer 0):** `bg-[#09090b]` / `zinc-950` — Deep slate canvas providing high contrast.
* **Card Surface (Layer 1):** `bg-[#111111]` / `zinc-900` — Primary container background.
* **Elevated Overlay (Layer 2):** `bg-[#18181b]` / `zinc-800` — Dropdown menus, tooltips, and modal surfaces.
* **Subtle Border Divider:** `border-white/10` or `border-zinc-800` — Clean 1px hairline dividers.
* **Subtle Hover Surface:** `hover:bg-white/5` — Gentle tactile feedback.

### Brand Functional Accents
* **Cyan Accent (Intelligence & Primary CTA):** `cyan-500` (`#06b6d4`)
  - *Usage:* Primary AI triggers, active nav indicators, key CTA highlights.
  - *Glow FX:* `shadow-lg shadow-cyan-500/20`
* **Emerald Accent (Success & Readiness):** `emerald-500` (`#10b981`)
  - *Usage:* High ATS scores, completed milestones, daily streak badges, positive trend indicators.
* **Purple Accent (AI Agent & Voice Simulator):** `purple-500` (`#a855f7`)
  - *Usage:* Voice AI recording active states, AI prompt suggestions, decision support badges.
* **Amber Accent (Warning & Improvement Required):** `amber-500` (`#f59e0b`)
  - *Usage:* Missing ATS keywords, pending skill gaps, filler word warnings.
* **Rose / Red Accent (Error & Critical Action):** `rose-500` (`#f43f5e`)
  - *Usage:* Failed API calls, account deletion, critical validation errors.

### Typography Colors
* **Primary High-Contrast Text:** `text-white` or `text-zinc-100` (100% legibility).
* **Secondary Muted Text:** `text-white/60` or `text-zinc-400` (Labels, captions, descriptions).
* **Disabled / Placeholder Text:** `text-white/30` or `text-zinc-600` (Form placeholders, inactive steps).

---

## SECTION 4: Typography System & Hierarchy

Vorynexa pairs a high-contrast sans-serif body typeface (`Plus Jakarta Sans` or system fallback) with a precise monospace font (`JetBrains Mono` / `font-mono`) for metrics, code blocks, status pills, and system tags.

### Type Scale & Hierarchy

| Level | Size | Weight | Line Height | Letter Spacing | Font Family | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Header** | `36px` / `text-4xl` | `900` (Black) | `1.1` | `-0.03em` | Sans / Display | Hero section headlines, major stats |
| **H1 Section Title**| `24px` / `text-2xl` | `800` (Extrabold) | `1.2` | `-0.02em` | Sans | Workspace titles, page headers |
| **H2 Card Header**  | `18px` / `text-lg`  | `700` (Bold) | `1.3` | `-0.01em` | Sans | Section cards, modal headers |
| **H3 Subsection**   | `14px` / `text-sm`  | `600` (Semibold) | `1.4` | `0em` | Sans | Widget headers, form section labels |
| **Body Primary**    | `14px` / `text-sm`  | `400` (Regular) | `1.5` | `0em` | Sans | Main narrative, bullet points, descriptions |
| **Body Secondary**  | `12px` / `text-xs`  | `500` (Medium) | `1.5` | `0em` | Sans | Secondary notes, metadata, table rows |
| **Monospace Badge** | `10px` / `text-[10px]`| `700` (Bold) | `1.0` | `+0.05em` | Monospace | Status pills, ATS percentages, tags |

### Line Length & Constraints
* Body text containers are constrained to `max-w-2xl` or `65ch` (characters per line) to maintain optimal reading ergonomics and reduce eye strain.

---

## SECTION 5: Spacing & Layout System

### The 8-Point Grid Standard
All layout dimensions, margins, padding, and gaps adhere strictly to multiples of **8px** (with 4px micro-adjustments for badges and icons):
* `4px` (`p-1`): Micro padding inside badges and icon buttons.
* `8px` (`p-2`): Small spacing between closely related labels.
* `16px` (`p-4`): Standard inner card padding and element gaps.
* `24px` (`p-6`): Major container padding and modal body padding.
* `32px` (`p-8`): Section spacing between dashboard rows.
* `48px` (`p-12`): Page section margins and hero headers.

### Responsive Breakpoints & Container Architecture
* **Mobile (`sm:`):** `640px` — Single column stacked layout.
* **Tablet (`md:`):** `768px` — Two-column responsive grid.
* **Desktop (`lg:`):** `1024px` — Full sidebar navigation + main content stage.
* **Wide Desktop (`xl:`):** `1280px` — Multi-pane workspace with lateral analytics drawer (`max-w-7xl mx-auto`).

---

## SECTION 6: Component Library Specifications

### 6.1 Buttons & Trigger Controls
* **Primary Action Button:**
  - *Style:* `bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-500 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg hover:opacity-90`
  - *States:* Hover scale `1.02`, active scale `0.98`, focus outline `ring-2 ring-cyan-500`.
* **Secondary Outline Button:**
  - *Style:* `bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold rounded-xl`
* **Ghost Icon Button:**
  - *Style:* `p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors`

### 6.2 Data Cards & Containers
* **Standard Dashboard Card:**
  - *Style:* `bg-[#111111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all shadow-xl`
  - *Rule:* Nested inner card radius must equal `Outer Radius (16px) - Padding (16px) = 0px` or `Inner Radius (8px)` to ensure mathematically clean nested corners.

### 6.3 Form Inputs & Search Fields
* **Standard Text Input:**
  - *Style:* `bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all`
* **Error State:**
  - *Style:* `border-rose-500/80 bg-rose-500/5 text-white focus:ring-rose-500`

---

## SECTION 7: Navigation & Workspace System

### Top Navigation Bar (Global)
* **Height:** `64px` (`h-16`)
* **Background:** Backdrop blur `bg-[#09090b]/80 backdrop-blur-md border-b border-white/10`
* **Key Elements:** Brand Logo, Target Role Pill Indicator, Global Search Trigger (`Cmd + K`), Notification Bell, User Avatar & Profile Drawer.

### Primary Workspace Sidebar
* **Width:** Expanded `240px` (`w-60`), Collapsed `64px` (`w-16`).
* **Active State:** Highlighted left border `border-l-2 border-cyan-400 bg-cyan-500/10 text-white`.
* **Inactive State:** `text-white/50 hover:text-white hover:bg-white/5`.

---

## SECTION 8: Dashboard & Decision Support Matrix UX

The centerpiece of Vorynexa's UX is the **5-Point Decision Support Matrix**, prominently positioned at the top of the user dashboard:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        YOUR DAILY CAREER DECISION MATRIX                               │
├───────────────┬───────────────┬───────────────┬────────────────┬───────────────────────┤
│ 1. LEARN?     │ 2. PRACTICE?  │ 3. IMPROVE?   │ 4. GOAL READY? │ 5. DO TODAY?          │
│ System Arch   │ AI Voice Mock │ ATS Bullet %  │ Readiness: 78% │ 15-Min Career Sprint  │
│ [Roadmap ➔]   │ [Practice ➔]  │ [Resume ➔]    │ [Audit ➔]      │ [LAUNCH SPRINT ⚡]    │
└───────────────┴───────────────┴───────────────┴────────────────┴───────────────────────┘
```

Each of the 5 cards explicitly answers a core user question, transforming passive analytics into an immediate launchpad for daily preparation.

---

## SECTION 9: Motion & Interaction System

Vorynexa uses `motion/react` for smooth, hardware-accelerated micro-interactions.

### Transition Timing Standards
* **Instant Tactile Click:** `100ms ease-out`
* **Card Hover & Focus State:** `200ms ease-in-out`
* **Modal Overlay & Drawer Slide:** `300ms cubic-bezier(0.16, 1, 0.3, 1)` (Spring physics)
* **Page Route Transition:** `250ms fade-in / slide-up`

### Accessibility (Reduced Motion)
* All animated components respect `@media (prefers-reduced-motion: reduce)`, automatically disabling transform movements and substituting simple opacity cross-fades.

---

## SECTION 10: Empty States & Guidance Patterns

When a user views a feature with zero saved data (e.g., empty resume, no completed mock interviews):
1. **Never Show Blank Space:** Display a clean container with a subtle dashed border (`border-dashed border-white/10`).
2. **Contextual Vector Icon:** Centered Lucide icon with `text-white/30`.
3. **Primary Action Callout:** Explicit button leading directly to creation (e.g., *"Generate First Resume"* or *"Launch 2-Min Voice Drill"*).

---

## SECTION 11: Error Experience & Resiliency UI

* **API Failure Toast:** Non-intrusive bottom-right toast with red accent border, friendly explanation, and an instant "Retry" action button.
* **Component Error Boundary:** Isolates component crashes cleanly without dropping the parent application page, featuring a button to "Reload Component State".

---

## SECTION 12: Dark Mode Tokens & Visual Execution

Vorynexa is natively engineered for dark mode excellence:
* **Background Saturation:** Pure black is avoided in favor of `#09090b` (zinc-950 with 2% blue/purple tint) to reduce OLED glare and prevent harsh contrast halos.
* **Surface Layering:** Elements closer to the user on the Z-axis receive incrementally lighter surface fills (`#111111` ➔ `#18181b` ➔ `#27272a`) and subtle border highlights.

---

## SECTION 13: Voice & AI UX Patterns

### AI Interview Simulator Voice Visualizer
* **Idle State:** Pulsing purple ring surrounding microphone icon (`animate-pulse`).
* **Active Listening State:** Real-time multi-bar soundwave visualizer responding to browser audio input levels.
* **Processing State:** Rotating cyan spinner with status pill *"Analyzing answer speech cadence & key terms..."*.
* **Feedback Display:** Structured card featuring score gauges, filler word flags, and expandable ideal response comparisons.

---

## SECTION 14: Mobile UX & Touch Targets

* **Touch Target Size:** Minimum `44px x 44px` on all interactive touch buttons and nav items.
* **Bottom Sheet Navigation:** On screen widths `<640px`, slide-over modals convert to native bottom drawer sheets with pull handles.
* **Responsive Tables:** Complex data tables wrap horizontally with sticky first columns to prevent layout breakages.

---

## SECTION 15: Design System Governance & Scaling

To maintain UI visual integrity as Vorynexa adds future modules:
1. **Token First Rule:** No hardcoded hex colors or inline pixel styles. All colors, spacing, and font sizes must reference standard Tailwind utilities.
2. **Component Reusability:** Every new view must construct UI using existing `/src/components` library primitives before creating bespoke layouts.
3. **Accessibility Audits:** All new pull requests must pass automated accessibility contrast checks and screen reader aria-label validations.

---

**Approved by Design Leadership:**  
*Vorynexa Chief Design Officer & Design System Council*  
*July 2026*
