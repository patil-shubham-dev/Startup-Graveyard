'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, RefreshCcw, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils/index';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AutopsyLoader } from '@/components/ui/AutopsyLoader';

export const FounderInterrogation = ({ companyName }: { companyName: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Forensic archive for ${companyName} initialized. I have indexed all available records regarding their collapse. What would you like to interrogate?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<any>(null);

  const sendMessage = async (options: { text: string }) => {
    if (isLoading || isTyping) return;
    
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: options.text,
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: `You are an expert startup forensic analyst. You are currently discussing the failure of ${companyName}. Provide objective, data-driven insights based on the case study. Keep your tone professional, archival, and slightly clinical.`
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to retrieve intelligence from archive');
      }
      
      const data = await response.json();
      
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      const assistantMessagePlaceholder = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      };
      
      setMessages((prev) => [...prev, assistantMessagePlaceholder]);
      setIsLoading(false);
      setIsTyping(true);
      
      const fullText = data.content || '';
      let currentIdx = 0;
      
      // Calculate speed of fake streaming based on text size (balancing reading experience)
      const step = fullText.length > 2000 
        ? 15 
        : fullText.length > 1000 
        ? 9 
        : fullText.length > 500 
        ? 6 
        : 3;
        
      const intervalTime = 8;
      
      const interval = setInterval(() => {
        currentIdx += step;
        if (currentIdx >= fullText.length) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: fullText } : msg
            )
          );
          clearInterval(interval);
          setIsTyping(false);
        } else {
          const chunk = fullText.substring(0, currentIdx);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: chunk } : msg
            )
          );
        }
      }, intervalTime);
      
    } catch (err: any) {
      console.error('Interrogation failed:', err);
      setError(err);
      setIsLoading(false);
      setIsTyping(false);
      
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: `⚠️ ERROR: Interrogation disrupted: "${err.message || 'Unknown network error'}"`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const isPending = isLoading || isTyping;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const renderMarkdown = (text: string, role: string) => {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap' }} {...props} />,
          h1: ({ node, ...props }) => <h1 style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '28px', fontWeight: '900', margin: '20px 0 10px 0', color: role === 'user' ? 'var(--cream-base)' : 'var(--ink-black)', lineHeight: 1.2 }} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '25px', fontWeight: '800', margin: '18px 0 8px 0', color: role === 'user' ? 'var(--cream-base)' : 'var(--ink-black)', lineHeight: 1.25 }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ fontFamily: 'var(--font-source-serif), serif', fontSize: '23px', fontWeight: '700', margin: '16px 0 6px 0', color: role === 'user' ? 'var(--cream-base)' : 'var(--ink-black)', lineHeight: 1.3 }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', listStyleType: 'disc' }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ margin: '0 0 12px 0', paddingLeft: '20px', listStyleType: 'decimal' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ margin: '4px 0', whiteSpace: 'pre-wrap' }} {...props} />,
          strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold', color: role === 'user' ? 'var(--cream-base)' : 'var(--ink-black)' }} {...props} />,
          em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return isInline ? (
              <code style={{ fontFamily: 'var(--font-dm-mono), monospace', backgroundColor: role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '2px', fontSize: '0.9em' }} {...props}>{children}</code>
            ) : (
              <pre style={{ fontFamily: 'var(--font-dm-mono), monospace', backgroundColor: role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', padding: '12px', borderRadius: '2px', overflowX: 'auto', margin: '8px 0', fontSize: '0.85em' }}>
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: '13px' }} {...props} />,
          thead: ({ node, ...props }) => <thead style={{ borderBottom: '2px solid var(--cream-dark)' }} {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr style={{ borderBottom: '1px solid var(--cream-dark)' }} {...props} />,
          th: ({ node, ...props }) => <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }} {...props} />,
          td: ({ node, ...props }) => <td style={{ padding: '8px 12px', fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px' }} {...props} />
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isPending) return;
    
    sendMessage({
      text: input.trim(),
    });
    setInput('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

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
                {m.content && renderMarkdown(m.content, m.role)}
                {m.parts && m.parts.map((part: any, pIdx: number) => {
                  if (part.type === 'text') {
                    return <div key={pIdx}>{renderMarkdown(part.text, m.role)}</div>;
                  }
                  return null;
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <AutopsyLoader customContext={companyName} />
        )}
      </div>

      <div className="p-6 bg-paper-white border-t border-cream-dark/50">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <textarea
            ref={textareaRef}
            value={input || ''}
            disabled={isPending}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={1}
            placeholder={isPending ? "Retrieving intelligence archives..." : `Ask a question about ${companyName}'s failure...`}
            className="flex-1 bg-cream-base/30 border-b border-cream-dark px-4 py-2 t-mono text-[13px] outline-none focus:border-rust-accent transition-colors resize-none overflow-hidden"
            style={{ maxHeight: '120px', alignSelf: 'center', minHeight: '38px', paddingTop: '8px', paddingBottom: '8px', color: isPending ? 'var(--ink-muted)' : 'var(--ink-black)' }}
          />
          <button
            type="submit"
            disabled={isPending || !input?.trim()}
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
