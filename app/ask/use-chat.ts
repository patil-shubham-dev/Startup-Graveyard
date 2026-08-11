"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatConversation, ChatMessage, ChatMeta, ChatStorage, RetrievedCase } from "./chat/types";
import { countTokens, summarizeTitle, toMeta } from "./chat/types";

export interface ChatError {
  message: string;
  retryable: boolean;
}

const SAVE_DEBOUNCE_MS = 700;

export function useChat(storage: ChatStorage) {
  const [conversations, setConversations] = useState<ChatMeta[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<ChatError | null>(null);

  const storageRef = useRef(storage);
  const messagesRef = useRef<ChatMessage[]>(messages);
  const activeRef = useRef<string | null>(activeId);
  const conversationsRef = useRef<ChatMeta[]>(conversations);
  const streamingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    storageRef.current = storage;
  }, [storage]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const patchAssistant = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const flushSave = useCallback(() => {
    const id = activeRef.current;
    const msgs = messagesRef.current;
    if (!id || msgs.length === 0) return;
    const meta = conversationsRef.current.find((c) => c.id === id);
    const conversation: ChatConversation = {
      id,
      title: meta?.title ?? "New inquiry",
      createdAt: meta?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      messages: msgs,
    };
    void storageRef.current
      .save(conversation)
      .then(() => storageRef.current.list().then(setConversations).catch(() => {}))
      .catch(() => {});
  }, []);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      flushSave();
    }, SAVE_DEBOUNCE_MS);
  }, [flushSave]);

  // Resilient persistence: flush on tab hide too, so a navigation or close
  // right after a message never loses the tail.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        flushSave();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [flushSave]);

  useEffect(() => {
    if (!streaming) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [streaming]);

  const streamAssistant = useCallback(
    async (history: ChatMessage[], assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      streamingRef.current = true;
      setStreaming(true);
      setElapsed(0);
      setError(null);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", createdAt: Date.now() },
      ]);

      const patch = (content: string, sources?: RetrievedCase[]) =>
        patchAssistant(assistantId, { content, sources });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-ask-surface": "1", "x-guest-mode": "true" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let message = `The archive returned ${res.status}.`;
          if (res.status === 429) {
            const retryAfter = res.headers.get("Retry-After");
            const seconds = Number(retryAfter);
            message = Number.isFinite(seconds) && seconds > 0
              ? `Rate limit reached — try again in ${Math.max(1, Math.ceil(seconds / 60))} minutes.`
              : "Rate limit reached — try again shortly.";
          } else if (res.status === 401) {
            message = "Sign in is required for this request right now.";
          }
          setError({ message, retryable: res.status === 429 || res.status >= 500 });
          return;
        }

        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          const content =
            typeof data.content === "string" && data.content ? data.content : "No response.";
          patch(content);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("Response stream unavailable");

        const decoder = new TextDecoder();
        let buffer = "";
        let metaParsed = false;
        let acc = "";
        let sources: RetrievedCase[] | undefined;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          if (!metaParsed) {
            const nl = buffer.indexOf("\n");
            if (nl >= 0) {
              const first = buffer.slice(0, nl).trim();
              buffer = buffer.slice(nl + 1);
              metaParsed = true;
              if (first.startsWith("{")) {
                try {
                  const meta = JSON.parse(first) as { retrieved?: RetrievedCase[] };
                  if (Array.isArray(meta.retrieved)) sources = meta.retrieved;
                } catch {
                  acc += `${first}\n`;
                }
              } else {
                acc += `${first}\n`;
              }
            }
          }
          acc += buffer;
          buffer = "";
          patch(acc, sources);
        }

        acc += decoder.decode();
        patch(acc, sources);
      } catch {
        if (controller.signal.aborted) {
          patchAssistant(assistantId, { stopped: true });
        } else {
          setError({
            message: "The connection to the archive was interrupted. Retry to continue.",
            retryable: true,
          });
        }
      } finally {
        abortRef.current = null;
        streamingRef.current = false;
        setStreaming(false);
        scheduleSave();
      }
    },
    [patchAssistant, scheduleSave]
  );

  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || streamingRef.current) return;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, createdAt: Date.now() };
      const assistantId = crypto.randomUUID();
      const prev = messagesRef.current;
      const existingId = activeRef.current;
      const fresh = !existingId || prev.length === 0;

      if (fresh) {
        const id = crypto.randomUUID();
        const now = Date.now();
        const conversation: ChatConversation = {
          id,
          title: summarizeTitle(content),
          createdAt: now,
          updatedAt: now,
          messages: [userMsg],
        };
        setActiveId(id);
        setMessages([userMsg]);
        setConversations((cs) => [toMeta(conversation), ...cs.filter((c) => c.id !== id)]);
        void storageRef.current.save(conversation).catch(() => {});
        await streamAssistant([userMsg], assistantId);
      } else {
        const next = [...prev, userMsg];
        setMessages(next);
        scheduleSave();
        await streamAssistant(next, assistantId);
      }
    },
    [scheduleSave, streamAssistant]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retry = useCallback(async () => {
    if (streamingRef.current) return;
    const msgs = messagesRef.current;
    const lastUserIdx = msgs.map((m) => m.role).lastIndexOf("user");
    if (lastUserIdx < 0) return;
    const trimmed = msgs.slice(0, lastUserIdx + 1);
    setMessages(trimmed);
    setError(null);
    await streamAssistant(trimmed, crypto.randomUUID());
  }, [streamAssistant]);

  const openConversation = useCallback(async (id: string) => {
    abortRef.current?.abort();
    try {
      const conversation = await storageRef.current.get(id);
      if (!conversation) return;
      setActiveId(id);
      setMessages(conversation.messages);
      setError(null);
    } catch {
      // storage read failed — keep the current view rather than error out
    }
  }, []);

  // Re-read the backend list and open the newest conversation (e.g. after
  // importing guest history into the account without a reload).
  const refresh = useCallback(async () => {
    try {
      const list = await storageRef.current.list();
      setError(null);
      setConversations(list);
      if (list.length > 0) {
        const conversation = await storageRef.current.get(list[0].id);
        if (conversation) {
          setActiveId(conversation.id);
          setMessages(conversation.messages);
          return;
        }
      }
      setActiveId(null);
      setMessages([]);
    } catch {
      // storage read failed — keep the current list rather than error out
    }
  }, []);

  const startFresh = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setError(null);
  }, []);

  const rename = useCallback(
    async (id: string, rawTitle: string) => {
      const title = rawTitle.trim();
      if (!title) return;
      setConversations((cs) => cs.map((c) => (c.id === id ? { ...c, title } : c)));
      try {
        if (activeRef.current === id) {
          const msgs = messagesRef.current;
          const meta = conversationsRef.current.find((c) => c.id === id);
          const conversation: ChatConversation = {
            id,
            title,
            createdAt: meta?.createdAt ?? Date.now(),
            updatedAt: Date.now(),
            messages: msgs,
          };
          await storageRef.current.save(conversation);
        } else {
          const conversation = await storageRef.current.get(id);
          if (conversation) {
            conversation.title = title;
            conversation.updatedAt = Date.now();
            await storageRef.current.save(conversation);
          }
        }
      } catch {
        // non-critical; the index already shows the new title this session
      }
    },
    []
  );

  const remove = useCallback(
    async (id: string) => {
      if (activeRef.current === id) {
        abortRef.current?.abort();
        setActiveId(null);
        setMessages([]);
      }
      setConversations((cs) => cs.filter((c) => c.id !== id));
      try {
        await storageRef.current.remove(id);
      } catch {
        // non-critical; removed from this session's index
      }
    },
    []
  );

  // Hydrate when the storage backend changes (mount, sign-in, sign-out).
  // The abort above resolves any in-flight stream (its `finally` clears the
  // streaming flag), so only the stale error needs an explicit reset here.
  useEffect(() => {
    let cancelled = false;
    abortRef.current?.abort();
    streamingRef.current = false;
    const hydrate = async () => {
      try {
        const list = await storageRef.current.list();
        setError(null);
        if (cancelled) return;
        setConversations(list);
        if (list.length > 0) {
          const conversation = await storageRef.current.get(list[0].id);
          if (!cancelled && conversation) {
            setActiveId(conversation.id);
            setMessages(conversation.messages);
            return;
          }
        }
        setActiveId(null);
        setMessages([]);
      } catch {
        if (!cancelled) {
          setConversations([]);
          setActiveId(null);
          setMessages([]);
        }
      }
    };
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [storage]);

  const tokenCount = useMemo(
    () => messages.reduce((n, m) => n + countTokens(m.content), 0),
    [messages]
  );

  return {
    conversations,
    activeId,
    messages,
    streaming,
    elapsed,
    error,
    tokenCount,
    send,
    stop,
    retry,
    openConversation,
    startFresh,
    rename,
    remove,
    refresh,
  };
}
