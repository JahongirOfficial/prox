# Full Deployment Guide - prox.uz

## Quick Deploy (Recommended)

### On VPS:
```bash
cd /opt/prox.uz
git pull
chmod +x full-deploy.sh
./full-deploy.sh
```

## Manual Step-by-Step Deployment

### 1. Push Changes from Windows
```bash
cd prox.uz
git add .
git commit -m "Fix: ESM imports and full deployment"
git push origin main
```

### 2. On VPS - Pull Latest Code
```bash
cd /opt/prox.uz
git pull origin main
```

### 3. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 4. Build Frontend
```bash
npm run build
# This creates /opt/prox.uz/dist folder
```

### 5. Build Backend
```bash
cd server
npx tsc --skipLibCheck
cd ..
# This creates /opt/prox.uz/server/dist folder
```

### 6. Setup Environment
```bash
# Create server/.env if not exists
cat > server/.env << 'EOF'
MONGODB_URI=mongodb+srv://CRM_group_12coder:HxFIrM4Ge66tde9Z@cluster1.viyjahc.mongodb.net/prox_crm?retryWrites=true&w=majority
PORT=5003
NODE_ENV=production
JWT_SECRET=prox-uz-secret-key-2024
EOF
```

### 7. Setup Nginx
```bash
# Copy nginx config
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz

# Enable site
sudo ln -sf /etc/nginx/sites-available/prox.uz /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 8. Setup SSL (if not done)
```bash
sudo certbot --nginx -d prox.uz -d www.prox.uz
```

### 9. Start/Restart Backend with PM2
```bash
# Delete old process if exists
pm2 delete prox-uz-backend

# Start new process
pm2 start ecosystem.config.cjs

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
```

### 10. Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs prox-uz-backend --lines 50

# Test backend
curl http://localhost:5003/api/health

# Test frontend
curl https://prox.uz
```

## Troubleshooting

### Backend not starting
```bash
# Check logs
pm2 logs prox-uz-backend

# Check if port is in use
lsof -i :5003

# Restart
pm2 restart prox-uz-backend
```

### Nginx 500 error
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/prox.uz-error.log

# Check if backend is running
curl http://localhost:5003/api/health

# Restart nginx
sudo systemctl restart nginx
```

### Frontend not loading
```bash
# Check if dist folder exists
ls -la /opt/prox.uz/dist

# Rebuild frontend
cd /opt/prox.uz
npm run build

# Check nginx config
sudo nginx -t
```

### Module not found errors
```bash
# Rebuild backend with skipLibCheck
cd /opt/prox.uz/server
rm -rf dist
npx tsc --skipLibCheck

# Restart PM2
pm2 restart prox-uz-backend
```

## File Structure
```
/opt/prox.uz/
├── dist/                    # Frontend build (served by nginx)
│   ├── index.html
│   └── assets/
├── server/
│   ├── dist/               # Backend build (run by PM2)
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── models/
│   ├── src/                # Backend source
│   ├── .env                # Backend environment
│   └── package.json
├── logs/                   # PM2 logs
├── uploads/                # User uploads
├── ecosystem.config.cjs    # PM2 config
├── nginx-prox.uz.conf      # Nginx config
└── package.json            # Frontend package
```

## Important URLs
- Frontend: https://prox.uz
- Backend API: https://prox.uz/api
- Backend Health: https://prox.uz/api/health

## PM2 Commands
```bash
pm2 status                          # Show all processes
pm2 logs prox-uz-backend           # Show logs
pm2 restart prox-uz-backend        # Restart
pm2 stop prox-uz-backend           # Stop
pm2 delete prox-uz-backend         # Delete
pm2 monit                          # Monitor
```

## Nginx Commands
```bash
sudo nginx -t                       # Test config
sudo systemctl status nginx         # Check status
sudo systemctl restart nginx        # Restart
sudo systemctl reload nginx         # Reload config
sudo tail -f /var/log/nginx/prox.uz-error.log  # Watch error log
```
