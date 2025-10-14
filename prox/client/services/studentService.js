// MongoDB bilan ishlash uchun API funksiyalari
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const studentAPI = {
  // Barcha o'quvchilarni olish
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) {
        throw new Error('O\'quvchilarni yuklashda xatolik');
      }
      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // O'quvchi yaratish
  createStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'O\'quvchi yaratishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // O'quvchi yangilash
  updateStudent: async (studentId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'O\'quvchi yangilashda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // Progress yangilash
  updateProgress: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/progress`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Progress yangilashda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // Sertifikat qo'shish
  addCertificate: async (studentId, certificate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificate }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sertifikat qo\'shishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // Ogohlantirish qo'shish
  addWarning: async (studentId, warning) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}/warnings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ warning }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ogohlantirish qo\'shishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  },

  // O'quvchi o'chirish
  deleteStudent: async (studentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'O\'quvchi o\'chirishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('API xatoligi:', error);
      throw error;
    }
  }
};

// Progress hisoblash (local)
export const calculateProgress = (joinDate) => {
  if (!joinDate) return 0;

  const joinDateObj = new Date(joinDate);
  const now = new Date();
  const diffTime = Math.abs(now - joinDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 30 kun ichida 100% progress
  const totalDays = 30;
  return Math.min((diffDays / totalDays) * 100, 100);
};
