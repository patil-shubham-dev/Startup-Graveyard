export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface VerifiedSource {
  claim: string;
  source_url: string;
  source_title: string;
  confidence: 'high' | 'medium' | 'low' | 'unverified';
  snippet: string;
}

function extractDDGResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];

  // Try multiple selector patterns as DDG changes their HTML structure frequently
  const selectors = [
    // Pattern 1: result__a / result__snippet (classic DDG)
    { link: /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, snippet: /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi },
    // Pattern 2: article > h2 > a (semantic HTML)
    { link: /<article[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, snippet: /<article[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi },
    // Pattern 3: data-testid attributes
    { link: /<a[^>]*data-testid="result-title-a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, snippet: /<div[^>]*data-testid="result-snippet"[^>]*>([\s\S]*?)<\/div>/gi },
    // Pattern 4: generic result links
    { link: /<a[^>]*rel="nofollow"[^>]*href="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, snippet: /<td[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/td>/gi },
  ];

  for (const sel of selectors) {
    const urls: string[] = [];
    const titles: string[] = [];
    const bodies: string[] = [];
    let m;

    sel.link.lastIndex = 0;
    while ((m = sel.link.exec(html)) !== null && urls.length < maxResults) {
      const rawUrl = m[1];
      const decoded = rawUrl.includes('uddg=')
        ? decodeURIComponent(rawUrl.replace(/.*uddg=([^&]+).*/, '$1'))
        : rawUrl;
      urls.push(decoded);
      titles.push(m[2].replace(/<[^>]*>/g, '').trim());
    }

    if (urls.length === 0) continue;

    sel.snippet.lastIndex = 0;
    while ((m = sel.snippet.exec(html)) !== null && bodies.length < maxResults) {
      bodies.push(m[1].replace(/<[^>]*>/g, '').trim());
    }

    for (let i = 0; i < Math.min(urls.length, maxResults); i++) {
      results.push({
        title: titles[i] || '',
        url: urls[i] ? decodeURIComponent(urls[i]) : '',
        content: bodies[i] || '',
        score: 1,
      });
    }

    if (results.length > 0) break;
  }

  return results;
}

export async function searchWeb(query: string, maxResults = 5): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    // DuckDuckGo returns 202 and a redirect URL — follow it
    if (resp.status === 202) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 10000);
      resp = await fetch(resp.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: controller2.signal,
      }).finally(() => clearTimeout(timeout2));
    }
    const html = await resp.text();
    return extractDDGResults(html, maxResults);
  } catch {
    return [];
  }
}

export async function verifyFacts(
  companyName: string,
  summary: string,
  failureReasons: string[],
): Promise<{ sources: VerifiedSource[]; score: number }> {
  const sources: VerifiedSource[] = [];

  const queries = [
    `${companyName} ${failureReasons[0] || 'failure'} shutdown`,
    `${companyName} funding raised`,
    `${companyName} founded shutdown year`,
  ];

  const seenUrls = new Set<string>();

  for (const query of queries) {
    const results = await searchWeb(query, 3);
    for (const result of results) {
      if (seenUrls.has(result.url)) continue;
      seenUrls.add(result.url);

      const titleLower = result.title.toLowerCase();
      const contentLower = result.content.toLowerCase();
      const companyLower = companyName.toLowerCase();

      let confidence: VerifiedSource['confidence'] = 'low';
      if (titleLower.includes(companyLower) && contentLower.includes('fail')) {
        confidence = 'high';
      } else if (titleLower.includes(companyLower) || contentLower.includes(companyLower)) {
        confidence = 'medium';
      }

      sources.push({
        claim: query,
        source_url: result.url,
        source_title: result.title,
        confidence,
        snippet: result.content.slice(0, 300),
      });
    }

    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  if (sources.length === 0) return { sources, score: 0 };

  const highCount = sources.filter((s) => s.confidence === 'high').length;
  const medCount = sources.filter((s) => s.confidence === 'medium').length;
  const totalSources = sources.length;

  const score = Math.round(
    (highCount * 100 + medCount * 60 + (totalSources - highCount - medCount) * 20) / totalSources,
  );

  return { sources, score };
}
