"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useReducedMotion } from "framer-motion";
import { ChevronDown, Copy, RotateCcw } from "lucide-react";
import styles from "./ask.module.css";
import type { ChatMessage, RetrievedCase } from "./chat/types";
import type { ChatError } from "./use-chat";
import { formatClock, formatTime } from "./format";
import { buildFollowUps } from "./followups";

const SUGGESTIONS = [
  "Why did Quibi fail?",
  "Compare Webvan and Kozmo.com",
  "Which failure patterns recur most across the archive?",
  "What do the delivery startups have in common?",
];

function splitWords(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

/** Word-by-word reveal. The full text is the source of truth; the visible
 *  prefix catches up at a bounded rate even when the network delivers in
 *  bursts, and collapses instantly when the stream ends. */
function Typewriter({ text, active }: { text: string; active: boolean }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (reduced || !active) return;
    const iv = setInterval(() => {
      setShown((prev) => {
        const total = splitWords(textRef.current).length;
        return prev >= total ? prev : prev + 1;
      });
    }, 18);
    return () => clearInterval(iv);
  }, [active, reduced]);

  const visible = useMemo(() => {
    if (reduced || !active) return text;
    const words = splitWords(text);
    return words.slice(0, Math.min(shown, words.length)).join("");
  }, [text, shown, active, reduced]);

  return (
    <div className={styles.msgProseStream}>
      {visible}
      {active && (
        <span className={styles.cursor} aria-hidden>
          ▍
        </span>
      )}
    </div>
  );
}

function Sources({ sources }: { sources: RetrievedCase[] }) {
  const strength =
    sources.length >= 3 ? "Strong corroboration" : sources.length >= 1 ? "Limited corroboration" : null;
  return (
    <details className={styles.sources}>
      <summary className={styles.sourcesSummary}>
        <span className={styles.sourcesSummaryLabel}>
          <span>
            Evidence · {sources.length} source{sources.length === 1 ? "" : "s"}
          </span>
          {strength && <em className={styles.sourcesStrength}>{strength}</em>}
        </span>
        <ChevronDown size={12} strokeWidth={1.5} aria-hidden className={styles.sourcesChevron} />
      </summary>
      <ul className={styles.sourcesList}>
        {sources.map((s, i) => (
          <li key={s.slug} className={styles.sourcesItem}>
            <a href={`/case/${s.slug}`} className={styles.sourcesName}>
              <span className={styles.sourcesIndex} aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.name}
            </a>
            <span className={styles.sourcesText}>{s.summary}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

interface MessageRowProps {
  msg: ChatMessage;
  streaming: boolean;
  elapsed: number;
  isLast: boolean;
  onRetry: () => void;
}

function MessageRow({ msg, streaming, elapsed, isLast, onRetry }: MessageRowProps) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);
  const thinking = streaming && !isUser && msg.content === "";
  const finished = !streaming && !isUser;
  const canRetry = finished && isLast && !msg.stopped && msg.content.length > 0;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (non-secure context) — the action is silent
    }
  };

  return (
    <div className={isUser ? styles.msgUser : styles.msgAssistant}>
      <div className={styles.msgMeta}>
        <span className={styles.msgLabel}>{isUser ? "Inquiry" : "Graveyard Intelligence"}</span>
        <time className={styles.msgTime} dateTime={new Date(msg.createdAt).toISOString()}>
          {formatTime(msg.createdAt)}
        </time>
        {streaming && !isUser && (
          <span className={styles.msgElapsed} aria-hidden>
            · {formatClock(elapsed)}
          </span>
        )}
        {!isUser && (
          <span className={styles.msgActions}>
            {canRetry && (
              <button
                type="button"
                className={styles.msgActionBtn}
                aria-label="Retry response"
                title="Retry"
                onClick={onRetry}
              >
                <RotateCcw size={12} strokeWidth={1.5} />
              </button>
            )}
            {finished && msg.content && (
              <button
                type="button"
                className={styles.msgActionBtn}
                aria-label={copied ? "Copied" : "Copy response"}
                title={copied ? "Copied" : "Copy"}
                onClick={copy}
              >
                {copied ? (
                  <span className={styles.msgCopied}>Copied</span>
                ) : (
                  <Copy size={12} strokeWidth={1.5} />
                )}
              </button>
            )}
          </span>
        )}
      </div>
      <div className={styles.msgBody}>
        {thinking ? (
          <p className={styles.thinking} role="status">
            Consulting the archive
            <span className={styles.dots} aria-hidden>
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
          </p>
        ) : isUser ? (
          <p className={styles.msgUserText}>{msg.content}</p>
        ) : msg.content ? (
          <div className={`${styles.msgProse} case-narrative`}>
            {streaming ? (
              <Typewriter text={msg.content} active />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            )}
          </div>
        ) : null}
        {!isUser && msg.stopped && finished && (
          <p className={styles.stoppedNote}>Generation stopped · partial response preserved</p>
        )}
        {!isUser && msg.sources && msg.sources.length > 0 && <Sources sources={msg.sources} />}
      </div>
    </div>
  );
}

