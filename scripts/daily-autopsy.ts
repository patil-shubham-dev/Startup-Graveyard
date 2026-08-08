import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { acquireLogoUrl } from '../lib/logo-service';
import { verifyFacts, VerifiedSource } from '../lib/web-search';

// ── Config ──────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const MODEL = process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct';
const EMBEDDING_MODEL = 'nvidia/nv-embedqa-e5-v5';

const hasValidKey = NVIDIA_API_KEY.length > 20 && !NVIDIA_API_KEY.includes('your-nvidia') && !NVIDIA_API_KEY.includes('your-api');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!hasValidKey) {
  console.error('❌ Missing or invalid NVIDIA_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 60000,
  maxRetries: 2,
});

// ── Schemas ─────────────────────────────────────────────

const CoreMetadataSchema = z.object({
  company_name: z.string(),
  slug: z.string(),
  summary: z.string().max(600),
  founded_year: z.number(),
  shutdown_year: z.number(),
  industry: z.string(),
  country: z.string().max(100),
  business_model: z.string(),
  founders: z.array(z.string()),
  funding_raised: z.number(),
  employees_peak: z.number(),
  valuation_peak: z.number().optional(),
  investors: z.array(z.string()),
  failure_reasons: z.array(z.string()),
  root_causes: z.array(z.string()),
  warning_signs: z.array(z.string()),
  lessons: z.array(z.string()),
  tags: z.array(z.string()),
  website: z.string().optional(),
  risk_scores: z.object({
    product: z.number(),
    market: z.number(),
    team: z.number(),
    financial: z.number(),
    burn: z.number(),
  }),
  metrics: z.object({
    capital_raised: z.string(),
    peak_valuation: z.string(),
    years_active: z.number(),
    peak_employees: z.string(),
    burn_rate: z.string(),
    exit_value: z.string(),
    downloads: z.string().optional(),
    revenue: z.string().optional(),
    market_size: z.string().optional(),
    customer_count: z.string().optional(),
  }),
});

const EnrichedDataSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    status: z.enum(['active', 'closed', 'acquired']),
    moat: z.string(),
    advantage_over_failed: z.string(),
  })).min(3).max(5),
  quotes: z.array(z.object({
    text: z.string(),
    author: z.string(),
    role: z.string(),
  })).min(0).max(3),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string(),
  })).min(0).max(5),
  timeline_events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string().max(200),
    type: z.enum(['milestone', 'warning', 'crisis']),
  })).min(4).max(8),
  verdict: z.object({
    top_reasons: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).min(2).max(4),
    final_word: z.string(),
    historical_significance: z.string().optional(),
    could_it_work_today: z.boolean().optional(),
  }),
  funding_rounds: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    name: z.string(),
    investors: z.array(z.string()).optional(),
  })).min(1).max(6),
  legacy_impact: z.string().optional(),
  failure_analysis: z.object({
    cause_of_death: z.string(),
    fatal_event: z.string().optional(),
    failure_score: z.number().min(0).max(100),
    survival_probability: z.number().min(0).max(100),
    could_it_survive_today: z.boolean().optional(),
    secondary_causes: z.array(z.string()).max(5),
    contributing_factors: z.array(z.string()).max(5),
    counterfactuals: z.array(z.object({
      scenario: z.string(),
      what_would_have_happened: z.string(),
      probability: z.string(),
    })).min(2).max(4),
  }),
  evidence_images: z.array(z.string()).max(6).optional(),
});

type CoreMetadata = z.infer<typeof CoreMetadataSchema>;
type EnrichedData = z.infer<typeof EnrichedDataSchema>;

const AiReviewSchema = z.object({
  approved: z.boolean(),
  score: z.number().min(0).max(100),
  fixable: z.boolean(),
  hold_for_review: z.boolean().optional(),
  fix_instructions: z.string().max(2000),
  fix_stages: z.object({
    metadata: z.boolean(),
    enriched: z.boolean(),
    content: z.boolean(),
  }),
  summary: z.string().max(500),
});

type AiReviewResult = z.infer<typeof AiReviewSchema>;

// ── Model Fallback Chain ───────────────────────────────
const MODEL_CHAIN = [
  process.env.AI_DEFAULT_MODEL || 'meta/llama-3.1-70b-instruct',
  'meta/llama-3.1-8b-instruct',
];

let currentModelIndex = 0;

async function callModelWithFallback(
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const startIndex = currentModelIndex;
  let lastError: Error | null = null;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelIndex = (startIndex + i) % MODEL_CHAIN.length;
    const model = MODEL_CHAIN[modelIndex];

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature,
        max_tokens: maxTokens,
      });
      const content = response.choices[0]?.message?.content?.trim();
      if (content) {
        // If we succeeded on a fallback, promote it for next time
        if (modelIndex !== 0) currentModelIndex = modelIndex;
        return content;
      }
      throw new Error('Empty response');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.log(`   ⚠ Model "${model}" failed: ${lastError.message.slice(0, 80)}`);
    }
  }

  throw lastError || new Error('All models in chain exhausted');
}

// ── Helpers ─────────────────────────────────────────────

function extractLargestJSON(text: string): string | null {
  // Strategy 1: Try to find matching braces for the outermost object
  let startIdx = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') { startIdx = i; break; }
  }
  if (startIdx === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = startIdx; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (!inString) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth === 0) return text.slice(startIdx, i + 1);
    }
  }
  return null;
}

