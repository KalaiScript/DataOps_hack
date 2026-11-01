import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Workflow, 
  ScanSearch, 
  GitMerge, 
  FileCheck2, 
  History, 
  Binary,
  Layers,
  Sparkles
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Inspector from './pages/Findings'; // Visual Forensic Canvas & Evidence Inspector
import Correlation from './pages/RiskAnalysis'; // Cross-Document Correlation & Matrix
import Dossier from './pages/Reports'; // Official Investigation Dossier
import AuditCopilot from './pages/Scans'; // Audit Trail & AI Forensic Copilot

const navItems = [
  { to: '/',            icon: ShieldAlert, label: 'Forensic Overview' },
  { to: '/pipeline',    icon: Workflow,    label: '10-Stage Pipeline' },
  { to: '/inspector',   icon: ScanSearch,  label: 'Evidence Canvas'   },
  { to: '/correlation', icon: GitMerge,    label: 'Cross-Doc Matrix'  },
  { to: '/dossier',     icon: FileCheck2,  label: 'Investigation Dossier' },
  { to: '/audit',       icon: History,     label: 'Audit & AI Copilot' }
];

export default function App() {
  return (
    <BrowserRouter>
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
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
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
            ))}
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
    </BrowserRouter>
  );
}
