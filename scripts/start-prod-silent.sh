#!/bin/bash

# Script khusus untuk menjalankan npm run start:prod:silent di Hostinger
# Pastikan aplikasi berjalan dengan silent mode

echo "🚀 Starting production server in silent mode..."

# Set environment
export NODE_ENV=production

# Navigate to project directory
cd "$(dirname "$0")/.."

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    exit 1
fi

# Kill existing node processes
echo "🔄 Stopping existing processes..."
pkill -f "node server.js" || true
sleep 2

# Create logs directory if not exists
mkdir -p logs

# Start server with silent mode
echo "🤫 Starting server in silent mode..."
nohup npm run start:prod:silent > logs/app.log 2>&1 &
APP_PID=$!

# Wait a moment to check if it started
sleep 3

# Check if process is running
if ps -p $APP_PID > /dev/null; then
    echo "✅ Server started successfully in silent mode!"
    echo "📋 Process ID: $APP_PID"
    echo "📁 Logs: logs/app.log"
    echo "🌐 Application should be available at: https://yourdomain.com"
else
    echo "❌ Failed to start server!"
    echo "📋 Checking logs..."
    tail -20 logs/app.log
    exit 1
fi

# Save PID to file for management
echo $APP_PID > logs/app.pid
echo "💾 Process ID saved to logs/app.pid"

echo ""
echo "🔧 Management Commands:"
echo "  Stop:  pkill -f \"node server.js\""
echo "  Logs:  tail -f logs/app.log"
echo "  Status: ps aux | grep \"node server.js\" | grep -v grep"
