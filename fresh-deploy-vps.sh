#!/bin/bash

echo "🔄 VPS'da prox.uz'ni to'liq qayta deploy qilish..."

# VPS'ga ulanish va to'liq qayta deploy qilish
ssh root@45.92.173.33 << 'EOF'

echo "🛑 PM2 process'ni to'xtatish..."
pm2 delete prox-uz-backend || true

echo "🗑️ Eski prox.uz papkasini o'chirish..."
cd /opt
rm -rf prox.uz

echo "📥 GitHub'dan qayta clone qilish..."
git clone https://github.com/ozodbek2410/prox.uz.git
cd prox.uz

echo "📋 .env.production faylini yaratish..."
cat > .env.production << 'ENVEOF'
VITE_API_URL=https://prox.uz/api
MONGODB_URI=mongodb+srv://CRM_group_12coder:HxFIrM4Ge66tde9Z@cluster1.viyjahc.mongodb.net/prox_crm?retryWrites=true&w=majority
ENVEOF

echo "📦 Dependencies o'rnatish..."
npm install

echo "📦 Server dependencies o'rnatish..."
cd server && npm install && cd ..

echo "🏗️ Build qilish..."
npm run build

echo "📁 Logs papkasini yaratish..."
mkdir -p logs

echo "🚀 PM2 bilan ishga tushirish..."
pm2 start ecosystem.config.cjs

echo "📊 Status tekshirish..."
pm2 status

echo "⏳ 5 sekund kutish..."
sleep 5

echo "🧪 Login API test qilish..."
echo '{"username":"Mentor01","password":"Mentor01"}' > test-login.json
curl -X POST http://localhost:5004/api/auth/login -H 'Content-Type: application/json' -d @test-login.json

echo ""
echo "✅ Fresh deploy tugadi!"

EOF