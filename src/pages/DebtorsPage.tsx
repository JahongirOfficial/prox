import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentsService, Student } from '../services/studentsService'
import { AlertCircle, GraduationCap, TrendingDown, Wallet, Star, Calendar, Zap } from 'lucide-react'

export default function DebtorsPage() {
  const navigate = useNavigate()
  const [debtors, setDebtors] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalDebtors: 0,
    avgDebtPercentage: 0,
    avgDaysOverdue: 0,
    debtorPercentage: 0
  })
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const tiltRafRef = useRef<number | null>(null)
  
  const headerRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const debtorsGridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDebtors()
  }, [])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-animate-id')
          if (id) {
            setIsVisible((prev) => ({ ...prev, [id]: true }))
          }
        } else {
          const id = entry.target.getAttribute('data-animate-id')
          if (id) {
            setIsVisible((prev) => ({ ...prev, [id]: false }))
          }
        }
      })
    }, observerOptions)

    const elements = [
      headerRef.current,
      statsRef.current,
      debtorsGridRef.current
    ].filter(Boolean) as Element[]

    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [debtors])

  const fetchDebtors = async () => {
    try {
      setLoading(true)
      const data = await studentsService.getAllStudents()

      const getDaysSinceJoin = (student: Student) => {
        const dateStr = student.joinDate || student.created_at
        if (!dateStr) return 1
        const date = new Date(dateStr)
        if (Number.isNaN(date.getTime())) return 1
        const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(1, diffDays + 1) // +1 qo'shildi - StudentsPage bilan bir xil
      }

      const getProgress = (step: number, daysSinceJoin: number) => {
        const safeStep = Number(step || 0)
        const safeDays = Math.max(1, Number(daysSinceJoin || 1))
        return Math.round((safeStep / safeDays) * 100)
      }

      const debtorsOnly = (data || []).filter((s) => {
        const days = getDaysSinceJoin(s)
        const progress = getProgress(s.step, days)
        return progress < 100
      })

      setDebtors(debtorsOnly)

      const avg = debtorsOnly.length
        ? Math.round(
            debtorsOnly.reduce((sum, s) => {
              const days = getDaysSinceJoin(s)
              const p = getProgress(s.step, days)
              return sum + p
            }, 0) / debtorsOnly.length
          )
        : 0

      setStats((prev) => ({
        ...prev,
        totalDebtors: debtorsOnly.length,
        avgDebtPercentage: avg,
      }))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Qarzdorlarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Qarzdorlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDebtors}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div 
        ref={headerRef}
        data-animate-id="header"
        className={`text-center space-y-6 transition-all duration-1000 ${
          isVisible.header 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-4xl font-bold text-white">Qarzdor O'quvchilar</h1>
        
        {/* Stats Buttons */}
        <div 
          ref={statsRef}
          data-animate-id="stats"
          className={`flex items-center justify-center gap-4 transition-all duration-1000 delay-200 ${
            isVisible.stats 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600/50">
            <GraduationCap className="w-5 h-5 text-red-400" />
            <span className="text-white font-medium">Jami qarzdorlar</span>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {stats.totalDebtors}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-full border border-slate-600/50">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Umumiy foiz</span>
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {stats.avgDebtPercentage}%
            </span>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Qarzdor qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-full text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>



      {/* Debtors Cards Grid */}
      <div 
        ref={debtorsGridRef}
        data-animate-id="debtors-grid"
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Qarzdorlar ro'yxati</h2>
          <div className="text-sm text-slate-400">
            {debtors.length} ta qarzdor
          </div>
        </div>

        {(() => {
          const getDaysSinceJoin = (student: Student) => {
            const dateStr = student.joinDate || student.created_at
            if (!dateStr) return 1
            const date = new Date(dateStr)
            if (Number.isNaN(date.getTime())) return 1
            const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
            return Math.max(1, diffDays + 1) // +1 qo'shildi - StudentsPage bilan bir xil
          }

          const getProgress = (step: number, daysSinceJoin: number) => {
            const safeStep = Number(step || 0)
            const safeDays = Math.max(1, Number(daysSinceJoin || 1))
            return Math.round((safeStep / safeDays) * 100)
          }

          const getInitials = (name?: string) => {
            const safe = (name || '').trim()
            if (!safe) return 'U'
            const parts = safe.split(/\s+/).slice(0, 2)
            const letters = parts.map(p => (p[0] || '').toUpperCase()).join('')
            return letters || 'U'
          }

          const filteredDebtors = debtors.filter((student) => {
            const q = searchTerm.trim().toLowerCase()
            if (!q) return true
            return (
              (student.name || '').toLowerCase().includes(q) ||
              (student.phone || '').toLowerCase().includes(q) ||
              (student.username || '').toLowerCase().includes(q)
            )
          })

          if (filteredDebtors.length === 0) {
            return (
          <div className="text-center py-12">
            <div className="text-slate-400">
              <Wallet className="w-10 h-10 mx-auto mb-2" />
              {searchTerm ? 'Qidiruv bo\'yicha qarzdor topilmadi' : "Qarzdor o'quvchilar yo'q"}
            </div>
          </div>
            )
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredDebtors.map((student, index) => {
                const daysSinceJoin = getDaysSinceJoin(student)
                const progress = getProgress(student.step, daysSinceJoin)
                const progressBar = Math.max(0, Math.min(100, progress))
                const isBlocked = student.is_blocked

                const accent = isBlocked
                  ? {
                      border: 'from-red-500/35 via-rose-500/25 to-orange-500/25',
                      glow: 'shadow-[0_12px_40px_-24px_rgba(244,63,94,0.4)]',
                      chip: 'bg-red-500/15 text-red-300 border-red-500/30',
                      dot: 'bg-red-400',
                      bar: 'from-red-400 to-orange-400'
                    }
                  : {
                      border: 'from-red-400/30 via-orange-400/25 to-amber-400/25',
                      glow: 'shadow-[0_12px_40px_-24px_rgba(249,115,22,0.35)]',
                      chip: 'bg-red-500/15 text-red-300 border-red-500/30',
                      dot: 'bg-red-400',
                      bar: 'from-red-400 to-orange-400'
                    }

                return (
                  <div
                    key={student._id}
                    onClick={() => navigate(`/student/${student._id}`)}
                    className={`group cursor-pointer transition-all duration-200 active:scale-[0.99] ${isBlocked ? 'opacity-70' : ''}`}
                    style={{ animation: `fadeIn 0.3s ease ${index * 0.03}s both` }}
                  >
                    <div className={`debtor-card-border relative rounded-xl p-[1px] bg-gradient-to-br ${accent.border} ${accent.glow}`}>
                      <div
                        className="debtor-card relative rounded-xl bg-slate-900/55 backdrop-blur-xl border border-slate-700/40 overflow-hidden"
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
                        <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(900px_circle_at_0%_0%,rgba(239,68,68,0.10),transparent_45%),radial-gradient(700px_circle_at_100%_10%,rgba(249,115,22,0.08),transparent_45%),radial-gradient(700px_circle_at_50%_100%,rgba(245,158,11,0.06),transparent_55%)]"></div>
                        <div className="debtor-card-shine absolute inset-0 opacity-0 pointer-events-none"></div>

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
                              {isBlocked ? 'Bloklangan' : 'Qarzdor'}
                            </span>
                          </div>

                          <div className="flex-1 flex flex-col justify-end">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-medium text-slate-300">Progress</span>
                              <span className="text-lg font-bold text-red-300">{progress}%</span>
                            </div>

                            <div className="w-full h-2 rounded-full bg-slate-800/70 border border-slate-700/40 overflow-hidden mb-1.5">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${accent.bar} shadow-[0_0_16px_rgba(249,115,22,0.2)] transition-[width] duration-700`}
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
          )
        })()}
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

        .debtor-card-border {
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }

        @media (hover: hover) and (pointer: fine) {
          .debtor-card {
            transform-style: preserve-3d;
            transition: transform 240ms ease, border-color 240ms ease;
            will-change: transform;
            backface-visibility: hidden;
          }
          .debtor-card-border:hover .debtor-card {
            transform: perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(-2px) translateZ(0);
          }
          .debtor-card-border:hover .debtor-card-shine {
            opacity: 1;
            transition: opacity 240ms ease;
          }
          .debtor-card-shine {
            background: radial-gradient(520px circle at var(--mx, 30%) var(--my, 10%), rgba(255,255,255,0.10), transparent 60%);
          }
        }
      `}</style>
    </div>
  )
}