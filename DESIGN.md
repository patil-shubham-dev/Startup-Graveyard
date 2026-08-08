# Design — Start-up Graveyard

Design record for the home-page build and its supporting decisions. Scope:
`app/page.tsx`, `components/site/Header.tsx`, `app/globals.css`, and the
`data/case-studies/*.json` content model this page renders.

## 1. Direction

The site is a forensic archive of startup failures. The design follows the
canon established in `PRODUCT.md`: **a printed research volume, translated to
the web** — institutional, quiet, and text-first. It borrows the editorial
discipline of *The Economist*/*FT*, the interaction cleanness of
Linear/Stripe/Vercel, and the restraint of McKinsey/BCG, keyed by a single
warm accent. Success is felt through type and spacing, not decoration.

Overriding rules, in order: no decoration without purpose; no kitsch;
no invented claims (every figure on the page must trace to a case file).

## Design tokens

Defined in `app/globals.css` under `@theme`.

| Token        | Value      | Use                                                        |
| ------------ | ---------- | ---------------------------------------------------------- |
| `paper`      | `#faf9f6`  | Page background, content surfaces                          |
| `paper-2`    | `#f3f1eb`  | Alternate section band (`bg-paper-2` problem section)      |
| `ink`        | `#1b1a17`  | Headlines and body text (near-black warm)                  |
| `ink-mute`   | `#63615a`  | Secondary text, captions, meta                             |
| `line`       | `#e7e4dc`  | Hairlines, table borders, card edges                       |
| `accent`     | `#8f2d1d`  | Selection, focus rings, decoration only                    |
| `accent-deep`| `#7a2416`  | Interactive accents: CTAs, text links (10:1 on paper)      |
| `accent-deeper`| `#681e11`| Hover state for `accent-deep` elements                     |
| `well`       | `#141311`  | Dark band (living archive section)                         |
| `well-ink`   | `#f2f0e8`  | Text on the dark well                                       |
| `well-mute`  | `#a6a39a`  | Secondary text on the dark well                            |
| `well-line`  | `#2b2925`  | Borders on the dark well                                   |

There are two accent tiers on purpose: `accent` is reserved for moments that
decorate (selection highlight, focus), while `accent-deep`/`accent-deeper`
carry meaning that must clear WCAG AA on `paper`. They must not be merged.

### Typography

- **Sans** — `var(--font-geist-sans)` for the interface; tight tracking on
  headlines (`tracking-tight`), sentence case, `font-semibold` max.
- **Mono** — `var(--font-geist-mono)` for metadata: ledger figures, case
  numbers, section slugs (`/ask`, `/pre-mortem`), filed dates. Digits are
  `tabular-nums` so ledger and tables align.
- **Serif** — Georgia only for accent voice moments: the hero *"didn't make
  it"* em, the closing blockquote.

Text is justified to comfortable measure (`max-w-xl`/`max-w-3xl`); `text-wrap:
balance` on headings, `text-wrap: pretty` on paragraphs (base layer).

## Page structure (`app/page.tsx`)

1. **Hero** — headline with serif em, one-line definition, two CTAs
   (primary `accent-deep`, secondary outline), the six-cell ledger `dl`,
   and the headstone engraving (see Imagery).
2. **Archive search** — GET form (`action="/explore"`) with a named `q`
   input; the Explore page reads `searchParams.q` into `ExploreClient`'s
   initial search state.
3. **The problem** — `paper-2` band; headline left, three paragraphs right,
   inline pattern link.
4. **Featured case** — a spotlight on the highest-funded published case
   with ≥3 timeline events (currently Katerra): raised/lifespan/industry
   `dl`, and a vertical timeline rail of its first four events with dot
   markers.
5. **Failure modes** — the top six `failure_reasons` counted across
   published cases, each with a mono count, linking to `/insights`. No
   hardcoded labels — computed from the data.
6. **AI tools** — two cards `/ask` and `/pre-mortem`, mono slugs, outline
   buttons.
7. **Living archive** — dark `well` section stating cadence, the current
   `{cases} documented · {published} published · {inReview} in review`, and
   a computed `total capital raised` figure (sum of published
   `funding_raised`, cents → `formatCurrencyCompact`).
8. **Close** — serif blockquote centered, CTA pair.

Every stat on the page is computed from the live ledger (`getLedgerStats()`,
with a local-JSON fallback) or from the case files themselves — no hardcoded
counts. All copy is grounded — no invented numbers.

### Header (`components/site/Header.tsx`)

- Sticky, `bg-paper` with `border-line` hairline; 64px rail.
- Desktop: inline `nav` (`md:flex`) with the four destinations.
- Mobile (< md): a single `<details>/<summary>` "Menu" disclosure — native,
  keyboard- and screen-reader-friendly (no JS state), chevron rotates on
  `open`, dropdown is absolutely positioned under the rail.
- Right: two `Sign in` and `bg-ink`→`accent-deep` hover, separate from nav.

## Motion

- A single entry animation, `rise` (14px fade-up, 700ms), staggered via
  `rise-1…rise-4` on hero elements.
- Scroll reveal: `components/site/Reveal.tsx` (framer-motion `whileInView`,
  once-only, `viewport` margin -80px) — 14px fade-up, 700ms, same easing as
  `rise`. Used on section headers and cards down the page, with a
  `delay` prop for stagger (0.08–0.1s between siblings). Rendered as a plain
  div under `prefers-reduced-motion`.
- Fully disabled under `prefers-reduced-motion: reduce` (both `rise` and
  `Reveal`), and page scroll is returned to `auto` there.
- CTA press feedback is `active: scale-[0.96]` — physical, not decorative.

## Imagery

- `public/engraving-2.webp` (1477×1065, WebP q80) — the home-page hero
  graphic: a fine-line copperplate engraving of a blank headstone on a
  cream field, positioned absolute right of the hero (desktop only,
  `hidden md:block`), `mix-blend-mode: multiply`, opacity 0.5 (0.6 hover),
  with a left-to-right mask fade so the headline column stays legible. The
  engraving's top third is intentionally empty negative space for the
  headline to sit over. Loaded via `next/image` with `priority`. (The
  superseded transparent `public/engraving.png` remains unreferenced.)
- `public/textures/paper.jpg` (1254×1254, warm-white ~#f2f1ed) — paper grain
  for light surfaces. Applied as a fixed `body::before` overlay
  (`background-size: 512px`, `opacity: 0.45`) and as the `.texture-paper`
  pseudo-element on `bg-paper-2` bands. Subtle by design — materiality, not
  decoration.
- `public/textures/well.jpg` (1254×1254, near-black ~#141311) — dark stock
  grain for the `well` band via `.texture-well` pseudo-element. Matches the
  `well` token tone; adds felt-like depth.
- `public/mark.png` (128×128 display, keyed transparent) — header wordmark
  mark: fine copperplate linework of a blank headstone (rounded top, empty
  oval inscription recess) in warm near-black ink on a cream field
  (corner tone 249,248,242), background keyed to alpha at 128×128 (4× for
  the 20px header slot). The first generated version came back inverted
  (light headstone on a near-black field, shaded) and was rejected;
  regenerated with explicit dark-ink-on-light-paper constraints and
  verified: transparent corners, 12.5% of visible pixels are dark ink at
  the served size. `public/logo-placeholder.png`
  (256×256) — logo fallback for case graphics (not yet rendered in UI).
- `public/grave-marker.webp` (900×675, WebP q80, 42KB) — fine-line
  engraving of an unmarked grave on a cream field (corner tone
  250,249,244 ≈ paper). Used on the global 404 ("This grave is unmarked.")
  and the case not-found ("No case file by that name."): right-column
  plate at 280px (desktop) / min(56vw, 300px) (mobile), rendered with
  `mix-blend-mode: multiply` (cream field x paper is imperceptible — the
  established engraving treatment) plus a vertical fade mask (transparent
  0-12% / black 12-88% / transparent 100%). Decorative — `alt="",
  aria-hidden`.
- **Asset pipeline:** all engravings ship as WebP q80 (effort 6) — the
  fidelity ceiling for shaded linework; ink ratios are preserved exactly
  (engraving 8.1→8.2%, archive seal 45.4→45.3%) and a 250KB target is not
  reachable without visible banding. Sizes: `engraving-2.webp` 1030KB
  (was 4011KB PNG), `archive-mark.webp` 422KB (was 1538KB),
  `grave-marker.webp` 42KB (was 476KB). The header `mark.png` (11.2KB) is
  small enough to stay PNG. PNGs are keyed-to-alpha only when the ink is
  pure linework with no soft shading; soft-shaded plates get the multiply
  treatment instead (alpha keying haloed the shaded 404 plate).


## Accessibility

- **Contrast (all verified by computed measurement in Playwright, WCAG AA):**
  CTA `#7a2416` on `paper` 10.1:1; `ink-mute` text 5.89; well-section h2
  16.27; well-mute paragraph 7.36. The original `accent` was too weak for
  interactive elements (3.39:1), which is why `accent-deep`/`accent-deeper`
  exist.
- **Keyboard/focus:** visible 2px `accent` ring with 2px offset on
  `:focus-visible`; skip link in components layer.
- **Reduced motion** honoured (see above).
- **Semantics:** heading order, `dl/dt/dd` ledger, `aria-label="Primary"`
  nav, `aria-label` on mobile menu summary. Exactly one landmark:
  `<main id="main">` lives in `app/layout.tsx`; every page renders its
  content as a plain `<div>` inside it (no nested `<main>`), verified per
  route in Playwright.

## Data model & ledger

- **Source of truth: Supabase `case_studies` table** (hosted project), synced
  from the editable content model `data/case-studies/*.json` by
  `scripts/seed-case-studies.mjs`. The seed is an idempotent upsert keyed on
  `slug`; embeddings are stored as `vector(1024)` (files with a wrong-dim
  embedding are stored as NULL); DB rows with no local file are reported and
  left untouched, never auto-deleted.
- When Supabase is unreachable every page falls back to
  `readAllCases()` over the local JSON — both paths must stay in step, which
  the seed enforces.
- `funding_raised` is stored in **cents** (BIGINT). All display formatting
  goes through `formatCurrencyCompact` in `lib/utils/format.ts` (divides by
  100). Do not render `funding_raised` with a page-local formatter — that was
  the source of a $100B-vs-$1B display bug on `/insights`.
- Generation is single-source for money and valuation: `metrics
  .capital_raised` and `metrics.peak_valuation` were removed from the
  `CoreMetadataSchema` in `scripts/daily-autopsy.ts` and its prompt — the
  top-level `funding_raised` / `valuation_peak` fields are the only source
  (dossier's `DUPLICATE_METRIC_KEYS` skips are now vestigial guards for
  legacy rows).
- **Ledger (home, about, pre-mortem):** computed by `getLedgerStats()` in
  `lib/db/case-studies.ts` — service-role counts all rows (including drafts),
  falls back to anon published-only, then to `ledgerFromCases()` over local
  JSON. `app/api/archive-stats/route.ts` exposes the same numbers to client
  components (`{documented, published, industries, span}`), cached
  `max-age=3600` with revalidation tags `stats`/`case-studies`. After any
  seed, bust the cache via `/api/revalidate` (requires `REVALIDATION_SECRET`)
  or restart the server.
- Current live ledger: `Cases documented 20 · Published 16 · Under review 4
  · Industries 12 · Archive span 2014–23` (normalized taxonomy seeded
  2026-08-08; `/api/revalidate` busted cache — `/api/archive-stats`
  confirms `documented 20, published 16, industries 12`).

## Verification process

- Algorithms computed-style sweeps in Playwright (desktop 1440×900, mobile
  390×844): `overflowX === 0`, sticky header, real font stack, ledger
  values, table row counts, mobile-menu open state.
- `tsc --noEmit` and eslint run clean after every type of change.
- A data script re-reads every JSON to assert it still parses, and greps for
  any stale capital figures to evolve.
- After editing `data/case-studies/*.json`: run
  `node --env-file=.env.local scripts/seed-case-studies.mjs`, then confirm
  `/api/archive-stats` matches the local file counts.

## Known limitations / follow-ups

- `better-dot-com.json` is a **rejected guard record** (`published: false`,
  review_status `rejected`, fact-checked 2026-08-08): Better Home & Finance
  is still operating (NASDAQ: BETR — Q2 2026 funded volume $1.67B, +38%
  YoY), so the file's "shutdown 2022" claim was inaccurate. It stays on disk
  so the daily pipeline's dedup guard can never regenerate a fictional
  shutdown case for it. `review_notes` + `verified_sources` carry the full
  evidence trail.
- Seed governance: `seed-case-studies.mjs` **preserves DB governance by
  default** (`published` / `review_status` / `published_at` /
  `review_notes` are kept from the DB when a row already exists); pass
  `--force` to re-sync governance from the files (e.g. after a rewrite like
  Better's).
- `juicero` has a NULL embedding (its file carries a 768-dim vector;
  column is 1024). Re-run `re-embed-existing.ts` before any RAG work that
  should return it.
- One DB-only row remains: `fab-com` (Fab.com, unpublished draft) — the
  pre-renaming artifact, left untouched by design (seed never deletes).
- `scripts/seed-case-studies.mjs` is still a manual runbook step today;
  wiring it into the daily automation (post-edit sync) is a follow-up.

## Editorial elevation (2026-08-07)

A refinement pass over the committed world — same concept, same palette,
same families. Raised the emotional register from "correct" to "archival
publication" without adding decoration.

### System additions (`app/globals.css`, components layer)

- `.label-catalog` — 10px mono, 0.18em tracking, uppercase, ink-mute. The
  single museum-label voice for all data labels (ledger headers, timeline,
  case-file marks, search). Never used as a kicker above headings.
- `.btn` + variants (`.btn-primary`, `.btn-outline`, `.btn-well`,
  `.btn-well-outline`) — printed-label buttons: mono 11px uppercase
  0.16em, 2px radius, hairline borders, 44px touch height, `scale(0.98)`
  press. Replaced all rounded-md SaaS buttons.
- `.link-editorial` — mono uppercase accent-deep link with a 1px underline
  that draws on hover (background-size transition). Used for inline
  "explore" actions.
- `.link-nav` — same underline animation, inherits color; used in header
  and footer nav.
- `.field` / `.field-well` — rectangular ledger inputs: hairline border,
  2px radius, accent-deep focus border + soft ring. Replaced rounded-md
  inputs on home search, `/ask`, `/pre-mortem`.

### Homepage changes

- **Hero:** engraving is now a 5%-opacity watermark bleeding off the right
  edge of the full-bleed section (`-z-10`, printed under the fixed paper
  grain), visible at all viewports instead of desktop-only. Headline raised
  to `text-7xl`, tracking -0.03em; lede widened to `max-w-2xl`; ledger
  labels converted to `.label-catalog` with `gap-y-10` rhythm. Rhythm:
  hero large → problem medium → case large → modes compact → tools medium →
  well dramatic → close calm.
- **Search:** label `SEARCH THE ARCHIVE`, `.field` input, `SEARCH RECORDS`
  button, and a mono hint row (company · founder · industry · funding ·
  failure pattern · year · root cause).
- **Featured case:** oxblood evidence mark (6px square + `CASE FILE ·
  FEATURED`), headline to `text-5xl`, dl to `text-2xl` values with catalog
  labels. Timeline is now an archival rail: hairline rule, square
  registration markers, mono dates, `No. 01` accession numbers, four
  records.
- **Failure modes:** ledger matrix — hairline row tops, `01`-`06` index
  numbers, counts reduced to `text-xl` muted so the section reads compact
  under the featured case.
- **AI tools:** rule-divider columns (vertical hairline on md) instead of
  implied cards; slug labels in `.label-catalog`.
- **Living archive:** `ARCHIVE LEDGER` header row with trust strip
  (`HUMAN-REVIEWED · FACT-CHECKED · UPDATED WEEKLY`), headline to
  `text-5xl`, and a pipeline footnote (`AUTOMATED DRAFTING → FACT-CHECK →
  HUMAN REVIEW`). Ledger labels tightened to 11px / 0.16em.
- **Close:** hairline rule above the serif quote; buttons converted.

### Header / Footer

- Header nav, mobile menu, and Sign in are mono 11px uppercase 0.14em with
  the `link-nav` underline animation.
- Footer is now a closing-page: editorial block with "archiving since
  {span start}" derived from the live ledger, pipeline line, catalog
  column headings, `link-nav` links, and a bottom bar motto (`EVIDENCE
  OVER OPINION · RESPECT FOR THE DEAD`).

### `/about`, `/ask`, `/pre-mortem`

Previously unstyled pages; now inside the same shell: catalog label +
h1 + measure-constrained body. `/ask` transcript uses hairline rows with
`INQUIRY` / `GRAVEYARD INTELLIGENCE` mono labels; `/pre-mortem` wizard
uses the ledger rows, numbered `01-03` steps, `.field` inputs, and an
archival 3px risk bar with mono level/score labels.

### Notes

- No new assets, no new fonts, no JS added. All metadata text keeps
  ≥5.89:1 on paper and ≥7.36:1 on the well.
- The `.texture-well::before` opacity fix (0.45, matching
  `.texture-paper::before`) from the overlay bug remains in force — the
  well band shows its grain without covering content. *(Superseded by the
  Aug 2026 layering fix below: grain now paints at `z-index: -1` behind
  content, opacity 0.45 paper / 0.55 well.)*
### Premium refinement (Aug 2026)

Home-page polish pass, no redesign: same tokens, same editorial system.

- **Engraving:** moved up to the hero top edge (top-aligned with the
  running head), 640px tall, bleeding off the right (-6%, 52% width on lg),
  masked to the stone band (transparent 0-1% / solid 7-88% / transparent
  96%), object-position center 62%, opacity 0.16 mobile / 0.2 desktop,
  darkens to 0.26 on hero hover. Rendered with `next/image` (fill,
  priority, sizes 60vw).
- **Stats row -> ticker:** thin 36px full-width marquee below the hero CTA
  (border hairlines, paper-2 band): DOCUMENTED CASES / PUBLISHED / UNDER
  REVIEW / INDUSTRIES / AVERAGE LIFESPAN / ARCHIVE SPAN with `•` between
  each label and value. 4 track copies, 20s linear drift (reduced motion:
  60s slow drift, not a full stop), pauses on hover, aria-hidden on
  duplicate copies.
- **Atmosphere:** body::after fixed grain + vignette (SVG fractal noise,
  5% sepia alpha, 160px tile; radial edge fade). Well gains a museum plate:
  14px inset hairline + 9% warm print noise.
- **Section rules:** section-index hairlines were removed on request; the
  home page now relies on hairline rules, alternating paper tones, and
  catalog-style kickers (e.g. `FAILURE MODES · 6 recorded`) for chapter
  feel. Search opens with its own editorial panel (`SEARCH THE ARCHIVE ·
  N documented cases`, hairline top + bottom).
- **Search:** Q. prefix in the field with its own reserved left padding
  (`field-search`: appearance none, native WebKit search chrome disabled,
  44px left padding so the placeholder clears the affix), facet hint row
  relabeled `Search by` with 4px dot separators; input carries its own
  aria-label.
- **Featured case:** right rail labelled `Timeline · First four records`,
  square registration dots (last record oxblood), No. 01-04 accession
  numbers, mono dates; dl values in 2xl tabular figures.
- **Failure patterns:** hairline prevalence bars (`h-px`) scaled to the
  top mode + `X% of files` note; index 01-06.
- **Buttons:** weight 600, tracking 0.18em, padding 0 1.75rem, outline
  hover fills paper-2 (printed-label press).
- **Footer:** metadata strip (archive established 2026 / last updated /
  editorial standard / publication model) derived from the live ledger.
- **Texture layering fix:** .texture-paper/.texture-well now use
  isolation: isolate with the grain pseudo-elements at z-index: -1.
  Previously the positioned pseudo-element painted *above* in-flow content:
  paper.jpg (lum 241) at 0.45 washed ink text, well.jpg (lum 20) at 0.55
  crushed light text to ~4:1. Text now renders at full ink (verified by
  pixel decode: h1 cores lum 24, well h2 glyphs lum 235-239).
- **Verification:** Playwright harness (31 checks: geometry, computed
  styles, real hover states, reduced motion, contrast ratios, zero page
  errors) kept in `%TEMP%\opencode\refine\verify.mjs`; screenshots no longer
  stored in the repo.

### Production launch polish (Aug 2026)

Final launch pass: the home page as a finished editorial artefact, not a
draft. Same tokens; every addition is printed, catalogued, or stamped.

- **Headline (Option A):** two-line block — `Failure leaves clues.` (sans,
  tracking -0.032em) over `The archive preserves them.` (serif italic,
  block-level, mt 2/1/3). Dropped mobile size to text-4xl so the two
  sentences stay a tight two-line lockup at 390px; md back to text-7xl.
- **Engraving 2.0:** replaced `engraving.png` with a copperplate plate
  (`engraving-2.webp`, 1477×1065) generated as an opaque cream PNG and
  keyed to a real alpha channel (luminance-distance key, corner rgb
  (231,223,210) -> transparent; ink retained). Uses `mix-blend-mode:
  multiply` so the light-grey engraving ink darkens the paper (`ink *
  paper`) instead of washing a grey veil over it — plain opacity alone
  plateaued at ~235 vs 241 (barely visible). Final geometry — size down
  25-27% from the earlier full-bleed plate so it reads as a supporting
  element, not the hero: `w-[66%] sm:w-[58%] md:w-[50%] lg:w-[48%]`
  (desktop 691px vs 950px before), height 480px (was 640px), `right:
  -2%` so the right edge stays partially cropped (~29px bleed) but the
  mass shifts to centre-right (plate left 778, ink core x ~1193-1365)
  instead of hugging the edge. Opacity ladder 0.5 / 0.5 / 0.6 hover,
  mask band unchanged. Measured ink vs paper: desktop Δ23 (215 vs 238),
  tablet Δ9, mobile Δ6 (conservative — mobile paper baseline is
  understated by the headline box). Verified at 1440/900/390: h1 copy
  ends x1064 (desktop) so the ink core clears it; all CTA buttons sit
  below the plate bottom (y480); no horizontal overflow.
- **Archive watermark:** new `archive-mark.webp` (1254×1254 circular seal,
  keyed transparent). Used as a faint institutional stamp in exactly two
  places — the search section (right, 50% width, max 560px) and the
  footer (right, 50%, max 420px) — at opacity 0.045 with
  `mix-blend-mode: multiply` and a radial mask fading to transparent at
  78%. Pointer-events none, aria-hidden, behind content (z 0 vs. relative
  content).
- **Search centrepiece:** kicker now carries an oxblood dot + label
  (`SEARCH THE ARCHIVE · 19 documented cases`), sub is a real search
  brief (company / founder / funding history / warning sign / pattern).
  The watermark stamp sits behind the form; the Q. affix field and
  `Search records` button unchanged.
- **Featured case -> evidence folder:** accession line under the company
  name — `No. CASE-MQB8OX1K · Filed JUNE 2026` (from live case data) —
  and the dl grew from 3 to 5 cells: Raised / Peak valuation /
  Lifespan / Peak headcount / Industry. Peak valuation via
  `extractValuationPeak` (field absent from the CaseStudy type).
- **Failure patterns -> research findings:** kicker reworded to
  `RESEARCH FINDINGS · 6 recorded across 19 files` with oxblood dot;
  counts bumped from text-xl mute to text-2xl ink (register figures).
- **AI tools -> archive instruments:** the two columns are now
  `ARCHIVE INSTRUMENT · /ask` / `ARCHIVE INSTRUMENT · /pre-mortem` with
  oxblood dots, renamed `Archive terminal` and `Forensic pre-mortem`,
  each with a mono instrument-status line grounded in real ledger counts
  (`Grounded in N published case files` / `N failure patterns on file`).
- **Living archive:** kicker added — `VOLUME I · THE LIVING ARCHIVE`
  (well-mute + hairline dot), h2 keeps the serif weekly. em.
- **Footer -> final archive page:** watermark stamp bottom-right;
  metadata strip renamed: Archive volume (Vol. I · 2026) / Archive
  version (Milestone 24) / Last updated / Editorial standard; Tools
  column -> `Instruments` with the renamed links; closing line now
  carries the review-queue count (`Evidence over opinion · N cases
  awaiting review`).

### Archive register — /explore (Aug 2026)

New surface, same world: the archive index as a printed register of plates.
Assigned by surface seed 9fc2d8bb (candidate 4 of the grounded list); brief
in .impeccable/surfaces/app-explore-page-tsx.md.

- **Direction:** every published case is a ruled full-width plate, like the
  plate list of a museum catalogue. No card grid, no plain list. Accession
  order = published_at descending (newest filed first), computed on the
  server from eadAllCases() filtered to published — the shared loader, not
  a second fs read.
- **Plate anatomy:** mono accession line (No. 01 · Filed JUN 2026), company
  name at display size (3xl/4xl) that darkens to ccent-deep on hover,
  one-line summary at 15px/1.625, failure-pattern tags as 4px oxblood
  square + mono label (max 3, +N more), and a dossier rail (Raised /
  Lifespan / Industry) with label-catalog dt and mono tabular dd. The rail
  separates with order-l hairline on md+, order-t on mobile. Whole
  plate is one Link; hover fills paper-2 and the Open case file → arrow
  nudges. Focus-visible is the global 2px accent ring on the Link.
- **Accession stability:** plate numbers are fixed at load time via an
  accession map (slug -> index); filtering reorders the view, never the
  number. Verified: ScaleFactor reads No. 02 filtered and unfiltered.
- **Search:** Q. affix field (.field-search) filters live on keystroke;
  Enter / Search records commits the query to the URL (/explore?q=…) so
  register queries are deep-linkable. Facet hint line replaced with a mono
  count line (N files · indexed by accession · verified against sources).
- **Facet rail:** industry + failure-pattern chips computed from the data
  via useMemo (never hardcoded — replaces the incumbent's fixed 8+8 arrays).
  New system atom .chip / .chip-active in globals.css: mono 10px,
  0.14em, hairline border, 2px radius, 30px tall; hover darkens border to
  ink; active fills ccent-deep with paper text (9.54:1). Chips carry
  ria-pressed + a descriptive ria-label ("Fintech, 2 files"); counts
  are aria-hidden.
- **States:** result line above the plates (N of M records match /
  All N records in order of accession, ria-live="polite"), Clear all
  filters link-editorial when any filter is active, empty state (serif
  italic line + muted instruction + Clear search btn-outline). Loading is
  a skeleton of pulse bars on the header band; error is a serif line +
  Retry / Return home.
- **Contrast (computed):** body/labels/tags 5.89:1; h1 and dd 16.53:1;
  active chip paper-on-oxblood 9.54:1; hover name on paper-2 8.89:1.
- **Follow-ups (data-side, out of this build's scope):** the failure-pattern
  taxonomy carries near-duplicate labels ("Fintech" vs "Financial
  Technology", "Competition" vs "Intense Competition", "No Market Need" vs
  "Insufficient Market Need") which split the facet counts; normalizing in
  the JSON/seed content model (not the component) would tighten both the
  facet rail and /insights.

### Every remaining surface — case dossier, findings, forms, legal, shells (Aug 2026)

The last undressed pages now live inside the same editorial system. No new
tokens, no new families, no new assets.

- **Case dossier (`/case/[slug]`):** a printed case file. Back link,
  oxblood evidence mark + `CASE FILE · {case_number}`, name at 5xl/6xl,
  accession line (`No. {case_number} · Filed {date} · {country}` — country
  read via the incumbent `as unknown as` cast, it lives outside the
  CaseStudy type), summary, failure tags. Five-cell ledger dl (Raised /
  Peak valuation / Lifespan / Peak headcount / Industry) on a wider
  measure. Sections, each catalog-kickered: Case verdict (01-indexed
  top_reasons, `extractTopReasons`), The record (facts dl — metric keys
  duplicating the core cells are skipped via a DUPLICATE_METRIC_KEYS set),
  Timeline (hairline rows, mono dates, `N records` count), The narrative
  (MDXRemote + remarkGfm inside `.case-narrative`), Risk assessment
  (`RiskBar` gained level labels: Critical ≥70 / High ≥40 / Moderate ≥20 /
  Low, width clamped `max(2, min(100, score))`), Autopsy (warning signs /
  root causes, oxblood vs mute dots), Lessons (01-indexed, skips
  title==explanation dupes), Principals (founders / investors, `+N more`),
  Evidence (serif italic quotes with role figcaptions), Sources (hairline
  rows, `↗` mono type, `rel="noopener noreferrer"`), Related files (shared
  industry/pattern plates, computed from `readAllCases()`), and Archive
  instruments CTAs (/ask, /pre-mortem). Uses `readAllCases()` (shared
  loader) for both getCase and related. Content wrapped in ` ```mdx `
  fences is unwrapped before MDXRemote. Soft-404 for missing slugs:
  `notFound()` renders the route-level `app/case/not-found.tsx` with an
  injected `noindex` tag — Next 15.5's documented streamed status behavior
  (200 + noindex), identical to the incumbent pattern, not a regression.
- **Research findings (`/insights`):** server-rendered chapter (was a
  client chart page). Kicker with live counts, stats dl (Cases / Avg
  lifespan / Industries / Capital burned), Failure patterns prevalence
  (01-indexed hairline bars scaled to the top mode + `% of top` foot),
  Shutdowns by year (CSS flex bars — no chart lib), Industries list,
  Capital burned top five (links to dossiers), Archive instruments. The
  one client chart (recharts) was deleted; `recharts` is no longer a
  runtime dependency. All numbers computed from the case files at render
  time.
- **Forms:** `/submit` (Add to the archive) and `/auth` (Sign in / Sign up
  toggle). `.field` inputs with catalog labels, required attributes, real
  error state (`role="alert"`, accent-deep text — replaced the silent
  success), disabled/loading states on submit buttons, confirmation
  surface on success.
- **Editorial pages:** `/about` keeps its prose with a ledger dl (Cases
  documented / published / Industries covered / Awaiting review);
  `/terms` and `/privacy` keep copy verbatim in sectioned editorial
  layout (hairline rows, catalog kickers).
- **Shells:** shared `components/site/PageSkeleton.tsx` (label + pulse
  bars) and `components/site/PageError.tsx` (serif recovery line, Try
  again / Return home buttons). Wrapped by `app/loading.tsx`,
  `app/error.tsx`, `app/not-found.tsx` ("This grave is unmarked."),
  `app/case/[slug]/loading.tsx`, `app/case/error.tsx`, `app/case/not-found.tsx`
  ("No case file by that name."), and the `/insights`, `/ask`,
  `/pre-mortem` loading/error pairs.
- **New CSS atoms:** `.field-area` (min-height 6.5rem, resizable textarea)
  and `.case-narrative` (MDX prose: heading scale, accent-deep links,
  square/oxblood list marks, decimal-leading-zero ordered lists, serif
  blockquotes, table hairlines).
- **Taxonomy normalization (data):** the facet-splitting labels from the
  explore follow-up note are resolved in the content model. One-time
  script (kept out of the repo, in TEMP): Insufficient Market Need / Lack
  of Clear Market Need → No Market Need; Intense Competition →
  Competition; Regulatory / Lack of Regulatory Compliance → Regulatory
  Issues; Inability to Scale → Lack of Scalability; Financial Technology
  → Fintech; Hardware + Subscription → Hardware (only where
  business_model is "Hardware + Subscription" — jawbone, juicero).
  Result: 25 → 19 reason labels, 14 → 12 industries; 8 files updated,
  all still parse. Seed run 2026-08-08: 19 upserted, DB now carries the
  tightened facets (verified: `/api/archive-stats` reports industries 12).
- **Verification:** `tsc --noEmit` clean, eslint clean, impeccable
  detector 0 findings on all new surfaces, production build clean
  (`next build`: /insights now static with zero client JS), Playwright
  sweep of 14 routes × 2 viewports: every route 200, zero overflowX, zero
  console/page errors. `/case/[slug]` 404 status is a documented soft-404
  (noindex injected, verified in prod build).

### Archive hardline (Aug 2026)

Housekeeping pass: single landmark, paper OG card, WebP pipeline, seeded
taxonomy, lint gate restored.

- **Single landmark:** `<main id="main">` moved into `app/layout.tsx`
  (the only `<main>` in the app); all 12 pages converted their wrapper
  `<main>` to `<div>` — no nested landmarks. Verified per route (desktop +
  mobile, dev and prod build) that exactly one `<main id="main">`
  renders.
- **OG card (`/api/og`):** rebuilt from the dark-gold register (bg image
  `og-bg.png`, avg lum 30) to the paper editorial card: PAPER `#faf9f6`
  / INK `#1b1a17` / INK_MUTE `#63615a` / LINE `#e7e4dc` / ACCENT
  `#7a2416`; 24px hairline frame; oxblood square + mono uppercase top
  label (`START-UP GRAVEYARD · FORENSIC INTELLIGENCE ARCHIVE`); serif
  italic title 56px (44px > 40 chars), maxWidth 74%; mono uppercase badge
  (`CASE FILE` / type param replaces `_`); `VOL. I · EVIDENCE OVER
  OPINION` bottom-right. Defaults: `title='Failure leaves clues. The
  archive preserves them.'`. Rendered card: 1200×630, 24,430 bytes,
  corners at paper. `public/og-bg.png` deleted (no refs).
- **WebP pipeline:** all engraving plates shipped as WebP q80 (effort 6)
  — exact ink preservation, sizes 1030/422/42KB (from 4011/1538/476KB
  PNGs). 250KB per-asset target explicitly not chased: banding on the
  shaded engravings at that size violates the fidelity bar. Header
  `mark.png` (11.2KB) stays PNG. Superseded PNGs deleted from `public/`
  (git-recoverable).
- **Seed + revalidate:** taxonomy seed executed (19 upserted, 0
  inserted, DB-only row untouched); `/api/revalidate` busted
  `case-studies`/`stats`/`insights`; `/api/archive-stats` now serves the
  normalized counts. `/rss.xml` (16 items, valid XML) and `/api/health`
  (all services operational) smoke-passed.
- **Lint gate restored:** pre-existing script lint debt cleared —
  `daily-autopsy.ts` underscore-discard destructure, dead
  `extractLargestJSON` removed from `review-all-cases.ts`, `verify-rag.ts`
  real result-row type (no `any`), `*.cjs` files exempted from the TS
  import rule via `eslint.config.mjs` (CommonJS by definition), plus the
  standard `^_` ignore + `ignoreRestSiblings` conventions. `eslint` and
  `tsc` both exit 0 across `app`/`components`/`scripts`.

### Archive register v2 — /explore (Aug 2026)

The register rebuilt as a forensic research instrument (per the 24-section
v2 brief; supersedes the v1 plate list in the surface brief, retaining its
constraints: stable accession, computed counts, one tab stop per plate,
reduced-motion honored). Scope lock: `app/explore/*` only — no globals,
tokens, or type changes.

- **Frontispiece band:** `texture-paper`; kicker `The archive · N case
  files on record` (N computed from data) with the oxblood square; h1
  `A register of documented failures` at 4xl/6xl; intro paragraph; a
  `Reveal` on the header only. Right side is reserved for an engraved
  frieze (`public/archive-plate.webp`, 1600×360, 50% opacity + multiply +
  left fade mask) — auto-mounted server-side via `fs.existsSync`, page is
  fully functional text-first without it.
- **Sticky instrument bar** (`position: sticky; top: 4rem` below the h-16
  header): search (`Q.` affix, `type="search"`, commits to
  `/explore?q=…` on submit so queries deep-link), four filter dropdowns
  (Industry, Country, Failure cause, Funding) + Sort dropdown (9 sorts:
  newest filed default, oldest, alpha, funding, valuation, lifespan
  short/long, team, risk). A sentinel IntersectionObserver adds the hairline
  shadow when the bar sticks. Active filter chips + Clear all filters
  (link-editorial) sit under the bar; `aria-live="polite"` result line
  (N of M records match / All N records in order of accession).
- **Dropdowns are APG menu-buttons**, not chips: `FilterDropdown.tsx` with
  roving tabindex, option 0 as the "Any …" reset row, ArrowDown/Up/Home/
  End/Enter/Space/Escape/Tab, click-outside close, right-aligned menus for
  Funding/Sort (verified inside 390px viewports). Built around the
  `react-hooks/set-state-in-effect` lint rule: no setState in effects —
  open/close state lives on the trigger, the listbox receives focus via a
  DOM-only `focus()` effect; `aria-haspopup/expanded/controls/listbox/
  selected` throughout.
- **Plate anatomy v2:** accession + `Risk · {label}` (max of
  `risk_scores`, dossier thresholds Critical ≥70 / High ≥40 / Moderate
  ≥20 / Low, oxblood dot); name 3xl/4xl darkening to accent-deep on
  hover; kicker industry · country · years; summary clamped 3 lines
  (2 mobile) with mask fade; ≤3 failure-reason tags + "+N more"; meta
  panel `dl` 1×4 desktop / 2×2 mobile — Raised (with proportional funding
  bar, min 3% width, relative to archive max $3.6B Argo AI), Peak
  valuation, Lifespan (start/end dots on a rail across the archive year
  span 2003–2023), Peak team. Related line inherits the dossier rule
  (shared industry OR failure reason, slice 3); sources count shown only
  for the 8 files that have them (honesty gate — no invented rows).
- **Hover preview** (`aria-hidden`, pointer-hover only, removed under
  reduced-motion): Principals / Backers / Record (valuation, team,
  sources, primary cause) in a bordered panel sliding in from the left
  below the plate — never overlays the row. Whole plate is one Link; the
  toolbar's hairline doubles as the first plate's rule.
- **Honest data gates:** no "most viewed / most similar / failure score"
  sorts (no data exists for them); every count, tag, and year computed
  from the JSON via useMemo — nothing hardcoded.
- **Empty + end states:** empty — serif italic `No records match this
  query.` + instruction + Clear search (btn-outline), art reserved
  (`public/archive-empty.webp`, 800×600) above it; end band — `Continue
  the investigation` (label-catalog) + serif italic line + links to the
  pre-mortem engine and the dossier archive.
- **Performance:** no virtualization — 16 rows is beneath the cost of a
  windowing dependency; `React.memo` on the plate + memoized filter/sort
  pipelines keep interactions at zero-jank. Verified by Playwright: 29
  checks (desktop + mobile + reduced-motion) incl. keyboard dropdown
  navigation, URL commit, no console errors, no horizontal overflow.
- **Assets (done 2026-08-08):** the two engravings were authored as pure
  SVG linework (cream ground `#f2f1ed`, ink `#d8d4c8` — no shading, no
  gray blend) and rasterized with sharp → `public/archive-plate.webp`
  (1600×360, ink coverage ≈3%) and `public/archive-empty.webp` (800×600,
  ink ≈2%). The page mounts them automatically; no changes needed in
  plate/empty-state components.
- **Follow-up (data-side, done 2026-08-08):** failure-reason labels were
  canonicalized across `data/case-studies/*.json` (near-dupes like
  "Poor Execution" → "Execution", "Regulatory Issues" → "Regulatory",
  "Lack of Traction" → "No Market Need"). The canonical list and map now
  live in `lib/taxonomy.ts` (`canonicalizeFailureReasons`), re-applied by
  `scripts/normalize-failure-taxonomy.ts` (idempotent) and enforced inline
  on every new `daily-autopsy.ts` generation. Industries were already
  clean (audited — no near-dupes), so they were left untouched. Two labels
  are intentionally non-canonical: "Lack of Scalability" and "Insufficient
  Revenue Growth" — distinct semantics, no near-duplicate.
