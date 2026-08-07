import { searchWeb } from '../lib/web-search';

async function main() {
  console.log('Testing DuckDuckGo web search...\n');

  const queries = ['Theranos fraud shutdown', 'Quibi failure', 'Better.com layoffs'];

  for (const q of queries) {
    console.log(`Query: "${q}"`);
    const results = await searchWeb(q, 3);
    if (results.length === 0) {
      console.log('   No results');
    } else {
      for (const r of results) {
        console.log(`   [${r.title}](${r.url})`);
        console.log(`   "${r.content.slice(0, 120)}..."`);
      }
    }
    console.log();
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('✅ Done');
}

main().catch(console.error);
