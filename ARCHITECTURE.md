# Startup Graveyard AI — Antigravity Build Prompt v2.0

---

## PROJECT DESCRIPTION

### What is Startup Graveyard AI?

**Startup Graveyard AI** is an open-source, AI-powered educational intelligence platform dedicated to one mission: documenting, analyzing, and teaching from the failures of real startups so that the next generation of founders doesn't repeat the same fatal mistakes.

Every year, hundreds of well-funded startups shut down. Billions of dollars are burned. Thousands of employees lose their jobs. Founders walk away without understanding what truly went wrong — and the ecosystem at large never learns the lesson properly, because failures are rarely documented with honesty, depth, or analytical rigor. Startup Graveyard AI exists to change that.

The platform is the definitive public record of startup autopsies — structured, AI-researched, and continuously growing. Think of it as the intersection of investigative journalism, venture capital pattern recognition, and an educational resource built specifically for builders.

---

### The Problem It Solves

The startup world celebrates success stories obsessively. YC Demo Days, Forbes 30 Under 30, TechCrunch funding announcements — all signal, no autopsy. But statistically, **over 90% of startups fail.** The lessons from those failures are worth far more than another success story retelling, yet they are:

- **Scattered** — buried in obscure post-mortems, Reddit threads, and paywalled journalism
- **Shallow** — most coverage stops at "they ran out of money" without root cause analysis
- **Unstructured** — impossible to search, compare, or learn from systematically
- **Forgotten** — the same mistakes get made by new founders every single cycle

Startup Graveyard AI aggregates, structures, and deeply analyzes these failures through AI research pipelines, turning them into a searchable, comparable, and genuinely educational knowledge base.

---

### Core Product Pillars

#### 1. The Case Study Library — "The Graveyard"
A continuously growing database of failed startup case studies, each structured as a **classified intelligence dossier.** Not a blog post — a forensic investigation. Every case study contains:
- A full narrative: founders, origin story, the idea, the arc of failure
- A complete timeline of key events — milestones, warning signs, crises
- Funding history with round-by-round breakdown
- Root cause analysis separating surface symptoms from underlying causes
- The warning signs that were visible but ignored
- A **Failure DNA radar chart** scoring the startup across 6 failure dimensions: Product-Market Fit, Burn Rate, Competition, Execution, Timing, and Team
- Concrete, actionable lessons distilled for founders building today
- A curated list of similar failures for cross-reference

New case studies are published automatically every day through an AI-powered GitHub Actions pipeline that researches, writes, validates, and deploys each story without manual intervention.

#### 2. The Pre-Mortem Engine — "Run a Pre-Mortem"
The most powerful feature on the platform, and the reason this is more than a database.

A **pre-mortem** is a technique borrowed from project management and psychology: before you build, you imagine your startup has already failed, and you work backwards to understand why. Amazon, Google, and top VC-backed teams use pre-mortems before major decisions. Most early-stage founders never do.

The Pre-Mortem Engine democratizes this process. A founder submits their startup idea as a short pitch. The AI then:
1. Asks 5 targeted follow-up questions across the dimensions most correlated with startup failure: market evidence, revenue model, competitive moat, team fit, and timing
2. Analyzes the answers against the pattern database of 1,000+ real failures
3. Generates a **full Pre-Mortem Intelligence Report** including: an overall risk score, per-dimension risk breakdowns, identified strengths, specific risk zones linked to real case studies from the database, a competitive landscape snapshot, red flags the founder may be ignoring, and prioritized recommendations

The report is shareable via a unique public URL, making it a living artifact founders can discuss with co-founders, advisors, or investors.

This is not a generic AI chatbot giving generic startup advice. Every risk flag is grounded in a real company that failed for exactly that reason, with a direct link to their full case study. The database is the credibility layer.

#### 3. Ask the Graveyard — RAG-Powered AI Research Assistant
An AI chat assistant that answers questions about startup failures, grounded entirely in the case study database via Retrieval-Augmented Generation (RAG).

