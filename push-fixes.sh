#!/bin/bash

# Push all fixes to GitHub

echo "📝 Adding all changes..."
git add .

echo "💾 Committing changes..."
git commit -m "Fix JWT authentication and port configuration

- Added JWT_SECRET directly to ecosystem.config.cjs
- Changed backend port from 5003 to 5004
- Updated nginx to proxy to port 5004
- Created DEPLOY_NOW.sh for easy VPS deployment
- Updated deploy.sh to delete and recreate PM2 process
- Added comprehensive safety notes and instructions"

echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Done! Now run on VPS:"
echo ""
echo "  cd /opt/prox.uz"
echo "  git pull"
echo "  chmod +x DEPLOY_NOW.sh"
echo "  ./DEPLOY_NOW.sh"
echo ""

