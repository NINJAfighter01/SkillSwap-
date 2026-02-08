@echo off
REM Navigate to the backend directory
cd backend
REM Install backend dependencies
npm install
REM Navigate to the frontend directory
cd ../frontend
REM Install frontend dependencies
npm install
REM Create .env file from example
copy .env.example .env
REM Start the backend server
start cmd /k "npm start"
REM Start the frontend development server
start cmd /k "npm run dev"