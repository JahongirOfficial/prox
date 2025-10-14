import React, { useState, useEffect } from 'react';
import { saveStudentData, getStudentData, calculateProgress } from '../utils/studentUtils';

function ProxOffline() {
  const [studentData, setStudentData] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Sahifa yuklanganda o'quvchi ma'lumotlarini localStorage dan olish
    const savedData = getStudentData();
    if (savedData) {
      setStudentData(savedData);
      setProgress(calculateProgress(savedData));
    } else {
      // Agar ma'lumotlar yo'q bo'lsa, yangi o'quvchi yaratish
      const newStudentData = {
        id: Date.now().toString(),
        joinDate: new Date().toISOString(),
        name: 'Yangi O\'quvchi'
      };
      setStudentData(newStudentData);
      saveStudentData(newStudentData);
      setProgress(calculateProgress(newStudentData));
    }
  }, []);

  const resetStudent = () => {
    const newStudentData = {
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
      name: 'Yangi O\'quvchi'
    };
    setStudentData(newStudentData);
    saveStudentData(newStudentData);
    setProgress(calculateProgress(newStudentData));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-white mb-8">ProX Offline</h1>

      {studentData && (
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">O'quvchi Ma'lumotlari</h2>
          <div className="space-y-2 text-white">
            <p><strong>ID:</strong> {studentData.id}</p>
            <p><strong>Kelgan kuni:</strong> {new Date(studentData.joinDate).toLocaleDateString()}</p>
            <p><strong>Ism:</strong> {studentData.name}</p>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Progress</h2>
        <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-white text-center">{progress}%</p>
      </div>

      <button
        onClick={resetStudent}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        O'quvchi ma'lumotlarini tiklash
      </button>
    </div>
  );
}

export default ProxOffline;
