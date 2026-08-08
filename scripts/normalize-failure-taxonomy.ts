/**
 * normalize-failure-taxonomy.ts
 *
 * One-shot + reusable data-cleanup script: reads every case study JSON in
 * data/case-studies/, canonicalizes failure_reasons via lib/taxonomy, and
 * rewrites only files that actually changed (preserving exact file
 * formatting: JSON.stringify(d, null, 2) + '\n').
 *
 * Run:  npx tsx scripts/normalize-failure-taxonomy.ts
 *
 * Canonicalization is idempotent: safe to re-run after any data edit.
 */
import * as fs from 'fs';
import * as path from 'path';
import { canonicalizeFailureReasons } from '../lib/taxonomy';

const DATA_DIR = path.join(process.cwd(), 'data', 'case-studies');
const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));

let changed = 0;
const report: Array<{ slug: string; before: string[]; after: string[] }> = [];

for (const file of files) {
  const p = path.join(DATA_DIR, file);
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!Array.isArray(d.failure_reasons)) continue;

  const before = [...d.failure_reasons];
  const after = canonicalizeFailureReasons(before);
  const same = before.length === after.length && before.every((r, i) => r === after[i]);

  if (!same) {
    d.failure_reasons = after;
    fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
    changed += 1;
    report.push({ slug: d.slug, before, after });
  }
}

console.log(`\nCanonicalized ${changed} of ${files.length} files.\n`);
for (const r of report) {
  console.log(`  ${r.slug}`);
  console.log(`    before: ${r.before.join(', ')}`);
  console.log(`    after : ${r.after.join(', ')}`);
}

// Post-condition audit: distinct labels + counts across the published set
const counts = new Map<string, number>();
for (const file of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
  if (!d.published) continue;
  for (const r of d.failure_reasons ?? []) counts.set(r, (counts.get(r) ?? 0) + 1);
}
console.log('\nPost-audit distinct canonical labels (published only):');
for (const [k, v] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(22)} ${v}`);
}