interface ThreadProps {
  messages: ChatMessage[];
  streaming: boolean;
  elapsed: number;
  error: ChatError | null;
  onRetry: () => void;
  onNew: () => void;
  onSuggestion: (s: string) => void;
}

export function Thread({ messages, streaming, elapsed, error, onRetry, onNew, onSuggestion }: ThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const [stick, setStick] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!el || !sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        stickRef.current = entry.isIntersecting;
        setStick(entry.isIntersecting);
      },
      { root: el, rootMargin: "140px 0px 0px 0px", threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []);

  const prevStreaming = useRef(streaming);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const justFinished = prevStreaming.current && !streaming;
    prevStreaming.current = streaming;
    if (justFinished) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      return;
    }
    if (messages.length === 0 || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const isEmpty = messages.length === 0 && !streaming;

  const lastUserQuestion = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content;
    }
    return "";
  }, [messages]);

  const followUps = useMemo(() => {
    const last = messages[messages.length - 1];
    if (streaming || error || !last || last.role !== "assistant" || !last.content) return null;
    return buildFollowUps(lastUserQuestion);
  }, [messages, streaming, error, lastUserQuestion]);

  return (
    <div className={styles.thread} ref={scrollRef}>
      <div className={styles.threadInner}>
        {isEmpty ? (
          <div className={styles.empty}>
            <p className="label-catalog">Archive terminal</p>
            <h2 className={styles.emptyTitle}>Interrogate the archive.</h2>
            <p className={styles.emptyText}>
              The archive holds 16 published case files across 12 industries. Ask with intent —
              name the company, the collapse, or the pattern you want traced.
            </p>
            <ul className={styles.suggestions} role="list">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" className={styles.suggestion} onClick={() => onSuggestion(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                streaming={streaming}
                elapsed={elapsed}
                isLast={i === messages.length - 1}
                onRetry={onRetry}
              />
            ))}
            {followUps && (
              <div className={styles.followUps}>
                <p className={styles.followUpLabel}>Continue investigation</p>
                <ul className={styles.followUpList} role="list">
                  {followUps.map((s) => (
                    <li key={s}>
                      <button type="button" className={styles.followUp} onClick={() => onSuggestion(s)}>
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {error && (
          <div className={styles.errorRow} role="alert">
            <span className={styles.errorText}>{error.message}</span>
            <span className={styles.errorActions}>
              {error.retryable && (
                <button type="button" className="link-editorial" onClick={onRetry}>
                  Retry
                </button>
              )}
              <button type="button" className={styles.errorNew} onClick={onNew}>
                Start a new inquiry
              </button>
            </span>
          </div>
        )}

        <div ref={sentinelRef} className={styles.endSentinel} aria-hidden />
      </div>
      {!isEmpty && (
        <button
          type="button"
          className={`${styles.stickNote} ${stick ? "" : styles.stickNoteShow}`}
          onClick={jumpToBottom}
          aria-label="New response"
          tabIndex={stick ? -1 : 0}
        >
          ↓ New response
        </button>
      )}
    </div>
  );
}
