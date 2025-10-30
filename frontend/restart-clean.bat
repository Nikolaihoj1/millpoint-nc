@echo off
echo Cleaning Vite cache and restarting...
echo.
rmdir /s /q node_modules\.vite 2>nul
echo Cache cleared!
echo.
echo Starting dev server...
npm run dev

