// O'quvchi ma'lumotlarini localStorage da saqlash uchun funksiyalar
export const saveStudentData = (studentData) => {
  try {
    localStorage.setItem('prox_student_data', JSON.stringify(studentData));
  } catch (error) {
    console.error('Error saving student data:', error);
  }
};

export const getStudentData = () => {
  try {
    const data = localStorage.getItem('prox_student_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting student data:', error);
    return null;
  }
};

export const clearStudentData = () => {
  try {
    localStorage.removeItem('prox_student_data');
  } catch (error) {
    console.error('Error clearing student data:', error);
  }
};

// Progress hisoblash funksiyasi
export const calculateProgress = (studentData) => {
  if (!studentData || !studentData.joinDate) {
    return 0;
  }

  const joinDate = new Date(studentData.joinDate);
  const now = new Date();
  const diffTime = Math.abs(now - joinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Masalan, 30 kun ichida 100% progress
  const totalDays = 30;
  const progress = Math.min((diffDays / totalDays) * 100, 100);

  return Math.round(progress);
};
