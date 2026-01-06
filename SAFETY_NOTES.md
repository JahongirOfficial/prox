# Safety Notes - Boshqa Loyihalarga Ta'sir Qilmasligi

## Xavfsizlik Kafolatlari

### 1. Papka Izolyatsiyasi
Barcha scriptlar faqat `/opt/prox.uz` papkasida ishlaydi:
```bash
cd /opt/prox.uz  # Faqat shu papkada
npm install      # Faqat prox.uz dependencies
npm run build    # Faqat prox.uz build
```

### 2. PM2 Process Izolyatsiyasi
PM2 process faqat `prox-uz-backend` nomli:
```bash
pm2 restart prox-uz-backend  # Faqat prox.uz backend
pm2 delete prox-uz-backend   # Faqat prox.uz o'chiradi
```

Boshqa processlar:
- `alibobo-backend` - tegmaydi ✅
- `alochi-backend` - tegmaydi ✅
- `avtojon-api` - tegmaydi ✅
- `debt-tracker` - tegmaydi ✅
- va boshqalar...

### 3. Port Izolyatsiyasi
Har bir loyiha o'z portida:
- prox.uz backend: `5003` ✅
- alochi backend: boshqa port ✅
- alibobo backend: boshqa port ✅

### 4. Nginx Izolyatsiyasi
Har bir loyiha o'z nginx config fayliga ega:
```
/etc/nginx/sites-available/
├── prox.uz              # Faqat prox.uz uchun
├── alochi.uz            # Alochi uchun
├── alibobo.uz           # Alibobo uchun
└── ...
```

Nginx config faqat prox.uz uchun:
```nginx
server {
    server_name prox.uz www.prox.uz;  # Faqat prox.uz
    root /opt/prox.uz/dist;           # Faqat prox.uz files
    
    location /api {
        proxy_pass http://localhost:5003;  # Faqat prox.uz backend
    }
}
```

### 5. Database Izolyatsiyasi
Har bir loyiha o'z database'iga ulangan:
- prox.uz: `prox_crm` database ✅
- alochi: boshqa database ✅
- alibobo: boshqa database ✅

### 6. Logs Izolyatsiyasi
Har bir loyiha o'z log papkasiga yozadi:
```
/opt/prox.uz/logs/        # Faqat prox.uz logs
/opt/alochi/logs/         # Alochi logs
/opt/alibobo/logs/        # Alibobo logs
```

## Xavfsiz Deployment Qoidalari

### ✅ XAVFSIZ (Faqat prox.uz ga ta'sir qiladi)
```bash
cd /opt/prox.uz
./full-deploy.sh              # ✅ Faqat prox.uz
./quick-fix-deploy.sh         # ✅ Faqat prox.uz
pm2 restart prox-uz-backend   # ✅ Faqat prox.uz
npm run build                 # ✅ Faqat prox.uz
```

### ⚠️ EHTIYOT (Barcha loyihalarga ta'sir qilishi mumkin)
```bash
pm2 restart all               # ⚠️ BARCHA processlarni restart qiladi
sudo systemctl restart nginx  # ⚠️ BARCHA saytlarni restart qiladi
sudo reboot                   # ⚠️ BUTUN serverni restart qiladi
```

### ❌ ISHLATMANG (Xavfli)
```bash
cd /opt && rm -rf *           # ❌ BARCHA loyihalarni o'chiradi
pm2 delete all                # ❌ BARCHA processlarni o'chiradi
sudo rm /etc/nginx/sites-*    # ❌ BARCHA nginx configlarni o'chiradi
```

## Tekshirish

### Faqat prox.uz ishlayotganini tekshirish:
```bash
# PM2 da faqat prox-uz-backend restart bo'lganini ko'rish
pm2 status
# Restart count faqat prox-uz-backend da oshgan bo'lishi kerak

# Boshqa loyihalar ishlayotganini tekshirish
curl http://localhost:5001/api/health  # Alochi
curl http://localhost:5002/api/health  # Alibobo
# Barchasi "ok" qaytarishi kerak
```

### Nginx barcha saytlar uchun ishlayotganini tekshirish:
```bash
curl https://alochi.uz        # ✅ Ishlashi kerak
curl https://alibobo.uz       # ✅ Ishlashi kerak
curl https://prox.uz          # ✅ Ishlashi kerak
```

## Muammo Bo'lsa

Agar biror loyihaga ta'sir qilgan bo'lsa:

### PM2 processni tiklash:
```bash
cd /opt/[loyiha-nomi]
pm2 restart [process-name]
```

### Nginx tiklash:
```bash
sudo nginx -t                 # Config tekshirish
sudo systemctl reload nginx   # Reload (restart emas!)
```

## Xulosa

✅ Barcha scriptlar **FAQAT** `/opt/prox.uz` papkasida ishlaydi
✅ PM2 commands **FAQAT** `prox-uz-backend` processiga ta'sir qiladi
✅ Nginx config **FAQAT** `prox.uz` domain uchun
✅ Port **FAQAT** `5003` ishlatiladi
✅ Database **FAQAT** `prox_crm` ishlatiladi

**Boshqa loyihalarga HECH QANDAY ta'sir qilmaydi!** 🛡️
