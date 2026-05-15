'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, RefreshCcw, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils/index';

export const FounderInterrogation = ({ companyName }: { companyName: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = (useChat as any)({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Forensic archive for ${companyName} initialized. I have indexed all available records regarding their collapse. What would you like to interrogate?`
      }
    ],
    body: {
      context: `You are an expert startup forensic analyst. You are currently discussing the failure of ${companyName}. Provide objective, data-driven insights based on the case study. Keep your tone professional, archival, and slightly clinical.`
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="mt-32 mb-32 border border-cream-dark/50 rounded-sm overflow-hidden bg-cream-deep/20 paper-dossier">
      <div className="bg-ink-black p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-rust-accent/20 border border-rust-accent/30 rounded-sm flex items-center justify-center text-rust-accent">
            <Fingerprint size={20} />
          </div>
          <div>
            <h3 className="t-label text-cream-base text-[10px]">Active_Investigation</h3>
            <p className="t-h3 text-paper-white text-lg">Interrogate the Archive: {companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 hidden md:flex">
          <span className="t-label text-[9px] text-sage-neutral flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sage-neutral rounded-full animate-pulse" />
            DIRECT_NEURAL_LINK
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-[500px] overflow-y-auto p-8 space-y-6 bg-graph-paper"
      >
        <AnimatePresence initial={false}>
          {messages.map((m: any) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-1",
                m.role === 'user' ? "bg-ink-black text-cream-base" : "bg-rust-accent text-paper-white"
              )}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={cn(
                "p-4 rounded-sm text-[14px] leading-relaxed",
                m.role === 'user' ? "bg-ink-black text-cream-base" : "bg-paper-white border border-cream-dark/50 text-ink-soft shadow-sm"
              )}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-rust-accent text-paper-white rounded-sm flex items-center justify-center">
              <RefreshCcw size={14} className="animate-spin" />
            </div>
            <div className="p-4 bg-paper-white border border-cream-dark/50 rounded-sm">
              <span className="t-label-sm text-ink-muted animate-pulse">Analyzing_Record_Vault...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-paper-white border-t border-cream-dark/50">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={input || ''}
            onChange={handleInputChange}
            placeholder={`Ask a question about ${companyName}'s failure...`}
            className="flex-1 bg-cream-base/30 border-b border-cream-dark px-4 py-2 t-mono text-[13px] outline-none focus:border-rust-accent transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input?.trim()}
            className="btn-rust h-10 w-10 p-0 flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            `Why did ${companyName} fail?`,
            `Key lesson for founders?`,
            `Strategic mistakes?`
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                const event = { target: { value: suggestion } } as any;
                handleInputChange(event);
              }}
              className="t-label-sm px-3 py-1 bg-cream-deep/40 hover:bg-cream-deep/60 rounded-full transition-colors text-[9px] opacity-70"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
