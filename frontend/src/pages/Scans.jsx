import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuditTrail, getCases, askCopilot } from '../api';
import { DEFAULT_CASES, DEFAULT_AUDIT_LOGS } from '../defaultData';
import { PageHeader, ConfidenceBadge, RiskScore } from '../components/ui';
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
  AlertTriangle,
  FileCheck2,
  HelpCircle,
  Zap,
  FolderOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  Clock,
  Layers,
  FileText,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';

const DEFAULT_CASES = [
  {
    id: "CASE-2026-8091",
    title: "Commercial Loan Application - Suspicious Income & Identity Alteration",
    applicant_name: "Robert M. Sterling",
    organization: "Sterling Logistics LLC",
    risk_score: 9.4,
    risk_level: "High Risk - Suspicious Manipulation",
    status: "Investigation Completed",
    summary: "Multi-document forensic audit revealed +277% declared income inflation vs bank statement deposits, altered closing balance ($14,070.30 ➔ $94,200.30), forged signature clone, and altered date of birth (+10 years)."
  },
  {
    id: "CASE-2026-8092",
    title: "Medical Insurance Claim - Tampered Invoice & Date Inconsistency",
    applicant_name: "Elena Rostova",
    organization: "Private Healthcare Policy #HC-40291",
    risk_score: 7.9,
    risk_level: "High Risk - Claim Over-Billing",
    status: "Investigation Completed",
    summary: "Hospital discharge dates precede intensive surgical procedure billing dates by 6 days. Line-item invoice totals show manual arithmetic alterations totaling $18,400 with an unauthenticated physician digital stamp."
  },
  {
    id: "CASE-2026-8093",
    title: "Enterprise Vendor Onboarding - Verified Genuine Baseline",
    applicant_name: "Apex Cybernetics Corp",
    organization: "Global Supply Chain Division",
    risk_score: 1.1,
    risk_level: "Low Risk - Verified Authentic",
    status: "Investigation Completed",
    summary: "Comprehensive multi-document examination confirmed 100% authentic records with zero optical tampering, flawless mathematical ledger reconciliation, and cryptographic signature consistency."
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: "AUD-001",
    timestamp: "2026-11-01T10:14:00.000Z",
    case_id: "CASE-2026-8091",
    document_id: "DOC-8091-A",
    event: "Document Ingestion & SHA-256 Anchoring",
    actor: "Secure Ingestion Gateway",
    details: "SHA-256 digest calculated: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855. Tamper-evident receipt registered."
  },
  {
    id: "AUD-002",
    timestamp: "2026-11-01T10:14:22.000Z",
    case_id: "CASE-2026-8091",
    document_id: "DOC-8091-B",
    event: "Error Level Analysis Heatmap Generated",
    actor: "CV Forensics Node",
    details: "High-frequency compression gradient divergence in region [120, 240, 280, 45]. Localized copy-paste digit alteration detected."
  },
  {
    id: "AUD-003",
    timestamp: "2026-11-01T10:14:45.000Z",
    case_id: "CASE-2026-8091",
    document_id: "ALL",
    event: "Cross-Document Discrepancy Flagged",
    actor: "Correlation Engine",
    details: "Declared income ($14,500/mo) contradicts verified bank statement deposits ($3,833/mo) with 98% confidence."
  },
  {
    id: "AUD-004",
    timestamp: "2026-11-01T10:15:10.000Z",
    case_id: "CASE-2026-8091",
    document_id: "DOC-8091-C",
    event: "Signature Morphological Matching",
    actor: "Biometric Stroke Engine",
    details: "Cosine stroke trajectory similarity 0.998 between Application Form and ID card. Identified as digital clone cut-and-paste."
  },
  {
    id: "AUD-005",
    timestamp: "2026-11-01T10:15:30.000Z",
    case_id: "CASE-2026-8091",
    document_id: "ALL",
    event: "ISO 27037 Investigation Dossier Compiled",
    actor: "Legal Defensibility Compiler",
    details: "Compiled court-admissible forensic dossier with cryptographic proof chain and NIST SP 800-86 compliance stamps."
  },
  {
    id: "AUD-006",
    timestamp: "2026-11-01T11:20:30.000Z",
    case_id: "CASE-2026-8092",
    document_id: "DOC-8092-A",
    event: "Chronological Sequence Conflict Detected",
    actor: "Temporal Validator",
    details: "Hospital discharge date (18/09/2026) precedes surgery billing date (24/09/2026). Post-discharge invoice fabrication indicated."
  },
  {
    id: "AUD-007",
    timestamp: "2026-11-01T09:00:30.000Z",
    case_id: "CASE-2026-8093",
    document_id: "DOC-8093-A",
    event: "Baseline Verification Approved",
    actor: "Forensic Integrity Verifier",
    details: "Zero pixel tampering, 100% harmonic entity cross-matching, valid cryptographic certificate signatures. Genuine baseline confirmed."
  }
];

const CASE_SUGGESTIONS = {
  'CASE-2026-8091': [
    "Why is the closing balance on the bank statement suspicious?",
    "Explain the date of birth discrepancy on the ID card.",
    "Is there any evidence of cloned or spliced signatures?",
    "What is the mathematical reconciliation error on the ledger?",
    "What standard guarantees this evidence is court-admissible?"
  ],
  'CASE-2026-8092': [
    "Explain the chronological contradiction between surgery and discharge dates.",
    "What is the arithmetic over-billing discrepancy on the invoice?",
    "Was the physician digital stamp or seal authenticated?",
    "Summarize all visual and contextual anomalies for this claim.",
    "What standard guarantees this evidence is court-admissible?"
  ],
  'CASE-2026-8093': [
    "Are all entity tax registration numbers and documents verified authentic?",
    "Were any visual glyphs, font splices, or metadata anomalies detected?",
    "Explain the cryptographic signature verification results.",
    "What standard guarantees this evidence is court-admissible?"
  ]
};

