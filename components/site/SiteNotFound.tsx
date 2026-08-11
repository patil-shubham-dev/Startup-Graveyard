import Image from "next/image";
import Link from "next/link";

export function SiteNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 md:py-28">
      <div className="flex flex-col-reverse gap-12 md:flex-row md:items-start md:gap-16">
        <div className="min-w-0">
          <p className="label-catalog flex items-center gap-2">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-accent-deep" />
            Register · Not found
          </p>
          <h1 className="mt-4 font-serif text-4xl italic leading-snug text-ink sm:text-5xl">
            This grave is unmarked.
          </h1>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-mute">
            The page you followed doesn&apos;t exist. It may have been buried, or
            you may have followed a broken link.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              Return to the Graveyard
            </Link>
            <Link href="/explore" className="btn btn-outline">
              Browse the archive
            </Link>
          </div>
        </div>
        <div className="shrink-0 self-center md:self-start">
          <Image
            src="/grave-marker.webp"
            alt=""
            width={900}
            height={675}
            priority
            aria-hidden
            className="h-auto w-[min(56vw,300px)] mix-blend-multiply md:w-[280px]"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}