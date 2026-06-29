import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { acquireLogoUrl } from '../lib/logo-service';

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
  })).min(2).max(3),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string(),
  })).min(3).max(5),
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

// ── Helpers ─────────────────────────────────────────────

function sanitizeJSON(text: string): string {
  let cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) cleaned = jsonMatch[0];
  cleaned = cleaned.replace(/(\{|,)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  // Fix unclosed quotes
  const quoteCount = (cleaned.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) cleaned += '"';
  // Fix unclosed braces/brackets
  const openBraces = (cleaned.match(/\{/g) || []).length;
  const closeBraces = (cleaned.match(/\}/g) || []).length;
  if (openBraces > closeBraces) cleaned += '}'.repeat(openBraces - closeBraces);
  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) cleaned += ']'.repeat(openBrackets - closeBrackets);
  return cleaned;
}

async function generateJSON<T>(prompt: string, schema: z.ZodSchema<T>, attempt = 1, maxTokens = 4096): Promise<T> {
  const systemMsg = `You are the Graveyard Keeper, a forensic startup autopsy AI. Respond with ONLY valid JSON. No markdown, no code fences, no explanation. Keep values concise.`;

  const userMsg = attempt > 1
    ? `${prompt}\n\nIMPORTANT: Previous response was not valid JSON. Return ONLY raw JSON — no trailing commas, no markdown. Keep values SHORT.`
    : prompt;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemMsg },
      { role: 'user', content: userMsg },
    ],
    temperature: attempt > 1 ? 0.1 : 0.3,
    max_tokens: maxTokens,
  });

  const text = response.choices[0]?.message?.content?.trim() || '{}';
  const cleaned = sanitizeJSON(text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    if (attempt < 3) {
      console.log(`   ⚠ JSON parse failed, retrying (attempt ${attempt + 1})...`);
      return generateJSON(prompt, schema, attempt + 1, maxTokens);
    }
    throw new Error(`Failed to parse JSON after ${attempt} attempts.\n${cleaned.slice(0, 500)}`);
  }

  try {
    return schema.parse(parsed);
  } catch (error) {
    if (attempt < 3) {
      console.log(`   ⚠ Schema validation failed, retrying (attempt ${attempt + 1})...`);
      return generateJSON(prompt, schema, attempt + 1, maxTokens);
    }
    throw error;
  }
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
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a forensic startup autopsy writer. Clinical, professional tone. Output only the MDX content.' },
        { role: 'user', content: prompt },
      ],
      temperature: attempt > 1 ? 0.3 : 0.5,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content && content.length > 200) return content;
    throw new Error('Content too short or empty');
  } catch (err) {
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

function deriveWebsite(companyName: string): string {
  const base = companyName.toLowerCase().replace(/[^a-z0-9.-]/g, '').replace(/\.com$/i, '');
  // If it already looks like a domain, use it
  if (companyName.includes('.') && !companyName.endsWith('.')) {
    const cleaned = companyName.toLowerCase().replace(/[^a-z0-9.-]/g, '');
    return `https://${cleaned}`;
  }
  return `https://${base}.com`;
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
  'Quibi', 'CNN+', 'CBS All Access (rebrand)',
  'Ancestry.com (decline)', 'Zynga (decline)',
  'Ouya', 'OnLive', 'Stadia',
  'GameStop (decline)', 'Blockbuster (video games)',

  // ── Transportation & Automotive ──
  'Mobility as a Service (MaaS) Global',
  'Uber (China — didi merger)',
  'Ola (decline in some markets)',
  'VanMoof', 'Boosted Boards',
  'Bird Rides (decline)', 'Lime (decline/restructuring)',
  'GetAround', 'Turo (challenges)',
  'Canoo', 'Lordstown Motors',
  'Proterra', 'Electric Last Mile Solutions',
  'Milton (Nikola founder fraud)',

  // ── Healthcare & Biotech ──
  'HealthSpot', 'Scanadu', 'Airstrip Technologies',
  'Practice Fusion', 'NantHealth (decline)',
  'Proteus Digital Health', 'Google Health (original)',
  '23andMe (decline)', 'Color Genomics (pivot)',
  'Theranos', 'Harbinger Health',
];

// ── Main ────────────────────────────────────────────────
async function runDailyAutopsy() {
  console.log('💀 Starting Forensic Crawler v2...');
  console.log(`   Model: ${MODEL}`);

  // 1. Pick next candidate
  const { data: existing } = await supabase.from('case_studies').select('company_name, slug');
  const existingNames = new Set((existing || []).map((e: { company_name: string; slug: string }) => e.company_name.toLowerCase()));
  const existingSlugs = new Set((existing || []).map((e: { company_name: string; slug: string }) => e.slug));

  let target: string | undefined;
  for (const candidate of CANDIDATES) {
    if (existingNames.has(candidate.toLowerCase())) continue;
    const candidateSlug = candidate.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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

  // ── Stage 1: Core Metadata ───────────────────────────
  console.log('\n📋 Stage 1/5: Generating core metadata...');
  const metadataPrompt = `Generate a comprehensive forensic autopsy report for the failed startup "${target}".

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

  const metadata = await generateJSON(metadataPrompt, CoreMetadataSchema);
  (metadata as unknown as Record<string, unknown>).case_number = caseNumber;
  // Ensure website is set
  if (!metadata.website) {
    metadata.website = deriveWebsite(metadata.company_name);
  }

  // Slug collision check
  const { data: slugCheck } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('slug', metadata.slug)
    .single();
  if (slugCheck) {
    console.log(`   ⏭ Slug "${metadata.slug}" already exists (AI named it "${metadata.company_name}")`);
    console.log(`   Add "${metadata.company_name}" as an alias for "${target}" and re-run.`);
    return;
  }

  console.log(`   ✅ ${metadata.company_name} — ${metadata.industry} (${metadata.founded_year}–${metadata.shutdown_year})`);

  // ── Stage 2: Enriched Data + Forensic Analysis ──────
  console.log('\n🎯 Stage 2/5: Generating enriched data (competitors, quotes, timeline, verdict, forensic autopsy)...');
  const enrichedPrompt = `For the failed startup "${target}" (${metadata.industry}, ${metadata.founded_year}–${metadata.shutdown_year}), generate structured data for a professional forensic research case study.

Return ONLY valid JSON with these arrays:

1. competitors: array of 3-5 competitors — real companies that competed with ${target}. Each has: {name, status: "active"|"closed"|"acquired", moat: string explaining their defensibility, advantage_over_failed: string explaining why they survived and ${target} did not}

2. quotes: array of 2-3 real or well-sourced attributed quotes about ${target}. Each: {text, author, role}. Use actual founder/investor/analyst names where known.

3. sources: array of 3-5 references to real or plausible articles. Each: {title, url, type: "Article"|"Report"|"Interview"|"Podcast"|"SEC Filing"}. Use realistic URLs based on major publications (TechCrunch, Bloomberg, NYT, Forbes, Crunchbase, SEC.gov).

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

9. evidence_images: optional array of up to 6 URLs for product screenshots, founder photos, or archived media. Use Clearbit logo URLs or placeholder images.

Use factual data where possible. Never fabricate funding amounts — use the total as a guide and distribute across rounds. Keep descriptions specific, evidence-driven, and concise. The failure_analysis is the centerpiece — make it thorough and diagnostic.`;
  const enriched = await generateJSON(enrichedPrompt, EnrichedDataSchema);

  console.log(`   ✅ ${enriched.timeline_events.length} timeline events, ${enriched.competitors.length} competitors, ${enriched.quotes.length} quotes`);

  // ── Stage 3: Narrative Content ───────────────────────
  console.log('\n📝 Stage 3/5: Generating narrative content...');
  const content = await generateContent(metadata.company_name, metadata.summary, metadata.failure_reasons);
  console.log(`   ✅ Content: ${content.length} chars`);

  // ── Stage 4: Logo Acquisition ────────────────────────
  console.log('\n🖼  Stage 4/5: Acquiring logo...');
  let logoUrl: string | null = null;
  try {
    logoUrl = await acquireLogoUrl(metadata.company_name);
    console.log(`   ${logoUrl ? '✅ Logo found: ' + logoUrl : 'ℹ️  No logo found, will use placeholder'}`);
  } catch (err) {
    console.log(`   ⚠ Logo acquisition failed: ${err instanceof Error ? err.message : 'unknown error'}`);
  }

  // ── Stage 5: Embedding ───────────────────────────────
  console.log('\n🧠 Stage 5/5: Generating embedding...');
  const embeddingText = `${metadata.company_name} ${metadata.summary} ${metadata.failure_reasons.join(' ')} ${metadata.industry} ${(metadata.tags || []).join(' ')}`;
  const embedding = await generateEmbedding(embeddingText);
  console.log(`   ✅ Embedding dimension: ${embedding.length}`);

  // ── Save to Database ─────────────────────────────────
  console.log('\n💾 Saving to database...');
  const { funding_rounds, legacy_impact, failure_analysis, evidence_images, ...restEnriched } = enriched;
  const finalData = {
    ...metadata,
    logo_url: logoUrl,
    content,
    ...restEnriched,
    financial_rounds: funding_rounds,
    failure_analysis: failure_analysis as Record<string, unknown>,
    evidence_images: (evidence_images || []) as string[],
    published: true,
    published_at: new Date().toISOString(),
    embedding,
  };

  const { error } = await supabase.from('case_studies').insert([finalData]);
  if (error) {
    if (error.message?.includes('duplicate key') || error.code === '23505') {
      console.log(`   ⚠ Duplicate key — ${target} was already stored`);
      return;
    }
    throw error;
  }
  console.log('   ✅ Stored in Supabase');

  // ── Save to Filesystem ───────────────────────────────
  const contentDir = path.join(process.cwd(), 'content', 'case-studies');
  const dataDir = path.join(process.cwd(), 'data', 'case-studies');
  if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, `${metadata.slug}.md`), content);
  fs.writeFileSync(path.join(dataDir, `${metadata.slug}.json`), JSON.stringify(finalData, null, 2));
  console.log('   ✅ Saved to filesystem');

  // ── Summary ──────────────────────────────────────────
  const { data: updatedExisting } = await supabase.from('case_studies').select('company_name');
  const updatedNames = new Set((updatedExisting || []).map((e: { company_name: string }) => e.company_name.toLowerCase()));
  const remaining = CANDIDATES.filter((c) => !updatedNames.has(c.toLowerCase()));
  console.log(`\n🚀 Published: ${target}`);
  console.log(`   Industry: ${metadata.industry}`);
  console.log(`   Timeline: ${metadata.founded_year} → ${metadata.shutdown_year}`);
  console.log(`   Content: ${content.length} chars`);
  console.log(`   Logo: ${logoUrl ? '✅' : '🔲 Placeholder'}`);
  console.log(`   Embedding: ${embedding.length} dimensions`);
  console.log(`📋 Queue remaining: ${remaining.length}`);
  if (remaining.length > 0) console.log(`   Next up: ${remaining[0]}`);
}

runDailyAutopsy().catch(console.error);
