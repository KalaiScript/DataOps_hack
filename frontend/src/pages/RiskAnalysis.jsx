import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCases } from '../api';
import { DEFAULT_CASES } from '../defaultData';
import { 
  PageHeader, 
  SeverityBadge, 
  ConfidenceBadge, 
  RiskScore, 
  Spinner 
} from '../components/ui';
import { 
  GitMerge, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRightLeft, 
  Sparkles, 
  FileStack, 
  Scale, 
  Calculator,
  ArrowRight,
  TrendingUp,
  Link,
  ShieldCheck,
  DollarSign,
  ScanSearch,
  FileCheck2,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export default function RiskAnalysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedCaseId = searchParams.get('case');

  const [cases, setCases] = useState(DEFAULT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState(requestedCaseId || DEFAULT_CASES[0]?.id || "CASE-2026-8091");
  const [loading, setLoading] = useState(false);

  // Income Disparity Simulator State
  const [declaredIncome, setDeclaredIncome] = useState(145000);
  const [verifiedInflow, setVerifiedInflow] = useState(38400);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCases();
        if (res.data && res.data.length > 0) {
          setCases(res.data);
          const matched = res.data.find(c => c.id === requestedCaseId);
          setSelectedCaseId(matched ? matched.id : res.data[0].id);
        }
      } catch (err) {
        console.warn("Using offline benchmark risk analysis dataset.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestedCaseId]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Update simulator defaults when case changes
  useEffect(() => {
    if (activeCase?.id === 'CASE-2026-8091') {
      setDeclaredIncome(145000);
      setVerifiedInflow(38400);
    } else if (activeCase?.id === 'CASE-2026-8912') {
      setDeclaredIncome(280000);
      setVerifiedInflow(72000);
    } else {
      setDeclaredIncome(95000);
      setVerifiedInflow(91000);
    }
  }, [selectedCaseId]);

  // Compute disparity metrics
  const disparityAmount = declaredIncome - verifiedInflow;
  const disparityPercent = declaredIncome > 0 
    ? Math.max(0, Math.round(((declaredIncome - verifiedInflow) / declaredIncome) * 100))
    : 0;

  const getDisparitySeverity = (pct) => {
    if (pct >= 50) return { label: 'CRITICAL FABRICATION RISK', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    if (pct >= 25) return { label: 'HIGH DISCREPANCY DETECTED', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    if (pct >= 10) return { label: 'MODERATE VARIANCE', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'RECONCILED / CONSISTENT', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const disparityBadge = getDisparitySeverity(disparityPercent);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Cross-Document Correlation & Entity Intelligence"
        subtitle="Graph-based entity reconciliation, cross-document contradiction detection, and real-time financial disparity simulation"
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Target Investigation:</span>
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-xs font-semibold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.applicant_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate(`/inspector?case=${selectedCaseId}`)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
            >
              <ScanSearch size={13} /> Evidence Canvas
            </button>

            <button
              onClick={() => navigate(`/dossier?case=${selectedCaseId}`)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 flex items-center gap-1.5 transition"
            >
              <FileCheck2 size={13} /> Open Dossier
            </button>
          </div>
        }
      />

      {/* Case Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-indigo-950/30 to-gray-900 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-indigo-400 font-bold">{activeCase?.id}</span>
            <span className="text-xs text-gray-400">• {activeCase?.organization}</span>
            <span className="text-xs text-gray-400">• Applicant: <strong className="text-white">{activeCase?.applicant_name}</strong></span>
          </div>
          <h2 className="text-base font-bold text-white">{activeCase?.title}</h2>
          <p className="text-xs text-gray-300 mt-1 max-w-3xl leading-relaxed">
            {activeCase?.summary}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gray-950/70 p-3 rounded-xl border border-gray-800 shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">Aggregated Risk</span>
            <RiskScore score={activeCase?.risk_score} />
          </div>
          <div className="h-8 w-px bg-gray-800" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">Correlated Docs</span>
            <span className="text-xs font-bold text-indigo-300">{activeCase?.documents?.length || 0} Files</span>
          </div>
          <div className="h-8 w-px bg-gray-800" />
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">Conflict Index</span>
            <span className="text-xs font-bold text-red-400 font-mono">
              {activeCase?.cross_document_correlations?.length || 0} Critical
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Income Disparity Simulator */}
      <div className="p-6 rounded-2xl bg-gray-900/80 border border-indigo-500/30 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders size={16} className="text-indigo-400" />
              Interactive Cross-Document Income Disparity Simulator
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Simulate declared income vs verified banking cash inflows to dynamically test underwriting fraud detection thresholds
            </p>
          </div>
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${disparityBadge.color} shrink-0`}>
            {disparityBadge.label}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: Declared Income */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <DollarSign size={14} className="text-indigo-400" />
                Declared Annual Income (Tax Return / Stated):
              </label>
              <span className="font-mono text-base font-black text-indigo-300">
                ${declaredIncome.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="400000"
              step="5000"
              value={declaredIncome}
              onChange={(e) => setDeclaredIncome(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$20,000</span>
              <span>$200,000</span>
              <span>$400,000</span>
            </div>
          </div>

          {/* Slider 2: Verified Inflows */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                Verified Bank Inflows (Annualized 12-Month):
              </label>
              <span className="font-mono text-base font-black text-emerald-400">
                ${verifiedInflow.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="400000"
              step="2000"
              value={verifiedInflow}
              onChange={(e) => setVerifiedInflow(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-gray-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono">
              <span>$10,000</span>
              <span>$200,000</span>
              <span>$400,000</span>
            </div>
          </div>
        </div>

        {/* Live Calculation Output Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Declared Inflow</span>
            <span className="text-sm font-bold text-indigo-300 font-mono mt-1 block">
              ${(declaredIncome / 12).toFixed(0)}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Verified Inflow</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
              ${(verifiedInflow / 12).toFixed(0)}/mo
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-center">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Disparity Variance</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">
              -${disparityAmount.toLocaleString()}
            </span>
          </div>

          <div className={`p-3 rounded-xl border text-center ${
            disparityPercent >= 30 ? 'bg-red-950/40 border-red-500/50' : 'bg-emerald-950/20 border-emerald-500/30'
          }`}>
            <span className="text-[10px] uppercase font-mono text-gray-400 block font-bold">Unsubstantiated Rate</span>
            <span className={`text-base font-black font-mono mt-0.5 block ${
              disparityPercent >= 30 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {disparityPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Cross-Document Contradiction Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <GitMerge size={16} className="text-indigo-400" />
            Cross-Document Contradiction & Entity Matching Matrix
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {activeCase?.cross_document_correlations?.length || 0} Discrepancy Graph Nodes
          </span>
        </div>

        {(activeCase?.cross_document_correlations?.length || 0) === 0 ? (
          <div className="p-10 rounded-2xl bg-gray-900/40 border border-emerald-500/30 text-center space-y-3">
            <ShieldCheck size={36} className="text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Flawless Cross-Document Harmonization</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              All declared fields, entity titles, tax registration numbers, and banking details correspond with 100% mathematical and logical consistency. Zero cross-document discrepancies detected.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeCase.cross_document_correlations.map((corr) => (
              <div
                key={corr.id}
                className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-indigo-500/50 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-400">{corr.id}</span>
                    <span className="text-sm font-bold text-white">{corr.field}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
                      {corr.conflict_type}
                    </span>
                    <ConfidenceBadge confidence={corr.confidence} />
                    <button
                      onClick={() => navigate(`/inspector?case=${selectedCaseId}`)}
                      className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                      title="Inspect evidence on Visual Canvas"
                    >
                      Inspect Evidence <ArrowRight size={11} />
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Values Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Document A Source */}
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                        <FileStack size={13} />
                        Source 1: {corr.source_a.doc_name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{corr.source_a.doc_id}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">{corr.source_a.field}</span>
                      <p className="text-sm font-bold text-white font-mono mt-0.5">{corr.source_a.value}</p>
                    </div>
                  </div>

                  {/* Document B Source */}
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                        <FileStack size={13} />
                        Source 2: {corr.source_b.doc_name}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">{corr.source_b.doc_id}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] text-gray-500 uppercase block font-semibold">{corr.source_b.field}</span>
                      <p className="text-sm font-bold text-red-400 font-mono mt-0.5">{corr.source_b.value}</p>
                    </div>
                  </div>
                </div>

                {/* Deep Contextual Explanation */}
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block font-mono flex items-center gap-1">
                    <Sparkles size={11} /> Contextual Analysis & Anomaly Reasoning:
                  </span>
                  <p className="text-gray-300 leading-relaxed">
                    {corr.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mathematical Ledger Verification Module */}
      <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator size={16} className="text-emerald-400" />
            Automated Mathematical Ledger & Equation Validation Engine
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ARITHMETIC RECONCILIATION
          </span>
        </div>

        <p className="text-xs text-gray-400">
          The platform automatically performs column-sum verification, date chronological validation, and formula checks on tables and ledger figures across financial records to detect fabricated balances.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-500 block font-mono">1. OPENING BALANCE</span>
            <span className="text-sm font-bold text-white font-mono">$12,410.50</span>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-500 block font-mono">2. TOTAL CREDITS (+)</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">+$11,500.00</span>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800">
            <span className="text-[10px] text-gray-500 block font-mono">3. TOTAL DEBITS (-)</span>
            <span className="text-sm font-bold text-amber-400 font-mono">-$9,840.20</span>
          </div>
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/50">
            <span className="text-[10px] text-red-400 block font-mono font-bold">4. EQUATION DISCREPANCY</span>
            <span className="text-sm font-bold text-red-300 font-mono">Δ +$80,130.00 INFLATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
