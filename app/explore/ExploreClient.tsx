"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { CaseStudy } from "@/lib/db/case-studies"

interface ExploreClientProps {
  initialCases: CaseStudy[]
  initialSearch?: string
}

const INDUSTRIES = [
  "Food Technology",
  "Transportation",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "Hardware",
  "AI",
  "Real Estate",
]

const FAILURE_REASONS = [
  "Cash Exhaustion",
  "No Market Need",
  "High Operational Costs",
  "Lack of Traction",
  "Regulatory Issues",
  "Competition",
  "Scaling Issues",
  "Product Issues",
]

export function ExploreClient({ initialCases, initialSearch = "" }: ExploreClientProps) {
  const [search, setSearch] = useState(initialSearch)
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)
  const [selectedFailType, setSelectedFailType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return initialCases.filter((c) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !c.company_name?.toLowerCase().includes(q) &&
          !c.summary?.toLowerCase().includes(q) &&
          !c.industry?.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (selectedIndustry && c.industry !== selectedIndustry) return false
      if (selectedFailType && !(c.failure_reasons || []).includes(selectedFailType))
        return false
      return true
    })
  }, [initialCases, search, selectedIndustry, selectedFailType])

  return (
    <div>
      <p>Archive</p>
      <h1>Explore case studies</h1>
      <p>
        {initialCases.length} documented failures. Filter by industry, failure
        type, or search.
      </p>

      <div>
        <input
          type="text"
          placeholder="Search by company, industry, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setShowFilters(!showFilters)}>
          Filters
        </button>
      </div>

      {showFilters && (
        <div>
          <div>
            <p>Industry</p>
            {selectedIndustry && (
              <button onClick={() => setSelectedIndustry(null)}>Clear</button>
            )}
          </div>
          <div>
            {INDUSTRIES.map((ind) => (
              <button
                key={ind}
                onClick={() =>
                  setSelectedIndustry(selectedIndustry === ind ? null : ind)
                }
              >
                {ind}
              </button>
            ))}
          </div>

          <div>
            <p>Failure Type</p>
            {selectedFailType && (
              <button onClick={() => setSelectedFailType(null)}>Clear</button>
            )}
          </div>
          <div>
            {FAILURE_REASONS.map((fr) => (
              <button
                key={fr}
                onClick={() =>
                  setSelectedFailType(selectedFailType === fr ? null : fr)
                }
              >
                {fr}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p>No cases match your criteria.</p>
      ) : (
        <ul>
          {filtered.map((c) => (
            <li key={c.slug}>
              <Link href={`/case/${c.slug}`}>
                <span>{c.industry || "General"}</span>
                {c.shutdown_year && <span>{c.shutdown_year}</span>}
                <span>{c.company_name}</span>
                <span>{c.summary}</span>
                {(c.failure_reasons || []).slice(0, 2).map((r) => (
                  <span key={r}>{r}</span>
                ))}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
