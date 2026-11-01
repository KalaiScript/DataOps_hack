import { useEffect, useState } from 'react'
import { getRiskSummary } from '../api'
import { RiskScore, SeverityBadge, Spinner, PageHeader } from '../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

export default function RiskAnalysis() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getRiskSummary().then(r => setData(r.data))
  }, [])

  if (!data) return <div className="p-8"><Spinner /></div>

  const radarData = data.by_category.map(c => ({
    category: c.category,
    risk: +c.avg_score.toFixed(2)
  }))

  return (
    <div className="p-8">
      <PageHeader
        title="AI Risk Analysis"
        subtitle="Machine-scored risk prioritization across all findings"
      />

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Severity Breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Risk by Severity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.by_severity}>
              <XAxis dataKey="severity" tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
              <Bar dataKey="avg_score" name="Avg AI Risk" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Radar */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Risk by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar name="Risk" dataKey="risk" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prioritized Findings */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">
          🎯 Top Prioritized Findings (AI-Ranked)
        </h2>
        <div className="space-y-3">
          {data.prioritized_findings.map((f, i) => (
            <div key={f.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{f.title}</p>
                <p className="text-xs text-gray-400 font-mono">{f.affected_asset}</p>
              </div>
              <SeverityBadge severity={f.severity} />
              <div className="text-right">
                <RiskScore score={f.ai_risk_score} />
                <p className="text-xs text-gray-500">AI Score</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Table */}
      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Category Risk Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800 text-left text-xs uppercase">
              <th className="pb-2 font-medium">Category</th>
              <th className="pb-2 font-medium">Findings</th>
              <th className="pb-2 font-medium">Avg AI Risk</th>
              <th className="pb-2 font-medium">Risk Bar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {data.by_category.map(c => (
              <tr key={c.category} className="text-gray-300">
                <td className="py-3 font-medium">{c.category}</td>
                <td className="py-3 text-gray-400">{c.count}</td>
                <td className="py-3"><RiskScore score={+c.avg_score.toFixed(2)} /></td>
                <td className="py-3 w-40">
                  <div className="h-2 rounded-full bg-gray-800">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${(c.avg_score / 10) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

