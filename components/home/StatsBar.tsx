export function StatsBar() {
  const stats = [
    { label: 'CASE FILES', value: '1,024', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" /></svg>
    )},
    { label: 'FUNDING LOST', value: '$48.2B', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    )},
    { label: 'PMF FAILURE', value: '#1 REASON', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
    { label: 'ARCHIVES', value: 'UPDATED TODAY', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    )},
  ];

  return (
    <div className="w-full border-y border-border-subtle bg-bg-surface-1 py-5">
      <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-center min-w-max gap-10">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-10">
              <div className="flex items-center gap-2">
                <span className="text-text-muted">{stat.icon}</span>
                <span className="text-[12px] font-mono uppercase tracking-widest text-text-muted">{stat.label}</span>
                <span className="text-[14px] font-mono font-medium text-text-primary ml-1">{stat.value}</span>
              </div>
              {i < stats.length - 1 && (
                <div className="h-5 w-[1px] bg-border-subtle" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
