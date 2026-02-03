#!/bin/bash

# 🚀 Auto-Detect Path Script untuk Hostinger
# Script ini otomatis cari path yang benar

echo "🔍 Mencari path Hostinger yang benar..."

# Cari kemungkinan path
POSSIBLE_PATHS=(
    "/home/$USER/public_html"
    "/home/$(whoami)/public_html" 
    "/var/www/html"
    "/public_html"
    "./"
)

FOUND_PATH=""

for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/package.json" ]; then
        FOUND_PATH="$path"
        echo "✅ Ditemukan: $path"
        break
    fi
done

if [ -z "$FOUND_PATH" ]; then
    echo "❌ Path tidak ditemukan secara otomatis"
    echo "🔍 Coba cari manual:"
    find / -name "package.json" 2>/dev/null | head -5
    exit 1
fi

echo "🚀 Deploy ke: $FOUND_PATH"

# Navigate ke directory
cd "$FOUND_PATH"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start server in silent mode
echo "🤫 Starting server in silent mode..."
nohup npm run start:prod:silent > /dev/null 2>&1 &

echo "✅ Done! Server running in silent mode"
echo "🌐 Website: https://yourdomain.com"
