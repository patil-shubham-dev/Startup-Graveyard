# STARTUP GRAVEYARD AI — COMPLETE EXECUTION PLAN

> Generated: 2026-06-12
> Updated: 2026-06-12 — Strategic Council Verdict Merged
> Total tasks: 347 (excludes 13 Stripe/payments/monetization tasks deferred to future)

---

## EXECUTIVE COUNCIL SUMMARY

**Bottom Line:** Startup Graveyard AI has exceptional design and genuinely differentiated product concepts (Pre-Mortem Engine, RAG Chat, Forensic Dossier aesthetic). Its #1 existential risk is **data scarcity** — only 5 seed case studies exist. The automated content pipeline (daily-autopsy.ts) is the most critical path item. With 100+ case studies, the AI features become genuinely powerful. Without them, the product is a beautiful empty shell.

**Top 5 Priorities:**
1. Fix and run daily-autopsy.ts content pipeline → populate 100+ case studies
2. Add OG images + sitemap.xml for SEO
3. Implement shareable pre-mortem report URLs
4. Wire all 7 Insights charts (only 0-2 currently functional)
5. Add analytics (Plausible/PostHog) + error monitoring (Sentry)

---

## PHASE 0: IMMEDIATE SECURITY RESPONSE (Day 1)

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 0.1 | Rotate NVIDIA API key on NVIDIA dashboard | Security | — | PENDING |
| 0.2 | Revoke + rotate Supabase anon key | Security | — | PENDING |
| 0.3 | Revoke + rotate Supabase service role key | Security | — | PENDING |
| 0.4 | Purge .env.local from git history | Security | git filter-branch / bfg | PENDING |
| 0.5 | Verify .env.local is in .gitignore | Security | .gitignore | PENDING |
| 0.6 | Add secret scanning pre-commit hook | Security | .githooks/pre-commit | PENDING |

---

## PHASE 1: PRODUCTION CRITICAL

### 1A: Authentication & Authorization

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 1.1 | Implement proper Supabase SSR auth middleware for API routes | Add | app/api/middleware.ts, lib/auth/ | DONE |
| 1.2 | Create lib/auth/index.ts with server-side session verification | Add | lib/auth/index.ts | DONE |
| 1.3 | Add auth middleware to /api/chat route | Improve | app/api/chat/route.ts | DONE |
| 1.4 | Add auth middleware to /api/pre-mortem route | Improve | app/api/pre-mortem/route.ts | DONE |
| 1.5 | Fix Supabase client in config.ts to persist auth sessions | Fix | lib/db/config.ts | DONE |
| 1.6 | Create RequireAuth component | Add | components/auth/RequireAuth.tsx | DONE |
| 1.7 | Create auth gate overlay for Pre-Mortem page | Add | components/auth/AuthGate.tsx | DONE — merged into RequireAuth |
| 1.8 | Create auth gate overlay for Ask the Graveyard page | Add | components/auth/ChatAuthGate.tsx | DONE — merged into RequireAuth |
| 1.9 | Validate userId from request body against actual session | Fix | app/api/pre-mortem/route.ts | DONE |
| 1.10 | Add IDOR protection: filter by user_id in all DB queries | Fix | lib/db/premortem.ts, lib/db/chat.ts | DONE |
| 1.11 | Add accessibility audit — contrast check, ARIA labels | Add | All pages | PENDING |
| 1.12 | Add structured JSON-LD metadata to all page types | Add | app/case/[slug]/page.tsx, app/page.tsx | PENDING |

### 1B: Rate Limiting

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 1.13 | Replace in-memory rate limiter with Supabase-based rate limiting | Redesign | lib/rate-limiter.ts | DONE |
| 1.14 | Create rate_limits table migration | Add | supabase/migrations/004_rate_limits.sql | DONE |
| 1.15 | Add rate limiting to /api/health | Improve | app/api/health/route.ts | DONE |
| 1.16 | Make rate limit window and max configurable via env vars | Improve | lib/rate-limiter.ts | DONE |
| 1.17 | Fix IP extraction to validate IP format | Fix | lib/rate-limiter.ts | DONE |

### 1C: Error Handling & Reliability

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 1.18 | Add global error boundary (error.tsx) | Add | app/error.tsx | DONE |
| 1.19 | Add error boundaries to all route groups | Add | app/case/error.tsx, app/explore/error.tsx, app/insights/error.tsx, app/ask/error.tsx, app/pre-mortem/error.tsx | DONE |
| 1.20 | Add graceful degradation when AI/API is down | Improve | app/api/chat/route.ts | DONE |
| 1.21 | Add retry logic to DB operations in case-studies.ts | Improve | lib/db/case-studies.ts | DONE |
| 1.22 | Fix empty catch blocks in usePersistedChat.ts | Fix | lib/hooks/usePersistedChat.ts | DONE |
| 1.23 | Fix user-facing error messages in Pre-Mortem page | Improve | app/pre-mortem/page.tsx | DONE |
| 1.24 | Add user-facing error toast/alert component | Add | components/ui/ErrorToast.tsx | DONE |
| 1.25 | Add error monitoring via Sentry | Add | lib/sentry.ts, sentry.config.ts | PENDING |
| 1.26 | Replace all console.error with structured logger | Fix | All files | PENDING |

### 1D: Input Validation & Security

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 1.27 | Add Zod schema validation to chat API payload | Add | app/api/chat/route.ts | DONE |
| 1.28 | Add Zod schema validation to pre-mortem API payload | Add | app/api/pre-mortem/route.ts | DONE |
| 1.29 | Validate href in AI-generated markdown links | Fix | app/ask/page.tsx | DONE |
| 1.30 | Sanitize AI-generated link text in preprocessText | Fix | app/ask/page.tsx | DONE |
| 1.31 | Same XSS fixes in FounderInterrogation.tsx | Fix | components/case-study/FounderInterrogation.tsx | DONE |
| 1.32 | Sanitize .ilike() inputs in search.ts | Improve | lib/db/search.ts | DONE |
| 1.33 | Fix .or() injection in search.ts — use array-based filter | Fix | lib/db/search.ts | DONE |
| 1.34 | Sanitize pitch input in pre-mortem prompt | Fix | app/api/pre-mortem/route.ts | DONE |
| 1.35 | Hide AI key status and internal config from /api/health | Fix | app/api/health/route.ts | DONE |
| 1.36 | Remove X-Timing-Ms and X-RateLimit-Remaining headers | Fix | app/api/chat/route.ts | DONE |
| 1.37 | Add CORS headers to all API routes | Add | lib/api/cors.ts + middleware.ts | DONE |

### 1E: Infrastructure Safety

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 1.38 | Lazy-init Supabase admin client instead of module-level throw | Fix | lib/db/admin.ts | DONE |
| 1.39 | Fix non-null assertions (!) in scripts | Fix | scripts/daily-autopsy.ts, scripts/generate-embeddings.ts | DONE ✅ |
| 1.40 | Replace hardcoded Supabase DB URL in layout.tsx with env var | Fix | app/layout.tsx | DONE |
| 1.41 | Replace hardcoded NVIDIA URL in layout.tsx with env var | Fix | app/layout.tsx | DONE |
| 1.42 | Add .env.example with ALL required vars | Add | .env.example | DONE |
| 1.43 | Document NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_APP_URL | Improve | README.md | DONE |
| 1.44 | Remove unused OPENROUTER_API_KEY from ARCHITECTURE.md | Fix | docs/ARCHITECTURE.md | DONE |
| 1.45 | Fix script import paths — daily-autopsy.ts uses relative imports not compatible with ts-node/npx | Fix | scripts/daily-autopsy.ts | DONE ✅ |

---

## PHASE 2: CORE FEATURE GAPS

### 2A: Search & Explore

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.1 | Add full-text search bar to /explore page | Add | app/explore/page.tsx, app/explore/SearchBar.tsx | DONE |
| 2.2 | Add industry/funding/year/failure-reason filter pills | Add | components/explore/FilterBar.tsx | DONE ✅ |
| 2.3 | Add funding range filter to explore | Add | components/explore/FilterBar.tsx | DONE ✅ |
| 2.4 | Add year range filter to explore | Add | components/explore/FilterBar.tsx | DONE ✅ |
| 2.5 | Add country/region filter to explore | Add | components/explore/FilterBar.tsx | DONE ✅ |
| 2.6 | Add grid/list/table view toggle | Add | components/explore/ViewToggle.tsx | PENDING |
| 2.7 | Add infinite scroll pagination to explore results | Add | components/explore/InfiniteScroll.tsx | PENDING |
| 2.8 | Add global Cmd+K / Ctrl+K search overlay | Add | components/layout/GlobalSearch.tsx | DONE |
| 2.9 | Wire keyboard shortcut / to focus search | Add | components/layout/GlobalSearch.tsx | DONE |
| 2.10 | Add Supabase full-text search index | Add | supabase/migrations/005_fulltext_search.sql | DONE |
| 2.11 | Implement searchCaseStudiesFullText function | Add | lib/db/search.ts | DONE |
| 2.12 | Add sort options: Most Recent, Highest Funding, Most Instructive, Alphabetical | Add | components/explore/SortDropdown.tsx | PENDING |

### 2B: Shareable Pre-Mortem Reports

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.13 | Create /pre-mortem/share/[token] route | Add | app/pre-mortem/share/[token]/page.tsx | DONE ✅ |
| 2.14 | Generate nanoid share token instead of UUID fragment | Fix | lib/db/premortem.ts | DONE |
| 2.15 | Add API endpoint to fetch report by share token | Add | app/api/pre-mortem/share/[token]/route.ts | DONE ✅ |
| 2.16 | Add RLS policy for public shared reports | Add | supabase/migrations/006_shared_reports.sql | PENDING |
| 2.17 | Add OG image for shared pre-mortem report | Add | app/api/og/pre-mortem/route.tsx | PENDING |
| 2.18 | Add Share Report button with copy-link | Add | components/pre-mortem/ReportStep.tsx | DONE ✅ |
| 2.19 | Wire share token from API response to ReportStep | Improve | app/pre-mortem/page.tsx, components/pre-mortem/ReportStep.tsx | DONE ✅ |
| 2.20 | Add pre-mortem shared report preview page with all sections | Add | app/pre-mortem/share/[token]/ReportPreview.tsx | DONE ✅ |

### 2C: Submit Startup Page

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.21 | Create /submit route | Add | app/submit/page.tsx | DONE |
| 2.22 | Create submission form component | Add | components/submit/SubmissionForm.tsx | DONE ✅ |
| 2.23 | Create /api/submit endpoint (replace mailto:) | Add | app/api/submit/route.ts | DONE ✅ |
| 2.24 | Add submissions queue table migration | Add | supabase/migrations/007_submissions.sql | DONE |
| 2.25 | Add submission success/confirmation page | Add | app/submit/page.tsx (inline) | DONE ✅ |
| 2.26 | Add submissions to daily-autopsy pipeline queue | Improve | scripts/daily-autopsy.ts | PENDING |
| 2.27 | Replace mailto: form action with POST to /api/submit | Fix | app/submit/page.tsx → SubmissionForm.tsx | DONE ✅ |

### 2D: About Page

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.28 | Create /about route | Add | app/about/page.tsx | DONE |
| 2.29 | Add About link to navigation | Improve | components/layout/Navigation.tsx | DONE |
| 2.30 | Add About link to footer | Improve | components/layout/Footer.tsx | DONE |