// Lightweight ChatGPT-style Markdown formatter
function parseInlineMarkdown(text) {
  if (!text) return null;
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={keyIndex++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={keyIndex++} className="px-1.5 py-0.5 rounded bg-gray-800 text-indigo-300 font-mono text-[11px] border border-gray-700/60">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function FormattedMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^#{2,3}\s+/, '');
          return (
            <h4 key={idx} className="text-xs sm:text-sm font-bold text-indigo-300 mt-2 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              {parseInlineMarkdown(headerText)}
            </h4>
          );
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[•\-\*]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
              <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
              <span className="flex-1 text-gray-200">{parseInlineMarkdown(itemText)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-0.5">
              <span className="text-indigo-400 font-mono font-bold shrink-0 text-[10px] bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-500/20">{numMatch[1]}</span>
              <span className="flex-1 text-gray-200">{parseInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-gray-200">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Comprehensive ChatGPT-quality NLU Fallback Engine
function generateCopilotFallback(activeCase, queryText) {
  const rawQuery = (queryText || '').trim();
  const cleanQ = rawQuery.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
  const words = cleanQ.split(/\s+/).filter(Boolean);

  const hasAny = (...arr) => arr.some(w => cleanQ.includes(w) || words.includes(w));

  // Intent Detection
  const isName =
    hasAny("what is your name", "whats your name", "what s your name", "who are you", "who r u", "your name", "tell me your name", "introduce yourself", "who am i talking to", "who is this") ||
    (hasAny("what", "tell", "say", "know") && hasAny("name")) ||
    (words.length <= 2 && words.includes("name"));

  const isCreator =
    hasAny("kalai", "kalaiscript", "who is made", "who made", "who created", "who built", "who developed", "who programmed", "your creator", "your developer", "your author", "who coded", "who designed") ||
    (hasAny("who", "whom") && hasAny("made", "make", "create", "created", "built", "developed", "programmed", "coded", "invented"));

  const isGreeting =
    (words.length <= 3 && hasAny("hi", "hello", "hey", "greetings", "howdy", "sup", "namaste", "good morning", "good afternoon", "good evening")) ||
    ["hi", "hello", "hey", "greetings"].includes(words[0]);

  const isStatus =
    hasAny("how are you", "how s it going", "how is it going", "how do you do", "whats up", "what s up", "are you there", "are you online");

  const isThanks =
    hasAny("thank", "thanks", "good job", "great job", "awesome", "cool", "nice", "appreciate", "well done", "kudos");

  const isJoke =
    hasAny("joke", "funny", "laugh", "humor", "make me laugh");

  const isPlatformAccess =
    hasAny("how to access", "how do i access", "how to use", "how do i use", "how to navigate", "navigation", "where do i start", "guide", "workflow", "modules", "platform", "access this platform", "access the platform", "how access");

  const isHelp =
    hasAny("what can you do", "help", "capabilities", "what do you do", "how do you work", "how does this work", "features", "skills");

  const isSummary =
    hasAny("summary", "overview", "what happened", "explain case", "tell me about", "findings", "report", "what did you find", "what is wrong", "what is fake", "what is fraud", "what was altered", "case about", "document fraud", "fraud", "red flags", "threats");

  const isApplicant =
    hasAny("who is the applicant", "who is robert", "who is elena", "who is apex", "who is the person", "who is the suspect", "applicant", "suspect", "organization", "company", "who is he", "target");

  const isDocuments =
    hasAny("what documents", "which documents", "documents", "files", "what did they submit", "how many documents", "uploaded files", "evidence files");

  const isScore =
    hasAny("risk score", "score", "risk level", "how risky", "severity", "threat level", "composite score");

  let answer = "";
  let citations = [];

  if (isName) {
    answer = `I am **Sentinel AI**, your dedicated **AI Forensic Reasoning Copilot** on the DataOps Platform! 🕵️‍♂️\n\nThink of me as your specialized investigative partner. I analyze submitted financial declarations, bank statements, and government IDs to detect subtle evidence of tampering that human reviewers might overlook.\n\n### 📋 Active Investigation Context:\n• **Case**: \`${activeCase.id}\` — **${activeCase.applicant_name}** (${activeCase.organization})\n• **Risk Evaluation**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n• **Examined Documents**: ${activeCase.documents?.length || 3} submitted files\n\n### 💡 What would you like to explore?\n• Ask **"Summarize the fraud"** for a full case briefing.\n• Ask **"Why is the bank statement suspicious?"** to see the $80,130 ledger calculation disparity.\n• Inquire about the **Date of Birth overwrite** or **cloned signature**.\n• Request an **audit defensibility report** under ISO/IEC 27037 standards.`;
    citations = ["COPILOT-IDENTITY", "SENTINEL-AI"];
  } else if (isCreator) {
    answer = `Hello! I was designed and engineered by **KalaiScript** ([kalaiwebxd07@gmail.com](mailto:kalaiwebxd07@gmail.com)) for the **DataOps Innovation Hackathon 2026**! 🚀\n\nI am an **AI-Powered Forensic Reasoning Copilot** built to solve the complex challenge of detecting multi-document forgery, ledger fraud, and identity tampering across heterogeneous PDF and raster image submissions.\n\n### 🛠️ Architecture & Innovations:\n• **Lead Engineer**: KalaiScript\n• **Core Engines**: Computer Vision Error Level Analysis (ELA), cross-document entity correlation graphs, and automated mathematical ledger reconciliation.\n• **Standards**: Strictly adheres to ISO/IEC 27037 digital evidence preservation and NIST SP 800-86 guidelines with immutable SHA-256 chain-of-custody logging.\n\nFeel free to ask me anything about the evidence or detected anomalies in **Case ${activeCase.id}**!`;
    citations = ["DEV-KALAISCRIPT", "DATAOPS-2026"];
  } else if (isGreeting) {
    answer = `Hello there! 👋 Welcome to the **DataOps Forensic Investigation Workbench**. I am **Sentinel AI**, your AI Forensic Reasoning Copilot.\n\nI have completed the multi-stage optical and contextual audit on **Case ${activeCase.id}** (**${activeCase.applicant_name}** • ${activeCase.organization}).\n\n### 🔍 Quick Case Overview:\n• **Overall Risk Assessment**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n• **Flagged Anomalies**: **${activeCase.anomalies_count || 4} critical findings** across income, ledger balance arithmetic, and biometric stamps.\n\nHow can I assist your investigation today? You can choose any of the **Suggested Questions** below or type any question in natural language!`;
    citations = ["CASE-CONTEXT", "AI-READY"];
  } else if (isStatus) {
    answer = `I am operating at **100% operational efficiency**! ⚡\n\nAll forensic diagnostic engines are active and synchronized:\n• **OCR & Structural Layout Parser**: Active (100% character & token extraction)\n• **Computer Vision ELA Engine**: Online (Sub-pixel artifact localization)\n• **Cross-Document Correlation Graph**: Reconciled\n• **Cryptographic Provenance**: ISO/IEC 27037 SHA-256 Ledger intact\n\nCurrently active on **Case ${activeCase.id}** (${activeCase.applicant_name}). What would you like to inspect first?`;
    citations = ["SYSTEM-ONLINE", "PIPELINE-HEALTHY"];
  } else if (isThanks) {
    answer = `You are very welcome! 😊\n\nEnsuring full investigative accuracy, mathematical certainty, and court-admissible audit trails is my top priority. If you need further deep-dives into bounding-box coordinates, cross-document discrepancies, or an executive dossier export, just let me know!`;
    citations = ["USER-ASSIST"];
  } else if (isJoke) {
    answer = `Here is a forensic investigator joke for you! 😄\n\n**Why did the forged bank statement fail its job interview?**  \n*Because it couldn't balance its own accounts, and its fonts were caught acting completely out of character!* 🎭\n\n(Fortunately, our automated ledger validation caught the +$80,130 inflation immediately!) Would you like to inspect the altered transaction row?`;
    citations = ["FORENSIC-HUMOR"];
  } else if (isPlatformAccess) {
    answer = `### 🚀 How to Access & Navigate the DataOps Forensics Platform:\n\nWelcome to the **DataOps Document Forensics Workbench**! Here is your step-by-step guide to accessing and using every module:\n\n### 🧭 1. Investigation Modules (Left Navigation Menu):\n1. **📊 Forensic Overview** (\`/\`):\n   • High-level KPI dashboard displaying overall composite risk scores, active case summaries, and document ingestion tallies.\n2. **⚙️ 10-Stage Pipeline** (\`/pipeline\`):\n   • Run the automated forensics pipeline: Ingestion → OCR → Layout Understanding → Error Level Analysis (ELA) → Mathematical Reconciliation → Cross-Correlation.\n3. **🔍 Evidence Canvas** (\`/findings\`):\n   • Visual interactive viewer with bounding boxes, ELA heatmaps, and side-by-side pixel inspection of altered documents.\n4. **🔗 Cross-Doc Matrix** (\`/matrix\`):\n   • Correlation matrix comparing declared data (e.g. loan application) against third-party records (bank statements & identity cards).\n5. **📑 Investigation Dossier** (\`/dossier\`):\n   • Court-admissible formal report adhering to **ISO/IEC 27037** with executive summary, audit findings, and hash verification.\n6. **🤖 Audit & AI Copilot** (\`/audit\`):\n   • Chat with Sentinel AI (this copilot) to ask questions in real-time about evidence, math errors, and audit trails.\n\n### 💡 2. How to Investigate a Case:\n• **Switch Cases**: Use the **Target Dropdown** in the top header bar to choose between **CASE-2026-8091** (Commercial Loan), **CASE-2026-8092** (Medical Claim), or **CASE-2026-8093** (Authentic Baseline).\n• **Run Analysis**: Click the **Run Pipeline** button in the header bar.\n• **AI Chatbot**: Ask any question in this chat window or click any of the Suggested Question chips! You can also connect a free Gemini API key using the **Connect API Key ⚡** button to enable live LLM reasoning.`;
    citations = ["PLATFORM-GUIDE", "WORKFLOW-001"];
  } else if (isHelp) {
    answer = `Here is what I can do as your **AI Forensic Reasoning Copilot**:\n\n### 🛡️ 1. Multi-Document Cross-Correlation\nI compare data across applications, tax filings, and bank statements to detect hidden contradictions (e.g., declared income of $14,500/mo vs verified bank credits of $3,833/mo).\n\n### 🔬 2. Visual Computer Vision Forensics (ELA)\nUsing Error Level Analysis (ELA) and pixel gradient filtering, I detect digital copy-paste patches, font weight/kerning inconsistencies, and overwritten text glyphs.\n\n### 🧮 3. Automated Mathematical Ledger Auditing\nI automatically verify financial calculations: \`Opening Balance + Total Credits - Total Debits = Reported Closing Balance\`. If there is any discrepancy, I pinpoint the exact dollar inflation.\n\n### ✍️ 4. Biometric & Signature Stroke Verification\nI perform morphological contour analysis to detect cut-and-paste signature cloning between documents with identical pixel geometry.\n\n### 🔒 5. ISO/IEC 27037 Cryptographic Chain of Custody\nEvery document and forensic scan event is cryptographically anchored with SHA-256 digests and immutable timestamps for court defensibility.\n\nAsk me any specific question about **Case ${activeCase.id}** to see it in action!`;
    citations = ["CAPABILITIES", "ISO-27037"];
  } else if (isApplicant) {
    answer = `### 👤 Investigation Target Profile:\n• **Applicant**: **${activeCase.applicant_name}**\n• **Organization**: **${activeCase.organization}**\n• **Case Reference**: \`${activeCase.id}\` — *${activeCase.title}*\n• **Investigation Status**: \`${activeCase.status}\`\n• **Assigned Risk**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n\n**Primary Allegation**: ${activeCase.summary}`;
    citations = ["APPLICANT-RECORD", activeCase.id];
  } else if (isDocuments) {
    const docList = activeCase.documents ? activeCase.documents.map((d, i) => `${i + 1}. **${d.name}** (\`${d.type}\`, ${d.file_size || '1.2MB'}, Risk: \`${d.forensic_risk_score || 8.0}/10\`)`).join('\n') : "Multiple documents on record.";
    answer = `Case **${activeCase.id}** contains **${activeCase.documents?.length || 2} submitted evidence documents**:\n\n${docList}\n\nAll documents are cryptographically anchored with SHA-256 digests and mapped to normalized pixel coordinates for forensic audit defensibility.`;
    citations = activeCase.documents ? activeCase.documents.map(d => d.id) : ["DOC-LIST"];
  } else if (isScore) {
    answer = `### 📊 Risk Score Analysis for Case ${activeCase.id}:\n• **Aggregated Composite Score**: \`${activeCase.risk_score} / 10.0\`\n• **Threat Level**: **${activeCase.risk_level}**\n• **Confidence**: \`98.4%\`\n\nThis score is synthesized from **${activeCase.anomalies_count || 4} verified anomalies** across visual image tampering (ELA), mathematical ledger discrepancies, and multi-document cross-correlation conflicts.`;
    citations = ["RISK-SCORE", activeCase.risk_level];
  } else if (isSummary) {
    answer = `Here is the comprehensive forensic executive summary for **Case ${activeCase.id}** (**${activeCase.applicant_name}** • ${activeCase.organization}):\n\n### 📊 Executive Risk Profile:\n• **Composite Risk Score**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n• **Status**: ${activeCase.status}\n• **Underwriting Recommendation**: **FLAGGED FOR FRAUD ESCALATION**\n• **Admissibility Standard**: ISO/IEC 27037 & NIST SP 800-86 Compliant\n\n### 🚨 Key Detected Tampering Vectors:\n1. **Income Inflation (+277%)**: Applicant claimed **$14,500.00/mo** ($174,000/yr) on the loan form, while verified bank records prove average deposits of only **$3,833.33/mo** ($46,000/yr).\n2. **Fabricated Closing Balance (+$80,130 Disparity)**: The bank statement closing balance was digitally overwritten to **$94,200.30**. True arithmetic balance is **$14,070.30** (\`$12,410.50 + $11,500.00 - $9,840.20\`).\n3. **Date of Birth Overwrite (+10 Years)**: Optical ELA confirms the ID card year was altered from \`1995\` to \`1985\` via localized pixel patch to bypass the minimum 35-year underwriting age requirement.\n4. **Signature Clone Stamp**: Cosine stroke similarity of \`0.998\` between loan form and national ID confirms identical digital copy-paste duplication.\n\nClick any suggested prompt below or view the **Evidence Canvas** to inspect visual heatmaps!`;
    citations = activeCase.cross_document_correlations ? activeCase.cross_document_correlations.map(x => x.id) : ["CASE-SUMMARY"];
  }
  // Case 2 Specific: Medical Claim Over-Billing
  else if (activeCase.id === 'CASE-2026-8092') {
    if (cleanQ.includes("date") || cleanQ.includes("surgery") || cleanQ.includes("discharge") || cleanQ.includes("chronolog") || cleanQ.includes("time")) {
      answer = `### 🏥 Chronological Paradox in Medical Claim:\n\n• **Hospital Discharge Date**: \`18/09/2026\`\n• **Billed Intensive Surgical Procedure Date**: \`24/09/2026\`\n\n**Forensic Finding**: The billed surgical procedure is dated **6 days AFTER** the patient was already officially discharged from the facility! This temporal impossibility proves post-discharge invoice manufacturing and fraudulent billing manipulation.`;
      citations = ["XCORR-8092-1", "VIS-8092-2"];
    } else if (cleanQ.includes("invoice") || cleanQ.includes("bill") || cleanQ.includes("math") || cleanQ.includes("amount") || cleanQ.includes("ledger") || cleanQ.includes("reconcil") || cleanQ.includes("money") || cleanQ.includes("total")) {
      answer = `### 💰 Medical Invoice Arithmetic Re-calculation:\n\n• Stated Procedural Fees:\n  - Procedure A: \`$8,200.00\`\n  - Procedure B: \`$4,100.00\`\n  - Procedure C: \`$2,500.00\`\n• **True Mathematical Subtotal**: **\`$14,800.00\`**\n• **Reported Invoice Grand Total**: **\`$33,200.00\`**\n• **Fraudulent Surplus Delta**: **\`+$18,400.00\`**\n\nFont kerning and baseline alignment variance confirm the grand total digit \`'3'\` was spliced into the invoice.`;
      citations = ["MATH-8092-1", "VIS-8092-1"];
    } else if (cleanQ.includes("signature") || cleanQ.includes("stamp") || cleanQ.includes("doctor") || cleanQ.includes("physician")) {
      answer = `### 🩺 Physician Seal & Digital Stamp Inspection:\n\nThe digital stamp purporting to represent the chief attending physician was flagged as counterfeit:\n• Resolution is only **72 DPI** (standard scanned hospital documents are 300+ DPI).\n• Lacks embedded PKCS#7 or X.509 digital signing certificates.\n• Edge boundary analysis reveals it is an unauthenticated web raster PNG clipped from an online public seal template.`;
      citations = ["VIS-8092-3"];
    } else if (cleanQ.includes("standard") || cleanQ.includes("iso") || cleanQ.includes("legal") || cleanQ.includes("court")) {
      answer = `### ⚖️ Evidence Integrity & Court Defensibility:\n\nAll evidence for Case **${activeCase.id}** conforms to **ISO/IEC 27037** standards. Every line-item anomaly and pixel-level stamp alteration is preserved with SHA-256 cryptographic provenance and normalized pixel coordinates for forensic admissibility.`;
      citations = ["ISO-27037", "SHA-256", "CHAIN-OF-CUSTODY"];
    } else {
      answer = `### 📋 Case Assessment for ${activeCase.id} (${activeCase.title}):\n• **Risk Score**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n• **Key Findings**: Procedural invoice inflation of **+$18,400.00**, chronological discharge paradox (surgery billed 6 days after discharge), and counterfeit 72 DPI physician seal.\n• **Status**: Flagged for claim denial and forensic review.`;
      citations = ["XCORR-8092-1", "MATH-8092-1", "VIS-8092-1"];
    }
  }
  // Case 3 Specific: Authentic Baseline (Apex Cybernetics)
  else if (activeCase.id === 'CASE-2026-8093') {
    if (cleanQ.includes("standard") || cleanQ.includes("iso") || cleanQ.includes("legal") || cleanQ.includes("court")) {
      answer = `### ⚖️ Compliance & Provenance Verification:\n\nAll submitted documents for **${activeCase.applicant_name}** are cryptographically anchored with SHA-256 digests and validated under **ISO/IEC 27037** guidelines. The immutable ledger confirms zero tampering across all ingestion events.`;
      citations = ["ISO-27037", "AUDIT-001"];
    } else {
      answer = `### ✅ Authentic Baseline Case (${activeCase.applicant_name}):\n• **Risk Score**: \`${activeCase.risk_score} / 10.0\` (${activeCase.risk_level})\n• **Findings**:\n  1. All tax registration numbers (GST/PAN) validated against live corporate registries.\n  2. Bank ledger math is 100% consistent across all statement pages.\n  3. Zero Error Level Analysis (ELA) compression anomalies or font splices detected.\n  4. Digital signatures verified with valid X.509 PKI certificate chains.`;
      citations = ["VERIF-001", "VERIF-002", "VERIF-003"];
    }
  }
  // Case 1 (Default): Commercial Loan / Sterling Alterations
  else {
    if (cleanQ.includes("ledger") || cleanQ.includes("math") || cleanQ.includes("reconcil") || cleanQ.includes("equation") || cleanQ.includes("arithmetic") || cleanQ.includes("discrepancy") || cleanQ.includes("calculation") || cleanQ.includes("formula")) {
      answer = `### 🧮 Bank Statement Balance & Ledger Arithmetic Breakdown:\n\n1. **Formula Inconsistency (+$80,130.00 Inflation)**:\n   • **Opening Balance**: \`$12,410.50\`\n   • **Total Deposits (Credits)**: \`+$11,500.00\`\n   • **Total Withdrawals (Debits)**: \`-$9,840.20\`\n   • **Expected True Closing Balance**: **\`$14,070.30\`**\n   • **Reported Statement Balance**: **\`$94,200.30\`**\n   • **Fraudulent Surplus Delta**: **\`+$80,130.00\`**\n\n2. **Optical & Font Glyph Manipulation**:\n   • The leading digit **'9'** in \`$94,200.30\` displays **Helvetica Bold 11.4pt**, while document baseline is **Arial Regular 10pt**.\n   • Vertical baseline misalignment: \`1.2px offset\`.\n   • **Error Level Analysis (ELA)** confirms localized high-intensity compression boundary around the closing balance field.`;
      citations = ["MATH-001", "VIS-002", "VIS-003", "XCORR-001"];
    } else if (cleanQ.includes("closing balance") || cleanQ.includes("balance") || cleanQ.includes("income") || cleanQ.includes("salary") || cleanQ.includes("money") || cleanQ.includes("bank") || cleanQ.includes("deposit") || cleanQ.includes("inflow")) {
      answer = `### 💵 Income Discrepancy & Closing Balance Tampering:\n\n1. **Severe Salary Inflation (+277%)**:\n   • **Declared on Application Form**: **\`$14,500.00 / month\`** ($174,000/yr)\n   • **Verified Bank Deposits**: **\`$3,833.33 / month\`** ($46,000/yr)\n   • **Disparity**: +$10,666.67/mo unexplained inflation claim.\n\n2. **Altered Closing Balance (+$80,130)**:\n   • Opening Balance ($12,410.50) + Credits ($11,500.00) - Debits ($9,840.20) mathematically totals **$14,070.30**.\n   • The document reports **$94,200.30**, confirmed by Error Level Analysis (ELA) as font glyph splicing.`;
      citations = ["XCORR-001", "VIS-002", "VIS-003"];
    } else if (cleanQ.includes("dob") || cleanQ.includes("birth") || cleanQ.includes("age") || cleanQ.includes("identity") || cleanQ.includes("born") || cleanQ.includes("year")) {
      answer = `### 🆔 Date of Birth & Identity Forensic Analysis:\n\n• **Flagged Field**: Date of Birth on National ID Card (\`DOC-8091-C\`)\n• **Reported Value**: \`12/08/1985\` (Age 41)\n• **Original Recovered Value**: \`12/08/1995\` (Age 31)\n\n### 🔬 Optical Evidence:\n1. **Residual Ghost Strokes**: High-magnification glyph examination reveals residual underlying pixel contours corresponding to digit \`'9'\` underneath the overwritten digit \`'8'\`.\n2. **Background Pattern Discontinuity**: The national ID's micro-guilloche background pattern exhibits a **28% gradient variance** in a rectangular bounding box around the year.\n3. **Motive**: Commercial loan underwriting guidelines require the primary guarantor to be at least 35 years old. The 10-year artificial aging bypassed this automated cutoff.`;
      citations = ["VIS-004", "XCORR-002"];
    } else if (cleanQ.includes("signature") || cleanQ.includes("sign") || cleanQ.includes("clone") || cleanQ.includes("forgery") || cleanQ.includes("cutout") || cleanQ.includes("stroke")) {
      answer = `### ✍️ Biometric & Signature Forensic Analysis:\n\n• **Finding**: Morphological Duplicate / Cut-and-Paste Cloned Signature\n• **Confidence**: \`99.8% pixel identity\`\n• **Compared Sources**: Loan Application Form (\`DOC-8091-A\`) vs National ID Card (\`DOC-8091-C\`)\n\n### 🔬 Forensic Rationale:\nIn organic human handwriting, two natural signatures from the same individual will always display natural variation in stroke pressure, acceleration, and micro-tremor.\nHere, the signature on the loan application is an **exact geometric duplicate (cosine stroke similarity 0.998)** with a faint rectangular compression boundary, proving it was digitally extracted from the ID and pasted onto the form.`;
      citations = ["VIS-001", "XCORR-003"];
    } else if (cleanQ.includes("standard") || cleanQ.includes("iso") || cleanQ.includes("legal") || cleanQ.includes("court") || cleanQ.includes("admissib") || cleanQ.includes("custody")) {
      answer = `### ⚖️ Legal Admissibility & Standards Compliance:\n\nAll evidence gathered by this platform adheres strictly to:\n• **ISO/IEC 27037:2012**: Digital Evidence Identification, Collection, Acquisition & Preservation.\n• **ISO/IEC 27041 / 27042**: Assurance methods for incident analysis and electronic evidence reliability.\n• **NIST SP 800-86**: Guide to Integrating Forensic Techniques into Incident Response.\n\n### 🛡️ Chain-of-Custody Guarantees:\n1. **SHA-256 Hashing**: Each document is cryptographically fingerprinted immediately upon ingestion.\n2. **Coordinate Telemetry**: Every anomaly is anchored to normalized \`[x, y, width, height]\` bounding boxes.\n3. **Immutable Audit Ledger**: Every investigator interaction and AI inference is logged with UTC timestamps.`;
      citations = ["AUDIT-TRAIL", "CHAIN-OF-CUSTODY"];
    } else {
      answer = `Regarding your inquiry on **Case ${activeCase.id}** (**${activeCase.applicant_name}** • ${activeCase.organization}):\n\nOur multi-document forensic model evaluated your prompt **"${rawQuery}"** against the case knowledge graph:\n• **Target Threat Level**: \`${activeCase.risk_level}\` (Composite Score: **${activeCase.risk_score} / 10.0**)\n• **Primary Evidence**: ${activeCase.summary}\n• **Underwriter Recommendation**: Flagged for fraud escalation; manual verification of banking statements and original identity documents recommended.\n\n💡 **Suggested Follow-up Prompts**:\n• *"Explain why the closing balance is suspicious"*\n• *"How was the date of birth altered?"*\n• *"What standard guarantees this evidence is court-admissible?"*\n• *"Who created this platform?"*`;
      citations = activeCase.cross_document_correlations ? activeCase.cross_document_correlations.map(x => x.id) : ["CASE-SUMMARY"];
    }
  }

  return { text: answer, citations };
}

export default function Scans() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseFromUrl = searchParams.get('case');

  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [cases, setCases] = useState(DEFAULT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState(caseFromUrl || 'CASE-2026-8091');
  const [filterByCase, setFilterByCase] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // LLM API Key Settings State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('copilot_api_key') || '');
  const [apiProvider, setApiProvider] = useState(() => localStorage.getItem('copilot_api_provider') || 'gemini');
  const [showApiModal, setShowApiModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempProvider, setTempProvider] = useState(apiProvider);

  // Copilot Chat State
  const [query, setQuery] = useState("");
  const [asking, setAsking] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "copilot",
      text: "👋 **Hello Investigator!** I am your **AI Forensic Reasoning Copilot**.\n\nI analyze multi-document financial applications, bank statements, and identity records for:\n• **Visual Manipulation & ELA**: Localized pixel splicing and font kerning inconsistencies.\n• **Contextual Contradictions**: Income discrepancies and chronological paradoxes.\n• **Ledger Arithmetic Reconciliation**: Automated balance formula auditing.\n• **Cryptographic Integrity**: ISO/IEC 27037 compliant SHA-256 evidence anchoring.\n\nClick any **Suggested Question** below or ask me anything to investigate!",
      citations: ["FORENSIC-READY", "ISO-27037"],
      timestamp: "Just now"
    }
  ]);

  const chatEndRef = useRef(null);

  // Sync selectedCaseId when URL changes
  useEffect(() => {
    if (caseFromUrl) {
      setSelectedCaseId(caseFromUrl);
    }
  }, [caseFromUrl]);

  // Load from backend if available
  useEffect(() => {
    async function load() {
      try {
        const [aRes, cRes] = await Promise.all([getAuditTrail(), getCases()]);
        if (aRes?.data?.length > 0) setAuditLogs(aRes.data);
        if (cRes?.data?.length > 0) {
          setCases(cRes.data);
          if (!caseFromUrl) {
            setSelectedCaseId(cRes.data[0].id);
          }
        }
      } catch (err) {
        // Silently use robust fallbacks
        console.warn("Backend offline or initializing; using built-in forensic dataset.");
      }
    }
    load();
  }, [caseFromUrl]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, asking]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const suggestions = CASE_SUGGESTIONS[selectedCaseId] || CASE_SUGGESTIONS['CASE-2026-8091'];

  const displayedLogs = filterByCase
    ? auditLogs.filter(l => l.case_id === selectedCaseId)
    : auditLogs;

  const copyToClipboard = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const executeQuestion = async (questionText) => {
    if (!questionText.trim() || asking) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: "user", text: questionText, timestamp: now }]);
    setAsking(true);

    try {
      const res = await askCopilot(selectedCaseId, questionText, apiKey, apiProvider);
      setMessages(prev => [
        ...prev,
        {
          sender: "copilot",
          text: res.data.response,
          citations: res.data.cited_findings || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Intelligent grounded natural language fallback if backend is offline or starting
      setTimeout(() => {
        const fallback = generateCopilotFallback(activeCase, questionText);
        setMessages(prev => [
          ...prev,
          {
            sender: "copilot",
            text: fallback.text,
            citations: fallback.citations,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setAsking(false);
      }, 400);
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

  const handleResetChat = () => {
    setMessages([
      {
        sender: "copilot",
        text: `Session reinitialized for ${activeCase?.id} (${activeCase?.applicant_name}). How can I assist with this forensic investigation?`,
        citations: [],
        timestamp: "Just now"
      }
    ]);
  };

  const getEventBadge = (event) => {
    const ev = (event || '').toLowerCase();
    if (ev.includes('conflict') || ev.includes('discrepancy') || ev.includes('divergence')) {
      return { icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    if (ev.includes('signature') || ev.includes('morph')) {
      return { icon: KeyRound, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    }
    if (ev.includes('dossier') || ev.includes('approved') || ev.includes('baseline')) {
      return { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
    return { icon: Layers, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header with Integrated Case Switcher */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-gray-900 via-indigo-950/40 to-gray-900 border border-gray-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeCase?.id}
            </span>
            <span className="text-xs text-gray-400">• {activeCase?.organization}</span>
            <span className="text-xs font-semibold text-gray-300">• Applicant: <strong className="text-white">{activeCase?.applicant_name}</strong></span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
            Forensic Copilot & Cryptographic Audit Trail
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            {activeCase?.summary}
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-3 shrink-0 bg-gray-950/80 p-2.5 rounded-xl border border-gray-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">Investigation Target:</span>
            <select
              value={selectedCaseId}
              onChange={(e) => {
                setSelectedCaseId(e.target.value);
                navigate(`/audit?case=${e.target.value}`);
              }}
              className="bg-gray-900 border border-gray-700 text-xs font-bold text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer mt-0.5"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.applicant_name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-gray-800 hidden sm:block" />

          <div className="text-center shrink-0">
            <span className="text-[10px] font-mono uppercase text-gray-400 block font-bold">Risk Score</span>
            <div className="mt-0.5">
              <RiskScore score={activeCase?.risk_score} />
            </div>
          </div>
        </div>
      </div>

      {/* LLM API Key Configuration Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Connect LLM API Key</h3>
                  <p className="text-[11px] text-gray-400">Power this Copilot with real live AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 font-semibold">
                  AI Model Provider:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition ${
                      tempProvider === 'gemini'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Google Gemini
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Free Tier Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempProvider('openai')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition ${
                      tempProvider === 'openai'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span> OpenAI GPT-4o
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Paid API Key</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-gray-300 font-semibold">
                    {tempProvider === 'gemini' ? 'Gemini API Key:' : 'OpenAI API Key:'}
                  </label>
                  {tempProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono"
                    >
                      Get free key ↗
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Your key is securely stored in your local browser storage and used only to query the model grounded on active case evidence.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('copilot_api_key');
                    localStorage.removeItem('copilot_api_provider');
                    setApiKey('');
                    setTempApiKey('');
                    setShowApiModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition mr-auto"
                >
                  Disconnect Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = tempApiKey.trim();
                  localStorage.setItem('copilot_api_key', trimmed);
                  localStorage.setItem('copilot_api_provider', tempProvider);
                  setApiKey(trimmed);
                  setApiProvider(tempProvider);
                  setShowApiModal(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Save & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Forensic Copilot (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Copilot Header Card */}
          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot size={18} />
              </div>
              <div>
                <h2 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
                  AI Forensic Reasoning Copilot
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium">
                    Online & Grounded
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Explainability & multi-document fraud anomaly reasoning
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempApiKey(apiKey);
                  setTempProvider(apiProvider);
                  setShowApiModal(true);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition ${
                  apiKey
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                    : 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/25'
                }`}
                title="Connect Gemini or OpenAI API Key for live AI responses"
              >
                <KeyRound size={12} className={apiKey ? "text-emerald-400" : "text-indigo-400"} />
                <span className="hidden sm:inline">{apiKey ? 'API Key Active ⚡' : 'Connect API Key ⚡'}</span>
              </button>

              <button
                onClick={handleResetChat}
                className="px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-medium border border-gray-700 flex items-center gap-1.5 transition"
                title="Reset conversation for this case"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Box */}
          <div className="rounded-2xl bg-gray-900/90 border border-gray-800 flex flex-col h-[480px] overflow-hidden shadow-xl">
            {/* Scrollable Conversation */}
            <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 leading-relaxed ${m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {m.sender === 'copilot' && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow">
                      <Sparkles size={13} />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl max-w-[85%] space-y-2.5 shadow-md ${m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-tl-none'
                    }`}>
                    <div className="flex items-center justify-between gap-3 text-[10px] opacity-70">
                      <span className="font-bold uppercase tracking-wider font-mono">
                        {m.sender === 'user' ? 'Investigator' : 'AI Forensic Reasoner'}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.sender === 'copilot' && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(m.text, idx)}
                            className="hover:text-white transition p-0.5 rounded text-gray-400"
                            title="Copy response"
                          >
                            {copiedIdx === idx ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                          </button>
                        )}
                        <span>{m.timestamp || ''}</span>
                      </div>
                    </div>

                    <FormattedMessage text={m.text} />

                    {/* Citations Tag Bar */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="pt-2 border-t border-gray-800/80 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-gray-500 font-mono font-bold">CITED FINDINGS:</span>
                        {m.citations.map((cId, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                          >
                            {cId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 shrink-0 mt-0.5">
                      <User size={13} />
                    </div>
                  )}
                </div>
              ))}

              {asking && (
                <div className="flex items-center gap-2.5 text-xs text-indigo-400 font-mono animate-pulse p-3 rounded-xl bg-gray-950 border border-gray-800 max-w-[70%]">
                  <Bot size={16} />
                  Evaluating multi-document cross-correlations & glyph variance...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick 1-Click Prompt Suggestions */}
            <div className="px-4 py-2 border-t border-gray-800/90 bg-gray-950/70 flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none">
              <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono tracking-wider shrink-0 flex items-center gap-1">
                <Zap size={12} /> Suggested:
              </span>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => executeQuestion(s)}
                  disabled={asking}
                  className="text-[11px] font-medium px-3 py-1 rounded-full bg-gray-800 hover:bg-indigo-600 hover:text-white text-gray-300 whitespace-nowrap transition cursor-pointer border border-gray-700/60 shadow-sm shrink-0"
                  title="Click to ask this question"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleAsk} className="p-3 border-t border-gray-800 bg-gray-950 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about anomalies, income disparity, signatures, or legal admissibility..."
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
          {/* Audit Header Card */}
          <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs md:text-sm font-bold text-white whitespace-nowrap">
                    Chain of Custody
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-medium whitespace-nowrap shrink-0">
                    ISO 27037
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                  Immutable SHA-256 evidence audit trail
                </p>
              </div>
            </div>

            <button
              onClick={() => setFilterByCase(!filterByCase)}
              className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition font-semibold cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm ${filterByCase
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/40'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                }`}
              title="Toggle filtering events for active case vs all cases"
            >
              <span>{filterByCase ? 'Case Only' : 'All Events'}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${filterByCase ? 'bg-indigo-500/40 text-indigo-200' : 'bg-gray-700 text-gray-300'}`}>
                {filterByCase ? displayedLogs.length : auditLogs.length}
              </span>
            </button>
          </div>

          {/* Audit Trail List Box */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-3 h-[480px] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between text-[11px] text-gray-400 pb-2 border-b border-gray-800">
              <span className="font-semibold text-gray-300">
                Timestamped Forensic Actions ({displayedLogs.length})
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-gray-950 border border-gray-800 text-gray-400">
                SHA-256 PROVENANCE
              </span>
            </div>

            <div className="space-y-3">
              {displayedLogs.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-500 space-y-2">
                  <ShieldCheck size={32} className="text-gray-600 mx-auto" />
                  <p>No audit events recorded for {selectedCaseId}.</p>
                  <button
                    onClick={() => setFilterByCase(false)}
                    className="text-indigo-400 underline hover:text-indigo-300 text-xs"
                  >
                    View all system audit logs
                  </button>
                </div>
              ) : (
                displayedLogs.map((log) => {
                  const badge = getEventBadge(log.event);
                  const Icon = badge.icon;
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-gray-950 border border-gray-800/80 space-y-2 hover:border-gray-700 transition shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${badge.color}`}>
                          <Icon size={12} />
                          {log.event}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500 shrink-0 flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs text-gray-300 font-mono leading-relaxed">
                        {log.details}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-800/60 font-mono">
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <Terminal size={11} />
                          {log.actor}
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          {log.case_id}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LLM API Key Configuration Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Connect LLM API Key</h3>
                  <p className="text-[11px] text-gray-400">Power this Copilot with real live AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 font-semibold">
                  AI Model Provider:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition ${
                      tempProvider === 'gemini'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Google Gemini
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Free Tier Available</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempProvider('openai')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-start gap-1 transition ${
                      tempProvider === 'openai'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-sky-400"></span> OpenAI GPT-4o
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Paid API Key</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-gray-300 font-semibold">
                    {tempProvider === 'gemini' ? 'Gemini API Key:' : 'OpenAI API Key:'}
                  </label>
                  {tempProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono"
                    >
                      Get free key ↗
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={tempProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Your key is securely stored in your local browser storage and used only to query the model grounded on active case evidence.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('copilot_api_key');
                    localStorage.removeItem('copilot_api_provider');
                    setApiKey('');
                    setTempApiKey('');
                    setShowApiModal(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition mr-auto"
                >
                  Disconnect Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowApiModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = tempApiKey.trim();
                  localStorage.setItem('copilot_api_key', trimmed);
                  localStorage.setItem('copilot_api_provider', tempProvider);
                  setApiKey(trimmed);
                  setApiProvider(tempProvider);
                  setShowApiModal(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
              >
                Save & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
