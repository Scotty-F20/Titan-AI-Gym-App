'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Clock, Flame, ChevronRight, ChevronDown, ChevronUp, Info, Play, RotateCcw } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import ScoreRing from '@/components/ui/ScoreRing'
import TierBadge from '@/components/ui/TierBadge'
import { generateWorkout } from '@/lib/workouts'
import { getExerciseById } from '@/lib/exercises'
import { WORKOUT_DAY_LABELS, WORKOUT_DAY_SHORT } from '@/lib/program'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { WorkoutDay, GeneratedWorkout } from '@/lib/types'

const DAY_OPTIONS: { id: WorkoutDay; label: string; short: string; emoji: string }[] = [
  { id: 'chest-triceps-core', label: 'Chest + Triceps + Core', short: 'Chest',     emoji: '💪' },
  { id: 'back-biceps',        label: 'Back + Biceps',          short: 'Back',      emoji: '🦅' },
  { id: 'legs-core',          label: 'Legs + Core',            short: 'Legs',      emoji: '🦵' },
  { id: 'shoulders-arms',     label: 'Shoulders + Arms',       short: 'Shoulders', emoji: '🏋️' },
  { id: 'chest-back-core',    label: 'Chest + Back + Core',    short: 'Push/Pull', emoji: '⚡' },
  { id: 'weak-point',         label: 'Weak Point',             short: 'Specialist',emoji: '🎯' },
]

const WEAK_POINT_OPTIONS = [
  { id: 0, label: 'Upper Chest' },
  { id: 1, label: 'Lateral Delts' },
  { id: 2, label: 'Arms' },
  { id: 3, label: 'Back Width' },
]

const CATEGORY_LABELS = {
  warmup:    'Warm-Up',
  primary:   'Primary Compound',
  secondary: 'Secondary Compound',
  isolation: 'Isolation',
  finisher:  'Finisher',
  core:      'Core',
}

