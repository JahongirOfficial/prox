import { useState, useEffect } from 'react'
import { Task } from '../services/tasksService'
import { submissionService, type Submission } from '../services/submissionService'
import { X, ArrowLeft, ArrowRight, Code, FileText, ChevronDown, ChevronUp } from 'lucide-react'

interface StepWorkflowProps {
  stepNumber: number
  stepTasks: Task[]
  onClose: () => void
  onTaskComplete: (taskId: string) => void
}

type WorkflowStage = 'tests' | 'lesson' | 'completed'

export default function StepWorkflow({ stepNumber, stepTasks, onClose, onTaskComplete }: StepWorkflowProps) {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('tests')
  const [currentTestIndex, setCurrentTestIndex] = useState(0)
  const [lessonContent, setLessonContent] = useState('')
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({})
  const [submittedTests, setSubmittedTests] = useState<Record<number, boolean>>({})
  const [testResults, setTestResults] = useState<Record<number, { selectedIndex: number; correctIndex: number | null; isCorrect: boolean }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [optionsAnimKey, setOptionsAnimKey] = useState(0)
  const [lessonSubmissionId, setLessonSubmissionId] = useState<string | null>(null)
  const [lessonReview, setLessonReview] = useState<Submission | null>(null)
  const [showAllTests, setShowAllTests] = useState(false)

  const mainTask = stepTasks.find(task => task.taskType === 'lesson')
  const testTasks = stepTasks.filter(task => task.taskType === 'test').sort((a, b) => (a.orderInStep || 0) - (b.orderInStep || 0))

  const headerStageText = currentStage === 'tests'
    ? `Test ${Math.min(currentTestIndex + 1, Math.max(testTasks.length, 1))}/${testTasks.length || 0}`
    : currentStage === 'lesson' ? 'Kod yozish' : 'Natijalar'

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [])

  useEffect(() => {
    if (currentStage !== 'tests') return
    setOptionsAnimKey((prev) => prev + 1)
  }, [currentStage, currentTestIndex])

  useEffect(() => {
    if (!lessonSubmissionId) return
    let cancelled = false
    const tick = async () => {
      try {
        const res = await submissionService.getSubmissionResult(lessonSubmissionId)
        if (cancelled) return
        setLessonReview(res)
        const hasReview = !!(res as any)?.aiReview?.reviewedAt
        const status = (res as any)?.status
        const isDone = hasReview || status === 'reviewed' || status === 'approved' || status === 'rejected'
        
        // AI review tugagandan keyin "completed" ga o'tkazamiz
        if (isDone && currentStage !== 'completed') {
          setCurrentStage('completed')
        }
        
        return isDone
      } catch { return false }
    }
    let intervalId: any = null
    ;(async () => {
      const done = await tick()
      if (done || cancelled) return
      intervalId = setInterval(async () => {
        const ok = await tick()
        if (ok && intervalId) clearInterval(intervalId)
      }, 2000)
    })()
    return () => { cancelled = true; if (intervalId) clearInterval(intervalId) }
  }, [lessonSubmissionId, currentStage])

  const handleSubmitTest = async () => {
    const currentTest = testTasks[currentTestIndex]
    if (!currentTest || testAnswers[currentTestIndex] === undefined) return
    try {
      setSubmitting(true)
      const resp: any = await submissionService.submitTask(currentTest._id, {
        submissionType: 'test',
        content: testAnswers[currentTestIndex].toString(),
        testAnswers: [{ questionIndex: 0, selectedAnswer: testAnswers[currentTestIndex] }]
      })
      const selectedIndex = Number(testAnswers[currentTestIndex])
      const correctIndexRaw = (currentTest as any)?.content?.correctAnswer
      const correctIndex = Number.isFinite(Number(correctIndexRaw)) ? Number(correctIndexRaw) : null
      const apiIsCorrect = resp?.submission?.testAnswers?.[0]?.isCorrect
      const isCorrect = typeof apiIsCorrect === 'boolean' ? apiIsCorrect : (correctIndex !== null ? selectedIndex === correctIndex : false)
      setSubmittedTests((prev) => ({ ...prev, [currentTestIndex]: true }))
      setTestResults((prev) => ({ ...prev, [currentTestIndex]: { selectedIndex, correctIndex, isCorrect } }))
      if (currentTestIndex < testTasks.length - 1) setCurrentTestIndex(prev => prev + 1)
      else setCurrentStage('lesson')
      if (isCorrect) onTaskComplete(currentTest._id)
    } catch (err) {
      const anyErr = err as any
      alert('Xatolik: ' + (anyErr?.response?.data?.message || (err instanceof Error ? err.message : 'Xatolik')))
    } finally { setSubmitting(false) }
  }

  const handlePrevTest = () => { if (currentTestIndex > 0) setCurrentTestIndex(prev => prev - 1) }

  const handleNextTest = async () => {
    if (testTasks.length === 0) { setCurrentStage('lesson'); return }
    if (submittedTests[currentTestIndex]) {
      if (currentTestIndex < testTasks.length - 1) setCurrentTestIndex(prev => prev + 1)
      else setCurrentStage('lesson')
      return
    }
    await handleSubmitTest()
  }

  const handleSubmitLesson = async () => {
    if (!mainTask || !lessonContent.trim()) return
    try {
      setSubmitting(true)
      const resp: any = await submissionService.submitTask(mainTask._id, { submissionType: 'code', content: lessonContent })
      setLessonSubmissionId(resp?.submission?._id || null)
      // Darhol "completed" ga o'tkazmaslik - AI review kutamiz
      // setCurrentStage('completed') - bu qatorni olib tashladik
    } catch { alert('Xatolik yuz berdi') }
    finally { setSubmitting(false) }
  }

  const handleRestartStep = () => {
    setCurrentStage('tests')
    setCurrentTestIndex(0)
    setTestAnswers({})
    setTestResults({})
    setSubmittedTests({})
    setLessonContent('')
    setLessonSubmissionId(null)
    setLessonReview(null)
    setShowAllTests(false)
  }

  const totalTests = testTasks.length
  const correctTests = Object.values(testResults).filter(r => r.isCorrect).length
  const allTestsPassed = totalTests === 0 || correctTests === totalTests
  const codeScore = lessonReview?.aiReview?.score ?? null
  const codeErrors = (lessonReview?.aiReview as any)?.errors || []
  const allCodePassed = codeScore !== null && codeScore >= 70 && codeErrors.length === 0
  const codeReviewed = lessonReview?.aiReview !== undefined
  const correctedCode = (lessonReview?.aiReview as any)?.correctedCode || null
  const taskDescription = (mainTask as any)?.content?.instruction || (mainTask as any)?.content?.description || mainTask?.description || ''
  const taskHint = (mainTask as any)?.content?.hint || 'DOCTYPE, html, head, body'
  const variants = ['A', 'B', 'C', 'D']
  const stepPassed = allTestsPassed && codeReviewed && allCodePassed

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]">
      <style>{`
        @keyframes proXOptionIn { 0% { opacity: 0; transform: translateX(-28px); } 100% { opacity: 1; transform: translateX(0); } }
        .proX-option-anim { animation: proXOptionIn 520ms cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
      <div className="w-screen h-screen bg-slate-900 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-700 bg-slate-800/90 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <span className="text-base font-bold text-white">{stepNumber}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white truncate">{mainTask?.title || `${stepNumber}-qadam`}</h3>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[11px] lg:text-xs font-semibold border border-slate-600/40 bg-slate-900/30 text-slate-200">{headerStageText}</span>
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-slate-400 truncate">{currentStage === 'tests' ? 'Savolga javob bering' : currentStage === 'lesson' ? 'Kodni yozing' : 'Natijalar'}</p>
              </div>
            </div>
            {currentStage !== 'completed' && (
              <button onClick={onClose} className="w-10 h-10 bg-slate-700/40 hover:bg-slate-600/50 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition"><X className="w-5 h-5" /></button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 min-h-0 p-4 ${currentStage === 'completed' ? 'overflow-y-auto' : 'overflow-hidden'}`}>
          <div className="h-full max-w-6xl mx-auto">
            {/* Tests Stage */}
            {currentStage === 'tests' && testTasks.length > 0 && (
              <div className="h-full flex flex-col justify-between overflow-hidden">
                <div className="shrink-0">
                  <div className="w-full bg-gradient-to-b from-slate-800/35 to-slate-900/25 border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-slate-700/40 bg-slate-900/20">
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] sm:text-[11px] text-slate-500">Savol</p>
                          <h5 className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-white leading-snug break-words">{testTasks[currentTestIndex].content?.question || testTasks[currentTestIndex].description}</h5>
                        </div>
                        <span className="shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/25 rounded-lg text-[10px] sm:text-xs font-semibold">{testTasks[currentTestIndex].points} ball</span>
                      </div>
                    </div>
                    <div className="px-3 sm:px-4 py-2 sm:py-3">
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mb-1.5 sm:mb-2">Variantlar</p>
                      <div className="flex flex-col gap-1.5 sm:gap-2">
                        {testTasks[currentTestIndex].content?.options?.map((option: string, index: number) => {
                          const selected = testAnswers[currentTestIndex] === index
                          return (
                            <label key={`${optionsAnimKey}-${index}`} className={`proX-option-anim group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border cursor-pointer transition ${selected ? 'border-yellow-500/70 bg-yellow-500/10' : 'border-slate-600/40 bg-slate-700/10 hover:bg-slate-700/25'}`} style={{ animationDelay: `${index * 110}ms` }}>
                              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg border flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0 ${selected ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-slate-500/70 text-slate-200'}`}>{variants[index]}</div>
                              <span className="text-xs sm:text-sm lg:text-base text-slate-200 leading-snug">{option.replace(/^[A-D]\)\s*/, '')}</span>
                              <input type="radio" name={`test-${currentTestIndex}`} checked={selected} onChange={() => setTestAnswers(prev => ({ ...prev, [currentTestIndex]: index }))} className="sr-only" />
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 grid grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <button onClick={handlePrevTest} disabled={submitting || currentTestIndex === 0} className="py-2 sm:py-2.5 bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-lg sm:rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold"><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Orqaga</button>
                  <button onClick={handleNextTest} disabled={submitting || testAnswers[currentTestIndex] === undefined} className="py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg sm:rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold">
                    {submitting ? <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div></> : currentTestIndex < testTasks.length - 1 ? <>Keyingi <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></> : <>Davom <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* Lesson Stage */}
            {currentStage === 'lesson' && mainTask && (
              <div className="h-full flex flex-col gap-4 overflow-hidden">
                {/* Agar submission yaratilgan bo'lsa va AI review kutilayotgan bo'lsa */}
                {lessonSubmissionId ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-white mb-2">AI tekshirmoqda...</h3>
                      <p className="text-slate-400">Kodingiz tahlil qilinmoqda, iltimos kuting</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-blue-400" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs lg:text-sm text-blue-400 font-medium">📝 Vazifa</p>
                          <p className="text-sm lg:text-base xl:text-lg text-white mt-1">{taskDescription || 'HTML sahifa yarating'}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-slate-800/50 rounded-lg text-xs lg:text-sm text-slate-300">💡 {taskHint}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                      <div className="min-h-0 flex flex-col bg-slate-800/30 border border-slate-700/40 rounded-2xl overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-slate-700/40 text-xs text-slate-400 flex items-center gap-2"><Code className="w-4 h-4" /> Kodingiz</div>
                        <textarea value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} placeholder={"<!DOCTYPE html>\n<html>\n<head>\n  <title>Sahifa</title>\n</head>\n<body>\n  <h1>Salom!</h1>\n</body>\n</html>"} className="flex-1 min-h-0 bg-transparent p-4 text-slate-200 font-mono text-xs sm:text-sm lg:text-base resize-none focus:outline-none" />
                      </div>
                      <div className="min-h-0 flex flex-col bg-white rounded-2xl border border-slate-700/40 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-950 text-xs text-slate-300 border-b border-slate-800">Preview</div>
                        <iframe srcDoc={lessonContent || '<p style="padding:16px;color:#64748b;">Kod yozing</p>'} className="w-full flex-1 min-h-0 border-0" title="Preview" />
                      </div>
                    </div>
                    <button onClick={handleSubmitLesson} disabled={submitting || !lessonContent.trim()} className="py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-semibold">
                      {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Tekshirilmoqda...</> : <>Yakunlash <ArrowRight className="w-5 h-5" /></>}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Completed Stage */}
            {currentStage === 'completed' && (
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {/* Test natijalari */}
                  <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl sm:rounded-2xl flex flex-col">
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white">Test natijalari</span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold ${allTestsPassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {correctTests}/{totalTests}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                      <div className="flex flex-col gap-2">
                        {(showAllTests ? testTasks : testTasks.slice(0, Math.min(totalTests, codeErrors.length > 0 ? codeErrors.length + 2 : 4))).map((test, idx) => {
                          const result = testResults[idx]
                          const options = test.content?.options || []
                          return (
                            <div key={idx} className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border ${result?.isCorrect ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                              <p className="text-[11px] sm:text-sm text-white font-medium mb-1">{idx + 1}. {test.content?.question || test.description}</p>
                              <div className="text-[10px] sm:text-xs">
                                <p className="text-slate-400">
                                  Siz: <span className={result?.isCorrect ? 'text-green-400' : 'text-red-400'}>{variants[result?.selectedIndex ?? 0]}) {options[result?.selectedIndex ?? 0]?.replace(/^[A-D]\)\s*/, '')}</span>
                                </p>
                                {!result?.isCorrect && result?.correctIndex !== null && (
                                  <p className="text-slate-400 mt-0.5">
                                    To'g'ri: <span className="text-green-400">{variants[result.correctIndex]}) {options[result.correctIndex]?.replace(/^[A-D]\)\s*/, '')}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {!showAllTests && totalTests > (codeErrors.length > 0 ? codeErrors.length + 2 : 4) && (
                        <button 
                          onClick={() => setShowAllTests(true)} 
                          className="w-full mt-2 py-2 text-xs sm:text-sm text-slate-400 hover:text-white flex items-center justify-center gap-1 transition"
                        >
                          Yana {totalTests - (codeErrors.length > 0 ? codeErrors.length + 2 : 4)} ta <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      {showAllTests && totalTests > 4 && (
                        <button 
                          onClick={() => setShowAllTests(false)} 
                          className="w-full mt-2 py-2 text-xs sm:text-sm text-slate-400 hover:text-white flex items-center justify-center gap-1 transition"
                        >
                          Yopish <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Kod tekshiruvi */}
                  <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl sm:rounded-2xl flex flex-col">
                    <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white">Kod tekshiruvi</span>
                        {codeReviewed && (
                          <span className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold ${allCodePassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {codeScore}/100
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-3 sm:p-4">
                      {!codeReviewed ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                          <p className="text-xs sm:text-sm text-slate-400">Tekshirilmoqda...</p>
                        </div>
                      ) : allCodePassed ? (
                        <div className="flex items-center gap-3 py-4">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                            <span className="text-2xl">✓</span>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base font-semibold text-green-400">Kod to'g'ri!</p>
                            <p className="text-[10px] sm:text-xs text-slate-400">Ball: {codeScore}/100</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {codeErrors.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Xatolar:</p>
                              {codeErrors.map((err: any, i: number) => (
                                <div key={i} className="p-1.5 sm:p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                  <p className="text-[10px] sm:text-xs text-red-400">
                                    {err.line && <span className="font-mono bg-red-500/20 px-1 rounded mr-1">:{err.line}</span>}
                                    {err.message}
                                  </p>
                                  {err.code && <pre className="mt-1 text-[10px] text-slate-400 font-mono bg-slate-900/50 p-1 rounded overflow-x-auto">{err.code}</pre>}
                                </div>
                              ))}
                            </div>
                          )}
                          {correctedCode && (
                            <div>
                              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mb-1.5">To'g'ri kod:</p>
                              <pre className="p-2 sm:p-3 bg-slate-900/50 border border-slate-700/40 rounded-lg sm:rounded-xl text-[10px] sm:text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">{correctedCode}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={stepPassed ? onClose : handleRestartStep}
                  className={`py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 ${stepPassed ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'}`}
                >
                  {stepPassed ? 'Yopish' : 'Qadamni qayta boshlash'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
