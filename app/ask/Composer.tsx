"use client";

import { useRef, useState } from "react";
import { ArrowUp, ChevronDown, ChevronUp, Square, X } from "lucide-react";
import styles from "./ask.module.css";
import type { RetrievedCase } from "./chat/types";
import { formatClock, formatTokens } from "./format";

const CONTEXT_WINDOW = 32_000;

interface ComposerProps {
  streaming: boolean;
  elapsed: number;
  tokenCount: number;
  messageCount: number;
  lastSources: RetrievedCase[] | null;
  grounding: { published: number; industries: number };
  showSync: boolean;
  onDismissSync: () => void;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({
  streaming,
  elapsed,
  tokenCount,
  messageCount,
  lastSources,
  grounding,
  showSync,
  onDismissSync,
  onSend,
  onStop,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const [contextOpen, setContextOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !streaming;
  const tokenPct = Math.min(100, Math.round((tokenCount / CONTEXT_WINDOW) * 100));

  const autoGrow = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`;
  };

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (el) el.style.height = "auto";
      el?.focus();
    });
  };

  return (
    <footer className={styles.composer}>
      <div className={styles.composerWrap}>
        {showSync && (
          <div className={styles.syncBox}>
            <button
              type="button"
              className={styles.syncClose}
              aria-label="Dismiss browser storage notice"
              onClick={onDismissSync}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
            <p className={styles.syncTitle}>Your chats are saved on this browser.</p>
            <p className={styles.syncText}>Sign in to keep your conversations synced across devices.</p>
            <div className={styles.syncActions}>
              <a href="/auth" className={styles.syncBtn}>
                Sign in
              </a>
              <a href="/auth" className={`${styles.syncBtn} ${styles.syncBtnPrimary}`}>
                Create account
              </a>
            </div>
          </div>
        )}

        {contextOpen && (
          <div className={styles.contextPanel} id="ask-context-panel">
            <p className={styles.contextPanelTitle}>Context</p>
            <p className={styles.contextPanelLine}>
              ~{formatTokens(tokenCount)} tokens · {messageCount} message
              {messageCount === 1 ? "" : "s"} of {formatTokens(CONTEXT_WINDOW)}
            </p>
            <div className={styles.contextPanelBar} aria-hidden>
              <span className={styles.contextPanelFill} style={{ width: `${tokenPct}%` }} />
            </div>
            {lastSources && lastSources.length > 0 && (
              <div className={styles.contextSources}>
                <p className={styles.contextSourcesLabel}>
                  Case files retrieved for the latest response
                </p>
                <ul className={styles.contextSourcesList}>
                  {lastSources.map((s) => (
                    <li key={s.slug}>
                      <a href={`/case/${s.slug}`} className={styles.contextSourceName}>
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className={styles.contextNote}>
              Each answer is re-grounded in the archive. Earlier messages shape the line of
              inquiry, not the facts cited.
            </p>
          </div>
        )}

        <div className={`${styles.composerBox} ${showSync ? styles.composerBoxConnected : ""}`}>
          <div className={styles.composerTop}>
            <button
              type="button"
              className={styles.contextBtn}
              aria-expanded={contextOpen}
              aria-controls="ask-context-panel"
              onClick={() => setContextOpen((o) => !o)}
            >
              <span className={styles.contextLabel}>Archive context</span>
              <span className={styles.contextValue}>
                ~{formatTokens(tokenCount)} tokens
              </span>
              <span className={styles.contextBar} aria-hidden>
                <span className={styles.contextBarFill} style={{ width: `${tokenPct}%` }} />
              </span>
              {contextOpen ? (
                <ChevronDown size={13} strokeWidth={1.5} aria-hidden />
              ) : (
                <ChevronUp size={13} strokeWidth={1.5} aria-hidden />
              )}
            </button>
          </div>

          <div className={styles.composerInputRow}>
            <textarea
              ref={inputRef}
              className={styles.composerInput}
              placeholder="Ask the archive…"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                autoGrow();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              aria-label="Ask the archive"
            />
            <div className={styles.composerActions}>
              <p className={styles.composerHint}>Enter to send · Shift + Enter for a new line</p>
              {streaming ? (
                <button type="button" className={styles.stopBtn} onClick={onStop} aria-label="Stop generating">
                  <Square size={12} strokeWidth={1.75} fill="currentColor" aria-hidden />
                  <span className={styles.stopElapsed} aria-hidden>
                    {formatClock(elapsed)}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.sendBtn}
                  disabled={!canSend}
                  aria-label="Send inquiry"
                  onClick={submit}
                >
                  <ArrowUp size={16} strokeWidth={2} aria-hidden />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className={styles.disclaimer}>
          Graveyard Intelligence · grounded in {grounding.published} published case files ·{" "}
          {grounding.industries} industries · answers may not be perfectly accurate
        </p>
      </div>
    </footer>
  );
}