Users can ask anything: *"What killed most fintech startups in 2020–2023?"* or *"Show me every startup that raised over $100M and still failed on unit economics"* or *"What mistakes do first-time founders make most often?"*

Unlike a generic LLM, every response is sourced from the database. When the AI references a company, it renders an inline case study card — not a text link, a real interactive card with logo, case number, failure reason, and a direct link to the full dossier. Answers are traceable to evidence. The AI cannot hallucinate a company that isn't in the system.

#### 4. The Insights Dashboard
A live analytics layer over the entire failure database. Charts and visualizations that surface macro patterns: which failure reasons dominate, how funding stage correlates with failure type, which industries burn fastest, geographic distribution, year-over-year volume. Designed for researchers, investors, and journalists as much as founders.

---

### Who It's For

**Startup Graveyard AI is a public resource.** The case library is free and open to anyone. The target audience includes:

- **First-time founders** validating an idea before spending years and money on it
- **Experienced founders** who want to stress-test a new venture against historical failure patterns
- **Investors and VCs** doing pattern recognition and due diligence — recognizing warning signs early
- **Students and researchers** studying entrepreneurship, innovation failure, and venture capital
- **Journalists and analysts** who need a structured, searchable dataset of startup failures
- **Builders at large companies** evaluating whether to pursue a new internal initiative

The AI-powered features (Pre-Mortem Engine and Ask the Graveyard) require an account, which also enables saving report history and chat sessions.

---

### Why Open Source?

Startup Graveyard AI is open source because the problem it solves is a public good. The startup ecosystem suffers from a collective amnesia around failure — and fixing that requires a community, not a gated product. By open-sourcing the platform, the case study format, and the AI pipeline, the project invites:
- Community contributions of new case studies
- Researchers to build on the dataset
- Other builders to deploy their own instances
- Transparency in how failures are analyzed and categorized

The long-term vision is for this to become the world's most comprehensive, structured, and trusted record of startup failure — built in public, for the public.

---

### What Makes It Different

| | Startup Graveyard AI | CB Insights Shutdown Stories | Reddit/HN Post-Mortems |
|---|---|---|---|
| Structured data | ✅ Full JSON schema | ❌ Editorial only | ❌ Unstructured |
| Root cause analysis | ✅ AI-researched depth | ⚠️ Surface level | ⚠️ Founder-biased |
| Searchable + filterable | ✅ Full-text + semantic | ⚠️ Limited | ❌ No |
| Daily automated updates | ✅ GitHub Actions pipeline | ❌ Manual | ❌ No |
| Idea validation tool | ✅ Pre-Mortem Engine | ❌ No | ❌ No |
| AI chat over database | ✅ RAG-powered | ❌ No | ❌ No |
| Open source | ✅ MIT License | ❌ Proprietary | N/A |
| Free to access | ✅ Fully public | ⚠️ Paywalled | ✅ |

---

## PERSONA

You are a **senior full-stack engineer and product designer** with deep expertise in Next.js 15 App Router, TypeScript, Supabase, and editorial UI design. You write production-ready, fully typed, complete code — never pseudocode, never placeholders, never `// TODO: implement this`. Every component is complete, accessible, and mobile-first.

---

## PRIME DIRECTIVE

Build **Startup Graveyard AI** — a premium dark-mode editorial platform where founders, investors, and builders study real startup failures through AI-powered case studies, a Pre-Mortem Engine (Idea Validator), and a RAG-powered AI chat assistant.

**Tagline:** *"Learn from the dead so your startup doesn't join them."*

---

## NON-NEGOTIABLE BUILD RULES

1. Write **every file in full** — no truncation, no ellipsis, no "rest of the component stays the same"
2. All components are **TypeScript strict mode** — no `any`, no implicit types
3. **Mobile-first** — every layout works at 375px before 1440px
4. **Auth gate** — public users browse all content freely; AI features (Pre-Mortem + Ask the Graveyard) require Supabase Auth
5. **Supabase is the backend** — architect with a clean service layer so migration to custom Next.js API routes later is a 1-file change per domain
6. **No feature flags, no TODOs** — if a feature is in scope, it is implemented
7. All copy is final — no lorem ipsum anywhere

