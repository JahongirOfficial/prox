const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB ulanish
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/prox_academy",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .then(() => {
    console.log("✅ MongoDB ga muvaffaqiyatli ulanildi");
  })
  .catch((error) => {
    console.error("❌ MongoDB ulanish xatoligi:", error);
  });

// Routes
const studentRoutes = require("./routes/students");
app.use("/api", studentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "ProX Academy Backend ishlamoqda",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint topilmadi" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server xatoligi:", error);
  res.status(500).json({ error: "Server ichki xatoligi" });
});

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`🚀 ProX Academy Backend ${PORT} portda ishlamoqda`);
});

module.exports = app;
