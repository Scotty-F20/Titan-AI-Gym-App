'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, ChevronRight, Flame, Trophy, Clock, Bot,
  CheckCircle, Circle, History, ChevronLeft, Check,
} from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { WEEK_PLANS, getPhaseForWeek, WORKOUT_DAY_LABELS } from '@/lib/program'
import type { WorkoutLog } from '@/lib/types'

function getStreak(logs: WorkoutLog[]): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (logs.some(l => l.date.startsWith(dateStr))) streak++
    else if (i > 0) break
  }
  return streak
}

export default function Dashboard() {
  const [workoutLogs] = useLocalStorage<WorkoutLog[]>('titan:workoutLogs', [])
  const [currentWeek, setCurrentWeek] = useLocalStorage<number>('titan:currentWeek', 1)
  const [currentDay, setCurrentDay] = useLocalStorage<number>('titan:currentDay', 1)
  const [confirmJump, setConfirmJump] = useState<number | null>(null)

  const phase = getPhaseForWeek(currentWeek)
  const weekPlan = WEEK_PLANS[currentWeek - 1]
  const todayDayIndex = currentDay - 1
  const todayPlan = weekPlan?.days[todayDayIndex]
  const streak = getStreak(workoutLogs)
  const workoutsThisWeek = workoutLogs.filter(l => l.week === currentWeek).length
  const weeklyVolume = workoutLogs
    .filter(l => l.week === currentWeek)
    .reduce((t, l) => t + (l.totalVolume ?? 0), 0)

  function markCurrentDone() {
    if (currentDay >= 7) {
      // End of week — advance to next week
      setCurrentDay(1)
      setCurrentWeek(w => Math.min(w + 1, 10))
    } else {
      setCurrentDay(d => d + 1)
    }
  }

  function jumpToDay(dayIndex: number) {
    // dayIndex is 0-based
    if (dayIndex === todayDayIndex) return
    setCurrentDay(dayIndex + 1)
    setConfirmJump(null)
  }

  function handleDayTap(i: number) {
    if (i === todayDayIndex) return // already current
    if (i > todayDayIndex) {
      // Jumping forward — ask to confirm once
      setConfirmJump(i)
    } else {
      // Jumping back — do it immediately
      jumpToDay(i)
    }
  }

  return (
    <AppShell>
      <div className="px-4 pt-safe-top">

        {/* Header */}
        <div className="pt-8 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-titan-muted text-sm font-medium tracking-widest uppercase">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl font-black text-titan-text mt-0.5 tracking-tight">
                TITAN<span className="gradient-text"> AI</span>
              </h1>
            </div>
            <Link
              href="/coach"
              className="w-12 h-12 rounded-2xl bg-titan-accent/10 border border-titan-accent/30 flex items-center justify-center"
            >
              <Bot size={22} className="text-titan-accent" />
            </Link>
          </div>
        </div>

        {/* Phase Banner with week navigation */}
        <div className="bg-gradient-card rounded-2xl border border-titan-border p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-base font-bold text-titan-text">{phase.name}</p>
              <p className="text-xs text-titan-muted mt-0.5">{phase.description.split('.')[0]}.</p>
            </div>
            {/* Week navigation */}
            <div className="flex items-center gap-1 ml-3">
              <button
                onClick={() => { setCurrentWeek(w => Math.max(w - 1, 1)); setCurrentDay(1) }}
                disabled={currentWeek <= 1}
                className="w-8 h-8 rounded-lg bg-titan-surface border border-titan-border flex items-center justify-center disabled:opacity-30 touch-target"
              >
                <ChevronLeft size={14} className="text-titan-muted" />
              </button>
                <div className="px-3 py-1 bg-titan-accent/10 rounded-lg border border-titan-accent/30 text-center min-w-[64px]">
                <p className="text-xs font-black text-titan-accent">Wk {currentWeek}</p>
                <p className="text-2xs text-titan-muted">of 10</p>
              </div>
              <button
                onClick={() => { setCurrentWeek(w => Math.min(w + 1, 10)); setCurrentDay(1) }}
                disabled={currentWeek >= 10}
                className="w-8 h-8 rounded-lg bg-titan-surface border border-titan-border flex items-center justify-center disabled:opacity-30 touch-target"
              >
                <ChevronRight size={14} className="text-titan-muted" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="progress-bar mb-1">
            <div className="progress-fill" style={{ width: `${((currentWeek - 1) * 7 + currentDay) / 70 * 100}%` }} />
          </div>
          <p className="text-2xs text-titan-muted text-right">
            Day {(currentWeek - 1) * 7 + currentDay} of 70
          </p>
        </div>

        {/* Today's Workout CTA */}
        {todayPlan && todayPlan.dayType !== 'recovery' ? (
          <Link href="/workout" className="block mb-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-titan-accent/20 to-titan-accent/5 border border-titan-accent/40 p-5 shadow-titan">
              <div className="absolute top-0 right-0 w-32 h-32 bg-titan-accent/10 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-titan-accent flex items-center justify-center">
                    <Zap size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-bold tracking-widest uppercase text-titan-accent">
                    Day {currentDay} · Today&apos;s Workout
                  </span>
                </div>
                <h2 className="text-xl font-black text-titan-text leading-tight mb-1">
                  {WORKOUT_DAY_LABELS[todayPlan.dayType]}
                </h2>
                <p className="text-sm text-titan-muted mb-4">{todayPlan.focus}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-titan-muted" />
                      <span className="text-xs text-titan-muted">~70 min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flame size={13} className="text-titan-accent" />
                      <span className="text-xs text-titan-muted">{phase.setsPerMuscle.max} sets max</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-titan-accent font-bold text-sm">
                    Start <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ) : todayPlan?.dayType === 'recovery' ? (
          <div className="mb-5 rounded-2xl bg-titan-card border border-titan-border p-5">
            <p className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-1">Day {currentDay}</p>
            <h3 className="font-bold text-titan-text mb-1">Recovery Day</h3>
            <p className="text-sm text-titan-muted">Active recovery: walk, stretch, and sleep well.</p>
            <button
              onClick={markCurrentDone}
              className="mt-3 w-full py-2.5 rounded-xl bg-titan-green/10 border border-titan-green/30 text-titan-green text-sm font-bold touch-target flex items-center justify-center gap-2"
            >
              <Check size={15} />
              Mark Recovery Done → Week {currentDay === 7 ? currentWeek + 1 : currentWeek}, Day {currentDay === 7 ? 1 : currentDay + 1}
            </button>
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
            <Flame size={15} className="text-titan-accent mx-auto mb-1" />
            <p className="text-2xl font-black text-titan-text">{streak}</p>
            <p className="text-2xs text-titan-muted uppercase tracking-widest">Streak</p>
          </div>
          <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
            <Trophy size={15} className="text-titan-gold mx-auto mb-1" />
            <p className="text-2xl font-black text-titan-text">{workoutsThisWeek}</p>
            <p className="text-2xs text-titan-muted uppercase tracking-widest">This Week</p>
          </div>
          <div className="bg-titan-card rounded-2xl border border-titan-border p-3 text-center">
            <Zap size={15} className="text-titan-green mx-auto mb-1" />
            <p className="text-2xl font-black text-titan-text">
              {weeklyVolume > 0 ? `${Math.round(weeklyVolume / 1000)}k` : '—'}
            </p>
            <p className="text-2xs text-titan-muted uppercase tracking-widest">kg Vol</p>
          </div>
        </div>

        {/* Weekly Plan — fully interactive */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold tracking-widest uppercase text-titan-muted">
              Week {currentWeek} Schedule
            </h3>
            <Link href="/history" className="flex items-center gap-1 text-xs text-titan-muted touch-target">
              <History size={12} />
              History
            </Link>
          </div>

          <div className="space-y-2">
            {weekPlan?.days.map((day, i) => {
              const isToday = i === todayDayIndex
              const isPast = i < todayDayIndex
              const isFuture = i > todayDayIndex
              const isConfirming = confirmJump === i

              return (
                <div key={i}>
                  <button
                    onClick={() => handleDayTap(i)}
                    className={`w-full flex items-center gap-3 rounded-xl p-3 border transition-all touch-target text-left
                      ${isToday
                        ? 'bg-titan-accent/10 border-titan-accent/30'
                        : isPast
                        ? 'bg-titan-surface border-titan-border'
                        : 'bg-titan-card border-titan-border'
                      }`}
                  >
                    {/* Day indicator */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0
                      ${isToday
                        ? 'bg-titan-accent text-white'
                        : isPast
                        ? 'bg-titan-green/20 text-titan-green'
                        : 'bg-titan-surface text-titan-subtle'
                      }`}
                    >
                      {isPast
                        ? <CheckCircle size={17} />
                        : isToday
                        ? <Zap size={15} />
                        : <span className="text-2xs">{i + 1}</span>
                      }
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate
                        ${isToday ? 'text-titan-text' : isPast ? 'text-titan-muted' : 'text-titan-subtle'}`}
                      >
                        {WORKOUT_DAY_LABELS[day.dayType]}
                      </p>
                      {day.dayType !== 'recovery' && (
                        <p className="text-xs text-titan-muted truncate">{day.focus}</p>
                      )}
                    </div>

                    {/* Right action */}
                    {isToday && (
                      <button
                        onClick={e => { e.stopPropagation(); markCurrentDone() }}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-titan-green/10 border border-titan-green/30 flex items-center justify-center touch-target"
                        title="Mark done, advance to next day"
                      >
                        <Check size={14} className="text-titan-green" />
                      </button>
                    )}
                    {isPast && (
                      <span className="text-2xs text-titan-subtle flex-shrink-0">tap to jump</span>
                    )}
                    {isFuture && (
                      <Circle size={15} className="text-titan-border flex-shrink-0" />
                    )}
                  </button>

                  {/* Jump-forward confirmation */}
                  {isConfirming && (
                    <div className="mt-1 mx-1 bg-titan-gold/10 border border-titan-gold/30 rounded-xl p-3 flex items-center justify-between gap-3 animate-slide-up">
                      <p className="text-xs text-titan-gold font-medium">
                        Jump ahead to Day {i + 1}?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmJump(null)}
                          className="px-3 py-1.5 rounded-lg bg-titan-card border border-titan-border text-xs text-titan-muted touch-target"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => jumpToDay(i)}
                          className="px-3 py-1.5 rounded-lg bg-titan-gold text-titan-bg text-xs font-bold touch-target"
                        >
                          Jump
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-2xs text-titan-subtle mt-3 text-center">
            Tap any past day to jump back · Tap ✓ to mark done and advance
          </p>
        </div>

        {/* Phase parameters */}
        <div className="mb-8">
          <h3 className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-3">Phase Parameters</h3>
          <div className="bg-titan-card rounded-2xl border border-titan-border p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-titan-muted">Sets per muscle</span>
              <span className="text-sm font-bold text-titan-text">{phase.setsPerMuscle.min}–{phase.setsPerMuscle.max}</span>
            </div>
            <div className="h-px bg-titan-border" />
            <div className="flex justify-between">
              <span className="text-sm text-titan-muted">Rep range</span>
              <span className="text-sm font-bold text-titan-text">{phase.repRange.min}–{phase.repRange.max}</span>
            </div>
            <div className="h-px bg-titan-border" />
            <div className="flex justify-between">
              <span className="text-sm text-titan-muted">RIR target</span>
              <span className="text-sm font-bold text-titan-text">{phase.rirTarget.min}–{phase.rirTarget.max} RIR</span>
            </div>
            <div className="h-px bg-titan-border" />
            <p className="text-xs text-titan-muted leading-relaxed">{phase.intensityNotes}</p>
          </div>
        </div>

      </div>
    </AppShell>
  )
}
