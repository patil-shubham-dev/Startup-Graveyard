"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ChartData {
  name?: string
  count: number
  year?: string
}

export function FailureReasonsChart({ data }: { data: ChartData[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={256}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={120} />
          <Tooltip />
          <Bar dataKey="count" fill="#A61C24" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TimelineChart({ data }: { data: ChartData[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#1A1714" barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