function sanitizeJSON(text: string): string {
  // Step 1: Strip markdown code fences
  let cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();

  // Step 2: Strip markdown formatting and explanation prefixes
  cleaned = cleaned.replace(/^(Here[^:]*:\s*)/i, '').trim();

  // Step 3: Try to extract the largest valid JSON object
  const extracted = extractLargestJSON(cleaned);

  // Step 4: Fallback regex repairs (fragile but handles common LLM errors)
  const fallback = extracted || cleaned;
  let repaired = fallback.replace(/(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');
  const quoteCount = (repaired.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) repaired += '"';
  const openBraces = (repaired.match(/\{/g) || []).length;
  const closeBraces = (repaired.match(/\}/g) || []).length;
  if (openBraces > closeBraces) repaired += '}'.repeat(openBraces - closeBraces);
  const openBrackets = (repaired.match(/\[/g) || []).length;
  const closeBrackets = (repaired.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) repaired += ']'.repeat(openBrackets - closeBrackets);
  return repaired;
}

async function tryParseJSON<T>(text: string, schema: z.ZodSchema<T>): Promise<{ result: T | null; raw: string; error: string | null }> {
  // Strategy A: Direct parse
  try {
    const direct = JSON.parse(text);
    const valid = schema.parse(direct);
    return { result: valid, raw: text, error: null };
  } catch {
    // Strategy B: Sanitized parse
    const sanitized = sanitizeJSON(text);
    try {
      const parsed = JSON.parse(sanitized);
      const valid = schema.parse(parsed);
      return { result: valid, raw: sanitized, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 200) : 'Unknown error';
      return { result: null, raw: sanitized.slice(0, 500), error: msg };
    }
  }
}

async function generateJSON<T>(prompt: string, schema: z.ZodSchema<T>, attempt = 1, maxTokens = 4096): Promise<T> {
  const systemMsg = `You are the Graveyard Keeper, a forensic startup autopsy AI. Respond with ONLY valid JSON. No markdown, no code fences, no explanation. Keep values concise.`;

  const userMsg = attempt > 1
    ? `${prompt}\n\nIMPORTANT: Previous response was not valid JSON. Return ONLY raw JSON — no trailing commas, no markdown. Keep values SHORT.`
    : prompt;

  const text = await callModelWithFallback(
    [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg },
    ],
    maxTokens,
    attempt > 1 ? 0.1 : 0.3,
  );

  const { result, raw, error } = await tryParseJSON(text, schema);

  if (result !== null) return result;

  if (attempt < 3) {
    console.log(`   ⚠ JSON parse failed (attempt ${attempt}/3): ${error?.slice(0, 120)}`);
    return generateJSON(prompt, schema, attempt + 1, maxTokens);
  }

  console.error(`   ❌ JSON parse failed after ${attempt} attempts. Last raw:\n${raw}`);
  throw new Error(`Failed to parse JSON after ${attempt} attempts.\n${error}\nFirst 300 chars: ${raw.slice(0, 300)}`);
}

async function generateContent(company: string, summary: string, failureReasons: string[], attempt = 1): Promise<string> {
  const prompt = `You are writing a comprehensive historical case study for the failed startup "${company}". This will be published as a premium editorial research article — think Harvard Business Review meets Wikipedia meets CB Insights.

Company: ${company}
Summary: ${summary}
Failure Reasons: ${failureReasons.join(', ')}

Write a detailed MDX narrative (2000-4000 words) with EXACTLY these sections in this order:

## Background
The market context before the company existed. What problem needed solving? What was the industry landscape? What trends or conditions made this opportunity viable?

## Founding Story
Who founded the company and why? What was their background, vision, and original thesis? How was the company conceived?

## Product Development
What was built? How did the product evolve? Key features, technology choices, development approach. What made the product different?

## Launch & Go-to-Market
How did the company launch? Initial reception, early customers, marketing strategy, pricing. What worked and what didn't?

## Growth & Traction
Key growth metrics, user adoption, revenue, expansion into new markets or verticals. Funding rounds and what they enabled.

## Challenges & Strategic Decisions
Major obstacles, competitive pressure, internal conflicts, strategic pivots. Decisions that shaped the company's trajectory — both good and bad.

## Decline
What triggered the downturn? Missed targets, failed experiments, cash runway problems, leadership changes. Specific events that accelerated the end.

## Shutdown
How did the company end? The final months — layoffs, asset sales, acquisition for parts, or complete dissolution. Founder statements at the end.

## Legacy
What remains? Technology that was spun out, talent that spread to other companies, lessons absorbed by the industry.

WRITING REQUIREMENTS:
- Write in a clinical, professional, research-oriented tone — like a Wikipedia article or academic case study
- Include specific dates, numbers, metrics, and named events wherever possible
- Use short paragraphs (2-4 sentences max) for readability
- Use subheadings within sections (###) to break up long passages
- Use bullet points for lists of facts, reasons, or comparisons
- Be objective and evidence-driven — avoid emotional language
- Each section should be 1-4 paragraphs depending on available detail
- NEVER use phrases like "this case study shows" or "as we can see" — let the facts speak
- Total length: 2000-4000 words

Output ONLY the raw MDX content. No wrapper text, no explanation, no code fences.`;

  try {
    const content = await callModelWithFallback(
      [
        { role: 'system', content: 'You are a forensic startup autopsy writer. Clinical, professional tone. Output only the MDX content.' },
        { role: 'user', content: prompt },
      ],
      4096,
      attempt > 1 ? 0.3 : 0.5,
    );
    if (content && content.length > 200) return content;
    throw new Error('Content too short or empty');
  } catch {
    if (attempt < 3) {
      console.log(`   ⚠ Content generation failed, retrying (attempt ${attempt + 1})...`);
      return generateContent(company, summary, failureReasons, attempt + 1);
    }
    console.error('   ❌ Content generation failed after 3 attempts');
    return `# ${company}: ${summary}\n\n*This autopsy is pending full forensic analysis.*`;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    input_type: 'query',
  } as never);
  return response.data[0].embedding;
}

const REVIEW_THRESHOLD = 60;

async function aiReview(
  target: string,
  metadata: CoreMetadata,
  enriched: EnrichedData,
  content: string,
  sources: VerifiedSource[],
): Promise<AiReviewResult> {
  const evidenceBlock =
    sources && sources.length > 0
      ? sources
          .slice(0, 6)
          .map((s) => `- [${s.source_title || 'untitled'}] ${(s.snippet || '').slice(0, 300)}`)
          .join('\n')
      : 'No web sources found for this run.';

  const prompt = `You are a quality control reviewer for Startup Graveyard, a forensic case study publication. Review this case study and decide if it meets publication standards.

Company: ${target}
Industry: ${metadata.industry}
Founded: ${metadata.founded_year} → Shutdown: ${metadata.shutdown_year}
Summary: ${metadata.summary}
Failure Reasons: ${metadata.failure_reasons.join(', ')}
Content Length: ${content.length} characters

Content (first 3000 chars):
${content.slice(0, 3000)}

WEB SOURCE EVIDENCE (from the fact-check stage):
${evidenceBlock}

FUNDING SANITY CHECK:
metadata.funding_raised = ${(metadata.funding_raised / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} (normalized from cents).
If the sourced evidence (or your own knowledge) contradicts this figure by a wide margin (roughly 2x or more in either direction), or any headline figure appears hallucinated, REJECT with fixable=true and set fix_stages.metadata=true so funding_raised is regenerated from a grounded total.

EVALUATION CRITERIA:
1. ACCURACY (0-25): Are dates, names, metrics internally consistent and plausible?
2. COMPLETENESS (0-25): Does content cover all required sections (Background, Founding Story, Product Development, Launch & Go-to-Market, Growth & Traction, Challenges, Decline, Shutdown, Legacy)?
3. QUALITY (0-25): Is writing clinical, professional, evidence-driven? No emotional language?
4. SPECIFICITY (0-25): Are there specific dates, numbers, named events, concrete details?

SCORING GUIDE:
- Total ≥ ${REVIEW_THRESHOLD}: APPROVE — meets publication standards
- Total < ${REVIEW_THRESHOLD} BUT fixable: REJECT with fixable=true — provide specific fix instructions
- Total < ${REVIEW_THRESHOLD} AND NOT fixable: REJECT with fixable=false (e.g., hallucinated company, wrong industry, completely wrong facts)

Return a JSON object:
{
  "approved": boolean,
  "score": number (0-100),
  "fixable": boolean,
  "fix_instructions": "If fixable, specific instructions on what to fix. Include which stages need regeneration.",
  "fix_stages": { "metadata": boolean, "enriched": boolean, "content": boolean },
  "summary": "One-line summary of the review decision"
}`;

  const systemMsg = 'You are a quality control reviewer. Respond with ONLY valid JSON.';

  const { result, error } = await tryParseJSON(
    await callModelWithFallback(
      [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt },
      ],
      1024,
      0.1,
    ),
    AiReviewSchema,
  );

  if (result) return result;

  // Fallback: hold for human review instead of auto-publishing unverified content
  console.warn(`   ⚠ AI review parse failed — holding "${target}" for human review: ${error?.slice(0, 120)}`);
  return {
    approved: false,
    score: 0,
    fixable: false,
    hold_for_review: true,
    fix_instructions: 'Review engine failed to return valid JSON; case held for manual editorial review.',
    fix_stages: { metadata: false, enriched: false, content: false },
    summary: 'Held for human review (review engine parse failure)',
  };
}

