#!/bin/bash
# RENTIT Application Startup Script

echo "🚀 Starting RENTIT Application..."
echo "=================================="

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies if needed
echo ""
echo "📦 Installing dependencies..."
cd backend
if [ -f "package.json" ]; then
    npm install > /dev/null 2>&1
    echo "✅ Backend dependencies installed"
fi

cd ../frontend
if [ -f "package.json" ]; then
    npm install > /dev/null 2>&1
    echo "✅ Frontend dependencies installed"
fi

cd ..

# Start backend in background
echo ""
echo "🔧 Starting Backend Server..."
cd backend
npm run dev &
BACKEND_PID=$!
echo "✅ Backend running (PID: $BACKEND_PID)"

# Wait a moment for backend to start
sleep 3

# Start frontend in another terminal or background
echo ""
echo "⚛️  Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend running (PID: $FRONTEND_PID)"

echo ""
echo "=================================="
echo "🎉 RENTIT Application Started!"
echo "=================================="
echo "Backend URL: http://localhost:5000"
echo "Frontend URL: http://localhost:5173"
echo "API Docs: http://localhost:5000/api-docs"
echo ""
echo "Press Ctrl+C to stop the application"

# Keep the script running
wait
