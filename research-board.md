# Research Board — ASK Refinement

Internal working notes. Do not quote verbatim in final reports.

## Status
- **Step: 12 — Final QA/refinement pass (user-approved, post-redesign)**
  - Subtask 12a: restore site-404 footer (group-level not-found), verify hierarchy empirically on a FRESH dev server (earlier "dead not-found" finding suspected stale-dev noise — same class of staleness as the 1514px header scare).
  - Subtask 12b: Supabase timeout investigation (read-only first: lib/db/config.ts).
  - Subtask 12c: VISUAL QA — real screenshots at 5 viewports (1440/1280/1024/390/430), loaded `impeccable`/`design` skills for the review workflow.
  - Subtask 12d: data-driven audit (evidence/strength/grounding/sources/follow-ups — no hardcoded product UI).
  - Subtask 12e: re-run full verification matrix after any changes.

## Findings
- [FINDING] (Step 1) Root layout rendered Header+main+Footer unconditionally; no route-aware footer split.
- [FINDING] (Step 2) All content-route files import only via `@/` or same-folder relative paths → safe to move into a `(site)` route group.
- [FINDING] (Step 3) "1 Issue ×" widget not present anywhere in app source (grepped) → browser-extension artifact; documented; nothing to remove.
- [FINDING] (Step 3) `app/(site)/layout.tsx` created (Footer wrapper); root layout now Header+main only; root `not-found.tsx` retained.
- [FINDING] (Step 4) Sweep harness `ask-sweep.cjs` targets ASK_BASE (default :3001); dev server on :3000 → run with `ASK_BASE=http://localhost:3000` + `NODE_PATH` to project `node_modules`. Also: `npm run build` clobbers `.next` → stop dev server first.
- [FINDING] (Step 5) P1 UX shipped: header active state (client component, `aria-current`, `link-nav-active`), sidebar ⋯ menu (Rename/Delete, keep aria-label contract), two-line index meta (`formatTime` now interpunct: "Aug 10 · 09:06 AM"; new `formatCount`), Empty state → "Interrogate the archive.", Evidence section (numbered, strength from real source counts), follow-ups via `buildFollowUps` (deterministic), context label → "Archive context", drawer Escape handler, `100svh` fallback, scrollbar styling, composer safe-area padding.
- [FINDING] (Step 6) NEW test suite: `tests/followups.test.ts`; regex bug caught: "Why was Webvan doomed?" captured "Webvan doomed" as subject → added `doomed|go\s+bankrupt` to verb list. 11/11 pass.
- [FINDING] (Step 7) vitest was missing entirely from node_modules + devDependencies though `npm run test` and `tests/rate-limiter.test.ts` existed (pre-existing gap). Installed `vitest@^4.1.10` as devDependency to run the suite. ⚠ DEVIATION to flag to user (no-new-deps rule): required to satisfy "run the existing tests" + AGENTS.md test-coverage rule.
- [FINDING] (Step 7) e2e-auth hung at sign-in: pre-existing `createTimeoutFetch()` (lib/db/config.ts:15-23) aborts browser Supabase requests after 3000ms; first Cloudflare TLS handshake to mapped IP exceeded it → `AbortError: signal is aborted without reason`, token request aborted. Remedy: dev server restarted with `SUPABASE_DB_TIMEOUT=15000` (test-only env var, no file change) → 29/29 PASS. Not a code regression.
- [FINDING] (Step 8) Structural probe 13/18 initially. Issues found & fixed:
  1. **Header 65px**: `<header>` had no explicit height; inner div `h-16` (64px) + 1px `border-b` → 65px; shell `calc(100dvh - 4rem)` assumes 64px → 1px page scroll on /ask (901 vs 900). Fixed: `h-16` on `<header>` + `h-full` on inner div → header exactly 64px; /ask scrollH == clientH == 900.
  2. **Group-level not-found dead**: `app/(site)/not-found.tsx` never engaged (every (site) URL matches a page; group-level not-found has no URL to match; verified with nested-segment experiment + multiple probes + dev restarts). Removed (dead code); root not-found renders identical content for all 404s.
  3. **Probe false positives**: composer container is a semantic `<footer>` (Composer.tsx) → scoped site-footer detection to Footer content; footer signature text is dynamic: `Archiving failures since ${spanStart}` (Footer.tsx:78) — "ARCHIVE ESTABLISHED" was a misremembered fake string.
