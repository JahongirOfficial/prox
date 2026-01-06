#!/bin/bash

echo "🔧 Fixing JWT and deploying prox.uz..."

# Navigate to project directory
cd /opt/prox.uz

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Build backend
echo "🔨 Building backend..."
cd server && npm run build && cd ..

# Update nginx configuration
echo "🔧 Updating nginx configuration..."
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz
sudo nginx -t && sudo systemctl reload nginx

# Stop and delete old PM2 process
echo "🛑 Stopping old PM2 process..."
pm2 delete prox-uz-backend 2>/dev/null || echo "Process not found, continuing..."

# Start fresh PM2 process with new environment
echo "🚀 Starting PM2 with new environment..."
pm2 start ecosystem.config.cjs

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
pm2 logs prox-uz-backend --lines 20

