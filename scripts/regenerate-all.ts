import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const TARGET_COUNT = 20;

// ── Step 1: Delete all from Supabase ─────────────────
async function deleteFromDB() {
  console.log('🗑  Deleting all case studies from Supabase...');
  const { error } = await supabase.from('case_studies').delete().neq('id', 'placeholder');
  if (error) {
    console.error('Delete failed:', error.message);
    process.exit(1);
  }
  console.log('   ✅ All records deleted');
}

// ── Step 2: Clean filesystem ─────────────────────────
function cleanFilesystem() {
  for (const dir of ['content/case-studies', 'data/case-studies']) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) continue;
    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      fs.unlinkSync(path.join(fullPath, file));
    }
    console.log(`   ✅ Cleared ${dir}/ (${files.length} files)`);
  }
}

// ── Step 3: Generate TARGET_COUNT cases ──────────────
function generateCases() {
  const scriptPath = path.join(process.cwd(), 'scripts', 'daily-autopsy.ts');
  for (let i = 0; i < TARGET_COUNT; i++) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📦 Case ${i + 1}/${TARGET_COUNT}`);
    console.log(`${'='.repeat(50)}\n`);
    try {
      execSync(`npx tsx "${scriptPath}"`, {
        cwd: process.cwd(),
        stdio: 'inherit',
        timeout: 5 * 60 * 1000, // 5 min per case
      });
    } catch {
      console.error(`\n❌ Case ${i + 1} failed, continuing...`);
    }
  }
}

// ── Main ─────────────────────────────────────────────
async function main() {
  console.log('💀 REGENERATE ALL — FULL RESET');
  console.log(`   Target: ${TARGET_COUNT} case studies\n`);

  await deleteFromDB();
  cleanFilesystem();

  console.log('\n🚀 Starting batch generation...');
  generateCases();

  console.log(`\n✅ Done — ${TARGET_COUNT} case studies generated.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
