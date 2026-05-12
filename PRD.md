# Product Requirements Document (PRD) — Startup Graveyard AI

## 1. Project Overview
**Startup Graveyard AI** is an open-source, AI-powered educational intelligence platform dedicated to documenting, analyzing, and teaching from the failures of real startups. It serves as a definitive public record of startup autopsies, combining investigative journalism depth with AI-driven analysis.

**Tagline:** *"Learn from the dead so your startup doesn't join them."*

## 2. Problem Statement
The startup ecosystem suffers from "success bias" and collective amnesia regarding failure.
- **Scattered Information:** Post-mortems are buried across various platforms.
- **Shallow Analysis:** Most reports focus on surface symptoms (e.g., "ran out of money") rather than root causes.
- **Unstructured Data:** Hard to search or compare failure patterns systematically.
- **Repeated Mistakes:** Founders continue to make the same avoidable errors.

## 3. Target Audience
- **First-time Founders:** Validating ideas and avoiding early pitfalls.
- **Experienced Builders:** Stress-testing new ventures against historical patterns.
- **Investors/VCs:** Improving due diligence and recognizing early warning signs.
- **Researchers/Journalists:** Accessing structured data on startup failures.

## 4. Core Product Pillars

### 4.1 The Case Study Library ("The Graveyard")
A database of structured "intelligence dossiers" for failed startups.
- **Narrative & Timeline:** Full origin-to-failure arc with dated evidence cards.
- **Financials:** Funding history and round-by-round breakdown.
- **Forensic Analysis:** Root cause analysis and Failure DNA radar charts (PMF, Burn, Competition, Execution, Timing, Team).
- **Daily Updates:** Automated AI pipeline (GitHub Actions) for new case publication.

### 4.2 The Pre-Mortem Engine
An interactive tool for founders to stress-test their ideas.
- **Pitch Intake:** 50-500 word startup description.
- **AI Interrogation:** 5 targeted questions (Market, Revenue, Moat, Team, Timing).
- **Intelligence Report:** Generates risk scores, strength zones, and failure risk zones linked to real case studies.

### 4.3 Ask the Graveyard (RAG Chat)
A research assistant grounded in the case study database.
- **Retrieval-Augmented Generation:** Answers based strictly on database evidence.
- **Inline Case Cards:** Renders interactive summary cards when mentioning companies.

### 4.4 Insights Dashboard
Macro-level analytics surfacing failure patterns.
- Charts for failure reasons, funding lost by industry, lifespan distribution, and geographic heatmaps.

## 5. Technical Requirements

### 5.1 Tech Stack
- **Framework:** Next.js 15 (App Router, TS Strict).
- **Styling:** Tailwind CSS v4 + Framer Motion.
- **Database/Auth:** Supabase (PostgreSQL + pgvector + Auth).
- **AI:** Gemini 2.0 Flash via OpenRouter.
- **Content:** MDX via next-mdx-remote.

### 5.2 Database Schema Highlights
- `case_studies`: Core data + pgvector embeddings.
- `premortem_sessions`: User pitch data and generated reports.
- `chat_sessions`: Persistent RAG chat history.

## 6. Design System: "Forensic Intelligence"
- **Aesthetic:** Premium dark mode, editorial, high-density data.
- **Typography:** Fraunces (Headlines), Inter (Body), JetBrains Mono (Stats).
- **Color Palette:** Deep backgrounds (#08080D), Violet primary (#7C3AED), Amber warnings (#F59E0B).

## 7. Success Metrics
- Growth of the case study database.
- Number of Pre-Mortem reports generated.
- User engagement with RAG chat for deep research.
- Community contributions to the open-source dataset.
