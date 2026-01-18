import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentsService, Student, Warning } from '../services/studentsService'
import { AlertCircle, Search, Users, TrendingUp, AlertTriangle, Plus, X, Trash2 } from 'lucide-react'

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningReason, setWarningReason] = useState('')
  const [warningLoading, setWarningLoading] = useState(false)

  // Current user role check
  let currentUserRole: string | null = null
  try {
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    currentUserRole = parsed?.role || null
  } catch {
    currentUserRole = null
  }
  const canManageWarnings = currentUserRole === 'admin' || currentUserRole === 'mentor'

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const data = await studentsService.getAllStudents()
      setStudents(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentClick = async (student: Student) => {
    if (!canManageWarnings) {
      navigate(`/student/${student._id}`)
      return
    }

    setSelectedStudent(student)
    try {
      const data = await studentsService.getWarnings(student._id)
      setWarnings(data.warnings)
    } catch (err) {
      console.error('Warning yuklashda xatolik:', err)
      setWarnings([])
    }
  }

  const handleAddWarning = async () => {
    if (!selectedStudent || !warningReason.trim()) return

    setWarningLoading(true)
    try {
      const data = await studentsService.addWarning(selectedStudent._id, warningReason)
      setWarnings(data.warnings)
      setWarningReason('')
      setShowWarningModal(false)
      
      // Update student in list
      setStudents(prev => prev.map(s => 
        s._id === selectedStudent._id 
          ? { ...s, warnings: data.warnings, is_blocked: data.is_blocked }
          : s
      ))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik')
    } finally {
      setWarningLoading(false)
    }
  }

  const handleRemoveWarning = async (warningIndex: number) => {
    if (!selectedStudent) return

    try {
      const data = await studentsService.removeWarning(selectedStudent._id, warningIndex)
      setWarnings(data.warnings)
      
      // Update student in list
      setStudents(prev => prev.map(s => 
        s._id === selectedStudent._id 
          ? { ...s, warnings: data.warnings, is_blocked: data.is_blocked }
          : s
      ))
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik')
    }
  }

  const getDaysSinceJoin = (student: Student) => {
    const dateStr = student.joinDate || student.created_at
    if (!dateStr) return 1
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return 1
    return Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }

  const getProgress = (step: number, days: number) => Math.max(0, Math.round((Number(step || 0) / Math.max(1, days)) * 100))

  const getInitials = (name?: string) => {
    const safe = (name || '').trim()
    if (!safe) return 'U'
    return safe.split(/\s+/).slice(0, 2).map(p => (p[0] || '').toUpperCase()).join('') || 'U'
  }

  const filteredStudents = students
    .filter(s => (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
    .sort((a, b) => getProgress(b.step, getDaysSinceJoin(b)) - getProgress(a.step, getDaysSinceJoin(a)))

  const stats = {
    total: students.length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + getProgress(s.step || 0, getDaysSinceJoin(s)), 0) / students.length)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={fetchStudents} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Qayta</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-white">O'quvchilar</h1>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-white">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-white">{stats.avgProgress}%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="O'quvchi qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">O'quvchilar topilmadi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredStudents.map((student) => {
            const progress = getProgress(student.step, getDaysSinceJoin(student))
            const isDebtor = progress < 100
            const warningCount = student.warnings?.length || 0

            return (
              <div
                key={student._id}
                onClick={() => handleStudentClick(student)}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                  student.is_blocked
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                    : isDebtor 
                      ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                      : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    student.is_blocked
                      ? 'bg-red-500/15'
                      : isDebtor ? 'bg-red-500/15' : 'bg-emerald-500/15'
                  }`}>
                    <span className={`font-bold text-lg ${
                      student.is_blocked
                        ? 'text-red-400'
                        : isDebtor ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {getInitials(student.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{student.name || 'Nomsiz'}</h3>
                    <p className="text-xs text-slate-500">@{student.username || 'noma\'lum'}</p>
                  </div>
                  {/* Warning indicator */}
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`w-4 h-4 ${warningCount >= 3 ? 'text-red-400' : 'text-yellow-400'}`} />
                      <span className={`text-xs font-bold ${warningCount >= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {warningCount}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Progress</span>
                    <span className={`font-semibold ${
                      student.is_blocked
                        ? 'text-red-400'
                        : isDebtor ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        student.is_blocked
                          ? 'bg-red-500'
                          : isDebtor ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{student.step || 0} qadam</span>
                    <span>{student.totalBall || 0} ball</span>
                  </div>
                  {student.is_blocked && (
                    <div className="text-xs text-red-400 font-medium">Bloklangan</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Warning Modal */}
      {selectedStudent && canManageWarnings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Ogohlantirish</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-white mb-1">{selectedStudent.name}</h3>
              <p className="text-sm text-slate-400">@{selectedStudent.username}</p>
            </div>

            {/* Current warnings */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Ogohlantirish ({warnings.length}/3)</span>
                {warnings.length < 3 && (
                  <button
                    onClick={() => setShowWarningModal(true)}
                    className="p-1 hover:bg-slate-700 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4 text-blue-400" />
                  </button>
                )}
              </div>

              {warnings.length === 0 ? (
                <p className="text-sm text-slate-500">Ogohlantirish yo'q</p>
              ) : (
                <div className="space-y-2">
                  {warnings.map((warning, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-white">{warning.reason}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(warning.date).toLocaleDateString('uz-UZ')} - {warning.given_by}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveWarning(index)}
                          className="p-1 hover:bg-slate-600 rounded transition ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent.is_blocked && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400 font-medium">Bu o'quvchi bloklangan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Ogohlantirish qo'shish</h3>
              <button
                onClick={() => setShowWarningModal(false)}
                className="p-1 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">Sabab</label>
              <textarea
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                placeholder="Ogohlantirish sababi..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAddWarning}
                disabled={!warningReason.trim() || warningLoading}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {warningLoading ? 'Qo\'shilmoqda...' : 'Qo\'shish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}