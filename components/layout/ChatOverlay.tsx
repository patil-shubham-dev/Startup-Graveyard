'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';

export function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  return (
    <>
      {/* Clinical Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-10 right-10 z-50 w-14 h-14 border border-white/10 flex items-center justify-center transition-all duration-500 group ${
          isOpen ? 'bg-white text-black' : 'bg-bg-page/80 backdrop-blur-xl text-text-primary hover:border-amber-500/50'
        }`}
        aria-label="Toggle Intelligence Chat"
      >
        <div className={`absolute inset-0 bg-noise opacity-[0.05] pointer-events-none`} />
        {isOpen ? (
          <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-4 h-4 mb-0.5 border-2 border-current rounded-sm flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-amber-500 animate-pulse" />
            </div>
            <span className="font-mono text-[7px] font-black tracking-tighter">INTEL</span>
          </div>
        )}
        
        {/* Radar Ping Effect */}
        {!isOpen && (
          <span className="absolute inset-0 border border-amber-500/30 animate-ping rounded-none opacity-20" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="fixed bottom-28 right-10 z-50 w-[calc(100%-5rem)] max-w-[420px] h-[600px] glass-dossier flex flex-col border-border-strong shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none" />
            
            {/* Clinical Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] font-bold text-amber-500 tracking-[0.4em] uppercase leading-none mb-1">INTEL_CHANNEL</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="font-mono text-[8px] text-text-ghost uppercase tracking-widest">
                      {isLoading ? 'ANALYZING_QUERY_STREAM' : 'SYSTEM_READY_01'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="font-mono text-[8px] text-text-ghost/40">SECURE_LINK::V.04</div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide relative z-10">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-12 h-12 border border-white/5 flex items-center justify-center mb-6">
                    <span className="font-mono text-[10px] text-amber-500">?</span>
                  </div>
                  <p className="font-mono text-[10px] text-text-ghost uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                    ENTER_QUERY_FOR_GRAVEYARD_CORE_INTELLIGENCE.
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div 
                  key={m.id} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] relative ${m.role === 'user' ? 'w-full' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="font-mono text-[7px] text-text-ghost tracking-widest uppercase">
                          {m.role === 'user' ? 'OPERATOR' : 'GRAVEYARD_CORE'}
                       </span>
                       <div className="flex-1 h-[1px] bg-white/5" />
                    </div>
                    
                    <div className={`p-5 text-[13px] leading-relaxed font-sans ${
                      m.role === 'user' 
                        ? 'bg-white text-black' 
                        : 'bg-white/[0.03] border-l-2 border-amber-500/40 text-text-secondary italic'
                    }`}>
                      <div className="whitespace-pre-wrap">
                        {m.parts.map((part, idx) => (
                          part.type === 'text' ? <span key={idx}>{part.text}</span> : null
                        ))}
                      </div>
                      {m.role === 'assistant' && isLoading && i === messages.length - 1 && (
                        <span className="inline-block w-2 h-4 bg-amber-500/50 animate-pulse ml-2 align-middle" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Vector */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5 relative z-10">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim()) return;
                  sendMessage({ text: input });
                  setInput('');
                }} 
                className="relative"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="EXECUTE_QUERY..."
                  className="w-full bg-black/40 border border-white/10 px-6 py-4 pr-16 font-mono text-[11px] tracking-wider focus:outline-none focus:border-amber-500/50 transition-all text-text-primary placeholder:text-text-ghost"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input?.trim()}
                  className="absolute right-0 top-0 h-full w-14 flex items-center justify-center hover:text-amber-500 disabled:opacity-30 transition-all border-l border-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </form>
              <div className="mt-4 flex justify-between">
                 <span className="font-mono text-[7px] text-text-ghost/40 uppercase">STATUS: ENCRYPTED</span>
                 <span className="font-mono text-[7px] text-text-ghost/40 uppercase">BUFFER: 1024KB</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
