@echo off
echo ========================================================
echo  DataOps Innovation Hackathon - Security Platform
echo ========================================================
echo Starting Backend API Server (Port 8000)...
start "DataOps Backend API" cmd /k "cd /d %~dp0backend && node server.js"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting Frontend Dev Server (Port 5173)...
start "DataOps Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Application is launching!
echo Backend API:  http://localhost:8000
echo Frontend UI:  http://localhost:5173
echo ========================================================
pause

