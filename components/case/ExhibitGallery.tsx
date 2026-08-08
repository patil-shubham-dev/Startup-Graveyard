import Image from "next/image"
import type { CaseStudy } from "@/lib/db/case-studies"

/**
 * Exhibit gallery for a case dossier: the archived specimen plates
 * (evidence_images on the record — product artifacts, place photographs,
 * or the engraved exhibit commissioned for the file). Renders nothing when
 * the record has no exhibits — empty galleries never show a shell.
 */
export function ExhibitGallery({ study }: { study: Pick<CaseStudy, "company_name" | "evidence_images"> }) {
  const images = (study.evidence_images || []).filter(Boolean)
  if (images.length === 0) return null

  return (
    <section>
      <p className="label-catalog flex items-center gap-2">
        <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
        Exhibit · {images.length} specimen{images.length > 1 ? "s" : ""}
      </p>
      <div className={`mt-6 grid gap-6 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
        {images.map((src, i) => (
          <figure key={src} className="border border-line">
            <div className={`relative overflow-hidden bg-paper-2 ${images.length === 1 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
              <Image
                src={src}
                alt={`Exhibit ${String(i + 1).padStart(2, "0")} — ${study.company_name}`}
                fill
                sizes={images.length === 1 ? "(max-width: 768px) 100vw, 768px" : "(max-width: 768px) 100vw, 50vw"}
                className="object-contain"
              />
            </div>
            <figcaption className="flex items-baseline justify-between border-t border-line px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                Exhibit {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-mute">
                {study.company_name}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}