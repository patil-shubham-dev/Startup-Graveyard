"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalysisState } from "./AnalysisState";
import { IdeaInput } from "./IdeaInput";
import { Questionnaire } from "./Questionnaire";
import { Report } from "./Report";
import type { PremortemQuestion, PremortemReport } from "@/lib/premortem/schemas";

type Stage = "idle" | "questions" | "questionnaire" | "analyzing" | "report";

interface PersistedState {
  stage: Stage;
  idea: string;
  questions: PremortemQuestion[] | null;
  answers: Record<string, string>;
  report: PremortemReport | null;
  shareToken: string | null;
  sessionId: string | null;
  groundedCases: number;
}

const STORAGE_KEY = "graveyard.premortem.v1";
const MIN_ANALYSIS_MS = 2400;

interface PreMortemClientProps {
  documentedCases: number;
}

function freshState(): PersistedState {
  return {
    stage: "idle",
    idea: "",
    questions: null,
    answers: {},
    report: null,
    shareToken: null,
    sessionId: null,
    groundedCases: 0,
  };
}

function readPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (typeof parsed !== "object" || parsed === null) return null;
    if (typeof parsed.idea !== "string" || typeof parsed.stage !== "string") return null;
    if (parsed.questions !== null && !Array.isArray(parsed.questions)) return null;
    if (parsed.report !== null && typeof parsed.report !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function PreMortemClient({ documentedCases }: PreMortemClientProps) {
  const [state, setState] = useState<PersistedState>(freshState);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);

  useEffect(() => {
    // Reading localStorage is only safe after mount; this is the documented
    // hydration pattern for client-only storage, not a cascading render.
    const saved = readPersisted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setState(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked — the session still works in memory.
    }
  }, [state, ready]);

  // Stable callback + content-bail: Questionnaire's sync effect fires on
  // the callback reference, so an inline arrow would re-render the parent
  // forever ("Maximum update depth exceeded").
  const handleAnswersChange = useCallback((answers: Record<string, string>) => {
    setState((s) => {
      const prev = s.answers;
      const prevKeys = Object.keys(prev);
      const keys = Object.keys(answers);
      if (prevKeys.length === keys.length && keys.every((k) => prev[k] === answers[k])) return s;
      return { ...s, answers };
    });
  }, []);

  const beginQuestions = useCallback(
    async (idea: string) => {      setError(null);
      setState((s) => ({ ...s, stage: "questions", idea }));
      try {
        const res = await fetch("/api/pre-mortem", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-guest-mode": "true" },
          body: JSON.stringify({ action: "GET_QUESTIONS", pitch: idea }),
        });
        if (res.status === 422) {
          const data = await res.json();
          setError({
            title: "TELL US A LITTLE MORE",
            detail: data.error ?? "Describe the idea in a few sentences.",
          });
          setState((s) => ({ ...s, stage: "idle" }));
          return;
        }
        if (res.status === 429) {
          setError({ title: "RATE LIMITED", detail: "Try again in a minute." });
          setState((s) => ({ ...s, stage: "idle" }));
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const code = data?.code;
          const title = code === "AI_OFFLINE"
            ? "AI SERVICE UNAVAILABLE"
            : code === "AI_RESPONSE_ERROR"
              ? "INVALID AI RESPONSE"
              : "SERVER ERROR";
          setError({ title, detail: data?.error ?? "The analysis could not start. Try again." });
          setState((s) => ({ ...s, stage: "idle" }));
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data.questions)) {
          setError({
            title: "INVALID AI RESPONSE",
            detail: "The engine returned an unusable response. Try again.",
          });
          setState((s) => ({ ...s, stage: "idle" }));
          return;
        }
        setState((s) => ({
          ...s,
          stage: "questionnaire",
          questions: data.questions,
          sessionId: data.sessionId ?? null,
          groundedCases: typeof data.groundedCases === "number" ? data.groundedCases : 0,
          answers: {},
          report: null,
        }));
      } catch {
        setError({
          title: "NETWORK ERROR",
          detail: "Could not reach the archive. Check your connection and try again.",
        });
        setState((s) => ({ ...s, stage: "idle" }));
      }
    },
    []
  );

  const beginReport = useCallback(
    async (answers: Record<string, string>) => {
      setError(null);
      setState((s) => ({ ...s, stage: "analyzing", answers }));
      const questions = state.questions ?? [];
      const payload = {
        action: "GET_REPORT",
        pitch: state.idea,
        questions: questions.map(({ id, question, category }) => ({ id, question, category })),
        answers,
        sessionId: state.sessionId ?? undefined,
      };
      try {
        const [res] = await Promise.all([
          fetch("/api/pre-mortem", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-guest-mode": "true" },
            body: JSON.stringify(payload),
          }),
          delay(MIN_ANALYSIS_MS),
        ]);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const code = data?.code;
          const title = code === "AI_OFFLINE"
            ? "AI SERVICE UNAVAILABLE"
            : code === "AI_RESPONSE_ERROR"
              ? "INVALID AI RESPONSE"
              : "SERVER ERROR";
          setError({ title, detail: data?.error ?? "The report could not be formed. Try again." });
          setState((s) => ({ ...s, stage: "questionnaire" }));
          return;
        }
        const data = await res.json();
        if (typeof data.risk_score !== "number") {
          setError({
            title: "INVALID AI RESPONSE",
            detail: "The engine returned an unusable report. Try again.",
          });
          setState((s) => ({ ...s, stage: "questionnaire" }));
          return;
        }
        setState((s) => ({
          ...s,
          stage: "report",
          report: data,
          shareToken: typeof data.shareToken === "string" ? data.shareToken : null,
        }));
      } catch {
        setError({
          title: "NETWORK ERROR",
          detail: "Could not reach the archive. Check your connection and try again.",
        });
        setState((s) => ({ ...s, stage: "questionnaire" }));
      }
    },
    [state.questions, state.idea, state.sessionId]
  );

  function resetAll() {
    setError(null);
    setState(freshState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures on reset.
    }
  }

  function refineIdea() {
    setError(null);
    setState((s) => ({ ...s, stage: "idle" }));
  }

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <p className="label-catalog">/ pre-mortem</p>
      <h1 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
        Pre-mortem Analysis
      </h1>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
        Tell us what you&apos;re building. We interrogate the idea against
        documented failure cases before you commit years to it.
      </p>

      <div className="mt-12 border-t border-line pt-10">
        {state.stage === "idle" && (
          <>
            <ol className="mb-8 flex flex-col gap-2 border-b border-line pb-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute sm:flex-row sm:items-center sm:gap-8">
              <li>
                <span className="font-semibold text-accent-deep">01</span> Tell us your idea
              </li>
              <li>
                <span className="font-semibold text-accent-deep">02</span> We ask what matters
              </li>
              <li>
                <span className="font-semibold text-accent-deep">03</span> We find where it could fail
              </li>
            </ol>
            <IdeaInput
              initialValue={state.idea}
              documentedCases={documentedCases}
              onContinue={(idea) => void beginQuestions(idea)}
            />
            {error && (
              <ErrorPanel title={error.title} detail={error.detail} onDismiss={() => setError(null)} />
            )}
          </>
        )}

        {state.stage === "questions" && (
          <div className="py-8" aria-live="polite">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Preparing the interview
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-mute">
              Cross-referencing your idea against the archive to compose the right questions…
            </p>
          </div>
        )}

        {state.stage === "questionnaire" && state.questions && (
          <>
            <Questionnaire
              questions={state.questions}
              initialAnswers={state.answers}
              onBackToIdea={refineIdea}
              onAnswersChange={handleAnswersChange}
              onComplete={(answers) => void beginReport(answers)}
            />
            {error && (
              <ErrorPanel title={error.title} detail={error.detail} onDismiss={() => setError(null)} />
            )}
          </>
        )}

        {state.stage === "analyzing" && (
          <>
            <AnalysisState idea={state.idea} />
            {error && (
              <ErrorPanel title={error.title} detail={error.detail} onDismiss={() => setError(null)} />
            )}
          </>
        )}

        {state.stage === "report" && state.report && (
          <Report
            idea={state.idea}
            report={state.report}
            shareToken={state.shareToken}
            groundedCases={state.groundedCases}
            documentedCases={documentedCases}
            onRestart={resetAll}
            onRefineIdea={refineIdea}
          />
        )}
      </div>
    </div>
  );
}

function ErrorPanel({
  title,
  detail,
  onDismiss,
}: {
  title: string;
  detail: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mt-6 border border-line bg-paper-2/60 px-5 py-4" role="alert">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-deep">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-mute">{detail}</p>
      <button onClick={onDismiss} className="btn btn-outline mt-4">
        Back
      </button>
    </div>
  );
}
