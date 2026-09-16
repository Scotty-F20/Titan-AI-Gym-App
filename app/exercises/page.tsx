'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ChevronDown, ChevronUp, Zap, Target } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import TierBadge from '@/components/ui/TierBadge'
import RatingBar from '@/components/ui/RatingBar'
import { EXERCISES, MUSCLE_GROUPS } from '@/lib/exercises'
import type { Exercise, Tier } from '@/lib/types'

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-titan-card rounded-2xl border border-titan-border overflow-hidden">
      <button
        className="w-full p-4 text-left touch-target"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <TierBadge tier={exercise.tier} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-titan-text text-sm leading-tight mb-1">{exercise.name}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              {exercise.target.slice(0, 2).map(m => (
                <span key={m} className="text-2xs bg-titan-accent/10 text-titan-accent px-2 py-0.5 rounded-full font-medium capitalize">
                  {m.replace('-', ' ')}
                </span>
              ))}
              {exercise.equipment.slice(0, 1).map(e => (
                <span key={e} className="text-2xs bg-titan-surface text-titan-muted px-2 py-0.5 rounded-full capitalize">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-titan-accent" />
              <span className="text-xs font-bold text-titan-text">{exercise.stimulusToFatigue}/10</span>
            </div>
            {expanded ? (
              <ChevronUp size={14} className="text-titan-subtle" />
            ) : (
              <ChevronDown size={14} className="text-titan-subtle" />
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-titan-border space-y-4">
          <p className="text-xs text-titan-muted leading-relaxed pt-3">{exercise.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <RatingBar value={exercise.hypertrophyRating} max={10} label="Hypertrophy Rating" />
            <RatingBar value={exercise.stimulusToFatigue} max={10} label="Stimulus:Fatigue" />
          </div>

          {exercise.executionNotes.length > 0 && (
            <div>
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Key Execution Points</p>
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

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text capitalize">{exercise.difficulty}</p>
              <p className="text-2xs text-titan-muted mt-0.5">Level</p>
            </div>
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text">{exercise.tier} Tier</p>
              <p className="text-2xs text-titan-muted mt-0.5">Rating</p>
            </div>
            <div className="bg-titan-surface rounded-xl p-2 text-center">
              <p className="text-xs font-bold text-titan-text capitalize">{exercise.equipment[0]}</p>
              <p className="text-2xs text-titan-muted mt-0.5">Equipment</p>
            </div>
          </div>

          {exercise.tags.includes('stretch-mediated') && (
            <div className="flex items-center gap-2 bg-titan-accent/10 rounded-xl p-3">
              <Target size={14} className="text-titan-accent flex-shrink-0" />
              <p className="text-xs text-titan-accent font-medium">
                Stretch-mediated hypertrophy — trains the muscle in a lengthened position for maximum growth stimulus.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const TIER_FILTERS: { tier: Tier | 'all'; label: string }[] = [
  { tier: 'all', label: 'All' },
  { tier: 'S',   label: 'S Tier' },
  { tier: 'A',   label: 'A Tier' },
  { tier: 'B',   label: 'B Tier' },
]

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all')
  const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      const matchesSearch =
        search === '' ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.target.some(m => m.includes(search.toLowerCase())) ||
        ex.tags.some(t => t.includes(search.toLowerCase()))

      const matchesMuscle =
        selectedMuscle === 'all' ||
        ex.target.some(m => m === selectedMuscle) ||
        ex.secondary.some(m => m === selectedMuscle)

      const matchesTier = selectedTier === 'all' || ex.tier === selectedTier

      return matchesSearch && matchesMuscle && matchesTier
    }).sort((a, b) => {
      const tierOrder = { S: 0, A: 1, B: 2 }
      return tierOrder[a.tier] - tierOrder[b.tier] || b.stimulusToFatigue - a.stimulusToFatigue
    })
  }, [search, selectedMuscle, selectedTier])

  return (
    <AppShell>
      <div className="px-4 pt-8">
        <h1 className="text-2xl font-black text-titan-text mb-1">Exercise Database</h1>
        <p className="text-sm text-titan-muted mb-5">
          {EXERCISES.length} evidence-based exercises, ranked by hypertrophy effectiveness.
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-titan-muted" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-titan-card border border-titan-border rounded-2xl pl-10 pr-4 py-3 text-sm text-titan-text placeholder:text-titan-muted focus:outline-none focus:border-titan-accent transition-colors"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs font-bold text-titan-muted mb-3 touch-target"
        >
          <Filter size={13} />
          Filters
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showFilters && (
          <div className="space-y-3 mb-5 animate-slide-up">
            {/* Tier filter */}
            <div>
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Tier</p>
              <div className="flex gap-2">
                {TIER_FILTERS.map(f => (
                  <button
                    key={f.tier}
                    onClick={() => setSelectedTier(f.tier)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all touch-target
                      ${selectedTier === f.tier
                        ? f.tier === 'S' ? 'tier-s text-white border-transparent' :
                          f.tier === 'A' ? 'tier-a text-white border-transparent' :
                          f.tier === 'B' ? 'tier-b text-white border-transparent' :
                          'bg-titan-accent/10 border-titan-accent/50 text-titan-accent'
                        : 'bg-titan-card border-titan-border text-titan-muted'
                      }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Muscle filter */}
            <div>
              <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Muscle Group</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedMuscle('all')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all touch-target
                    ${selectedMuscle === 'all'
                      ? 'bg-titan-accent/10 border-titan-accent/50 text-titan-accent'
                      : 'bg-titan-card border-titan-border text-titan-muted'
                    }`}
                >
                  All
                </button>
                {MUSCLE_GROUPS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMuscle(m.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all touch-target
                      ${selectedMuscle === m.id
                        ? 'bg-titan-accent/10 border-titan-accent/50 text-titan-accent'
                        : 'bg-titan-card border-titan-border text-titan-muted'
                      }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tier legend */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xs text-titan-muted">Tier key:</span>
          <div className="flex items-center gap-1.5">
            <TierBadge tier="S" />
            <span className="text-2xs text-titan-muted">Best S:F ratio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TierBadge tier="A" />
            <span className="text-2xs text-titan-muted">Excellent</span>
          </div>
        </div>

        {/* Results count */}
        <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-3">
          {filtered.length} exercise{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Exercise List */}
        <div className="space-y-3 pb-6">
          {filtered.length > 0 ? (
            filtered.map(ex => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-titan-muted text-sm">No exercises match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
