# DataOps Innovation Hackathon - Automated Security & Reporting Platform

A production-grade, AI-augmented security orchestration, vulnerability management, and automated reporting system engineered for the **DataOps Innovation Hackathon**.

---

## 🎯 Problem Statement Alignment

This platform directly solves the four primary challenge pillars of the hackathon:

1. **Automated Security Reporting & Data Intelligence**
   - Ingests raw telemetry and multi-track security scan results.
   - Automatically generates comprehensive Executive Assessment reports with actionable Remediation Roadmaps (Priority 1 through Priority 4).
   - Instant export of structured JSON & compliance-ready reports.

2. **Vulnerability Identification & AI Risk Prioritization**
   - Context-aware heuristic scoring model combining CVSS 3.1 base metrics with asset criticality and vulnerability categorization (e.g., Injection, Authentication, Cryptography, API Security).
   - Ranks and prioritizes open security findings to cut through alert fatigue and focus engineering attention on high-impact exploits.

3. **Cybersecurity & Security Automation**
   - Asynchronous target assessment pipelines simulating real-world port scans, web application penetration tests, and API contract validations.
   - Live finding lifecycle management (Open -> In Review -> Resolved).

4. **DataOps CI/CD Security Pipeline Orchestration**
   - Interactive, end-to-end security pipeline execution tracker with stage telemetry:
     - `Data Ingestion` -> `Vulnerability Scan` -> `AI Risk Scoring` -> `Report Generation`.
   - Real-time status streaming, execution duration metrics, and automated log outputs.

---

## 🏗️ Architecture

```
d:\DataOps_hack\
├── backend/
│   ├── server.js          # High-performance Node.js / Express REST API
│   ├── main.py            # Alternative Python / FastAPI backend
│   ├── requirements.txt   # Python requirements (FastAPI, Uvicorn, Pydantic)
│   ├── package.json       # Node.js backend dependencies
│   └── db.json            # Persistent JSON database (auto-seeded)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # High-level posture, radar charts, severity breakdown
│   │   │   ├── Scans.jsx         # Target management & ad-hoc scan triggers
│   │   │   ├── Findings.jsx      # Interactive vulnerability triage with filters & inspector
│   │   │   ├── RiskAnalysis.jsx  # AI risk scoring breakdown & category radar analysis
│   │   │   ├── Reports.jsx       # Automated report generator & remediation roadmaps
│   │   │   └── Pipeline.jsx      # Live CI/CD DataOps pipeline orchestrator
│   │   ├── components/ui.jsx     # Reusable UI badges, metrics, spinners
│   │   ├── api.js                # Axios client
│   │   ├── App.jsx               # Navigation & routing
│   │   └── index.css             # Tailwind CSS styles
│   ├── package.json
│   └── vite.config.js
└── run.bat                       # One-click launcher for Windows
```

---

## 🚀 Quick Start Guide

### Option 1: One-Click Launch (Windows)
Double-click `run.bat` in the project root directory. It automatically starts both the backend API and frontend Vite server.

### Option 2: Manual Terminal Launch

#### 1. Backend Server
```powershell
cd d:\DataOps_hack\backend
node server.js
```
The API starts at **`http://localhost:8000`** (Swagger / OpenAPI compatible).

#### 2. Frontend Application
```powershell
cd d:\DataOps_hack\frontend
npm run dev
```
The UI starts at **`http://localhost:5173`**.

---

## 🧠 AI Risk Scoring Algorithm

```
AI_Risk_Score = min(10.0, CVSS_Base × Severity_Weight × Category_Context_Weight)
```
- **Severity Multipliers**: `Critical: 1.0`, `High: 0.85`, `Medium: 0.65`, `Low: 0.4`
- **Contextual Category Weights**:
  - `Injection`: `1.05`
  - `Authentication`: `1.04`
  - `API Security`: `1.02`
  - `Network`: `1.01`
  - `Cryptography`: `0.98`
  - `Web Security`: `0.97`
  - `Information Disclosure`: `0.90`

