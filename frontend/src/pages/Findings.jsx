import { useEffect, useState } from 'react'
import { getFindings, updateFinding } from '../api'
import { SeverityBadge, RiskScore, StatusBadge, Spinner, PageHeader } from '../components/ui'

const SEV_FILTERS = ['all', 'critical', 'high', 'medium', 'low']
const STATUS_FILTERS = ['all', 'open', 'in_review', 'resolved']

export default function Findings() {
  const [findings, setFindings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [sevFilter, setSev]     = useState('all')
  const [statusFilter, setStatus] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = () => {
    const params = {}
    if (sevFilter !== 'all') params.severity = sevFilter
    if (statusFilter !== 'all') params.status = statusFilter
    getFindings(params).then(r => { setFindings(r.data); setLoading(false) })
  }

  useEffect(() => { load() }, [sevFilter, statusFilter])

  const markStatus = async (id, status) => {
    await updateFinding(id, { status })
    load()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  if (loading) return <div className="p-8"><Spinner /></div>

  return (
    <div className="p-8">
      <PageHeader
        title="Vulnerability Findings"
        subtitle={`${findings.length} findings matching filters`}
      />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {SEV_FILTERS.map(f => (
            <button key={f}
              onClick={() => setSev(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                sevFilter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {STATUS_FILTERS.map(f => (
            <button key={f}
              onClick={() => setStatus(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                statusFilter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}>{f.replace('_', ' ')}</button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800 text-left text-xs uppercase tracking-wide">
                <th className="pb-3 font-medium">Finding</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">AI Risk</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {findings.map(f => (
                <tr
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`cursor-pointer transition-colors ${
                    selected?.id === f.id ? 'bg-indigo-600/10' : 'hover:bg-gray-800/40'
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-white">{f.title}</td>
                  <td className="py-3 pr-4"><SeverityBadge severity={f.severity} /></td>
                  <td className="py-3 pr-4"><RiskScore score={f.ai_risk_score} /></td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{f.category}</td>
                  <td className="py-3"><StatusBadge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-80 card shrink-0 h-fit">
            <h3 className="font-bold text-white mb-1">{selected.title}</h3>
            <div className="flex gap-2 mb-4">
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-300">{selected.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Affected Asset</p>
                <p className="font-mono text-indigo-400 text-xs">{selected.affected_asset}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">AI Risk Score</p>
                <RiskScore score={selected.ai_risk_score} />
                <span className="text-gray-500 text-xs ml-2">(CVSS: {selected.cvss_score})</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                <p className="text-gray-300 text-xs">{selected.recommendation}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary flex-1 text-xs py-1.5"
                onClick={() => markStatus(selected.id, 'in_review')}>
                In Review
              </button>
              <button className="btn-primary flex-1 text-xs py-1.5"
                onClick={() => markStatus(selected.id, 'resolved')}>
                Resolve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

