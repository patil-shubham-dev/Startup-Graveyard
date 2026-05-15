
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testRAG(query: string) {
  console.log(`Testing RAG for query: "${query}"`);
  
  // 1. Generate embedding
  const response = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`
    },
    body: JSON.stringify({
      model: 'nvidia/nv-embedqa-e5-v5',
      input: query,
      input_type: 'query'
    })
  });

  const data = await response.json();
  const embedding = data.data[0].embedding;
  console.log(`Generated embedding of length ${embedding.length}`);

  // 2. Search
  const { data: results, error } = await supabase.rpc('match_case_studies', {
    query_embedding: embedding,
    match_threshold: 0.1, // Low threshold for testing
    match_count: 3
  });

  if (error) {
    console.error('Search error:', error);
    return;
  }

  console.log('Results:');
  results.forEach((r: any) => {
    console.log(`- ${r.company_name} (Similarity: ${r.similarity.toFixed(4)})`);
  });
}

testRAG('Why did Quibi fail?');
