import Link from 'next/link';

export function PreMortemCTA() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-bg-surface-1 border border-border-subtle border-l-[4px] border-l-amber-signal p-12 md:p-20 rounded-lg shadow-2xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <span className="font-mono text-[11px] text-amber-signal tracking-[3px] uppercase block mb-6">INTELLIGENCE STRESS-TEST</span>
          <h2 className="font-display text-[32px] md:text-[52px] font-bold mb-6 text-text-primary leading-[1.1]">
            Your startup might already be in this database. <span className="text-text-muted">Just not yet.</span>
          </h2>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed font-body">
            Run an AI Pre-Mortem — get a full forensic risk report with real case study 
            comparisons before you spend your next dollar.
          </p>
          <Link 
            href="/pre-mortem" 
            className="inline-block px-10 py-4 bg-violet-primary hover:bg-violet-hover active:bg-violet-dim text-white font-bold rounded-md shadow-violet-glow transition-all text-sm uppercase tracking-widest"
          >
            Analyze My Venture →
          </Link>
        </div>
      </div>
    </section>
  );
}
