import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAuditTrail, getCases, askCopilot } from '../api';
import { PageHeader, Spinner, ConfidenceBadge } from '../components/ui';
import { 
  History, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Lock, 
  Terminal, 
  Bot, 
  User, 
  Hash, 
  CheckCircle2, 
  AlertCircle,
  Scale,
  HelpCircle,
  Zap
} from 'lucide-react';

const SUGGESTIONS = [
  "Why is the closing balance on the bank statement suspicious?",
  "Explain the date of birth discrepancy on the ID card.",
  "Is there any evidence of cloned or spliced signatures?",
  "What is the mathematical reconciliation error on the ledger?",
  "What standard guarantees this evidence is court-admissible?"
];

export default function Scans() {
  const [searchParams] = useSearchParams();
  const caseFromUrl = searchParams.get('case');

  const [auditLogs, setAuditLogs] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [loading, setLoading] = useState(true);

  // Copilot Chat State
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "copilot",
      text: "Hello! I am your AI Forensic Reasoning Copilot. I analyze multi-document evidence, contextual contradictions, and visual manipulation traces. What would you like to investigate regarding this case?",
      citations: []
    }
  ]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [aRes, cRes] = await Promise.all([getAuditTrail(), getCases()]);
        setAuditLogs(aRes.data);
        setCases(cRes.data);
        if (cRes.data.length > 0) {
          const matched = cRes.data.find(c => c.id === caseFromUrl);
          setSelectedCaseId(matched ? matched.id : cRes.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [caseFromUrl]);

  const executeQuestion = async (questionText) => {
    if (!questionText.trim() || asking) return;
    setMessages(prev => [...prev, { sender: "user", text: questionText }]);
    setAsking(true);

    try {
      const res = await askCopilot(selectedCaseId, questionText);
      setMessages(prev => [
        ...prev,
        {
          sender: "copilot",
          text: res.data.response,
          citations: res.data.cited_findings || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: "copilot",
          text: "I encountered an error querying the forensic model. Please verify backend connection.",
          citations: []
        }
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleAsk = (e) => {
    e.preventDefault();
    const q = query;
    setQuery("");
    executeQuestion(q);
  };

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Forensic Copilot & Cryptographic Audit Trail"
        subtitle="Natural language explainability, anomaly reasoning, and ISO/IEC 27037 chain-of-custody logging"
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Context Case:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-xs font-semibold text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Forensic Copilot (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  AI Forensic Reasoning Copilot
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                    Grounded XAI
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  Target: {activeCase?.title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-500">ENGINE</span>
              <p className="text-xs font-mono font-bold text-indigo-400">Contextual Reasoner v2.5</p>
            </div>
          </div>

          {/* Chat Messages Box */}
          <div className="rounded-2xl bg-gray-900/80 border border-gray-800 flex flex-col h-[520px] overflow-hidden shadow-xl">
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 leading-relaxed ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'copilot' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Sparkles size={13} />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl max-w-[85%] space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none shadow-md'
                  }`}>
                    <p className="text-xs whitespace-pre-wrap">{m.text}</p>

                    {m.citations && m.citations.length > 0 && (
                      <div className="pt-2 border-t border-gray-800 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-500 font-mono">CITED FINDINGS:</span>
                        {m.citations.map((cId, i) => (
                          <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {cId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 shrink-0 mt-0.5">
                      <User size={13} />
                    </div>
                  )}
                </div>
              ))}

              {asking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono animate-pulse p-2">
                  <Bot size={15} />
                  Copilot is analyzing multi-document evidence matrices...
                </div>
              )}
            </div>

            {/* Quick 1-Click Prompt Suggestions */}
            <div className="px-4 py-2.5 border-t border-gray-800/80 bg-gray-950/60 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono tracking-wider shrink-0 flex items-center gap-1">
                <Zap size={11} /> Quick Ask:
              </span>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => executeQuestion(s)}
                  disabled={asking}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-300 whitespace-nowrap transition cursor-pointer border border-gray-700/60"
                  title="Click to ask immediately"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleAsk} className="p-3 border-t border-gray-800 bg-gray-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Forensic Copilot to investigate findings or explain discrepancies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={asking}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={asking || !query.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow"
                title="Send inquiry"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: ISO/IEC 27037 Cryptographic Chain of Custody (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Cryptographic Chain of Custody
                </h3>
                <p className="text-xs text-gray-400">
                  ISO/IEC 27037:2012 Certified Digital Ledger
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              IMMUTABLE
            </span>
          </div>

          {/* Audit Trail List */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-3 h-[520px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-800">
              <span>Timestamped Events ({auditLogs.length})</span>
              <span className="font-mono text-[10px]">SHA-256 HASHED</span>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 space-y-1.5 hover:border-gray-700 transition">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                      <Hash size={12} />
                      {log.event}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 font-mono">
                    {log.details}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-800/50">
                    <span className="flex items-center gap-1 font-mono">
                      <Terminal size={11} className="text-emerald-400" />
                      Actor: {log.actor}
                    </span>
                    <span className="font-mono text-gray-600">
                      Case: {log.case_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
