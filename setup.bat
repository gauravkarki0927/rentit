@echo off
REM RENTIT Quick Start Setup Script for Windows
REM This script sets up the entire RENTIT project with all dependencies

echo ==================================================
echo   RENTIT - Room Rental Management System
echo   Quick Start Setup
echo ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js v16 or higher.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version
echo NPM version: 
npm --version
echo.

REM Install Backend Dependencies
echo Installing Backend Dependencies...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)

echo Backend dependencies installed successfully!
cd ..

REM Install Frontend Dependencies
echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

echo Frontend dependencies installed successfully!
cd ..

echo.
echo ==================================================
echo Installation Complete!
echo ==================================================
echo.
echo Next Steps:
echo.
echo 1. Create Backend Configuration:
echo    - Copy backend\.env.example to backend\.env
echo    - Update with your MongoDB URI and Khalti keys
echo.
echo 2. Create Frontend Configuration:
echo    - Copy frontend\.env.example to frontend\.env.local
echo    - Update with your Firebase and API configuration
echo.
echo 3. Start Backend Server (in terminal 1):
echo    cd backend
echo    npm run dev
echo.
echo 4. Start Frontend Server (in terminal 2):
echo    cd frontend
echo    npm run dev
echo.
echo 5. Access the application:
echo    Backend API: http://localhost:5000
echo    Frontend: http://localhost:5173
echo    API Documentation: http://localhost:5000/api-docs
echo.
echo ==================================================
echo.
pause
