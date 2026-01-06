import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentsService, Student } from '../services/studentsService'
import { AlertCircle, Users, TrendingUp, GraduationCap, Star, Zap, Calendar } from 'lucide-react'

export default function StudentsPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const tiltRafRef = useRef<number | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const data = await studentsService.getAllStudents()
      setStudents(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'O\'quvchilarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const getDaysSinceJoin = (student: Student) => {
    const dateStr = student.joinDate || student.created_at
    if (!dateStr) return 1
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return 1
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(1, diffDays + 1)
  }

  const getProgress = (step: number, daysSinceJoin: number) => {
    const safeStep = Number(step || 0)
    const safeDays = Math.max(1, Number(daysSinceJoin || 1))
    const raw = Math.round((safeStep / safeDays) * 100)
    return Math.max(0, raw)
  }

  const stats = {
    total: students.length,
    averageProgress: students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + getProgress(s.step || 0, getDaysSinceJoin(s)), 0) / students.length)
      : 0
  }

  const filteredStudents = students
    .filter(student =>
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const daysA = getDaysSinceJoin(a)
      const daysB = getDaysSinceJoin(b)
      const progressA = getProgress(a.step, daysA)
      const progressB = getProgress(b.step, daysB)
      return progressB - progressA
    })

  const handleStudentClick = (studentId: string) => {
    navigate(`/student/${studentId}`)
  }

  const getInitials = (name?: string) => {
    const safe = (name || '').trim()
    if (!safe) return 'U'
    const parts = safe.split(/\s+/).slice(0, 2)
    const letters = parts.map(p => (p[0] || '').toUpperCase()).join('')
    return letters || 'U'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm">Yuklanmoqda...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchStudents}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-xl font-medium active:scale-95 transition-transform"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">O'quvchilar</h1>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm font-medium">Jami o'quvchilar</span>
            <span className="bg-slate-700 text-white px-2.5 py-0.5 rounded-full text-sm font-bold">
              {stats.total}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span className="text-white text-sm font-medium">Umumiy foiz</span>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-sm font-bold">
              {stats.averageProgress}%
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="O'quvchini qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/40 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">O'quvchilar ro'yxati</h2>
          <span className="text-xs text-slate-400">{filteredStudents.length} ta o'quvchi</span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              {searchTerm ? 'Qidiruv bo\'yicha natija topilmadi' : 'Hozircha o\'quvchilar yo\'q'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">{filteredStudents.map((student, index) => {
              const daysSinceJoin = getDaysSinceJoin(student)
              const progress = getProgress(student.step, daysSinceJoin)
              const progressBar = Math.max(0, Math.min(100, progress))
              const isBlocked = student.is_blocked
              const isDebtor = progress < 100

              const accent = isBlocked
                ? {
                    border: 'from-red-500/35 via-rose-500/25 to-orange-500/25',
                    glow: 'shadow-[0_12px_40px_-24px_rgba(244,63,94,0.4)]',
                    chip: 'bg-red-500/15 text-red-300 border-red-500/30',
                    dot: 'bg-red-400',
                    bar: 'from-red-400 to-orange-400'
                  }
                : progress < 100
                  ? {
                      border: 'from-red-400/30 via-orange-500/25 to-yellow-500/25',
                      glow: 'shadow-[0_12px_40px_-24px_rgba(239,68,68,0.35)]',
                      chip: 'bg-red-500/15 text-red-300 border-red-500/30',
                      dot: 'bg-red-400',
                      bar: 'from-red-400 to-orange-400'
                    }
                : progress >= 100
                  ? {
                      border: 'from-emerald-400/30 via-cyan-500/25 to-blue-500/25',
                      glow: 'shadow-[0_12px_40px_-24px_rgba(34,197,94,0.35)]',
                      chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                      dot: 'bg-emerald-400',
                      bar: 'from-emerald-400 to-cyan-400'
                    }
                  : {
                      border: 'from-cyan-400/25 via-blue-500/20 to-purple-500/25',
                      glow: 'shadow-[0_12px_40px_-24px_rgba(56,189,248,0.35)]',
                      chip: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                      dot: 'bg-cyan-400',
                      bar: 'from-cyan-400 to-blue-500'
                    }
              
              return (
                <div 
                  key={student._id}
                  onClick={() => handleStudentClick(student._id)}
                  className={`group cursor-pointer transition-all duration-200 active:scale-[0.99] ${isBlocked ? 'opacity-70' : ''}`}
                  style={{ animation: `fadeIn 0.3s ease ${index * 0.03}s both` }}
                >
                  <div className={`student-card-border relative rounded-xl p-[1px] bg-gradient-to-br ${accent.border} ${accent.glow}`}>
                    <div
                      className="student-card relative rounded-xl bg-slate-900/55 backdrop-blur-xl border border-slate-700/40 overflow-hidden"
                      style={{ aspectRatio: '16/9' }}
                      onMouseMove={(e) => {
                        const el = e.currentTarget
                        if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current)
                        tiltRafRef.current = requestAnimationFrame(() => {
                          const rect = el.getBoundingClientRect()
                          const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
                          const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
                          const ry = (px - 0.5) * 6
                          const rx = (0.5 - py) * 4
                          el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
                          el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
                          el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
                          el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
                        })
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget
                        if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current)
                        tiltRafRef.current = null
                        el.style.setProperty('--rx', `0deg`)
                        el.style.setProperty('--ry', `0deg`)
                        el.style.setProperty('--mx', `30%`)
                        el.style.setProperty('--my', `10%`)
                      }}
                    >
                      <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(900px_circle_at_0%_0%,rgba(56,189,248,0.10),transparent_45%),radial-gradient(700px_circle_at_100%_10%,rgba(168,85,247,0.08),transparent_45%),radial-gradient(700px_circle_at_50%_100%,rgba(34,197,94,0.06),transparent_55%)]"></div>
                      <div className="student-card-shine absolute inset-0 opacity-0 pointer-events-none"></div>

                      <div className="relative z-10 p-2.5 h-full flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${accent.border} ring-1 ring-white/10 flex-shrink-0`}>
                              <span className="text-white font-bold text-xs">
                                {getInitials(student.name)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white truncate leading-tight text-sm">
                                {student.name || 'Ism kiritilmagan'}
                              </h3>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/25">
                              <Star className="w-2.5 h-2.5 text-yellow-400" />
                              <span className="text-yellow-300 font-bold text-[10px]">
                                {student.totalBall || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${accent.chip}`}>
                            <span className={`w-1 h-1 rounded-full ${accent.dot}`}></span>
                            {isBlocked ? 'Bloklangan' : 'Faol'}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-end">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium text-slate-300">Progress</span>
                            <span className={`text-lg font-bold ${
                              isDebtor ? 'text-red-300' : 'text-emerald-300'
                            }`}>{progress}%</span>
                          </div>

                          <div className="w-full h-2 rounded-full bg-slate-800/70 border border-slate-700/40 overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${accent.bar} shadow-[0_0_16px_rgba(56,189,248,0.2)] transition-[width] duration-700`}
                              style={{ width: `${progressBar}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" />
                              <span className="text-slate-300 font-semibold">{student.step || 0}</span>
                              <span className="text-slate-500">qadam</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span className="text-slate-300 font-semibold">{daysSinceJoin}</span>
                              <span className="text-slate-500">kun</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .student-card-border {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }

        @media (hover: hover) and (pointer: fine) {
          .student-card {
            transform-style: preserve-3d;
            transition: transform 240ms ease, border-color 240ms ease;
            will-change: transform;
            backface-visibility: hidden;
          }
          .student-card-border:hover .student-card {
            transform: perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-2px) translateZ(0);
          }
          .student-card-border:hover .student-card-shine {
            opacity: 1;
            transition: opacity 240ms ease;
          }
          .student-card-shine {
            background: radial-gradient(520px circle at var(--mx, 30%) var(--my, 10%), rgba(255,255,255,0.10), transparent 60%);
          }
        }
      `}</style>
    </div>
  )
}
