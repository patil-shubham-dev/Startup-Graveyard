
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing since we don't want to add dependencies
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const NVIDIA_API_KEY = env.NVIDIA_API_KEY;
const EMBEDDING_MODEL = 'nvidia/nv-embedqa-e5-v5';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !NVIDIA_API_KEY) {
  console.error('Missing environment variables in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
      input_type: 'query'
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Nvidia API Error: ${JSON.stringify(data)}`);
  }

  return data.data[0].embedding;
}

async function main() {
  console.log('--- Startup Graveyard: Embedding Generator ---');
  
  // 1. Fetch case studies without embeddings
  const { data: cases, error } = await supabase
    .from('case_studies')
    .select('id, company_name, summary, industry, failure_reasons')
    .is('embedding', null);

  if (error) {
    console.error('Failed to fetch case studies:', error);
    return;
  }

  if (!cases || cases.length === 0) {
    console.log('No case studies found missing embeddings.');
    return;
  }

  console.log(`Found ${cases.length} case studies to process.`);

  for (const c of cases) {
    console.log(`Processing ${c.company_name}...`);
    
    // Create rich text for embedding
    const reasons = Array.isArray(c.failure_reasons) ? c.failure_reasons.join(', ') : '';
    const text = `${c.company_name}: ${c.summary}. Industry: ${c.industry}. Failure Reasons: ${reasons}`;

    try {
      const embedding = await generateEmbedding(text);
      
      const { error: updateError } = await supabase
        .from('case_studies')
        .update({ embedding })
        .eq('id', c.id);

      if (updateError) {
        console.error(`Failed to update ${c.company_name}:`, updateError);
      } else {
        console.log(`Successfully updated ${c.company_name}`);
      }
    } catch (err: any) {
      console.error(`Error processing ${c.company_name}:`, err.message);
    }
  }

  console.log('--- Processing Complete ---');
}

main();
