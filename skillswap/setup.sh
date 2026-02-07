#!/bin/bash

# SkillSwap Quick Setup Script

echo "🚀 SkillSwap Setup Script"
echo "========================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

echo "✓ Node.js version: $(node -v)"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend
npm install

# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your credentials"
fi

echo "✓ Backend setup complete"

# Setup Frontend
echo ""
echo "🎨 Setting up Frontend..."
cd ../frontend
npm install
echo "✓ Frontend setup complete"

echo ""
echo "========================="
echo "✅ Setup Complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1:  cd backend && npm start"
echo "2. Terminal 2:  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