function deriveWebsite(companyName: string): string {
  const base = companyName.toLowerCase().replace(/[^a-z0-9.-]/g, '').replace(/\.com$/i, '');
  // If it already looks like a domain, use it
  if (companyName.includes('.') && !companyName.endsWith('.')) {
    const cleaned = companyName.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    return `https://${cleaned}`;
  }
  return `https://${base}.com`;
}

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/-+/g, '-');
}

// ── Company Aliases ────────────────────────────────────
// Maps known company name variations to their canonical form
// and detects parenthetical descriptors that should be stripped
// for slug generation while preserving the display name.
const COMPANY_ALIASES: Record<string, string[]> = {
  'Quibi': ['Quibi Holdings'],
  'Theranos': ['Theranos Inc.'],
  'Fab.com': ['Fab'],
  'Better.com': ['Better'],
  'Diapers.com (Quidsi)': ['Diapers.com', 'Quidsi'],
  'Uber (China — didi merger)': ['Uber China'],
  'Lime (decline/restructuring)': ['Lime'],
  'Ola (decline in some markets)': ['Ola'],
  'Nokia Mobile Phones (decline)': ['Nokia Phones'],
  'BlackBerry (decline)': ['BlackBerry Mobile'],
  'Motorola Mobility (decline)': ['Motorola Mobility'],
  'Krispy Kreme (decline)': ['Krispy Kreme'],
  'Zynga (decline)': ['Zynga'],
  'GameStop (decline)': ['GameStop'],
  'Redbox (decline)': ['Redbox'],
  'Ancestry.com (decline)': ['Ancestry.com'],
  'NantHealth (decline)': ['NantHealth'],
  '23andMe (decline)': ['23andMe'],
  'Paytm (decline)': ['Paytm'],
  'Byju\'s (decline)': ['Byju\'s'],
  'Bird': ['Bird Rides'],
  'General Motors (2009 bankruptcy)': ['General Motors', 'GM'],
  'Chrysler (2009 bankruptcy)': ['Chrysler'],
  'Silicon Valley Bank (2023)': ['Silicon Valley Bank', 'SVB'],
  'Credit Suisse (2023 collapse)': ['Credit Suisse'],
  'Better Place': ['Better Place EV'],
  'WeWork (decline)': ['WeWork'],
};

