import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import api from '../services/api'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { Loader2, Users, UserPlus, X, AlertCircle, CheckCircle, Plus, Save, Trash2, Edit, AlertTriangle, UsersRound } from 'lucide-react'

export default function Students() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')
    setModalLoading(true)

    try {
      await api.post('/users/create', formData)
      setModalSuccess(`O'quvchi muvaffaqiyatli qo'shildi!`)
      setFormData({ fullName: '', username: '', password: '' })
      fetchStudents()
      setTimeout(() => {
        setShowModal(false)
        setModalSuccess('')
      }, 2000)
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Xatolik yuz berdi')
    } finally {
      setModalLoading(false)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar isLoggedIn={true} userRole={user?.role} isMobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} title="O'quvchilar" subtitle="Barcha o'quvchilar ro'yxati" />

      <main className="lg:ml-64 pt-20 lg:pt-0 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
            <div className="hidden lg:block">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 lg:w-10 lg:h-10 text-blue-400" />
                <span>O'quvchilar</span>
              </h2>
              <p className="text-slate-400">Barcha o'quvchilar ro'yxati</p>
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50"
              >
                <UserPlus className="w-5 h-5" />
                <span>O'quvchi Qo'shish</span>
              </button>
            )}
          </div>

          {/* Students Table */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm">#</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm">Ism</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm">Username</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm hidden sm:table-cell">Role</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm hidden md:table-cell">Sana</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-slate-300 font-medium text-sm">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr key={student._id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-300 text-sm">{index + 1}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-white font-medium text-sm">{student.fullName}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-300 text-sm">{student.username}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 hidden sm:table-cell">
                          <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                            student.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {student.role}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-slate-400 text-xs lg:text-sm hidden md:table-cell">
                          {new Date(student.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-300 rounded-lg transition"
                              title="Tahrirlash"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {student.role !== 'admin' && (
                              <button
                                onClick={() => openDeleteModal(student)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 rounded-lg transition"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <UsersRound className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Hozircha o'quvchilar yo'q</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl transform transition-all">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  <span>Yangi O'quvchi</span>
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setModalError('')
                    setModalSuccess('')
                    setFormData({ fullName: '', username: '', password: '' })
                  }}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{modalSuccess}</span>
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
                  onChange={(e) => {
                    const fullName = e.target.value
                    // Ism asosida avtomatik username yaratish (faqat harflar va raqamlar)
                    const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
                    setFormData({ ...formData, fullName, username })
                  }}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Ism Familiya"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Parol
                </label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Kamida 6 ta belgi"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Qo'shish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl transform transition-all">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-400" />
                  <span>O'quvchini Tahrirlash</span>
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
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{modalSuccess}</span>
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
                  onChange={(e) => {
                    const fullName = e.target.value
                    // Ism o'zgartirilganda username ham yangilanadi
                    const username = fullName.toLowerCase().replace(/[^a-z0-9]/g, '')
                    setFormData({ ...formData, fullName, username })
                  }}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Ism Familiya"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Login: {formData.username || 'avtomatik yaratiladi'}
                </p>
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Bo'sh qoldiring agar o'zgartirmasangiz"
                />
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
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
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>O'quvchini O'chirish</span>
              </h3>
            </div>

            <div className="p-6">
              <p className="text-slate-300 mb-6">
                <span className="font-semibold text-white">{selectedStudent?.fullName}</span> ni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedStudent(null)
                  }}
                  className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeleteStudent}
                  disabled={modalLoading}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>O'chirilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
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
