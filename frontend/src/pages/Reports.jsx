import { useEffect, useState } from 'react'
import { getReports, getReport, generateReport, getScans } from '../api'
import { Spinner, PageHeader, StatusBadge } from '../components/ui'
import { FileText, Download, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'

export default function Reports() {
  const [reports, setReports] = useState([])
  const [scans, setScans] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedScanId, setSelectedScanId] = useState('')

  const loadData = async () => {
    try {
      const [rRes, sRes] = await Promise.all([getReports(), getScans()])
      setReports(rRes.data)
      setScans(sRes.data)
      if (rRes.data.length > 0 && !selectedReport) {
        const fullReport = await getReport(rRes.data[0].id)
        setSelectedReport(fullReport.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelectReport = async (id) => {
    try {
      const res = await getReport(id)
      setSelectedReport(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleGenerate = async () => {
    if (!selectedScanId) return
    setGenerating(true)
    try {
      await generateReport(selectedScanId)
      await loadData()
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const downloadJson = () => {
    if (!selectedReport) return
    const blob = new Blob([JSON.stringify(selectedReport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedReport.id || 'report'}.json`
    a.click()
  }

  if (loading) return <div className="p-8"><Spinner /></div>

  const content = selectedReport?.content || {}
  const summary = content.executive_summary || {}
  const roadmap = content.remediation_roadmap || []

  return (
    <div className="p-8">
      <PageHeader
        title="Security & Compliance Reports"
        subtitle="Automated executive security summaries and remediation roadmaps"
        action={
          <div className="flex items-center gap-3">
            <select
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
            >
              <option value="">Select Scan to Report</option>
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={!selectedScanId || generating}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Reports List */}
        <div className="col-span-4 card space-y-3">
          <h2 className="text-sm font-semibold text-gray-300 mb-2">Available Reports</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">No reports generated yet.</p>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelectReport(r.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedReport?.id === r.id
                    ? 'bg-indigo-600/15 border-indigo-500 text-white'
                    : 'bg-gray-800/40 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm flex items-center gap-2">
                    <FileText size={15} className="text-indigo-400" />
                    {r.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>ID: {r.id}</span>
                  <span>{new Date(r.generated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Preview */}
        <div className="col-span-8 card">
          {selectedReport ? (
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedReport.title}</h2>
                  <p className="text-xs text-gray-400">
                    Generated: {new Date(selectedReport.generated_at).toLocaleString()} | Scan ID: {selectedReport.scan_id}
                  </p>
                </div>
                <button
                  onClick={downloadJson}
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <Download size={14} /> Export JSON
                </button>
              </div>

              {/* Executive Summary Cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-gray-800/60 p-3 rounded-lg">
                  <p className="text-xs text-gray-400">Total Findings</p>
                  <p className="text-xl font-bold text-white mt-1">{summary.total_findings || 0}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  <p className="text-xs text-red-300">Critical Risks</p>
                  <p className="text-xl font-bold text-red-400 mt-1">{summary.critical || 0}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                  <p className="text-xs text-orange-300">High Risks</p>
                  <p className="text-xl font-bold text-orange-400 mt-1">{summary.high || 0}</p>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg">
                  <p className="text-xs text-indigo-300">Risk Assessment</p>
                  <p className="text-lg font-bold text-indigo-400 mt-1">{summary.risk_level || 'Normal'}</p>
                </div>
              </div>

              {/* Executive Recommendation */}
              <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-lg mb-6 flex gap-3">
                <ShieldCheck size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Executive Recommendation
                  </p>
                  <p className="text-sm text-gray-200">{summary.recommendation}</p>
                </div>
              </div>

              {/* Remediation Roadmap */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Remediation Roadmap</h3>
                <div className="space-y-3">
                  {roadmap.map((stage) => (
                    <div key={stage.priority} className="bg-gray-800/30 border border-gray-800 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-indigo-400">
                          Priority {stage.priority}: {stage.timeframe}
                        </span>
                        <span className="text-xs text-gray-500">{stage.items.length} items</span>
                      </div>
                      {stage.items.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">No actions in this timeframe</p>
                      ) : (
                        <ul className="list-disc list-inside text-xs text-gray-300 space-y-1">
                          {stage.items.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Select or generate a report to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

