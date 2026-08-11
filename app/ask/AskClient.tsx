"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, PanelLeft } from "lucide-react";
import { supabase } from "@/lib/db/config";
import styles from "./ask.module.css";
import { Sidebar } from "./Sidebar";
import { Thread } from "./Thread";
import { Composer } from "./Composer";
import { useChat } from "./use-chat";
import { createLocalStorage, migrateLocalToRemote, storageFor } from "./chat";

interface AskClientProps {
  grounding: { published: number; industries: number };
}

const SYNC_DISMISS_KEY = "ask:sync-dismissed";
const SYNC_REMIND_MS = 7 * 24 * 60 * 60 * 1000;

export function AskClient({ grounding }: AskClientProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [migration, setMigration] = useState<{ count: number; result: string | null } | null>(null);
  const [syncDismissedAt, setSyncDismissedAt] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(SYNC_DISMISS_KEY) || "0");
    } catch {
      return 0;
    }
  });
  const [nowTick, setNowTick] = useState(() => Date.now());
  const prevUserId = useRef<string | null | undefined>(undefined);
  const reduced = useReducedMotion();

  useEffect(() => {
    const iv = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  useEffect(() => {
    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setUserId(data.session?.user?.id ?? null);
      })
      .catch(() => {
        // Session restore aborted/timed out — degrade to signed-out: local
        // storage still serves the conversation history.
        if (active) setUserId(null);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const prev = prevUserId.current;
    prevUserId.current = userId;
    if (prev !== undefined && !prev && userId) {
      void createLocalStorage()
        .list()
        .then((meta) => {
          const count = meta.reduce((n, m) => n + m.count, 0);
          if (count > 0) setMigration({ count, result: null });
        })
        .catch(() => {});
    }
    if (prev && !userId) setMigration(null);
  }, [userId]);

  const showSync = !userId && nowTick - syncDismissedAt > SYNC_REMIND_MS;

  const dismissSync = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(SYNC_DISMISS_KEY, String(now));
    } catch {
      // private mode — the prompt simply returns next visit
    }
    setSyncDismissedAt(now);
  }, []);

  const storage = useMemo(() => storageFor(userId), [userId]);
  const chat = useChat(storage);
  const { refresh: refreshHistory } = chat;

  const runImport = useCallback(async () => {
    if (!userId) return;
    try {
      const result = await migrateLocalToRemote(createLocalStorage(), storageFor(userId));
      const verb = result.imported === 1 ? "conversation" : "conversations";
      const skipped =
        result.skipped > 0 ? ` · ${result.skipped} already in your account` : "";
      setMigration((m) => m && { ...m, result: `Imported ${result.imported} ${verb}${skipped}.` });
      await refreshHistory();
    } catch {
      setMigration((m) => m && { ...m, result: "Import failed — try again later." });
    }
  }, [userId, refreshHistory]);

  const lastSources = useMemo(() => {
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const m = chat.messages[i];
      if (m.role === "assistant" && m.sources && m.sources.length > 0) return m.sources;
    }
    return null;
  }, [chat.messages]);

  const drawerTransition = reduced
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.32, 0.72, 0, 1] as const };

  return (
    <div className={styles.shell}>
      {!collapsed && (
        <aside className={styles.sidebar} aria-label="Conversations">
          <Sidebar
            conversations={chat.conversations}
            activeId={chat.activeId}
            storageKind={storage.kind}
            onToggleCollapse={() => setCollapsed(true)}
            onNew={() => void chat.startFresh()}
            onOpen={(id) => void chat.openConversation(id)}
            onRename={(id, title) => void chat.rename(id, title)}
            onDelete={(id) => void chat.remove(id)}
          />
        </aside>
      )}

      <div className={styles.mainCol}>
        <header className={styles.threadBar}>
          <div className={styles.threadBarLeft}>
            {collapsed && (
              <button
                type="button"
                className={styles.barIconBtn}
                aria-label="Show sidebar"
                onClick={() => setCollapsed(false)}
              >
                <PanelLeft size={15} strokeWidth={1.5} />
              </button>
            )}
            <button
              type="button"
              className={`${styles.barIconBtn} ${styles.barMenuBtn}`}
              aria-label="Open conversations"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={15} strokeWidth={1.5} />
            </button>
            <span className={styles.threadBarLabel}>Archive terminal</span>
          </div>
          <span className={styles.threadBarMeta}>
            Grounded in {grounding.published} published case files · {grounding.industries}{" "}
            industries
          </span>
        </header>

        {migration && (
          <div className={styles.migrateBar}>
            <span className={styles.migrateText}>
              {migration.result ??
                `${migration.count} local conversation${
                  migration.count === 1 ? "" : "s"
                } found on this browser — import them to sync across devices.`}
            </span>
            {!migration.result && (
              <span className={styles.migrateActions}>
                <button type="button" className="link-editorial" onClick={() => void runImport()}>
                  Import now
                </button>
                <button type="button" className={styles.migrateLater} onClick={() => setMigration(null)}>
                  Not now
                </button>
              </span>
            )}
          </div>
        )}

        <Thread
          messages={chat.messages}
          streaming={chat.streaming}
          elapsed={chat.elapsed}
          error={chat.error}
          onRetry={() => void chat.retry()}
          onNew={() => chat.startFresh()}
          onSuggestion={(s) => void chat.send(s)}
        />

        <Composer
          streaming={chat.streaming}
          elapsed={chat.elapsed}
          tokenCount={chat.tokenCount}
          messageCount={chat.messages.length}
          lastSources={lastSources}
          grounding={grounding}
          showSync={showSync}
          onDismissSync={dismissSync}
          onSend={(t) => void chat.send(t)}
          onStop={() => chat.stop()}
        />
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className={styles.drawerBackdrop}
            onClick={() => setDrawerOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Conversations"
              className={styles.drawer}
              onClick={(e) => e.stopPropagation()}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={drawerTransition}
            >
              <Sidebar
                conversations={chat.conversations}
                activeId={chat.activeId}
                storageKind={storage.kind}
                onToggleCollapse={() => setDrawerOpen(false)}
                onNew={() => {
                  void chat.startFresh();
                  setDrawerOpen(false);
                }}
                onOpen={(id) => void chat.openConversation(id)}
                onRename={(id, title) => void chat.rename(id, title)}
                onDelete={(id) => void chat.remove(id)}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
