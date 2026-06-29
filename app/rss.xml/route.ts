import { listCaseStudies } from '@/lib/db/case-studies';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const cases = await listCaseStudies({ limit: 50 });

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://startupgraveyard.com';

  const items = cases.map((c) => `
    <item>
      <title>${escapeXml(c.company_name)} — Case ${c.case_number}</title>
      <link>${siteUrl}/case/${c.slug}</link>
      <description>${escapeXml(c.summary?.substring(0, 300) || '')}</description>
      <pubDate>${c.published_at ? new Date(c.published_at).toUTCString() : new Date().toUTCString()}</pubDate>
      <guid>${siteUrl}/case/${c.slug}</guid>
      <category>${escapeXml(c.industry || 'General')}</category>
    </item>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Startup Graveyard — Forensic Archive</title>
    <link>${siteUrl}</link>
    <description>The world's most comprehensive database of startup failure case studies.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