---

## DESIGN SYSTEM — "FORENSIC INTELLIGENCE"

### Philosophy
This is not a startup blog. This is a **classified intelligence dossier about capitalism's casualties.** Every design decision should evoke: *investigation, evidence, verdict, depth.*

### Typography
```
--font-display: 'Fraunces', Georgia, serif;       /* Headlines, hero text */
--font-body:    'Inter', system-ui, sans-serif;   /* Body copy, UI */
--font-mono:    'JetBrains Mono', monospace;      /* Stats, data, case IDs */
```

### Color Tokens
```css
--color-bg:           #08080D;   /* Page background — deeper than pure black */
--color-surface:      #111118;   /* Cards, panels */
--color-surface-2:    #1A1A24;   /* Elevated surfaces, modals */
--color-border:       #1F1F2E;   /* Subtle borders */
--color-border-hover: #2E2E42;

--color-primary:      #7C3AED;   /* Violet — knowledge, depth */
--color-primary-dim:  #4C1D95;   /* Hover states */
--color-amber:        #F59E0B;   /* Warning signals, failure tags */
--color-red:          #EF4444;   /* Critical failure — use sparingly */
--color-green:        #10B981;   /* Lessons learned, success signals */

--color-text:         #F1F5F9;   /* Primary text */
--color-text-muted:   #94A3B8;   /* Secondary text */
--color-text-dim:     #475569;   /* Tertiary, metadata */
```

### Component Rules
- **Cards:** `bg-[#111118] border border-[#1F1F2E] border-t-2 border-t-amber-500`
- **Case IDs:** `font-mono text-amber-500 text-xs tracking-widest uppercase` → e.g. `CASE #0042`
- **Failure tags:** `bg-amber-500/10 text-amber-400 border border-amber-500/20` pill
- **Lesson tags:** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20` pill
- **Primary buttons:** `bg-violet-600 hover:bg-violet-700 shadow-[0_0_20px_rgba(124,58,237,0.3)]`
- **Animations:** `duration-300 ease-out` hovers · `duration-500` page transitions · NO bounce · NO spring
- **Gradients:** Hero headline only — `from-white via-slate-200 to-slate-400 bg-clip-text text-transparent`
- **Section dividers:** 1px border `opacity-20` — never full-width rules

---

## TECH STACK

```
Framework:   Next.js 15 App Router — TypeScript strict
Styling:     Tailwind CSS v4 + CSS variables
Components:  shadcn/ui — customized to design system above
Animation:   Framer Motion — page transitions + scroll reveals only
Charts:      Recharts — all dark-themed to match design tokens
Content:     MDX via next-mdx-remote
Backend:     Supabase (Postgres + Auth + Edge Functions + pgvector)
AI:          Gemini 2.0 Flash via OpenRouter (primary); provider-agnostic layer
Search:      Fuse.js local index + pgvector semantic fallback
Deployment:  Vercel
```

---

## DATABASE SCHEMA

```sql
-- Core case study table
CREATE TABLE case_studies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT UNIQUE NOT NULL,
  case_number    TEXT UNIQUE NOT NULL,        -- e.g. "CASE #0042"
  company_name   TEXT NOT NULL,
  logo_url       TEXT,
  website        TEXT,
  founded_year   INT,
  shutdown_year  INT,
  country        TEXT,
  industry       TEXT,
  business_model TEXT,
  founders       TEXT[],
  funding_raised BIGINT,                      -- USD cents
  employees_peak INT,
  valuation_peak BIGINT,
  investors      TEXT[],
  summary        TEXT NOT NULL,
  failure_reasons TEXT[],
  root_causes    TEXT[],
  warning_signs  TEXT[],
  lessons        TEXT[],
  tags           TEXT[],
  references     JSONB,
  risk_scores    JSONB,                       -- { pmf: 0-100, burn: 0-100, ... }
  content        TEXT,                        -- Full MDX content
  published      BOOLEAN DEFAULT false,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  embedding      vector(768)                  -- Gemini text-embedding-004
);

