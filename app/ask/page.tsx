/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// Chat interface is client-side only

import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AutopsyLoader } from '@/components/ui/AutopsyLoader';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  messages: any[];
  createdAt: number;
}

const CHATS_STORAGE_KEY = 'sg_chats';
const ACTIVE_CHAT_KEY = 'sg_active_chat_id';

export default function AskTheGraveyard() {
  const [messages, setMessages] = useState<any[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
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
    
    let currentChatId = activeChatId;
    const updatedMessages = [...messages, userMessage];
    
    if (!currentChatId) {
      currentChatId = `chat-${Date.now()}`;
      const newTitle = options.text.length > 28
        ? options.text.substring(0, 25) + '...'
        : options.text;
      
      const newChat: ChatSession = {
        id: currentChatId,
        title: newTitle,
        messages: updatedMessages,
        createdAt: Date.now(),
      };
      
      setChats(prev => {
        const next = [newChat, ...prev];
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      setActiveChatId(currentChatId);
      localStorage.setItem(ACTIVE_CHAT_KEY, currentChatId);
    }
    
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
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
      
      // Update local message list
      const tempMessages = [...updatedMessages, assistantMessagePlaceholder];
      setMessages(tempMessages);
      
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
          const finalMessages = tempMessages.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: fullText } : msg
          );
          setMessages(finalMessages);
          
          // Save final assistant messages to the active chat in list
          setChats(prev => {
            const next = prev.map(chat => {
              if (chat.id === currentChatId) {
                return { ...chat, messages: finalMessages };
              }
              return chat;
            });
            localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(next));
            return next;
          });
          
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
        content: `⚠️ ERROR: Interrogation link disrupted. Neural core failed to respond: "${err.message || 'Unknown network error'}"`,
      };
      const finalErrorMessages = [...updatedMessages, errorMessage];
      setMessages(finalErrorMessages);
      
      // Save error messages to active chat
      setChats(prev => {
        const next = prev.map(chat => {
          if (chat.id === currentChatId) {
            return { ...chat, messages: finalErrorMessages };
          }
          return chat;
        });
        localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  const isPending = isLoading || isTyping;
  const [mounted, setMounted] = useState(false);

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Load chat history from localStorage
    const savedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    const activeId = localStorage.getItem(ACTIVE_CHAT_KEY);
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats) as ChatSession[];
        setChats(parsedChats);
        
        if (activeId) {
          const activeSession = parsedChats.find(c => c.id === activeId);
          if (activeSession) {
            setActiveChatId(activeId);
            setMessages(activeSession.messages);
          }
        }
      } catch (e) {
        console.error('Failed to parse chat sessions history', e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const onSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isPending) return;
    
    sendMessage({
      text: input.trim(),
    });
    setInput('');
  };

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

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    const selected = chats.find(c => c.id === chatId);
    if (selected) {
      setActiveChatId(chatId);
      setMessages(selected.messages);
      localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
      setSidebarOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setChats(prev => {
      const next = prev.filter(c => c.id !== chatId);
      localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  };

  const clearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem(CHATS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  };

  if (!mounted) return null;

  return (
    <main
      style={{
        height: 'calc(100vh - 56px)',
        backgroundColor: 'var(--cream-base)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Scroll lock injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
        }
      ` }} />

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
          lg:relative lg:top-0 lg:translate-x-0 lg:flex
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
            CHAT_HISTORY
          </span>
          <button 
            onClick={clearAllChats}
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
            CLEAR ALL [×]
          </button>
        </div>

        <div style={{ padding: '16px 20px', flexShrink: 0 }}>
          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              backgroundColor: 'var(--cream-base)',
              border: '1.5px dashed var(--cream-dark)',
              borderRadius: '2px',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-black)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
              e.currentTarget.style.borderColor = 'var(--rust-accent)';
              e.currentTarget.style.color = 'var(--rust-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--cream-base)';
              e.currentTarget.style.borderColor = 'var(--cream-dark)';
              e.currentTarget.style.color = 'var(--ink-black)';
            }}
          >
            <Plus size={13} style={{ strokeWidth: 2.5 }} />
            NEW_INVESTIGATION
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {chats.length === 0 ? (
            <div
              style={{
                padding: '30px 20px',
                textAlign: 'center',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '10px',
                color: 'var(--ink-muted)',
                lineHeight: 1.5,
              }}
            >
              NO_ACTIVE_DOSSIERS
              <br />
              <span style={{ fontSize: '8px', opacity: 0.7, textTransform: 'none' }}>
                Submit a query below to initiate a case file.
              </span>
            </div>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectChat(c.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: activeChatId === c.id ? 'var(--cream-base)' : 'transparent',
                  border: activeChatId === c.id ? '1px solid var(--cream-dark)' : '1px solid transparent',
                  borderLeft: activeChatId === c.id ? '3px solid var(--rust-accent)' : '3px solid transparent',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (activeChatId !== c.id) {
                    e.currentTarget.style.backgroundColor = 'rgba(26,23,20,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeChatId !== c.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                  <MessageSquare size={12} style={{ color: activeChatId === c.id ? 'var(--rust-accent)' : 'var(--ink-muted)', flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '11px',
                      color: activeChatId === c.id ? 'var(--ink-black)' : 'var(--ink-soft)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.title}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--rust-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink-muted)'}
                  title="Delete dossier"
                >
                  <Trash2 size={12} />
                </button>
              </div>
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
                  backgroundColor: isPending ? 'var(--rust-accent)' : 'var(--sage-neutral)',
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
                {isPending ? (isLoading ? 'ANALYZING_DATA' : 'STREAMING_INTEL') : 'DIRECT_LINK_ACTIVE'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--ink-muted)' }}>
              STABILITY: 99.4%
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--ink-muted)' }}>
              LATENCY: {isPending ? '---' : '42MS'}
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '9px', color: 'var(--rust-accent)' }}>
              INTERROGATED // {String(messages.length).padStart(2, '0')}
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
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await sendMessage({
                          text: hint,
                        });
                      } catch (err) {
                        console.error('Failed to send hint:', err);
                      }
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

          {messages.map((m: any, idx: number) => (
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
                    }}
                  >
                    {m.content && renderMarkdown(m.content, m.role)}
                    {m.parts && m.parts.map((part: any, pIdx: number) => {
                      if (part.type === 'text') {
                        return <div key={pIdx}>{renderMarkdown(part.text, m.role)}</div>;
                      }
                      if (part.type === 'reasoning') {
                        return (
                          <div 
                            key={pIdx} 
                            style={{ 
                              fontSize: '11px', 
                              color: 'var(--ink-muted)', 
                              fontStyle: 'italic',
                              borderLeft: '2px solid var(--cream-dark)',
                              paddingLeft: '12px',
                              margin: '8px 0',
                              fontFamily: 'var(--font-dm-mono), monospace',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {part.text}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && <AutopsyLoader />}
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
            onSubmit={onSendMessage}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '900px',
              margin: '0 auto',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              disabled={isPending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSendMessage(e);
                }
              }}
              rows={1}
              placeholder={isPending ? "Analyst is processing forensic data..." : "Input query for forensic analysis..."}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '13px',
                color: isPending ? 'var(--ink-muted)' : 'var(--ink-black)',
                resize: 'none',
                maxHeight: '200px',
                alignSelf: 'center',
                paddingTop: '6px',
                paddingBottom: '6px',
              }}
            />
            <button
              type="submit"
              disabled={isPending || !input?.trim()}
              style={{
                backgroundColor: (input?.trim() && !isPending) ? 'var(--rust-accent)' : 'var(--cream-dark)',
                border: 'none',
                borderRadius: '1px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (input?.trim() && !isPending) ? 'pointer' : 'default',
                transition: 'background-color 0.2s ease',
                color: (input?.trim() && !isPending) ? 'var(--cream-base)' : 'var(--ink-muted)',
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
