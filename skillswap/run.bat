@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo  SkillSwap - Starting Project
echo ========================================
echo.

REM Check if node_modules exist, if not install dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    call npm install concurrently
    if !errorlevel! neq 0 (
        echo Error installing root dependencies
        exit /b 1
    )
)

REM Check and install backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if !errorlevel! neq 0 (
        echo Error installing backend dependencies
        exit /b 1
    )
    cd ..
)

REM Check and install frontend dependencies
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if !errorlevel! neq 0 (
        echo Error installing frontend dependencies
        exit /b 1
    )
    cd ..
)

REM Check and create .env file if it doesn't exist
if not exist "backend\.env" (
    echo Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo.
    echo! IMPORTANT: Update backend\.env with your credentials:
    echo   - JWT_SECRET (change to random value)
    echo   - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (optional)
    echo   - OAuth credentials (optional)
    echo.
)

echo.
echo ========================================
echo  Starting Frontend and Backend Servers
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================
echo.

REM Start both servers concurrently
call npm start

pause
