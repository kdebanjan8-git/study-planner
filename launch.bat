@echo off
title Smart Study Planner Launcher
echo =======================================================
echo          Starting Smart Study Planner...
echo =======================================================

cd /d "%~dp0"

:: Check if port 8000 is already running
netstat -ano | findstr /R ":8000.*LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Server is already running on port 8000.
) else (
    echo [INFO] Launching background server on port 8000...
    start "SmartStudyPlannerServer" /min python server.py
    timeout /t 2 /nobreak >nul
)

echo [INFO] Opening Smart Study Planner Login in your browser...
start http://localhost:8000/login.html

echo =======================================================
echo   Smart Study Planner is running at:
echo   Login Page: http://localhost:8000/login.html
echo   Dashboard:  http://localhost:8000/index.html
echo.
echo   To stop the server at any time, run stop.bat
echo =======================================================
timeout /t 3 >nul
exit
