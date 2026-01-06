# 🚀 Quick Start Guide - proX Academy

## Tezkor Boshlash (5 daqiqa)

### 1️⃣ Dependencies O'rnatish
```bash
npm run setup
```

### 2️⃣ Loyihani Ishga Tushirish
```bash
npm run dev
```

### 3️⃣ Login Qilish
- Browser'da: `http://localhost:5173`
- **Username:** `student`
- **Parol:** `student123`

## ✅ Tayyor!

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

---

## 📝 Qo'shimcha Ma'lumot

### Yangi O'quvchi Qo'shish
```bash
cd server
npx tsx src/scripts/clearAndCreateUser.ts
```

### Alohida Ishga Tushirish

**Faqat Frontend:**
```bash
npm run dev:frontend
```

**Faqat Backend:**
```bash
npm run dev:backend
```

### Environment Variables

Agar `.env` fayllar yo'q bo'lsa:

**Root papkada `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

**`server/.env`:**
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## 🎯 Asosiy Xususiyatlar

✅ Username-based login
✅ JWT authentication
✅ MongoDB Atlas
✅ Zamonaviy UI dizayn
✅ Responsive design
✅ Protected routes

---

**Muammo bo'lsa:** README.md faylini o'qing yoki admin bilan bog'laning.
