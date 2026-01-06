#!/bin/bash

# Quick deployment script for VPS
# Run this on VPS: cd /opt/prox.uz && chmod +x DEPLOY_NOW.sh && ./DEPLOY_NOW.sh

echo "🚀 Starting prox.uz deployment..."

# Kill any process on port 5003 (old port)
echo "🔪 Killing processes on port 5003..."
lsof -ti:5003 | xargs -r kill -9 2>/dev/null || echo "No process on 5003"

# Pull latest changes
echo "📥 Pulling from GitHub..."
git stash
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Build everything
echo "🔨 Building frontend..."
npm run build

echo "🔨 Building backend..."
cd server && npm run build && cd ..

# Update nginx
echo "🔧 Updating nginx..."
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz
sudo nginx -t && sudo systemctl reload nginx

# Restart PM2
echo "🔄 Restarting backend..."
pm2 delete prox-uz-backend 2>/dev/null || echo "Creating new process..."
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Checking status..."
pm2 list
echo ""
echo "📝 Recent logs:"
pm2 logs prox-uz-backend --lines 15 --nostream

echo ""
echo "🧪 Testing backend:"
curl http://localhost:5004/api/health
echo ""
echo ""
echo "🌐 Site: https://prox.uz"

