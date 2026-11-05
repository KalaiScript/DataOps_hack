import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Workflow, 
  ScanSearch, 
  GitMerge, 
  FileCheck2, 
  History, 
  Binary,
  Layers,
  Sparkles,
  RotateCcw,
  Play,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Inspector from './pages/Findings'; // Visual Forensic Canvas & Evidence Inspector
import Correlation from './pages/RiskAnalysis'; // Cross-Document Correlation & Matrix
import Dossier from './pages/Reports'; // Official Investigation Dossier
import AuditCopilot from './pages/Scans'; // Audit Trail & AI Forensic Copilot
import { getCases, resetDemoData } from './api';

const navItems = [
  { to: '/',            icon: ShieldAlert, label: 'Forensic Overview' },
  { to: '/pipeline',    icon: Workflow,    label: '10-Stage Pipeline' },
  { to: '/inspector',   icon: ScanSearch,  label: 'Evidence Canvas'   },
  { to: '/correlation', icon: GitMerge,    label: 'Cross-Doc Matrix'  },
  { to: '/dossier',     icon: FileCheck2,  label: 'Investigation Dossier' },
  { to: '/audit',       icon: History,     label: 'Audit & AI Copilot' }
];

const STEPS = [
  { step: 1, label: 'Pipeline', path: '/pipeline', hint: '10-Stage Scan' },
  { step: 2, label: 'Canvas', path: '/inspector', hint: 'Visual & ELA' },
  { step: 3, label: 'Matrix', path: '/correlation', hint: 'Cross-Doc Logic' },
  { step: 4, label: 'Dossier', path: '/dossier', hint: 'ISO 27037 Report' },
  { step: 5, label: 'Copilot', path: '/audit', hint: 'AI Reasoning' },
];

function WorkbenchShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState('CASE-2026-8091');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    getCases().then(res => {
      setCases(res.data);
      // Check query param
      const params = new URLSearchParams(location.search);
      const c = params.get('case');
      if (c) setActiveCaseId(c);
      else if (res.data.length > 0) setActiveCaseId(res.data[0].id);
    }).catch(console.error);
  }, [location.search]);

  const handleCaseChange = (newId) => {
    setActiveCaseId(newId);
    // Update route with case query parameter if on inspection pages
    if (location.pathname !== '/') {
      navigate(`${location.pathname}?case=${newId}`);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all benchmark demonstration cases to pristine status?")) return;
    try {
      setResetting(true);
      await resetDemoData();
      const res = await getCases();
      setCases(res.data);
      if (res.data.length > 0) setActiveCaseId(res.data[0].id);
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  const activeCase = cases.find(c => c.id === activeCaseId) || cases[0];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-gray-100 font-sans">
      {/* Modern Cyber Forensic Sidebar */}
      <aside className="w-64 bg-gray-900/90 backdrop-blur border-r border-gray-800/80 flex flex-col shrink-0">
        {/* Logo & Hackathon Branding */}
        <div className="p-5 border-b border-gray-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
                <Binary className="text-indigo-400 w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider text-white uppercase">DataOps</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">HACK</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono tracking-tight">AI Document Forensics</p>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="mt-3.5 px-2.5 py-1.5 rounded-lg bg-gray-800/50 border border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              ISO/IEC 27037 Standard
            </span>
            <span className="font-mono text-gray-500">v2.5</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono">
            Investigation Modules
          </div>
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={`${to}${to !== '/' && activeCaseId ? `?case=${activeCaseId}` : ''}`}
                end={to === '/'}
                className={() =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* System Telemetry Footer */}
        <div className="p-4 border-t border-gray-800/80 bg-gray-900/40">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-400" />
              AI Forensic Engine
            </span>
            <span className="text-emerald-400 font-mono font-medium">ONLINE</span>
          </div>
          <div className="mt-2 text-[10px] text-gray-500 truncate">
            SOC | NOC | VAPT Track 2026
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Fast-Track Interactive Header Bar */}
        <header className="px-6 py-2.5 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Active Case Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-indigo-400" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider hidden sm:inline">Case:</span>
            </div>
            <select
              value={activeCaseId}
              onChange={(e) => handleCaseChange(e.target.value)}
              className="bg-gray-950 border border-gray-700 hover:border-gray-600 text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.applicant_name} ({c.risk_score ? `Score: ${c.risk_score}` : 'Unassessed'})
                </option>
              ))}
            </select>

            {activeCase && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border whitespace-nowrap shadow-sm shrink-0 ${
                  activeCase.risk_score >= 7.0 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : activeCase.risk_score >= 4.0 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
                title={activeCase.risk_level || 'Active'}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    activeCase.risk_score >= 7.0 
                      ? 'bg-red-400 animate-pulse' 
                      : activeCase.risk_score >= 4.0 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {activeCase.risk_score >= 7.0 
                    ? 'HIGH RISK' 
                    : activeCase.risk_score >= 4.0 
                    ? 'MEDIUM RISK' 
                    : activeCase.risk_score 
                    ? 'LOW RISK' 
                    : 'UNASSESSED'}
                </span>
                {activeCase.risk_score ? (
                  <span className="opacity-70 text-[10px] font-normal">
                    ({activeCase.risk_score.toFixed(1)}/10)
                  </span>
                ) : null}
              </span>
            )}
          </div>

          {/* 5-Step Guided Investigation Stepper */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-950/80 p-1 rounded-lg border border-gray-800">
            <span className="text-[10px] font-bold text-gray-400 px-2 uppercase tracking-widest font-mono">
              Guide:
            </span>
            {STEPS.map((s, idx) => {
              const isActive = location.pathname === s.path;
              return (
                <button
                  key={s.step}
                  onClick={() => navigate(`${s.path}?case=${activeCaseId}`)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                  title={`${s.label}: ${s.hint}`}
                >
                  <span className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center ${
                    isActive ? 'bg-white text-indigo-700 font-bold' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {s.step}
                  </span>
                  <span>{s.label}</span>
                  {idx < STEPS.length - 1 && <ChevronRight size={11} className="text-gray-600 ml-1" />}
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/pipeline?case=${activeCaseId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              title="Execute 10-stage forensic pipeline on selected case"
            >
              <Play size={12} />
              <span className="hidden sm:inline">Run Pipeline</span>
            </button>
            <button
              onClick={() => navigate(`/dossier?case=${activeCaseId}`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
              title="View and print ISO 27037 investigation dossier"
            >
              <Printer size={13} />
              <span className="hidden sm:inline">Dossier</span>
            </button>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 border border-gray-700 transition"
              title="Reset demonstration cases to pristine status"
            >
              <RotateCcw size={13} className={resetting ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/inspector" element={<Inspector />} />
            <Route path="/correlation" element={<Correlation />} />
            <Route path="/dossier" element={<Dossier />} />
            <Route path="/audit" element={<AuditCopilot />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WorkbenchShell />
    </BrowserRouter>
  );
}
