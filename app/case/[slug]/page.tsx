import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { CaseStudy } from "@/lib/db/case-studies"
import { formatCurrencyCompact } from "@/lib/utils"
import fs from "fs"
import path from "path"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"

interface PageProps {
  params: Promise<{ slug: string }>
}

function getCase(slug: string): CaseStudy | null {
  try {
    const fp = path.join(process.cwd(), "data", "case-studies", `${slug}.json`)
    if (!fs.existsSync(fp)) return null
    const d = JSON.parse(fs.readFileSync(fp, "utf-8"))
    return d.published ? d : null
  } catch { return null }
}

function getAllCases(): CaseStudy[] {
  const dir = path.join(process.cwd(), "data", "case-studies")
  try {
    return fs.readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")))
      .filter((c) => c.published)
  } catch { return [] }
}

function formatCurrency(value: number): string {
  if (!value) return "N/A"
  return formatCurrencyCompact(value)
}

function RiskBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <span>{label}</span>
      <span>{score}%</span>
    </div>
  )
}

function extractContent(mdx: string): string {
  const match = mdx.match(/```mdx\n([\s\S]*?)```/)
  return match ? match[1].trim() : mdx.trim()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const c = getCase(slug)
  if (!c) return { title: "Case Not Found" }
  return { title: c.company_name, description: c.summary }
}

export default async function CasePage({ params }: PageProps) {
  const { slug } = await params
  const c = getCase(slug)
  if (!c) notFound()

  const allCases = getAllCases()
  const related = allCases
    .filter((x) => x.slug !== slug && (x.industry === c.industry || x.failure_reasons?.some((r) => c.failure_reasons?.includes(r))))
    .slice(0, 3)

  const lifespan = c.founded_year && c.shutdown_year ? c.shutdown_year - c.founded_year : null
  const rawContent = c.content ? extractContent(c.content) : ""
  const cAny = c as unknown as { investors?: string[]; founders?: string[] }

  return (
    <main>
      <div>
        <Link href="/explore">Back to archive</Link>
      </div>

      <section>
        <p>
          {c.industry || "General"}
          {c.shutdown_year && <span>{c.shutdown_year}</span>}
          <span>{c.case_number}</span>
        </p>
        <h1>{c.company_name}</h1>
        <p>{c.summary}</p>
      </section>

      <section>
        <p>Case File</p>
        <div>
          {c.founded_year && (
            <div>
              <p>Founded</p>
              <p>{c.founded_year}</p>
            </div>
          )}
          {c.shutdown_year && (
            <div>
              <p>Shutdown</p>
              <p>{c.shutdown_year}</p>
            </div>
          )}
          {lifespan && (
            <div>
              <p>Lifespan</p>
              <p>{lifespan} years</p>
            </div>
          )}
          {c.funding_raised && (
            <div>
              <p>Funding Raised</p>
              <p>{formatCurrency(c.funding_raised)}</p>
            </div>
          )}
        </div>
      </section>

      {c.risk_scores && Object.keys(c.risk_scores).length > 0 && (
        <section>
          <p>Risk Assessment</p>
          <div>
            {Object.entries(c.risk_scores).map(([key, score]) => (
              <RiskBar key={key} label={key} score={score as number} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div>
          <p>Failure Reasons</p>
          <ul>
            {(c.failure_reasons || []).map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <p>Lessons</p>
          <ul>
            {(c.lessons || []).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>

      {rawContent && (
        <section>
          <p>Narrative</p>
          <div>
            <MDXRemote source={rawContent} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
          </div>
        </section>
      )}

      {(c.tags || []).length > 0 && (
        <section>
          <p>Tags</p>
          <div>
            {(c.tags || []).map((t) => <span key={t}>{t}</span>)}
          </div>
        </section>
      )}

      {(cAny.investors || cAny.founders) && (
        <section>
          <div>
            {cAny.investors && (
              <div>
                <p>Investors</p>
                <div>
                  {cAny.investors.map((i) => <span key={i}>{i}</span>)}
                </div>
              </div>
            )}
            {cAny.founders && (
              <div>
                <p>Founders</p>
                <div>
                  {cAny.founders.map((f) => <span key={f}>{f}</span>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {c.metrics && (
        <section>
          <p>Metrics</p>
          <div>
            {Object.entries(c.metrics as Record<string, string>).map(([key, val]) => (
              <div key={key}>
                <p>{key.replace(/_/g, " ")}</p>
                <p>{String(val)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <p>Related</p>
          <h2>Similar failures</h2>
          <ul>
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/case/${r.slug}`}>
                  <span>{r.industry || "General"}</span>
                  {r.shutdown_year && <span>{r.shutdown_year}</span>}
                  <span>{r.company_name}</span>
                  <span>{r.summary}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Want to learn more?</h3>
        <p>Ask Graveyard Intelligence about this case or compare it to others.</p>
        <Link href="/ask">Ask AI</Link>
      </section>
    </main>
  )
}
