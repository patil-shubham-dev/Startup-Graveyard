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

- `public/engraving.png` (1024×1536, transparent background) — the only
  graphic on the home page. A fine line engraving of a blank headstone,
  positioned absolute right of the hero (desktop only, `hidden md:block`),
  `opacity-60`, with a left-to-right mask fade so the headline column stays
  legible. The engraving's top third is intentionally empty negative space
  for the headline to sit over. Loaded via `next/image` with `priority`.
- `public/textures/paper.jpg` (1254×1254, warm-white ~#f2f1ed) — paper grain
  for light surfaces. Applied as a fixed `body::before` overlay
  (`background-size: 512px`, `opacity: 0.45`) and as the `.texture-paper`
  pseudo-element on `bg-paper-2` bands. Subtle by design — materiality, not
  decoration.
- `public/textures/well.jpg` (1254×1254, near-black ~#141311) — dark stock
  grain for the `well` band via `.texture-well` pseudo-element. Matches the
  `well` token tone; adds felt-like depth.
- `public/mark.png` (32×32) — header wordmark mark. `public/logo-placeholder.png`
  (256×256) — logo fallback for case graphics (not yet rendered in UI).

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
  nav, `aria-label` on mobile menu summary.

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
- **Ledger (home, about, pre-mortem):** computed by `getLedgerStats()` in
  `lib/db/case-studies.ts` — service-role counts all rows (including drafts),
  falls back to anon published-only, then to `ledgerFromCases()` over local
  JSON. `app/api/archive-stats/route.ts` exposes the same numbers to client
  components (`{documented, published, industries, span}`), cached
  `max-age=3600` with revalidation tags `stats`/`case-studies`. After any
  seed, bust the cache via `/api/revalidate` (requires `REVALIDATION_SECRET`)
  or restart the server.
- Current live ledger: `Cases documented 20 · Published 16 · Under review 4
  · Industries 14 · Archive span 2014–23`.

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

- `better-dot-com.json` is depublished (`published: false`, review_status
  `in_review`) pending a factual rewrite: Better Home & Finance is still
  operating (NASDAQ: BETR; $868M funded volume, +31% YoY in Q1 2026), so the
  file's "shutdown 2022" claim was inaccurate.
- `metrics.capital_raised` duplicates `funding_raised` and has to be kept in
  step; a single-source schema would remove the risk.
- `scripts/seed-case-studies.mjs` is a manual runbook step today; wiring it
  into the daily automation (post-edit sync) is a follow-up.

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
  (`engraving-2.png`, 1477×1065) generated as an opaque cream PNG and
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
  below the plate bottom (y480); no horizontal overflow. The old
  headstone file stays in `public/` as fallback.
- **Archive watermark:** new `archive-mark.png` (1254×1254 circular seal,
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
