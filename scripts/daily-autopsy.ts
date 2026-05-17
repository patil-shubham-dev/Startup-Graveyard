/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIService } from '../lib/ai';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually if needed (for local running)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = AIService.getInstance();

const CaseStudySchema = z.object({
  company_name: z.string(),
  slug: z.string(),
  case_number: z.string(),
  summary: z.string(),
  founded_year: z.number(),
  shutdown_year: z.number(),
  industry: z.string(),
  funding_raised: z.number(),
  employees_peak: z.number(),
  valuation_peak: z.number().optional(),
  investors: z.array(z.string()),
  founders: z.array(z.string()),
  location: z.string(),
  failure_reasons: z.array(z.string()),
  lessons: z.array(z.string()),
  tags: z.array(z.string()),
  metrics: z.object({
    capital_raised: z.string(),
    peak_valuation: z.string(),
    years_active: z.number(),
    peak_employees: z.string(),
    burn_rate: z.string(),
    exit_value: z.string(),
  }),
  risk_scores: z.record(z.string(), z.number()),
  timeline_events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['milestone', 'warning', 'crisis']),
  })),
  financial_data: z.object({
    rounds: z.array(z.object({
      date: z.string(),
      amount: z.number(),
    })),
    headcount: z.array(z.object({
      date: z.string(),
      count: z.number(),
    })),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    status: z.enum(['active', 'closed', 'acquired']),
    moat: z.string(),
    advantage_over_failed: z.string(),
  })),
  quotes: z.array(z.object({
    text: z.string(),
    author: z.string(),
    role: z.string(),
  })),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string(),
  })),
  verdict: z.object({
    top_reasons: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })),
    final_word: z.string(),
  }),
  content: z.string(), // MDX Long-form content
});

const CANDIDATES = [
  'Quibi', 'Theranos', 'Jawbone', 'Fast', 'ScaleFactor', 'Katerra', 
  'Loom', 'Varo (Original Vision)', 'Juicero', 'Pebble', 'Fab.com', 
  'Better.com (Context of failure)', 'Zume Pizza', 'Argo AI', 'Bird',
  'Convoy', 'Olive AI', 'Zeus Living', 'Cazoo', 'Arrival'
];

async function runDailyAutopsy() {
  console.log('💀 Starting Forensic Crawler...');

  // 1. Pick a candidate that hasn't been covered
  const { data: existing } = await supabase.from('case_studies').select('company_name');
  const existingNames = (existing || []).map(e => e.company_name.toLowerCase());
  
  const target = CANDIDATES.find(c => !existingNames.includes(c.toLowerCase()));
  
  if (!target) {
    console.log('🏁 All candidates covered. Investigation complete.');
    return;
  }

  console.log(`🔍 Researching Target: ${target}...`);

  // 2. Generate detailed report via AI
  const prompt = `Perform a comprehensive forensic autopsy on the failed startup: ${target}.
  Provide a detailed report in JSON format matching the schema. 
  Include a long-form narrative content (3000+ words) in the 'content' field using MDX.
  Ensure all data is factual. If exact figures are unknown, provide best estimates based on public records.
  
  The report should be clinical, professional, and deeply analytical.
  For 'case_number', use a unique ID like CASE-#XXXX.
  For 'slug', use the company name in lowercase kebab-case.`;

  try {
    const report = await ai.generate(prompt, CaseStudySchema);
    
    console.log(`✅ Research Complete. Generating Embeddings for ${target}...`);
    
    const embedding = await ai.embed(`${report.company_name} ${report.summary} ${report.failure_reasons.join(' ')}`);

    const finalData = {
      ...report,
      published: true,
      published_at: new Date().toISOString(),
      embedding,
    };

    // 3. Store in Supabase
    const { error } = await supabase.from('case_studies').insert([finalData]);

    if (error) throw error;

    // 4. Save to filesystem for Git history (per user request)
    const contentDir = path.join(process.cwd(), 'content', 'case-studies');
    const dataDir = path.join(process.cwd(), 'data', 'case-studies');
    
    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(path.join(contentDir, `${report.slug}.md`), report.content);
    fs.writeFileSync(path.join(dataDir, `${report.slug}.json`), JSON.stringify(finalData, null, 2));

    console.log(`🚀 Successfully archived and published case: ${target}`);
  } catch (error) {
    console.error(`❌ Investigation failed for ${target}:`, error);
  }
}

runDailyAutopsy().catch(console.error);
