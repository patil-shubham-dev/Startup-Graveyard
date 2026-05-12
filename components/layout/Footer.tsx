import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-12 px-6 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <img src="/logo.png" alt="Startup Graveyard AI" className="h-8 w-auto filter invert brightness-200" />
          </Link>
          <p className="text-text-muted text-sm max-w-xs leading-relaxed">
            Documenting the failures of today to build the successes of tomorrow. 
            Open-source and AI-powered forensic intelligence.
          </p>
        </div>
        
        <div>
          <h4 className="font-mono text-[10px] text-amber-500 tracking-[0.2em] uppercase mb-6">RESOURCES</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><Link href="/explore" className="hover:text-primary transition-colors">Explore Library</Link></li>
            <li><Link href="/insights" className="hover:text-primary transition-colors">Failure Insights</Link></li>
            <li><Link href="/pre-mortem" className="hover:text-primary transition-colors">Pre-Mortem Engine</Link></li>
            <li><Link href="/submit" className="hover:text-primary transition-colors">Submit a Case</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-[10px] text-amber-500 tracking-[0.2em] uppercase mb-6">CONNECT</h4>
          <ul className="space-y-4 text-sm text-text-muted">
            <li><a href="https://github.com" className="hover:text-primary transition-colors">GitHub</a></li>
            <li><a href="https://twitter.com" className="hover:text-primary transition-colors">Twitter / X</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">RSS Feed</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-text-dim uppercase tracking-widest">
          OPEN-SOURCE UNDER MIT LICENSE
        </p>
        <p className="text-[10px] text-text-dim uppercase tracking-widest">
          BUILT WITH NEXT.JS + SUPABASE
        </p>
      </div>
    </footer>
  );
}
