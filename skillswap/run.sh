#!/bin/bash

echo ""
echo "========================================"
echo "  SkillSwap - Starting Project"
echo "========================================"
echo ""

# Check if node_modules exist, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing root dependencies..."
    npm install concurrently
    if [ $? -ne 0 ]; then
        echo "Error installing root dependencies"
        exit 1
    fi
fi

# Check and install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing backend dependencies"
        exit 1
    fi
    cd ..
fi

# Check and install frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "Error installing frontend dependencies"
        exit 1
    fi
    cd ..
fi

# Check and create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo ""
    echo "IMPORTANT: Update backend/.env with your credentials:"
    echo "  - JWT_SECRET (change to random value)"
    echo "  - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (optional)"
    echo "  - OAuth credentials (optional)"
    echo ""
fi

echo ""
echo "========================================"
echo "  Starting Frontend and Backend Servers"
echo "========================================"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "========================================"
echo ""

# Start both servers concurrently
npm start
