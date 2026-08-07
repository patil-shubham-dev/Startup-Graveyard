import Link from "next/link";
import Image from "next/image";

const NAV = [
  { href: "/explore", label: "Archive" },
  { href: "/insights", label: "Insights" },
  { href: "/pre-mortem", label: "Pre-mortem" },
  { href: "/ask", label: "Ask" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-ink"
        >
          <Image
            src="/mark.png"
            alt=""
            width="20"
            height="20"
            className="h-5 w-5"
            aria-hidden="true"
          />
          Start-up Graveyard
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-nav pb-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-mute transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="md:hidden">
          <details className="group relative">
            <summary
              aria-label="Open navigation"
              className="flex h-9 cursor-pointer list-none items-center rounded-[2px] border border-line px-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink [&::-webkit-details-marker]:hidden"
            >
              Menu
              <svg
                className="ml-2 h-3.5 w-3.5 text-ink-mute transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="absolute right-0 top-11 w-48 rounded-[2px] border border-line bg-paper py-2 shadow-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-mute transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
        <Link
          href="/auth"
          className="inline-flex h-9 items-center rounded-[2px] bg-ink px-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-accent-deep"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
