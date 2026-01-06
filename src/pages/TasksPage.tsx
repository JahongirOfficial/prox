import { useState, useEffect } from 'react'
import { tasksService, Task } from '../services/tasksService'
import StepWorkflow from '../components/StepWorkflow'
import { submissionService, Submission } from '../services/submissionService'
import { 
  AlertCircle, FileText, RefreshCw, CheckCircle, 
  Clock, Star, Check, Lock, Play, LayoutGrid, LayoutList 
} from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workflowStep, setWorkflowStep] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    submitted: 0,
    totalPoints: 0
  })

  let viewerRole: string | null = null
  try {
    const raw = localStorage.getItem('user')
    const parsed = raw ? JSON.parse(raw) : null
    viewerRole = parsed?.role || null
  } catch {
    viewerRole = null
  }
  const isStudentViewer = viewerRole === 'student'
  const isAdmin = viewerRole === 'admin'

  useEffect(() => {
    fetchTasks()
    if (isStudentViewer) {
      fetchSubmissions()
    } else {
      fetchStats()
      if (isAdmin) {
        fetchStudents() // Admin uchun o'quvchilarni yuklash
      }
    }
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await tasksService.getAllTasks()
      setTasks(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Vazifalarni yuklashda xatolik')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await tasksService.getTasksStats()
      setStats(statsData)
    } catch (err) {
      console.error('Stats yuklashda xatolik:', err)
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (err) {
      console.error('O\'quvchilarni yuklashda xatolik:', err)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const data = await submissionService.getStudentSubmissions()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Submissions yuklashda xatolik:', err)
      setSubmissions([])
    }
  }

  const getTaskComputedStatus = (taskId: string): Task['status'] => {
    if (!isStudentViewer) return tasks.find((t) => t._id === taskId)?.status || 'pending'

    const related = submissions
      .filter((s) => {
        const t: any = (s as any).taskId
        const id = typeof t === 'string' ? t : t?._id
        return id === taskId
      })
      .sort((a, b) => {
        const at = new Date((a as any).submittedAt || (a as any).createdAt || 0).getTime()
        const bt = new Date((b as any).submittedAt || (b as any).createdAt || 0).getTime()
        return bt - at
      })

    const latest = related[0]
    if (!latest) return 'pending'
    if (latest.status === 'approved') return 'completed'
    if (latest.status === 'rejected') return 'pending'
    return 'submitted'
  }

  const isTaskDoneForGating = (taskId: string) => {
    if (!isStudentViewer) {
      const status = tasks.find((t) => t._id === taskId)?.status || 'pending'
      return status === 'submitted' || status === 'completed'
    }

    const related = submissions
      .filter((s) => {
        const t: any = (s as any).taskId
        const id = typeof t === 'string' ? t : t?._id
        return id === taskId
      })
      .sort((a, b) => {
        const at = new Date((a as any).submittedAt || (a as any).createdAt || 0).getTime()
        const bt = new Date((b as any).submittedAt || (b as any).createdAt || 0).getTime()
        return bt - at
      })

    const latest = related[0]
    if (!latest) return false
    return latest.status !== 'rejected'
  }

  const isStepCompleted = (stepNumber: number) => {
    const stepTasks = tasks.filter((t) => (t.stepNumber || 0) === stepNumber)
    if (stepTasks.length === 0) return false
    return stepTasks.every((t) => isTaskDoneForGating(t._id))
  }

  const sortedSteps = Array.from(new Set(tasks.map((t) => t.stepNumber || 0)))
    .filter((s) => s > 0)
    .sort((a, b) => a - b)

  const firstIncompleteStep = (() => {
    for (const s of sortedSteps) {
      if (!isStepCompleted(s)) return s
    }
    return null
  })()

  const isStepLocked = (stepNumber: number) => {
    if (!isStudentViewer) return false
    if (firstIncompleteStep === null) return false
    return stepNumber > firstIncompleteStep
  }

  useEffect(() => {
    if (!isStudentViewer) return
    if (tasks.length === 0) {
      setStats({ total: 0, completed: 0, pending: 0, inProgress: 0, submitted: 0, totalPoints: 0 })
      return
    }

    const computed = tasks.map((t) => ({ ...t, status: getTaskComputedStatus(t._id) }))
    const total = computed.length
    const completed = computed.filter((t) => t.status === 'completed').length
    const submitted = computed.filter((t) => t.status === 'submitted').length
    const pending = total - completed - submitted

    const totalPoints = computed.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.points || 0), 0)

    setStats({
      total,
      completed,
      pending,
      inProgress: 0,
      submitted,
      totalPoints
    })
  }, [isStudentViewer, tasks, submissions])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Vazifalar yuklanmoqda...</p>
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
            onClick={fetchTasks}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  // Group tasks by step number
  const groupedTasks = tasks.reduce((groups, task) => {
    const step = task.stepNumber || 0
    if (!groups[step]) {
      groups[step] = []
    }
    groups[step].push(task)
    return groups
  }, {} as Record<number, Task[]>)

  // Sort tasks within each step
  Object.keys(groupedTasks).forEach(stepKey => {
    const step = parseInt(stepKey)
    groupedTasks[step].sort((a, b) => {
      // First lesson, then tests, then practical
      const typeOrder = { lesson: 1, test: 2, practical: 3 }
      const aOrder = typeOrder[a.taskType || 'lesson']
      const bOrder = typeOrder[b.taskType || 'lesson']

      if (aOrder !== bOrder) return aOrder - bOrder
      return (a.orderInStep || 0) - (b.orderInStep || 0)
    })
  })

  // Vazifa boshlash
  const handleStartStep = (stepNumber: number) => {
    setWorkflowStep(stepNumber)
  }

  // Vazifa tugallash
  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, status: 'completed' } : t
    ))
    if (isStudentViewer) {
      fetchSubmissions()
    } else {
      fetchStats()
    }
  }

  // Refresh function
  const handleRefresh = async () => {
    if (isStudentViewer) {
      await Promise.all([fetchTasks(), fetchSubmissions()])
    } else {
      await Promise.all([fetchTasks(), fetchStats()])
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Qadamlar</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 hidden sm:block">O'quv qadamlaringiz</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/30">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 sm:p-2 rounded-md transition ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 sm:p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 sm:px-3 sm:py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Yangilash</span>
          </button>
        </div>
      </div>

      {/* Stats - horizontal scroll on mobile */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30 shrink-0">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{sortedSteps.length}</p>
            <p className="text-[10px] text-slate-400">Jami</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30 shrink-0">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{sortedSteps.filter(s => isStepCompleted(s)).length}</p>
            <p className="text-[10px] text-slate-400">Tugallangan</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30 shrink-0">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{sortedSteps.filter(s => !isStepCompleted(s)).length}</p>
            <p className="text-[10px] text-slate-400">Qolgan</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2 border border-slate-700/30 shrink-0">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">{stats.totalPoints}</p>
            <p className="text-[10px] text-slate-400">Ball</p>
          </div>
        </div>
      </div>

      {/* Steps - Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sortedSteps.map(stepNumber => {
            const stepTasks = groupedTasks[stepNumber] || []
            const mainTask = stepTasks.find(task => task.taskType === 'lesson')
            const testTasks = stepTasks.filter(task => task.taskType === 'test')
            const locked = isStepLocked(stepNumber)
            const completed = isStepCompleted(stepNumber)
            const completedTests = testTasks.filter(t => isTaskDoneForGating(t._id)).length
            const progress = stepTasks.length > 0 ? Math.round((stepTasks.filter(t => isTaskDoneForGating(t._id)).length / stepTasks.length) * 100) : 0

            return (
              <div
                key={stepNumber}
                className={`bg-slate-800/40 rounded-xl border p-4 transition-all ${
                  completed 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : locked 
                      ? 'border-slate-700/30 opacity-50' 
                      : 'border-slate-700/30 hover:border-blue-500/30'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    completed ? 'bg-green-500' : locked ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {completed ? <Check className="w-5 h-5 text-white" /> : locked ? <Lock className="w-4 h-4 text-slate-400" /> : <span className="text-sm font-bold text-white">{stepNumber}</span>}
                  </div>
                  <span className="text-xs text-slate-400">{progress}%</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white mb-1 truncate">{mainTask?.title || `${stepNumber}-qadam`}</h3>
                <p className="text-xs text-slate-400 mb-3">{testTasks.length} ta test • {mainTask?.points || 0} ball</p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-700/50 rounded-full mb-3">
                  <div className={`h-full rounded-full transition-all ${completed ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                </div>

                {/* Action */}
                {completed ? (
                  <button
                    onClick={() => handleStartStep(stepNumber)}
                    className="w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition"
                  >
                    <Play className="w-3 h-3" />
                    Qayta ko'rish
                  </button>
                ) : (
                  <button
                    onClick={() => !locked && handleStartStep(stepNumber)}
                    disabled={locked}
                    className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                      locked ? 'bg-slate-700/50 text-slate-500' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    }`}
                  >
                    {locked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {locked ? 'Bloklangan' : 'Boshlash'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:gap-3">
          {sortedSteps.map(stepNumber => {
            const stepTasks = groupedTasks[stepNumber] || []
            const mainTask = stepTasks.find(task => task.taskType === 'lesson')
            const testTasks = stepTasks.filter(task => task.taskType === 'test')
            const locked = isStepLocked(stepNumber)
            const completed = isStepCompleted(stepNumber)
            const completedTests = testTasks.filter(t => isTaskDoneForGating(t._id)).length
            const progress = stepTasks.length > 0 ? Math.round((stepTasks.filter(t => isTaskDoneForGating(t._id)).length / stepTasks.length) * 100) : 0

            return (
              <div
                key={stepNumber}
                className={`bg-slate-800/40 rounded-xl border transition-all ${
                  completed 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : locked 
                      ? 'border-slate-700/30 opacity-50' 
                      : 'border-slate-700/30 hover:border-blue-500/30'
                }`}
              >
                <div className="p-3 sm:p-4 flex items-center gap-3">
                  {/* Step number */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                    completed ? 'bg-green-500' : locked ? 'bg-slate-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : locked ? <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" /> : <span className="text-xs sm:text-sm font-bold text-white">{stepNumber}</span>}
                  </div>

                  {/* Title & info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">{mainTask?.title || `${stepNumber}-qadam`}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">{testTasks.length} ta test • {mainTask?.points || 0} ball</p>
                  </div>

                  {/* Progress - desktop only */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{progress}%</p>
                      <p className="text-[10px] text-slate-400">Jarayon</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">{completedTests}/{testTasks.length}</p>
                      <p className="text-[10px] text-slate-400">Testlar</p>
                    </div>
                  </div>

                {/* Action */}
                {completed ? (
                  <button
                    onClick={() => handleStartStep(stepNumber)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium shrink-0 hover:bg-green-500/30 transition flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    <span className="hidden sm:inline">Qayta</span>
                  </button>
                ) : (
                    <button
                      onClick={() => !locked && handleStartStep(stepNumber)}
                      disabled={locked}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-medium flex items-center gap-1.5 transition shrink-0 ${
                        locked ? 'bg-slate-700/50 text-slate-500' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      }`}
                    >
                      {locked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span className="hidden sm:inline">{locked ? 'Bloklangan' : 'Boshlash'}</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {sortedSteps.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Qadamlar topilmadi</h3>
          <p className="text-slate-400 text-sm">Hozircha qadamlar mavjud emas</p>
        </div>
      )}

      {/* Step Workflow Modal */}
      {workflowStep !== null && groupedTasks[workflowStep] && (
        <StepWorkflow
          stepNumber={workflowStep}
          stepTasks={groupedTasks[workflowStep]}
          onClose={() => {
            setWorkflowStep(null)
            handleRefresh()
          }}
          onTaskComplete={handleTaskComplete}
        />
      )}
    </div>
  )
}