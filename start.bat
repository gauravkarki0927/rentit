@echo off
REM RENTIT Application Startup Script for Windows

echo.
echo ================================
echo.
echo   🚀 Starting RENTIT Application
echo.
echo ================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Install backend dependencies
echo.
echo 📦 Installing Backend dependencies...
cd backend
call npm install >nul 2>&1
echo ✅ Backend dependencies installed

REM Install frontend dependencies
echo 📦 Installing Frontend dependencies...
cd ..\frontend
call npm install >nul 2>&1
echo ✅ Frontend dependencies installed

cd ..

REM Start backend server
echo.
echo 🔧 Starting Backend Server on port 5000...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak

REM Start frontend server
echo ⚛️  Starting Frontend Server on port 5173...
start cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo 🎉 RENTIT Application Started!
echo ================================
echo.
echo 📍 Backend URL:    http://localhost:5000
echo 📍 Frontend URL:   http://localhost:5173
echo 📍 API Docs:       http://localhost:5000/api-docs
echo.
echo ⏹️  Close the terminal windows to stop the application
echo.
timeout /t 5 /nobreak
