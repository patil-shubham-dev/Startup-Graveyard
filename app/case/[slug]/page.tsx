import { getCaseStudy, getSimilarCases } from '@/lib/db/case-studies';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import { Metadata } from 'next';
import { EditorialHero } from '@/components/case-study/editorial-hero';
import { EditorialBody } from '@/components/case-study/editorial-body';

export const revalidate = 3600;

export async function generateStaticParams() {
  const { supabase } = await import('@/lib/db/config');
  const { data: cases } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('published', true);
  return (cases || []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.company_name} — Case Study | Startup Graveyard`,
    description: study.summary,
    openGraph: {
      title: `${study.company_name} — Case Study`,
      description: study.summary,
      type: 'article',
      images: [{
        url: `/api/og?title=${encodeURIComponent(study.company_name)}&type=CASE_STUDY`,
        width: 1200, height: 630,
      }],
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return notFound();

  const similarCases = await getSimilarCases(study.id);

  const mdxComponents = {};
  const { content } = await compileMDX({
    source: study.content || '# Dossier Content Pending\n\nFull investigation is currently being finalized.',
    components: mdxComponents,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${study.company_name} — Case Study | Startup Graveyard`,
    description: study.summary,
    datePublished: study.published_at || undefined,
    author: { '@type': 'Organization', name: 'Startup Graveyard' },
    about: {
      '@type': 'Corporation',
      name: study.company_name,
      industry: study.industry || undefined,
      foundingDate: study.founded_year?.toString(),
      dissolutionDate: study.shutdown_year?.toString(),
    },
    keywords: ['startup failure', 'case study', study.industry, ...(study.failure_reasons || [])].filter(Boolean).join(', '),
  };

  return (
    <main className="min-h-screen bg-[var(--cream-base)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-[var(--cream-dark)]/30">
        <div id="scroll-progress-bar" className="h-full bg-[var(--rust-accent)] transition-all duration-100" style={{ width: '0%' }} />
        <ScrollProgress />
      </div>

      <EditorialHero study={study} />

      <div className="mx-auto max-w-[960px] px-6 py-16 md:py-24">
        <EditorialBody study={study} narrativeContent={content} similarCases={similarCases} />
      </div>
    </main>
  );
}

function ScrollProgress() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('scroll', function() {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            var bar = document.getElementById('scroll-progress-bar');
            if (bar) bar.style.width = progress + '%';
          });
        `,
      }}
    />
  );
}
