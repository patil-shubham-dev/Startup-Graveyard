const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  async function check(name, url, fn) {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const body = await page.locator('body').innerText().catch(() => '');
      const status = resp ? resp.status() : 'no-response';
      const fail = await fn(page, body);
      results.push({ name, url, status, ok: !fail && errors.length === 0, fail, errors: errors.slice(0, 3) });
    } catch (e) {
      results.push({ name, url, status: 'ERR', ok: false, fail: e.message, errors });
    }
    page.removeAllListeners('pageerror');
    page.removeAllListeners('console');
  }

  await check('home ledger', 'http://localhost:3000/', async (p, body) => {
    if (!body.includes('20 documented')) return 'expected "20 documented" in hero, not found';
    if (body.includes('11 documented')) return 'stale "11 documented" still present';
    return null;
  });

  await check('about page', 'http://localhost:3000/about', async (p, body) => {
    if (!body.includes('20 documented case studies')) return 'expected "20 documented case studies" on about, not found';
    if (!body.includes('16 cases published')) return 'expected "16 cases published" in footer, not found';
    return null;
  });

  await check('pre-mortem', 'http://localhost:3000/pre-mortem', async (p, body) => {
    if (!body.includes('20 documented failure cases')) return 'expected "20 documented failure cases" on pre-mortem, not found';
    return null;
  });

  await check('case/arrival', 'http://localhost:3000/case/arrival', async (p, body) => {
    if (!body.includes('$1B')) return 'expected "$1B" funding on arrival, not found';
    return null;
  });

  await check('case/argo-ai', 'http://localhost:3000/case/argo-ai', async (p, body) => {
    if (body.includes('$1.5B') && body.includes('Funding Raised')) {
      const m = body.match(/Funding Raised[\s\S]{0,200}?(\$\d[\d.,]*[BMK]?)/);
      if (m && m[1] !== '$1.5B') return `argo-ai funding ${m[1]} looks stale`;
    }
    return null;
  });

  await check('insights', 'http://localhost:3000/insights', async (p, body) => {
    if (!body.includes('$17.74B')) return 'expected "Total Burned: $17.74B" on insights, not found';
    return null;
  });

  await check('explore', 'http://localhost:3000/explore', async (p, body) => {
    if (!body.includes('Argo AI') || !body.includes('Zume')) return 'explore list looks incomplete';
    return null;
  });

  await browser.close();

  let allOk = true;
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name} (${r.status})`);
    if (r.fail) console.log(`     ${r.fail}`);
    if (r.errors && r.errors.length) console.log(`     console/page errors: ${r.errors.join(' | ')}`);
    if (!r.ok) allOk = false;
  }
  console.log(allOk ? '\nALL CHECKS PASSED' : '\nSOME CHECKS FAILED');
  process.exit(allOk ? 0 : 1);
})();
