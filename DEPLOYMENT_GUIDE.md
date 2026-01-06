# Prox.uz Deployment Guide

## Prerequisites

1. **Node.js & npm** (v18 or higher)
2. **PM2** - Process manager
3. **Nginx** - Web server
4. **Git** - Version control
5. **MongoDB** - Database (already configured via MongoDB Atlas)

## Initial Setup on VPS

### 1. Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git (if not already installed)
sudo apt install -y git
```

### 2. Clone Repository

```bash
# Navigate to /opt directory
cd /opt

# Clone the repository
sudo git clone <your-repo-url> prox.uz

# Set permissions
sudo chown -R $USER:$USER /opt/prox.uz
cd /opt/prox.uz
```

### 3. Configure Environment Variables

Create production environment file:

```bash
# Frontend .env
cat > .env << EOF
VITE_API_URL=https://prox.uz/api
MONGODB_URI=mongodb+srv://CRM_group_12coder:HxFIrM4Ge66tde9Z@cluster1.viyjahc.mongodb.net/prox_crm?retryWrites=true&w=majority
EOF

# Backend .env
cat > server/.env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://CRM_group_12coder:HxFIrM4Ge66tde9Z@cluster1.viyjahc.mongodb.net/prox_crm?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
EOF
```

### 4. Initial Build & Deploy

```bash
# Make deploy script executable
chmod +x deploy.sh

# Run initial deployment
./deploy.sh
```

### 5. Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/prox.uz /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 6. Setup SSL Certificate (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d prox.uz -d www.prox.uz

# Auto-renewal is configured automatically
```

### 7. Configure PM2 Startup

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

## Deployment Process

### Quick Deploy

Simply run:

```bash
cd /opt/prox.uz
./deploy.sh
```

### Manual Deploy Steps

If you prefer manual deployment:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Build frontend
npm run build

# 4. Build backend
cd server && npm run build && cd ..

# 5. Restart PM2
pm2 restart prox-uz

# 6. Save PM2 configuration
pm2 save
```

## Monitoring

### Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs prox-uz

# Monitor resources
pm2 monit
```

### Check Nginx Status

```bash
# Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/prox.uz-access.log

# View error logs
sudo tail -f /var/log/nginx/prox.uz-error.log
```

## Troubleshooting

### Application Not Starting

```bash
# Check PM2 logs
pm2 logs prox-uz --lines 100

# Restart application
pm2 restart prox-uz

# If still not working, delete and restart
pm2 delete prox-uz
pm2 start ecosystem.config.cjs
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues

Check MongoDB connection string in `server/.env` and ensure:
- Correct credentials
- IP whitelist includes VPS IP (or 0.0.0.0/0 for all IPs)
- Network access is enabled in MongoDB Atlas

## Useful Commands

```bash
# View all PM2 processes
pm2 list

# Stop application
pm2 stop prox-uz

# Restart application
pm2 restart prox-uz

# Delete application from PM2
pm2 delete prox-uz

# View real-time logs
pm2 logs prox-uz --lines 50

# Reload nginx
sudo systemctl reload nginx

# Check disk space
df -h

# Check memory usage
free -h
```

## Security Recommendations

1. **Change JWT Secret**: Update `JWT_SECRET` in `server/.env`
2. **Firewall**: Configure UFW to allow only necessary ports
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
3. **Regular Updates**: Keep system and packages updated
4. **Backup**: Regular database backups
5. **Monitoring**: Set up monitoring and alerts

## Support

For issues or questions, contact the development team.
