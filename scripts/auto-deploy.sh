#!/bin/bash

# Auto-deploy script for Hostinger
# This script runs on the Hostinger server after GitHub push

echo "🚀 Starting auto-deploy from GitHub..."

# Set environment
export NODE_ENV=production

# Navigate to project directory
cd /home/your-username/public_html || exit 1

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build assets
echo "🔨 Building assets..."
if [ -f "scripts/build-assets.js" ]; then
    node scripts/build-assets.js
fi

# Create/update .env file
echo "⚙️ Setting up environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
Your-Private-Key-Here
-----END PRIVATE KEY-----"
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SITE_URL=https://yourdomain.com
SITE_NAME=GROW SYNERGY INDONESIA
EOF

# Set file permissions
echo "🔒 Setting permissions..."
chmod -R 755 public/ uploads/
chmod 600 .env

# Restart application dengan npm run start:prod:silent
echo "🔄 Restarting application..."
# Kill existing process if running
pkill -f "node server.js" || true
# Start with silent mode
nohup npm run start:prod:silent > /dev/null 2>&1 &
echo "✅ Application started in silent mode"

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: https://yourdomain.com"

# Show status
ps aux | grep "node server.js" | grep -v grep
