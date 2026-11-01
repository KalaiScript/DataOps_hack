"""
DataOps Innovation Hackathon - Automated Security Assessment & Reporting Platform
Backend: FastAPI + SQLite + AI-powered Risk Scoring
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import sqlite3
import json
import uuid
import datetime
import os
import asyncio
from contextlib import asynccontextmanager

# ── App Setup ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_demo_data()
    yield

app = FastAPI(
    title="DataOps Security Platform API",
    description="Automated Security Assessment & Reporting System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "dataops.db")

# ── Database ─────────────────────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript("""
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            target TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            scan_type TEXT DEFAULT 'full',
            created_at TEXT,
            completed_at TEXT,
            findings_count INTEGER DEFAULT 0,
            risk_score REAL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS findings (
            id TEXT PRIMARY KEY,
            scan_id TEXT,
            title TEXT NOT NULL,
            description TEXT,
            severity TEXT,
            cvss_score REAL,
            ai_risk_score REAL,
            category TEXT,
            affected_asset TEXT,
            recommendation TEXT,
            status TEXT DEFAULT 'open',
            created_at TEXT,
            FOREIGN KEY (scan_id) REFERENCES scans(id)
        );

        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            scan_id TEXT,
            title TEXT,
            format TEXT DEFAULT 'json',
            generated_at TEXT,
            content TEXT,
            FOREIGN KEY (scan_id) REFERENCES scans(id)
        );

        CREATE TABLE IF NOT EXISTS pipeline_runs (
            id TEXT PRIMARY KEY,
            name TEXT,
            status TEXT DEFAULT 'idle',
            stages TEXT,
            started_at TEXT,
            completed_at TEXT,
            logs TEXT
        );
    """)
    conn.commit()
    conn.close()


def seed_demo_data():
    conn = get_db()
    c = conn.cursor()
    count = c.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    if count > 0:
        conn.close()
        return

    now = datetime.datetime.utcnow().isoformat()

    # Demo scans
    scans = [
        ("scan-001", "Web App Assessment", "https://target-app.internal", "completed", "web", now, now, 12, 7.8),
        ("scan-002", "Network Perimeter Scan", "192.168.1.0/24", "completed", "network", now, now, 8, 6.2),
        ("scan-003", "API Security Review", "https://api.internal/v2", "running", "api", now, None, 3, 4.1),
    ]
    c.executemany(
        "INSERT OR IGNORE INTO scans VALUES (?,?,?,?,?,?,?,?,?)", scans
    )

    # Demo findings
    findings = [
        ("f-001","scan-001","SQL Injection in Login Form","User input not sanitized in /login endpoint","critical",9.8,9.5,"Injection","/login","Use parameterized queries","open", now),
        ("f-002","scan-001","Outdated TLS 1.0 Support","Server accepts TLS 1.0 connections","high",7.5,7.8,"Cryptography","Port 443","Disable TLS 1.0, enforce TLS 1.2+","open", now),
        ("f-003","scan-001","Missing CSRF Protection","Forms lack CSRF token validation","high",6.8,7.0,"Web Security","/admin","Implement CSRF tokens","in_review", now),
        ("f-004","scan-001","Verbose Error Messages","Stack traces exposed in production","medium",5.3,5.5,"Information Disclosure","/api/error","Suppress detailed errors in production","open", now),
        ("f-005","scan-001","Weak Password Policy","Minimum 4-char passwords allowed","medium",4.9,5.1,"Authentication","/register","Enforce strong password policy","open", now),
        ("f-006","scan-001","Open Redirect Vulnerability","Redirect URL parameter not validated","medium",6.1,6.3,"Web Security","/redirect","Validate and whitelist redirect URLs","open", now),
        ("f-007","scan-002","Open SMB Port 445","SMB exposed to external network","high",7.8,8.0,"Network","192.168.1.45","Block SMB on perimeter firewall","open", now),
        ("f-008","scan-002","Default Credentials on Router","Admin panel accessible with default creds","critical",9.1,9.3,"Authentication","192.168.1.1","Change default credentials immediately","open", now),
        ("f-009","scan-002","Unencrypted FTP Service","FTP transmitting data in cleartext","medium",5.8,6.0,"Cryptography","192.168.1.22","Replace FTP with SFTP","open", now),
        ("f-010","scan-003","JWT Algorithm Confusion","API accepts 'none' algorithm in JWT","critical",9.0,9.2,"Authentication","/api/auth","Enforce specific JWT algorithm","open", now),
        ("f-011","scan-003","Rate Limiting Absent","No rate limiting on authentication endpoints","high",7.2,7.5,"API Security","/api/login","Implement rate limiting","open", now),
        ("f-012","scan-003","Sensitive Data in URL","API keys transmitted in query strings","medium",5.5,5.7,"Information Disclosure","/api/data","Move sensitive params to request body/headers","open", now),
    ]
    c.executemany(
        "INSERT OR IGNORE INTO findings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", findings
    )

    # Demo pipeline run
    stages = json.dumps([
        {"name": "Data Ingestion", "status": "completed", "duration": 2.1},
        {"name": "Vulnerability Scan", "status": "completed", "duration": 45.3},
        {"name": "AI Risk Scoring", "status": "completed", "duration": 8.7},
        {"name": "Report Generation", "status": "completed", "duration": 3.2},
    ])
    c.execute(
        "INSERT OR IGNORE INTO pipeline_runs VALUES (?,?,?,?,?,?,?)",
        ("run-001","Full Security Pipeline","completed", stages, now, now, "Pipeline completed successfully. 12 findings processed.")
    )

    conn.commit()
    conn.close()


# ── Pydantic Models ──────────────────────────────────────────────────────────

class ScanCreate(BaseModel):
    name: str
    target: str
    scan_type: str = "full"

class FindingCreate(BaseModel):
    scan_id: str
    title: str
    description: str
    severity: str
    cvss_score: float
    category: str
    affected_asset: str
    recommendation: str

class FindingUpdate(BaseModel):
    status: Optional[str] = None
    recommendation: Optional[str] = None

class PipelineRun(BaseModel):
    name: str
    targets: List[str]
    scan_type: str = "full"


# ── AI Risk Scoring ───────────────────────────────────────────────────────────

def compute_ai_risk_score(severity: str, cvss: float, category: str) -> float:
    """Heuristic AI-style risk scoring with contextual weighting."""
    base = cvss
    severity_map = {"critical": 1.0, "high": 0.85, "medium": 0.65, "low": 0.4, "info": 0.1}
    category_weight = {
        "Injection": 1.05, "Authentication": 1.04, "Cryptography": 0.98,
        "API Security": 1.02, "Web Security": 0.97, "Information Disclosure": 0.90,
        "Network": 1.01
    }
    s_mult = severity_map.get(severity.lower(), 0.7)
    c_mult = category_weight.get(category, 1.0)
    score = round(min(base * s_mult * c_mult, 10.0), 2)
    return score

def get_risk_label(score: float) -> str:
    if score >= 9.0: return "Critical"
    if score >= 7.0: return "High"
    if score >= 4.0: return "Medium"
    if score >= 1.0: return "Low"
    return "Informational"

# ── API Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "DataOps Security Platform API", "version": "1.0.0", "status": "running"}

@app.get("/api/stats")
def get_stats():
    conn = get_db()
    c = conn.cursor()
    total_scans   = c.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
    total_findings = c.execute("SELECT COUNT(*) FROM findings").fetchone()[0]
    critical_count = c.execute("SELECT COUNT(*) FROM findings WHERE severity='critical'").fetchone()[0]
    high_count    = c.execute("SELECT COUNT(*) FROM findings WHERE severity='high'").fetchone()[0]
    open_count    = c.execute("SELECT COUNT(*) FROM findings WHERE status='open'").fetchone()[0]
    avg_risk      = c.execute("SELECT AVG(ai_risk_score) FROM findings").fetchone()[0] or 0
    conn.close()
    return {
        "total_scans": total_scans,
        "total_findings": total_findings,
        "critical": critical_count,
        "high": high_count,
        "open_findings": open_count,
        "avg_risk_score": round(avg_risk, 2),
        "risk_level": get_risk_label(avg_risk)
    }

# ── Scans ────────────────────────────────────────────────────────────────────

@app.get("/api/scans")
def list_scans():
    conn = get_db()
    rows = conn.execute("SELECT * FROM scans ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/scans/{scan_id}")
def get_scan(scan_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Scan not found")
    return dict(row)

@app.post("/api/scans", status_code=201)
def create_scan(payload: ScanCreate, bg: BackgroundTasks):
    scan_id = f"scan-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.utcnow().isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO scans (id,name,target,status,scan_type,created_at) VALUES (?,?,?,?,?,?)",
        (scan_id, payload.name, payload.target, "running", payload.scan_type, now)
    )
    conn.commit()
    conn.close()
    bg.add_task(simulate_scan, scan_id)
    return {"id": scan_id, "status": "running", "message": "Scan started"}

async def simulate_scan(scan_id: str):
    """Simulate a security scan running in background."""
    await asyncio.sleep(5)
    conn = get_db()
    sample_findings = [
        ("XSS Vulnerability", "Reflected XSS found in search parameter", "high", 7.4, "Web Security", "/search", "Sanitize and encode output"),
        ("Missing Security Headers", "X-Frame-Options and CSP headers absent", "medium", 5.3, "Web Security", "All pages", "Add security headers in server config"),
        ("Outdated Library", "jQuery 1.11 has known vulnerabilities", "low", 3.2, "Software", "/static/js", "Update to latest jQuery"),
    ]
    now = datetime.datetime.utcnow().isoformat()
    for i, (title, desc, sev, cvss, cat, asset, rec) in enumerate(sample_findings):
        fid = f"f-{uuid.uuid4().hex[:8]}"
        ai_score = compute_ai_risk_score(sev, cvss, cat)
        conn.execute(
            "INSERT INTO findings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            (fid, scan_id, title, desc, sev, cvss, ai_score, cat, asset, rec, "open", now)
        )
    conn.execute(
        "UPDATE scans SET status='completed', completed_at=?, findings_count=?, risk_score=? WHERE id=?",
        (now, len(sample_findings), 6.5, scan_id)
    )
    conn.commit()
    conn.close()

# ── Findings ─────────────────────────────────────────────────────────────────

@app.get("/api/findings")
def list_findings(scan_id: Optional[str] = None, severity: Optional[str] = None, status: Optional[str] = None):
    conn = get_db()
    query = "SELECT * FROM findings WHERE 1=1"
    params = []
    if scan_id:
        query += " AND scan_id=?"; params.append(scan_id)
    if severity:
        query += " AND severity=?"; params.append(severity)
    if status:
        query += " AND status=?"; params.append(status)
    query += " ORDER BY ai_risk_score DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/findings/{finding_id}")
def get_finding(finding_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM findings WHERE id=?", (finding_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Finding not found")
    return dict(row)

@app.post("/api/findings", status_code=201)
def create_finding(payload: FindingCreate):
    fid = f"f-{uuid.uuid4().hex[:8]}"
    ai_score = compute_ai_risk_score(payload.severity, payload.cvss_score, payload.category)
    now = datetime.datetime.utcnow().isoformat()
    conn = get_db()
    conn.execute(
        "INSERT INTO findings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        (fid, payload.scan_id, payload.title, payload.description, payload.severity,
         payload.cvss_score, ai_score, payload.category, payload.affected_asset,
         payload.recommendation, "open", now)
    )
    conn.commit()
    conn.close()
    return {"id": fid, "ai_risk_score": ai_score}

@app.patch("/api/findings/{finding_id}")
def update_finding(finding_id: str, payload: FindingUpdate):
    conn = get_db()
    updates, params = [], []
    if payload.status:
        updates.append("status=?"); params.append(payload.status)
    if payload.recommendation:
        updates.append("recommendation=?"); params.append(payload.recommendation)
    if not updates:
        raise HTTPException(400, "No updates provided")
    params.append(finding_id)
    conn.execute(f"UPDATE findings SET {', '.join(updates)} WHERE id=?", params)
    conn.commit()
    conn.close()
    return {"message": "Updated"}

# ── AI Risk Analysis ─────────────────────────────────────────────────────────

@app.get("/api/risk/summary")
def risk_summary():
    conn = get_db()
    rows = conn.execute("""
        SELECT severity, COUNT(*) as count, AVG(ai_risk_score) as avg_score,
               AVG(cvss_score) as avg_cvss
        FROM findings
        GROUP BY severity
        ORDER BY avg_score DESC
    """).fetchall()
    categories = conn.execute("""
        SELECT category, COUNT(*) as count, AVG(ai_risk_score) as avg_score
        FROM findings GROUP BY category ORDER BY avg_score DESC
    """).fetchall()
    conn.close()
    return {
        "by_severity": [dict(r) for r in rows],
        "by_category": [dict(r) for r in categories],
        "prioritized_findings": get_prioritized(5)
    }

def get_prioritized(limit: int = 5):
    conn = get_db()
    rows = conn.execute(
        "SELECT id, title, severity, ai_risk_score, affected_asset FROM findings WHERE status='open' ORDER BY ai_risk_score DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/risk/prioritized")
def prioritized_findings(limit: int = 10):
    return get_prioritized(limit)

# ── Reports ──────────────────────────────────────────────────────────────────

@app.post("/api/reports/generate/{scan_id}")
def generate_report(scan_id: str):
    conn = get_db()
    scan = conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
    if not scan:
        conn.close()
        raise HTTPException(404, "Scan not found")
    findings = conn.execute(
        "SELECT * FROM findings WHERE scan_id=? ORDER BY ai_risk_score DESC", (scan_id,)
    ).fetchall()

    # Build report content
    scan_d = dict(scan)
    findings_d = [dict(f) for f in findings]
    critical = [f for f in findings_d if f["severity"] == "critical"]
    high     = [f for f in findings_d if f["severity"] == "high"]
    medium   = [f for f in findings_d if f["severity"] == "medium"]
    low      = [f for f in findings_d if f["severity"] == "low"]

    report = {
        "report_id": f"rpt-{uuid.uuid4().hex[:8]}",
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "scan": scan_d,
        "executive_summary": {
            "total_findings": len(findings_d),
            "critical": len(critical),
            "high": len(high),
            "medium": len(medium),
            "low": len(low),
            "overall_risk_score": scan_d.get("risk_score", 0),
            "risk_level": get_risk_label(scan_d.get("risk_score", 0)),
            "recommendation": (
                "Immediate remediation required for critical findings before production deployment."
                if critical else "Review and patch high-severity findings within 30 days."
            )
        },
        "findings": findings_d,
        "remediation_roadmap": [
            {
                "priority": 1, "timeframe": "Immediate (< 24h)",
                "items": [f["title"] for f in critical]
            },
            {
                "priority": 2, "timeframe": "Short-term (< 7 days)",
                "items": [f["title"] for f in high]
            },
            {
                "priority": 3, "timeframe": "Medium-term (< 30 days)",
                "items": [f["title"] for f in medium]
            },
            {
                "priority": 4, "timeframe": "Long-term (< 90 days)",
                "items": [f["title"] for f in low]
            },
        ]
    }

    rid = report["report_id"]
    now = datetime.datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO reports VALUES (?,?,?,?,?,?)",
        (rid, scan_id, f"Security Report - {scan_d['name']}", "json", now, json.dumps(report))
    )
    conn.commit()
    conn.close()
    return report

@app.get("/api/reports")
def list_reports():
    conn = get_db()
    rows = conn.execute("SELECT id,scan_id,title,format,generated_at FROM reports ORDER BY generated_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/reports/{report_id}")
def get_report(report_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM reports WHERE id=?", (report_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Report not found")
    d = dict(row)
    d["content"] = json.loads(d["content"])
    return d

# ── Pipeline ─────────────────────────────────────────────────────────────────

@app.get("/api/pipeline")
def list_pipelines():
    conn = get_db()
    rows = conn.execute("SELECT * FROM pipeline_runs ORDER BY started_at DESC").fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        d["stages"] = json.loads(d["stages"])
        result.append(d)
    return result

@app.post("/api/pipeline/run", status_code=202)
def run_pipeline(payload: PipelineRun, bg: BackgroundTasks):
    run_id = f"run-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.utcnow().isoformat()
    stages = json.dumps([
        {"name": "Data Ingestion", "status": "pending", "duration": None},
        {"name": "Vulnerability Scan", "status": "pending", "duration": None},
        {"name": "AI Risk Scoring", "status": "pending", "duration": None},
        {"name": "Report Generation", "status": "pending", "duration": None},
    ])
    conn = get_db()
    conn.execute(
        "INSERT INTO pipeline_runs VALUES (?,?,?,?,?,?,?)",
        (run_id, payload.name, "running", stages, now, None, "Pipeline started...")
    )
    conn.commit()
    conn.close()
    bg.add_task(simulate_pipeline, run_id)
    return {"run_id": run_id, "status": "running"}

async def simulate_pipeline(run_id: str):
    stage_durations = [2.1, 8.5, 3.2, 1.8]
    stage_names = ["Data Ingestion", "Vulnerability Scan", "AI Risk Scoring", "Report Generation"]
    conn = get_db()
    for i, (name, dur) in enumerate(zip(stage_names, stage_durations)):
        await asyncio.sleep(dur)
        row = conn.execute("SELECT stages FROM pipeline_runs WHERE id=?", (run_id,)).fetchone()
        stages = json.loads(row[0])
        stages[i]["status"] = "completed"
        stages[i]["duration"] = dur
        conn.execute("UPDATE pipeline_runs SET stages=? WHERE id=?", (json.dumps(stages), run_id))
        conn.commit()
    now = datetime.datetime.utcnow().isoformat()
    conn.execute(
        "UPDATE pipeline_runs SET status='completed', completed_at=?, logs=? WHERE id=?",
        (now, "All pipeline stages completed successfully.", run_id)
    )
    conn.commit()
    conn.close()

@app.get("/api/pipeline/{run_id}")
def get_pipeline(run_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM pipeline_runs WHERE id=?", (run_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Pipeline run not found")
    d = dict(row)
    d["stages"] = json.loads(d["stages"])
    return d

