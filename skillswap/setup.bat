@echo off
REM SkillSwap Quick Setup Script for Windows

echo.
echo 🚀 SkillSwap Setup Script
echo =========================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js version: %NODE_VERSION%

REM Setup Backend
echo.
echo 📦 Setting up Backend...
cd backend
call npm install

REM Check if .env exists
if not exist .env (
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update backend/.env with your credentials
)

echo ✓ Backend setup complete

REM Setup Frontend
echo.
echo 🎨 Setting up Frontend...
cd ../frontend
call npm install
echo ✓ Frontend setup complete

echo.
echo =========================
echo ✅ Setup Complete!
echo.
echo To start the application:
echo 1. Terminal 1:  cd backend && npm start
echo 2. Terminal 2:  cd frontend && npm run dev
echo.
echo Then open: http://localhost:3000
echo.
pause