function getPrimaryName(candidate: string): string {
  // Strip parenthetical descriptors for primary name detection
  const base = candidate.replace(/\s*\(.*?\)\s*/g, '').trim();
  return base || candidate;
}

function getAllAliases(candidate: string): string[] {
  return COMPANY_ALIASES[candidate] || [getPrimaryName(candidate)];
}

// ── Candidate Queue ─────────────────────────────────────
const CANDIDATES = [
  // ── Tech & Startup (already generated or in queue) ──
  'Quibi', 'Theranos', 'Jawbone', 'Fast', 'ScaleFactor', 'Katerra',
  'Loom', 'Juicero', 'Pebble', 'Fab.com',
  'Better.com', 'Zume Pizza', 'Argo AI', 'Bird',
  'Convoy', 'Olive AI', 'Zeus Living', 'Cazoo', 'Arrival',
  'Varo Money', 'Airware', 'Essential Products',
  'Homejoy', 'Beepi', 'Shyp', 'Sprig', 'Munchery', 'Maple',
  'Sidecar', 'Yik Yak', 'Secret', 'Path',
  'Diapers.com (Quidsi)', 'Zulily', 'Gilt Groupe', 'NastyGal', 'ShoeDazzle',
  'Parse', 'RethinkDB', 'Nirvanix', 'Huddle', 'StackMob',
  'Color', 'Highlight', 'Beme', 'iTunes Ping',
  'Better Place', 'Segway',

  // ── 1800s–1900s: Industrial Age Failures ──
  'United States Shipbuilding Company',
  'Wardenclyffe Tower (Tesla\'s Wireless)', 'United States Leather Company',
  'National Cordage Company', 'American Bicycle Company',
  'United States Realty & Construction Company',
  'American Ice Company', 'United States Button Company',
  'Alaska Gold Rush Mining Companies',

  // ── 1920s–1950s: Pre-Digital Era ──
  'Tucker Corporation', 'DeLorean Motor Company',
  'Bricklin (SV-1)', 'Studebaker Corporation',
  'Pan Am (Pan American World Airways)',
  'Eastern Air Lines', 'TWA (Trans World Airlines)',
  'Penn Central Transportation Company',
  'W.T. Grant', 'E. J. Korvette',

  // ── 1960s–1980s: Conglomerate & Brand Failures ──
  'Atari Corporation', 'Commodore International',
  'Coleco', 'Texas Instruments Home Computer',
  'Osborne Computer Corporation', 'Kaypro',
  'Wang Laboratories', 'Digital Equipment Corporation',
  'Data General', 'Prime Computer',
  'Control Data Corporation', 'Sperry Corporation',
  'RCA Corporation (pre-GE)', 'Westinghouse Electric (decline)',
  'Montgomery Ward', 'F. W. Woolworth Company',
  'B. Altman and Company', 'Gimbels',
  'Abraham & Straus', 'Stern\'s',

  // ── 1990s: Dot-Com & Retail ──
  'Pets.com', 'Webvan', 'eToys.com', 'Boo.com',
  'Flooz.com', 'GovWorks', 'Kozmo.com',
  'Pseudo.com', 'TheGlobe.com', 'Value America',
  'DrKoop.com', 'CDnow', 'MP3.com',
  'PointCast', 'Netscape Communications',
  'Lotus Development Corporation',
  'WordPerfect Corporation', 'Borland',
  'Sybase', 'Informix',
  'Enron Corporation', 'WorldCom',
  'Arthur Andersen', 'Barings Bank',
  'Long-Term Capital Management',
  'Drexel Burnham Lambert',

  // ── 2000s: Telecom, Media & Internet ──
  'Napster', 'Kazaa', 'LimeWire',
  'Friendster', 'Myspace',
  'Six Apart (Movable Type)', 'Digg',
  'Altavista', 'Lycos', 'Excite',
  'Ask Jeeves', 'GeoCities',
  'Broadcast.com', 'RealNetworks',
  'Palm Inc.', 'Handspring', 'Pocket PC',
  'BlackBerry (decline)', 'Nokia Mobile Phones (decline)',
  'Motorola Mobility (decline)',
  'Blockbuster LLC', 'Tower Records',
  'Borders Group', 'Circuit City',
  'RadioShack', 'Linens \'n Things',
  'CompUSA', 'Service Merchandise',
  'Sharper Image', 'KB Toys',

  // ── 2010s: Food, Retail & Consumer ──
  'Kodak (digital decline)', 'Polaroid (bankruptcy)',
  'American Apparel', 'Aeropostale',
  'Payless ShoeSource', 'Sears Holdings',
  'Toys "R" Us', 'Sports Authority',
  'Gymboree', 'Charlotte Russe',
  'Brookstone', 'Things Remembered',
  'Dean & DeLuca', 'Krispy Kreme (decline)',
  'Planet Hollywood', 'Hard Rock Cafe (decline)',
  'Sizzler', 'Quiznos',
  'Fresh & Easy', 'Barney\'s New York',
  'Henri Bendel', 'Lord & Taylor',

  // ── Manufacturing & Industrial ──
  'Bethlehem Steel', 'US Steel (decline)',
  'General Motors (2009 bankruptcy)',
  'Chrysler (2009 bankruptcy)',
  'Fisker Automotive', 'Bright Automotive',
  'Solyndra', 'Evergreen Solar',
  'SunPower (decline)', 'Abound Solar',
  'A123 Systems', 'Battery Ventures portfolio',

  // ── Financial & Banking ──
  'Lehman Brothers', 'Bear Stearns',
  'Merrill Lynch (sale)', 'Washington Mutual',
  'Wachovia', 'Countrywide Financial',
  'IndyMac Bank', 'Silicon Valley Bank (2023)',
  'Signature Bank', 'First Republic Bank',
  'Credit Suisse (2023 collapse)', 'Silvergate Bank',

  // ── International & Non-US ──
  'Wirecard', 'Luckin Coffee',
  'OYO Rooms', 'Snapdeal',
  'Housing.com', 'ShopClues',
  'Paytm (decline)', 'Byju\'s (decline)',
  'Carillion plc', 'Thomas Cook Group',
  'Monsoon Accessorize', 'Debenhams',
  'British Home Stores', 'Maplin Electronics',
  'Poundworld', 'Toys R Us UK',

  // ── Media & Entertainment ──
  'Vine', 'Google+', 'Orkut',
  'Ello', 'App.net', 'Pheed',
  'Redbox (decline)', 'MoviePass',
  'CNN+', 'CBS All Access (rebrand)',
  'Ancestry.com (decline)', 'Zynga (decline)',
  'Ouya', 'OnLive', 'Stadia',
  'GameStop (decline)',

  // ── Transportation & Automotive ──
  'Mobility as a Service (MaaS) Global',
  'Uber (China — didi merger)',
  'Ola (decline in some markets)',
  'VanMoof', 'Boosted Boards',
  'Lime (decline/restructuring)',
  'GetAround', 'Turo (challenges)',
  'Canoo', 'Lordstown Motors',
  'Proterra', 'Electric Last Mile Solutions',
  'Milton (Nikola founder fraud)',

  // ── Healthcare & Biotech ──
  'HealthSpot', 'Scanadu', 'Airstrip Technologies',
  'Practice Fusion', 'NantHealth (decline)',
  'Proteus Digital Health', 'Google Health (original)',
  '23andMe (decline)', 'Color Genomics (pivot)',
  'Harbinger Health',
];

