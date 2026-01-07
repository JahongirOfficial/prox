#!/bin/bash

echo "🔄 VPS'da prox.uz'ni to'liq qayta deploy qilish..."

# VPS'ga ulanish va deploy qilish
ssh root@45.92.173.33 << 'EOF'
cd /opt/prox.uz

echo "📥 Git pull..."
git pull

echo "🛠️ Dependencies o'rnatish..."
cd server && npm install && cd ..

echo "🏗️ Build qilish..."
npm run build

echo "🔄 PM2 qayta ishga tushirish..."
pm2 delete prox-uz-backend || true
pm2 start ecosystem.config.cjs

echo "📊 Status tekshirish..."
pm2 status

echo "✅ Deploy tugadi!"
EOF