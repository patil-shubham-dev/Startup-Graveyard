# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Students and researchers studying startup failures to avoid repeating the same mistakes. Secondary: founders evaluating their own ideas against historical failure patterns.

## Product Purpose

A case study library and AI-powered research platform that helps people learn from failed startups — what went wrong, why, and how to avoid the same fate. Combines a structured archive of documented failures with AI tools (chat, deep research, startup querying) so users can analyze, ask questions, and apply lessons to their own ideas.

## Positioning

An educational case study library augmented by AI — not just a blog of postmortems, but a research tool where users can interrogate the data, run pre-mortem diagnostics on their own concepts, and get evidence-based answers drawn from real failure cases.

## Operating Context

Browser-based, desktop-first responsive web app (Next.js App Router). Users browse the archive, read deep-dive case studies, explore failure taxonomy/insights, and interact with AI chat and pre-mortem diagnostic tools. The UI is currently in an active redesign — prior component code has been removed from the working tree and is being rebuilt; no committed visual world exists yet.

## Capabilities and Constraints

- Case study archive with 22 documented startup failures (JSON data in `data/case-studies/` + MDX content in `content/case-studies/`)
- AI chat ("Graveyard Intelligence") grounded in the archive via RAG semantic search, with chat history persistence
- Pre-mortem diagnostic wizard: multi-step AI tool that analyzes a startup pitch and produces a shareable report
- Insights dashboard: failure-pattern analytics and charts
- Explore: archive browsing and case study search
- Community submissions endpoint that feeds a human-in-the-loop content review queue (admin approve/reject/request-changes)
- Automated content pipeline: `scripts/daily-autopsy.ts` run by GitHub Actions on a daily cron, with web-based fact verification and fact-check scoring before cases enter review
- Supabase PostgreSQL backend with pgvector (1024-dim embeddings via `nvidia/nv-embedqa-e5-v5`), semantic search RPC, full-text search, rate-limiting table
- Supabase SSR authentication (email/password)
- AI backend via NVIDIA NIM (`https://integrate.api.nvidia.com/v1`) using the Vercel AI SDK; default model `meta/llama-3.1-70b-instruct`, overridable via `AI_DEFAULT_MODEL`
- API-level rate limiting, response caching (LRU), CORS origin allowlist, and no-store caching headers for dynamic routes
- Tailwind CSS v4 + Framer Motion styling stack
- No binding visual constraints — confirmed open to evolving the design language

## Brand Commitments

- Name: "Start-up Graveyard"
- No locked logo or asset files (previous logo/wordmark assets were removed)
- Visual register (confirmed 2026-08-06): professional and category-standard — no experimental direction. Craft bar set by Linear/Stripe/Vercel (modern SaaS polish), The Economist/Financial Times (editorial typographic authority), McKinsey/BCG (evidence presentation), and Wikipedia (encyclopedic density).

## Evidence on Hand

- 22 case study JSON files in `data/case-studies/` and 22 matching MDX files in `content/case-studies/`
- Live Supabase database: `case_studies`, `premortem_sessions`, `chat_sessions`, `submissions`, `rate_limits` tables; 10 migrations in `supabase/migrations/` (001–010, including review queue and embedding fixes)
- Working AI chat and pre-mortem API routes connected to NVIDIA NIM
- Admin review API (`/api/review`) with `ADMIN_EMAILS` allowlist
- Automated generation + review scripts: `daily-autopsy.ts`, `review-all-cases.ts`, `re-embed-existing.ts`, `regenerate-all.ts`, `list-drafts.ts`, `verify-rag.ts`

## Product Principles

1. Evidence over opinion — every case study documents real data, funding, timelines, and root causes, and generated content is fact-checked against web sources before publishing
2. Structured learning — failure taxonomy and consistent case format enable meaningful comparison across cases
3. AI-augmented research — AI tools exist to help users apply historical lessons to their own context
4. Human-in-the-loop — AI-generated content does not go live without review
5. Respect for the dead — failures are documented forensically, not sensationally

## Accessibility & Inclusion

No product-specific accessibility requirements established yet.
