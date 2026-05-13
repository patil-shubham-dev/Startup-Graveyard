'use client';

import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function AskTheGraveyard() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="h-full flex pt-12 overflow-hidden relative bg-bg-base">
      {/* Left Sidebar: Interrogation Log (40%) */}
      <aside className="w-[40%] h-full bg-bg-surface border-r border-border-subtle flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border-subtle bg-bg-base/50">
          <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase font-bold">INTERROGATION_LOG // V.02</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] text-text-muted space-y-4 scrollbar-thin">
          <div className="space-y-1">
            <p className="text-violet-500/60">[08:42:01] SYSTEM_INITIALIZED</p>
            <p className="text-violet-500/60">[08:42:05] ARCHIVE_LOADED: 1,024_RECORDS</p>
            <p className="text-violet-500/60">[08:42:10] LISTENING_FOR_VECTORS...</p>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <span className="text-text-primary block mb-2 uppercase tracking-widest text-[9px]">Historical_Patterns</span>
            <ul className="space-y-2 opacity-80">
              <li>- Series B over-scaling trend (2024)</li>
              <li>- PMF drift in AI agents</li>
              <li>- Customer concentration risk</li>
              <li>- Premature international expansion</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <span className="text-text-primary block mb-2 uppercase tracking-widest text-[9px]">Forensic_Parameters</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-bg-base p-2 border border-border-subtle">
                <p className="opacity-50">MODEL</p>
                <p className="font-bold">DEEP_KEEPER</p>
              </div>
              <div className="bg-bg-base p-2 border border-border-subtle">
                <p className="opacity-50">LATENCY</p>
                <p className="font-bold">24MS</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Content: Chat Interface (60%) */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Status Bar */}
        <div className="h-10 border-b border-border-subtle flex items-center justify-between px-6 bg-bg-surface/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse" />
            <span className="font-mono text-[10px] text-violet-500 tracking-widest uppercase">RECORDING_INTERROGATION</span>
          </div>
          <span className="font-mono text-[9px] text-text-muted uppercase">AUTOPSY_SESSION: #441-A</span>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-12 h-12 rounded-full border border-violet-500/20 flex items-center justify-center">
                  <span className="text-xl">☠</span>
                </div>
                <div className="space-y-2">
                  <h1 className="font-header text-2xl font-bold tracking-tight">The Keeper</h1>
                  <p className="text-text-muted text-[13px] leading-relaxed">
                    "I have indexed 1,024 ways a startup can die. Describe your venture, and I will perform an autopsy."
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {[
                    "Quibi Failure?",
                    "SaaS Burn Rates?",
                    "Solo-founder risk?",
                    "Series A Trap?"
                  ].map((hint) => (
                    <button 
                      key={hint}
                      onClick={() => sendMessage({ text: hint })}
                      className="px-3 py-2 bg-bg-surface border border-border-subtle hover:border-violet-500/50 text-[10px] font-mono text-text-muted hover:text-violet-500 transition-all uppercase tracking-widest rounded-[1px]"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className="font-mono text-[9px] text-text-muted uppercase tracking-widest mb-1">
                    {m.role === 'user' ? 'INTERROGATED' : 'KEEPER_VERDICT'} // 0{idx + 1}
                  </div>
                  <div className={`p-4 border rounded-[2px] ${
                    m.role === 'user' 
                      ? 'bg-bg-surface border-violet-600/30 text-text-primary' 
                      : 'bg-bg-base border-border-subtle text-text-primary'
                  }`}>
                    <div className="leading-relaxed text-[13px] whitespace-pre-wrap">
                      {m.parts.map((part, i) => (
                        part.type === 'text' ? <span key={i}>{part.text}</span> : null
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-bg-surface border-t border-border-subtle">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim()) return;
              sendMessage({ text: input });
              setInput('');
            }}
            className="max-w-4xl mx-auto relative"
          >
            <input
              className="w-full bg-bg-base border border-border-subtle focus:border-violet-600/50 px-4 py-3 h-10 rounded-[1px] text-text-primary outline-none transition-all pr-12 text-[13px] placeholder:text-text-muted"
              value={input}
              placeholder="Input query for forensic analysis..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              disabled={isLoading || !input?.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center bg-violet-600 text-white disabled:opacity-30 rounded-[1px] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
