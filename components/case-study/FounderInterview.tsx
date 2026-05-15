'use client';

import { useState } from 'react';
import { MessageSquare, User, Bot, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'founder' | 'analyst';
  content: string;
}

export function FounderInterview({ companyName }: { companyName: string }) {
  const [messages] = useState<Message[]>([
    { 
      role: 'analyst', 
      content: `System initiating forensic retrieval. Accessing archived communications for ${companyName} executive leadership...` 
    },
    { 
      role: 'founder', 
      content: "We thought we had more time. The capital was there, but the market shift was faster than our deployment cycle." 
    },
    { 
      role: 'analyst', 
      content: "Query: Why was the pivot to desktop delayed despite initial low mobile retention?" 
    },
    { 
      role: 'founder', 
      content: "Legacy commitments to our content partners. We were locked into a mobile-first strategy by the very contracts that funded us." 
    }
  ]);

  return (
    <div className="mt-20 glass-dossier border-border-strong rounded-[2px] overflow-hidden bg-ink-black/95 shadow-2xl">
      {/* Header */}
      <div className="bg-ink-muted/50 px-6 py-3 border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rust-accent animate-pulse" />
          <h3 className="font-mono text-[10px] text-cream-base tracking-[0.2em] uppercase">AI_FOUNDER_INTERROGATION</h3>
        </div>
        <span className="font-mono text-[9px] text-white/40">SECURE_LINE_082</span>
      </div>

      {/* Chat Body */}
      <div className="p-6 h-[400px] overflow-y-auto flex flex-col gap-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'analyst' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'analyst' 
                  ? 'bg-ink-muted/30 border-white/10 text-white/60' 
                  : 'bg-rust-accent/20 border-rust-accent/30 text-rust-accent'
              }`}>
                {msg.role === 'analyst' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'analyst' ? 'items-start' : 'items-end'}`}>
                <span className="font-mono text-[8px] text-white/30 uppercase mb-1">{msg.role}</span>
                <div className={`p-4 rounded-[2px] text-[13px] leading-relaxed ${
                  msg.role === 'analyst' 
                    ? 'bg-white/5 text-white/80 border border-white/5' 
                    : 'bg-rust-accent/10 text-rust-accent border border-rust-accent/20 italic'
                }`}>
                  {msg.content}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Placeholder */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex gap-4">
        <div className="flex-1 bg-ink-black/50 border border-white/10 px-4 py-2 text-[12px] text-white/40 font-mono italic">
          Interrogation line suspended. Upgrade to Pro for deep-dive queries.
        </div>
        <button className="px-4 py-2 bg-white/10 text-white/40 cursor-not-allowed">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
