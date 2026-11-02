import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCases } from '../api';
import { 
  PageHeader, 
  SeverityBadge, 
  ConfidenceBadge, 
  RiskScore, 
  Spinner 
} from '../components/ui';
import { 
  ScanSearch, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  FileCheck2, 
  ShieldAlert, 
  Binary, 
  CornerDownRight, 
  CheckCircle,
  Crosshair,
  Contrast,
  Flame,
  GitMerge,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Findings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedCaseId = searchParams.get('case');

  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState(null);
  const [activeTab, setActiveTab] = useState('anomalies'); // 'anomalies' | 'ocr'

  // Canvas View Modes
  const [zoom, setZoom] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showElaHeatmap, setShowElaHeatmap] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getCases();
        setCases(res.data);
        if (res.data.length > 0) {
          const matched = res.data.find(c => c.id === requestedCaseId);
          setSelectedCaseId(matched ? matched.id : res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestedCaseId]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const activeDoc = activeCase?.documents?.[selectedDocIndex] || activeCase?.documents?.[0];

  const handleSelectAnomaly = (id) => {
    setSelectedAnomalyId(id);
    setShowBoundingBoxes(true);
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Visual Evidence Canvas & Forensic Inspector"
        subtitle="Pixel-level Error Level Analysis (ELA), glyph metric variance, and field-level coordinate mapping"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Target Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                setSelectedDocIndex(0);
                setSelectedAnomalyId(null);
              }}
              className="bg-gray-900 border border-gray-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} ({c.applicant_name})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Document Selector Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-gray-900/70 border border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          {activeCase?.documents?.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDocIndex(idx);
                setSelectedAnomalyId(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedDocIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{doc.name}</span>
              {(doc.visual_anomalies?.length || 0) > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px]">
                  {doc.visual_anomalies.length} Alert
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                  Clean
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Forensic View Layer Controls */}
        <div className="flex items-center gap-2">
          {/* ELA Heatmap Toggle */}
          <button
            onClick={() => setShowElaHeatmap(!showElaHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showElaHeatmap
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
            title="Toggle Error Level Analysis (ELA) heatmap to inspect compression differences"
          >
            <Flame size={14} className={showElaHeatmap ? "text-yellow-300" : "text-purple-400"} />
            <span>ELA Heatmap</span>
          </button>

          {/* Bounding Box Toggle */}
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showBoundingBoxes
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
          >
            <Crosshair size={14} />
            <span>Bounding Boxes</span>
          </button>

          {/* High Contrast / Invert */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              highContrast ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
            }`}
            title="Invert & enhance micro-contrast"
          >
            <Contrast size={15} />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setZoom(Math.max(0.7, zoom - 0.15))}
              className="p-1 text-gray-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-mono px-2 text-gray-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(1.6, zoom + 0.15))}
              className="p-1 text-gray-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace: Left Document Canvas, Right Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Forensic Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
            <span>CANVAS WORKBENCH // {activeDoc?.type}</span>
            <span className="text-[11px] text-gray-500">SHA-256: {activeDoc?.hash_sha256?.substring(0, 16)}...</span>
          </div>

          {/* Interactive Document Render Viewer */}
          <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden min-h-[580px] flex items-center justify-center p-6 shadow-2xl">
            {/* Zoom Wrapper */}
            <div 
              style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              className={`transition-transform duration-150 ${highContrast ? 'filter contrast-200 invert' : ''}`}
            >
              {/* Document Simulator Container */}
              <div className="relative w-[520px] bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-300 p-8 select-none font-sans overflow-hidden">
                {/* Visual Tamper Heatmap Overlay when ELA active */}
                {showElaHeatmap && (
                  <div className="absolute inset-0 bg-purple-950/60 pointer-events-none mix-blend-color-burn z-20 flex flex-col justify-between p-4">
                    <div className="bg-purple-900/90 text-purple-200 text-[10px] font-mono px-2.5 py-1 rounded inline-block self-start border border-purple-500 shadow">
                      ELA COMPRESSION ANALYSIS: RESIDUAL ARTIFACT GRADIENTS DETECTED
                    </div>
                    <div className="text-[10px] font-mono text-purple-300 self-end bg-purple-900/80 px-2 py-0.5 rounded">
                      High Noise Variance Zone: BBOX [closing balance / DOB]
                    </div>
                  </div>
                )}

                {/* Document Specific Layout Renderers */}
                {activeDoc?.type?.includes("Loan") && (
                  <div className="space-y-4 text-xs">
                    {/* Header */}
                    <div className="border-b-2 border-gray-900 pb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-black tracking-wider text-gray-900 uppercase">
                          First Horizon Financial Corp
                        </h2>
                        <p className="text-[10px] text-gray-600">Official Commercial Loan Application Form (Rev 2026)</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 font-bold">
                        FORM-COMM-44
                      </span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">Applicant Name</span>
                        <span className="font-semibold text-gray-900">Robert Michael Sterling</span>
                      </div>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">Date of Birth</span>
                        <span className="font-semibold text-gray-900">12/08/1985</span>
                      </div>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">National ID / PAN</span>
                        <span className="font-mono font-semibold text-gray-900">STRL-88219-K</span>
                      </div>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">Declared Monthly Income</span>
                        <span className="font-mono font-bold text-indigo-700">$14,500.00</span>
                      </div>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50 col-span-2">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">Employer / Business</span>
                        <span className="font-medium text-gray-900">Sterling Logistics LLC</span>
                      </div>
                      <div className="p-2 border border-gray-300 rounded bg-gray-50/50 col-span-2">
                        <span className="text-[9px] text-gray-500 uppercase block font-semibold">Residential Address</span>
                        <span className="text-gray-900">742 Evergreen Terrace, Sector 4</span>
                      </div>
                    </div>

                    {/* Financial Request Box */}
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between mt-3">
                      <div>
                        <span className="text-[9px] text-indigo-600 uppercase font-bold block">Facility Requested</span>
                        <span className="text-xs font-bold text-gray-900">Secured Working Capital</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-indigo-600 uppercase font-bold block">Principal Sum</span>
                        <span className="text-sm font-black text-indigo-900 font-mono">$250,000.00</span>
                      </div>
                    </div>

                    {/* Signature Block with Cloned Tag */}
                    <div className="pt-4 mt-4 border-t border-gray-300 flex items-center justify-between">
                      <div className="text-[10px] text-gray-500 max-w-[200px]">
                        I certify under penalty of perjury that all declarations in this form are accurate.
                      </div>
                      <div className="relative border-2 border-dashed border-gray-400 p-2 rounded w-44 text-center bg-gray-50">
                        <span className="text-[8px] text-gray-400 block mb-1">APPLICANT SIGNATURE</span>
                        <div className="font-serif italic text-base text-blue-900 tracking-wider">
                          Robert M. Sterling
                        </div>
                        {/* Cut-and-paste bounding box indicator */}
                        {showBoundingBoxes && (
                          <div className={`absolute -inset-1 border-2 ${selectedAnomalyId === 'VIS-001' ? 'border-red-600 bg-red-500/20' : 'border-orange-500 bg-orange-500/10'} rounded pointer-events-none animate-pulse`}>
                            <span className="absolute -top-3.5 right-1 bg-red-600 text-white text-[8px] font-bold px-1 rounded">
                              CLONED SIGNATURE (99.8%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeDoc?.type?.includes("Bank") && (
                  <div className="space-y-4 text-xs font-sans">
                    {/* Bank Header */}
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-blue-700 flex items-center justify-center text-white font-black text-xs">
                          AB
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-blue-900">APEX REGIONAL BANK</h2>
                          <p className="text-[9px] text-gray-500">Official Consolidated Account Statement</p>
                        </div>
                      </div>
                      <div className="text-right text-[10px] font-mono text-gray-600">
                        <div>PERIOD: Q3 2026</div>
                        <div>BRANCH: NYC-009</div>
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 p-2.5 rounded border">
                      <div>
                        <span className="text-[9px] text-gray-500 block">ACCOUNT TITLE</span>
                        <span className="font-bold text-gray-900">Robert M. Sterling</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 block">ACCOUNT NUMBER</span>
                        <span className="font-mono text-gray-800">9842-1049-5501</span>
                      </div>
                    </div>

                    {/* Statement Financial Metrics */}
                    <table className="w-full text-left border-collapse text-[11px] mt-2">
                      <thead>
                        <tr className="border-b text-[9px] text-gray-500 uppercase">
                          <th className="py-1">Quarter Ledger Metric</th>
                          <th className="py-1 text-right">Amount (USD)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-1.5 text-gray-700">Opening Balance (01/07/2026)</td>
                          <td className="py-1.5 text-right font-mono">$12,410.50</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-gray-700">Total Deposits (Salary Credits)</td>
                          <td className="py-1.5 text-right font-mono text-emerald-700">+$11,500.00</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-gray-700">Total Debits & Withdrawals</td>
                          <td className="py-1.5 text-right font-mono text-red-700">-$9,840.20</td>
                        </tr>
                        <tr className="font-bold bg-amber-50/60 relative">
                          <td className="py-2 text-gray-900">Reported Closing Balance</td>
                          <td className="py-2 text-right relative">
                            <span className="font-black text-sm text-gray-900 font-sans tracking-tight">
                              $94,200.30
                            </span>
                            {/* Font Splicing Anomaly Box */}
                            {showBoundingBoxes && (
                              <div className={`absolute -inset-1 border-2 ${selectedAnomalyId === 'VIS-002' ? 'border-red-600 bg-red-500/20' : 'border-red-500 bg-red-500/10'} rounded pointer-events-none`}>
                                <span className="absolute -top-3.5 right-0 bg-red-600 text-white text-[8px] font-bold px-1 rounded">
                                  FONT SPLICING (+DELTA $80,130)
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="p-2.5 rounded bg-red-50 border border-red-200 text-[10px] text-red-800 space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Automated Math Reconciliation Failed:
                      </div>
                      <div>
                        Calculated Balance: 12,410.50 + 11,500.00 - 9,840.20 = <strong>$14,070.30</strong>
                      </div>
                      <div className="font-semibold text-red-900">
                        Discrepancy: +$80,130.00 artificial inflation detected.
                      </div>
                    </div>
                  </div>
                )}

                {activeDoc?.type?.includes("Identity") && (
                  <div className="space-y-4 text-xs font-sans">
                    {/* ID Card Simulation */}
                    <div className="border-2 border-emerald-800 rounded-xl p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 shadow-inner">
                      <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-700 flex items-center justify-center text-white text-[9px] font-bold">
                            NR
                          </div>
                          <span className="text-[10px] font-black tracking-widest text-emerald-950 uppercase">
                            National Identity Authority
                          </span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-emerald-800">CITIZEN CARD</span>
                      </div>

                      <div className="flex items-start gap-4">
                        {/* Portrait */}
                        <div className="relative w-24 h-28 bg-gray-300 rounded border border-gray-400 overflow-hidden shrink-0 flex items-center justify-center">
                          <div className="w-full h-full bg-slate-400 flex flex-col items-center justify-center text-gray-700">
                            <div className="w-10 h-10 rounded-full bg-slate-500 mb-1" />
                            <div className="w-16 h-8 rounded-t-xl bg-slate-600" />
                          </div>
                          {showBoundingBoxes && (
                            <div className="absolute inset-0 border-2 border-orange-500 bg-orange-500/10 rounded pointer-events-none">
                              <span className="absolute -top-3 left-0 bg-orange-600 text-white text-[7px] font-bold px-1 rounded">
                                RESAMPLED PHOTO
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Cardholder Details */}
                        <div className="space-y-1.5 flex-1 text-[11px]">
                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">Full Name</span>
                            <span className="font-bold text-gray-900">Robert Michael Sterling</span>
                          </div>

                          <div className="relative">
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">Date of Birth</span>
                            <span className="font-mono font-bold text-gray-900 text-xs">
                              12/08/<span className="text-red-700 underline font-black">1985</span>
                            </span>
                            {showBoundingBoxes && (
                              <div className={`absolute -inset-1 border-2 ${selectedAnomalyId === 'VIS-004' ? 'border-red-600 bg-red-500/20' : 'border-red-500 bg-red-500/10'} rounded pointer-events-none`}>
                                <span className="absolute -top-3.5 right-0 bg-red-600 text-white text-[7px] font-bold px-1 rounded">
                                  OVERWRITTEN GLYPH (1995 → 1985)
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">ID Number</span>
                            <span className="font-mono font-bold text-emerald-900">STRL-88219-K</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block uppercase font-bold">Expiry Date</span>
                            <span className="font-mono text-gray-700">15/12/2031</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback for other document types */}
                {!activeDoc?.type?.includes("Loan") && !activeDoc?.type?.includes("Bank") && !activeDoc?.type?.includes("Identity") && (
                  <div className="space-y-4 text-xs font-sans p-4">
                    <div className="border-b pb-2">
                      <h2 className="text-sm font-bold text-gray-900 uppercase">{activeDoc?.type}</h2>
                      <p className="text-[10px] text-gray-500">{activeDoc?.classification}</p>
                    </div>
                    <div className="space-y-2">
                      {activeDoc?.extracted_fields?.map((f, i) => (
                        <div key={i} className="flex justify-between border-b pb-1">
                          <span className="text-gray-600">{f.field}:</span>
                          <span className="font-semibold text-gray-900">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Document Navigation & Pager Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900 border border-gray-800 text-xs shadow-lg">
            <button
              onClick={() => {
                if (selectedDocIndex > 0) {
                  setSelectedDocIndex(selectedDocIndex - 1);
                  setSelectedAnomalyId(null);
                }
              }}
              disabled={selectedDocIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-medium transition cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous Document
            </button>
            <div className="text-center font-mono text-gray-400">
              <span className="text-white font-bold">{activeDoc?.name}</span>
              <span className="text-[11px] text-gray-500 block">({selectedDocIndex + 1} of {activeCase?.documents?.length || 1})</span>
            </div>
            <button
              onClick={() => {
                if (selectedDocIndex < (activeCase?.documents?.length || 1) - 1) {
                  setSelectedDocIndex(selectedDocIndex + 1);
                  setSelectedAnomalyId(null);
                }
              }}
              disabled={selectedDocIndex >= (activeCase?.documents?.length || 1) - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-300 font-medium transition cursor-pointer"
            >
              Next Document <ChevronRight size={14} />
            </button>
          </div>

          {/* Forward Investigation Shortcuts */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/correlation?case=${selectedCaseId}`)}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow transition"
            >
              <GitMerge size={14} /> Inspect Cross-Doc Correlation Matrix <ArrowRight size={13} />
            </button>
            <button
              onClick={() => navigate(`/dossier?case=${selectedCaseId}`)}
              className="py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            >
              Legal Dossier
            </button>
          </div>
        </div>

        {/* Right: Forensic Deep Inspector & Extraction Drawer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub-Tabs: Forensic Anomalies vs Extracted OCR Fields */}
          <div className="flex rounded-xl bg-gray-900 p-1 border border-gray-800">
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'anomalies'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert size={14} />
              Forensic Anomalies ({activeDoc?.visual_anomalies?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('ocr')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ocr'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Binary size={14} />
              Extracted OCR Fields ({activeDoc?.extracted_fields?.length || 0})
            </button>
          </div>

          {/* Tab 1: Forensic Anomalies List */}
          {activeTab === 'anomalies' && (
            <div className="space-y-3">
              {(activeDoc?.visual_anomalies?.length || 0) === 0 ? (
                <div className="p-8 rounded-xl bg-gray-900/60 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle size={28} className="text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Clean Document Integrity</h4>
                  <p className="text-xs text-gray-400">
                    No pixel alterations, spliced fonts, or signature tampering detected on this record.
                  </p>
                </div>
              ) : (
                activeDoc.visual_anomalies.map((anom) => {
                  const isSelected = selectedAnomalyId === anom.id;
                  return (
                    <div
                      key={anom.id}
                      onClick={() => handleSelectAnomaly(anom.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-red-950/40 border-red-500 shadow-lg shadow-red-500/10'
                          : 'bg-gray-900/70 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-gray-400">{anom.id}</span>
                          <SeverityBadge severity={anom.severity} />
                        </div>
                        <ConfidenceBadge confidence={anom.confidence} />
                      </div>

                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-red-400" />
                        {anom.title}
                      </h4>

                      <p className="text-xs text-gray-300 leading-relaxed">
                        {anom.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px] space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block font-mono">
                          Forensic Evidence (Optical / CV):
                        </span>
                        <p className="text-gray-400 italic">
                          "{anom.evidence}"
                        </p>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Category: <strong className="text-gray-200">{anom.category}</strong></span>
                        <span className="text-indigo-400 font-medium flex items-center gap-1">
                          Spotlight Region <CornerDownRight size={11} />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Structured Extracted OCR Tokens */}
          {activeTab === 'ocr' && (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
                <span>Extracted Key-Value Pair</span>
                <span>Confidence & Bounding Box</span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {activeDoc?.extracted_fields?.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center justify-between text-xs gap-3">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">{f.field}</span>
                      <span className="font-semibold text-white">{f.value}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <ConfidenceBadge confidence={f.confidence} />
                      <span className="block text-[9px] font-mono text-gray-500 mt-1">
                        [{f.bbox.join(', ')}]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
