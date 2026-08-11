/**
 * Idea-quality gate: decides whether a submitted idea is substantial enough
 * to interrogate. "hi" or "I have an app" would generate a meaningless
 * questionnaire — the client asks for more detail instead.
 */

const VAGUE_PATTERNS: RegExp[] = [
  /\b(i|we) have (an?|some|my|our)?\s*(app|website|idea|startup|product|business|company)\b/i,
  /\b(an?|some|my|our)\s*(app|website|startup|business|company|product)\s*(that|which)?\s*(does|is|will|would|should)\s*(stuff|something|things|anything|everything)\b/i,
  /\bhelp (me|us) (build|make|create|start|launch)\b/i,
  /\bwhat (should|can) (i|we) (build|make|do)\b/i,
  /^\s*(idea|startup|business|app|product|company)\s*[.!?]*\s*$/i,
  /\b(still|just) (thinking|figuring|working)\b/i,
];

const STOPWORDS = new Set([
  'about', 'also', 'and', 'are', 'because', 'but', 'can', 'could', 'does',
  'doing', 'for', 'from', 'have', 'idea', 'into', 'just', 'make', 'making',
  'more', 'much', 'our', 'should', 'some', 'something', 'startup', 'that',
  'the', 'their', 'them', 'there', 'they', 'this', 'very', 'want', 'wants',
  'was', 'were', 'what', 'when', 'where', 'which', 'will', 'with', 'would',
  'you', 'your', 'app', 'apps', 'website', 'product', 'business', 'company',
]);

export interface IdeaAssessment {
  tooVague: boolean;
  reason?: string;
}

/**
 * Heuristic vagueness gate. Deliberately conservative — it only rejects
 * near-empty or template phrasing; anything with real substance passes.
 */
export function assessIdea(idea: string): IdeaAssessment {
  const trimmed = idea.trim();

  if (!trimmed) {
    return { tooVague: true, reason: 'The idea field is empty.' };
  }

  if (trimmed.length < 20) {
    return {
      tooVague: true,
      reason: 'That is too little to interrogate. A few sentences about the problem, the people, and the approach help the interview begin.',
    };
  }

  if (VAGUE_PATTERNS.some((p) => p.test(trimmed))) {
    return {
      tooVague: true,
      reason: 'That reads like a placeholder. What are you building, who is it for, and what problem does it solve?',
    };
  }

  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const meaningful = words.filter(
    (w) => w.length >= 4 && !STOPWORDS.has(w)
  );

  if (meaningful.length < 5) {
    return {
      tooVague: true,
      reason: 'A little more substance helps — describe the problem, who it is for, and how you think it works.',
    };
  }

  return { tooVague: false };
}
