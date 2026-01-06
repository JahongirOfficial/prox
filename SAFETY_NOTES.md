# ⚠️ SAFETY NOTES - PROX.UZ DEPLOYMENT

## CRITICAL RULES

### ❌ NEVER DO THESE:
1. **NEVER** use `pm2 delete all` - this will delete ALL projects
2. **NEVER** use `pm2 restart all` - this will restart ALL projects
3. **NEVER** modify files outside `/opt/prox.uz` directory
4. **NEVER** change nginx configs for other sites

### ✅ ALWAYS DO THESE:
1. **ALWAYS** use `pm2 delete prox-uz-backend` (specific name)
2. **ALWAYS** use `pm2 restart prox-uz-backend` (specific name)
3. **ALWAYS** test changes in `/opt/prox.uz` only
4. **ALWAYS** verify other projects are still running after changes

## CURRENT CONFIGURATION

### Ports:
- **prox.uz backend**: Port 5004 (changed from 5003)
- **avtojon-api**: Port 5003 (DO NOT TOUCH)
- **Other projects**: Various ports (DO NOT TOUCH)

### PM2 Processes:
```
prox-uz-backend  - Our project (safe to restart/delete)
alibobo-backend  - DO NOT TOUCH
alochi-backend   - DO NOT TOUCH
avtojon-api      - DO NOT TOUCH
debt-tracker     - DO NOT TOUCH
... (all others) - DO NOT TOUCH
```

## QUICK DEPLOYMENT STEPS

### Option 1: Use DEPLOY_NOW.sh (Recommended)
```bash
cd /opt/prox.uz
chmod +x DEPLOY_NOW.sh
./DEPLOY_NOW.sh
```

### Option 2: Manual Steps
```bash
cd /opt/prox.uz

# Pull changes
git stash
git pull

# Build
npm install
cd server && npm install && cd ..
npm run build
cd server && npm run build && cd ..

# Update nginx
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz
sudo nginx -t && sudo systemctl reload nginx

# Restart backend (ONLY prox-uz-backend)
pm2 delete prox-uz-backend
pm2 start ecosystem.config.cjs
pm2 save
```

## FIXES APPLIED

### 1. JWT_SECRET Issue - FIXED ✅
- Added JWT_SECRET directly to `ecosystem.config.cjs`
- Value: `prox-uz-super-secret-key-2024-production`
- No longer depends on .env file loading

### 2. Port Conflict - FIXED ✅
- Changed backend from port 5003 to 5004
- Updated nginx to proxy to 5004
- Port 5003 remains free for avtojon-api

### 3. Nginx Configuration - FIXED ✅
- Updated proxy_pass to localhost:5004
- Correct root path: `/opt/prox.uz/dist`
- SSL configuration intact

## VERIFICATION COMMANDS

```bash
# Check PM2 status (should show all projects running)
pm2 list

# Check prox.uz backend logs
pm2 logs prox-uz-backend --lines 20

# Test backend API
curl http://localhost:5004/api/health

# Test frontend
curl https://prox.uz

# Check nginx
sudo nginx -t
sudo systemctl status nginx

# Verify port 5004 is in use
lsof -i :5004
```

## TROUBLESHOOTING

### If JWT still fails:
```bash
pm2 delete prox-uz-backend
pm2 start /opt/prox.uz/ecosystem.config.cjs
pm2 logs prox-uz-backend
```

### If port conflict:
```bash
# Check what's using the port
lsof -i :5004

# If needed, kill only that process
lsof -ti:5004 | xargs kill -9
```

### If nginx 500 error:
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/prox.uz-error.log

# Verify dist folder exists
ls -la /opt/prox.uz/dist

# Rebuild frontend if needed
cd /opt/prox.uz && npm run build
```

## EMERGENCY ROLLBACK

If something breaks:
```bash
# Stop prox-uz only
pm2 delete prox-uz-backend

# Verify other projects still running
pm2 list

# Check nginx for other sites
curl https://alibobo.uz
curl https://alochi.uz
```

---

**Last Updated**: January 6, 2026
**Status**: Ready for deployment
**Next Step**: Run `./DEPLOY_NOW.sh` on VPS