-- Pre-Mortem sessions
CREATE TABLE premortem_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  pitch       TEXT NOT NULL,
  questions   JSONB,
  answers     JSONB,
  report      JSONB,
  risk_score  INT,
  share_token TEXT UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Chat sessions
CREATE TABLE chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users NOT NULL,
  messages   JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS rules:**
- `case_studies` — public SELECT, service role INSERT/UPDATE
- `premortem_sessions` — authenticated users SELECT/INSERT own rows only
- `chat_sessions` — authenticated users SELECT/INSERT own rows only

---

## SITE ARCHITECTURE

```
/                        → Home
/explore                 → Browse + filter all case studies
/case/[slug]             → Individual case study — dossier format
/insights                → Analytics dashboard
/pre-mortem              → Pre-Mortem Engine (auth-gated)
/pre-mortem/[shareToken] → Public shareable report (read-only)
/ask                     → Ask the Graveyard — RAG chat (auth-gated)
/submit                  → Submit a startup
/about                   → About page
```

---

## PAGE SPECIFICATIONS

### 1. HOME PAGE `/`

#### Navigation — Sticky
- Logo: `[skull icon] STARTUP GRAVEYARD` in font-mono + violet `AI` badge
- Nav links: Explore · Insights · Pre-Mortem · Ask the Graveyard
- Right: GitHub icon + "Sign In" ghost button + "Run Pre-Mortem →" violet CTA
- On scroll: `backdrop-blur-md bg-[#08080D]/80 border-b border-[#1F1F2E]`

#### Hero Section
- Full-width, centered, min-height 90vh
- Eyebrow: `CASE FILES — AI-POWERED RESEARCH` in `font-mono text-amber-500 tracking-widest text-xs uppercase`
- Headline (serif, 72px desktop, 40px mobile): `Learn from the world's most expensive startup mistakes.` — gradient text
- Subheadline: `AI-generated intelligence reports on failed startups. Understand what killed them, what they ignored, and what every founder must know.`
- Search bar: full-width pill input, placeholder `Search 1,000+ startup autopsies...`, keyboard shortcut `/` to focus globally
- CTAs: `Explore the Graveyard →` (violet filled) · `Run a Pre-Mortem` (ghost)
- Background: subtle SVG animated grid lines + scattered faint amber dots (no canvas, no WebGL)

#### Live Stats Bar — monospace
```
⬛ 1,024 CASE FILES    💀 $48.2B FUNDING LOST    📋 PMF FAILURE (#1 REASON)    🔄 +1 TODAY
```

#### Featured Cases — 6 cards
Layout: 3-col desktop · 2-col tablet · 1-col mobile

Card anatomy (top to bottom):
1. `CASE #0042` amber monospace label + industry pill (right-aligned)
2. Company logo (40px) + company name serif
3. One-line italic failure verdict in `text-muted`
4. Stats row in monospace: `$1.75B raised · Failed 2020`
5. Primary failure tag (amber pill)
6. `Read Dossier →` link with arrow

Hover: `translateY(-2px)` + `shadow-[0_4px_24px_rgba(124,58,237,0.15)]`

#### Failure Taxonomy Section
Title: `FAILURE TAXONOMY` in font-mono uppercase amber

8 large interactive tiles in grid:
`Product-Market Fit · Burn Rate · Competition · Timing · Founder Conflict · Regulatory · Fraud · Tech Debt`

Each tile: category name (serif), case count badge (mono), one-line description, hover background fill effect

#### Insights Preview — 2 columns
Left: Failure reason donut chart (Recharts) with legend
Right: "Top 5 Most Expensive Failures" — ranked list with company name, funding bar, and failure tag

#### Pre-Mortem CTA Banner
Full-width dark card, amber left border accent:
- Headline: `Your startup might already be in this database. Just not yet.`
- Subheadline: `Run an AI Pre-Mortem — get a full failure risk report with real case study comparisons before you build.`
- CTA: `Analyze My Idea →` (violet)

