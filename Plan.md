# AI Automation Pipeline — Remediation Plan

## Status (audited 2026-08-06 against working tree)

| ID | Status | Evidence |
|----|--------|----------|
| F1 | ✅ Done | `daily-autopsy.yml` deleted; `daily-publish.yml` is the single workflow (05:00 UTC, `NVIDIA_API_KEY`, commit/push, manual dispatch) |
| F2 | ✅ Done | Migrations `008` + `010`; final state is `vector(1024)` — `010` corrected 008's 768-dim assumption (model actually outputs 1024) |
| F3 | ✅ Done (variant) | `lib/web-search.ts` implements fact verification via DuckDuckGo HTML search + `verifyFacts()` scoring (not Tavily as originally planned); `fact_check_score` + `verified_sources` added in migration `009` |
| F4 | ✅ Done | Migration `009` (review lifecycle), `/api/review` (GET list, PATCH approve/reject/request_changes, PUT draft edit), `ADMIN_EMAILS` allowlist |
| F5 | ⬜ Unverified | Check `CANDIDATES` dedup in `scripts/daily-autopsy.ts` |
| F6 | ⬜ Unverified | Check slug hint/override in `scripts/daily-autopsy.ts` |
| F7 | ⬜ Unverified | Check alias handling in `scripts/daily-autopsy.ts` |
| F8 | ✅ Partially | `lib/ai/index.ts` uses `generateObject()` (structured output) for generation; script-level `sanitizeJSON` status unverified |
| F9 | ⬜ Open | No model fallback chain in `lib/ai/index.ts` (single `AI_DEFAULT_MODEL`) |
| F10 | ⬜ Unverified | Check `lib/logo-service.ts` content-type/GET validation |
| F11 | ✅ Done | Workflow and scripts run via `npx tsx` |
| F12 | ✅ Done | `scripts/generate-embeddings.ts` removed; `scratch/` absent |

Items below are the original plan as written.

---

## Overview

Comprehensive audit and fix of the AI-driven case study generation pipeline (`scripts/daily-autopsy.ts`), covering 12 concrete issues plus 2 major feature gaps. Each item is scored by impact, effort, and dependency order.

---

## Priority Matrix

| ID | Issue | Impact | Effort | Type |
|----|-------|--------|--------|------|
| F1 | Workflow env mismatch + consolidation | Critical | Small | Bug |
| F2 | Embedding dimension mismatch (768 vs 1024) | Critical | Small | Bug |
| F3 | No web search / fact verification | High | Large | Feature |
| F4 | No content review queue (human-in-the-loop) | High | Large | Feature |
| F5 | Duplicate candidates in queue | Medium | Tiny | Bug |
| F6 | Slug generation doesn't match DB check | Medium | Tiny | Bug |
| F7 | No alias/normalization system for company names | Medium | Small | Enhancement |
| F8 | LLM JSON parsing is fragile (regex hacks) | Medium | Small | Bug |
| F9 | Single hardcoded model — no fallback | Medium | Small | Enhancement |
| F10 | Logo service unreliable (HEAD-only check) | Low | Small | Bug |
| F11 | ts-node vs tsx inconsistency | Low | Tiny | Bug |
| F12 | Scratch files + deprecated scripts clutter | Low | Tiny | Chore |

---

## Item F1 — Workflow Consolidation

**Problem:** Two nearly-identical GitHub Actions workflows:
- `daily-autopsy.yml` — midnight UTC, passes `OPENROUTER_API_KEY` (wrong var), uses `npx tsx`, no commit/push. **This workflow always fails.**
- `daily-publish.yml` — 5 AM UTC, passes `NVIDIA_API_KEY` (correct), uses `npx ts-node --project tsconfig.json`, has commit/push + manual trigger.

**Solution:**
1. Keep `daily-publish.yml` as the base (correct env, commit/push, manual dispatch).
2. Merge in `npx tsx` runner from `daily-autopsy.yml` (simpler, no tsconfig flag needed).
3. Remove `daily-autopsy.yml`.

