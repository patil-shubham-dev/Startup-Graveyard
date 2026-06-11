'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import { AutopsyLoader } from '@/components/ui/AutopsyLoader';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';

export const FounderInterrogation = ({ companyName }: { companyName: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');

  const chat = useChat({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: `Forensic archive for ${companyName} initialized. I have indexed all available records regarding their collapse. What would you like to interrogate?` }],
      } as unknown as UIMessage,
    ],
  });

  const messages = chat.messages;
  const error = chat.error;
  const isPending = chat.status === 'submitted' || chat.status === 'streaming';

  const renderMarkdown = useCallback((text: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ ...props }) => <p className="text-[15px] leading-relaxed mb-3 last:mb-0 text-gray-900" {...props} />,
          h1: ({ ...props }) => <h1 className="text-[22px] font-bold mt-6 mb-3 text-gray-900 leading-tight" {...props} />,
          h2: ({ ...props }) => <h2 className="text-[18px] font-semibold mt-5 mb-2 text-gray-900 leading-tight" {...props} />,
          h3: ({ ...props }) => <h3 className="text-[16px] font-semibold mt-4 mb-2 text-gray-900 leading-tight" {...props} />,
          ul: ({ ...props }) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
          li: ({ ...props }) => <li className="text-[15px] leading-relaxed text-gray-900" {...props} />,
          strong: ({ ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
          em: ({ ...props }) => <em className="italic" {...props} />,
          a: ({ children, href, ...props }) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline underline-offset-2" {...props}>{children}</a>
          ),
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[13px] font-mono" {...props}>{children}</code>
            ) : (
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto my-3 text-sm font-mono"><code {...props}>{children}</code></pre>
            );
          },
          hr: ({ ...props }) => <hr className="my-6 border-gray-200" {...props} />,
          blockquote: ({ ...props }) => <blockquote className="border-l-3 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />,
          table: ({ ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full text-sm border-collapse" {...props} /></div>,
          thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
          tbody: ({ ...props }) => <tbody {...props} />,
          tr: ({ ...props }) => <tr className="border-b border-gray-200" {...props} />,
          th: ({ ...props }) => <th className="px-4 py-2 text-left font-semibold text-gray-700 text-xs uppercase tracking-wider" {...props} />,
          td: ({ ...props }) => <td className="px-4 py-2 text-gray-700" {...props} />,
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
    <div className="my-16 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Interrogate the Archive</p>
            <p className="text-xs text-gray-500">{companyName}</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[500px] overflow-y-auto"
      >
        <div className="max-w-[680px] mx-auto px-6 py-6">
          {messages.filter(m => m.role !== 'system').map((m: any) => (
            <div key={m.id} className="mb-6 last:mb-0">
              {m.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-gray-900 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                    {m.content ? (
                      <p className="text-[15px] leading-relaxed text-white whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      m.parts && m.parts.map((part: any, pIdx: number) => {
                        if (part.type === 'text') {
                          return <p key={pIdx} className="text-[15px] leading-relaxed text-white whitespace-pre-wrap">{part.text}</p>;
                        }
                        return null;
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="ml-2 text-[15px] leading-relaxed text-gray-900">
                  {m.content && renderMarkdown(m.content)}
                  {m.parts && m.parts.map((part: any, pIdx: number) => {
                    if (part.type === 'text') {
                      return <div key={pIdx}>{renderMarkdown(part.text)}</div>;
                    }
                    return null;
                  })}
                  {isPending && m === messages[messages.length - 1] && m.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isPending && !messages.filter(m => m.role === 'assistant').some(m => m === messages[messages.length - 1]) && (
            <AutopsyLoader customContext={companyName} />
          )}
          {error && (
            <div className="flex justify-center">
              <button
                onClick={() => chat.sendMessage({ text: input })}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw size={10} /> Retry
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-3">
        <form onSubmit={onSubmit} className="flex items-end gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 focus-within:border-gray-400 focus-within:shadow-sm transition-all">
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
            placeholder={isPending ? "Waiting for response..." : `Ask about ${companyName}...`}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-400 py-1.5 max-h-[120px] font-sans"
          />
          <button
            type="submit"
            disabled={isPending || !input?.trim()}
            className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:bg-gray-200"
          >
            <Send size={12} className={input?.trim() && !isPending ? 'text-white' : 'text-gray-400'} />
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
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