#### Footer
Logo + tagline · Explore · Insights · Submit · GitHub · RSS
`Open-source under MIT License` · Built with Next.js + Supabase

---

### 2. CASE STUDY PAGE `/case/[slug]`

This is the most important page. Build it as a **classified intelligence dossier.**

#### Breadcrumb
```
STARTUP GRAVEYARD  /  CASE FILES  /  CASE #0042  /  [CLOSED — SHUTDOWN 2021]
```

#### Hero
- Company logo (80px) + serif company name (56px desktop)
- One-line amber italic verdict
- Monospace key stats grid (4 columns):
  ```
  FOUNDED    SHUTDOWN    RAISED     PEAK EMPLOYEES
  2018       2021        $1.75B     250
  ```
- Industry tag + all failure reason tags

#### Verdict Box
Styled as a legal ruling — monospace border:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  VERDICT — PRIMARY CAUSES OF FAILURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✗  Product-Market Fit Failure
  ✗  Premature Scaling
  ✗  Ignoring User Feedback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Article Body — 2-column (article 70% + sticky sidebar 30%)

**Article sections in strict order:**
1. **Executive Summary** — 2–3 paragraph overview
2. **The Founders** — biographical context, motivations
3. **The Idea** — what they built, why it seemed compelling
4. **Timeline** — horizontal scrollable evidence board. Each event is a dated card: green border (milestone) / amber border (warning sign) / red border (crisis)
5. **Funding History** — Recharts vertical bar chart, one bar per round, labeled with amount and date
6. **Business Model Breakdown** — how they planned to make money and why it failed
7. **What Went Wrong** — numbered list, each item 2–3 paragraphs with depth
8. **Root Cause Analysis** — the 2–3 core underlying reasons with investigative depth
9. **Warning Signs** — styled as redacted documents: text has amber highlight, hover reveals full content with `line-through` effect removed
10. **Failure DNA** — Recharts radar chart across 6 dimensions: PMF / Burn Rate / Competition / Execution / Timing / Team
11. **Lessons for Founders** — emerald-accented numbered list, every item actionable and specific
12. **Similar Failures** — 3 horizontal case study cards linking to related slugs

**Sticky Sidebar:**
- Risk score breakdown: 6 progress bars (per failure dimension), color-coded
- Share: Twitter/X · LinkedIn · Copy link
- `Run a Pre-Mortem on YOUR idea →` CTA (amber)
- Related failure categories
- Case metadata (published date, last updated)

---

### 3. PRE-MORTEM ENGINE `/pre-mortem` — AUTH-GATED

If unauthenticated: full-page lock overlay with blurred report preview behind it. Overlay: `Sign in to run your Pre-Mortem` + email + Google OAuth buttons.

#### Step 1 — Pitch Input
```
INTELLIGENCE BRIEFING INTAKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Describe your startup idea. Be specific about
the problem, your solution, and target customer.

[Large textarea — 50 to 500 words]
Word count indicator bottom-right

[Begin Analysis →]
```

#### Step 2 — AI Interrogation (5 questions, one at a time)
Progress: `QUESTION 2 OF 5 ●●○○○`

Questions cover (in this order):
1. Market: Who specifically is your customer and what evidence do you have they want this?
2. Revenue: How exactly do you make money and what is your unit economics model?
3. Moat: What prevents a well-funded competitor from copying this in 6 months?
4. Team: What in your background makes you the right person to execute this?
5. Timing: Why is now the right moment — what has changed in the last 2 years that makes this possible?

Each question has:
- Question text in serif
- "Why we ask this" tooltip (amber `?` icon)
- Textarea for 3–5 sentence answer
- `Next →` button (disabled until 50+ characters)

#### Step 3 — Report Generation (full-screen)
Sequential status messages with animated indicator:
```
Scanning 1,024 case files...
Identifying failure patterns...
Matching similar failure profiles...
Analyzing your market positioning...
Compiling your Pre-Mortem report...
```

#### Step 4 — Pre-Mortem Report