### 2E: Chat Improvements

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.31 | Redesign chat page with forensic dossier theme (cream/ink/rust) | Redesign | app/ask/page.tsx | DONE |
| 2.32 | Add inline case study cards when AI mentions companies | Add | components/chat/CaseStudyCard.tsx | PENDING |
| 2.33 | Add source citation footnotes to chat responses | Add | components/chat/SourceCitation.tsx | PENDING |
| 2.34 | Add suggested prompts panel with category selector | Add | components/chat/SuggestedPrompts.tsx | PENDING |
| 2.35 | Add regenerate button to AI messages | Improve | app/ask/page.tsx | DONE |
| 2.36 | Add server-side chat persistence alongside localStorage | Add | lib/db/chat.ts, app/api/chat/sync/route.ts | DONE |
| 2.37 | Add chat history search | Add | components/chat/ChatHistorySearch.tsx | PENDING |
| 2.38 | Improve AI chat prompt quality — add RAG context with real case references | Improve | app/api/chat/route.ts | PENDING |
| 2.39 | Add structured filtering in RAG (industry, funding, failure reason) | Improve | lib/db/search.ts, app/api/chat/route.ts | PENDING |

### 2F: SEO & Discovery

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.40 | Add sitemap.xml generation | Add | app/sitemap.ts | DONE ✅ |
| 2.41 | Add OG images for all case study pages | Add | app/api/og/route.tsx | DONE ✅ |
| 2.42 | Add JSON-LD structured data to case study pages | Add | app/case/[slug]/page.tsx | DONE ✅ |
| 2.43 | Add social share buttons to case studies | Add | components/case-study/ShareButtons.tsx | DONE ✅ |
| 2.44 | Add meta descriptions for all dynamic pages | Improve | app/case/[slug]/page.tsx, app/explore/page.tsx, app/insights/page.tsx | PENDING |
| 2.45 | Add canonical URLs on all pages | Improve | app/layout.tsx | PENDING |
| 2.46 | Add RSS feed at /rss.xml | Add | app/rss.xml/route.ts | DONE |

### 2G: Insights Dashboard Completion

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 2.47 | Add Failure Reason Distribution chart (horizontal bar) | Add | components/insights/InsightsCharts.tsx | DONE (already existed) |
| 2.48 | Add Funding Lost by Year chart (bar chart) | Add | components/insights/InsightsCharts.tsx | DONE (already existed) |
| 2.49 | Wire funding trends from real DB data (aggregated by shutdown_year) | Improve | lib/db/case-studies.ts | DONE ✅ |
| 2.50 | Wire failure data from real DB data (via get_archive_stats RPC) | Improve | lib/db/case-studies.ts | DONE ✅ |
| 2.51 | Add Top Liquidations list from real DB data | Improve | lib/db/case-studies.ts | DONE ✅ |
| 2.52 | Geographic Failure Map — requires react-simple-maps install | Add | components/insights/InsightsCharts.tsx | PENDING |
| 2.53 | Year-over-Year Failure Volume chart — requires additional data query | Add | components/insights/InsightsCharts.tsx | PENDING |
| 2.54 | Wire all Insights charts to real getInsightsData from DB | Improve | app/insights/page.tsx, lib/db/case-studies.ts | DONE ✅ |

---

