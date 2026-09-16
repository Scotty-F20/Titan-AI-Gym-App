'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Dumbbell, Clock, Zap, TrendingUp } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getExerciseById } from '@/lib/exercises'
import { WORKOUT_DAY_LABELS } from '@/lib/program'
import type { WorkoutLog } from '@/lib/types'

function formatDuration(start: number, end?: number): string {
  if (!end) return '—'
  const mins = Math.round((end - start) / 60000)
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function WorkoutLogCard({ log }: { log: WorkoutLog }) {
  const [expanded, setExpanded] = useState(false)
  const completedSets = log.exercises.flatMap(e => e.sets).filter(s => s.completed).length
  const totalSets = log.exercises.flatMap(e => e.sets).length

  return (
    <div className="bg-titan-card rounded-2xl border border-titan-border overflow-hidden">
      <button
        className="w-full p-4 text-left touch-target"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-2xs font-bold tracking-widest uppercase text-titan-accent mb-1">
              Week {log.week} · Day {WORKOUT_DAY_LABELS[log.day]}
            </p>
            <p className="font-bold text-titan-text text-base leading-tight mb-2">
              {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Dumbbell size={12} className="text-titan-muted" />
                <span className="text-xs text-titan-muted">{completedSets}/{totalSets} sets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-titan-muted" />
                <span className="text-xs text-titan-muted">{formatDuration(log.startTime, log.endTime)}</span>
              </div>
              {log.totalVolume ? (
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-titan-accent" />
                  <span className="text-xs text-titan-muted">{Math.round(log.totalVolume).toLocaleString()}kg vol</span>
                </div>
              ) : null}
            </div>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-titan-subtle flex-shrink-0 mt-1" />
          ) : (
            <ChevronDown size={16} className="text-titan-subtle flex-shrink-0 mt-1" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-titan-border px-4 pb-4 pt-3 space-y-3">
          {log.exercises.map((exLog, i) => {
            const exercise = getExerciseById(exLog.exerciseId)
            if (!exercise) return null
            const completedSets = exLog.sets.filter(s => s.completed)
            if (completedSets.length === 0) return null
            return (
              <div key={i}>
                <p className="text-sm font-semibold text-titan-text mb-1.5">{exercise.name}</p>
                <div className="space-y-1">
                  {completedSets.map((s, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <span className="text-2xs text-titan-subtle w-10">Set {s.setNumber}</span>
                      <span className="text-xs font-bold text-titan-text">{s.weight}kg</span>
                      <span className="text-xs text-titan-muted">×</span>
                      <span className="text-xs font-bold text-titan-text">{s.actualReps} reps</span>
                      {s.rir !== undefined && (
                        <span className="text-2xs text-titan-muted ml-auto">{s.rir} RIR</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const [workoutLogs] = useLocalStorage<WorkoutLog[]>('titan:workoutLogs', [])

  const sorted = [...workoutLogs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalVolume = workoutLogs.reduce((t, l) => t + (l.totalVolume ?? 0), 0)
  const totalSessions = workoutLogs.length
  const totalSets = workoutLogs.flatMap(l => l.exercises.flatMap(e => e.sets)).filter(s => s.completed).length

  return (
    <AppShell>
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/" className="w-10 h-10 rounded-xl bg-titan-card border border-titan-border flex items-center justify-center touch-target">
            <ArrowLeft size={18} className="text-titan-muted" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-titan-text">Workout History</h1>
            <p className="text-xs text-titan-muted">{totalSessions} sessions logged</p>
          </div>
        </div>

        {/* All-time stats */}
        {totalSessions > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
              <p className="text-xl font-black text-titan-text">{totalSessions}</p>
              <p className="text-2xs text-titan-muted uppercase tracking-widest mt-0.5">Sessions</p>
            </div>
            <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
              <p className="text-xl font-black text-titan-text">{totalSets}</p>
              <p className="text-2xs text-titan-muted uppercase tracking-widest mt-0.5">Total Sets</p>
            </div>
            <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
              <p className="text-xl font-black text-titan-text">
                {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '—'}
              </p>
              <p className="text-2xs text-titan-muted uppercase tracking-widest mt-0.5">kg Volume</p>
            </div>
          </div>
        )}

        {/* Log list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-titan-border rounded-2xl">
            <TrendingUp size={32} className="text-titan-muted mx-auto mb-3" />
            <p className="text-titan-muted font-semibold mb-1">No workouts logged yet</p>
            <p className="text-sm text-titan-subtle">Complete your first workout to see your history here.</p>
            <Link href="/workout" className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-titan-accent text-white text-sm font-bold">
              Generate Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map(log => (
              <WorkoutLogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
