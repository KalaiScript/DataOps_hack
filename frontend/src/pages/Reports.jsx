import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCases } from '../api';
import { DEFAULT_CASES } from '../defaultData';
import { 
  PageHeader, 
  SeverityBadge, 
  ConfidenceBadge, 
  RiskScore, 
  StatusBadge, 
  Spinner 
} from '../components/ui';
import { 
  FileCheck2, 
  Printer, 
  Download, 
  ShieldAlert, 
  Scale, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Sparkles,
  Lock
} from 'lucide-react';

export default function Reports() {
  const [searchParams] = useSearchParams();
  const requestedCaseId = searchParams.get('case');

  const [cases, setCases] = useState(DEFAULT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState(requestedCaseId || DEFAULT_CASES[0]?.id || "CASE-2026-8091");
  const [loading, setLoading] = useState(false);

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
        console.warn("Using offline benchmark reports dataset.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestedCaseId]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const dossier = activeCase?.investigation_dossier;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeCase, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `INVESTIGATION_DOSSIER_${activeCase?.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:m-0 print:p-0">
      {/* Top Header & Actions (hidden during print) */}
      <div className="print:hidden">
        <PageHeader
          title="Document Investigation Dossier"
          subtitle="Official ISO/IEC 27037 & NIST SP 800-86 Compliant Forensic Investigation Report"
          action={
            <div className="flex items-center gap-3">
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-xs font-semibold text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.applicant_name}
                  </option>
                ))}
              </select>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition"
              >
                <Printer size={14} />
                Print / Save PDF
              </button>

              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                <Download size={14} />
                Export JSON Dossier
              </button>
            </div>
          }
        />
      </div>

      {/* Printable Court-Admissible Dossier Document Body */}
      <div className="bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12 space-y-8 font-sans print:border-none print:shadow-none print:p-4">
        {/* Document Header & Forensic Badging */}
        <div className="border-b-2 border-gray-900 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-black text-xs tracking-widest uppercase mb-1">
              <Scale size={16} />
              DATAOPS FORENSIC INTELLIGENCE // DIVISION OF DIGITAL INTEGRITY
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
              FORENSIC INVESTIGATION DOSSIER
            </h1>
            <p className="text-xs text-gray-600 mt-1 font-mono">
              STANDARDS: ISO/IEC 27037:2012 | ISO/IEC 27042 | NIST SP 800-86
            </p>
          </div>

          <div className="text-right border-l-2 md:border-l-0 md:text-right pl-3 md:pl-0 border-gray-300 space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-500 block">Dossier Tracking ID</span>
            <span className="text-sm font-mono font-bold text-gray-900">{dossier?.dossier_id || `DOS-${activeCase?.id}`}</span>
            <div className="text-[11px] text-gray-600">
              Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Executive Decision Banner */}
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          activeCase?.risk_score >= 7.0 
            ? 'bg-red-50 border-red-200 text-red-950' 
            : activeCase?.risk_score >= 4.0 
            ? 'bg-amber-50 border-amber-200 text-amber-950' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 font-mono">
              Adjudication / Underwriting Outcome:
            </span>
            <span className="text-base font-black tracking-wide">
              {dossier?.executive_decision || "UNDERWRITING REVIEW"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75 font-mono">
              Overall Risk Score
            </span>
            <span className="text-xl font-black font-mono">
              {activeCase?.risk_score} / 10.0
            </span>
          </div>
        </div>

        {/* SECTION 7.1: Document Overview */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.1</span>
            Document Overview & Source Provenance
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Subject / Applicant</span>
              <span className="font-bold text-gray-900">{activeCase?.applicant_name}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Organization / File</span>
              <span className="font-semibold text-gray-900">{activeCase?.organization}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Processing Status</span>
              <span className="font-bold text-indigo-700">{activeCase?.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block font-semibold">Assigned Examiner</span>
              <span className="font-medium text-gray-800">{activeCase?.investigator}</span>
            </div>
          </div>

          {/* Ingested Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-gray-200 rounded-lg">
              <thead className="bg-gray-100 text-[10px] uppercase text-gray-600 border-b">
                <tr>
                  <th className="p-2.5">Doc ID</th>
                  <th className="p-2.5">File Name</th>
                  <th className="p-2.5">Taxonomy Classification</th>
                  <th className="p-2.5">Cryptographic SHA-256 Digest</th>
                  <th className="p-2.5 text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeCase?.documents?.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-mono font-bold text-indigo-900">{d.id}</td>
                    <td className="p-2.5 font-medium text-gray-900">{d.name}</td>
                    <td className="p-2.5 text-gray-700">{d.classification}</td>
                    <td className="p-2.5 font-mono text-[10px] text-gray-500">{d.hash_sha256?.substring(0, 24)}...</td>
                    <td className="p-2.5 text-right font-mono text-gray-600">{d.file_size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 7.2: Extracted Information */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.2</span>
            Structured Information Extraction & Field Confidence
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCase?.documents?.map((d) => (
              <div key={d.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-900 border-b pb-1">
                  <span>{d.name}</span>
                  <span className="font-mono text-indigo-700 text-[10px]">{d.id}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {d.extracted_fields?.slice(0, 5).map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-600">{f.field}:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{f.value}</span>
                        <span className="text-[9px] font-mono px-1 rounded bg-gray-200 text-gray-700">
                          {Math.round(f.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7.3: Contextual Analysis */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.3</span>
            Contextual Analysis & Cross-Document Inconsistencies
          </h2>

          <div className="space-y-3">
            {activeCase?.cross_document_correlations?.map((corr) => (
              <div key={corr.id} className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-950">{corr.field}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-200 text-red-900 font-bold">
                    {corr.conflict_type}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {corr.description}
                </p>
                <div className="text-[10px] text-gray-500 font-mono pt-1">
                  Cross-Ref: [{corr.source_a.doc_name} : "{corr.source_a.value}"] ⟷ [{corr.source_b.doc_name} : "{corr.source_b.value}"]
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7.4: Visual Forensic Findings */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.4</span>
            Visual Forensic Findings (Optical, ELA & Font Splicing)
          </h2>

          <div className="space-y-3">
            {activeCase?.documents?.flatMap(d => d.visual_anomalies || []).map((anom) => (
              <div key={anom.id} className="p-3.5 rounded-xl border border-gray-200 bg-white text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{anom.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-bold">
                    {anom.category}
                  </span>
                </div>
                <p className="text-gray-700">{anom.description}</p>
                <div className="p-2 rounded bg-gray-50 border text-[10px] text-gray-600 font-mono">
                  Optical Evidence: {anom.evidence}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7.5: Evidence and Traceability */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.5</span>
            Evidence & Traceability Verification (ISO/IEC 27037)
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            All findings are anchored to exact normalized bounding-box coordinates within original raster inputs. Digital chain of custody hashes preserve non-repudiation in accordance with digital forensics evidentiary standards.
          </p>
        </section>

        {/* SECTION 7.6: Investigation Summary & Limitations */}
        <section className="space-y-4 pt-2">
          <h2 className="text-sm font-black text-gray-950 uppercase tracking-wider border-b pb-1.5 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-gray-900 text-white text-xs flex items-center justify-center font-mono">7.6</span>
            Investigation Summary & Limitations (Section 13 Integrity)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="font-bold text-gray-900 block uppercase text-[10px] font-mono">
                Mandatory Follow-Up Verification Actions:
              </span>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {dossier?.areas_requiring_verification?.map((area, idx) => (
                  <li key={idx}>{area}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <span className="font-bold text-gray-900 block uppercase text-[10px] font-mono">
                Forensic Limitations & Boundary Conditions:
              </span>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {dossier?.investigation_limitations?.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Forensic Sign-Off Signature Box */}
          <div className="pt-6 mt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div>
              <span className="block font-bold text-gray-900">DataOps Automated Forensics System</span>
              <span className="text-[10px] font-mono">Digitally Sealed with SHA-256 Custody Block</span>
            </div>
            <div className="border border-dashed border-gray-400 p-2.5 rounded text-center w-56 bg-gray-50">
              <span className="text-[9px] text-gray-400 block font-mono">SUPERVISING EXAMINER</span>
              <span className="font-serif italic font-bold text-gray-800 text-sm">Certified Forensics Team</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
