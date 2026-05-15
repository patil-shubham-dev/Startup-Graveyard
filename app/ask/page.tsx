/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

export const dynamic = 'force-dynamic';

import { useRef, useEffect, useState } from 'react';
import { getCaseListForSidebar } from '@/lib/db/case-studies';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SidebarCase {
  id: string;
  slug: string;
  case_number: string;
  company_name: string;
  shutdown_year: number | null;
}

const STORAGE_KEY = 'sg_chat_history';

export default function AskTheGraveyard() {
  const [localInput, setLocalInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [sidebarCases, setSidebarCases] = useState<SidebarCase[]>([]);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    
    getCaseListForSidebar().then(setSidebarCases).catch(() => setSidebarCases([]));
  }, []);

  // 2. Save history to localStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLocalInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.text };
      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: "I apologize, but my connection to the archive has been interrupted. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents reload
    sendMessage(localInput);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
  };

  const messageCount = messages.length;

  return (
    <main
      style={{
        height: 'calc(100vh - 56px)',
        backgroundColor: 'var(--cream-base)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* LEFT SIDEBAR */}
      {sidebarOpen && (
        <div
          className="lg:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(26,23,20,0.4)',
            zIndex: 40,
          }}
        />
      )}

      <aside
        style={{
          width: '280px',
          backgroundColor: 'var(--cream-deep)',
          borderRight: '1.5px dashed var(--cream-dark)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 50,
        }}
        className={`
          lg:relative lg:translate-x-0 lg:flex
          fixed top-[56px] left-0 h-[calc(100vh-56px)]
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1.5px dashed var(--cream-dark)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--ink-black)',
            }}
          >
            NEURAL_ARCHIVE
          </span>
          <button 
            onClick={clearHistory}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '9px',
              color: 'var(--rust-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            CLEAR [×]
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 0',
          }}
        >
          {sidebarCases.length === 0 ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-cream" style={{ height: '40px', borderRadius: '1px' }} />
              ))}
            </div>
          ) : (
            sidebarCases.map((c) => (
              <button
                key={c.id}
                onClick={(e) => {
                  e.preventDefault(); // Prevents any accidental reload
                  setActiveCase(c.id);
                  sendMessage(`Tell me about ${c.company_name}`);
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderLeft: activeCase === c.id ? '3px solid var(--rust-accent)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  borderBottom: '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: activeCase === c.id ? 'var(--rust-accent)' : 'var(--ink-muted)',
                    }}
                  >
                    {c.case_number}
                  </span>
                  {c.shutdown_year && (
                    <span
                      style={{
                        fontFamily: 'var(--font-dm-mono), monospace',
                        fontSize: '8px',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {c.shutdown_year}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '15px',
                    fontWeight: '600',
                    color: activeCase === c.id ? 'var(--ink-black)' : 'var(--ink-soft)',
                    lineHeight: 1.1,
                  }}
                >
                  {c.company_name}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* RIGHT PANEL — Chat */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--cream-deep)',
            borderBottom: '1.5px dashed var(--cream-dark)',
            padding: '0 20px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: '1px solid var(--cream-dark)',
                borderRadius: '1px',
                padding: '4px 8px',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-muted)',
              }}
            >
              ≡ FILES
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLoading ? 'var(--rust-accent)' : 'var(--sage-neutral)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-dm-mono), monospace',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-muted)',
                }}
              >
                {isLoading ? 'ANALYZING_DATA' : 'DIRECT_LINK_ACTIVE'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--ink-muted)' }}>
              STABILITY: 99.4%
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--ink-muted)' }}>
              LATENCY: {isLoading ? '---' : '42MS'}
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--rust-accent)' }}>
              INTERROGATED // {String(messageCount).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Chat area */}
        <div
          ref={scrollRef}
          className="bg-graph-paper"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                textAlign: 'center',
                maxWidth: '480px',
                margin: '0 auto',
                gap: '0',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: 'var(--cream-deep)',
                  border: '1px solid var(--cream-dark)',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 1px 2px rgba(26,23,20,0.12)',
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant), Georgia, serif',
                    fontSize: '22px',
                    fontWeight: '700',
                    color: 'var(--ink-black)',
                  }}
                >
                  SG
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-cormorant), Georgia, serif',
                  fontSize: '28px',
                  fontWeight: '700',
                  color: 'var(--ink-black)',
                  marginBottom: '12px',
                  lineHeight: 1.1,
                }}
              >
                Graveyard Intelligence
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-source-serif), Georgia, serif',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'var(--ink-muted)',
                  fontStyle: 'italic',
                  marginBottom: '32px',
                }}
              >
              &quot;I have indexed the patterns of collapse. Describe your venture, and I will perform an autopsy.&quot;
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                {[
                  'Why did Quibi fail?',
                  'What kills most startups?',
                  'Analyze a social app for pets',
                  'Signs of premature scaling',
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={(e) => {
                      e.preventDefault();
                      sendMessage(hint);
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--cream-base)',
                      border: '1px solid var(--cream-dark)',
                      borderRadius: '1px',
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--ink-muted)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m: Message, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%' }}>
                {m.role === 'assistant' && (
                  <div
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: 'var(--rust-accent)',
                      marginBottom: '6px',
                    }}
                  >
                    GRAVEYARD_AI
                  </div>
                )}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '1px',
                    backgroundColor: m.role === 'user' ? 'var(--ink-black)' : 'var(--cream-deep)',
                    border: `1px solid ${m.role === 'user' ? 'var(--ink-black)' : 'var(--cream-dark)'}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: m.role === 'user' ? 'var(--font-dm-mono), monospace' : 'var(--font-source-serif), Georgia, serif',
                      fontSize: m.role === 'user' ? '12px' : '14px',
                      lineHeight: m.role === 'user' ? 1.5 : 1.75,
                      color: m.role === 'user' ? 'var(--cream-base)' : 'var(--ink-black)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--rust-accent)',
                    marginBottom: '6px',
                  }}
                >
                  GRAVEYARD_AI
                </div>
                <div
                  style={{
                    padding: '14px 18px',
                    backgroundColor: 'var(--cream-deep)',
                    border: '1px solid var(--cream-dark)',
                    borderRadius: '1px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--rust-accent)',
                        display: 'inline-block',
                        animation: 'pulse 1s ease-in-out infinite',
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div
          style={{
            backgroundColor: 'var(--paper-white)',
            borderTop: '1px solid var(--cream-dark)',
            padding: '12px 20px',
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={onManualSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <input
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="Input query for forensic analysis..."
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '13px',
                color: 'var(--ink-black)',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !localInput.trim()}
              style={{
                backgroundColor: (localInput.trim() && !isLoading) ? 'var(--rust-accent)' : 'var(--cream-dark)',
                border: 'none',
                borderRadius: '1px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (localInput.trim() && !isLoading) ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease',
                color: (localInput.trim() && !isLoading) ? 'var(--cream-base)' : 'var(--ink-muted)',
                flexShrink: 0,
                fontSize: '14px',
              }}
            >
              →
            </button>
          </form>
        </div>

        {/* Status footer */}
        <div
          style={{
            backgroundColor: 'var(--cream-deep)',
            borderTop: '1px solid var(--cream-dark)',
            padding: '6px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'SYSTEM_OK', color: 'var(--sage-neutral)' },
              { label: 'VECTOR_READY', color: 'var(--ochre-signal)' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: s.color,
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-dm-mono), monospace',
                    fontSize: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    color: 'var(--ink-muted)',
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <span
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-muted)',
            }}
          >
            MODEL: GRAVEYARD_AI
          </span>
        </div>
      </div>
    </main>
  );
}
