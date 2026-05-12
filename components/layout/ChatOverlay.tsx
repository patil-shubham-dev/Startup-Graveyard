'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';

export function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-violet-primary text-white rounded-full shadow-violet-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        aria-label="Toggle Intelligence Chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <div className="relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-signal rounded-full animate-pulse" />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-[420px] h-[600px] bg-bg-surface-1 border border-border-medium flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden"
          >
            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface-2/50 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">💀</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[3px] text-text-primary">GRAVEYARD KEEPER</span>
              </div>
              <div className="flex items-center gap-2 bg-bg-page/50 px-2 py-1 rounded-md border border-border-subtle">
                <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-amber-signal animate-pulse' : 'bg-green-lesson'}`} />
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-tighter">
                  {isLoading ? 'ANALYZING...' : 'ONLINE'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide bg-bg-page/30">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-12 h-12 bg-bg-surface-2 rounded-full flex items-center justify-center border border-border-subtle">
                    <span className="text-xl">📜</span>
                  </div>
                  <p className="text-xs text-text-secondary font-mono leading-relaxed">
                    "I hold the records of every failed dream in this valley. What knowledge do you seek?"
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-4 text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-violet-primary text-white rounded-2xl rounded-tr-none shadow-violet-glow' 
                        : 'bg-bg-surface-2 border border-border-subtle text-text-primary rounded-2xl rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {m.role === 'assistant' && isLoading && i === messages.length - 1 && (
                        <span className="inline-block w-1.5 h-4 bg-violet-primary animate-pulse ml-1 align-middle" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border-subtle bg-bg-surface-1">
              <form onSubmit={handleSubmit} className="relative group">
                <input 
                  type="text" 
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Consult the archives..."
                  className="w-full bg-bg-surface-2 border border-border-subtle px-5 py-3.5 pr-12 text-sm focus:outline-none focus:border-violet-primary transition-all rounded-lg text-text-primary placeholder:text-text-muted shadow-inner"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || !input?.trim()}
                  className="absolute right-2 top-2 p-2 text-violet-primary hover:text-white hover:bg-violet-primary rounded-md disabled:opacity-30 transition-all z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
              </form>
              <div className="mt-3 flex justify-center">
                <span className="font-mono text-[8px] text-text-muted uppercase tracking-[2px]">SECURE FORENSIC LINK ESTABLISHED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
