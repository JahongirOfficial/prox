const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Barcha o'quvchilarni olish
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: 'O\'quvchilarni yuklashda xatolik' });
  }
});

// Yangi o'quvchi yaratish
router.post('/students', async (req, res) => {
  try {
    const { studentId, name, joinDate } = req.body;

    // Agar studentId berilmagan bo'lsa, avtomatik yaratish
    const finalStudentId = studentId || `STU_${Date.now()}`;

    const student = new Student({
      studentId: finalStudentId,
      name: name || 'Yangi O\'quvchi',
      joinDate: joinDate ? new Date(joinDate) : new Date()
    });

    await student.save();
    res.status(201).json({ student });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Bu student ID allaqachon mavjud' });
    } else {
      res.status(500).json({ error: 'O\'quvchi yaratishda xatolik' });
    }
  }
});

// O'quvchi ma'lumotlarini yangilash
router.put('/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    const student = await Student.findOneAndUpdate(
      { studentId, isActive: true },
      { ...updates, progress: undefined }, // progress avtomatik hisoblanadi
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'O\'quvchi yangilashda xatolik' });
  }
});

// O'quvchi progressini yangilash
router.patch('/students/:studentId/progress', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId, isActive: true });
    if (!student) {
      return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    }

    // Progress avtomatik hisoblanadi
    student.progress = student.calculatedProgress;
    await student.save();

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Progress yangilashda xatolik' });
  }
});

// O'quvchi sertifikatini qo'shish
router.post('/students/:studentId/certificates', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { certificate } = req.body;

    const student = await Student.findOne({ studentId, isActive: true });
    if (!student) {
      return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    }

    if (!student.certificates.includes(certificate)) {
      student.certificates.push(certificate);
      await student.save();
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Sertifikat qo\'shishda xatolik' });
  }
});

// O'quvchi ogohlantirishini qo'shish
router.post('/students/:studentId/warnings', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { warning } = req.body;

    const student = await Student.findOne({ studentId, isActive: true });
    if (!student) {
      return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    }

    if (!student.warnings.includes(warning)) {
      student.warnings.push(warning);
      await student.save();
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Ogohlantirish qo\'shishda xatolik' });
  }
});

// O'quvchini o'chirish (deaktivatsiya)
router.delete('/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOneAndUpdate(
      { studentId },
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'O\'quvchi topilmadi' });
    }

    res.json({ message: 'O\'quvchi muvaffaqiyatli o\'chirildi' });
  } catch (error) {
    res.status(500).json({ error: 'O\'quvchi o\'chirishda xatolik' });
  }
});

module.exports = router;
