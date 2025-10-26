import { useEffect, useMemo, useState } from 'react'

interface OfflineUser {
  id: string
  fullName: string
  phone?: string
  role?: string
  step?: number
  arrivalDate?: string
}

// iOS-friendly arrival date → progress helpers (same logic as home page)
function getDaysSinceArrival(arrival?: string): number {
  if (!arrival) return 0
  let a: Date
  const normalized = String(arrival).trim().replace(/\//g, '-')
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const parts = normalized.split('-')
    a = new Date(Date.UTC(+parts[0], +parts[1] - 1, +parts[2]))
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(normalized)) {
    a = new Date(normalized.replace(' ', 'T'))
  } else if (normalized.includes('T')) {
    a = new Date(normalized)
  } else {
    const m = normalized.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/)
    if (m) a = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
    else return 0
  }
  if (isNaN(a.getTime())) return 0
  const start = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()))
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const diffMs = today.getTime() - start.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

function progressPercent(user: OfflineUser): number {
  const days = getDaysSinceArrival(user?.arrivalDate)
  if (!days) return 0
  const step = Number(user?.step || 0)
  return Math.round(Math.min(100, Math.max(0, (step / days) * 100)))
}

export default function ProxOffline() {
  const [users, setUsers] = useState<OfflineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const res = await fetch('/api/offline-students')
        const data = await res.json().catch(() => ({}))
        if (!res.ok || !data?.users) throw new Error(data?.message || 'O\'quvchilar topilmadi')
        if (!cancelled) setUsers(data.users as OfflineUser[])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Server xatosi')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const total = users.length
  const usersWithProgress = useMemo(() =>
    users.map(u => ({ ...u, progress: progressPercent(u) }))
         .sort((a, b) => b.progress - a.progress)
  , [users])
  const totalProgress = useMemo(() => {
    if (usersWithProgress.length === 0) return 0;
    const sum = usersWithProgress.reduce((s, u) => s + (Number(u.progress) || 0), 0);
    return Math.round(sum / usersWithProgress.length);
  }, [usersWithProgress])

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          ProX Akademiyasida o'quvchilarning natijasi va ota-onasining pulini oqlash darajasi
        </h1>
      </div>

      {/* Summary under total: Only the required metric for every student (numbers only) */}
      {!loading && !error && (
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-3">
            <span className="flex w-full sm:w-auto items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 ring-1 ring-white/15">
              <span className="inline-flex items-center gap-2">
                <span className="text-sm">Jami o'quvchilar</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 font-semibold">{total} ta</span>
            </span>
            <span className="flex w-full sm:w-auto items-center justify-between sm:justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600/20 via-green-500/20 to-teal-500/20 text-white/90 ring-1 ring-white/15">
              <span className="inline-flex items-center gap-2">
                <span className="text-sm">Umumiy foiz</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/15 font-bold">{totalProgress}%</span>
            </span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400" />
        </div>
      )}
      {error && (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3 mb-6">{error}</div>
      )}
    </div>
  )
}