---

## Item F2 — Embedding Dimension Mismatch

**Problem:**
- Migration `001` created `embedding vector(768)` for Gemini.
- Migration `003` changed to `embedding vector(1024)` with comment "was 768 for Gemini, now 1024 for NVIDIA nv-embedqa-e5-v5".
- But `nv-embedqa-e5-v5` actually outputs **768-dimensional** vectors, not 1024.
- The RPC function `match_case_studies()` also expects `vector(1024)`.
- Result: either the migration was never applied (column stays 768), or inserts silently fail on embedding column.

**Solution:**
1. Create migration `008` that alters column back to `vector(768)`.
2. Update `match_case_studies()` RPC to accept `vector(768)`.
3. Add IVFFlat index on `embedding` for efficient similarity search at scale (thousands of cases).

---

## Item F3 — Web Search / Fact Verification (Feature)

**Problem:** All case study content is generated entirely from the LLM's training data. Quotes, URLs in `sources`, funding round distributions, and historical claims may be hallucinated. No cross-referencing against real sources exists.

**Solution:**
1. Integrate **Tavily Search API** (AI-native web search, returns concise results with source URLs).
2. Add a Stage 3.5 in `daily-autopsy.ts` between content generation and saving:
   - Extract factual claims from generated content (dates, funding figures, competitor names, quotes).
   - Search web for each claim.
   - Cross-reference and flag discrepancies.
   - Append verified sources to the case study metadata.
3. Add `verified_sources` JSONB column to `case_studies`.
4. Add `fact_check_score` (0–100) to indicate confidence in generated facts.

---

## Item F4 — Content Review Queue (Feature)

**Problem:** Every generated case study auto-publishes immediately with zero human oversight. No way to moderate, edit, or reject before going live.

**Solution:**
1. New Supabase migration `009` — add `review_status` column to `case_studies`:
   - `draft` (default for new AI-generated cases)
   - `in_review` (ready for human review)
   - `published` (approved, visible on site)
   - `rejected` (discarded)
2. Modified `daily-autopsy.ts` output: save new cases with `published: false` and `review_status: 'draft'`.
3. New API route `POST /api/review` — authenticated admin endpoint to approve/reject/edit.
4. Simple admin panel component (or document the API for future UI).
5. The existing `submissions` table (from migration 007) can serve as a feeder into the same queue.

---

## Item F5 — Duplicate Candidates

**Problem:** The `CANDIDATES` array contains duplicates:
- `Quibi` at lines 295 and 409
- `Theranos` at lines 295 and 430
- `Blockbuster LLC` / `Blockbuster (video games)` — near-duplicates

**Solution:** Deduplicate array. Keep the canonical name in the canonical position; remove secondary entries. Add a Set-based dedup guard on insertion.

---

## Item F6 — Slug Generation Mismatch

**Problem:** The script generates a candidate slug for queue-scanning (`candidate.toLowerCase().replace(/[^a-z0-9]+/g, '-')`) at line 446, but the LLM generates its own `slug` in the metadata Stage 1. If they differ, the pre-check (line 533) doesn't catch the real slug, leading to a DB `duplicate key` error.

**Solution:** Add a `slug` hint to the LLM prompt so it generates the exact slug the script expects. Also add a post-generation validation that compares the AI's slug to the expected one; if different, override with the script's deterministic version.

---

## Item F7 — Company Name Aliases

**Problem:** Some candidates have parenthetical descriptors: `Diapers.com (Quidsi)`, `Uber (China — didi merger)`, `General Motors (2009 bankruptcy)`. The LLM may generate the base name or the parenthetical name as `company_name`, causing duplication or mismatch.

**Solution:** Add an `aliases` metadata field: companies can have primary names and alias names. The queue logic checks both the name and its aliases against existing DB entries.

---

## Item F8 — LLM JSON Parsing

**Problem:** The `sanitizeJSON()` function (lines 139–156) uses regex hacks:
- Strips code fences
- Regex-inserts quotes around unquoted keys
- Removes trailing commas
- Counts quotes/braces and appends missing closers

