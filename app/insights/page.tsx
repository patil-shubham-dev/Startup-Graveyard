import dynamic from 'next/dynamic';
import { getInsightsIntelligenceData, type InsightsIntelligenceData } from '@/lib/db/insights-data';
import FailureIntelligenceReport from '@/components/insights/FailureIntelligenceReport';
import FeaturedDiscovery from '@/components/insights/FeaturedDiscovery';
import ResearchCard from '@/components/insights/ResearchCard';
import IntelligenceFeed from '@/components/insights/IntelligenceFeed';
import IndustryIntelligenceProfile from '@/components/insights/IndustryIntelligenceProfile';
import FounderFailurePlaybook from '@/components/insights/FounderFailurePlaybook';
import CompareFailures from '@/components/insights/CompareFailures';
import IntelligenceGraph from '@/components/insights/IntelligenceGraph';
import ScrollToTop from '@/components/insights/ScrollToTop';

const HistoryOfFailure = dynamic(() => import('@/components/insights/HistoryOfFailure'), {
  loading: () => <div className="skeleton-cream" style={{ height: '500px', width: '100%', borderRadius: '2px' }} />,
});

const FailureLeaderboards = dynamic(() => import('@/components/insights/FailureLeaderboards'), {
  loading: () => <div className="skeleton-cream" style={{ height: '400px', width: '100%', borderRadius: '2px' }} />,
});

const IntelligenceSearch = dynamic(() => import('@/components/insights/IntelligenceSearch'), {
  loading: () => <div className="skeleton-cream" style={{ height: '80px', width: '100%', borderRadius: '2px' }} />,
});

export const revalidate = 86400;

function SectionLabel({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <span style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        color: color || 'var(--rust-accent)',
      }}>
        {children}
      </span>
      <div style={{ height: '1px', flex: 1, background: 'var(--cream-dark)' }} />
    </div>
  );
}

function SectionTitle({ children, size }: { children: React.ReactNode; size?: string }) {
  return (
    <h2 style={{
      fontFamily: 'var(--font-cormorant), Georgia, serif',
      fontSize: size || 'clamp(32px, 3vw, 48px)',
      fontWeight: '500',
      lineHeight: 1.05,
      color: 'var(--ink-black)',
      letterSpacing: '-0.02em',
      marginBottom: '12px',
    }}>
      {children}
    </h2>
  );
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      fontSize: '14px',
      lineHeight: 1.7,
      color: 'var(--ink-muted)',
      marginBottom: '32px',
      maxWidth: '55ch',
    }}>
      {children}
    </p>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{
      padding: '48px',
      textAlign: 'center',
      backgroundColor: 'var(--cream-deep)',
      border: '1.5px dashed var(--cream-dark)',
      borderRadius: '2px',
    }}>
      <div style={{
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: 'var(--ink-muted)',
        marginBottom: '8px',
      }}>
        INSUFFICIENT ARCHIVE DATA
      </div>
      <p style={{
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: 1.6,
        color: 'var(--ink-muted)',
        maxWidth: '50ch',
        margin: '0 auto',
      }}>
        {message}
      </p>
    </div>
  );
}

