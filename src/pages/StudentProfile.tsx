import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentsService, Student } from '../services/studentsService'
import { AlertCircle, ArrowLeft, TrendingUp, Zap, Star, Calendar, Phone, LogOut } from 'lucide-react'

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Check if viewing own profile
  const currentUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()
  const isOwnProfile = currentUser?._id === id || currentUser?.id === id

  useEffect(() => {
    if (!id) return
    fetchStudent()
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const data = await studentsService.getStudentById(id!)
      setStudent(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'O\'quvchi ma\'lumotlarini yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  const getDaysSinceJoin = (student: Student) => {
    const dateStr = student.joinDate || student.created_at
    if (!dateStr) return 1
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return 1
    return Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  }

  const getProgress = (step: number, days: number) => {
    return Math.max(0, Math.round((Number(step || 0) / Math.max(1, days)) * 100))
  }

  const getInitials = (name?: string) => {
    const safe = (name || '').trim()
    if (!safe) return 'U'
    return safe.split(/\s+/).slice(0, 2).map(p => (p[0] || '').toUpperCase()).join('') || 'U'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-red-400 text-sm">{error || "O'quvchi topilmadi"}</p>
        <button onClick={() => navigate('/students')} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">
          Orqaga
        </button>
      </div>
    )
  }

  const days = getDaysSinceJoin(student)
  const progress = getProgress(student.step, days)
  const isDebtor = progress < 100
  const joinDate = new Date(student.joinDate || student.created_at).toLocaleDateString('uz-UZ')

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Back Button */}
      {!isOwnProfile && (
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>
      )}

      {/* Profile Header */}
      <div className={`p-5 rounded-xl border ${
        isDebtor ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            isDebtor ? 'bg-red-500/15' : 'bg-emerald-500/15'
          }`}>
            <span className={`font-bold text-xl ${isDebtor ? 'text-red-400' : 'text-emerald-400'}`}>
              {getInitials(student.name)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{student.name || 'Nomsiz'}</h1>
            <p className="text-sm text-slate-500">{student.subscriptionPlan || 'Kurs'}</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-bold ${isDebtor ? 'text-red-400' : 'text-emerald-400'}`}>
              {progress}%
            </span>
            <p className="text-xs text-slate-500">Progress</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-slate-500">Qadam</span>
          </div>
          <p className="text-lg font-bold text-white">{student.step || 0}</p>
        </div>
        
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-slate-500">Ball</span>
          </div>
          <p className="text-lg font-bold text-white">{student.totalBall || 0}</p>
        </div>
        
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-500">Kun</span>
          </div>
          <p className="text-lg font-bold text-white">{days}</p>
        </div>
        
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-500">Sur'at</span>
          </div>
          <p className="text-lg font-bold text-white">{(student.step / days).toFixed(1)}/kun</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Progress</span>
          <span className={`text-sm font-semibold ${isDebtor ? 'text-red-400' : 'text-emerald-400'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isDebtor ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {student.step || 0} qadam / {days} kun = {progress}%
        </p>
      </div>

      {/* Info */}
      <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Telefon</span>
          <div className="flex items-center gap-2 text-white text-sm">
            <Phone className="w-4 h-4 text-slate-500" />
            {student.phone || '-'}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Kelgan sana</span>
          <span className="text-white text-sm">{joinDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Username</span>
          <span className="text-white text-sm">@{student.username || '-'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Holat</span>
          <span className={`text-sm ${student.is_blocked ? 'text-red-400' : 'text-emerald-400'}`}>
            {student.is_blocked ? 'Bloklangan' : 'Faol'}
          </span>
        </div>
      </div>

      {/* Logout Button - Only for own profile */}
      {isOwnProfile && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Chiqish</span>
        </button>
      )}
    </div>
  )
}
