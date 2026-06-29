'use client';

import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { IntelKicker } from '@/components/ui/IntelKicker';
import { AutopsyLoader } from '@/components/ui/AutopsyLoader';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from '@ai-sdk/react';

function sanitizeUrl(href?: string): string {
  if (!href) return '#';
  return href.replace(/javascript:/gi, '').replace(/data:/gi, '').replace(/vbscript:/gi, '');
}

/** Extract plain text from UIMessage parts */
function getMessageText(m: UIMessage): string {
  if (!m.parts || m.parts.length === 0) return '';
  return m.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('\n');
}

export const FounderInterrogation = ({ companyName }: { companyName: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const chat = useChat();

  const messages = chat.messages;
  const error = chat.error;
  const isPending = chat.status === 'submitted' || chat.status === 'streaming';

  const renderMarkdown = useCallback((text: string) => {
    if (!text) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }: { children?: ReactNode }) => <p className="text-[15px] leading-relaxed mb-3 last:mb-0" style={{ color: 'var(--ink-soft)' }}>{children}</p>,
          h1: ({ children }: { children?: ReactNode }) => <h1 className="text-[22px] font-bold mt-6 mb-3 leading-tight" style={{ color: 'var(--ink-black)' }}>{children}</h1>,
          h2: ({ children }: { children?: ReactNode }) => <h2 className="text-[18px] font-semibold mt-5 mb-2 leading-tight" style={{ color: 'var(--ink-black)' }}>{children}</h2>,
          h3: ({ children }: { children?: ReactNode }) => <h3 className="text-[16px] font-semibold mt-4 mb-2 leading-tight" style={{ color: 'var(--ink-black)' }}>{children}</h3>,
          ul: ({ children }: { children?: ReactNode }) => <ul className="list-disc pl-6 mb-3 space-y-1" style={{ color: 'var(--ink-soft)' }}>{children}</ul>,
          ol: ({ children }: { children?: ReactNode }) => <ol className="list-decimal pl-6 mb-3 space-y-1" style={{ color: 'var(--ink-soft)' }}>{children}</ol>,
          li: ({ children }: { children?: ReactNode }) => <li className="text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{children}</li>,
          strong: ({ children }: { children?: ReactNode }) => <strong className="font-semibold" style={{ color: 'var(--ink-black)' }}>{children}</strong>,
          em: ({ children }: { children?: ReactNode }) => <em className="italic" style={{ color: 'var(--ink-soft)' }}>{children}</em>,
          a: ({ children, href }: { children?: ReactNode; href?: string }) => (
            <a href={sanitizeUrl(href)} className="underline underline-offset-2" style={{ color: 'var(--rust-accent)' }} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>
          ),
          code: ({ className, children }: { className?: string; children?: ReactNode }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <pre className="p-4 overflow-x-auto my-3 text-sm font-mono" style={{ backgroundColor: 'var(--cream-deep)', border: '1px solid var(--cream-dark)' }}><code className={className}>{children}</code></pre>
            ) : (
              <code className="px-1.5 py-0.5 rounded text-[13px] font-mono" style={{ backgroundColor: 'var(--cream-deep)', color: 'var(--ink-soft)' }}>{children}</code>
            );
          },
          hr: () => <hr style={{ margin: '24px 0', borderColor: 'var(--cream-dark)' }} />,
          blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="pl-4 italic my-4" style={{ borderLeft: '2px solid var(--cream-dark)', color: 'var(--ink-muted)' }}>{children}</blockquote>,
          table: ({ children }: { children?: ReactNode }) => <div className="overflow-x-auto my-4"><table className="min-w-full text-sm border-collapse">{children}</table></div>,
          thead: ({ children }: { children?: ReactNode }) => <thead style={{ backgroundColor: 'var(--cream-deep)' }}>{children}</thead>,
          tbody: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
          tr: ({ children }: { children?: ReactNode }) => <tr style={{ borderBottom: '1px solid var(--cream-dark)' }}>{children}</tr>,
          th: ({ children }: { children?: ReactNode }) => <th className="px-4 py-2 text-left font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>{children}</th>,
          td: ({ children }: { children?: ReactNode }) => <td className="px-4 py-2" style={{ color: 'var(--ink-soft)' }}>{children}</td>,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  }, []);

  const onSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isPending) return;
    chat.sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  return (
    <div className="relative">
      <IntelKicker label="INTERROGATION" figure="10" />
      <h2 className="font-display text-3xl font-bold mt-4 mb-8 text-[var(--ink-black)]">Interrogate the Archive</h2>

      <div className="border border-[var(--cream-dark)] bg-[var(--cream-deep)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--cream-dark)] bg-[var(--cream-base)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--ink-black)]">
              <svg className="w-4 h-4 text-[var(--cream-base)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-black)] font-semibold">Archive Interrogation</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-muted)]">Subject: {companyName}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[500px] overflow-y-auto bg-[var(--paper-white)]">
          <div className="max-w-[680px] mx-auto px-6 py-6">
            {messages.filter((m) => m.role !== 'system').map((m) => {
              const messageText = getMessageText(m);
              return (
              <div key={m.id} className="mb-6 last:mb-0">
                {m.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-[var(--ink-black)] text-[var(--cream-base)] px-4 py-2.5 max-w-[85%]">
                      {messageText ? (
                        <p className="text-sm leading-relaxed text-[var(--cream-base)] whitespace-pre-wrap font-mono">{messageText}</p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="ml-2 text-sm leading-relaxed text-[var(--ink-soft)] border-l-2 border-[var(--cream-dark)] pl-4">
                    {messageText && renderMarkdown(messageText)}
                    {isPending && m === messages[messages.length - 1] && m.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rust-accent)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rust-accent)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rust-accent)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
            {isPending && !messages.filter(m => m.role === 'assistant').some(m => m === messages[messages.length - 1]) && (
              <AutopsyLoader customContext={companyName} />
            )}
            {error && (
              <div className="flex justify-center">
                <button
                  onClick={() => chat.sendMessage({ text: input })}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-muted)] hover:text-[var(--rust-accent)] flex items-center gap-1 px-3 py-1.5 border border-[var(--cream-dark)] transition-colors"
                >
                  <RefreshCw size={10} /> Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[var(--cream-dark)] px-4 py-3 bg-[var(--cream-base)]">
          <form onSubmit={onSubmit} className="flex items-end gap-2 border border-[var(--cream-dark)] bg-[var(--paper-white)] px-4 py-2">
            <textarea
              ref={textareaRef}
              value={input || ''}
              disabled={isPending}
              onChange={(e) => { setInput(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              rows={1}
              placeholder={isPending ? "Waiting..." : `Ask about ${companyName}...`}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-[var(--ink-black)] placeholder-[var(--ink-muted)] py-1.5 max-h-[120px] font-mono"
            />
            <button
              type="submit"
              disabled={isPending || !input?.trim()}
              className="shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--ink-black)] hover:bg-[var(--ink-soft)] transition-colors disabled:bg-[var(--cream-dark)]"
            >
              <Send size={12} className={input?.trim() && !isPending ? 'text-[var(--cream-base)]' : 'text-[var(--ink-muted)]'} />
            </button>
          </form>
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              `Why did ${companyName} fail?`,
              `Key lesson for founders?`,
              `Strategic mistakes?`
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    const form = textareaRef.current?.closest('form');
                    form?.requestSubmit();
                  }, 0);
                }}
                className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--ink-muted)] hover:text-[var(--rust-accent)] px-2.5 py-1 border border-[var(--cream-dark)] hover:border-[var(--rust-accent)]/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
