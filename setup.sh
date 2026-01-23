#!/bin/bash

# RENTIT Quick Start Setup Script
# This script sets up the entire RENTIT project with all dependencies

echo "=================================================="
echo "  RENTIT - Room Rental Management System"
echo "  Quick Start Setup"
echo "=================================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ NPM version: $(npm --version)"
echo ""

# Navigate to backend
echo "📦 Installing Backend Dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"
cd ..

# Navigate to frontend
echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"
cd ..

echo ""
echo "=================================================="
echo "✓ Installation Complete!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create Backend Configuration:"
echo "   - Copy backend/.env.example to backend/.env"
echo "   - Update with your MongoDB URI and Khalti keys"
echo ""
echo "2. Create Frontend Configuration:"
echo "   - Copy frontend/.env.example to frontend/.env.local"
echo "   - Update with your Firebase and API configuration"
echo ""
echo "3. Start Backend Server (in terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "4. Start Frontend Server (in terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "5. Access the application:"
echo "   Backend API: http://localhost:5000"
echo "   Frontend: http://localhost:5173"
echo "   API Documentation: http://localhost:5000/api-docs"
echo ""
echo "=================================================="
