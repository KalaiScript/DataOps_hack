import { useEffect, useState } from 'react'
import { getScans, createScan } from '../api'
import { StatusBadge, Spinner, PageHeader } from '../components/ui'
import { Plus, Target, Clock } from 'lucide-react'

export default function Scans() {
  const [scans, setScans]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', target: '', scan_type: 'web' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => getScans().then(r => { setScans(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    await createScan(form)
    setShowForm(false)
    setForm({ name: '', target: '', scan_type: 'web' })
    setSubmitting(false)
    setTimeout(load, 500)
  }

  if (loading) return <div className="p-8"><Spinner /></div>

  return (
    <div className="p-8">
      <PageHeader
        title="Security Scans"
        subtitle={`${scans.length} scans total`}
        action={
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus size={14} /> New Scan
          </button>
        }
      />

      {/* New Scan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[480px]">
            <h2 className="text-lg font-bold mb-4">Start New Scan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Scan Name</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Target (URL / IP / CIDR)</label>
                <input className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  placeholder="https://example.com or 192.168.1.0/24"
                  value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Scan Type</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                  value={form.scan_type} onChange={e => setForm({ ...form, scan_type: e.target.value })}>
                  <option value="web">Web Application</option>
                  <option value="network">Network</option>
                  <option value="api">API</option>
                  <option value="full">Full Assessment</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Starting...' : 'Start Scan'}
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scans Grid */}
      <div className="grid grid-cols-1 gap-4">
        {scans.map(scan => (
          <div key={scan.id} className="card flex items-center gap-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Target size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white">{scan.name}</p>
                <StatusBadge status={scan.status} />
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{scan.target}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{scan.scan_type}</p>
              <p className="text-sm text-white font-bold">{scan.findings_count} findings</p>
              {scan.risk_score > 0 && (
                <p className={`text-xs font-semibold ${
                  scan.risk_score >= 7 ? 'text-red-400' :
                  scan.risk_score >= 4 ? 'text-yellow-400' : 'text-green-400'
                }`}>Risk: {scan.risk_score}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500 shrink-0 flex items-center gap-1">
              <Clock size={11} />
              {new Date(scan.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