export default async function InsightsPage() {
  const data: InsightsIntelligenceData = await getInsightsIntelligenceData();
  const { briefing, featuredDiscovery, patterns, discoveries, leaderboards, industries, mistakes, timeline, comparisons, intelligenceGraph = { nodes: [], links: [] }, totalCases, totalBurned, avgLifespan } = data;

  const hasData = totalCases > 0;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--cream-base)' }}>
      <ScrollToTop />
      {/* ===== 1. FAILURE INTELLIGENCE REPORT (HERO) ===== */}
      <FailureIntelligenceReport
        briefing={briefing}
        totalCases={totalCases}
        totalBurned={totalBurned}
        avgLifespan={avgLifespan}
        hasData={hasData}
      />

      {/* ===== 2. FEATURED DISCOVERY ===== */}
      <FeaturedDiscovery discovery={featuredDiscovery} hasData={hasData} />

      {/* ===== 3. PATTERN INTELLIGENCE ===== */}
      <div className="sg-container section-pad">
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>PATTERN INTELLIGENCE // RESEARCH</SectionLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '48px',
            alignItems: 'end',
          }} className="lg:grid-cols-1">
            <div>
              <SectionTitle size="clamp(36px, 3.5vw, 52px)">Pattern Intelligence.</SectionTitle>
              <SectionDescription>
                Every failure follows a pattern. Our research has identified {patterns.length} distinct failure modes from the archive, ranked by severity and observed frequency.
              </SectionDescription>
            </div>
            <div style={{ textAlign: 'right' }} className="lg:text-left">
              <div style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--ink-muted)',
              }}>
                Sorted by risk severity · Click to expand
              </div>
            </div>
          </div>

          {patterns.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {patterns.map((pattern, i) => (
                <ResearchCard key={pattern.name} pattern={pattern} rank={i + 1} />
              ))}
            </div>
          ) : (
            <EmptyState message="Insufficient archive data to identify failure patterns." />
          )}
        </section>

        {/* ===== 4. FAILURE KNOWLEDGE GRAPH ===== */}
        <section style={{ marginBottom: '100px' }}>
          <SectionLabel>FAILURE KNOWLEDGE GRAPH // INTELLIGENCE MAP</SectionLabel>
          <SectionTitle size="clamp(36px, 3.5vw, 52px)">Failure Knowledge Graph.</SectionTitle>
          <SectionDescription>
            An interactive intelligence map of the entire business failure ecosystem. {intelligenceGraph.nodes.length} mapped entities connected by {intelligenceGraph.links.length} relationships. Click any node to explore connections across patterns, companies, industries, and outcomes.
          </SectionDescription>
          <IntelligenceGraph nodes={intelligenceGraph.nodes} links={intelligenceGraph.links} hasData={hasData} />
        </section>

        {/* ===== 5. ARCHIVE DISCOVERIES ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>ARCHIVE DISCOVERIES // FINDINGS</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">Archive Discoveries.</SectionTitle>
          <SectionDescription>
            Automated intelligence extracted from cross-referencing {hasData ? totalCases : 'archived'} failure cases. These findings emerge from statistical analysis of patterns across companies, industries, and time periods.
          </SectionDescription>
          <IntelligenceFeed discoveries={discoveries} hasData={hasData} />
        </section>

        {/* ===== 6. FAILURE LEADERBOARDS ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>FAILURE LEADERBOARDS // RANKINGS</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">Failure Leaderboards.</SectionTitle>
          <SectionDescription>
            Ranked lists of the most extreme failures across seven different metrics. Each leaderboard reveals different dimensions of how and why companies fail.
          </SectionDescription>
          <FailureLeaderboards items={leaderboards} hasData={hasData} />
        </section>

        {/* ===== 7. INDUSTRY INTELLIGENCE ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>INDUSTRY INTELLIGENCE // SECTORS</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">Industry Intelligence.</SectionTitle>
          <SectionDescription>
            Deep failure analysis by sector. Each industry profile reveals failure rates, most common causes, costliest collapses, and average company lifespan.
          </SectionDescription>
          <IndustryIntelligenceProfile industries={industries} hasData={hasData} />
        </section>

        {/* ===== 8. COMPARE FAILURES ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>COMPARE FAILURES // SIDE-BY-SIDE</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">Compare Failures.</SectionTitle>
          <SectionDescription>
            Side-by-side failure storytelling. Explore how different companies followed similar paths to collapse, and extract shared lessons.
          </SectionDescription>
          <CompareFailures comparisons={comparisons} hasData={hasData} />
        </section>

        {/* ===== 9. FOUNDER FAILURE PLAYBOOK ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>FOUNDER FAILURE PLAYBOOK // WARNINGS</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">Founder Failure Playbook.</SectionTitle>
          <SectionDescription>
            The most dangerous mistakes founders make, ranked by frequency and impact. Each pattern is a warning signal drawn from real failure cases.
          </SectionDescription>
          <FounderFailurePlaybook mistakes={mistakes} hasData={hasData} />
        </section>

        {/* ===== 10. HISTORY OF FAILURE ===== */}
        <section style={{ marginBottom: '80px' }}>
          <SectionLabel>HISTORY OF FAILURE // TIMELINE</SectionLabel>
          <SectionTitle size="clamp(30px, 3vw, 44px)">History of Business Failure.</SectionTitle>
          <SectionDescription>
            A visual historical narrative tracing the evolution of business failure across economic cycles, technology transitions, and market corrections.
          </SectionDescription>
          <HistoryOfFailure periods={timeline} hasData={hasData} />
        </section>

        {/* ===== 11. INTELLIGENCE SEARCH (FINAL) ===== */}
        <section style={{ marginBottom: '60px' }}>
          <SectionLabel>INTELLIGENCE SEARCH // READY TO INVESTIGATE?</SectionLabel>
          <div style={{
            backgroundColor: 'var(--cream-deep)',
            border: '1.5px dashed var(--cream-dark)',
            borderRadius: '2px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <SectionTitle size="clamp(28px, 2.5vw, 38px)">Ready to investigate further?</SectionTitle>
            <p style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--ink-muted)',
              maxWidth: '50ch',
              margin: '0 auto 32px',
            }}>
              Search across companies, industries, failure patterns, founder mistakes, historical events, and discoveries. The intelligence database is fully queryable.
            </p>
            <IntelligenceSearch />
          </div>
        </section>
      </div>
    </main>
  );
}