function ExerciseCard({ planned, index }: { planned: GeneratedWorkout['exercises'][0], index: number }) {
  const exercise = getExerciseById(planned.exerciseId)
  const [expanded, setExpanded] = useState(false)
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem('titan:exerciseMedia')
      if (raw) setMediaMap(JSON.parse(raw))
    } catch (e) {
      // ignore
    }
  }, [])

  function saveMedia(url?: string) {
    try {
        if (!exercise || !exercise.id) {
          console.warn('No exercise selected for custom demo')
          return
        }
        const map = { ...mediaMap }
        if (url) map[exercise.id] = url
        else delete map[exercise.id]
        localStorage.setItem('titan:exerciseMedia', JSON.stringify(map))
        setMediaMap(map)
    } catch (e) {
      // ignore
    }
  }

  function handleSetCustomDemo() {
    const current = mediaMap[exercise.id] ?? exercise.videoUrl ?? ''
    const url = window.prompt('Paste YouTube video URL for this exercise (leave empty to remove):', current)
    if (url === null) return
    const trimmed = url.trim()
    if (trimmed === '') saveMedia(undefined)
    else saveMedia(trimmed)
  }

  function toEmbedUrl(url: string) {
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.slice(1)
        return `https://www.youtube.com/embed/${id}`
      }
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v')
        if (v) return `https://www.youtube.com/embed/${v}`
        if (u.pathname.includes('/embed/')) return url
      }
    } catch (e) {
      return ''
    }
    return ''
  }

  if (!exercise) return null

  return (
    <div className="bg-titan-card rounded-2xl border border-titan-border overflow-hidden">
      <button
        className="w-full p-4 text-left touch-target"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-titan-surface flex items-center justify-center text-xs font-bold text-titan-muted flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <TierBadge tier={exercise.tier} />
              <span className="text-2xs font-bold tracking-widest uppercase text-titan-muted">
                {CATEGORY_LABELS[planned.category]}
              </span>
            </div>
            <p className="font-bold text-titan-text text-base leading-tight">{exercise.name}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm text-titan-accent font-semibold">{planned.sets} sets</span>
              <span className="text-sm text-titan-muted">{planned.setConfig.reps} reps</span>
              <span className="text-sm text-titan-muted">{planned.setConfig.rir} RIR</span>
              <span className="text-sm text-titan-muted">{planned.setConfig.rest}s rest</span>
            </div>
          </div>
          {expanded ? (
            <ChevronUp size={16} className="text-titan-subtle flex-shrink-0" />
          ) : (
            <ChevronDown size={16} className="text-titan-subtle flex-shrink-0" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-titan-border pt-3">
          <div className="bg-titan-surface rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Info size={12} className="text-titan-accent" />
              <span className="text-2xs font-bold tracking-widest uppercase text-titan-accent">Why This Exercise</span>
            </div>
            <p className="text-xs text-titan-muted leading-relaxed">{planned.reasonForInclusion}</p>
          </div>

          {exercise.executionNotes.length > 0 && (
            <div>
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Execution Notes</p>
              <ul className="space-y-1.5">
                {exercise.executionNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-titan-accent flex-shrink-0 mt-1.5" />
                    <span className="text-xs text-titan-muted leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Media / Demo */}
          <div>
            <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Demo</p>
            {(() => {
              const custom = mediaMap[exercise.id]
              const url = custom ?? exercise.videoUrl
              const embed = url ? toEmbedUrl(url) : ''
              return (
                <>
                  {embed ? (
                    <div className="mb-2">
                      <div className="aspect-video rounded-xl overflow-hidden border border-titan-border">
                        <iframe src={embed} title={`${exercise.name} demo`} frameBorder={0} allowFullScreen className="w-full h-full" />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    {exercise.videoKeyword && !embed && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.videoKeyword)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-titan-accent/10 border border-titan-accent/30 text-sm text-titan-accent font-semibold text-center"
                      >
                        <span className="inline-flex items-center gap-2 justify-center"><Play size={14} /> Open Demo (YouTube)</span>
                      </a>
                    )}

                    <button
                      onClick={handleSetCustomDemo}
                      className="flex-none py-2 px-3 rounded-xl bg-titan-card border border-titan-border text-sm text-titan-muted font-semibold"
                    >
                      Set Custom Demo
                    </button>

                    <a
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(exercise.videoKeyword ?? exercise.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-none py-2 px-3 rounded-xl bg-titan-card border border-titan-border text-sm text-titan-muted font-semibold"
                    >
                      View Images
                    </a>
                  </div>
                </>
              )
            })()}
          </div>

          {planned.setConfig.tempo && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-titan-muted">Tempo:</span>
              <code className="text-xs font-mono text-titan-text bg-titan-surface px-2 py-0.5 rounded">
                {planned.setConfig.tempo}
              </code>
              <span className="text-xs text-titan-muted">(Ecc–Pause–Con–Top)</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text">{exercise.hypertrophyRating}/10</p>
              <p className="text-2xs text-titan-muted">Hypertrophy</p>
            </div>
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text">{exercise.stimulusToFatigue}/10</p>
              <p className="text-2xs text-titan-muted">S:F Ratio</p>
            </div>
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text capitalize">{exercise.difficulty}</p>
              <p className="text-2xs text-titan-muted">Difficulty</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function WorkoutGeneratorPage() {
  const router = useRouter()
  const [selectedDay, setSelectedDay] = useState<WorkoutDay>('chest-triceps-core')
  const [weakPointVariant, setWeakPointVariant] = useState(0)
  const [currentWeek] = useLocalStorage<number>('titan:currentWeek', 1)
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null)
  const [generating, setGenerating] = useState(false)
  const [, setActiveWorkout] = useLocalStorage<GeneratedWorkout | null>('titan:activeWorkout', null)

  function handleGenerate() {
    setGenerating(true)
    setTimeout(() => {
      const variant = selectedDay === 'weak-point' ? weakPointVariant : 0
      const workout = generateWorkout(selectedDay, currentWeek, 'volume-accumulation', variant)
      setGeneratedWorkout(workout)
      setGenerating(false)
    }, 400)
  }

  function handleStartWorkout() {
    if (!generatedWorkout) return
    setActiveWorkout(generatedWorkout)
    router.push('/live')
  }

  return (
    <AppShell>
      <div className="px-4 pt-8 pb-6">
        <h1 className="text-2xl font-black text-titan-text mb-1">Generate Workout</h1>
        <p className="text-sm text-titan-muted mb-6">Select your training day and generate your optimal session.</p>

        {/* Day selector */}
        <div className="space-y-2 mb-6">
          {DAY_OPTIONS.map(day => (
            <button
              key={day.id}
              onClick={() => { setSelectedDay(day.id); setGeneratedWorkout(null) }}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all touch-target
                ${selectedDay === day.id
                  ? 'bg-titan-accent/10 border-titan-accent/50'
                  : 'bg-titan-card border-titan-border hover:border-titan-subtle'
                }`}
            >
              <span className="text-xl flex-shrink-0">{day.emoji}</span>
              <div className="flex-1 text-left">
                <p className={`font-bold text-sm ${selectedDay === day.id ? 'text-titan-text' : 'text-titan-muted'}`}>
                  {day.label}
                </p>
              </div>
              {selectedDay === day.id && (
                <div className="w-2 h-2 rounded-full bg-titan-accent flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Weak point variant selector */}
        {selectedDay === 'weak-point' && (
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase text-titan-muted mb-3">Specialisation Focus</p>
            <div className="grid grid-cols-2 gap-2">
              {WEAK_POINT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setWeakPointVariant(opt.id)}
                  className={`p-3 rounded-xl border text-sm font-semibold transition-all touch-target
                    ${weakPointVariant === opt.id
                      ? 'bg-titan-accent/10 border-titan-accent/50 text-titan-text'
                      : 'bg-titan-card border-titan-border text-titan-muted'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-4 rounded-2xl bg-gradient-titan text-white font-black text-base tracking-wide mb-8 disabled:opacity-50 transition-all active:scale-95 touch-target shadow-titan"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap size={18} />
              Generate Workout
            </span>
          )}
        </button>

        {/* Generated Workout */}
        {generatedWorkout && (
          <div className="animate-fade-in">
            {/* Workout Header */}
            <div className="bg-gradient-card rounded-2xl border border-titan-border p-4 mb-4">
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-accent mb-1">Generated</p>
              <h2 className="text-xl font-black text-titan-text mb-2">{generatedWorkout.name}</h2>

              {/* Quality scores */}
              <div className="flex items-center gap-4 justify-around py-3">
                <ScoreRing score={generatedWorkout.quality.overall}     label="Overall"    size={60} />
                <ScoreRing score={Math.round(generatedWorkout.quality.volume)} label="Volume" size={60} />
                <ScoreRing score={Math.round(generatedWorkout.quality.hypertrophyRating)} label="Hypertrophy" size={60} />
                <ScoreRing score={Math.round(generatedWorkout.quality.muscleCoverage)} label="Coverage" size={60} />
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-titan-border">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-titan-muted" />
                  <span className="text-xs text-titan-muted">~{generatedWorkout.duration} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame size={13} className="text-titan-accent" />
                  <span className="text-xs text-titan-muted">{generatedWorkout.exercises.length} exercises</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-titan-muted">
                    Recovery demand: {generatedWorkout.quality.recoveryDemand}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Warm-up */}
            <div className="bg-titan-card rounded-2xl border border-titan-border p-4 mb-4">
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-3">Warm-Up Protocol</p>
              <ul className="space-y-2">
                {generatedWorkout.warmup.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-titan-surface flex items-center justify-center text-2xs font-bold text-titan-muted flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm text-titan-muted leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exercise list */}
            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold tracking-widest uppercase text-titan-muted">Exercises</p>
              {generatedWorkout.exercises.map((ex, i) => (
                <ExerciseCard key={ex.exerciseId} planned={ex} index={i} />
              ))}
            </div>

            {/* Notes */}
            {generatedWorkout.notes && (
              <div className="bg-titan-card rounded-2xl border border-titan-border p-4 mb-6">
                <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Coach Notes</p>
                <p className="text-sm text-titan-muted leading-relaxed">{generatedWorkout.notes}</p>
              </div>
            )}

            {/* Start / Regenerate buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleGenerate}
                className="flex-none w-14 h-14 rounded-2xl bg-titan-card border border-titan-border flex items-center justify-center touch-target hover:border-titan-subtle transition-colors"
              >
                <RotateCcw size={18} className="text-titan-muted" />
              </button>
              <button
                onClick={handleStartWorkout}
                className="flex-1 py-4 rounded-2xl bg-gradient-titan text-white font-black text-base tracking-wide shadow-titan transition-all active:scale-95 touch-target flex items-center justify-center gap-2"
              >
                <Play size={18} fill="white" />
                Start Workout
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