This works for common failures but silently corrupts edge cases (escaped quotes inside strings, nested JSON with special characters).

**Solution:** Replace with a multi-strategy parser:
1. First attempt: direct `JSON.parse()`.
2. If fail: try `sanitizeJSON()` as fallback.
3. If still fail: use a more robust approach — extract the largest valid JSON substring by brace-matching.
4. Add structured error logging to capture and review failure patterns.
5. Consider switching to the Vercel AI SDK's `generateObject()` (already used in `lib/ai/index.ts`) which guarantees valid structured output via tool calling, replacing manual JSON generation entirely.

---

## Item F9 — Model Fallback Chain

**Problem:** Both `daily-autopsy.ts` and `lib/ai/index.ts` hardcode a single model (`meta/llama-3.1-70b-instruct` at the script level, `AI_DEFAULT_MODEL` at the service level). No fallback if the model is deprecated, rate-limited, or returns errors.

**Solution:** Implement a model fallback chain:
1. Primary: `meta/llama-3.1-70b-instruct` (high quality).
2. Fallback 1: `meta/llama-3.1-8b-instruct` (lower quality but always available).
3. Fallback 2: Fail gracefully with a diagnostic message.
4. Add `FAILED_ATTEMPTS` counter per model and auto-switch after N consecutive failures.

---

## Item F10 — Logo Service Reliability

**Problem:** `lib/logo-service.ts` only does `HEAD` requests to Clearbit. A `HEAD` 200 doesn't guarantee a useful logo image — Clearbit returns a generic placeholder SVG for unknown domains that still returns 200 OK. No content-type or image-dimension validation.

**Solution:**
1. After Clearbit HEAD 200, do a GET and check `Content-Type` header (must be `image/*`).
2. Optionally check image dimensions (≥ 64×64) via a streaming header read.
3. Added benefit: log which domains fail so the candidate list can be manually enriched.

---

## Item F11 — ts-node vs tsx Inconsistency

**Problem:** `daily-autopsy.yml` uses `npx tsx`. `daily-publish.yml` uses `npx ts-node --project tsconfig.json`. Different runners, different startup behavior.

**Solution:** Use `npx tsx` everywhere (simpler, no tsconfig flag, faster startup, maintained by the same team as Next.js).

---

## Item F12 — Scratch Files + Deprecated Scripts

**Problem:** 12 test files in `scratch/` and `scripts/generate-embeddings.ts` (deprecated) clutter the repo.

**Solution:**
- Remove `scripts/generate-embeddings.ts`.
- Remove all files in `scratch/` directory.
- Ensure `.gitignore` includes `scratch/` for future use.

---

## Execution Order (dependency-driven)

```
1. F12 — Scratch cleanup (no deps)
2. F11 — tsx consistency (no deps)
3. F5  — Deduplicate candidates (no deps)
4. F1  — Workflow consolidation (no deps on code)
5. F2  — Embedding dimension + index (DB migration)
6. F6  — Slug generation fix (after F2 conceptually independent)
7. F7  — Alias system (after F5)
8. F10 — Logo service fix (no deps)
9. F9  — Model fallback chain (independent)
10. F8 — JSON parsing robustness (after F9, F3 may affect prompts)
11. F3 — Web search integration (major feature)
12. F4 — Content review queue (major feature)
13. All verification
```

---

## Edge Cases & Risks

- **Embedding migration failure:** If existing rows have 1024d vectors, altering to 768 will fail. Solution: drop and regenerate embeddings.
- **Workflow removal:** If `daily-autopsy.yml` is the only one running, removing it before fixing `daily-publish.yml` means no automation for a day. Fix: update `daily-publish.yml` first, verify, then remove the other.
- **Tavily API key:** Requires a new env var `TAVILY_API_KEY`. Document in `.env.example`.
- **Review queue admin:** Requires an admin authentication check. The existing auth system (`lib/auth/index.ts`) can validate admin roles.
