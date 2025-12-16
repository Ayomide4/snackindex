#!/bin/bash

# Start development servers for Snack Index
# This script starts both the backend and frontend in development mode

echo "🚀 Starting Snack Index Development Servers..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $1 is already in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

# Check if ports are available
echo "🔍 Checking ports..."
check_port 3001 || exit 1
check_port 3000 || exit 1

# Start backend in background
echo "🔧 Starting backend server (port 3001)..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server (port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait

