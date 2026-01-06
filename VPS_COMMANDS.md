# 🚀 Prox.uz VPS Deploy Buyruqlari

## Port: 5003 (boshqa loyihalarga zarar bermaydi)

### 1. VPS'ga kirish
```bash
ssh root@45.92.173.33
cd /opt/prox.uz
```

### 2. Yangilanishlarni olish
```bash
git pull
```

### 3. Deploy qilish
```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Nginx konfiguratsiyasini o'rnatish (faqat birinchi marta)
```bash
# Config faylini ko'chirish
sudo cp nginx-prox.uz.conf /etc/nginx/sites-available/prox.uz

# Symbolic link yaratish
sudo ln -s /etc/nginx/sites-available/prox.uz /etc/nginx/sites-enabled/

# Nginx testdan o'tkazish
sudo nginx -t

# Nginx'ni qayta ishga tushirish
sudo systemctl restart nginx
```

### 5. SSL sertifikat (ixtiyoriy)
```bash
sudo certbot --nginx -d prox.uz -d www.prox.uz
```

## Monitoring

```bash
# PM2 status
pm2 status

# Prox.uz loglarini ko'rish
pm2 logs prox-uz-backend

# Nginx loglar
sudo tail -f /var/log/nginx/prox.uz-access.log
```

## Muammolar

```bash
# PM2'ni qayta ishga tushirish
pm2 restart prox-uz-backend

# PM2'ni to'liq qayta yuklash
pm2 delete prox-uz-backend
pm2 start ecosystem.config.cjs

# Nginx'ni qayta ishga tushirish
sudo systemctl restart nginx
```

## Portlar ro'yxati (boshqa loyihalar bilan konflikt bo'lmasligi uchun)

- Port 5003: prox.uz backend
- Port 80/443: Nginx (barcha loyihalar uchun)

## Xavfsizlik

Firewall sozlamalari:
```bash
sudo ufw status
sudo ufw allow 5003/tcp
```
