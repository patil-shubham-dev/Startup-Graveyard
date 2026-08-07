import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!NVIDIA_API_KEY || NVIDIA_API_KEY.length <= 20) {
  console.error('Missing or invalid NVIDIA_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
  timeout: 60000,
  maxRetries: 2,
});

const EMBEDDING_MODEL = 'nvidia/nv-embedqa-e5-v5';
const BATCH_SIZE = 10;

function buildEmbeddingText(row: {
  company_name: string;
  summary: string;
  failure_reasons: string[] | null;
  industry: string | null;
  tags: string[] | null;
}): string {
  return [
    row.company_name,
    row.summary,
    (row.failure_reasons || []).join(' '),
    row.industry || '',
    (row.tags || []).join(' '),
  ]
    .filter(Boolean)
    .join(' ');
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    input_type: 'query',
  } as never);
  return response.data[0].embedding;
}

async function main() {
  console.log('🔍 Fetching cases with NULL embeddings...');

  const { data: cases, error } = await supabase
    .from('case_studies')
    .select('id, company_name, summary, failure_reasons, industry, tags')
    .is('embedding', null);

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  if (!cases || cases.length === 0) {
    console.log('✅ No cases need re-embedding.');
    return;
  }

  console.log(`📦 Found ${cases.length} cases to re-embed.`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < cases.length; i += BATCH_SIZE) {
    const batch = cases.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (row) => {
        const text = buildEmbeddingText(row);
        try {
          const embedding = await generateEmbedding(text);
          const { error: updateError } = await supabase
            .from('case_studies')
            .update({ embedding } as never)
            .eq('id', row.id);

          if (updateError) {
            console.error(`  ✗ ${row.company_name}: ${updateError.message}`);
            failed++;
          } else {
            updated++;
            process.stdout.write('.');
          }
        } catch (err) {
          console.error(`  ✗ ${row.company_name}: ${err instanceof Error ? err.message : err}`);
          failed++;
        }
      }),
    );

    console.log(`  [${Math.min(i + BATCH_SIZE, cases.length)}/${cases.length}]`);
  }

  console.log(`\n✅ Done — ${updated} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
