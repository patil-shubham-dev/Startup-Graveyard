"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, PanelLeft, Plus, Search } from "lucide-react";
import styles from "./ask.module.css";
import type { ChatMeta } from "./chat/types";
import { formatCount, formatTime } from "./format";

interface SidebarProps {
  conversations: ChatMeta[];
  activeId: string | null;
  storageKind: "local" | "remote";
  onToggleCollapse: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onNavigate?: () => void;
}

const CONFIRM_MS = 3000;

export function Sidebar({
  conversations,
  activeId,
  storageKind,
  onToggleCollapse,
  onNew,
  onOpen,
  onRename,
  onDelete,
  onNavigate,
}: SidebarProps) {
  const [query, setQuery] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations;
  }, [conversations, query]);

  const beginRename = (conv: ChatMeta) => {
    setMenuFor(null);
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const commitRename = () => {
    if (renamingId) onRename(renamingId, renameValue);
    setRenamingId(null);
  };

  const requestDelete = (id: string) => {
    if (confirmingId === id) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = null;
      setConfirmingId(null);
      setMenuFor(null);
      onDelete(id);
      onNavigate?.();
      return;
    }
    setConfirmingId(id);
    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    confirmTimer.current = setTimeout(() => setConfirmingId(null), CONFIRM_MS);
  };

  const toggleMenu = (id: string) => {
    setMenuFor((cur) => (cur === id ? null : id));
    setConfirmingId(null);
  };

  const closeMenu = (refocus: boolean) => {
    setMenuFor(null);
    setConfirmingId(null);
    if (refocus) triggerRefs.current[menuFor ?? ""]?.focus();
  };

  useEffect(() => {
    if (!menuFor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuFor]);

  const open = (id: string) => {
    onOpen(id);
    onNavigate?.();
  };

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.sidebarHead}>
        <div className={styles.sidebarHeadRow}>
          <p className="label-catalog">
            Conversations
            <span className={styles.sidebarCount}> · {conversations.length}</span>
          </p>
          <button
            type="button"
            className={styles.barIconBtn}
            aria-label="Collapse sidebar"
            onClick={onToggleCollapse}
          >
            <PanelLeft size={15} strokeWidth={1.5} />
          </button>
        </div>
        <button type="button" className={styles.newBtn} onClick={() => { onNew(); onNavigate?.(); }}>
          <Plus size={14} strokeWidth={1.75} aria-hidden />
          New inquiry
        </button>
        <div className={styles.searchWrap}>
          <Search size={13} strokeWidth={1.5} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
      </div>

      <ul className={styles.convList} role="list">
        {conversations.length === 0 ? (
          <li className={styles.convEmpty}>
            <p className={styles.convEmptyTitle}>No investigations yet</p>
            <p className={styles.convEmptyText}>Begin by interrogating the archive.</p>
          </li>
        ) : filtered.length === 0 ? (
          <li className={styles.convEmpty}>
            <p className={styles.convEmptyTitle}>No conversations found</p>
            <p className={styles.convEmptyText}>No conversations match your search.</p>
          </li>
        ) : (
          filtered.map((conv) => {
            const isActive = conv.id === activeId;
            const isRenaming = renamingId === conv.id;
            const menuOpen = menuFor === conv.id;
            const isConfirming = confirmingId === conv.id;
            return (
              <li key={conv.id} className={`${styles.convRow} ${isActive ? styles.convRowActive : ""}`}>
                {menuOpen && (
                  <button
                    type="button"
                    className={styles.menuBackdrop}
                    aria-label="Close conversation menu"
                    onClick={() => closeMenu(true)}
                    tabIndex={-1}
                  />
                )}
                <button
                  type="button"
                  className={styles.convOpen}
                  onClick={() => open(conv.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className={styles.convTitle}>{conv.title}</span>
                  <span className={styles.convMeta}>
                    {formatTime(conv.updatedAt)} · {formatCount(conv.count)}
                  </span>
                </button>
                <div className={styles.convActions}>
                  {isRenaming ? (
                    <input
                      autoFocus
                      className={styles.renameInput}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      aria-label="Conversation title"
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        className={`${styles.convAction} ${menuOpen ? styles.convActionOpen : ""}`}
                        aria-label={`More actions for ${conv.title}`}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        onClick={() => toggleMenu(conv.id)}
                        ref={(el) => {
                          triggerRefs.current[conv.id] = el;
                        }}
                      >
                        <MoreHorizontal size={14} strokeWidth={1.5} />
                      </button>
                      {menuOpen && (
                        <div
                          className={styles.convMenu}
                          role="menu"
                          aria-label={`Actions for ${conv.title}`}
                        >
                          <button
                            type="button"
                            role="menuitem"
                            className={styles.convMenuItem}
                            aria-label={`Rename ${conv.title}`}
                            onClick={() => beginRename(conv)}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className={`${styles.convMenuItem} ${isConfirming ? styles.convMenuItemConfirm : ""}`}
                            aria-label={isConfirming ? `Confirm delete ${conv.title}` : `Delete ${conv.title}`}
                            onClick={() => requestDelete(conv.id)}
                          >
                            {isConfirming ? "Delete?" : "Delete"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>

      <div className={styles.sidebarFoot}>
        <span className={styles.storageNote}>
          {storageKind === "local" ? "Saved to this browser" : "Synced with your account"}
        </span>
      </div>
    </div>
  );
}
