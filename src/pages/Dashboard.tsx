import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getCurrentUser()
        setUser(response.user)
        fetchStudents()
      } catch (error) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  const fetchStudents = async () => {
    try {
      const response = await api.get('/users')
      setStudents(response.data.users)
    } catch (error) {
      console.error('Foydalanuvchilarni yuklashda xatolik')
    }
  }



  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')
    setModalLoading(true)

    try {
      await api.put(`/users/${selectedStudent._id}`, formData)
      setModalSuccess(`O'quvchi muvaffaqiyatli yangilandi!`)
      fetchStudents()
      setTimeout(() => {
        setShowEditModal(false)
        setModalSuccess('')
        setFormData({ fullName: '', username: '', password: '' })
      }, 2000)
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteStudent = async () => {
    setModalLoading(true)
    try {
      await api.delete(`/users/${selectedStudent._id}`)
      fetchStudents()
      setShowDeleteModal(false)
      setSelectedStudent(null)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setModalLoading(false)
    }
  }

  const openEditModal = (student: any) => {
    setSelectedStudent(student)
    setFormData({
      fullName: student.fullName,
      username: student.username,
      password: '',
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (student: any) => {
    setSelectedStudent(student)
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
              <span className="material-symbols-outlined animate-spin text-4xl text-purple-400">progress_activity</span>
            </div>
            <p className="text-slate-300 text-lg">Yuklanmoqda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar isLoggedIn={true} userRole={user?.role} isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} title="Dashboard" subtitle={`Xush kelibsiz, ${user?.fullName}`} />

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <div className="hidden lg:block">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h2>
              <p className="text-slate-400">Xush kelibsiz, {user?.fullName}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-purple-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-slate-400 text-sm font-medium">Jami O'quvchilar</h4>
                <span className="material-symbols-outlined text-purple-400 text-2xl sm:text-3xl">group</span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white">{students.length}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-pink-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-slate-400 text-sm font-medium">Faol Darslar</h4>
                <span className="material-symbols-outlined text-pink-400 text-2xl sm:text-3xl">school</span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white">0</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 hover:border-green-500/50 transition sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-slate-400 text-sm font-medium">Tugallangan</h4>
                <span className="material-symbols-outlined text-green-400 text-2xl sm:text-3xl">check_circle</span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-white">0</p>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-700/50">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined">group</span>
                <span>O'quvchilar Ro'yxati</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm">#</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm">Ism</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm hidden sm:table-cell">Username</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm hidden md:table-cell">Role</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm hidden lg:table-cell">Sana</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-slate-300 font-medium text-sm">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={student._id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-300 text-sm">{index + 1}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white font-medium text-sm">
                          <div>
                            <div>{student.fullName}</div>
                            <div className="text-xs text-slate-400 sm:hidden">{student.username}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-300 text-sm hidden sm:table-cell">{student.username}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                            student.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          }`}>
                            {student.role}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-slate-400 text-xs sm:text-sm hidden lg:table-cell">
                          {new Date(student.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-1.5 sm:p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-300 rounded-lg transition"
                              title="Tahrirlash"
                            >
                              <span className="material-symbols-outlined text-sm sm:text-base">edit</span>
                            </button>
                            {student.role !== 'admin' && (
                              <button
                                onClick={() => openDeleteModal(student)}
                                className="p-1.5 sm:p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition"
                                title="O'chirish"
                              >
                                <span className="material-symbols-outlined text-sm sm:text-base">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined text-4xl sm:text-5xl mb-2 opacity-50">group_off</span>
                        <p className="text-sm sm:text-base">Hozircha o'quvchilar yo'q</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>



      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-400">edit</span>
                  <span>Tahrirlash</span>
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setModalError('')
                    setModalSuccess('')
                    setFormData({ fullName: '', username: '', password: '' })
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditStudent} className="p-4 sm:p-6 space-y-4">
              {modalError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-xl">error</span>
                  <span className="text-xs sm:text-sm">{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg sm:text-xl">check_circle</span>
                  <span className="text-xs sm:text-sm">{modalSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  To'liq ism
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="Ism Familiya"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Yangi Parol (ixtiyoriy)
                </label>
                <input
                  type="text"
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="Bo'sh qoldiring agar o'zgartirmasangiz"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-2 sm:py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {modalLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    <span>Saqlash</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl transform transition-all">
            <div className="p-4 sm:p-6 border-b border-slate-700">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">warning</span>
                <span>O'chirish</span>
              </h3>
            </div>

            <div className="p-4 sm:p-6">
              <p className="text-slate-300 mb-6 text-sm sm:text-base">
                <span className="font-semibold text-white">{selectedStudent?.fullName}</span> ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedStudent(null)
                  }}
                  className="flex-1 py-2 sm:py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm sm:text-base"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeleteStudent}
                  disabled={modalLoading}
                  className="flex-1 py-2 sm:py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {modalLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      <span>O'chirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>O'chirish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