**Header:**
```
PRE-MORTEM INTELLIGENCE REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Startup Name extracted from pitch]
Generated: May 12 2026  |  Report ID: PM-00847
[Share Report ↗]  [Download PDF ↓]
```

**Overall Risk Score:** Large radial gauge 0–100
- 0–40: emerald "Lower Risk"
- 41–70: amber "Elevated Risk"
- 71–100: red "High Risk"

**6 Risk Dimension Bars:** horizontal progress bars
`Product-Market Fit Risk · Burn Rate Risk · Competition Risk · Execution Risk · Timing Risk · Team Risk`
Each with score, color, and 1-sentence finding

**Strength Zones:** emerald section — what the pitch does well

**Failure Risk Zones:** each risk zone references 2–3 real case studies from DB:
```
⚠ PREMATURE SCALING RISK
Companies that scaled before validating demand:
[CASE #0009 — Webvan] [CASE #0031 — Beepi]
"Webvan expanded to 26 cities before proving unit economics..."
```

**Red Flags Founders Ignored:** formatted as amber warning items

**Competitive Landscape:** AI-identified current competitors with brief positioning note each

**Prioritized Recommendations:** numbered, ranked by risk severity

**Related Case Studies:** 3–5 cards from DB matched by embedding similarity — closest failure profiles to their pitch

**API implementation:**
```typescript
// POST /api/premortem/start          — create session, return session ID
// POST /api/premortem/[id]/questions — AI generates 5 structured questions
// POST /api/premortem/[id]/answers   — store answers, trigger report generation
// GET  /api/premortem/[id]/report    — stream structured JSON report
// GET  /pre-mortem/[shareToken]      — public read-only report view

// AI: Gemini 2.0 Flash via /lib/ai
// Output: structured JSON (not markdown) — parse with Zod schema
// Similarity search: pgvector cosine on case_studies.embedding
// Store full session in premortem_sessions table
// Generate share_token (nanoid) on report completion
```

---

### 4. ASK THE GRAVEYARD `/ask` — AUTH-GATED

RAG-powered AI chat grounded in the case study database.

#### Layout
Two-panel desktop layout:
- Left 70%: chat interface
- Right 30%: suggested prompts panel + recent sessions list

#### Chat Interface
- User messages: right-aligned, `bg-violet-600/20 border border-violet-500/30`
- AI messages: left-aligned, `bg-[#111118] border border-[#1F1F2E]`
- Streaming: SSE with typewriter effect
- When AI mentions a company → render inline mini case study card:
  ```
  ┌─────────────────────────────────────────┐
  │ CASE #0009  [Industry]                  │
  │ Webvan                                  │
  │ Primary failure: Premature Scaling      │
  │ $375M raised · Shutdown 2001            │
  │ Read Full Dossier →                     │
  └─────────────────────────────────────────┘
  ```
- Monospace formatting for inline stats: `` `$375M raised · 1996–2001` ``

#### Empty State — Suggested Prompts
```
"What killed most fintech startups in 2020–2023?"
"Show me startups that raised over $100M and still failed"
"What are the most common first-time founder mistakes?"
"Compare Quibi and Vine — what did they share?"
"Which startups failed by scaling too fast?"
```

**API: `POST /api/chat` (streaming SSE)**
```typescript
// 1. Embed user query — Gemini text-embedding-004 (768-dim)
// 2. pgvector cosine similarity search on case_studies.embedding — top 5
// 3. Build system prompt with retrieved context + conversation history
// 4. Stream Gemini 2.0 Flash response via /lib/ai
// 5. Post-process: detect company name mentions → attach case study card data
// 6. Persist to chat_sessions (append message pair)
```

---

### 5. EXPLORE PAGE `/explore`

**Sticky filter bar (below nav):**
```
[🔍 Search case files...]  [Industry ▾]  [Funding ▾]  [Year ▾]  [Failure Reason ▾]  [Country ▾]  [Sort ▾]
```
Active filters shown as dismissible amber pills below bar.
Results count: `Showing 847 of 1,024 case files`

