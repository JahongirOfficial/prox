#!/bin/bash
# Quick fix for deployment - skip scripts compilation

echo "🚀 Quick deployment fix..."

# Build only main server code (exclude scripts)
cd server
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building server (excluding scripts)..."
npx tsc --skipLibCheck

cd ..

# Copy env file
echo "📝 Setting up environment..."
cp server/.env.production server/.env 2>/dev/null || echo "⚠️  .env.production not found, using existing .env"

# Create logs directory
mkdir -p logs

# Restart PM2
echo "🔄 Restarting PM2..."
pm2 restart prox-uz-backend || pm2 start ecosystem.config.cjs
pm2 save

echo "✅ Deployment completed!"
pm2 status
