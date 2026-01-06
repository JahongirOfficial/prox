#!/bin/bash
# Fix ESM imports and deploy

echo "🔧 Fixing ESM imports and deploying..."

cd /opt/prox.uz
git pull

# Rebuild backend only
cd server
echo "🔨 Rebuilding backend..."
npx tsc --skipLibCheck

cd ..

# Restart PM2
echo "🔄 Restarting backend..."
pm2 restart prox-uz-backend

echo "✅ Done!"
pm2 logs prox-uz-backend --lines 20 --nostream
