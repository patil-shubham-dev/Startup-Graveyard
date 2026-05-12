# Design System — "Forensic Intelligence"

## 1. Design Philosophy
This is not a startup blog. This is a **classified intelligence dossier about capitalism's casualties.**
Every design decision evokes: *investigation, evidence, verdict, and depth.* The interface is high-density, premium, and data-driven, avoiding "bouncy" or "playful" elements in favor of precision and gravitas.

## 2. Typography
We use a mix of serif for narrative weight, sans-serif for UI clarity, and monospace for data evidence.

- **Display/Headlines:** `Fraunces`, Georgia, serif (Classic editorial feel)
- **Body/UI:** `Inter`, system-ui, sans-serif (Clean, modern readability)
- **Stats/Data/Case IDs:** `JetBrains Mono`, monospace (Technical, raw data feel)

## 3. Color Tokens
A deep, mysterious palette that emphasizes contrast and warning signals.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--color-bg` | `#08080D` | Page background (deeper than pure black) |
| `--color-surface` | `#111118` | Cards, panels |
| `--color-surface-2` | `#1A1A24` | Elevated surfaces, modals |
| `--color-border` | `#1F1F2E` | Subtle borders |
| `--color-primary` | `#7C3AED` | Violet (Knowledge, intelligence) |
| `--color-amber` | `#F59E0B` | Warning signals, failure tags |
| `--color-red` | `#EF4444` | Critical failure (use sparingly) |
| `--color-green` | `#10B981` | Lessons learned, success signals |
| `--color-text` | `#F1F5F9` | Primary text |
| `--color-text-muted`| `#94A3B8` | Secondary text |

## 4. Component Rules

### Cards
- Background: `#111118`
- Border: `1px solid #1F1F2E`
- Accent: `border-t-2 border-t-amber-500` for case cards.
- Hover: `translateY(-2px)` + `shadow-[0_4px_24px_rgba(124,58,237,0.15)]`.

### Case IDs
- Style: `font-mono text-amber-500 text-xs tracking-widest uppercase`
- Example: `CASE #0042`

### Tags
- **Failure Tags:** `bg-amber-500/10 text-amber-400 border border-amber-500/20`
- **Lesson Tags:** `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`

### Buttons
- **Primary:** `bg-violet-600 hover:bg-violet-700 shadow-[0_0_20px_rgba(124,58,237,0.3)]`
- **Ghost:** Transparent with subtle border, no shadow.

## 5. Visual Language
- **Gradients:** Reserved for hero headlines only (`from-white via-slate-200 to-slate-400`).
- **Section Dividers:** 1px border with `opacity-20`, never full-width rules.
- **Animations:** 
  - `300ms ease-out` for hovers.
  - `500ms` for page transitions.
  - **NO** bounce, **NO** spring effects.
- **Redacted Text:** In "Warning Signs" sections, text has an amber highlight; hover reveals content by removing `line-through`.

## 6. Layout Strategy
- **Dossier Format:** Use two-column layouts for case studies (70% content, 30% sticky sidebar).
- **Evidence Board:** Timelines presented as horizontal scrollable evidence boards.
- **Legal Ruling Style:** Verdict boxes styled with monospace borders and "✗" marks for failure reasons.
