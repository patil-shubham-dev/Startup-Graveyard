/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, MessageSquare, Square, RefreshCw } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { usePersistedChat } from '@/lib/hooks/usePersistedChat';

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export default function AskTheGraveyard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadDone = useRef(false);

  const {
    chats,
    activeChatId,
    loaded,
    upsertChat,
    deleteChatById,
    setActive,
    clearAll,
  } = usePersistedChat();

  const pendingSendRef = useRef<string | null>(null);

  const chat = useChat({
    id: activeChatId || undefined,
    onError: () => {},
  });

  const messages = chat.messages;
  const setMessages = chat.setMessages;
  const isPending = chat.status === 'submitted' || chat.status === 'streaming';
  const stop = chat.stop;
  const error = chat.error;

  useEffect(() => {
    if (!loaded || initialLoadDone.current) return;
    initialLoadDone.current = true;
    const params = new URLSearchParams(window.location.search);
    const contextCompany = params.get('context');

    if (activeChatId) {
      const session = chats.find(c => c.id === activeChatId);
      if (session) {
        setMessages(session.messages as any);
      }
    }

    if (contextCompany) {
      setTimeout(() => setLocalInput(`Analyze why ${contextCompany} failed and what lessons can be learned.`), 0);
    }
  }, [loaded, activeChatId, chats, setMessages]);

  useEffect(() => {
    if (!activeChatId || !loaded) return;
    const nonSystem = messages.filter(m => m.role !== 'system');
    if (nonSystem.length === 0) return;
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      upsertChat({
        id: activeChatId,
        title: chats.find(c => c.id === activeChatId)?.title || 'Chat',
        messages: nonSystem as any,
        createdAt: chats.find(c => c.id === activeChatId)?.createdAt || Date.now(),
      });
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [messages, activeChatId, loaded, chats, upsertChat]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [localInput]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  useEffect(() => {
    if (pendingSendRef.current && activeChatId) {
      const msg = pendingSendRef.current;
      pendingSendRef.current = null;
      chat.sendMessage({ text: msg });
    }
  }, [activeChatId, chat]);

  const onSendMessage = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const msg = localInput;
    if (!msg.trim() || isPending) return;

    setLocalInput('');

    if (!activeChatId) {
      const newTitle = msg.length > 28 ? msg.substring(0, 25) + '...' : msg;
      const newId = `chat-${Date.now()}`;
      pendingSendRef.current = msg;
      setActive(newId);
      upsertChat({
        id: newId,
        title: newTitle,
        messages: [],
        createdAt: Date.now(),
      });
      return;
    }

    chat.sendMessage({ text: msg });
  }, [activeChatId, localInput, isPending, chat, setActive, upsertChat]);

  const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalInput(e.target.value);
  };

  const preprocessText = (rawText: string) => {
    if (!rawText) return '';
    return rawText.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const slug = p1.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return `[${p1}](/case/${slug})`;
    });
  };

  const renderMarkdown = useCallback((text: string) => {
    const processedText = preprocessText(text);
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
          code: ({ className, children, ...props }) => {
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
        {processedText}
      </ReactMarkdown>
    );
  }, []);

  const handleNewChat = () => {
    setActive(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    const selected = chats.find(c => c.id === chatId);
    if (selected) {
      setActive(chatId);
      setMessages(selected.messages as any);
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteChatById(chatId);
    if (activeChatId === chatId) {
      setMessages([]);
    }
  };

  if (!loaded) return null;

  return (
    <div className="h-[calc(100vh-56px)] flex bg-white">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        w-[260px] bg-gray-50 border-r border-gray-200 flex flex-col shrink-0 z-50
        fixed lg:relative top-[56px] lg:top-0 h-[calc(100vh-56px)] lg:h-auto
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">History</span>
          <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Clear
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Plus size={14} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-gray-400">No conversations yet</p>
            </div>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectChat(c.id)}
                className={`
                  w-full px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between gap-2 transition-colors
                  ${activeChatId === c.id ? 'bg-gray-200' : 'hover:bg-gray-100'}
                `}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                  <MessageSquare size={12} className="shrink-0 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors p-0.5"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-20">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-medium text-gray-800 mb-2">Graveyard Intelligence</h1>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-8">
                Ask anything about startup failures, patterns, and lessons learned.
              </p>
              <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                {[
                  'Why did Quibi fail?',
                  'What kills most startups?',
                  'Analyze a social app for pets',
                  'Signs of premature scaling',
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => { chat.sendMessage({ text: hint }); }}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all text-left leading-snug"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-4 py-6">
              {messages.filter((m: any) => m.role !== 'system').map((m: any, idx: number) => (
                <div key={m.id || `msg-${idx}`} className="mb-6 last:mb-0">
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
                    <div className="ml-2">
                      <div className="text-[15px] leading-relaxed text-gray-900">
                        {m.content && renderMarkdown(m.content)}
                        {m.parts && m.parts.map((part: any, pIdx: number) => {
                          if (part.type === 'text') {
                            return <div key={pIdx}>{renderMarkdown(part.text)}</div>;
                          }
                          if (part.type === 'reasoning') {
                            return (
                              <div key={pIdx} className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-4 my-2 font-mono">
                                {part.text}
                              </div>
                            );
                          }
                          return null;
                        })}
                        {isPending && idx === messages.length - 1 && m.role === 'assistant' && (
                          <ThinkingIndicator />
                        )}
                        {!isPending && m.role === 'assistant' && m.content && (
                          <button
                            onClick={() => chat.regenerate()}
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2 flex items-center gap-1"
                          >
                            <RefreshCw size={10} /> Regenerate
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isPending && messages.filter((m: any) => m.role === 'assistant').length === 0 && (
                <div className="mb-6">
                  <ThinkingIndicator />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <form
            onSubmit={onSendMessage}
            className="max-w-[720px] mx-auto flex items-end gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 focus-within:border-gray-400 focus-within:shadow-sm transition-all"
          >
            <textarea
              ref={inputRef}
              value={localInput}
              disabled={isPending}
              onChange={handleInputChangeWrapper}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
              rows={1}
              placeholder={isPending ? "Waiting for response..." : "Ask about startup failures..."}
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-400 py-1.5 max-h-[200px] font-sans"
            />
            {isPending ? (
              <button
                type="button"
                onClick={stop}
                className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Square size={12} className="text-gray-600" fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!localInput?.trim()}
                className="shrink-0 w-8 h-8 flex items-center justify-center bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors disabled:bg-gray-200"
              >
                <svg className={`w-3.5 h-3.5 ${localInput?.trim() ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </form>
          {error && (
            <div className="max-w-[720px] mx-auto mt-2 flex items-center gap-2 justify-center">
              <span className="text-xs text-red-500">{error.message || 'Connection error'}</span>
              <button
                onClick={() => chat.sendMessage({ text: localInput })}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={10} /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
