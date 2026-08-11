import { ai } from '@/lib/ai';
import { readAllCases } from '@/lib/archive-ledger';

/**
 * Archive grounding for the pre-mortem engine.
 *
 * The interviewer must be "grounded in relevant failure cases": the idea
 * (and later the answers) is matched against the archive, and the matched
 * cases are folded into the generation prompts so questions and risks are
 * informed by real historical failures — never invented ones.
 */

export interface GroundedCase {
  name: string;
  slug: string;
  summary: string;
  industry: string | null;
  failure_reasons: string[];
}

const MIN_REASONABLE_TERM_LENGTH = 4;
const STOPWORDS = new Set([
  'about', 'after', 'against', 'also', 'another', 'because', 'been',
  'before', 'being', 'between', 'build', 'building', 'business', 'could',
  'does', 'doing', 'even', 'from', 'have', 'having', 'into', 'just',
  'make', 'making', 'might', 'more', 'much', 'other', 'people', 'should',
  'some', 'startup', 'that', 'their', 'them', 'there', 'they', 'this',
  'through', 'very', 'want', 'wants', 'were', 'what', 'when', 'where',
  'which', 'will', 'with', 'would', 'you', 'your',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= MIN_REASONABLE_TERM_LENGTH && !STOPWORDS.has(w));
}

function scoreCase(c: { summary?: string; industry?: string | null; tags?: string[]; failure_reasons?: string[] }, terms: Set<string>): number {
  const haystack = [
    c.summary || '',
    c.industry || '',
    (c.tags || []).join(' '),
    (c.failure_reasons || []).join(' '),
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += term.length > 6 ? 2 : 1;
  }
  return score;
}

/**
 * Local fallback when the embedding pipeline is unavailable: keyword
 * matching over the on-disk case files. Deterministic and honest — only
 * cases that actually share vocabulary with the idea are returned.
 */
export function keywordMatchCases(text: string, limit = 4): GroundedCase[] {
  const terms = new Set(tokenize(text));
  if (terms.size === 0) return [];

  const cases = readAllCases().filter((c) => c.published);
  const scored = cases
    .map((c) => ({
      c,
      score: scoreCase(c as { summary?: string; industry?: string | null; tags?: string[]; failure_reasons?: string[] }, terms),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ c }) => ({
    name: c.company_name,
    slug: c.slug,
    summary: c.summary,
    industry: c.industry,
    failure_reasons: c.failure_reasons || [],
  }));
}

/**
 * Primary grounding path: embedding search when the backend is
 * configured, with the local keyword matcher as a graceful fallback.
 * Never throws — an ungrounded interrogation is better than a 500.
 */
export async function findRelevantCases(text: string, limit = 4): Promise<GroundedCase[]> {
  const searchText = text.length > 1000
    ? text.substring(0, 500) + '\n...\n' + text.substring(text.length - 500)
    : text;

  try {
    const results = await ai.search(searchText);
    if (results && results.length > 0) {
      const byName = new Map(readAllCases().map((c) => [c.company_name.toLowerCase(), c]));
      return results.slice(0, limit).map((r) => {
        const full = byName.get(r.company_name.toLowerCase());
        return {
          name: r.company_name,
          slug: r.slug,
          summary: r.summary,
          industry: full?.industry ?? null,
          failure_reasons: full?.failure_reasons || [],
        };
      });
    }
  } catch {
    // fall through to keyword matching
  }

  return keywordMatchCases(text, limit);
}

/** Compact prompt block describing the grounded cases to the model. */
export function formatGroundedCases(cases: GroundedCase[]): string {
  if (cases.length === 0) return '';
  return [
    `RELEVANT_ARCHIVE_CASES (${cases.length} retrieved from the Start-up Graveyard archive):`,
    ...cases.map(
      (c, i) =>
        `${i + 1}. ${c.name}${c.industry ? ` — ${c.industry}` : ''}${c.failure_reasons.length > 0 ? ` · failed on: ${c.failure_reasons.join(', ')}` : ''}\n   ${c.summary}`
    ),
    'Use these cases as grounding only. Never invent or reference any case that is not listed here.',
  ].join('\n');
}
