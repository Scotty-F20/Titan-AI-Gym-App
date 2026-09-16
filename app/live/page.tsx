'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, ChevronRight, SkipForward, Bot, X, Timer,
  Plus, Minus, ArrowLeft, Zap, MessageCircle, Send, RefreshCw
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useCountdownTimer, useStopwatch, formatSeconds } from '@/hooks/useTimer'
import { getExerciseById } from '@/lib/exercises'
import { generateWorkout } from '@/lib/workouts'
import type { GeneratedWorkout, SetLog, WorkoutLog, ExerciseLog, ActiveWorkout } from '@/lib/types'

// ─── Rest Timer Overlay ────────────────────────────────────────────────────

function RestTimerOverlay({
  seconds, totalSeconds, onSkip
}: { seconds: number; totalSeconds: number; onSkip: () => void }) {
  const progress = 1 - seconds / totalSeconds
  const circumference = 2 * Math.PI * 54

  return (
    <div className="fixed inset-0 z-40 bg-titan-bg/95 flex flex-col items-center justify-center">
      <p className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-8">Rest Period</p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#23232E" strokeWidth="6" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={seconds <= 10 ? '#FF1744' : '#FF5722'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-4xl font-black ${seconds <= 10 ? 'text-titan-red' : 'text-titan-text'}`}>
            {formatSeconds(seconds)}
          </span>
        </div>
      </div>
      <p className="text-titan-muted text-sm mt-6 mb-8">
        {seconds <= 10 ? 'Almost time!' : 'Recover. Breathe. Focus.'}
      </p>
      <button
        onClick={onSkip}
        className="px-8 py-3 rounded-2xl bg-titan-card border border-titan-border text-titan-text font-bold touch-target"
      >
        Skip Rest
      </button>
    </div>
  )
}

// ─── Inline Coach Chat ─────────────────────────────────────────────────────

function CoachDrawer({
  onClose,
  workoutName,
  exerciseName,
}: {
  onClose: () => void
  workoutName: string
  exerciseName: string
}) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `I'm your TITAN AI coach. You're currently doing **${exerciseName}** in your **${workoutName}**. How can I help?\n\n*Try: "My shoulder hurts", "Reduce the workout", "Swap this exercise", "I failed my last set"*`,
    },
  ])
  const [loading, setLoading] = useState(false)

  const QUICK_PROMPTS = [
    'My shoulder hurts',
    'Swap this exercise',
    'I failed my last set',
    'Reduce workout to 45 min',
    'Add more volume',
    'Reduce fatigue today',
  ]

  async function sendMessage(content: string) {
    if (!content.trim()) return
    const newMessages = [...messages, { role: 'user' as const, content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            type: 'live-workout',
            workoutName,
            exerciseName,
            systemNote: 'User is currently mid-workout. Provide concise, actionable coaching advice. Keep responses under 150 words.',
          },
        }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.message || 'Sorry, something went wrong.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-titan-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-titan-border safe-top">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-titan-accent/20 flex items-center justify-center">
            <Bot size={16} className="text-titan-accent" />
          </div>
          <div>
            <p className="text-sm font-bold text-titan-text">TITAN Coach</p>
            <p className="text-2xs text-titan-green">Live</p>
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-titan-card flex items-center justify-center touch-target">
          <X size={18} className="text-titan-muted" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-titan-accent text-white rounded-br-sm'
                  : 'bg-titan-card text-titan-text rounded-bl-sm border border-titan-border'
                }`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-titan-card border border-titan-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-titan-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              disabled={loading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full bg-titan-card border border-titan-border text-xs text-titan-muted whitespace-nowrap touch-target disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-titan-border safe-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage(input)}
            placeholder="Ask your coach..."
            className="flex-1 bg-titan-card border border-titan-border rounded-xl px-4 py-3 text-sm text-titan-text placeholder:text-titan-muted focus:outline-none focus:border-titan-accent"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-titan-accent flex items-center justify-center disabled:opacity-40 touch-target flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Live Workout Page ────────────────────────────────────────────────

export default function LiveWorkoutPage() {
  const router = useRouter()
  const [activeWorkoutData] = useLocalStorage<GeneratedWorkout | null>('titan:activeWorkout', null)
  const [workoutLogs, setWorkoutLogs] = useLocalStorage<WorkoutLog[]>('titan:workoutLogs', [])
  const [currentDay, setCurrentDay] = useLocalStorage<number>('titan:currentDay', 1)
  const [, setCurrentWeek] = useLocalStorage<number>('titan:currentWeek', 1)
  const [showCoach, setShowCoach] = useState(false)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(0)
  const [weight, setWeight] = useState(60)
  const [reps, setReps] = useState(10)
  const [setLogs, setSetLogs] = useState<Record<string, SetLog[]>>({})
  const [isResting, setIsResting] = useState(false)
  const [showWarmup, setShowWarmup] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const stopwatch = useStopwatch()

  const restSeconds = activeWorkoutData?.exercises[exerciseIndex]?.setConfig.rest ?? 90
  const restTimer = useCountdownTimer(restSeconds)

  // Use the stored workout or generate a default
  const workout: GeneratedWorkout = activeWorkoutData ?? generateWorkout('chest-triceps-core', 1)

  const workingExercises = workout.exercises.filter(e => e.category !== 'warmup')
  const currentPlanned = workingExercises[exerciseIndex]
  const currentExercise = currentPlanned ? getExerciseById(currentPlanned.exerciseId) : null
  const nextPlanned = workingExercises[exerciseIndex + 1]
  const nextExercise = nextPlanned ? getExerciseById(nextPlanned.exerciseId) : null

  const currentSets = currentPlanned ? (setLogs[currentPlanned.exerciseId] ?? []) : []
  const totalSets = currentPlanned?.sets ?? 0

  useEffect(() => {
    if (showWarmup) return
    stopwatch.start()
  }, [showWarmup])

  function logSet(completed: boolean) {
    if (!currentPlanned) return
    const newSet: SetLog = {
      setNumber: setIndex + 1,
      targetReps: parseInt(currentPlanned.setConfig.reps.split('-')[1] ?? '10'),
      actualReps: reps,
      weight,
      rir: currentPlanned.setConfig.rir,
      completed,
      timestamp: Date.now(),
    }

    setSetLogs(prev => ({
      ...prev,
      [currentPlanned.exerciseId]: [...(prev[currentPlanned.exerciseId] ?? []), newSet],
    }))

    if (setIndex + 1 < totalSets) {
      setSetIndex(s => s + 1)
      if (completed) {
        setIsResting(true)
        restTimer.start(restSeconds, () => setIsResting(false))
      }
    } else {
      // Last set of the exercise
      advanceExercise()
    }
  }

  function advanceExercise() {
    if (exerciseIndex + 1 < workingExercises.length) {
      setExerciseIndex(e => e + 1)
      setSetIndex(0)
      setIsResting(false)
    } else {
      completeWorkout()
    }
  }

  function completeWorkout() {
    stopwatch.stop()
    const log: WorkoutLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      workoutId: workout.id,
      phase: workout.phase,
      week: workout.week,
      day: workout.day,
      exercises: Object.entries(setLogs).map(([exerciseId, sets]) => ({
        exerciseId,
        sets,
      } as ExerciseLog)),
      startTime: Date.now() - stopwatch.elapsed * 1000,
      endTime: Date.now(),
      totalVolume: Object.values(setLogs).flat().reduce((total, s) => {
        return total + (s.completed && s.weight && s.actualReps ? s.weight * s.actualReps : 0)
      }, 0),
    }
    setWorkoutLogs(prev => [...prev, log])

    // Advance program position
    const nextDay = currentDay + 1
    if (nextDay > 7) {
      setCurrentDay(1)
      setCurrentWeek(w => Math.min(w + 1, 10))
    } else {
      setCurrentDay(nextDay)
    }

    setIsComplete(true)
  }

  if (showWarmup) {
    return (
      <AppShell hideNav>
        <div className="min-h-screen flex flex-col px-4 pt-safe-top pb-safe-bottom">
          <div className="flex items-center gap-3 pt-6 pb-4">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-titan-card border border-titan-border flex items-center justify-center touch-target">
              <ArrowLeft size={18} className="text-titan-muted" />
            </button>
            <h1 className="text-lg font-black text-titan-text truncate flex-1">{workout.name}</h1>
          </div>

          <div className="flex-1">
            <div className="bg-titan-accent/10 border border-titan-accent/30 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold tracking-widest uppercase text-titan-accent mb-2">Before You Begin</p>
              <h2 className="text-xl font-black text-titan-text mb-1">Warm-Up Protocol</h2>
              <p className="text-sm text-titan-muted mb-4">Complete this before starting work sets.</p>
              <ul className="space-y-3">
                {workout.warmup.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-titan-accent/20 flex items-center justify-center text-xs font-bold text-titan-accent flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-titan-text leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-titan-card rounded-2xl border border-titan-border p-4 mb-6">
              <p className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-3">Today&apos;s Workout</p>
              <div className="space-y-2">
                {workingExercises.map((ex, i) => {
                  const exercise = getExerciseById(ex.exerciseId)
                  return exercise ? (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-titan-muted w-5 text-right">{i + 1}</span>
                      <span className="text-sm text-titan-text flex-1 truncate">{exercise.name}</span>
                      <span className="text-xs text-titan-muted">{ex.sets}×{ex.setConfig.reps}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWarmup(false)}
            className="w-full py-5 rounded-2xl bg-gradient-titan text-white font-black text-lg tracking-wide shadow-titan active:scale-95 transition-all touch-target flex items-center justify-center gap-2 mb-6"
          >
            <Zap size={20} />
            Start Working Sets
          </button>
        </div>
      </AppShell>
    )
  }

  if (isComplete) {
    const totalVol = Object.values(setLogs).flat().reduce((t, s) =>
      t + (s.completed && s.weight && s.actualReps ? s.weight * s.actualReps : 0), 0)
    const completedSets = Object.values(setLogs).flat().filter(s => s.completed).length
    return (
      <AppShell hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="w-24 h-24 rounded-3xl bg-titan-green/20 flex items-center justify-center mb-6">
            <Check size={44} className="text-titan-green" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-titan-text mb-2">Workout Complete!</h1>
          <p className="text-titan-muted mb-8">Outstanding work. Growth happens in the recovery.</p>

          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            {[
              { label: 'Duration', value: stopwatch.format() },
              { label: 'Sets Done', value: String(completedSets) },
              { label: 'Volume', value: `${Math.round(totalVol)}kg` },
            ].map(stat => (
              <div key={stat.label} className="bg-titan-card rounded-2xl border border-titan-border p-3">
                <p className="text-xl font-black text-titan-text">{stat.value}</p>
                <p className="text-2xs text-titan-muted uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl bg-gradient-titan text-white font-black text-base shadow-titan mb-3"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push('/coach')}
            className="w-full py-4 rounded-2xl bg-titan-card border border-titan-border text-titan-text font-semibold"
          >
            Ask Coach for Feedback
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell hideNav>
      {/* Rest Timer Overlay */}
      {isResting && (
        <RestTimerOverlay
          seconds={restTimer.seconds}
          totalSeconds={restSeconds}
          onSkip={() => { restTimer.skip(); setIsResting(false) }}
        />
      )}

      {/* Coach Drawer */}
      {showCoach && (
        <CoachDrawer
          onClose={() => setShowCoach(false)}
          workoutName={workout.name}
          exerciseName={currentExercise?.name ?? ''}
        />
      )}

      <div className="min-h-screen flex flex-col px-4 pt-safe-top pb-safe-bottom">
        {/* Top Bar */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Timer size={14} className="text-titan-accent" />
              <span className="text-sm font-mono font-bold text-titan-text">{stopwatch.format()}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-titan-muted">
              Exercise {exerciseIndex + 1} of {workingExercises.length}
            </p>
            <div className="flex gap-1 mt-1 justify-center">
              {workingExercises.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${
                  i < exerciseIndex ? 'bg-titan-green w-3' :
                  i === exerciseIndex ? 'bg-titan-accent w-5' :
                  'bg-titan-border w-3'
                }`} />
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowCoach(true)}
            className="w-10 h-10 rounded-xl bg-titan-accent/10 border border-titan-accent/30 flex items-center justify-center touch-target"
          >
            <Bot size={18} className="text-titan-accent" />
          </button>
        </div>

        {/* Current Exercise */}
        <div className="flex-1">
          {currentExercise ? (
            <>
              {/* Exercise Header */}
              <div className="bg-gradient-card rounded-2xl border border-titan-border p-5 mb-4">
                <p className="text-2xs font-bold tracking-widest uppercase text-titan-accent mb-1">
                  {currentPlanned && currentPlanned.category.toUpperCase()}
                </p>
                <h2 className="text-2xl font-black text-titan-text leading-tight mb-3">
                  {currentExercise.name}
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Sets',  value: `${setIndex + 1}/${totalSets}` },
                    { label: 'Reps',  value: currentPlanned?.setConfig.reps ?? '–' },
                    { label: 'RIR',   value: `${currentPlanned?.setConfig.rir ?? 2}` },
                    { label: 'Rest',  value: `${restSeconds}s` },
                  ].map(stat => (
                    <div key={stat.label} className="bg-titan-surface rounded-xl p-2.5 text-center">
                      <p className="text-base font-black text-titan-text">{stat.value}</p>
                      <p className="text-2xs text-titan-muted uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set Logging */}
              <div className="bg-titan-card rounded-2xl border border-titan-border p-5 mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-4">
                  Log Set {setIndex + 1}
                </p>

                {/* Weight */}
                <div className="mb-4">
                  <p className="text-xs text-titan-muted mb-2">Weight (kg)</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setWeight(w => Math.max(0, w - 2.5))}
                      className="w-12 h-12 rounded-xl bg-titan-surface border border-titan-border flex items-center justify-center touch-target"
                    >
                      <Minus size={18} className="text-titan-text" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-titan-text">{weight}</span>
                      <span className="text-sm text-titan-muted ml-1">kg</span>
                    </div>
                    <button
                      onClick={() => setWeight(w => w + 2.5)}
                      className="w-12 h-12 rounded-xl bg-titan-surface border border-titan-border flex items-center justify-center touch-target"
                    >
                      <Plus size={18} className="text-titan-text" />
                    </button>
                  </div>
                </div>

                {/* Reps */}
                <div>
                  <p className="text-xs text-titan-muted mb-2">Reps Completed</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setReps(r => Math.max(0, r - 1))}
                      className="w-12 h-12 rounded-xl bg-titan-surface border border-titan-border flex items-center justify-center touch-target"
                    >
                      <Minus size={18} className="text-titan-text" />
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-titan-text">{reps}</span>
                      <span className="text-sm text-titan-muted ml-1">reps</span>
                    </div>
                    <button
                      onClick={() => setReps(r => r + 1)}
                      className="w-12 h-12 rounded-xl bg-titan-surface border border-titan-border flex items-center justify-center touch-target"
                    >
                      <Plus size={18} className="text-titan-text" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Previous Sets */}
              {currentSets.length > 0 && (
                <div className="bg-titan-card rounded-2xl border border-titan-border p-4 mb-4">
                  <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-3">Completed Sets</p>
                  <div className="space-y-2">
                    {currentSets.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-titan-muted">Set {s.setNumber}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-titan-text">{s.weight}kg</span>
                          <span className="text-sm text-titan-muted">×</span>
                          <span className="text-sm font-bold text-titan-text">{s.actualReps} reps</span>
                          <Check size={14} className="text-titan-green" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Exercise Preview */}
              {nextExercise && (
                <div className="bg-titan-surface rounded-2xl border border-titan-border p-3 mb-4 flex items-center gap-3">
                  <span className="text-2xs font-bold tracking-widest uppercase text-titan-muted">Next</span>
                  <span className="text-sm text-titan-muted truncate flex-1">{nextExercise.name}</span>
                  <span className="text-xs text-titan-muted">{nextPlanned?.sets}×{nextPlanned?.setConfig.reps}</span>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => logSet(false)}
              className="py-4 rounded-2xl bg-titan-card border border-titan-border text-titan-muted font-bold touch-target"
            >
              Failed Set
            </button>
            <button
              onClick={() => logSet(true)}
              className="py-4 rounded-2xl bg-gradient-titan text-white font-black shadow-titan touch-target active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={3} />
              Complete Set
            </button>
          </div>
          <button
            onClick={advanceExercise}
            className="w-full py-3 rounded-2xl bg-titan-surface border border-titan-border text-titan-muted text-sm font-semibold flex items-center justify-center gap-2 touch-target"
          >
            <SkipForward size={15} />
            Skip Exercise
          </button>
        </div>
      </div>
    </AppShell>
  )
}
