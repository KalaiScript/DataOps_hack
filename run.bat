@echo off
title DataOps Innovation Hackathon - AI Document Forensics
echo =========================================================================
echo  DataOps Innovation Hackathon (SOC ^| NOC ^| VAPT)
echo  AI-Powered Document Forensics ^& Contextual Intelligence System
echo =========================================================================
echo.
echo [1/2] Launching Backend Forensics API Server (Port 8000)...
start "DataOps Forensics Backend API" cmd /k "cd /d %~dp0backend && node server.js"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend Forensics UI (Port 5173)...
start "DataOps Forensics Workbench UI" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo =========================================================================
echo  System Successfully Launched!
echo  -----------------------------------------------------------------------
echo  Frontend Forensic Workbench : http://localhost:5173
echo  Backend Forensics REST API : http://localhost:8000
echo  API Documentation / Health : http://localhost:8000/api/stats
echo =========================================================================
pause