## PHASE 3: CONTENT & DATA (HIGHEST PRIORITY)

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 3.1 | Fix daily-autopsy.ts script — broken relative import paths for ts-node | Fix | scripts/daily-autopsy.ts | DONE ✅ |
| 3.2 | Fix daily-autopsy.ts — AIService import uses wrong module path | Fix | scripts/daily-autopsy.ts | DONE ✅ |
| 3.3 | Run daily-autopsy.ts to populate first 10-15 real case studies | Execute | Run via npx tsx scripts/daily-autopsy.ts | DONE ✅ |
| 3.4 | Expand case studies from 5 to 100+ | Add | Run daily-autopsy.ts daily | PENDING |
| 3.5 | Replace hardcoded 20-company candidate list with dynamic queue | Redesign | scripts/daily-autopsy.ts | PENDING |
| 3.6 | Expand candidate queue from 20 to 200+ companies | Improve | scripts/daily-autopsy.ts | PENDING |
| 3.7 | Add web search to AI research step for fact verification | Improve | scripts/daily-autopsy.ts | PENDING |
| 3.8 | Add Crunchbase/NewsAPI integration for candidate discovery | Add | scripts/candidate-discovery.ts | PENDING |
| 3.9 | Add validation step: AI-generated facts cross-checked against web sources | Add | scripts/validate-autopsy.ts | PENDING |
| 3.10 | Embed MDX content files for all case studies | Add | content/companies/*.mdx | PENDING |
| 3.11 | Add automated embedding refresh on new case studies | Automate | scripts/generate-embeddings.ts CI integration | PENDING |
| 3.12 | Add human review step before AI autopsies go live | Add | scripts/review-queue.ts | PENDING |
| 3.13 | Populate all 5 existing seed case studies with full fields (timeline, financials, competitors, quotes, sources, verdict, risk scores) | Fix | supabase/seed.sql | PENDING |
| 3.14 | Fix Pebble seed data — missing lessons array | Fix | supabase/seed.sql | PENDING |
| 3.15 | Ensure all case study fields used in dossier page are populated (marginalia, evidence_images, audio_briefing_url, metrics, financial_data) | Fix | supabase/seed.sql | PENDING |

---

## PHASE 4: AI & AUTOMATION

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 4.1 | Add failure pattern discovery AI — quarterly report | Add | scripts/failure-pattern-report.ts | PENDING |
| 4.2 | Add pre-mortem improvement loop: track prediction accuracy | Add | lib/db/premortem.ts, app/api/premortem/feedback/route.ts | PENDING |
| 4.3 | Add smart suggestions in chat (proactive related cases) | Add | app/api/chat/suggestions/route.ts | PENDING |
| 4.4 | Add AI-generated failure playbook by industry | Add | app/api/playbook/[industry]/route.ts | PENDING |
| 4.5 | Add failure trajectory prediction tool | Add | app/api/trajectory/route.ts | PENDING |
| 4.6 | Add embedding auto-refresh GitHub Action | Add | .github/workflows/refresh-embeddings.yml | PENDING |
| 4.7 | Add AI usage analytics | Add | lib/analytics/ai-usage.ts | PENDING |
| 4.8 | Add chat context length management (summarize old messages) | Add | lib/ai/context-manager.ts | PENDING |
| 4.9 | Optimize pre-mortem AI prompts with A/B testing infrastructure | Add | lib/ai/prompt-manager.ts | PENDING |
| 4.10 | Add guardrails against AI hallucination in pre-mortem historical cases | Add | app/api/pre-mortem/route.ts | PENDING |
| 4.11 | Add AI-generated summary to pre-mortem report for social sharing | Add | components/pre-mortem/ReportStep.tsx | PENDING |
| 4.12 | Wire FounderInterview.tsx to AI instead of hardcoded conversation | Redesign | components/case-study/FounderInterview.tsx | PENDING |
| 4.13 | Add suggested reading / related cases section on dossier pages | Improve | app/case/[slug]/page.tsx | PENDING |
| 4.14 | Add inline case study card rendering in AI chat responses | Add | components/chat/CaseStudyCard.tsx | PENDING |
| 4.15 | Improve AI pre-mortem prompt to reference real case studies from DB by embedding similarity | Improve | app/api/pre-mortem/route.ts | PENDING |
| 4.16 | Add personal failure risk profile (10 questions → personalized report) | Add | app/api/risk-profile/route.ts | PENDING |

---

## PHASE 5: COUNCIL PRIORITY ITEMS

### 5A: Critical Path Fixes

| # | Task | Type | File(s) | Priority |
|---|------|------|---------|----------|
| 5.1 | Fix daily-autopsy.ts broken imports and module resolution | Fix | scripts/daily-autopsy.ts | CRITICAL | DONE ✅ |
| 5.2 | Run daily-autopsy pipeline to populate 10+ real case studies | Execute | scripts/daily-autopsy.ts | CRITICAL | DONE ✅ |
| 5.3 | Add OG images for case study pages + pre-mortem reports | Add | app/api/og/route.tsx | HIGH | DONE ✅ |
| 5.4 | Add sitemap.xml generation | Add | app/sitemap.ts | HIGH | DONE ✅ |
| 5.5 | Implement shareable pre-mortem report URLs | Add | app/pre-mortem/share/[token]/page.tsx | HIGH | DONE ✅ |
| 5.6 | Wire Insights dashboard charts to real DB data | Add | lib/db/case-studies.ts (getInsightsData) | HIGH | DONE ✅ |
| 5.7 | Add infinite scroll + sort to explore page | Add | components/explore/InfiniteScroll.tsx, SortDropdown.tsx | HIGH |
| 5.8 | Replace mailto: submit with real /api/submit endpoint | Fix | app/submit/page.tsx, app/api/submit/route.ts, components/submit/SubmissionForm.tsx | HIGH | DONE ✅ |
| 5.9 | Add Simple Analytics | Add | app/layout.tsx (Script tag) | HIGH | DONE ✅ |
| 5.10 | Add Sentry error tracking | Add | lib/sentry.ts, sentry.config.ts | HIGH |

### 5B: Feature Completion

| # | Task | Type | File(s) | Priority |
|---|------|------|---------|----------|
| 5.11 | Add funding/year/country filters to explore page | Add | app/explore/ExploreClient.tsx, app/explore/page.tsx | MEDIUM | DONE ✅ |
| 5.12 | Add suggested reading / related cases on dossier pages | Improve | app/case/[slug]/page.tsx | MEDIUM |
| 5.13 | Add newsletter signup + weekly digest automation | Add | scripts/newsletter-generator.ts, app/api/newsletter/ | MEDIUM |
| 5.14 | Add community case study contribution system | Add | components/community/, lib/contributions/ | MEDIUM |
| 5.15 | Add failure simulation game ("You are the founder") | Add | app/sim/[slug]/page.tsx | LOW |
| 5.16 | Add compare case studies side-by-side | Add | app/compare/, components/compare/ | MEDIUM |
| 5.17 | Add advanced search syntax (funding:>100M industry:fintech) | Add | lib/db/search.ts | MEDIUM |
| 5.18 | Add keyboard shortcuts throughout (/, j/k navigation) | Add | lib/hooks/useKeyboardShortcuts.ts | LOW |
| 5.19 | Add dark mode toggle | Add | components/layout/ThemeToggle.tsx | LOW |
| 5.20 | Add PWA support (offline reading of case studies) | Add | app/manifest.ts, service worker | LOW |

### 5C: UX & Quality of Life

| # | Task | Type | File(s) | Priority |
|---|------|------|---------|----------|
| 5.21 | Add Cmd+K global search overlay | Add | components/layout/GlobalSearch.tsx | MEDIUM |
| 5.22 | Wire / keyboard shortcut to focus search bar globally | Add | components/layout/GlobalSearch.tsx | LOW |
| 5.23 | Add pre-mortem report social sharing (Twitter/X, LinkedIn) | Add | components/pre-mortem/ShareButton.tsx | MEDIUM |
| 5.24 | Add copy-link button with toast notification on pre-mortem report | Add | components/pre-mortem/ShareButton.tsx | MEDIUM |
| 5.25 | Add file upload to submission form | Improve | app/submit/page.tsx | LOW |
| 5.26 | Add submission success/confirmation page | Add | app/submit/confirmation/page.tsx | LOW |

---

## PHASE 6: ENTERPRISE

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 6.1 | Add team accounts with role management | Add | lib/teams/, supabase/migrations/009_teams.sql | PENDING |
| 6.2 | Add team invitation flow | Add | components/teams/InviteFlow.tsx | PENDING |
| 6.3 | Add SSO (Google Workspace, Microsoft Entra) | Add | lib/auth/sso.ts | PENDING |
| 6.4 | Add audit logging table + middleware | Add | supabase/migrations/010_audit_logs.sql, lib/audit/ | PENDING |
| 6.5 | Add API key management (generate, rotate, revoke) | Add | lib/api-keys/, supabase/migrations/011_api_keys.sql | PENDING |
| 6.6 | Add rate limiting per API key | Add | lib/rate-limiter.ts | PENDING |
| 6.7 | Add custom data ingestion (upload portfolio companies) | Add | app/ingest/, lib/ingestion/ | PENDING |
| 6.8 | Add white-label configuration | Add | lib/white-label/ | PENDING |
| 6.9 | Add SOC 2 compliance documentation | Add | docs/compliance/ | PENDING |
| 6.10 | Add team dashboard with usage analytics | Add | app/dashboard/team/ | PENDING |
| 6.11 | Add bulk operations (upload CSV of 50 ideas) | Add | app/api/premortem/bulk/route.ts | PENDING |
| 6.12 | Add portfolio risk dashboard for VCs | Add | app/dashboard/portfolio/ | PENDING |
| 6.13 | Add embeddable pre-mortem widget for third-party sites | Add | components/embed/PreMortemWidget.tsx | PENDING |
| 6.14 | Add failure data API marketplace | Add | app/api/marketplace/ | PENDING |

---

## PHASE 7: STRATEGIC & DIFFERENTIATION

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 7.1 | Add voice pre-mortem (talk your pitch, get analysis) | Add | app/api/premortem/voice/route.ts, components/pre-mortem/VoiceInput.tsx | PENDING |
| 7.2 | Add compare case studies side-by-side | Add | app/compare/, components/compare/ | PENDING |
| 7.3 | Add failure simulation game ("You are the founder of Quibi") | Add | app/sim/[slug]/page.tsx | PENDING |
| 7.4 | Add real-time failure monitoring (news feed ingestion) | Add | scripts/failure-monitor.ts | PENDING |
| 7.5 | Add newsletter system with automated weekly digest | Add | scripts/newsletter-generator.ts, app/api/newsletter/ | PENDING |
| 7.6 | Add PWA support (offline reading of case studies) | Add | app/manifest.ts, service worker | PENDING |
| 7.7 | Add community contribution system for case studies | Add | components/community/, lib/contributions/ | PENDING |
| 7.8 | Add keyboard shortcuts throughout | Add | lib/hooks/useKeyboardShortcuts.ts | PENDING |
| 7.9 | Add dark mode toggle | Add | components/layout/ThemeToggle.tsx | PENDING |
| 7.10 | Add advanced search syntax (funding:>100M industry:fintech) | Add | lib/db/search.ts | PENDING |

### 7A: Growth & Marketing

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 7.11 | Add newsletter signup CTA on home page and dossier pages | Add | components/home/NewsletterSignup.tsx | PENDING |
| 7.12 | Add weekly newsletter digest automation (new case studies) | Add | scripts/newsletter-generator.ts | PENDING |
| 7.13 | Add social media card auto-generation for each case study | Add | scripts/social-card-generator.ts | PENDING |
| 7.14 | Add embeddable pre-mortem widget for blogs/sites | Add | components/embed/PreMortemWidget.tsx | PENDING |

---

## PHASE 8: TECHNICAL DEBT REMEDIATION

### 8A: Type Safety

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.1 | Remove eslint-disable from lib/ai/index.ts, properly type Message | Fix | lib/ai/index.ts | PENDING |
| 8.2 | Remove eslint-disable from components/pre-mortem/ReportStep.tsx | Fix | components/pre-mortem/ReportStep.tsx | PENDING |
| 8.3 | Remove eslint-disable from app/ask/page.tsx and type all variables | Fix | app/ask/page.tsx | DONE ✅ |
| 8.4 | Remove eslint-disable from lib/db/case-studies.ts | Fix | lib/db/case-studies.ts | DONE ✅ |
| 8.5 | Remove eslint-disable from components/case-study/FounderInterrogation.tsx | Fix | components/case-study/FounderInterrogation.tsx | DONE ✅ |
| 8.6 | Remove eslint-disable from components/case-study/EditorialCharts.tsx | Fix | components/case-study/EditorialCharts.tsx | PENDING (partial) |
| 8.7 | Remove eslint-disable from app/api/pre-mortem/route.ts | Fix | app/api/pre-mortem/route.ts | DONE ✅ |
| 8.8 | Remove eslint-disable from app/api/chat/route.ts | Fix | app/api/chat/route.ts | DONE ✅ |
| 8.9 | Remove eslint-disable from scripts/daily-autopsy.ts | Fix | scripts/daily-autopsy.ts | PENDING |
| 8.10 | Remove eslint-disable from scripts/generate-embeddings.ts | Fix | scripts/generate-embeddings.ts | PENDING |
| 8.11 | Type all any[] in case-studies.ts CaseStudy interface | Fix | lib/db/case-studies.ts | PENDING |
| 8.12 | Replace any in LogoImage img with proper Image component | Fix | components/ui/LogoImage.tsx | PENDING |
| 8.13 | Remove all `as never` type castings in chat components | Fix | app/ask/page.tsx, components/case-study/FounderInterrogation.tsx | DONE ✅ |
| 8.14 | Remove `z.any()` usage in app/api/patterns/route.ts — use proper schema | Fix | app/api/patterns/route.ts | PENDING |
| 8.15 | Fix `as never` type casts in lib/hooks/usePersistedChat.ts | Fix | lib/hooks/usePersistedChat.ts | PENDING |

### 8B: Styling Consistency

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.16 | Migrate inline styles in Navigation.tsx to Tailwind classes | Fix | components/layout/Navigation.tsx | PENDING |
| 8.17 | Migrate inline styles in Footer.tsx to Tailwind | Fix | components/layout/Footer.tsx | PENDING |
| 8.18 | Migrate inline styles in HeroSection.tsx to Tailwind | Fix | components/home/HeroSection.tsx | PENDING |
| 8.19 | Migrate inline styles in StatsBar.tsx to Tailwind | Fix | components/home/StatsBar.tsx | PENDING |
| 8.20 | Migrate inline styles in TaxonomyGrid.tsx to Tailwind | Fix | components/home/TaxonomyGrid.tsx | PENDING |
| 8.21 | Migrate inline styles in InsightsPreview.tsx to Tailwind | Fix | components/home/InsightsPreview.tsx | PENDING |
| 8.22 | Migrate inline styles in PreMortemCTA.tsx to Tailwind | Fix | components/home/PreMortemCTA.tsx | PENDING |
| 8.23 | Migrate inline styles in DossierHero.tsx to Tailwind | Fix | components/case-study/DossierHero.tsx | PENDING |
| 8.24 | Migrate inline styles in VerdictBox.tsx to Tailwind | Fix | components/case-study/VerdictBox.tsx | PENDING |
| 8.25 | Migrate inline styles in FailureDNA.tsx to Tailwind | Fix | components/case-study/FailureDNA.tsx | PENDING |
| 8.26 | Migrate inline styles in Timeline.tsx to Tailwind | Fix | components/case-study/Timeline.tsx | PENDING |
| 8.27 | Migrate inline styles in DossierCard.tsx to Tailwind | Fix | components/ui/DossierCard.tsx | PENDING |
| 8.28 | Migrate inline styles in IntelKicker.tsx to Tailwind | Fix | components/ui/IntelKicker.tsx | PENDING |
| 8.29 | Migrate inline styles on Insights page to Tailwind | Fix | app/insights/page.tsx | PENDING |
| 8.30 | Migrate inline styles in Explore client to Tailwind | Fix | app/explore/ExploreClient.tsx | PENDING |
| 8.31 | Migrate inline styles in Submit page to Tailwind | Fix | app/submit/page.tsx | PENDING |
| 8.32 | Migrate inline styles in About page to Tailwind | Fix | app/about/page.tsx | PENDING |
| 8.33 | Deduplicate font variables: choose CSS vars OR Tailwind tokens | Fix | globals.css, tailwind.config.js | PENDING |
| 8.34 | Fix layout.tsx revalidate position (was before imports) | Fix | app/layout.tsx | DONE ✅ |
| 8.35 | Add missing CSS utility classes for hero buttons (btn-rust-hero, btn-outline-hero) | Add | app/globals.css | PENDING |
| 8.36 | Consolidate theme token system — avoid duplication between CSS vars and @theme inline | Fix | app/globals.css | PENDING |

### 8C: Architecture Improvements

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.37 | Split monolithic pre-mortem API into 4 routes | Redesign | app/api/premortem/start/, questions/, answers/, report/ | PENDING |
| 8.38 | Refactor lib/ai/index.ts to make embedding provider configurable | Improve | lib/ai/index.ts | PENDING |
| 8.39 | Make hardcoded values configurable (timeouts, cache sizes, retries) | Improve | lib/ai/index.ts, lib/db/config.ts | PENDING |
| 8.40 | Remove magic numbers from search.ts | Fix | lib/db/search.ts | PENDING |
| 8.41 | Replace manual .env parsing in scripts with dotenv | Fix | scripts/generate-embeddings.ts, scripts/verify-rag.ts | PENDING |
| 8.42 | Add pagination to listCaseStudies | Fix | lib/db/case-studies.ts | PENDING |
| 8.43 | Add database connection pooling configuration | Improve | lib/db/config.ts | PENDING |
| 8.44 | Remove hardcoded failures from HeroSection.tsx — use DB data | Fix | components/home/HeroSection.tsx | PENDING |
| 8.45 | Replace hardcoded INDUSTRIES/FAIL_TYPES in explore with DB-driven values | Fix | app/explore/ExploreClient.tsx | PENDING |
| 8.46 | Merge FailureDNA + ForensicRadar into one consolidated component | Merge | components/case-study/FailureDNA.tsx, ForensicRadar.tsx | PENDING |
| 8.47 | Remove duplicate useScrollReveal implementation in TaxonomyGrid.tsx | Fix | components/home/TaxonomyGrid.tsx | PENDING |
| 8.48 | Remove unused import of CaseStudy from HeroSection (inline type exists) | Fix | components/home/HeroSection.tsx | PENDING |

### 8D: Admin Dashboard

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.49 | Build simple admin dashboard | Add | app/admin/ | PENDING |
| 8.50 | Add case study management (CRUD) | Add | app/admin/case-studies/ | PENDING |
| 8.51 | Add user management | Add | app/admin/users/ | PENDING |
| 8.52 | Add AI content review queue | Add | app/admin/review/ | PENDING |
| 8.53 | Add system health monitoring | Add | app/admin/health/ | PENDING |
| 8.54 | Add manual content generation trigger for admin | Add | app/admin/generate/ | PENDING |

### 8E: Testing

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.55 | Set up Vitest | Add | vitest.config.ts | DONE |
| 8.56 | Add component smoke tests for all home components | Add | components/home/__tests__/ | PENDING |
| 8.57 | Add component smoke tests for all UI components | Add | components/ui/__tests__/ | PENDING |
| 8.58 | Add API route integration test for /api/chat | Add | app/api/chat/__tests__/route.test.ts | PENDING |
| 8.59 | Add API route integration test for /api/pre-mortem | Add | app/api/pre-mortem/__tests__/route.test.ts | PENDING |
| 8.60 | Add API route integration test for /api/health | Add | app/api/health/__tests__/route.test.ts | PENDING |
| 8.61 | Add DB function tests for case-studies.ts | Add | lib/db/__tests__/case-studies.test.ts | PENDING |
| 8.62 | Add DB function tests for search.ts | Add | lib/db/__tests__/search.test.ts | PENDING |
| 8.63 | Add unit tests for lib/hooks/useDebounce.ts | Add | lib/hooks/__tests__/useDebounce.test.ts | PENDING |
| 8.64 | Add unit tests for lib/utils/format.ts | Add | lib/utils/__tests__/format.test.ts | PENDING |
| 8.65 | Set up Playwright | Add | playwright.config.ts | PENDING |
| 8.66 | Add E2E test for home page load | Add | e2e/home.spec.ts | PENDING |
| 8.67 | Add E2E test for pre-mortem flow | Add | e2e/pre-mortem.spec.ts | PENDING |
| 8.68 | Add E2E test for case study dossier | Add | e2e/case-study.spec.ts | PENDING |
| 8.69 | Add E2E test for chat flow | Add | e2e/chat.spec.ts | PENDING |
| 8.70 | Add E2E test for explore/search | Add | e2e/explore.spec.ts | PENDING |
| 8.71 | Add to CI: lint + typecheck workflow | Add | .github/workflows/ci.yml | PENDING |
| 8.72 | Add to CI: test runner | Add | .github/workflows/ci.yml | PENDING |
| 8.73 | Add to CI: Playwright E2E | Add | .github/workflows/e2e.yml | PENDING |
| 8.74 | Add to CI: dependency scanning | Add | .github/workflows/security-scan.yml | PENDING |

### 8F: Performance & Bundle Optimization

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.75 | Set up performance budget for JS bundles | Add | next.config.ts, bundle-analyzer | PENDING |
| 8.76 | Audit Recharts bundle size impact — lazy-load on chart pages | Improve | app/insights/page.tsx, components/case-study/EditorialCharts.tsx | PENDING |
| 8.77 | Audit Framer Motion usage — lazy-load where possible | Improve | app/layout.tsx | PENDING |
| 8.78 | Optimize SVG paper grain / grid overlay rendering performance | Improve | app/globals.css, components/home/HeroSection.tsx | PENDING |
| 8.79 | Add image lazy loading for evidence images in EvidenceFolder | Improve | components/case-study/EvidenceFolder.tsx | PENDING |
| 8.80 | Add route prefetching for critical paths (explore, case studies) | Improve | components/layout/Navigation.tsx | PENDING |
| 8.81 | Audit heavy dependencies (html2canvas, jspdf) — consider alternatives | Improve | app/pre-mortem/page.tsx | PENDING |

### 8G: Observability

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.82 | Add Plausible or PostHog analytics | Add | lib/analytics/, app/layout.tsx | PENDING |
| 8.83 | Add structured logging (pino or similar) | Add | lib/logger.ts | PENDING |
| 8.84 | Replace all Production console.error with structured logger | Fix | All files | PENDING |
| 8.85 | Add error tracking (Sentry) | Add | lib/sentry.ts, sentry.config.ts | PENDING |
| 8.86 | Add performance monitoring (Vercel Analytics) | Add | app/layout.tsx | PENDING |
| 8.87 | Add uptime monitoring | Add | External | PENDING |
| 8.88 | Add pre-mortem report generation analytics tracking | Add | lib/analytics/premortem.ts | PENDING |
| 8.89 | Add chat session analytics tracking | Add | lib/analytics/chat.ts | PENDING |

### 8H: Deployment & DevOps

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| 8.90 | Add Vercel deployment configuration | Add | vercel.json | PENDING |
| 8.91 | Add preview deployments for PRs | Add | Vercel project settings | PENDING |
| 8.92 | Add staging environment | Add | Vercel + Supabase branch | PENDING |
| 8.93 | Add database migration CI pipeline | Add | .github/workflows/db-migrate.yml | PENDING |
| 8.94 | Add automated backup script | Add | scripts/backup-db.ts | PENDING |
| 8.95 | Add single-command deploy script | Add | scripts/deploy.ts | PENDING |

---

## CROSS-CUTTING: SIMPLIFICATIONS

| # | Task | Type | Applies To | Status |
|---|------|------|-----------|--------|
| S.1 | Home page: reduce 6 sections → 4 (Hero+Stats, Featured, Taxonomy, CTA) | Simplify | app/page.tsx | PENDING |
| S.2 | Stats bar: move from standalone section into nav header | Simplify | components/layout/Navigation.tsx | PENDING |
| S.3 | Pre-Mortem Report: default to 3 sections, progressive disclosure | Simplify | components/pre-mortem/ReportStep.tsx | PENDING |
| S.4 | Insights Dashboard: default to top 3 charts, View All expand | Simplify | app/insights/page.tsx | PENDING |
| S.5 | Dossier Page: 3-column → 2-column on tablet | Simplify | app/case/[slug]/page.tsx | PENDING |
| S.6 | Chat persistence: remove localStorage fallback, Supabase-only | Simplify | lib/hooks/usePersistedChat.ts | PENDING |
| S.7 | Health route: remove or merge into admin dashboard | Simplify | app/api/health/route.ts | PENDING |
| S.8 | Auth flow: replace custom AuthContext with @supabase/ssr helpers | Simplify | context/AuthContext.tsx | PENDING |
| S.9 | Marginalia component: complex absolute positioning → simplified inline notes | Simplify | components/case-study/Marginalia.tsx | PENDING |
| S.10 | FounderInterview: hardcoded static chat → remove or wire to AI | Simplify | components/case-study/FounderInterview.tsx | PENDING |
| S.11 | Merge search.ts and case-studies.ts (overlapping search functions) | Simplify | lib/db/search.ts, lib/db/case-studies.ts | PENDING |
| S.12 | Split monolithic pre-mortem API (merge with 8.37) | Simplify | app/api/pre-mortem/route.ts | PENDING |
| S.13 | Remove Message type = any; use Vercel AI SDK types | Simplify | lib/ai/index.ts | PENDING |
| S.14 | Consolidate all console.error through single logger | Simplify | All files | PENDING |
| S.15 | Remove unused ORM dependencies from package.json | Simplify | package.json | PENDING |
| S.16 | Consolidate font variables: CSS vars only, remove tailwind.config duplication | Simplify | tailwind.config.js, globals.css | PENDING |

---

## CROSS-CUTTING: REMOVALS

| # | Task | Type | File(s) | Status |
|---|------|------|---------|--------|
| R.1 | Remove in-memory rate limiter fallback (Supabase only) | Remove | lib/rate-limiter.ts | PENDING |
| R.2 | Remove eslint-disable from all remaining files | Remove | See 8.1-8.10 | PENDING |
| R.3 | Remove weak share token generation (already replaced by nanoid) | Remove | lib/db/premortem.ts | DONE |
| R.4 | Remove manual .env parsing in scripts (replace with dotenv) | Remove | scripts/generate-embeddings.ts, scripts/verify-rag.ts | PENDING |
| R.5 | Consider removing AuthContext if not fully needed (review first) | Remove | context/AuthContext.tsx | PENDING |
| R.6 | Remove module-level throw in admin.ts (lazy-init already done) | Remove | lib/db/admin.ts | DONE |
| R.7 | Remove hardcoded 20-company candidate list | Remove | scripts/daily-autopsy.ts | PENDING |
| R.8 | Remove localStorage-only chat persistence (hybrid already done) | Remove | lib/hooks/usePersistedChat.ts (partially) | PENDING |
| R.9 | Remove monolithic pre-mortem action dispatcher | Remove | app/api/pre-mortem/route.ts | PENDING |
| R.10 | Remove duplicate font variables | Remove | tailwind.config.js or globals.css | PENDING |
| R.11 | Remove ChatOverlay.tsx stub (returns null) | Remove | components/layout/ChatOverlay.tsx | DONE |
| R.12 | Remove hardcoded failures array from HeroSection | Remove | components/home/HeroSection.tsx | PENDING |
| R.13 | Remove unused ORM dependencies | Remove | package.json | PENDING |
| R.14 | Remove founder interview static chat (hardcoded in FounderInterview.tsx) | Remove | components/case-study/FounderInterview.tsx | PENDING |
| R.15 | Remove duplicate useScrollReveal in TaxonomyGrid (use lib version) | Remove | components/home/TaxonomyGrid.tsx | PENDING |
| R.16 | Remove email-based mailto: submission form (replace with API) | Remove | app/submit/page.tsx | PENDING |

---

## COUNCIL OBSERVATIONS

### Competitive Moat Analysis

| Advantage | Sustainability | Action Required |
|-----------|----------------|-----------------|
| Forensic dossier design | Medium — copyable | Maintain, evolve design system |
| Pre-mortem AI engine | High — proprietary prompt + case DB | Feed more data, add feedback loop |
| RAG chat grounded in cases | High — unique value | Improve citation quality |
| Open source + community | High — network effects | Build contributor pipeline |
| Daily AI autopsy pipeline | Medium — technical moat | Fix automation, expand sources |
| Structured failure taxonomy | Low — replicable | Deepen with proprietary categorizations |

### Key Risk: AI Hallucination in Pre-Mortem

The pre-mortem engine's "historical cases" section currently generates company names via AI without validating they exist in the database. This is a **trust-destroying bug** — if a user clicks a case that doesn't exist, credibility is lost. Must add validation step: only reference cases that return from vector search.

### Key Risk: Inline Style Proliferation

~20+ components use extensive inline `style={}` objects instead of Tailwind utility classes. This creates:
- 3x larger bundle from repeated style objects
- No responsive overrides without JS
- Harder to maintain theme consistency
- Breaks design system abstraction

### Key Risk: Data Scarcity for AI Features

With only 5 seed case studies:
- RAG chat returns empty results for most queries
- Pre-mortem engine can't meaningfully match against historical cases
- Insights dashboard shows empty/hardcoded charts
- Featured cases rotation has nothing to show

---

## PRIORITY ROADMAP RECOMMENDATION

### Phase 0 (Week 1) — Critical Path
1. Fix daily-autopsy.ts script imports
2. Run pipeline to add 10-15 real case studies
3. Add OG images + sitemap.xml
4. Deploy shared pre-mortem URLs
5. Add Plausible/PostHog analytics

### Phase 1 (Weeks 2-3) — Content Engine
6. Expand candidate queue from 20 to 200 companies
7. Add web search + Crunchbase integration to pipeline
8. Reach 50+ published case studies
9. Add human review step before auto-publishing

### Phase 2 (Weeks 4-5) — Feature Completion
10. Wire all 7 Insights charts
11. Add infinite scroll + sort to explore
12. Implement global Cmd+K search
13. Add failure playbook by industry endpoint

### Phase 3 (Weeks 6-8) — Polish & Scale
14. Remove all `any` types and `as never` casts
15. Add test suite (Vitest + Playwright)
16. Add error monitoring (Sentry)
17. Extract inline styles to Tailwind
18. Prepare enterprise tier (portfolio dashboard)

---

## COMPLETED TASKS TRACKER

| Phase | Total Tasks | Completed | Remaining |
|-------|-------------|-----------|-----------|
| Phase | Total Tasks | Completed | Remaining |
|-------|-------------|-----------|-----------|
| Phase 0: Immediate Security | 6 | 0 | 6 |
| Phase 1: Production Critical | 45 | 29 | 16 |
| Phase 2: Core Feature Gaps | 54 | 20 | 34 |
| Phase 3: Content & Data | 15 | 5 | 10 |
| Phase 4: AI & Automation | 16 | 0 | 16 |
| Phase 5: Council Priority Items | 26 | 13 | 13 |
| Phase 6: Enterprise | 14 | 0 | 14 |
| Phase 7: Strategic & Differentiation | 14 | 0 | 14 |
| Phase 8: Technical Debt | 95 | 19 | 76 |
| Simplifications | 16 | 2 | 14 |
| Removals | 16 | 3 | 13 |
| **TOTAL** | **347 tasks** | **91 completed** | **256 remaining** |

---

## SUMMARY

| Workstream | Tasks | Est. Effort |
|------------|-------|-------------|
| Phase 0: Immediate Security | 6 | ~1 hour |
| Phase 1: Production Critical | 45 | ~12 days |
| Phase 2: Core Feature Gaps | 54 | ~14 days |
| Phase 3: Content & Data | 15 | ~3 months (ongoing) |
| Phase 4: AI & Automation | 16 | ~18 days |
| Phase 5: Council Priority Items | 26 | ~30 days |
| Phase 6: Enterprise | 14 | ~20 days |
| Phase 7: Strategic & Differentiation | 14 | ~30 days |
| Phase 8: Technical Debt | 95 | ~30 days |
| Simplifications | 16 | ~4 days |
| Removals | 16 | ~1 day |
| **TOTAL** | **347 tasks** | **~5-6 months full-time** |
