import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { z } from 'zod';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NVIDIA_KEY = process.env.NVIDIA_API_KEY || '';

if (!SUPABASE_URL || !KEY || !NVIDIA_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, KEY);
const openai = new OpenAI({
  apiKey: NVIDIA_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 60000,
  maxRetries: 2,
});

const ReviewSchema = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(['pass', 'fix', 'regen']),
  issues: z.array(z.string()).max(10),
  strengths: z.array(z.string()).max(5),
  summary: z.string().max(500),
  recommendation: z.string().max(500),
});

type ReviewResult = z.infer<typeof ReviewSchema>;

async function llmReview(company: string, industry: string, summary: string, content: string, failureReasons: string[]): Promise<ReviewResult> {
  const prompt = `You are reviewing a case study for Startup Graveyard. Evaluate this case study:

Company: ${company}
Industry: ${industry}
Summary: ${summary}
Failure Reasons: ${failureReasons.join(', ')}

Content (first 4000 chars):
${(content || '').slice(0, 4000)}

Rate 0-100 across: accuracy of facts, completeness (9 sections: Background, Founding Story, Product Development, Launch & Go-to-Market, Growth & Traction, Challenges, Decline, Shutdown, Legacy), writing quality (clinical/professional), specificity (dates, metrics, names).

Return JSON:
{
  "score": number (0-100, 70+ = pass, 40-69 = fix, <40 = regen),
  "verdict": "pass" | "fix" | "regen",
  "issues": ["issue1", "issue2"],
  "strengths": ["strength1"],
  "summary": "one-line verdict",
  "recommendation": "specific action to take"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [
        { role: 'system', content: 'You are a quality control reviewer. Respond with ONLY valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });
    const text = response.choices[0]?.message?.content?.trim() || '{}';
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/gi, '').trim();
    const parsed = JSON.parse(cleaned);
    return ReviewSchema.parse(parsed);
  } catch {
    return {
      score: 50,
      verdict: 'fix',
      issues: ['LLM review parse failed — manual review needed'],
      strengths: [],
      summary: 'Unable to complete AI review',
      recommendation: 'Manually review this case study',
    };
  }
}

function extractLargestJSON(text: string): string | null {
  let start = -1;
  for (let i = 0; i < text.length; i++) { if (text[i] === '{') { start = i; break; } }
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (!inStr) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

async function duckduckgoSearch(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await resp.text();
    const results: { title: string; url: string; snippet: string }[] = [];
    const snippetRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const bodyRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;
    const urls: string[] = [];
    const titles: string[] = [];
    let m;
    while ((m = snippetRegex.exec(html)) !== null && results.length < 5) {
      urls.push(m[1].replace(/\/\/duckduckgo\.com\/l\/\?uddg=/, '').replace(/&rut=.*$/, ''));
      titles.push(m[2].replace(/<[^>]*>/g, '').trim());
    }
    const bodies: string[] = [];
    while ((m = bodyRegex.exec(html)) !== null && bodies.length < 5) {
      bodies.push(m[1].replace(/<[^>]*>/g, '').trim());
    }
    for (let i = 0; i < Math.min(urls.length, 5); i++) {
      results.push({ title: titles[i] || '', url: decodeURIComponent(urls[i] || ''), snippet: bodies[i] || '' });
    }
    return results;
  } catch {
    return [];
  }
}

async function main() {
  console.log('🔍 Fetching all case studies from DB...\n');
  const { data: cases } = await supabase
    .from('case_studies')
    .select('id, company_name, summary, failure_reasons, content, published, review_status, industry, founded_year, shutdown_year')
    .order('company_name');

  if (!cases || cases.length === 0) { console.log('No cases found.'); return; }

  console.log(`Found ${cases.length} case studies.\n`);

  const results: { company: string; score: number; verdict: string; issues: string[]; strengths: string[]; summary: string; webSources: number; }[] = [];

  for (let i = 0; i < cases.length; i++) {
    const c = cases[i];
    console.log(`\n${'-'.repeat(50)}`);
    console.log(`[${i + 1}/${cases.length}] ${c.company_name}`);
    console.log(`   ${c.industry || 'N/A'} | ${c.founded_year || '?'}–${c.shutdown_year || '?'} | Published: ${c.published}`);

    // Web search
    let webSources = 0;
    try {
      const q1 = `${c.company_name} ${c.failure_reasons?.[0] || 'failure'} shutdown`;
      const results1 = await duckduckgoSearch(q1);
      webSources += results1.length;
      await new Promise(r => setTimeout(r, 500));
    } catch { /* skip */ }

    // LLM review
    console.log('   🤖 AI review in progress...');
    const review = await llmReview(
      c.company_name, c.industry || '', c.summary || '', c.content || '', c.failure_reasons || []
    );

    console.log(`   📊 Score: ${review.score}/100 | Verdict: ${review.verdict}`);
    console.log(`   📝 ${review.summary}`);
    if (review.issues.length > 0) {
      for (const issue of review.issues) console.log(`     ⚠ ${issue}`);
    }
    if (review.strengths.length > 0) {
      for (const s of review.strengths) console.log(`     ✅ ${s}`);
    }

    results.push({
      company: c.company_name,
      score: review.score,
      verdict: review.verdict,
      issues: review.issues,
      strengths: review.strengths,
      summary: review.summary,
      webSources,
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`\nTotal: ${results.length}`);
  console.log(`✅ Pass: ${results.filter(r => r.verdict === 'pass').length}`);
  console.log(`🔧 Fix: ${results.filter(r => r.verdict === 'fix').length}`);
  console.log(`🔄 Regen: ${results.filter(r => r.verdict === 'regen').length}`);

  const needsAction = results.filter(r => r.verdict !== 'pass');
  if (needsAction.length > 0) {
    console.log('\n--- ACTION REQUIRED ---');
    for (const r of needsAction) {
      const label = r.verdict === 'fix' ? '🔧 Fix' : '🔄 Regen';
      console.log(`\n${label} [${r.score}/100] ${r.company} (web: ${r.webSources} sources)`);
      if (r.issues.length > 0) {
        for (const issue of r.issues) console.log(`   • ${issue}`);
      }
    }
  }

  console.log('\n✅ Review complete.');
}

main().catch(console.error);
