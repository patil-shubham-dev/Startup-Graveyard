"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PremortemQuestion } from "@/lib/premortem/schemas";

interface QuestionnaireProps {
  questions: PremortemQuestion[];
  initialAnswers: Record<string, string>;
  onBackToIdea: () => void;
  onAnswersChange: (answers: Record<string, string>) => void;
  onComplete: (answers: Record<string, string>) => void;
}

type Selection = Record<string, string | null>;
type Drafts = Record<string, string>;

/**
 * STEP 03 — the interview. One question at a time, native radio groups
 * (arrow-key navigation, screen-reader friendly), optional custom answers,
 * and quiet progress. The founder's answers are never lost while moving
 * back and forth.
 */
export function Questionnaire({
  questions,
  initialAnswers,
  onBackToIdea,
  onAnswersChange,
  onComplete,
}: QuestionnaireProps) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>(() => {
    const s: Selection = {};
    for (const q of questions) {
      const saved = initialAnswers[q.id];
      if (saved && q.options.includes(saved)) s[q.id] = saved;
    }
    return s;
  });
  const [customDrafts, setCustomDrafts] = useState<Drafts>(() => {
    const d: Drafts = {};
    for (const q of questions) {
      const saved = initialAnswers[q.id];
      if (saved && !q.options.includes(saved)) d[q.id] = saved;
    }
    return d;
  });
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    for (const q of questions) {
      const saved = initialAnswers[q.id];
      if (saved && !q.options.includes(saved)) o[q.id] = true;
    }
    return o;
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  const question = questions[index];
  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const sel = selection[q.id];
      if (sel) return true;
      const draft = customDrafts[q.id];
      return Boolean(draft && draft.trim());
    }).length;
  }, [questions, selection, customDrafts]);

  const liveAnswers = useMemo(() => {
    const answers: Record<string, string> = {};
    for (const q of questions) {
      const chosen = selection[q.id];
      if (chosen) {
        answers[q.id] = chosen;
      } else {
        const draft = (customDrafts[q.id] ?? "").trim();
        if (draft) answers[q.id] = draft;
      }
    }
    return answers;
  }, [questions, selection, customDrafts]);

  // Keep the parent's persisted state in step with the interview so a
  // refresh mid-questionnaire never loses answers.
  useEffect(() => {
    onAnswersChange(liveAnswers);
  }, [liveAnswers, onAnswersChange]);

  const currentAnswered = useMemo(() => {
    const sel = selection[question.id];
    if (sel) return true;
    const draft = customDrafts[question.id];
    return Boolean(draft && draft.trim());
  }, [question, selection, customDrafts]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [index, question.id]);

  function selectOption(option: string) {
    setSelection((s) => ({ ...s, [question.id]: option }));
    setCustomOpen((o) => ({ ...o, [question.id]: false }));
  }

  function toggleCustom() {
    const isOpen = Boolean(customOpen[question.id]);
    setCustomOpen((o) => ({ ...o, [question.id]: !isOpen }));
    if (!isOpen) {
      setSelection((s) => ({ ...s, [question.id]: null }));
    }
  }

  function setCustom(text: string) {
    setCustomDrafts((d) => ({ ...d, [question.id]: text }));
  }

  function goBack() {
    if (index === 0) {
      onBackToIdea();
      return;
    }
    setIndex((i) => i - 1);
  }

  function goForward(skip = false) {
    if (!skip && !currentAnswered) return;
    if (!skip && customOpen[question.id] && !(customDrafts[question.id] ?? "").trim()) return;

    if (index + 1 >= total) {
      onComplete(liveAnswers);
      return;
    }
    setIndex((i) => i + 1);
  }

  const showOptions = question.type === "single_choice" && question.options.length > 0;
  const allowCustom = question.allow_custom !== false;

  return (
    <section aria-label="Investigation questions">
      <div className="flex items-baseline justify-between gap-4">
        <p className="label-catalog" aria-live="polite">
          Question {String(index + 1).padStart(2, "0")} of {String(total).padStart(2, "0")}
        </p>
        <p className="label-catalog" aria-live="polite">
          {answeredCount} of {total} answered
        </p>
      </div>
      <div
        className="mt-3 h-[3px] w-full bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answeredCount}
        aria-label="Interview progress"
      >
        <div
          className="h-full bg-accent-deep transition-[width] duration-300 ease-out"
          style={{ width: `${(answeredCount / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      <div className="mt-10">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="max-w-2xl text-2xl font-semibold leading-snug tracking-tight text-ink outline-none sm:text-[28px]"
        >
          {question.question}
        </h2>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
          {question.category}
        </p>

        <fieldset className="mt-8" aria-label={question.question}>
          <legend className="sr-only">{question.question}</legend>
          <div className="space-y-0">
            {showOptions &&
              question.options.map((option) => {
                const id = `${question.id}-opt-${option.replace(/\s+/g, "-").toLowerCase()}`;
                const checked = selection[question.id] === option;
                return (
                  <div key={id} className="border-t border-line first:border-t-0">
                    <label
                      htmlFor={id}
                      className={`flex cursor-pointer items-center gap-4 px-2 py-4 transition-colors hover:bg-paper-2 ${
                        checked ? "bg-paper-2" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        id={id}
                        name={`question-${question.id}`}
                        value={option}
                        checked={checked}
                        onChange={() => selectOption(option)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                          checked ? "border-accent-deep" : "border-ink-mute"
                        }`}
                      >
                        {checked && <span className="h-2.5 w-2.5 rounded-full bg-accent-deep" />}
                      </span>
                      <span className={`text-[15px] leading-relaxed ${checked ? "text-ink" : "text-ink-mute"}`}>
                        {option}
                      </span>
                    </label>
                  </div>
                );
              })}

            {allowCustom && (
              <div className="border-t border-line first:border-t-0">
                <label
                  htmlFor={`${question.id}-custom-toggle`}
                  className={`flex cursor-pointer items-center gap-4 px-2 py-4 transition-colors hover:bg-paper-2 ${
                    customOpen[question.id] ? "bg-paper-2" : ""
                  }`}
                >
                  <input
                    type="radio"
                    id={`${question.id}-custom-toggle`}
                    name={`question-${question.id}`}
                    checked={Boolean(customOpen[question.id])}
                    onChange={toggleCustom}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                      customOpen[question.id] ? "border-accent-deep" : "border-ink-mute"
                    }`}
                  >
                    {customOpen[question.id] && <span className="h-2.5 w-2.5 rounded-full bg-accent-deep" />}
                  </span>
                  <span className={`text-[15px] leading-relaxed ${customOpen[question.id] ? "text-ink" : "text-ink-mute"}`}>
                    Write your own answer
                  </span>
                </label>
                {customOpen[question.id] && (
                  <div className="px-2 pb-4">
                    <label htmlFor={`${question.id}-custom`} className="sr-only">
                      Your answer
                    </label>
                    <textarea
                      id={`${question.id}-custom`}
                      value={customDrafts[question.id] ?? ""}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="Describe your answer..."
                      rows={3}
                      className="field field-area mt-1 w-full bg-paper"
                    />
                  </div>
                )}
              </div>
            )}

            {!showOptions && !allowCustom && (
              <div className="border-t border-line px-2 pb-4 pt-4">
                <label htmlFor={`${question.id}-custom`} className="label-catalog">
                  Your answer
                </label>
                <textarea
                  id={`${question.id}-custom`}
                  value={customDrafts[question.id] ?? ""}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Describe your answer..."
                  rows={4}
                  className="field field-area mt-3 w-full"
                />
              </div>
            )}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" onClick={goBack} className="btn btn-outline">
            ← Back
          </button>
          <button
            type="button"
            onClick={() => goForward(false)}
            disabled={!currentAnswered}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            {index + 1 >= total ? "Complete interview" : "Continue"}
            <span aria-hidden="true" className="text-paper/80">→</span>
          </button>
          {index + 1 < total && (
            <button
              type="button"
              onClick={() => goForward(true)}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-mute transition-colors hover:text-ink"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
