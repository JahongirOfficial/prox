# Push all fixes to GitHub

Write-Host "📝 Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Fix JWT authentication and port configuration

- Added JWT_SECRET directly to ecosystem.config.cjs
- Changed backend port from 5003 to 5004
- Updated nginx to proxy to port 5004
- Created DEPLOY_NOW.sh for easy VPS deployment
- Updated deploy.sh to delete and recreate PM2 process
- Added comprehensive safety notes and instructions"

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Done! Now run on VPS:" -ForegroundColor Green
Write-Host ""
Write-Host "  cd /opt/prox.uz" -ForegroundColor Cyan
Write-Host "  git pull" -ForegroundColor Cyan
Write-Host "  chmod +x DEPLOY_NOW.sh" -ForegroundColor Cyan
Write-Host "  ./DEPLOY_NOW.sh" -ForegroundColor Cyan
Write-Host ""

