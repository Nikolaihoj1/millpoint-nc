@echo off
echo ========================================
echo  MillPoint NC Frontend Preview
echo ========================================
echo.
cd frontend
echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.
echo [2/2] Starting development server...
echo.
echo Once started, open your browser to: http://localhost:5173
echo.
call npm run dev

