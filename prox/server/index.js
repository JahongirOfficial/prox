import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// .env faylini yuklash
dotenv.config();

// ES module uchun __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB ulanish
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB ga muvaffaqiyatli ulanildi"))
.catch((err) => console.error("❌ MongoDB ulanish xatoligi:", err));

// Routes
import studentRoutes from "./routes/students.js"; 
app.use("/api", studentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend ishlamoqda" });
});

// React build fayllarini servis qilish (Vite output)
const distPath = path.join(process.cwd(), "dist/spa");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server xatoligi:", err);
  res.status(500).json({ error: "Server ichki xatoligi" });
});

// Server ishga tushirish – PM2 bilan boshqariladi (node-build tomonidan)
if (process.env.DIRECT_LISTEN === "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portda ishlamoqda`);
  });
}
