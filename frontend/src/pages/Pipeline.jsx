import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getCases, 
  analyzeCase, 
  createCase, 
  addDocument 
} from '../api';
import { DEFAULT_CASES } from '../defaultData';
import { 
  PageHeader, 
  Spinner, 
  StatusBadge 
} from '../components/ui';
import { 
  Play, 
  CheckCircle2, 
  Loader2, 
  UploadCloud, 
  FileText, 
  Terminal, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowRight,
  Layers,
  Cpu,
  Clock,
  Sparkles,
  Plus
} from 'lucide-react';

const STAGES = [
  { id: 1, name: "1. Document Submission & Hashing", desc: "Accepts multi-format docs, generates SHA-256 cryptographic chain of custody" },
  { id: 2, name: "2. Document Classification", desc: "Identifies document taxonomy (ID, Bank Statement, Tax, Application Form)" },
  { id: 3, name: "3. OCR & Token Information Extraction", desc: "Extracts printed and handwritten text with field-level confidence scores" },
  { id: 4, name: "4. Structural Layout Understanding", desc: "Builds hierarchical key-value blocks, table schemas, and geometry maps" },
  { id: 5, name: "5. Visual Forensic Analysis (ELA & Glyphs)", desc: "Error Level Analysis, compression artifact gradients, and font kerning analysis" },
  { id: 6, name: "6. Contextual Verification (Math & Logic)", desc: "Verifies balance continuity, column math integrity, and date sequencing" },
  { id: 7, name: "7. Cross-Document Correlation Engine", desc: "Entity matching graph across all documents to uncover conflicting records" },
  { id: 8, name: "8. Anomaly Investigation & Scoring", desc: "Multi-factor contextual risk heuristic algorithm calculation" },
  { id: 9, name: "9. Evidence Mapping & Coordinates", desc: "Associates findings to normalized bounding boxes on original documents" },
  { id: 10, name: "10. Investigation Dossier Generation", desc: "Compiles ISO/IEC 27037 & NIST SP 800-86 compliant forensic dossier" }
];

