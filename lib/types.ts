// ─── Enums ─────────────────────────────────────────────────────────────────

export type MuscleGroup =
  | 'chest' | 'upper-chest' | 'lower-chest'
  | 'back' | 'lats' | 'upper-back' | 'rear-delts'
  | 'shoulders' | 'front-delts' | 'lateral-delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'abs' | 'obliques' | 'lower-back' | 'core'
  | 'brachialis' | 'hip-flexors'

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine'
  | 'bodyweight' | 'ez-bar' | 'kettlebell' | 'band'
  | 'smith-machine' | 'pull-up-bar'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type Tier = 'S' | 'A' | 'B'

export type WorkoutDay =
  | 'chest-triceps-core'
  | 'back-biceps'
  | 'legs-core'
  | 'shoulders-arms'
  | 'chest-back-core'
  | 'weak-point'
  | 'recovery'
  | 'cardio-core'

export type TrainingPhase =
  | 'volume-accumulation'
  | 'progressive-overload'
  | 'high-stimulus'
  | 'peak-growth'
  | 'deload'

// ─── Exercise ──────────────────────────────────────────────────────────────

export interface Exercise {
  id: string
  name: string
  target: MuscleGroup[]
  secondary: MuscleGroup[]
  equipment: Equipment[]
  difficulty: Difficulty
  tier: Tier
  hypertrophyRating: number   // 1-10
  stimulusToFatigue: number   // 1-10 (higher = better)
  description: string
  executionNotes: string[]
  alternatives: string[]      // exercise IDs
  tags: string[]
  videoKeyword?: string       // for searching demo videos
  videoUrl?: string           // optional direct video URL (YouTube embed)
}

// ─── Set / Log ─────────────────────────────────────────────────────────────

export interface SetLog {
  setNumber: number
  targetReps: number
  actualReps?: number
  weight?: number             // kg
  rir?: number
  rpe?: number
  completed: boolean
  timestamp?: number
}

export interface ExerciseLog {
  exerciseId: string
  sets: SetLog[]
  notes?: string
  substituteFor?: string      // original exercise ID if swapped
}

export interface WorkoutLog {
  id: string
  date: string                // ISO date
  workoutId: string
  phase: TrainingPhase
  week: number
  day: WorkoutDay
  exercises: ExerciseLog[]
  startTime: number
  endTime?: number
  notes?: string
  rating?: number             // 1-5 user rating
  totalVolume?: number        // kg × reps
}

// ─── Planned Exercise ──────────────────────────────────────────────────────

export interface PlannedSet {
  reps: string                // e.g. "8-12" or "6-10"
  rir: number
  rpe?: number
  rest: number                // seconds
  tempo?: string              // e.g. "3-1-2-0"
}

export interface PlannedExercise {
  exerciseId: string
  category: 'warmup' | 'primary' | 'secondary' | 'isolation' | 'finisher' | 'core'
  sets: number
  setConfig: PlannedSet
  reasonForInclusion: string
  progressionNotes?: string
  order: number
}

// ─── Workout ───────────────────────────────────────────────────────────────

export interface WorkoutQuality {
  overall: number             // 0-100
  volume: number
  fatigue: number             // lower = less fatigue
  recoveryDemand: number      // 1-5
  hypertrophyRating: number
  muscleCoverage: number
}

export interface GeneratedWorkout {
  id: string
  name: string
  day: WorkoutDay
  phase: TrainingPhase
  week: number
  duration: number            // estimated minutes
  exercises: PlannedExercise[]
  quality: WorkoutQuality
  warmup: string[]
  notes: string
  targetMuscles: MuscleGroup[]
}

// ─── Program ───────────────────────────────────────────────────────────────

export interface PhaseConfig {
  phase: TrainingPhase
  weeks: number[]             // e.g. [1,2,3,4]
  name: string
  description: string
  setsPerMuscle: { min: number; max: number }
  repRange: { min: number; max: number }
  rirTarget: { min: number; max: number }
  intensityNotes: string
}

export interface WeekPlan {
  week: number
  phase: TrainingPhase
  days: {
    dayNumber: number
    dayType: WorkoutDay
    focus: string
  }[]
  volumeModifier: number      // multiplier on base sets
  notes?: string
}

// ─── Progression ───────────────────────────────────────────────────────────

export interface ProgressionSuggestion {
  exerciseId: string
  type: 'weight-increase' | 'rep-increase' | 'set-increase' | 'deload' | 'maintain'
  amount?: number
  reason: string
  confidence: number          // 0-1
}

// ─── Active Workout State ──────────────────────────────────────────────────

export interface ActiveWorkout {
  workout: GeneratedWorkout
  log: WorkoutLog
  currentExerciseIndex: number
  currentSetIndex: number
  phase: 'warmup' | 'working' | 'rest' | 'complete'
  restSecondsRemaining: number
  startTime: number
}

// ─── AI Coach ──────────────────────────────────────────────────────────────

export interface CoachMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  context?: 'workout' | 'general' | 'exercise' | 'nutrition' | 'recovery'
}

export interface CoachContext {
  currentWorkout?: GeneratedWorkout
  currentExercise?: Exercise
  activeWorkout?: ActiveWorkout
  recentLogs?: WorkoutLog[]
  currentPhase?: TrainingPhase
  currentWeek?: number
}
