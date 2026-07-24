# VORYNEXA — AGENT GOVERNANCE, FOUNDER MANIFESTO & ENGINEERING BLUEPRINT

## Core Identity & Mission
Vorynexa is an **AI Career Agent** and **AI Career Operating System** — a system that helps students and professionals make better career decisions through personalized guidance, structured execution, and measurable progress.

## Founder Manifesto & Core Directives
1. **Decision Support First**: Always prioritize clear direction, prioritized next actions, and daily mission guidance over static content or statistics overload. Answer the core user question: *"What is the highest-impact thing I should do next to move closer to my career goal?"*
2. **AI Purpose**: AI features must deliver actionable value — better recommendations, explanations, prioritization, or personalization — rather than novelty for its own sake.
3. **Product Standards**:
   - Clarity over complexity
   - Reliability over novelty
   - Quality over quantity
   - User outcomes over feature count
   - Long-term maintainability over short-term shortcuts
4. **User Outcomes & Daily Focus**: Every user session should answer:
   - What should I learn?
   - What should I practice?
   - What should I improve?
   - How close am I to my goal?
   - What should I do today?

## Engineering & Architectural Baseline
1. **Full-Stack SaaS Architecture**:
   - Modular, single-responsibility components with strict TypeScript types.
   - Robust loading, empty, error, and recovery states for all asynchronous flows.
   - Dual-persistence sync (Firestore & Supabase) with graceful failover.
2. **Security & Production Standards**:
   - Server-side API security for AI models and tokens.
   - Zero-unhandled exceptions in public API routes.
   - Accessible, responsive UI adhering to WCAG AA guidelines.