**Results grid:**
- Default: 3-col card grid (same card design as home featured cases)
- Toggle: Grid / List / Table view (saved to localStorage)
- Infinite scroll (not pagination)
- Sort: Most Recent · Highest Funding · Most Instructive · Alphabetical

---

### 6. INSIGHTS DASHBOARD `/insights`

All charts use Recharts, all dark-themed with design system colors. Each is a self-contained component with title, description, and data source note.

1. **Failure Reason Distribution** — horizontal bar, sorted descending
2. **Funding Lost by Industry** — stacked bar chart by year (2000–2024)
3. **Startup Lifespan Distribution** — histogram, x-axis in months from founding to shutdown
4. **Failure Reasons by Funding Stage** — grouped bar (Seed / Series A / Series B / Late Stage)
5. **Top 10 Most Expensive Failures** — ranked list with inline funding bars
6. **Geographic Failure Map** — react-simple-maps world map, dot size = funding lost
7. **Year-over-Year Failure Volume** — area chart with gradient fill

---

## AI SERVICE LAYER

```typescript
// /lib/ai/index.ts — provider-agnostic interface
interface AIProvider {
  chat(messages: Message[], system?: string): Promise<ReadableStream>
  embed(text: string): Promise<number[]>
  generate<T>(prompt: string, schema: ZodSchema<T>): Promise<T>
}

// /lib/ai/providers/gemini.ts    — default via OpenRouter
// /lib/ai/providers/openai.ts    — fallback
// /lib/ai/providers/anthropic.ts — fallback

// Zero direct OpenRouter/API calls outside /lib/ai/
// Provider selection via AI_DEFAULT_MODEL env var
```

---

## SUPABASE SERVICE LAYER

```typescript
// /lib/db/case-studies.ts — getCaseStudy, listCaseStudies, searchCaseStudies, getSimilar
// /lib/db/premortem.ts    — createSession, getSession, saveQuestions, saveAnswers, saveReport
// /lib/db/chat.ts         — createChatSession, appendMessage, getChatHistory
// /lib/db/search.ts       — vectorSearch(embedding: number[], limit: number)

// Zero Supabase SDK imports outside /lib/db/
// All functions accept plain typed params, return plain typed objects
// Migration to Drizzle/custom Postgres = rewrite /lib/db/ files only
```

---

## AUTH FLOW

```typescript
// /lib/auth/context.tsx — AuthContext with user, session, signIn, signOut
// /components/auth/RequireAuth.tsx — wraps Pre-Mortem and Ask pages
//   Unauthenticated: renders lock overlay with sign-in modal + feature preview behind blur
//   Authenticated: renders children

// Sign-in methods: Email/password + Google OAuth (Supabase Auth)
// Post-auth redirect: reads ?next= param, falls back to /pre-mortem or /ask
```

---

## SEED DATA

10 complete case studies — all DB fields populated + minimum 1,500-word MDX article each:

| # | Company | Raised | Shutdown | Primary Failure |
|---|---------|--------|----------|-----------------|
| 0001 | Quibi | $1.75B | 2020 | Product-Market Fit |
| 0002 | Juicero | $120M | 2017 | Product-Market Fit |
| 0003 | Theranos | $945M | 2018 | Fraud |
| 0004 | Webvan | $375M | 2001 | Premature Scaling |
| 0005 | Pets.com | $82.5M | 2000 | Unit Economics |
| 0006 | Vine | Acquired | 2016 | Strategic Neglect |
| 0007 | Color Labs | $41M | 2012 | No Clear Use Case |
| 0008 | Beepi | $149M | 2017 | Burn Rate |
| 0009 | Houseparty | $70M | 2021 | Competition |
| 0010 | Better Place | $850M | 2013 | Timing + Execution |

---

## SEO

```typescript
// Every case study page generates:
// title: "Why [Company] Failed: The $XM Startup Autopsy | Startup Graveyard AI"
// OG image: server-rendered via @vercel/og — case number, logo, funding, failure reason
// JSON-LD: Article schema + Organization schema + BreadcrumbList
// Canonical URLs on all pages
// Auto-generated sitemap.xml from DB (getServerSideProps at build)
// RSS feed at /feed.xml — latest 20 published case studies
```

