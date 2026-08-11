"use client";

import { useRef, useState } from "react";
import { assessIdea } from "@/lib/premortem/vague";

interface IdeaInputProps {
  initialValue?: string;
  documentedCases: number;
  onContinue: (idea: string) => void;
}

const PLACEHOLDER =
  "Tell us what you're building — the problem, who it's for, and how you think it works. If it helps, mention where you are today: idea, prototype, revenue, team...";

/**
 * STEP 01 — the single entry point. One large research prompt, nothing
 * else. The interviewer (not the form) decides which facts matter.
 */
export function IdeaInput({ initialValue = "", documentedCases, onContinue }: IdeaInputProps) {
  const [value, setValue] = useState(initialValue);
  const [notice, setNotice] = useState<{ title: string; detail: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const check = assessIdea(value);
    if (check.tooVague) {
      setNotice({
        title: "TELL US A LITTLE MORE",
        detail: check.reason ?? "Describe the idea in a few sentences.",
      });
      textareaRef.current?.focus();
      return;
    }

    setSubmitting(true);
    // Give the button one paint frame before the stage swaps.
    requestAnimationFrame(() => onContinue(value.trim()));
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="premortem-idea" className="label-catalog">
        Describe your startup
      </label>
      <div className="mt-3 border border-line bg-paper-2/60 transition-colors focus-within:border-accent-deep focus-within:bg-paper">
        <textarea
          ref={textareaRef}
          id="premortem-idea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={6}
          className="h-36 w-full resize-y bg-transparent px-5 py-4 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-mute sm:h-40"
          aria-describedby="premortem-idea-hint"
        />
        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3">
          <p id="premortem-idea-hint" className="label-catalog">
            Grounded in {documentedCases} documented failure cases
          </p>
          <button
            type="submit"
            disabled={submitting || !value.trim()}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Preparing…" : "Continue"}
            {!submitting && (
              <span aria-hidden="true" className="text-paper/80">
                →
              </span>
            )}
          </button>
        </div>
      </div>

      {notice && (
        <div role="alert" className="mt-4 border-l-2 border-accent-deep bg-paper-2 px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-deep">
            {notice.title}
          </p>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-mute">{notice.detail}</p>
        </div>
      )}
    </form>
  );
}
