import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentsService, Student } from '../services/studentsService'
import { AlertCircle, ArrowLeft, TrendingUp, TrendingDown, Zap, Star, Activity, Minus } from 'lucide-react'

interface DailyBallData {
  dailyBalls: Array<{ date: string; ball: number }>
  totalBall: number
  todayBall: number
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [dailyBallData, setDailyBallData] = useState<DailyBallData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

  let viewerRole: string | null = null
  let viewerId: string | null = null
  try {
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    viewerRole = parsed?.role || null
    viewerId = parsed?.id || null
  } catch {
    viewerRole = null
    viewerId = null
  }

  const isStudentViewer = viewerRole === 'student'

  const headerRef = useRef<HTMLDivElement>(null)
  const mainStatsRef = useRef<HTMLDivElement>(null)
  const warningsRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const certsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    fetchStudent()
  }, [id])

  useEffect(() => {
    if (loading || error || !student) return

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('data-animate-id')
        if (!id) return
        setIsVisible((prev) => ({ ...prev, [id]: entry.isIntersecting }))
      })
    }, observerOptions)

    const elements = [
      headerRef.current,
      mainStatsRef.current,
      warningsRef.current,
      progressRef.current,
      certsRef.current
    ].filter(Boolean) as Element[]

    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
      observer.disconnect()
    }
  }, [loading, error, student])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      const [data, dailyData] = await Promise.all([
        studentsService.getStudentById(id!),
        studentsService.getDailyBalls(id!).catch(() => null)
      ])
      setStudent(data)
      setDailyBallData(dailyData)
    } catch (err: any) {
      setError(err.response?.data?.message || 'O\'quvchi ma\'lumotlarini yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-red-400 text-sm mb-3">{error || "O'quvchi topilmadi"}</p>
          <button
            onClick={() => navigate('/students')}
            className="px-4 py-2 bg-violet-600 text-white text-sm rounded-lg active:scale-95"
          >
            Orqaga
          </button>
        </div>
      </div>
    )
  }

  const enrollmentDateRaw = student.joinDate || student.created_at || (student as any).enrollmentDate
  const enrollmentDate = enrollmentDateRaw ? new Date(enrollmentDateRaw) : new Date()
  const now = new Date()
  const enrollmentDay = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth(), enrollmentDate.getDate())
  const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysSinceEnrollment = Math.max(1, Math.floor((todayDay.getTime() - enrollmentDay.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  const completedSteps = student.step || 0
  const actualProgress = Math.round((completedSteps / Math.max(1, daysSinceEnrollment)) * 100)
  const progressBar = Math.max(0, Math.min(100, actualProgress))
  
  // Qarzdor yoki yo'qligini aniqlash
  const isDebtor = actualProgress < 100

  const totalPoints = student.totalBall || completedSteps * 10
  const todayBallNumber = Number.parseFloat((student.todayBall || '0').toString())
  const todayBall = Number.isFinite(todayBallNumber) ? todayBallNumber : 0

  const joinDateLabel = enrollmentDate.toLocaleDateString('uz-UZ')
  const pace = completedSteps / daysSinceEnrollment
  const paceLabel = Number.isFinite(pace) ? pace.toFixed(1) : '0.0'

  const formatDayKey = (d: Date) => {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Tashkent',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d)
    } catch {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
  }

  const normalizeDayKey = (raw: string) => {
    const s = (raw || '').toString().trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const dt = new Date(s)
    if (Number.isNaN(dt.getTime())) return null
    return formatDayKey(dt)
  }

  const dayCounts: Record<string, number> = {}
  const rawDays = Array.isArray(student.days) ? student.days : []
  for (const raw of rawDays) {
    const key = normalizeDayKey(raw)
    if (!key) continue
    dayCounts[key] = (dayCounts[key] || 0) + 1
  }
  const totalEntries = Object.values(dayCounts).reduce((a, b) => a + b, 0)
  const hasDayHistory = dailyBallData !== null || totalEntries > 0
  const avgBallPerEntry = totalEntries > 0 ? totalPoints / Math.max(1, totalEntries) : 0

  // API'dan kelgan ma'lumotlarni ishlatamiz
  const last7 = dailyBallData?.dailyBalls 
    ? dailyBallData.dailyBalls.map(d => ({
        date: new Date(d.date),
        value: d.ball
      }))
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        const key = formatDayKey(d)
        
        if (totalEntries > 0) {
          const v = (dayCounts[key] || 0) * avgBallPerEntry
          return { date: d, value: v }
        }

        // Agar days bo'sh bo'lsa, faqat bugungi ball ko'rsatamiz
        const todayKey = formatDayKey(now)
        if (key === todayKey) {
          return { date: d, value: totalPoints }
        }
        
        // Qolgan kunlar uchun 0
        return { date: d, value: 0 }
      })

  const todaySeriesValue = last7[last7.length - 1]?.value || 0
  const yesterdaySeriesValue = last7[last7.length - 2]?.value || 0
  const dayDelta = todaySeriesValue - yesterdaySeriesValue
  const dayDeltaPct = yesterdaySeriesValue > 0 ? Math.round((dayDelta / yesterdaySeriesValue) * 100) : null

  const todayBallKnown = dailyBallData?.todayBall ?? totalPoints
  const yesterdayBallKnown = last7.length >= 2 ? (last7[last7.length - 2]?.value || 0) : 0
  const hasKnownBallData = totalPoints > 0 || (dailyBallData?.totalBall ?? 0) > 0
  const showDayTrend = hasKnownBallData && hasDayHistory && (dayDeltaPct !== null || dayDelta !== 0)

  const prev7Total = (() => {
    if (!hasDayHistory) return 0
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (13 - i))
      const key = formatDayKey(d)
      return (dayCounts[key] || 0) * avgBallPerEntry
    }).reduce((a, b) => a + b, 0)
  })()

  const last7Total = last7.reduce((a, b) => a + b.value, 0) || totalPoints
  const delta7 = last7Total - prev7Total
  const delta7Pct = prev7Total > 0 ? Math.round((delta7 / prev7Total) * 100) : null

  const getInitials = (name?: string) => {
    const safe = (name || '').trim()
    if (!safe) return 'U'
    const parts = safe.split(/\s+/).slice(0, 2)
    const letters = parts.map((p) => (p[0] || '').toUpperCase()).join('')
    return letters || 'U'
  }

  const displayName = student.name || (student as any).fullName || "O'quvchi"
  const courseName = (student as any).course || (student as any).subscriptionPlan || 'Kurs'

  const warnings: Array<{ type: string; title: string; message: string; icon: string }> = []

  // "Sekin o'qish" ogohlantirishini olib tashladik

  if (daysSinceEnrollment > 30 && actualProgress < 20) {
    warnings.push({
      type: 'warning',
      title: 'Past natija',
      message: '30 kundan keyin ham 20% dan kam progress',
      icon: 'trending_down'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
      {/* Back Button */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Orqaga</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Student Header */}
        <div
          ref={headerRef}
          data-animate-id="header"
          className={`relative rounded-3xl p-[1px] bg-gradient-to-br ${
            isDebtor 
              ? 'from-red-400/30 via-orange-500/25 to-yellow-500/25 shadow-[0_22px_70px_-44px_rgba(239,68,68,0.55)]'
              : 'from-cyan-400/25 via-blue-500/20 to-purple-500/25 shadow-[0_22px_70px_-44px_rgba(56,189,248,0.55)]'
          } transition-all duration-700 ease-out will-change-transform ${
            isVisible.header ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
        >
          <div className="relative rounded-3xl bg-slate-900/55 backdrop-blur-xl border border-slate-700/45 p-5 sm:p-6 overflow-hidden">
            <div className="absolute inset-0 opacity-70 pointer-events-none bg-[radial-gradient(1100px_circle_at_10%_0%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(900px_circle_at_100%_0%,rgba(168,85,247,0.12),transparent_55%)]"></div>
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/25 ring-1 ring-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-lg tracking-wide">{getInitials(displayName)}</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{displayName}</h1>
                  <p className="text-slate-300/80 text-sm sm:text-base truncate mt-0.5">
                    {courseName}
                  </p>
                </div>
              </div>

              <div className="flex-1"></div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3 text-center">
                  <p className="text-xs text-slate-400">Kelgan sana</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{joinDateLabel}</p>
                </div>
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3 text-center">
                  <p className="text-xs text-slate-400">Kun</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{daysSinceEnrollment}</p>
                </div>
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-3 text-center">
                  <p className="text-xs text-slate-400">Sur'at</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {paceLabel} <span className="text-slate-400 font-medium">/kun</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats */}
        <div
          ref={mainStatsRef}
          data-animate-id="main-stats"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 ease-out will-change-transform ${
            isVisible['main-stats'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: '80ms' }}
        >
          <div className={`bg-gradient-to-br backdrop-blur-sm rounded-2xl p-4 border ${
            isDebtor
              ? 'from-red-500/12 to-slate-900/40 border-red-500/20'
              : 'from-emerald-500/12 to-slate-900/40 border-emerald-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Progress</p>
                <p className={`text-2xl font-bold mt-1 ${isDebtor ? 'text-red-300' : 'text-white'}`}>{actualProgress}%</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDebtor
                  ? 'bg-red-500/15 border border-red-500/25'
                  : 'bg-emerald-500/15 border border-emerald-500/25'
              }`}>
                <TrendingUp className={`w-5 h-5 ${isDebtor ? 'text-red-300' : 'text-emerald-300'}`} />
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800/60 border border-slate-700/40 overflow-hidden">
              <div className={`h-3 rounded-full ${
                isDebtor 
                  ? 'bg-gradient-to-r from-red-400 to-orange-400'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              }`} style={{ width: `${progressBar}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/12 to-slate-900/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Qadam</p>
                <p className="text-2xl font-bold text-white mt-1">{completedSteps}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-300" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-slate-900/40 backdrop-blur-sm rounded-2xl p-4 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Ball</p>
                <p className="text-2xl font-bold text-white mt-1">{totalPoints}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-300" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              Motivatsiya: {delta7Pct === null ? '+' : `${delta7Pct >= 0 ? '+' : ''}${delta7Pct}%`}
            </p>
          </div>
        </div>

        {/* Warning Cards */}
        <div
          ref={warningsRef}
          data-animate-id="warnings"
          className={`grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 transition-all duration-700 ease-out will-change-transform ${
            isVisible.warnings ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
          style={{ transitionDelay: '120ms' }}
        >
          {warnings.map((warning, index) => (
            <div
              key={index}
              className={`rounded-2xl p-4 border backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] ${
                warning.type === 'danger'
                  ? 'bg-red-500/10 border-red-500/25'
                  : warning.type === 'warning'
                    ? 'bg-yellow-500/10 border-yellow-500/25'
                    : warning.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/25'
                      : 'bg-blue-500/10 border-blue-500/25'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    warning.type === 'danger'
                      ? 'bg-red-500/15'
                      : warning.type === 'warning'
                        ? 'bg-yellow-500/15'
                        : warning.type === 'success'
                          ? 'bg-emerald-500/15'
                          : 'bg-blue-500/15'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      warning.type === 'danger'
                        ? 'text-red-300'
                        : warning.type === 'warning'
                          ? 'text-yellow-300'
                          : warning.type === 'success'
                            ? 'text-emerald-300'
                            : 'text-blue-300'
                    }`}
                  >
                    {warning.icon}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{warning.title}</h4>
                  <p className="text-slate-300 text-xs leading-relaxed mt-1">{warning.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Section */}
        <div
          ref={progressRef}
          data-animate-id="progress"
          className={`bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-600/30 transition-all duration-700 ease-out will-change-transform ${
            isVisible.progress ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: '160ms' }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">ProX akademiyasida o'quvchining natijasi va ota-onasining pulini oqlash darajasi</h3>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-300">Progress</span>
              <span className={`text-3xl font-bold ${
                isDebtor ? 'text-red-300' : 'text-emerald-300'
              }`}>{actualProgress}%</span>
            </div>
            <div className="w-full bg-slate-800/70 border border-slate-700/40 rounded-full h-4 overflow-hidden">
              <div className={`h-4 rounded-full ${
                isDebtor 
                  ? 'bg-gradient-to-r from-red-400 to-orange-400'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              }`} style={{ width: `${progressBar}%` }}></div>
            </div>
          </div>
        </div>

        {/* Certificate Cards */}
        <div
          ref={certsRef}
          data-animate-id="certs"
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-700 ease-out will-change-transform ${
            isVisible.certs ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <div className="bg-gradient-to-br from-blue-600/15 to-slate-900/35 backdrop-blur-sm rounded-2xl p-5 border border-blue-500/20">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-500/15 border border-blue-500/25 rounded-2xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">7 kunlik ball</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Oxirgi 7 kun: {Math.round(last7Total)} bal</p>
                </div>
              </div>

              {showDayTrend && (
                <div className="flex items-center gap-1">
                  {dayDelta === 0 ? (
                    <Minus className="w-4 h-4 text-slate-500" />
                  ) : dayDelta >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-300" />
                  )}
                  <span
                    className={`text-xs font-semibold ${
                      dayDelta === 0 ? 'text-slate-400' : dayDelta >= 0 ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    {dayDeltaPct === null ? `${Math.round(dayDelta)} bal` : `${dayDeltaPct}%`}
                  </span>
                </div>
              )}
            </div>

            {!hasDayHistory && totalPoints > 0 && (
              <div className="mb-4 rounded-xl bg-slate-900/25 border border-slate-700/40 px-3 py-2 text-xs text-slate-400">
                Jami ball: {totalPoints} bal (kunlik ma'lumot mavjud emas)
              </div>
            )}

            <div className="rounded-2xl bg-slate-900/20 border border-slate-700/30 p-4">
              {(() => {
                const maxV = Math.max(1, ...last7.map((d) => d.value))
                const top = 8
                const bottom = 56
                const axisY = 61.5

                const points = last7.map((d, idx) => {
                  const x = ((idx + 0.5) / Math.max(1, last7.length)) * 100
                  const y = bottom - (d.value / maxV) * (bottom - top)
                  return { x, y, v: d.value, label: idx + 1 }
                })

                const smoothPath = (pts: Array<{ x: number; y: number }>) => {
                  if (pts.length === 0) return ''
                  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
                  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
                  const get = (i: number) => pts[clamp(i, 0, pts.length - 1)]
                  const d: string[] = []
                  d.push(`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`)
                  for (let i = 0; i < pts.length - 1; i++) {
                    const p0 = get(i - 1)
                    const p1 = get(i)
                    const p2 = get(i + 1)
                    const p3 = get(i + 2)
                    const c1x = p1.x + (p2.x - p0.x) / 6
                    const rawC1y = p1.y + (p2.y - p0.y) / 6
                    const c2x = p2.x - (p3.x - p1.x) / 6
                    const rawC2y = p2.y - (p3.y - p1.y) / 6

                    const minY = Math.min(p1.y, p2.y)
                    const maxY = Math.max(p1.y, p2.y)
                    const c1y = clamp(rawC1y, minY, maxY)
                    const c2y = clamp(rawC2y, minY, maxY)

                    d.push(
                      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
                    )
                  }
                  return d.join(' ')
                }

                const lineD = smoothPath(points)
                const areaD = `M ${points[0].x.toFixed(2)} ${bottom} ${points
                  .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
                  .join(' ')} L ${points[points.length - 1].x.toFixed(2)} ${bottom} Z`

                return (
                  <svg viewBox="0 0 100 64" className="w-full h-36 sm:h-40" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(34,211,238,0.72)" />
                        <stop offset="100%" stopColor="rgba(52,211,153,0.72)" />
                      </linearGradient>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(34,211,238,0.12)" />
                        <stop offset="100%" stopColor="rgba(34,211,238,0)" />
                      </linearGradient>
                    </defs>

                    {[0, 1, 2, 3].map((i) => {
                      const y = top + ((bottom - top) * i) / 3
                      return (
                        <line
                          key={i}
                          x1="0"
                          x2="100"
                          y1={y}
                          y2={y}
                          stroke="rgba(148,163,184,0.08)"
                          strokeWidth={1}
                          vectorEffect="non-scaling-stroke"
                          shapeRendering="geometricPrecision"
                        />
                      )
                    })}

                    {points.map((p) => (
                      <line
                        key={`tick-${p.label}`}
                        x1={p.x}
                        x2={p.x}
                        y1={bottom}
                        y2={axisY}
                        stroke="rgba(148,163,184,0.10)"
                        strokeWidth={1}
                        vectorEffect="non-scaling-stroke"
                        shapeRendering="geometricPrecision"
                      />
                    ))}

                    {points.map((p) => (
                      <text
                        key={`t-${p.label}`}
                        x={p.x}
                        y={63}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="rgba(148,163,184,0.55)"
                        fontSize={3.2}
                      >
                        {p.label}
                      </text>
                    ))}

                    <path d={areaD} fill="url(#areaGrad)" />
                    <path
                      d={lineD}
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth={1.1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      shapeRendering="geometricPrecision"
                    />

                    {points.map((p, idx) => {
                      const isYesterday = idx === points.length - 2
                      const isToday = idx === points.length - 1
                      const fill = p.v === 0
                        ? 'rgba(148,163,184,0.22)'
                        : isToday
                          ? 'rgba(34,211,238,0.90)'
                          : 'rgba(52,211,153,0.72)'
                      const ring = isToday ? 'rgba(34,211,238,0.55)' : 'rgba(52,211,153,0.45)'

                      return (
                        <g key={`pt-${idx}`} className="cursor-pointer">
                          <title>{p.v} ball</title>
                          {(isToday || isYesterday) && (
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r={1.7}
                              fill="transparent"
                              stroke={ring}
                              strokeWidth={0.55}
                              vectorEffect="non-scaling-stroke"
                              shapeRendering="geometricPrecision"
                            />
                          )}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={0.75}
                            fill={fill}
                            stroke="rgba(15,23,42,0.35)"
                            strokeWidth={0.4}
                            vectorEffect="non-scaling-stroke"
                            shapeRendering="geometricPrecision"
                          />
                        </g>
                      )
                    })}
                  </svg>
                )
              })()}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                <p className="text-[11px] text-slate-400">Bugun</p>
                <p className="text-sm font-semibold text-white mt-0.5">{Math.round(todayBallKnown)} bal</p>
              </div>
              <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                <p className="text-[11px] text-slate-400">Kecha</p>
                <p className="text-sm font-semibold text-white mt-0.5">{Math.round(yesterdayBallKnown)} bal</p>
              </div>
              <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                <p className="text-[11px] text-slate-400">7 kun</p>
                <p className="text-sm font-semibold text-white mt-0.5">{Math.round(last7Total)} bal</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600/12 to-slate-900/35 backdrop-blur-sm rounded-2xl p-5 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/25 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              </div>
              <h4 className="text-lg font-bold text-white">O'quv natijalari</h4>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                  <p className="text-[11px] text-slate-400">Progress</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{actualProgress}%</p>
                </div>
                <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                  <p className="text-[11px] text-slate-400">Bugun</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{Math.round(todayBall)} bal</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                  <p className="text-[11px] text-slate-400">Qadam</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{completedSteps}</p>
                </div>
                <div className="rounded-xl bg-slate-900/25 border border-slate-700/40 p-3">
                  <p className="text-[11px] text-slate-400">Ball</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{totalPoints}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}