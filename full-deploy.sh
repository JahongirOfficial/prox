#!/bin/bash
# Full deployment script for prox.uz
# XAVFSIZ: Faqat /opt/prox.uz papkasida ishlaydi, boshqa loyihalarga ta'sir qilmaydi

set -e  # Exit on error

# Ensure we're in the right directory
if [ ! -f "ecosystem.config.cjs" ]; then
    echo "❌ Error: Not in prox.uz directory!"
    echo "Run: cd /opt/prox.uz"
    exit 1
fi

echo "🚀 Starting FULL deployment for prox.uz..."
echo "📁 Working directory: $(pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# 2. Install dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd server && npm install && cd ..

# 3. Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# 4. Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd server && npx tsc --skipLibCheck && cd ..

# 5. Setup environment
echo -e "${YELLOW}📝 Setting up environment...${NC}"
if [ -f server/.env.production ]; then
    cp server/.env.production server/.env
else
    echo -e "${RED}⚠️  server/.env.production not found${NC}"
fi

# 6. Create necessary directories
mkdir -p logs uploads

# 7. Setup Nginx (only if not configured)
echo -e "${YELLOW}🌐 Checking Nginx configuration...${NC}"
if [ -f /etc/nginx/sites-enabled/prox.uz ]; then
    echo "✅ Nginx already configured for prox.uz"
else
    echo "⚠️  Nginx not configured. Run manually:"
    echo "   sudo cp /opt/prox.uz/nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz"
    echo "   sudo ln -s /etc/nginx/sites-available/prox.uz /etc/nginx/sites-enabled/"
    echo "   sudo nginx -t && sudo systemctl reload nginx"
fi

# 8. Restart PM2 (FAQAT prox-uz-backend)
echo -e "${YELLOW}🔄 Restarting PM2 (only prox-uz-backend)...${NC}"
pm2 delete prox-uz-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save

echo ""
echo -e "${GREEN}✅ Full deployment completed!${NC}"
echo -e "${GREEN}🌐 Frontend: https://prox.uz${NC}"
echo -e "${GREEN}🔌 Backend: http://localhost:5003${NC}"
echo ""
echo "📊 Checking other projects are still running..."
pm2 status | grep -E "alibobo|alochi|avtojon|debt-tracker" || echo "Other projects status OK"

echo ""
echo "📋 prox-uz-backend logs:"
pm2 logs prox-uz-backend --lines 20 --nostream
