#!/bin/bash

# 🚀 Simple Deploy Script untuk Hostinger
# Cara paling mudah: Upload file → Jalankan script

echo "🚀 Simple Production Deploy..."

# Set production mode
export NODE_ENV=production

# Navigate ke directory (path Hostinger Anda)
cd /home/u876970616/public_html

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start server in silent mode
echo "🤫 Starting server in silent mode..."
nohup npm run start:prod:silent > /dev/null 2>&1 &

echo "✅ Done! Server running in silent mode"
echo "🌐 Website: https://yourdomain.com"
