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
- **Narrative & Timeline:** Full origin-to-failure arc with dated evidence.
- **Financials:** Funding history and round-by-round breakdown.
- **Forensic Analysis:** Root cause analysis and structured failure taxonomy (PMF, Burn, Competition, Execution, Timing, Team).
- **Daily Updates:** Automated AI pipeline (GitHub Actions) that drafts new cases and fact-checks them against web sources.
- **Human Review:** Drafts enter a review queue; nothing publishes without admin approval.

### 4.2 The Pre-Mortem Engine
An interactive tool for founders to stress-test their ideas.
- **Pitch Intake:** Startup description input.
- **AI Interrogation:** A set of targeted questions (Market, Revenue, Moat, Team, Timing).
- **Intelligence Report:** Generates risk scores, strength zones, and failure risk zones linked to real case studies; reports can be shared.

### 4.3 Ask the Graveyard (RAG Chat)
A research assistant grounded in the case study database.
- **Retrieval-Augmented Generation:** Answers based on database evidence via semantic (vector) search.
- **Case References:** Mentions of archived companies are grounded in the real case study records.

### 4.4 Insights Dashboard
Macro-level analytics surfacing failure patterns.
- Charts for failure reasons, funding lost by industry, lifespan distribution, and geographic heatmaps.

## 5. Technical Requirements

### 5.1 Tech Stack
- **Framework:** Next.js 15 (App Router, TS Strict).
- **Styling:** Tailwind CSS v4 + Framer Motion.
- **Database/Auth:** Supabase (PostgreSQL + pgvector + Auth, email/password).
- **AI:** NVIDIA NIM (`meta/llama-3.1-70b-instruct`) via the Vercel AI SDK; embeddings via `nvidia/nv-embedqa-e5-v5` (1024-dim).
- **Content:** MDX via next-mdx-remote.
- **Review Pipeline:** Admin review API (`ADMIN_EMAILS` allowlist) + web fact-checking in the generation script.

### 5.2 Database Schema Highlights
- `case_studies`: Core data + pgvector embeddings (1024-dim), review lifecycle (`review_status`, `fact_check_score`, `verified_sources`).
- `premortem_sessions`: User pitch data and generated reports.
- `chat_sessions`: Persistent RAG chat history.
- `submissions`: Community-submitted cases feeding the review queue.
- `rate_limits`: API rate limiting.

## 6. Design System
**Status: under active redesign.** Prior visual directions (dark "Forensic Intelligence" and a warm-cream dossier theme) have both been superseded; UI components are being rebuilt and no design language, typography, or palette is currently committed. See `PRODUCT.md` for product truth and `DESIGN.md` once the new world is established.

## 7. Success Metrics
- Growth of the case study database.
- Number of Pre-Mortem reports generated.
- User engagement with RAG chat for deep research.
- Community contributions to the open-source dataset.
