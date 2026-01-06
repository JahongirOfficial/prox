# 🧪 Test Qo'llanmasi - proX Academy (Yangilangan)

## 1️⃣ Loyihani Ishga Tushirish

```bash
npm run dev
```

Natija:
- ✅ Frontend: http://localhost:5173
- ✅ Backend: http://localhost:5000
- ✅ MongoDB: Connected

---

## 2️⃣ Admin Sifatida Login

1. Browser'da `http://localhost:5173` oching
2. Login sahifasida:
   - **Username:** `admin`
   - **Parol:** `admin123`
3. "Kirish" tugmasini bosing
4. Zamonaviy Dashboard'ga o'tasiz

---

## 3️⃣ Yangi O'quvchi Qo'shish (Modal orqali)

### Dashboard'da:
1. O'ng yuqori burchakda **"O'quvchi Qo'shish"** tugmasini bosing
2. Modal oyna ochiladi
3. Formani to'ldiring:
   - **To'liq ism:** Masalan, "Ali Valiyev"
   - **Username:** Masalan, "ali" (avtomatik kichik harfga o'zgaradi)
   - **Parol:** Masalan, "ali123" (kamida 6 ta belgi)
4. **"Qo'shish"** tugmasini bosing
5. Muvaffaqiyatli xabar ko'rasiz (modal avtomatik yopiladi)
6. Yangi o'quvchi jadvalda paydo bo'ladi

### Xususiyatlar:
- ✅ Modal oyna (alert emas!)
- ✅ Real-time validation
- ✅ Success/Error xabarlari modal ichida
- ✅ Avtomatik jadval yangilanadi
- ✅ Modal avtomatik yopiladi

---

## 4️⃣ Yangi O'quvchi Sifatida Login

1. Logout qiling (Sidebar pastidagi "Chiqish" tugmasi)
2. Login sahifasiga qaytasiz
3. Yangi yaratilgan o'quvchi ma'lumotlari bilan login qiling:
   - **Username:** `ali`
   - **Parol:** `ali123`
4. Dashboard'ga kirasiz

---

## 5️⃣ Navigatsiya Test

Sidebar'dagi barcha sahifalarni sinab ko'ring:
- ✅ **Dashboard** - O'quvchilar ro'yxati va statistika
- ✅ **Leaderboard** - Reyting jadvali
- ✅ **Qarzdorlar** - To'lov qilmaganlar
- ✅ **Loyihalar** - Talabalar loyihalari

### Dizayn Xususiyatlari:
- ✅ Gradient backgrounds
- ✅ Glassmorphism effects
- ✅ Material Icons (emoji emas!)
- ✅ Smooth animations
- ✅ Hover effects
- ✅ Modern cards va tables

---

## 🎯 Kutilgan Natijalar

### Dashboard:
- ✅ Zamonaviy gradient dizayn
- ✅ 3 ta statistika karta (Jami O'quvchilar, Faol Darslar, Tugallangan)
- ✅ O'quvchilar jadvali
- ✅ "O'quvchi Qo'shish" tugmasi (admin uchun)
- ✅ Modal oyna (alert emas!)

### Modal Oyna:
- ✅ Backdrop blur effect
- ✅ Close tugmasi
- ✅ Form validation
- ✅ Success/Error xabarlari
- ✅ Loading state
- ✅ Avtomatik yopilish

### Sidebar:
- ✅ Material Icons
- ✅ Active state (gradient border)
- ✅ Hover effects
- ✅ Logout tugmasi

---

## 🐛 Muammolar

### Modal ochilmayapti?
- Admin sifatida login qilganingizni tekshiring
- Browser console'da xatoliklarni ko'ring

### O'quvchi qo'shilmayapti?
- Backend ishga tushganligini tekshiring
- MongoDB ulanganligini tekshiring
- Username unique ekanligini tekshiring

### Login qilolmayapman?
- Username to'g'ri yozilganligini tekshiring (kichik harflar)
- Parol to'g'ri ekanligini tekshiring

---

## 🎨 Dizayn Elementlari

### Ranglar:
- Primary: Blue (#3B82F6) → Purple (#9333EA) gradient
- Background: Slate-900 → Slate-800 gradient
- Cards: Slate-800/50 with backdrop blur
- Borders: Slate-700/50

### Icons:
- Material Symbols Outlined
- Emoji yo'q!
- Har bir sahifa uchun unique icon

### Effects:
- Glassmorphism (backdrop-blur)
- Gradient borders
- Smooth transitions
- Hover animations

---

**Omad!** 🚀
