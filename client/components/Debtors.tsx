import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Debtors() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const navigate = useNavigate()

  // Helper to safely get progress percentage
  const daysSinceArrival = (arrival?: string) => {
    if (!arrival) return 0
    let a: Date

    // Normalize the string (trim whitespace)
    const normalized = String(arrival).trim()

    // iOS Safari uchun maxsus parsing
    if (normalized.includes("T")) {
      a = new Date(normalized)
    } else if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // iOS Safari uchun explicit Date constructor
      const parts = normalized.split("-")
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])

      // Avval local Date constructor bilan sinab ko'rish
      a = new Date(year, month, day)

      // Agar xato bo'lsa, UTC method bilan sinab ko'rish
      if (isNaN(a.getTime())) {
        a = new Date(Date.UTC(year, month, day))
      }
    } else if (normalized.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
      // Alternative format (YYYY/MM/DD) - iOS Safari uchun
      const parts = normalized.split("/")
      const year = parseInt(parts[0])
      const month = parseInt(parts[1]) - 1
      const day = parseInt(parts[2])
      a = new Date(year, month, day)
    } else {
      // Try parsing as-is, lekin iOS Safari uchun fallback
      a = new Date(normalized)

      // Agar parsing xato bo'lsa, manual parsing sinab ko'rish
      if (isNaN(a.getTime())) {
        const cleanString = normalized.replace(/[^\d]/g, "")
        if (cleanString.length >= 8) {
          const year = parseInt(cleanString.substring(0, 4))
          const month = parseInt(cleanString.substring(4, 6)) - 1
          const day = parseInt(cleanString.substring(6, 8))
          a = new Date(year, month, day)
        }
      }
    }

    if (isNaN(a.getTime())) return 0

    // iOS Safari uchun timezone muammolarini oldini olish
    const start = new Date(a.getFullYear(), a.getMonth(), a.getDate())
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = today.getTime() - start.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const progressPercent = (user: any) => {
    const days = daysSinceArrival(user?.arrivalDate)
    if (!days) return 0
    const step = Number(user?.step || 0)
    // Allow values > 100 when step > days
    return Math.round(Math.max(0, (step / days) * 100))
  }

  // Format date function - iOS Safari compatible
  const formatDateDDMMYY = (dateString: string) => {
    if (!dateString) {
      return "—"
    }

    try {
      let date: Date

      // Normalize the string (trim whitespace)
      const normalized = String(dateString).trim()

      // iOS Safari uchun maxsus handling
      if (normalized.includes("T")) {
        // Full ISO format - parse directly
        date = new Date(normalized)
      } else if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Date-only format (YYYY-MM-DD) - iOS Safari uchun maxsus parsing
        const parts = normalized.split("-")
        const year = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1 // Month is 0-indexed
        const day = parseInt(parts[2])

        // iOS Safari uchun explicit Date constructor ishlatish
        date = new Date(year, month, day)

        // Agar parsing xato bo'lsa, UTC method bilan sinab ko'rish
        if (isNaN(date.getTime())) {
          date = new Date(Date.UTC(year, month, day))
        }
      } else if (normalized.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        // Alternative format (YYYY/MM/DD) - iOS Safari uchun
        const parts = normalized.split("/")
        const year = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const day = parseInt(parts[2])
        date = new Date(year, month, day)
      } else {
        // Try parsing as-is, lekin iOS Safari uchun fallback
        date = new Date(normalized)

        // Agar parsing xato bo'lsa, manual parsing sinab ko'rish
        if (isNaN(date.getTime())) {
          // Ba'zi formatlarni manual parse qilish
          const cleanString = normalized.replace(/[^\d]/g, "")
          if (cleanString.length >= 8) {
            const year = parseInt(cleanString.substring(0, 4))
            const month = parseInt(cleanString.substring(4, 6)) - 1
            const day = parseInt(cleanString.substring(6, 8))
            date = new Date(year, month, day)
          }
        }
      }

      // Final check - agar hali ham xato bo'lsa
      if (isNaN(date.getTime())) {
        return "—"
      }

      // iOS Safari uchun timezone muammolarini oldini olish
      const day = String(date.getDate()).padStart(2, "0")
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const year = String(date.getFullYear()).slice(-2)

      return `${day}/${month}/${year}`
    } catch (error) {
      return "—"
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/offline-students")
        if (res.ok) {
          const data = await res.json()
          // Filter only users with progress < 100%
          const debtors = (data.users || []).filter((user: any) => progressPercent(user) < 100)
          setUsers(debtors)
        } else {
          setError("Foydalanuvchilarni yuklashda xatolik")
        }
      } catch (error) {
        setError("Server bilan bog'lanishda xatolik")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Live, normalized search for debtors list
  const filteredUsers = users.filter((user: any) =>
    user.fullName.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => progressPercent(b) - progressPercent(a))

  // Jami o'quvchilar foizi (o'rtacha ROI %)
  const totalProgress = (() => {
    try {
      const arr = (filteredUsers || []).map((u: any) =>
        Math.max(0, Math.round(progressPercent(u)))
      )
      if (arr.length === 0) return 0
      const sum = arr.reduce((s, v) => s + v, 0)
      return Math.round(sum / arr.length)
    } catch {
      return 0
    }
  })()

  if (selectedUser) {
    return (
      <div className="w-full animate-fade-in pb-16 pt-[1px] md:pt-0">
        {/* Student Detail Hero Section */}
        <div className="relative min-h-[60vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-blue-900/60 to-slate-900/80"></div>

          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-32 h-32 opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-cyan-300"
              >
                <circle cx="100" cy="100" r="80" strokeOpacity="0.3" />
                <circle cx="100" cy="100" r="60" strokeOpacity="0.4" />
                <circle cx="100" cy="100" r="40" strokeOpacity="0.5" />
              </g>
              <circle
                cx="100"
                cy="100"
                r="6"
                fill="currentColor"
                className="text-cyan-300"
              />
            </svg>
          </div>

          {/* Desktop/Tablet Back button (hidden on mobile) */}
          <div className="hidden md:block absolute top-6 left-8 z-20">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white transition-all duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedUser(null)}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium text-base">Orqaga</span>
            </button>
          </div>

          {/* Content container */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-8 pb-8 flex flex-col items-center">
            {/* Decorative background */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-24 -left-16 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[65%] h-40 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-3xl blur-2xl" />
            </div>
            <div className="w-full text-center mb-4">
              {/* Student Name */}
              <h1
                className={`text-[clamp(1.1rem,6vw,2.25rem)] sm:text-5xl lg:text-6xl font-bold text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] mt-2 mb-10 sm:mb-12 tracking-tight leading-tight break-words whitespace-normal overflow-visible max-w-[92vw] mx-auto ios-text-render`}
              >
                {selectedUser.fullName}
              </h1>

              {/* Statistics Cards - moved under name */}
              {/* Local keyframes for continuous glow */}
              <style>{`
                @keyframes glowPulse {
                  0% { opacity: .35; filter: blur(22px); }
                  50% { opacity: .8; filter: blur(28px); }
                  100% { opacity: .35; filter: blur(22px); }
                }
                @keyframes spinSlow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes spinSlowReverse {
                  from { transform: rotate(360deg); }
                  to { transform: rotate(0deg); }
                }
                .animate-spin-slow {
                  animation: spinSlow 8s linear infinite;
                }
                .animate-spin-slow-reverse {
                  animation: spinSlowReverse 6s linear infinite;
                }
              `}</style>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 max-w-[640px] sm:max-w-5xl mx-auto mb-4 mt-4">
                {/* Step Card - Modern Design with Green & Black */}
                <div className="relative rounded-3xl p-4 sm:p-6 text-center h-40 sm:h-52 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500/20 via-green-500/15 via-teal-500/10 to-slate-900/30 border-2 border-emerald-400/50 backdrop-blur-xl shadow-2xl">
                  {/* Main icon with gradient */}
                  <div className="relative mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 sm:ring-4 ring-white/20">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white drop-shadow-lg"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 animate-ping opacity-75"></div>
                  </div>
                  <div className="text-3xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-emerald-200 via-green-200 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(16,185,129,0.3)] ios-text-render">
                    {selectedUser.step ?? 1}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-emerald-200/90 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(16,185,129,0.2)]">
Qadam
                  </div>
                </div>

                {/* Points Card - Modern Design with Gray & Black */}
                <div className="relative rounded-3xl p-4 sm:p-6 text-center h-40 sm:h-52 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800/40 via-gray-900/30 via-black/20 to-slate-900/50 border-2 border-slate-600/60 backdrop-blur-xl shadow-2xl">
                  {/* Main icon with gradient */}
                  <div className="relative mb-3 sm:mb-4 mt-1 sm:mt-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-600 via-gray-700 to-black rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-white drop-shadow-lg"
                      >
                        <path d="M21 21V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" />
                        <path d="M3 21h18" />
                        <path d="M7 12v9" />
                        <path d="M11 12v9" />
                        <path d="M15 12v9" />
                        <path d="M19 12v9" />
                      </svg>
                    </div>
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-2xl bg-slate-400/30 animate-ping opacity-75"></div>
                  </div>
                  <div className="text-3xl sm:text-5xl font-black mb-2 bg-gradient-to-r from-slate-200 via-gray-200 to-white bg-clip-text text-transparent drop-shadow-[0_4px_8px_rgba(148,163,184,0.3)] ios-text-render">
                    {(selectedUser.todayScores || []).reduce(
                      (sum, s) => sum + (s.score || 0),
                      0,
                    )}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-300/90 uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(148,163,184,0.2)]">
                    Ball
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-5 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-start mb-3 mt-2">
            <span className="font-extrabold text-white/95 ios-text-render text-[clamp(20px,4vw,40px)]">
              <strong className="text-cyan-300">ProX akademiyasida</strong> o'quvchining natijasi va ota-onasining pulini oqlash darajasi:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 h-8 sm:h-10 rounded-full bg-slate-900/30 border border-white/10 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-500 ${
                  !isNaN(progressPercent(selectedUser)) && progressPercent(selectedUser) >= 100
                    ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-red-400 via-red-500 to-red-400"
                }`}
                style={{ width: `${isNaN(progressPercent(selectedUser)) ? 0 : Math.min(100, progressPercent(selectedUser))}%` }}
              />
            </div>
            <div
              className={`backdrop-blur-sm rounded-md px-3 py-2 border ${
                !isNaN(progressPercent(selectedUser)) && progressPercent(selectedUser) >= 100
                  ? "bg-emerald-500/20 border-emerald-400/30"
                  : "bg-red-500/20 border-red-400/30"
              }`}
            >
              <span
                className={`font-black tracking-wide text-2xl sm:text-3xl ios-text-render ${
                  !isNaN(progressPercent(selectedUser)) && progressPercent(selectedUser) >= 100
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {isNaN(progressPercent(selectedUser)) ? 0 : Math.round(progressPercent(selectedUser))}%
              </span>
            </div>
          </div>
          <div className="mt-3 text-center text-base ios-text-render text-red-300">
            O'quvchining 1 kuni kuygan
          </div>
        </div>

        {/* Course Completion Section */}
        <div className="mt-4 max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <div className="inline-block group relative rounded-2xl p-[2px] bg-[conic-gradient(at_50%_50%,#22d3ee66,#3b82f666,#a855f766,#22d3ee66)] shadow-sm">
              <div className="relative rounded-2xl px-5 py-3 bg-slate-900/40 border border-white/10 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: "linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.08) 45%, transparent 65%)"}}></div>
                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 font-extrabold tracking-wider text-xl sm:text-2xl md:text-3xl">
                  Kursning tugatilganlik foizi va daromadgacha qolgan qadamlar:
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            {/* Steps to Income Card */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-indigo-400/25 hover:shadow-2xl hover:-translate-y-0.5 h-full">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6366f140,#8b5cf640,#a855f740,#06b6d440)]"></div>
              <div className="relative m-[2px] rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 text-center py-4 px-5 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-slate-900/60 group-hover:border-white/15 flex flex-col h-full">
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: "linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.08) 40%, transparent 60%)"}}></div>
                <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/35 via-violet-500/30 to-cyan-500/30 ring-2 ring-indigo-300/30 flex items-center justify-center shadow-lg shadow-indigo-900/20 transition-transform duration-300 group-hover:rotate-1 group-hover:scale-105">
                    <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-[6px]"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign relative w-6 h-6 text-white drop-shadow-[0_1px_6px_rgba(99,102,241,0.45)]">
                      <line x1="12" x2="12" y1="2" y2="22"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold uppercase tracking-wide text-white/90">Daromadgacha qolgan qadamlar</div>
                    <div className="text-white font-extrabold text-3xl md:text-4xl mt-1 leading-tight ios-text-render">
                      {Math.max(
                        0,
                        600 - Number(selectedUser?.step || 0),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Percentage Card */}
            <div className="group relative rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-amber-400/25 hover:shadow-2xl hover:-translate-y-0.5 h-full">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#f59e0b40,#f9731640,#ef444440,#eab30840)]"></div>
              <div className="relative m-[2px] rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 text-center py-4 px-5 ring-1 ring-white/10 transition-all duration-300 group-hover:bg-slate-900/60 group-hover:border-white/15 flex flex-col h-full">
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: "linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.08) 40%, transparent 60%)"}}></div>
                <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/35 via-orange-500/30 to-rose-500/30 ring-2 ring-amber-300/30 flex items-center justify-center shadow-lg shadow-amber-900/20 transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-105">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up relative w-6 h-6 text-white drop-shadow-[0_1px_6px_rgba(245,158,11,0.45)]">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                      <polyline points="16 7 22 7 22 13"></polyline>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold uppercase tracking-wide text-white/90">Daromadgacha tugatilgan foiz</div>
                  </div>
                  <div className="w-full mt-2">
                    <div className="h-2 md:h-2.5 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 transition-all duration-500 shadow-[inset_0_0_6px_rgba(0,0,0,0.3)]"
                        style={{ width: `${Math.min(100, Math.max(0, Math.round((Number(selectedUser?.step || 0) / 600) * 100)))}%` }}
                      ></div>
                    </div>
                    <div className="mt-1 text-sm sm:text-base text-white/80">Maqsadga {Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(
                          (Number(selectedUser?.step || 0) / 600) *
                            100,
                        ),
                      ),
                    )}% yetdi</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="mt-6 sm:mt-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(8px,1.5vw,16px)]">
          {/* Arrival Date Card */}
          <div className="relative rounded-3xl p-[clamp(10px,2.2vw,24px)] border-4 border-amber-400/40 bg-white/5 min-h-[clamp(76px,10vw,112px)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5"></div>
            <div className="flex flex-row items-center text-center gap-[clamp(12px,2vw,16px)] relative z-10">
              <div className="relative w-[clamp(40px,6vw,44px)] h-[clamp(40px,6vw,44px)] rounded-2xl bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30 flex items-center justify-center shrink-0 shadow-lg">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-[clamp(18px,3vw,20px)] h-[clamp(18px,3vw,20px)] text-amber-100 relative z-10 drop-shadow-lg">
                  <path d="M8 2v4"></path>
                  <path d="M16 2v4"></path>
                  <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                  <path d="M3 10h18"></path>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-semibold uppercase tracking-wide text-white/90 text-[clamp(12px,2vw,16px)]" style={{fontSize: "clamp(12px, 2vw, 16px)", lineHeight: "clamp(16px, 2.4vw, 20px)"}}>Kelgan sana</div>
                <div className="text-white/95 font-extrabold mt-[clamp(2px,0.4vw,6px)] leading-tight ios-date-fix ios-text-render text-[clamp(22px,3.6vw,30px)]" style={{fontSize: "clamp(22px, 3.6vw, 30px)", lineHeight: "clamp(26px, 4vw, 34px)"}}>
                  {formatDateDDMMYY(selectedUser.arrivalDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Days Card */}
          <div className="relative rounded-3xl p-[clamp(10px,2.2vw,24px)] border-4 border-emerald-400/40 bg-white/5 min-h-[clamp(76px,10vw,112px)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5"></div>
            <div className="flex flex-row items-center text-center gap-[clamp(12px,2vw,16px)] relative z-10">
              <div className="relative w-[clamp(40px,6vw,44px)] h-[clamp(40px,6vw,44px)] rounded-2xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 flex items-center justify-center shrink-0 shadow-lg">
                <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-[clamp(18px,3vw,20px)] h-[clamp(18px,3vw,20px)] text-emerald-100 relative z-10 drop-shadow-lg">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-semibold uppercase tracking-wide text-white/90 text-[clamp(12px,2vw,16px)]" style={{fontSize: "clamp(12px, 2vw, 16px)", lineHeight: "clamp(16px, 2.4vw, 20px)"}}>Jami kunlar</div>
                <div className="text-white/95 font-extrabold mt-[clamp(2px,0.4vw,6px)] leading-tight ios-date-fix ios-text-render text-[clamp(22px,3.6vw,30px)]" style={{fontSize: "clamp(22px, 3.6vw, 30px)", lineHeight: "clamp(26px, 4vw, 34px)"}}>
                  {daysSinceArrival(selectedUser.arrivalDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Current Step Card */}
          <div className="relative rounded-3xl p-[clamp(10px,2.2vw,24px)] border-4 border-violet-400/40 bg-white/5 min-h-[clamp(76px,10vw,112px)] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-violet-500/5"></div>
            <div className="flex flex-row items-center text-center gap-[clamp(12px,2vw,16px)] relative z-10">
              <div className="relative w-[clamp(40px,6vw,44px)] h-[clamp(40px,6vw,44px)] rounded-2xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 flex items-center justify-center shrink-0 shadow-lg">
                <div className="absolute inset-0 rounded-2xl bg-violet-400/20 animate-pulse"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zap w-[clamp(18px,3vw,20px)] h-[clamp(18px,3vw,20px)] text-violet-100 relative z-10 drop-shadow-lg">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-semibold uppercase tracking-wide text-white/90 text-[clamp(12px,2vw,16px)]" style={{fontSize: "clamp(12px, 2vw, 16px)", lineHeight: "clamp(16px, 2.4vw, 20px)"}}>Bugungi sana</div>
                <div className="text-white/95 font-extrabold mt-[clamp(2px,0.4vw,6px)] leading-tight ios-date-fix ios-text-render text-[clamp(22px,3.6vw,30px)]" style={{fontSize: "clamp(22px, 3.6vw, 30px)", lineHeight: "clamp(26px, 4vw, 34px)"}}>
                  {formatDateDDMMYY(new Date().toISOString())}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="container mx-auto px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="hidden sm:block">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Qarzdorlar
              </h2>
            </div>

            {/* Metrics row */}
            <div className="w-full max-w-6xl mx-auto mb-4">
              <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-3">
                <div className="flex w-full sm:w-auto items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 text-white/90 ring-1 ring-white/20 shadow-lg backdrop-blur-md justify-between sm:justify-center">
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-300" />
                    <span className="text-sm sm:text-base font-medium">
                      Jami qarzdorlar
                    </span>
                  </span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-white/15 text-white font-bold text-base sm:text-lg relative flex items-center justify-center w-16">
                    <span className="absolute inset-0 rounded-full border-2 border-white/30"></span>
                    <span className="relative z-10">
                      {users.length}
                    </span>
                  </span>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 text-white/90 ring-1 ring-white/20 shadow-lg backdrop-blur-md justify-between sm:justify-center">
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                    <span className="text-sm sm:text-base font-medium">
                      Umumiy foiz
                    </span>
                  </span>
                  <span className={`ml-2 px-3 py-1 rounded-full bg-white/15 font-bold text-base sm:text-lg relative flex items-center justify-center w-16 ${totalProgress >= 100 ? 'text-green-500' : 'text-red-500'}`}>
                    <span className="absolute inset-0 rounded-full border-2 border-white/30"></span>
                    <span className="relative z-10">
                      {totalProgress}%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full max-w-md mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <Input
                placeholder={"Qarzdorni qidirish..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 text-lg sm:py-5 sm:text-xl bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl backdrop-blur-sm focus:bg-white/20 focus:border-cyan-400 transition-all duration-300"
              />
            </div>
            {search && filteredUsers.length === 0 && (
              <div className="text-center text-white/80 bg-white/10 p-4 rounded-xl backdrop-blur-sm mt-3">
                Qarzdor topilmadi
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300">
                  <div className="mb-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="w-2 h-2 rounded-full" />
                  </div>
                  {/* Progress bar skeleton */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1 h-2 sm:h-3 rounded-full bg-slate-900/30 border border-white/10 overflow-hidden shadow-inner">
                      <Skeleton className="h-full rounded-full w-3/4" />
                    </div>
                    <div className="backdrop-blur-sm rounded-md px-3 py-2 border border-white/10">
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            ) : filteredUsers.length === 0 && !search ? (
              <div className="col-span-full text-center text-white/80 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                Qarzdorlar topilmadi
              </div>
            ) : (
              filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1"
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 ios-text-render">
                      {user.fullName}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-red-500/20 text-red-500 px-3 py-1 rounded-full font-medium ios-text-render">
                      Qarzdor
                    </span>
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  </div>

                  {/* Progress bar with gradient styling like profile view */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1 h-2 sm:h-3 rounded-full bg-slate-900/30 border border-white/10 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all duration-500 ${
                          !isNaN(progressPercent(user)) && progressPercent(user) >= 100
                            ? "bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400"
                            : "bg-gradient-to-r from-red-400 via-red-500 to-red-400"
                        }`}
                        style={{ width: `${isNaN(progressPercent(user)) ? 0 : Math.min(100, progressPercent(user))}%` }}
                      />
                    </div>
                    <div
                      className={`backdrop-blur-sm rounded-md px-3 py-2 border ${
                        !isNaN(progressPercent(user)) && progressPercent(user) >= 100
                          ? "bg-emerald-500/20 border-emerald-400/30"
                          : "bg-red-500/20 border-red-400/30"
                      }`}
                    >
                      <span
                        className={`font-normal tracking-wide text-xs ios-text-render ${
                          !isNaN(progressPercent(user)) && progressPercent(user) >= 100
                            ? "text-emerald-300"
                            : "text-red-300"
                        }`}
                      >
                        {isNaN(progressPercent(user)) ? 0 : Math.round(progressPercent(user))}%
                      </span>
                    </div>
                  </div>

                  {/* Info Cards: Arrival, Today, Total Days (reordered) */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {/* Boshlangan sana */}
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">Kelgan sana</div>
                      <div className="text-sm font-semibold text-white/90">
                        {formatDateDDMMYY(user.arrivalDate)}
                      </div>
                    </div>

                    {/* Jami kunlar */}
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">Jami kunlar</div>
                      <div className="text-sm font-semibold text-white/90">
                        {daysSinceArrival(user.arrivalDate)}
                      </div>
                    </div>

                    {/* Bugungi sana */}
                    <div className="text-center">
                      <div className="text-xs text-white/60 mb-1">Bugungi sana</div>
                      <div className="text-sm font-semibold text-white/90">
                        {formatDateDDMMYY(new Date().toISOString())}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}