- [FINDING] (Step 12a) **404/footer contract, definitive resolution.** Empirically established on a FRESH dev server: in this Next version, segment/group-level `not-found.tsx` files render ONLY for explicit `notFound()` calls (case/[slug] → footer appeared); URL-mismatch 404s under static segments (privacy/nonexistent, explore/x) ALWAYS render the ROOT not-found — leaf not-found files are ignored (tested with 8 leaf files + group file present: still root). Stale-dev theory falsified. → **Architecture adopted**: single conditional footer `components/site/AppFooter.tsx` (client, `usePathname()`; returns null iff path starts with `/ask`), rendered once in root layout with `<Footer/>` passed as prop (server component stays server). Deleted `app/(site)/layout.tsx`, `(site)/not-found.tsx`, and all 8 leaf not-found copies; root not-found → shared `components/site/SiteNotFound.tsx`. Footer now renders exactly once per page, for every non-ASK page INCLUDING all 404s (unknown top-level included). Verified matrix: / ✓ footer · /ask ✗ · /about ✓ · /explore ✓ · /privacy/nonexistent ✓ · /case/bad-slug ✓ · /ask/nonexistent ✗ · /totally-unknown ✓ · /auth ✓.
- [FINDING] (Step 12b) **Supabase timeout analysis** (read-only first): `lib/db/config.ts:15-23` — 3s AbortController wrap applies to ALL supabase clients (browser, admin, server-data, server-cookie). Browser-side ops affected: signInWithPassword/signUp (auth page), `getSession()` on every /ask mount, `chat_sessions` list/get/save (PostgREST), token auto-refresh. Middleware `getSession()` is NOT wrapped (no timeout at all). Latency is network/cold-start dominated (Supabase pooler Lambda + GoTrue), NOT query-dominated → no query optimization available. Failure mode on abort is graceful (localStorage-first chat, signed-out fallback) EXCEPT `AskClient.tsx:53` `getSession().then(...)` has no `.catch` → unhandled rejection. 3s is empirically below real cold-start ceiling (observed >3s sign-in abort twice this session). → Decision: raise default to 10000ms deliberately (see config.ts comment), keep env override, add `.catch` to AskClient session restore. NOT a demo-mode workaround — demo mode fails instantly via placeholder creds (DNS/parse), unaffected by timeout.
- [FINDING] (Step 10) **Intermediate false regression**: after `npm run build`, the pre-existing dev server (PID on :3000 from 10:25) was NOT actually killed by an earlier Stop-Process sweep; build clobbered `.next` under the running dev server → /ask served unstyled (header 1514px, shell display:block, scrollH 2353). Kill-by-port + fresh clean dev server → all suites green. Confirms the board rule: never build while dev is running.
- [FINDING] (Step 10) e2e-auth output buffers when piped through Select-Object; result lands in e2e-auth-run.log ("29/29 passed"). Run with direct output or read the log.
- [FINDING] (Step 10) Final verification matrix green: sweep 36/36, e2e-auth 29/29, structural 17/17, vitest 11/11, tsc 0, eslint 0, build clean.

## Selector / text contracts (E2E — must not break)
- `textarea[aria-label='Ask the archive']`, `button[aria-label='Send inquiry']`, `button[aria-label='Stop generating']`, `aside[aria-label='Conversations']`, `input[aria-label='Conversation title']`, `button[aria-label^='Rename']`, `button[aria-label^='Delete']`, `text=Delete?`, `button:has-text('Delete?')`, `text=Consulting the archive`, `text=Inquiry`, `text=Graveyard Intelligence`, `button:has-text('Context')` (now "Archive context"), `text=Each answer is re-grounded in the archive`, `text=Your chats are saved on this browser.`, `button:has-text('New inquiry')`, `button[class*='suggestion']` ×4, `button[aria-label='Open conversations']`, `button[aria-label='Collapse sidebar']`, `button[aria-label='Show sidebar']`.
- Changed (harness updated): empty-state text → "Interrogate the archive." (was "What would you like to investigate?"), rename/delete flows now open `⋯` menu first (`button[aria-label^='More actions']`).

## Remaining work
1. ✅ All verification done (Step 10/11).
2. ✅ Final report delivered (Step 11).

## Deviations / open items to surface to the user
1. `vitest@^4.1.10` added to devDependencies (pre-existing gap: test script + tests existed but the runner was never installed). Not a production dep.
2. `app/(site)/not-found.tsx` removed as dead code (group-level not-found never engaged; all 404s render the root not-found, without site footer). Content-route 404s are footer-less — accepted trade-off.
3. Header element now `h-16` with inner `h-full` (was inner `h-16` + 1px border = 65px); global header is now exactly 64px everywhere.
4. `SUPABASE_DB_TIMEOUT=15000` used as a test-run env var only (no file change); pre-existing 3s browser-timeout config is untouched (see Step 7 finding).
