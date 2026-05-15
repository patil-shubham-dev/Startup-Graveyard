import { Quote } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  role: string;
}

export const QuotesSection = ({ quotes }: { quotes: QuoteData[] }) => {
  if (!quotes || quotes.length === 0) return null;

  return (
    <div className="space-y-16 mt-32 mb-32">
      {quotes.map((q, i) => (
        <div key={i} className="max-w-4xl mx-auto text-center px-6">
          <Quote size={40} className="mx-auto text-cream-dark mb-8 opacity-40" />
          <blockquote className="t-pullquote text-3xl md:text-5xl mb-8 leading-tight">
            "{q.text}"
          </blockquote>
          <div className="flex flex-col items-center">
            <span className="t-h3 text-xl">{q.author}</span>
            <span className="t-label text-[10px] text-ink-muted mt-2 uppercase tracking-[0.2em]">{q.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
