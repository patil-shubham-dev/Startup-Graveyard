export function TaxonomyGrid() {
  const categories = [
    { name: 'Product-Market Fit', count: 412, desc: 'Building something nobody wants.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { name: 'Burn Rate', count: 284, desc: 'Spending more than you make, too fast.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.99 7.99 0 0120 13a7.99 7.99 0 01-2.343 5.657z" /></svg>
    )},
    { name: 'Competition', count: 156, desc: 'Steamrolled by incumbents or faster movers.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    )},
    { name: 'Timing', count: 98, desc: 'Too early for the market or too late to the trend.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { name: 'Team Conflict', count: 84, desc: 'The internal collapse of the leadership team.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
    { name: 'Regulatory', count: 42, desc: 'Legal battles and compliance failures.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
    )},
    { name: 'Fraud', count: 12, desc: 'Deliberate deception and unethical behavior.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" /></svg>
    )},
    { name: 'Tech Debt', count: 31, desc: 'Infrastructure collapse under scaling pressure.', icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    )},
  ];

  return (
    <section className="py-24 px-6 bg-bg-page">
      <div className="max-w-7xl mx-auto">
        <h3 className="font-mono text-amber-signal tracking-[3px] text-[11px] uppercase mb-16 text-center">
          FAILURE TAXONOMY
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.name} 
              className="bg-bg-surface-1 border border-border-subtle p-8 hover:bg-bg-surface-3 hover:border-border-medium transition-all duration-200 cursor-pointer group rounded-lg hover:border-l-[3px] hover:border-l-violet-primary"
            >
              <div className="text-amber-signal mb-4">
                {cat.icon}
              </div>
              <h4 className="font-display text-[18px] font-medium text-text-primary mb-2">
                {cat.name}
              </h4>
              <div className="mb-4">
                <span className="font-mono text-[11px] text-amber-signal bg-amber-surface border border-amber-border px-2 py-0.5 rounded-[4px] uppercase">
                  {cat.count} cases
                </span>
              </div>
              <p className="text-text-secondary text-[13px] leading-relaxed">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
