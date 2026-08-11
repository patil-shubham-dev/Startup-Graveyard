import type { PremortemQuestion } from './schemas';
import { BAD_OPTION_PATTERN } from './schemas';

/**
 * User-facing question normalization. The AI layer may return 2-6 options
 * per question with any type/allow_custom mix; every question the founder
 * sees must offer EXACTLY 3 strong AI-generated options plus the custom
 * answer path. This module enforces that contract on the output of the
 * generation pipeline (prompt → provider → schema → here).
 */

const OPTION_JUNK_PATTERNS: RegExp[] = [
  BAD_OPTION_PATTERN,
  /^\s*(?:\/\/?\s*){2,}/,
  /\$\s?[XYZ]\b/i,
  /[\uFFFD\uFFFF]/,
  /^[\W_]{3,}$/,
  // Generic advice masquerading as answer options — the interviewer must
  // never ship these; they are specific to nothing.
  /^conduct\s+(?:a\s+)?(?:market\s+)?research/i,
  /^ask\s+(?:the\s+)?users?/i,
  /^improve\s+(?:the\s+)?product/i,
  /^do\s+(?:some\s+|any\s+)?(?:market\s+)?(?:research|analysis)/i,
  /^get\s+(?:user\s+)?feedback/i,
];

export const REQUIRED_OPTIONS = 3;

export function cleanOption(option: string): string | null {
  const trimmed = option.trim();
  if (trimmed.length < 2 || trimmed.length > 120) return null;
  if (OPTION_JUNK_PATTERNS.some((re) => re.test(trimmed))) return null;
  return trimmed;
}

export interface NormalizedQuestions {
  questions: PremortemQuestion[];
  /** True when fewer than REQUIRED_OPTIONS usable options survived — the
   *  caller should regenerate once rather than ship a degraded question. */
  needsRegen: boolean;
}

/**
 * Normalize a generated question set to the user-facing contract:
 * - every question is single_choice with exactly 3 distinct, usable options
 *   (junk/deduped options dropped; surplus trimmed to 3)
 * - allow_custom is always true — the custom answer path is never hidden
 * Questions whose usable options fall below 3 are returned as-is but flag
 * needsRegen so the pipeline can retry instead of shipping them.
 */
export function normalizeQuestionOptions(questions: PremortemQuestion[]): NormalizedQuestions {
  let needsRegen = false;
  const out = questions.map((q) => {
    const seen = new Set<string>();
    const usable: string[] = [];
    for (const opt of q.options) {
      const clean = cleanOption(opt);
      if (!clean) continue;
      const key = clean.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      usable.push(clean);
    }

    if (usable.length < REQUIRED_OPTIONS) {
      needsRegen = true;
      return { ...q, options: usable, type: 'single_choice' as const, allow_custom: true };
    }
    if (usable.length > REQUIRED_OPTIONS) {
      return { ...q, options: usable.slice(0, REQUIRED_OPTIONS), type: 'single_choice' as const, allow_custom: true };
    }
    return { ...q, options: usable, type: 'single_choice' as const, allow_custom: true };
  });
  return { questions: out, needsRegen };
}
