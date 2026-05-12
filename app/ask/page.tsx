'use client';

import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

export default function AskTheGraveyard() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="pt-20 h-screen flex flex-col bg-bg-page overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border-subtle">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
          >
            <div className="max-w-3xl mx-auto space-y-8 py-12">
              <AnimatePresence initial={false}>
                {messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 pt-12"
                  >
                    <span className="text-4xl">💀</span>
                    <h1 className="font-display text-4xl font-bold">Ask the Graveyard Keeper</h1>
                    <p className="text-text-secondary max-w-md mx-auto">
                      "I've seen a thousand startups die. Tell me your venture, and I'll tell you how it likely ends."
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "Why did Quibi fail?",
                        "Failure rates in Fintech?",
                        "Common causes of solo-founder death?",
                        "Is my SaaS idea too risky?"
                      ].map((hint) => (
                        <button 
                          key={hint}
                          onClick={() => handleInputChange({ target: { value: hint } } as any)}
                          className="px-3 py-1.5 bg-bg-surface-1 border border-border-subtle hover:border-violet-primary text-[11px] font-mono text-text-muted hover:text-violet-primary transition-all rounded-md"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {m.role === 'assistant' && (
                        <div className="font-mono text-[10px] text-violet-primary uppercase tracking-[2px] mb-2">
                          GRAVEYARD KEEPER
                        </div>
                      )}
                      <div className={`p-5 rounded-xl border ${
                        m.role === 'user' 
                          ? 'bg-violet-primary/10 border-violet-primary/30 text-text-primary rounded-br-none' 
                          : 'bg-bg-surface-1 border-border-subtle text-text-primary rounded-bl-none'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        {m.role === 'assistant' && isLoading && m.id === messages[messages.length - 1].id && (
                          <span className="inline-block w-1 h-4 bg-violet-primary animate-pulse ml-1 align-middle" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border-subtle bg-bg-page">
            <form 
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto relative group"
            >
              <input
                className="w-full bg-bg-surface-2 border border-border-subtle focus:border-violet-primary px-6 py-4 rounded-lg text-text-primary outline-none transition-all pr-16 shadow-lg placeholder:text-text-muted"
                value={input}
                placeholder="Consult the archives..."
                onChange={handleInputChange}
              />
              <button 
                type="submit"
                disabled={isLoading || !input?.trim()}
                className="absolute right-3 top-2.5 p-2 bg-violet-primary hover:bg-violet-hover disabled:opacity-30 text-white rounded-md transition-all shadow-violet-glow z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Right Info Panel (Desktop Only) */}
        <aside className="hidden lg:block w-72 bg-bg-surface-1 p-8 space-y-12 overflow-y-auto border-l border-border-subtle">
          <div className="space-y-4">
            <h3 className="font-mono text-[10px] text-amber-signal tracking-[3px] uppercase">INTELLIGENCE CONTEXT</h3>
            <div className="p-4 bg-bg-surface-2 border border-border-subtle rounded-md">
              <p className="text-[11px] text-text-secondary leading-relaxed font-mono">
                MODEL: DEEPSEEK-V3<br/>
                ARCHIVES: 1,024 CASES<br/>
                LATENCY: STREAMING READY
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-mono text-[10px] text-text-muted tracking-[3px] uppercase">RECENT DISCOVERIES</h3>
            {[
              "The cost of over-engineering",
              "Series B blitzscaling risks",
              "Solo founder exhaustion rates"
            ].map((topic) => (
              <div key={topic} className="text-xs text-text-secondary border-b border-border-subtle pb-4 last:border-0 hover:text-text-primary transition-colors cursor-pointer">
                {topic}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
