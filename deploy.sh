#!/bin/bash

# Prox.uz Deployment Script
echo "🚀 Starting Prox.uz deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="prox.uz"
DEPLOY_PATH="/opt/prox.uz"
PM2_APP_NAME="prox-uz-backend"

# Step 1: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes from Git...${NC}"
git pull origin main || git pull origin master

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd server && npm install && cd ..

# Step 3: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build

# Step 4: Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd server && npm run build && cd ..

# Step 5: Copy production environment files
echo -e "${YELLOW}📝 Setting up production environment...${NC}"
cp .env.production .env
cp server/.env.production server/.env

# Step 6: Create logs directory
mkdir -p logs

# Step 7: Restart PM2 process
echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
pm2 restart $PM2_APP_NAME || pm2 start ecosystem.config.cjs

# Step 8: Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application is running at: http://prox.uz${NC}"
echo -e "${GREEN}🔌 Backend running on port: 5003${NC}"

# Show PM2 status
pm2 status