export default function Pipeline() {
  const [cases, setCases] = useState(DEFAULT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState(DEFAULT_CASES[0]?.id || "CASE-2026-8091");
  const [running, setRunning] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(-1);
  const [completedStages, setCompletedStages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Case Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newApplicant, setNewApplicant] = useState("");
  const [newOrg, setNewOrg] = useState("");

  const navigate = useNavigate();

  const loadCases = async () => {
    try {
      const res = await getCases();
      if (res.data && res.data.length > 0) {
        setCases(res.data);
        if (!selectedCaseId) {
          setSelectedCaseId(res.data[0].id);
        }
      }
    } catch (e) {
      console.warn("Using offline benchmark pipeline cases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const appendLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleRunPipeline = async () => {
    if (!selectedCaseId) return;
    setRunning(true);
    setPipelineResult(null);
    setCompletedStages([]);
    setCurrentStageIdx(0);
    setLogs([]);

    appendLog(`[INIT] Initializing 10-Stage DataOps Forensic Pipeline for ${selectedCaseId}...`);
    appendLog(`[TARGET] Case Title: "${selectedCase?.title}" (${selectedCase?.documents_count} documents ingested).`);

    // Sequentially step through the 10 stages with realistic UI feedback
    for (let i = 0; i < STAGES.length; i++) {
      setCurrentStageIdx(i);
      appendLog(`[STAGE ${i + 1}/10] Executing: ${STAGES[i].name}...`);
      await new Promise(r => setTimeout(r, 260));
      setCompletedStages(prev => [...prev, i]);
    }

    try {
      appendLog(`[API] Committing forensic results and calculating heuristic score...`);
      const res = await analyzeCase(selectedCaseId);
      setPipelineResult(res.data);
      appendLog(`[SUCCESS] Pipeline finalized with 100% stage completion in ${res.data.total_latency_ms}ms.`);
      appendLog(`[DECISION] Case Risk Score: ${res.data.case.risk_score} - Status: ${res.data.case.risk_level}`);
      await loadCases();
    } catch (err) {
      console.error(err);
      appendLog(`[ERROR] Pipeline encountered an exception: ${err.message}`);
    } finally {
      setRunning(false);
      setCurrentStageIdx(-1);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const res = await createCase({
        title: newTitle,
        applicant_name: newApplicant || "Applicant",
        organization: newOrg || "Financial Underwriting"
      });
      // Add standard docs
      await addDocument(res.data.id, { name: "Identity_Proof_Card.png", type: "Identity Proof" });
      await addDocument(res.data.id, { name: "Financial_Ledger_Statement.pdf", type: "Bank Statement" });
      setShowNewModal(false);
      setNewTitle("");
      setNewApplicant("");
      setNewOrg("");
      await loadCases();
      setSelectedCaseId(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="10-Stage DataOps Forensics Pipeline"
        subtitle="End-to-End Orchestrator: Ingestion → Classification → OCR → Forensics → Cross-Correlation → Dossier"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
            >
              <Plus size={14} />
              New Investigation Case
            </button>
            <button
              onClick={handleRunPipeline}
              disabled={running || !selectedCaseId}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              {running ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Orchestrating Stages...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Execute Full Pipeline
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Case Selector Banner */}
      <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="text-indigo-400 w-5 h-5" />
          <div>
            <span className="text-xs text-gray-400 block">Select Active Investigation Target:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              disabled={running}
              className="bg-gray-950 text-sm font-semibold text-white border border-gray-700 rounded-lg px-3 py-1.5 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title} ({c.documents_count} Docs)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCase && (
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div>
              <span className="block text-gray-500 text-[10px] uppercase">Applicant</span>
              <span className="text-gray-200 font-medium">{selectedCase.applicant_name}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase">Ingested Files</span>
              <span className="text-indigo-400 font-mono font-bold">{selectedCase.documents_count} Files</span>
            </div>
            <div>
              <span className="block text-gray-500 text-[10px] uppercase">Current Risk</span>
              <span className={`font-mono font-bold ${selectedCase.risk_score >= 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                {selectedCase.risk_score} / 10
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: 10 Stages Progress Column & Live Terminal Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stages Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-indigo-400" />
              Pipeline Execution Sequence
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              {completedStages.length} / 10 Stages Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {STAGES.map((stage, idx) => {
              const isDone = completedStages.includes(idx);
              const isCurrent = currentStageIdx === idx;

              return (
                <div
                  key={stage.id}
                  className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : isDone
                      ? 'bg-gray-900/60 border-emerald-500/30'
                      : 'bg-gray-900/30 border-gray-800/80 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                      ) : isDone ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-700 bg-gray-800 text-[9px] font-mono flex items-center justify-center text-gray-400">
                          {stage.id}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold ${isCurrent ? 'text-indigo-300' : isDone ? 'text-white' : 'text-gray-400'}`}>
                        {stage.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {stage.desc}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                    isCurrent
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-gray-800 text-gray-500 border-gray-700'
                  }`}>
                    {isCurrent ? 'Processing...' : isDone ? 'Verified' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal & Results Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal size={16} className="text-emerald-400" />
              Live Telemetry Stream
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">ISO/IEC 27037 LOGS</span>
          </div>

          {/* Terminal Console Box */}
          <div className="flex-1 min-h-[300px] p-4 rounded-xl bg-gray-950 border border-gray-800 font-mono text-xs text-gray-300 space-y-1.5 overflow-y-auto max-h-[360px] shadow-inner">
            {logs.length === 0 ? (
              <div className="text-gray-600 text-center py-20">
                Awaiting pipeline trigger... Click "Execute Full Pipeline" to initiate multi-document forensic investigation.
              </div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-relaxed break-all">
                  <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : log.includes('STAGE') ? 'text-indigo-400' : log.includes('INIT') ? 'text-yellow-400' : 'text-gray-400'}>
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Post-Pipeline Success Quick Navigation */}
          {pipelineResult && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-indigo-950/40 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  Forensic Assessment Complete
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  Score: {pipelineResult.case?.risk_score} / 10
                </span>
              </div>
              <p className="text-xs text-gray-300">
                {pipelineResult.case?.summary}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => navigate(`/inspector?case=${selectedCaseId}`)}
                  className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition"
                >
                  Inspect Evidence Canvas <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => navigate(`/dossier?case=${selectedCaseId}`)}
                  className="py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
                >
                  View Dossier
                </button>
              </div>
            </div>
          )}

          {/* Ingested Document Source Integrity */}
          {selectedCase && (
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} className="text-indigo-400" />
                Ingested Files in Investigation ({selectedCase.documents?.length || 0})
              </h4>
              <div className="space-y-2">
                {selectedCase.documents?.map((d) => (
                  <div key={d.id} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800/80 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-white truncate max-w-[200px]">{d.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        SHA-256: {d.hash_sha256?.substring(0, 14)}...
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      {d.file_size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal to Create New Case */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Create New Forensic Investigation Case</h3>
            <p className="text-xs text-gray-400">
              Initialize a new investigation session to upload and correlate digital and scanned enterprise documents.
            </p>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Investigation Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mortgage Loan Underwriting Audit"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 block mb-1">Subject / Applicant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Henderson"
                  value={newApplicant}
                  onChange={(e) => setNewApplicant(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300 block mb-1">Organization / Department</label>
                <input
                  type="text"
                  placeholder="e.g. Retail Banking Underwriting"
                  value={newOrg}
                  onChange={(e) => setNewOrg(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
                >
                  Initialize Case & Auto-Attach Baseline Docs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
