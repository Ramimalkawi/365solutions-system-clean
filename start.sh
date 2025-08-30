#!/bin/bash
echo "🚀 Starting 365Solutions Node.js Express Server..."
echo "📝 Environment: $NODE_ENV"
echo "🔧 Port: $PORT"
echo "📍 Running from: $(pwd)"
echo "📦 Node version: $(node --version)"
echo "🗂️ Files in directory:"
ls -la
echo "🏃 Starting Express server..."
exec node server.js
