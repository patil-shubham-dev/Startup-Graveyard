"use client";

import { useEffect, useState } from "react";

interface AnalysisStateProps {
  idea: string;
}

const STAGES = [
  "Cross-referencing the archive",
  "Assessing risk signals",
  "Forming the pre-mortem",
];

const STAGE_DURATION_MS = 1100;

/**
 * STEP 04 — the forensic analysis state. Each stage corresponds to a real
 * phase of the report job (retrieval → assessment → report formation).
 * The sequence is timed to the actual request so it reads as deliberate,
 * not theatrical.
 */
export function AnalysisState({ idea }: AnalysisStateProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      STAGE_DURATION_MS
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div aria-live="polite" role="status">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        / pre-mortem · analyzing
      </p>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Analyzing your idea
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-mute">
        “{idea.length > 140 ? `${idea.slice(0, 140)}…` : idea}”
      </p>

      <ol className="mt-10">
        {STAGES.map((label, i) => {
          const active = i === stage;
          const done = i < stage;
          return (
            <li
              key={label}
              className={`flex items-baseline gap-5 border-t border-line py-4 transition-opacity duration-300 ${
                done ? "opacity-100" : active ? "opacity-100" : "opacity-40"
              }`}
            >
              <span className="font-mono text-[10px] tabular-nums text-ink-mute">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-3 text-[15px] leading-relaxed text-ink-mute">
                {label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="inline-block h-[3px] w-6 bg-accent-deep motion-safe:animate-pulse"
                  />
                )}
                {done && <span aria-hidden="true" className="text-accent-deep">✓</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
