import { useState, useEffect } from 'react';
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
  Scale
} from 'lucide-react';

export default function Scans() {
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
          setSelectedCaseId(cRes.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || asking) return;

    const userQ = query;
    setQuery("");
    setMessages(prev => [...prev, { sender: "user", text: userQ }]);
    setAsking(true);

    try {
      const res = await askCopilot(selectedCaseId, userQ);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI Forensic Reasoning Copilot (6 cols) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              AI Forensic Reasoning Copilot
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              EXPLAINABILITY MODEL v2.5
            </span>
          </div>

          {/* Chat Window */}
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    m.sender === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-indigo-400 border border-indigo-500/30'
                  }`}>
                    {m.sender === 'user' ? <User size={15} /> : <Bot size={16} />}
                  </div>

                  <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none'
                  }`}>
                    <p>{m.text}</p>

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
                </div>
              ))}

              {asking && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono animate-pulse">
                  <Bot size={15} />
                  Copilot is analyzing multi-document evidence matrices...
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-gray-800/80 bg-gray-950/40 flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setQuery("Why is the closing balance on the bank statement suspicious?")}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 whitespace-nowrap transition"
              >
                Why is the closing balance suspicious?
              </button>
              <button
                type="button"
                onClick={() => setQuery("Explain the date of birth discrepancy on the ID card.")}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 whitespace-nowrap transition"
              >
                Explain the DOB discrepancy
              </button>
              <button
                type="button"
                onClick={() => setQuery("Is there any evidence of cloned or spliced signatures?")}
                className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 whitespace-nowrap transition"
              >
                Check cloned signatures
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleAsk} className="p-3 border-t border-gray-800 bg-gray-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask Forensic Copilot to investigate findings or explain discrepancies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={asking}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={asking || !query.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Cryptographic Chain-of-Custody Audit Trail (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-purple-400" />
              Cryptographic Chain-of-Custody Log
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ISO/IEC 27037:2012 COMPLIANT
            </span>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <p className="text-xs text-gray-400">
              Every digital document ingested, OCR token extracted, and optical tamper finding discovered is immutably timestamped with SHA-256 cryptographic hashes for judicial admissibility.
            </p>

            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/80 space-y-1.5 text-xs hover:border-gray-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <Lock size={12} className="text-emerald-400" />
                      {log.event}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-gray-400 text-[11px] font-mono leading-relaxed">
                    {log.details}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>Actor: <strong className="text-gray-300">{log.actor}</strong></span>
                    <span>Doc: <strong className="text-indigo-400">{log.document_id}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-400" />
                Tamper-Resistant Ledger Active
              </span>
              <span className="font-mono text-gray-500">NIST SP 800-86</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