---

## CONTENT AUTOMATION (GitHub Actions)

```yaml
# .github/workflows/daily-publish.yml
# Schedule: 0 8 * * * (08:00 UTC daily)
# Steps:
# 1. Read next company from /data/queue.json
# 2. Call Gemini 2.0 Flash — generate structured JSON case study
# 3. Validate against Zod schema
# 4. Generate Gemini embedding (768-dim) for the case study text
# 5. INSERT into Supabase case_studies (with embedding)
# 6. Write MDX file to /content/companies/[slug].mdx
# 7. Commit + push to main
# 8. POST to VERCEL_DEPLOY_HOOK webhook
```

---

## ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI via OpenRouter
OPENROUTER_API_KEY=
AI_DEFAULT_MODEL=google/gemini-2.0-flash-001

# Automation
GITHUB_TOKEN=
VERCEL_DEPLOY_HOOK=
```

---

## BUILD ORDER — STRICT SEQUENCE, DO NOT DEVIATE

### Phase 0 — Foundation (all of this before any page)
1. Supabase schema migration + RLS policies
2. Design system: Tailwind config, CSS variables, `next/font` setup for Fraunces + Inter + JetBrains Mono
3. Global layout: Nav + Footer components
4. Auth: Supabase Auth context + `<RequireAuth>` component
5. Service layers: all of `/lib/db/` and `/lib/ai/`

### Phase 1 — Core Content
6. Home page — all sections
7. Case study dossier page — full layout
8. Seed data — 10 companies inserted to DB + MDX files
9. Explore page with filters + infinite scroll

### Phase 2 — AI Features
10. Pre-Mortem Engine — 4-step flow + full report
11. Ask the Graveyard — RAG chat with inline case study cards

### Phase 3 — Analytics
12. Insights dashboard — all 7 charts

### Phase 4 — Automation
13. GitHub Actions daily publish pipeline

---

## REPOSITORY STRUCTURE

```
startup-graveyard-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    — Home
│   ├── explore/page.tsx
│   ├── case/[slug]/page.tsx
│   ├── insights/page.tsx
│   ├── pre-mortem/page.tsx
│   ├── pre-mortem/[shareToken]/page.tsx
│   ├── ask/page.tsx
│   └── api/
│       ├── chat/route.ts
│       ├── premortem/start/route.ts
│       ├── premortem/[id]/questions/route.ts
│       ├── premortem/[id]/answers/route.ts
│       └── premortem/[id]/report/route.ts
├── components/
│   ├── ui/                         — shadcn base components (design-system customized)
│   ├── layout/                     — Nav, Footer, RequireAuth
│   ├── case-study/                 — DossierHero, Timeline, VerdictBox, FailureDNA
│   ├── pre-mortem/                 — PitchInput, QuestionStep, ReportView
│   ├── chat/                       — ChatInterface, MessageBubble, CaseStudyCard
│   ├── home/                       — HeroSection, FeaturedCases, StatsBar, TaxonomyGrid
│   └── charts/                     — all Recharts wrappers
├── lib/
│   ├── ai/
│   │   ├── index.ts
│   │   └── providers/
│   └── db/
│       ├── case-studies.ts
│       ├── premortem.ts
│       ├── chat.ts
│       └── search.ts
├── content/
│   └── companies/                  — MDX files
├── data/
│   ├── queue.json                  — automation queue
│   └── search-index.json           — Fuse.js index (generated at build)
├── .github/
│   └── workflows/
│       ├── daily-publish.yml
│       ├── validate.yml
│       └── deploy.yml
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## FINAL QUALITY BAR

The finished product must feel like the intersection of:
- **The Intercept** — investigative journalism depth and gravitas
- **Linear** — interaction quality and micro-animation precision
- **Raycast** — keyboard-first, command palette power
- **Bloomberg Terminal** — data density without visual clutter

If any page feels like a generic Next.js template with a dark background applied, it is wrong. Rebuild it until it feels like a premium editorial product that takes startup failure seriously.
