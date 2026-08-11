import type { CSSProperties } from "react";
import styles from "./insights.module.css";

/**
 * Hand-drawn SVG linework ornaments — the copperplate register of the
 * intelligence report: hairlines, ticked rules, engraved diamonds and seals.
 * Pure inline SVG: crisp at any density, zero requests, in-world with the
 * raster engravings used elsewhere.
 */

const INK = "var(--color-ink)";
const MUTE = "var(--color-ink-mute)";
const LINE = "var(--color-line)";

interface StrokeStyle {
  stroke?: string;
  strokeWidth?: number;
}

function common(stroke: string, sw = 1): StrokeStyle {
  return { stroke, strokeWidth: sw };
}

/** Chapter rule: double hairline with an engraved diamond in the centre. */
export function ChapterRule({
  tone = "paper",
  className,
}: {
  tone?: "paper" | "paper2" | "well";
  className?: string;
}) {
  const stroke = tone === "well" ? "var(--color-well-line)" : LINE;
  const ink = tone === "well" ? "var(--color-well-mute)" : MUTE;
  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="26"
      viewBox="0 0 900 26"
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <line x1="0" y1="6" x2="900" y2="6" {...common(stroke)} />
      <line x1="0" y1="20" x2="900" y2="20" {...common(stroke)} />
      <line x1="430" y1="6" x2="470" y2="6" {...common(ink, 0.75)} />
      <rect x="442" y="6" width="16" height="14" fill="none" {...common(ink, 0.75)} />
      <rect x="446" y="9" width="8" height="8" fill="none" {...common(ink, 0.5)} transform="rotate(45 450 13)" />
      <line x1="450" y1="2" x2="450" y2="24" {...common(ink, 0.5)} />
    </svg>
  );
}

/** Small sealed-archive mark: radiating ticks around a framed square. */
export function Seal({
  tone = "paper",
  size = 64,
  className,
}: {
  tone?: "paper" | "well";
  size?: number;
  className?: string;
}) {
  const stroke = tone === "well" ? "var(--color-well-line)" : LINE;
  const ink = tone === "well" ? "var(--color-well-mute)" : MUTE;
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={{ display: "block" }}
    >
      <circle cx="32" cy="32" r="30" fill="none" {...common(stroke)} />
      <circle cx="32" cy="32" r="25" fill="none" {...common(stroke, 0.75)} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const r1 = 27;
        const r2 = 29;
        return (
          <line
            key={i}
            x1={32 + Math.cos(a) * r1}
            y1={32 + Math.sin(a) * r1}
            x2={32 + Math.cos(a) * r2}
            y2={32 + Math.sin(a) * r2}
            {...common(ink, 0.5)}
          />
        );
      })}
      <rect x="20" y="20" width="24" height="24" fill="none" {...common(ink)} />
      <rect x="24" y="24" width="16" height="16" fill="none" {...common(ink, 0.5)} />
      <line x1="32" y1="24" x2="32" y2="40" {...common(ink, 0.5)} />
    </svg>
  );
}

/** Figure label: mono FIG. NN mark used above plates. */
export function FigureLabel({ number, label }: { number: string; label: string }) {
  return (
    <p className={styles.figureLabel}>
      <span aria-hidden className={styles.figureTick} />
      <span>
        FIG. {number} · {label}
      </span>
    </p>
  );
}

/** Plate corner marks — engraved frame corners for the genome plate. */
export function PlateCorners({
  tone = "paper",
  className,
}: {
  tone?: "paper" | "paper2";
  className?: string;
}) {
  const stroke = tone === "paper" ? LINE : "var(--color-line)";
  const ink = tone === "paper" ? MUTE : MUTE;
  return (
    <svg
      aria-hidden
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <path d="M4 24 V4 H24" fill="none" {...common(stroke)} />
      <path d="M4 18 V4 H18" fill="none" {...common(ink, 0.5)} />
      <path d="M96 24 V4 H76" fill="none" {...common(stroke)} />
      <path d="M96 18 V4 H82" fill="none" {...common(ink, 0.5)} />
      <path d="M4 76 V96 H24" fill="none" {...common(stroke)} />
      <path d="M4 82 V96 H18" fill="none" {...common(ink, 0.5)} />
      <path d="M96 76 V96 H76" fill="none" {...common(stroke)} />
      <path d="M96 82 V96 H82" fill="none" {...common(ink, 0.5)} />
    </svg>
  );
}

/** Specimen mark: small double-frame with a square dot, for pattern plates. */
export function SpecimenMark({ number, className }: { number: string; className?: string }) {
  return (
    <span
      className={[styles.specimenMark, className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <svg width="34" height="34" viewBox="0 0 34 34" style={{ display: "block" }}>
        <rect x="1" y="1" width="32" height="32" fill="none" {...common(LINE)} />
        <rect x="4" y="4" width="26" height="26" fill="none" {...common(MUTE, 0.6)} />
        <rect x="12" y="12" width="10" height="10" {...common(INK, 0.75)} fill="none" />
      </svg>
      <span className={styles.specimenNumber}>{number}</span>
    </span>
  );
}

/** Monogram tile: engraved initial of a catalogue entry (industry register). */
export function Monogram({
  letter,
  tone = "paper",
  size = 56,
  className,
}: {
  letter: string;
  tone?: "paper" | "paper2";
  size?: number;
  className?: string;
}) {
  const stroke = tone === "paper" ? LINE : "var(--color-line)";
  const ink = tone === "paper" ? INK : "var(--color-ink)";
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox="0 0 56 56"
      style={{ display: "block" }}
    >
      <rect x="1" y="1" width="54" height="54" fill="none" {...common(stroke)} />
      <rect x="5" y="5" width="46" height="46" fill="none" {...common(stroke, 0.6)} />
      <text
        x="28"
        y="37"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="24"
        fontStyle="italic"
        fill={ink}
      >
        {letter.charAt(0).toUpperCase()}
      </text>
      <line x1="18" y1="8" x2="18" y2="12" {...common(ink, 0.5)} />
      <line x1="38" y1="8" x2="38" y2="12" {...common(ink, 0.5)} />
      <line x1="18" y1="44" x2="18" y2="48" {...common(ink, 0.5)} />
      <line x1="38" y1="44" x2="38" y2="48" {...common(ink, 0.5)} />
    </svg>
  );
}

/** Annotation stamp: small framed mono tag for research notes. */
export function AnnotationStamp({ label, tone = "paper" }: { label: string; tone?: "paper" | "well" }) {
  const stroke = tone === "well" ? "var(--color-well-line)" : LINE;
  const ink = tone === "well" ? "var(--color-well-mute)" : MUTE;
  const style: CSSProperties = {
    border: `1px solid ${stroke}`,
    color: ink,
  };
  return (
    <span className={styles.annotationStamp} style={style} aria-hidden>
      <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: "block" }}>
        <rect x="1" y="1" width="8" height="8" fill="none" {...common(ink, 0.6)} />
        <rect x="3.5" y="3.5" width="3" height="3" fill={ink as string} stroke="none" />
      </svg>
      {label}
    </span>
  );
}
