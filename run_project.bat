@echo off
echo ==========================================
echo   🏨 STARTING HOTEL RESERVATION SYSTEM
echo ==========================================
echo.
echo [1/2] Checking backend folder...
cd backend
echo [2/2] Starting Node.js server...
echo.
echo 🚀 App will be live at: http://localhost:5000
echo 📋 Press Ctrl+C to stop the server.
echo.
node server.js
pause
