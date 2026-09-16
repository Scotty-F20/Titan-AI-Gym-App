'use client'

import { useState } from 'react'
import { ChevronRight, Lock, CheckCircle, Circle, Zap, Target, TrendingUp, Calendar } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PHASES, WEEK_PLANS, WORKOUT_DAY_LABELS, PHASE_LABELS } from '@/lib/program'
import type { TrainingPhase } from '@/lib/types'

const PHASE_COLORS: Record<TrainingPhase, { bg: string; text: string; border: string }> = {
  'volume-accumulation':  { bg: 'bg-blue-500/10',  text: 'text-blue-400',  border: 'border-blue-500/30' },
  'progressive-overload': { bg: 'bg-titan-gold/10', text: 'text-titan-gold', border: 'border-titan-gold/30' },
  'high-stimulus':        { bg: 'bg-titan-accent/10',text: 'text-titan-accent',border: 'border-titan-accent/30' },
  'peak-growth':          { bg: 'bg-red-500/10',    text: 'text-red-400',   border: 'border-red-500/30' },
  'deload':               { bg: 'bg-green-500/10',  text: 'text-green-400', border: 'border-green-500/30' },
}

const PHASE_ICONS: Record<TrainingPhase, string> = {
  'volume-accumulation':  '📈',
  'progressive-overload': '🏋️',
  'high-stimulus':        '⚡',
  'peak-growth':          '🔥',
  'deload':               '🛡️',
}

