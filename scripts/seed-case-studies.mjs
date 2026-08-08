import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'case-studies');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: createTimeoutFetch(30000) },
});

function createTimeoutFetch(timeoutMs) {
  return (url, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
  };
}

const EMBEDDING_DIM = 1024;

// --force: re-sync editorial governance (published / review_status /
// published_at / review_notes) from the files. Without it, governance is
// preserved from the DB so a re-seed can't silently publish or unpublish
// rows an editor has already decided on (content/metadata always syncs).
const FORCE_GOVERNANCE = process.argv.includes('--force');

function toRow(json) {
  const row = {
    slug: json.slug,
    case_number: json.case_number,
    company_name: json.company_name,
    website: json.website ?? null,
    founded_year: json.founded_year ?? null,
    shutdown_year: json.shutdown_year ?? null,
    country: json.country ?? null,
    industry: json.industry ?? null,
    business_model: json.business_model ?? null,
    founders: json.founders ?? [],
    funding_raised: json.funding_raised ?? null,
    employees_peak: json.employees_peak ?? null,
    valuation_peak: json.valuation_peak ?? null,
    investors: json.investors ?? [],
    summary: json.summary,
    failure_reasons: json.failure_reasons ?? [],
    root_causes: json.root_causes ?? [],
    warning_signs: json.warning_signs ?? [],
    lessons: json.lessons ?? [],
    tags: json.tags ?? [],
    external_references: json.external_references ?? null,
    risk_scores: json.risk_scores ?? null,
    content: json.content ?? null,
    published: json.published === true,
    published_at: json.published ? (json.published_at ?? new Date().toISOString()) : null,
    review_status: json.review_status ?? (json.published ? 'published' : 'in_review'),
    review_notes: json.review_notes ?? null,
    fact_check_score: json.fact_check_score ?? null,
    verified_sources: json.verified_sources ?? [],
  };

  if (Array.isArray(json.embedding) && json.embedding.length === EMBEDDING_DIM) {
    row.embedding = '[' + json.embedding.join(',') + ']';
  } else {
    row.embedding = null;
    if (Array.isArray(json.embedding)) {
      console.warn(`  ${json.slug}: embedding is ${json.embedding.length}-dim, expected ${EMBEDDING_DIM} — storing NULL`);
    }
  }

  return row;
}

async function upsertWithRetry(row, attempts = 3) {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    const { error } = await admin.from('case_studies').upsert(row, { onConflict: 'slug', ignoreDuplicates: false });
    if (!error) return null;
    lastError = error;
    if (i < attempts) {
      await new Promise((r) => setTimeout(r, 2000 * i));
      console.warn(`  retry ${row.slug} (attempt ${i + 1}/${attempts}): ${error.message}`);
    }
  }
  return lastError;
}

async function main() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} case study files${FORCE_GOVERNANCE ? ' (--force: governance synced from files)' : ' (governance preserved from DB)'}`);

  const { data: existingRows } = await admin.from('case_studies').select('slug, published, published_at, review_status, review_notes');
  const existingBySlug = new Map((existingRows ?? []).map((r) => [r.slug, r]));

  let inserted = 0;
  let updated = 0;
  let preserved = 0;
  for (const file of files) {
    const json = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));
    const row = toRow(json);
    const existing = existingBySlug.get(json.slug);

    if (existing && !FORCE_GOVERNANCE) {
      row.published = existing.published;
      row.published_at = existing.published_at;
      row.review_status = existing.review_status;
      row.review_notes = existing.review_notes;
      preserved += 1;
    }

    const error = await upsertWithRetry(row);

    if (error) {
      console.error(`  FAIL ${json.slug}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    const action = existing ? 'update' : 'insert';
    console.log(`  ${action} ${json.slug}: published=${row.published} review=${row.review_status}${existing && !FORCE_GOVERNANCE ? ' (governance preserved)' : ''}`);
    if (existing) updated += 1;
    else inserted += 1;
  }
  console.log(`\nDone: ${inserted} inserted, ${updated} updated (${preserved} governance-preserved)`);

  const { data: dbRows, error: listError } = await admin
    .from('case_studies')
    .select('slug, company_name, published, review_status');

  if (listError) {
    console.error(`List failed: ${listError.message}`);
  } else {
    const localSlugs = new Set(files.map((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf8')).slug));
    const dbOnly = dbRows.filter((r) => !localSlugs.has(r.slug));
    if (dbOnly.length) {
      console.warn(`\nDB rows with no local file (not touched, left as-is):`);
      dbOnly.forEach((r) => console.warn(`  ${r.slug} (${r.company_name}, published=${r.published}, review=${r.review_status})`));
    } else {
      console.log(`\nAll ${dbRows.length} DB rows map to local files — clean.`);
    }
    console.log(`Total rows in DB now: ${dbRows.length}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
