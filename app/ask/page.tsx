"use client"

import { useState, useRef, useEffect } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
        {isUser ? "Inquiry" : "Graveyard Intelligence"}
      </p>
      <div
        className={`mt-3 max-w-xl whitespace-pre-wrap text-[15px] leading-relaxed ${
          isUser ? "font-medium text-ink" : "text-ink-mute"
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to Graveyard Intelligence. I can analyze startup failures, compare cases, and answer questions about the archive. What would you like to investigate?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || data.message || "No response." },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again or check that the API is configured.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-5 py-14 sm:px-6 md:py-20">
      <div>
        <p className="label-catalog">/ask</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
          Graveyard Intelligence
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
          Ask questions about startup failures, compare cases, or investigate
          patterns. Answers are drawn from the case study archive.
        </p>
      </div>

      <div className="mt-12 flex flex-1 flex-col">
        <div className="flex-1">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}

          {loading && (
            <p className="border-t border-line py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Graveyard Intelligence is consulting the archive…
            </p>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 border-t border-line pt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a startup, failure pattern, or compare cases..."
              disabled={loading}
              className="field flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send inquiry
            </button>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
            AI analysis of the case study archive — answers may not be
            perfectly accurate
          </p>
        </form>
      </div>
    </main>
  )
}
