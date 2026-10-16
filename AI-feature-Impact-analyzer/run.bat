@echo off
title AI Feature Impact Analyzer
echo ========================================================
echo        AI Feature Impact Analyzer Launcher
echo ========================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

echo [1/3] Checking environment...
python --version
node -v

echo.
echo Configuration:
if "%OLLAMA_BASE_URL%"=="" (
    echo - OLLAMA_BASE_URL: default (http://localhost:11434 or .env)
) else (
    echo - OLLAMA_BASE_URL: %OLLAMA_BASE_URL%
)
if "%OLLAMA_MODEL%"=="" (
    echo - OLLAMA_MODEL: default (gemma4:12b or .env)
) else (
    echo - OLLAMA_MODEL: %OLLAMA_MODEL%
)

echo.
echo [2/3] Starting FastAPI Backend on http://localhost:8000...
start "AI Impact Analyzer - Backend" cmd /k "cd /d %~dp0backend && python run_server.py"

echo.
echo [3/3] Starting React Frontend on http://localhost:5173...
start "AI Impact Analyzer - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Servers launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:8000
echo - Swagger:  http://localhost:8000/docs
echo - Test CLI: cd backend ^&^& python test_connection.py
echo ========================================================
echo.
pause