export default function ProgramPage() {
  const [currentWeek] = useLocalStorage<number>('titan:currentWeek', 1)
  const [programStartDate, setProgramStartDate] = useLocalStorage<string>('titan:programStart', '')
  const [expandedWeek, setExpandedWeek] = useState<number | null>(currentWeek)
  const [selectedPhase, setSelectedPhase] = useState<TrainingPhase | 'all'>('all')
  const [showSetupModal, setShowSetupModal] = useState(!programStartDate)

  function handleStartProgram() {
    const today = new Date().toISOString().split('T')[0]
    setProgramStartDate(today)
    setShowSetupModal(false)
  }

  const filteredWeeks = WEEK_PLANS.filter(w =>
    selectedPhase === 'all' || w.phase === selectedPhase
  )

  return (
    <AppShell>
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-2xl font-black text-titan-text mb-1">10-Week Hypertrophy Program</h1>
        <p className="text-sm text-titan-muted mb-6">
          An intense 10-week hypertrophy block: 5-day split, dedicated cardio+core day, and a weekly rest day.
        </p>

        {/* Start Program CTA */}
        {showSetupModal && (
          <div className="bg-titan-accent/10 border border-titan-accent/30 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-titan-accent" />
              <p className="text-sm font-bold text-titan-accent">Start Your Transformation</p>
            </div>
            <p className="text-sm text-titan-muted mb-4">
              Begin the 10-week hypertrophy program today. TITAN AI will track your progress and adjust your training automatically.
            </p>
            <button
              onClick={handleStartProgram}
              className="w-full py-3 rounded-xl bg-titan-accent text-white font-bold text-sm touch-target"
            >
              Start Program Today
            </button>
          </div>
        )}

        {programStartDate && (
          <div className="bg-titan-card rounded-2xl border border-titan-border p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted">Current Position</p>
                <p className="text-xl font-black text-titan-text">Week {currentWeek} of 10</p>
                <p className="text-sm text-titan-muted">
                  {PHASES.find(p => p.weeks.includes(currentWeek))?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xs text-titan-muted">Started</p>
                <p className="text-sm font-semibold text-titan-text">
                  {new Date(programStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: `${(currentWeek / 10) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-2xs text-titan-muted">Wk 1</span>
              <span className="text-2xs text-titan-muted">{Math.round((currentWeek / 10) * 100)}% complete</span>
              <span className="text-2xs text-titan-muted">Wk 10</span>
            </div>
          </div>
        )}

        {/* Phase Overview */}
        <div className="mb-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-3">Training Phases</h2>
          <div className="space-y-3">
            {PHASES.map(phase => {
              const colors = PHASE_COLORS[phase.phase]
              const isCurrentPhase = phase.weeks.includes(currentWeek)
              return (
                <button
                  key={phase.phase}
                  onClick={() => setSelectedPhase(selectedPhase === phase.phase ? 'all' : phase.phase)}
                  className={`w-full text-left rounded-2xl p-4 border transition-all touch-target
                    ${isCurrentPhase
                      ? `${colors.bg} ${colors.border}`
                      : selectedPhase === phase.phase
                      ? `${colors.bg} ${colors.border}`
                      : 'bg-titan-card border-titan-border hover:border-titan-subtle'
                    }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{PHASE_ICONS[phase.phase]}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold ${isCurrentPhase ? colors.text : 'text-titan-text'}`}>
                            {phase.name}
                          </p>
                          {isCurrentPhase && (
                            <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                              NOW
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-titan-muted">
                          Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-semibold text-titan-muted">{phase.setsPerMuscle.min}–{phase.setsPerMuscle.max}</p>
                      <p className="text-2xs text-titan-subtle">sets/muscle</p>
                    </div>
                  </div>
                  <p className="text-xs text-titan-muted mt-2 leading-relaxed">{phase.description}</p>

                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Target size={11} className="text-titan-muted" />
                      <span className="text-2xs text-titan-muted">Reps: {phase.repRange.min}–{phase.repRange.max}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={11} className="text-titan-muted" />
                      <span className="text-2xs text-titan-muted">RIR: {phase.rirTarget.min}–{phase.rirTarget.max}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Week-by-Week Schedule */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-titan-muted">
              Week-by-Week Schedule
            </h2>
            {selectedPhase !== 'all' && (
              <button
                onClick={() => setSelectedPhase('all')}
                className="text-2xs text-titan-accent touch-target"
              >
                Show all
              </button>
            )}
          </div>
          <div className="space-y-2">
            {filteredWeeks.map(week => {
              const colors = PHASE_COLORS[week.phase]
              const isCurrentWeek = week.week === currentWeek
              const isPastWeek = week.week < currentWeek
              const isFuture = week.week > currentWeek

              return (
                <div key={week.week} className={`rounded-2xl border overflow-hidden transition-all
                  ${isCurrentWeek
                    ? `${colors.bg} ${colors.border}`
                    : 'bg-titan-card border-titan-border'
                  }`}
                >
                  <button
                    className="w-full flex items-center gap-3 p-4 text-left touch-target"
                    onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${isCurrentWeek ? 'bg-titan-accent text-white' :
                        isPastWeek ? 'bg-titan-green/20 text-titan-green' :
                        'bg-titan-surface text-titan-muted'
                      }`}
                    >
                      {isPastWeek ? (
                        <CheckCircle size={18} />
                      ) : isFuture ? (
                        <span className="text-xs font-black">{week.week}</span>
                      ) : (
                        <Zap size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${isCurrentWeek ? 'text-titan-text' : isPastWeek ? 'text-titan-muted' : 'text-titan-text'}`}>
                          Week {week.week}
                        </p>
                        {isCurrentWeek && (
                          <span className={`text-2xs font-black px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-titan-muted">{PHASES.find(p => p.phase === week.phase)?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isFuture && <Lock size={12} className="text-titan-subtle" />}
                      {expandedWeek === week.week ? (
                        <ChevronRight size={14} className="text-titan-subtle rotate-90" />
                      ) : (
                        <ChevronRight size={14} className="text-titan-subtle" />
                      )}
                    </div>
                  </button>

                  {expandedWeek === week.week && (
                    <div className="px-4 pb-4 space-y-2 border-t border-titan-border/50 pt-3">
                      {week.notes && (
                        <p className="text-xs text-titan-muted italic mb-3 leading-relaxed">{week.notes}</p>
                      )}
                      {week.days.map((day, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-2xs font-bold flex-shrink-0
                            ${day.dayType === 'recovery' ? 'bg-titan-surface text-titan-subtle' : 'bg-titan-accent/20 text-titan-accent'}`}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-titan-text truncate">
                              {WORKOUT_DAY_LABELS[day.dayType]}
                            </p>
                            {day.dayType !== 'recovery' && (
                              <p className="text-2xs text-titan-muted truncate">{day.focus}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
