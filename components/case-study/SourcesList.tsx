import { ExternalLink, BookOpen } from 'lucide-react';

interface Source {
  title: string;
  url: string;
  type: string;
}

export const SourcesList = ({ sources }: { sources: Source[] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-20 pt-20 border-t border-cream-dark/30">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={16} className="text-ink-muted" />
        <h3 className="t-label text-ink-muted">Forensic Sources & References</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col p-4 bg-cream-deep/20 border border-cream-dark/30 hover:border-rust-accent/50 transition-all rounded-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="t-label-sm opacity-50">{source.type}</span>
              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-rust-accent" />
            </div>
            <span className="t-body-sm text-[13px] font-medium group-hover:text-rust-accent transition-colors">
              {source.title}
            </span>
            <span className="t-label-sm text-[9px] mt-2 truncate opacity-40">
              {new URL(source.url).hostname}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};
