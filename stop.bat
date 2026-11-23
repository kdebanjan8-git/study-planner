@echo off
title Stop Smart Study Planner
echo =======================================================
echo          Stopping Smart Study Planner...
echo =======================================================

cd /d "%~dp0"
set STOPPED=0

:: Terminate by window title
taskkill /FI "WINDOWTITLE eq SmartStudyPlannerServer*" /F /T >nul 2>&1
if %ERRORLEVEL% EQU 0 set STOPPED=1

:: Terminate any lingering process bound to port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R ":8000.*LISTENING"') do (
    echo [INFO] Terminating server process (PID %%a)...
    taskkill /F /PID %%a >nul 2>&1
    set STOPPED=1
)

echo.
if "%STOPPED%"=="1" (
    echo [SUCCESS] Smart Study Planner server stopped successfully.
) else (
    echo [INFO] No active Smart Study Planner server was found on port 8000.
)

echo =======================================================
timeout /t 3 >nul
exit