// ── Main ────────────────────────────────────────────────
const MAX_FIX_RETRIES = 2;

async function runDailyAutopsy() {
  console.log('💀 Starting Forensic Crawler v2...');
  console.log(`   Model: ${MODEL}`);

  while (true) {
    // ── Pick next candidate (re-queries DB each attempt) ──
    const { data: existing } = await supabase.from('case_studies').select('company_name, slug');
    const existingNames = new Set((existing || []).map((e: { company_name: string; slug: string }) => e.company_name.toLowerCase()));
    const existingSlugs = new Set((existing || []).map((e: { company_name: string; slug: string }) => e.slug));

    const allKnownNames = new Set(existingNames);
    for (const name of existingNames) {
      allKnownNames.add(name);
      const aliases = COMPANY_ALIASES[name] || [];
      for (const a of aliases) allKnownNames.add(a.toLowerCase());
    }

    let target: string | undefined;
    for (const candidate of CANDIDATES) {
      const allAliases = getAllAliases(candidate);
      const aliasMatch = allAliases.some((a) => allKnownNames.has(a.toLowerCase()));
      if (aliasMatch) {
        console.log(`   ⏭ ${candidate} — alias matched existing entry`);
        continue;
      }
      const candidateSlug = slugify(candidate);
      if (existingSlugs.has(candidateSlug)) {
        console.log(`   ⏭ ${candidate} — slug collision: ${candidateSlug}`);
        continue;
      }
      target = candidate;
      break;
    }

    if (!target) {
      console.log('🏁 All candidates covered.');
      return;
    }

    console.log(`🔍 Target: ${target}`);

    const caseNumber = `CASE-${Date.now().toString(36).toUpperCase()}`;
    const expectedSlug = slugify(target);
    const contentDir = path.join(process.cwd(), 'content', 'case-studies');
    const dataDir = path.join(process.cwd(), 'data', 'case-studies');

    let metadata: CoreMetadata;
    let enriched: EnrichedData;
    let content: string;
    let dbId: string | null = null;

    // ── Inner retry loop (fix + re-review) ──
    for (let fixAttempt = 0; fixAttempt <= MAX_FIX_RETRIES; fixAttempt++) {
      const isRetry = fixAttempt > 0;
      const feedbackPrefix = isRetry ? `\n\nPREVIOUS REVIEW FEEDBACK TO ADDRESS:\n` : '';

      // ── Stage 1: Core Metadata ───────────────────────
      console.log(`\n📋 Stage 1/7: Generating core metadata${isRetry ? ' (retry)' : ''}...`);
      const metadataPrompt = `Generate a comprehensive forensic autopsy report for the failed startup "${target}".
      
IMPORTANT: The slug field MUST be exactly "${expectedSlug}" — no variations.

This report will be published as a structured, editorial-quality case study on a research publication platform. Every field feeds into a specific visual section of the case study page. Be factual, specific, and research-oriented.

Return a JSON object with these fields:

--- Core Identity ---
- company_name: string — MUST be EXACTLY "${target}"
- slug: lowercase-kebab-case of company_name
- summary: 2-3 sentence summary (max 600 chars) that answers: what was the company, what happened, why did it fail, what is the biggest lesson
- industry: string (e.g., "Fintech", "HealthTech", "SaaS", "E-commerce", "Hardware", "Social", "Transportation", "Real Estate", "Food", "Fashion", "Enterprise Software", "Consumer")

--- Company Profile ---
- founded_year: number (YYYY)
- shutdown_year: number (YYYY) — best estimate
- country: country code like "US", "UK", "India", "Canada", "Germany", "Israel"
- business_model: string like "B2B SaaS", "B2C Marketplace", "Hardware + Subscription", "Advertising", "On-Demand Services", "D2C E-commerce", "Enterprise Software", "Subscription"
- founders: array of 1-3 full names
- website: optional URL if known

--- Financial & Scale ---
- funding_raised: total funding in USD cents (e.g. $100M = 10000000000, $1B = 100000000000)
- employees_peak: peak headcount (number, 0 if unknown)
- valuation_peak: optional peak valuation in USD cents
- investors: array of 3-6 investor names

--- Failure Analysis ---
- failure_reasons: array of 3-6 categories from: "No Market Need", "Cash Exhaustion", "Competition", "Blitzscaling", "Regulatory", "Fraud", "Product-Market Fit", "Execution", "Pricing", "Leadership", "Timing", "Technology", "Business Model", "Strategy", "Operations", "Culture", "User Acquisition Cost", "Unit Economics"
- root_causes: array of 3-5 deep, specific root causes (not categories — actual causes like "Over-expansion before achieving product-market fit" or "Unable to reduce customer acquisition cost below LTV")
- warning_signs: array of 3-5 early warning signs that were missed or ignored
- lessons: array of 4-6 actionable, specific lessons for founders (not generic platitudes)

--- Content Organization ---
- tags: array of 4-8 relevant tags for filtering and discovery

--- Risk Assessment ---
- risk_scores: object with scores 0-100 for each: {product, market, team, financial, burn}

--- Metrics Display (appears as Quick Facts cards on the page) ---
- metrics: object {
    capital_raised: string (e.g. "$2 billion"),
    peak_valuation: string (e.g. "$1.75 billion"),
    years_active: number,
    peak_employees: string (e.g. "200"),
    burn_rate: string (e.g. "$1 billion per year"),
    exit_value: string (e.g. "$0" or "$50M acqui-hire"),
    downloads: optional string (e.g. "4.5 million"),
    revenue: optional string (e.g. "$20 million ARR"),
    market_size: optional string (e.g. "$50 billion TAM"),
    customer_count: optional string (e.g. "10,000 customers")
  }

CRITICAL REQUIREMENTS:
1. Every number must be fact-based or a close estimate — never invent funding figures
2. Failure reasons must be diagnostic, not descriptive ("Cash Exhaustion" not "Ran out of money")
3. Root causes must explain WHY ("Over-hired before achieving PMF" not "Grew too fast")
4. Lessons must be actionable ("Validate demand before building features" not "Do market research")
5. Keep values concise — this is structured data, not prose`;

      metadata = await generateJSON(metadataPrompt + (isRetry ? `${feedbackPrefix}${fixInstructions}` : ''), CoreMetadataSchema);
      (metadata as unknown as Record<string, unknown>).case_number = caseNumber;

      if (metadata.slug !== expectedSlug) {
        console.log(`   ⚠ Overriding AI slug "${metadata.slug}" → "${expectedSlug}"`);
        metadata.slug = expectedSlug;
      }

      if (!metadata.website) {
        metadata.website = deriveWebsite(metadata.company_name);
      }

      // Slug collision check (only on first attempt)
      if (fixAttempt === 0) {
        const { data: slugCheck } = await supabase
          .from('case_studies')
          .select('slug')
          .eq('slug', metadata.slug)
          .single();
        if (slugCheck) {
          console.log(`   ⏭ Slug "${metadata.slug}" already exists — skipping`);
          return;
        }
      }

      console.log(`   ✅ ${metadata.company_name} — ${metadata.industry} (${metadata.founded_year}–${metadata.shutdown_year})`);

      // ── Stage 2: Enriched Data ───────────────────────
      console.log(`\n🎯 Stage 2/7: Generating enriched data${isRetry ? ' (retry)' : ''}...`);
      const enrichedPrompt = `For the failed startup "${target}" (${metadata.industry}, ${metadata.founded_year}–${metadata.shutdown_year}), generate structured data for a professional forensic research case study.

Return ONLY valid JSON with these arrays:

1. competitors: array of 3-5 competitors — real companies that competed with ${target}. Each has: {name, status: "active"|"closed"|"acquired", moat: string explaining their defensibility, advantage_over_failed: string explaining why they survived and ${target} did not}

2. quotes: array of 0-3 quotes. ONLY include a quote if you are confident it is publicly documented (interview, press, memoir, regulatory filing). If none are verifiable, return an empty array. NEVER invent a quote or attribution.

3. sources: array of 0-5 references to REAL articles that you are confident exist. Each: {title, url, type: "Article"|"Report"|"Interview"|"Podcast"|"SEC Filing"}. Prefer URLs surfaced by the fact-check stage web search. NEVER invent a URL or article title — for a forensic publication, a missing citation is acceptable and a fabricated one is not. If fewer than 3 are verifiable, return fewer.

4. timeline_events: array of 5-10 events charting ${target}'s full lifecycle — founding, major funding rounds, product launches, expansions, pivots, crises, and shutdown. Each: {date (e.g. "Jan 2020"), title, description (max 200 chars, specific), type: "milestone"|"warning"|"crisis"}

5. verdict: object summarizing the final analysis. {
    top_reasons: array of 2-4 {title, description} — structured failure verdict cards,
    final_word: string (one powerful concluding sentence about ${target}'s place in business history),
    historical_significance: optional string — 1-2 sentences on the company's historical importance,
    could_it_work_today: optional boolean — would this business work if tried again today?
  }

6. funding_rounds: array of 1-6 funding rounds. Each: {date: string (e.g. "June 2019"), amount: number (USD cents), name: string (e.g. "Series A", "Seed Round"), investors: optional array of investor names for that round}

7. legacy_impact: optional string — 1-2 sentences on what ${target} left behind (technology, talent, market lessons, cultural impact)

8. failure_analysis: object — THIS IS THE SIGNATURE FORENSIC ANALYSIS. This powers the Startup Autopsy section. {
    cause_of_death: string — ONE primary cause (e.g. "Cash Exhaustion", "No Market Need", "Regulatory Collapse"),
    fatal_event: optional string — the single event that sealed the company's fate (e.g. "Failed to raise Series C"),
    failure_score: number 0-100 — overall failure severity score,
    survival_probability: number 0-100 — probability the company could have survived,
    could_it_survive_today: optional boolean — would this business work today,
    secondary_causes: array of 1-5 strings — secondary reasons for failure,
    contributing_factors: array of 1-5 strings — additional contributing factors,
    counterfactuals: array of 2-4 objects {
      scenario: string (e.g. "If leadership had prioritized profitability over growth"),
      what_would_have_happened: string (specific, plausible alternative outcome),
      probability: string (e.g. "Low", "Moderate", "High")
    }
  }

9. evidence_images: optional array of up to 6 URLs for product screenshots, founder photos, or archived media. Use stable, hosted URLs only; if none are available, return an empty array. NEVER fabricate image URLs.

Use factual data where possible. Never fabricate funding amounts — use the total as a guide and distribute across rounds. Keep descriptions specific, evidence-driven, and concise. The failure_analysis is the centerpiece — make it thorough and diagnostic.`;

      enriched = await generateJSON(enrichedPrompt + (isRetry ? `${feedbackPrefix}${fixInstructions}` : ''), EnrichedDataSchema);
      console.log(`   ✅ ${enriched.timeline_events.length} timeline events, ${enriched.competitors.length} competitors, ${enriched.quotes.length} quotes`);

      // ── Stage 3: Narrative Content ───────────────────
      console.log(`\n📝 Stage 3/7: Generating narrative content${isRetry ? ' (retry)' : ''}...`);
      content = await generateContent(metadata.company_name, metadata.summary, metadata.failure_reasons);
      console.log(`   ✅ Content: ${content.length} chars`);

      // ── Stage 4: Web Search & Fact Verification ──────
      console.log('\n🔍 Stage 4/7: Fact verification via web search...');
      let factSources: VerifiedSource[] = [];
      let factScore: number | null = null;
      try {
        const result = await verifyFacts(
          metadata.company_name,
          metadata.summary,
          metadata.failure_reasons,
        );
        factSources = result.sources;
        factScore = result.score;
        if (factSources.length > 0) {
          const highConf = factSources.filter((s) => s.confidence === 'high').length;
          console.log(`   ✅ ${factSources.length} sources found (${highConf} high confidence)`);
          console.log(`   📊 Fact check score: ${factScore}/100`);
        } else {
          console.log(`   ℹ️  No web sources found — fact score unavailable`);
        }
      } catch (err) {
        console.log(`   ⚠ Fact verification skipped: ${err instanceof Error ? err.message : 'unknown error'}`);
      }

      // ── Stage 5: Logo Acquisition ────────────────────
      console.log('\n🖼  Stage 5/7: Acquiring logo...');
      let logoUrl: string | null = null;
      try {
        logoUrl = await acquireLogoUrl(metadata.company_name);
        console.log(`   ${logoUrl ? '✅ Logo found: ' + logoUrl : 'ℹ️  No logo found, will use placeholder'}`);
      } catch {
        console.log(`   ⚠ Logo acquisition failed`);
      }

      // ── Stage 6: Embedding ───────────────────────────
      console.log('\n🧠 Stage 6/7: Generating embedding...');
      const embeddingText = `${metadata.company_name} ${metadata.summary} ${metadata.failure_reasons.join(' ')} ${metadata.industry} ${(metadata.tags || []).join(' ')}`;
      const embedding = await generateEmbedding(embeddingText);
      console.log(`   ✅ Embedding dimension: ${embedding.length}`);

      // ── Save to Database ─────────────────────────────
      console.log('\n💾 Saving to database...');
      const { funding_rounds, legacy_impact: _legacy_impact, failure_analysis, evidence_images, ...restEnriched } = enriched;
      const finalData: Record<string, unknown> = {
        ...metadata,
        logo_url: logoUrl,
        content,
        ...restEnriched,
        financial_rounds: funding_rounds,
        failure_analysis: failure_analysis as Record<string, unknown>,
        evidence_images: (evidence_images || []) as string[],
        published: false,
        published_at: null,
        review_status: 'draft',
        reviewed_at: null,
        fact_check_score: factScore,
        verified_sources: factSources,
        embedding,
      };

      if (fixAttempt === 0) {
        const { error, data } = await supabase.from('case_studies').insert([finalData]).select('id').single();
        if (error) {
          if (error.message?.includes('duplicate key') || error.code === '23505') {
            console.log(`   ⚠ Duplicate key — ${target} was already stored`);
            return;
          }
          throw error;
        }
        dbId = data?.id;
        console.log('   ✅ Stored in Supabase');
      } else if (dbId) {
        delete finalData.embedding;
        const { error } = await supabase.from('case_studies').update(finalData).eq('id', dbId);
        if (error) throw error;
        const embeddingUpdate = await supabase.from('case_studies').update({ embedding }).eq('id', dbId);
        if (embeddingUpdate.error) throw embeddingUpdate.error;
        console.log('   ✅ Updated in Supabase');
      }

      // ── Save to Filesystem ───────────────────────────
      fs.mkdirSync(contentDir, { recursive: true });
      fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(path.join(contentDir, `${metadata.slug}.md`), content);
      fs.writeFileSync(path.join(dataDir, `${metadata.slug}.json`), JSON.stringify(finalData, null, 2));
      console.log('   ✅ Saved to filesystem');

      // ── Stage 7: AI Review ──────────────────────────
      console.log('\n🔎 Stage 7/7: AI quality review...');
      const review = await aiReview(target, metadata, enriched, content, factSources);
      console.log(`   📊 Score: ${review.score}/100`);
      console.log(`   📝 ${review.summary}`);

      if (review.approved) {
        // Auto-publish
        const { error: pubError } = await supabase
          .from('case_studies')
          .update({
            published: true,
            published_at: new Date().toISOString(),
            review_status: 'published',
            review_notes: review.summary,
          })
          .eq('id', dbId);
        if (pubError) throw pubError;

        console.log(`\n✅ PUBLISHED: ${target}`);
        console.log(`   Score: ${review.score}/100`);
        console.log(`   Industry: ${metadata.industry}`);
        console.log(`   Timeline: ${metadata.founded_year} → ${metadata.shutdown_year}`);
        console.log(`   Content: ${content.length} chars`);
        return; // Success — exactly one case published
      }

      if (!review.fixable) {
        if (review.hold_for_review) {
          // Review engine failure: keep the case as a draft for human review, never auto-publish
          const { error: holdErr } = await supabase
            .from('case_studies')
            .update({ review_status: 'in_review', published: false, review_notes: review.summary })
            .eq('id', dbId);
          if (holdErr) throw holdErr;
          console.log(`   🛑 Held for human review (not published): "${target}"`);
          break; // Break inner retry loop, try next candidate
        }
        console.log(`   ❌ Unfixable issues — deleting case "${target}"`);
        if (dbId) await supabase.from('case_studies').delete().eq('id', dbId);
        for (const file of [`${metadata.slug}.md`, `${metadata.slug}.json`]) {
          try { fs.unlinkSync(path.join(contentDir, file)); } catch { /* ok */ }
          try { fs.unlinkSync(path.join(dataDir, file)); } catch { /* ok */ }
        }
        break; // Break inner retry loop, try next candidate
      }

      // Fixable — set feedback for next retry
      fixInstructions = review.fix_instructions;
      console.log(`   🔄 Fixable — retry ${fixAttempt + 1}/${MAX_FIX_RETRIES}`);
    }

    // If we exhausted retries and got here, the case was unfixable or maxed out
    console.log(`   ➡️  Moving to next candidate...\n`);
  }
}

let fixInstructions = '';

runDailyAutopsy().catch(console.error);
