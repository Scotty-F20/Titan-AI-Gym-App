import type { PhaseConfig, WeekPlan, TrainingPhase, WorkoutDay } from './types'

export const PHASES: PhaseConfig[] = [
  {
    phase: 'volume-accumulation',
    weeks: [1, 2, 3],
    name: 'Volume Accumulation',
    description: 'Build work capacity. Moderate intensity, progressively increasing volume. Prime the body for growth.',
    setsPerMuscle: { min: 12, max: 18 },
    repRange: { min: 10, max: 15 },
    rirTarget: { min: 2, max: 4 },
    intensityNotes: 'Focus on technique, mind-muscle connection, and establishing baseline performance.',
  },
  {
    phase: 'progressive-overload',
    weeks: [4, 5, 6],
    name: 'Progressive Overload',
    description: 'Systematically increase load and volume. Push harder each session. Track all lifts.',
    setsPerMuscle: { min: 12, max: 18 },
    repRange: { min: 8, max: 12 },
    rirTarget: { min: 1, max: 3 },
    intensityNotes: 'Aim to beat last week\'s performance on every compound lift. Log everything.',
  },
  {
    phase: 'high-stimulus',
    weeks: [7, 8, 9],
    name: 'High Stimulus Hypertrophy',
    description: 'Maximum hypertrophic stimulus. High volume, intensity techniques, push close to failure.',
    setsPerMuscle: { min: 14, max: 22 },
    repRange: { min: 6, max: 15 },
    rirTarget: { min: 0, max: 2 },
    intensityNotes: 'Use drop sets, rest-pause, and mechanical drop sets. This phase is designed to push limits.',
  },
  {
    phase: 'deload',
    weeks: [10],
    name: 'Deload & Assessment',
    description: 'Full recovery week. Drop volume 50%, maintain intensity. Assess progress, celebrate gains.',
    setsPerMuscle: { min: 6, max: 10 },
    repRange: { min: 10, max: 15 },
    rirTarget: { min: 3, max: 5 },
    intensityNotes: 'Active recovery. Perform all movements but leave 4-5 RIR. Massage, stretch, sleep.',
  },
]

export const WEEK_PLANS: WeekPlan[] = [
  // Week 1–3: Volume Accumulation
  { week: 1, phase: 'volume-accumulation', volumeModifier: 1.0, notes: 'Intense base week. Learn movements while pushing near-capacity.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Chest volume + tricep strength' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Back width + bicep stretch' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Quad & hamstring foundation' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Lateral delts + arm isolation' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'Upper chest + lat width' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Conditioning: treadmill, stair climber + intense core' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest and mobility' },
    ],
  },
  { week: 2, phase: 'volume-accumulation', volumeModifier: 1.0, notes: 'Increase volume and focus on technique.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Incline press priority + tricep lengthening' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Row and pull focus' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Hack squat + glute emphasis' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Leaning lateral + arm volume' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'Push/pull pairing for density' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Conditioning + core stability' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  { week: 3, phase: 'volume-accumulation', volumeModifier: 1.05, notes: 'Base volume week. Build work capacity.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Full chest volume' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Vertical traction + rows' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Unilateral strength + quad volume' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Shoulder press + lateral focus' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'Upper chest + lat priority' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Longer conditioning session + core' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  // Weeks 4–6: Progressive Overload
  { week: 4, phase: 'progressive-overload', volumeModifier: 1.05, notes: 'Start increasing loads. Track all lifts.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Heavy incline press + tricep overload' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Back strength + heavy rows' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Hack squat + heavy unilateral work' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Press strength + arm density' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'Compound pairings for load' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Interval conditioning + core intensity' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  { week: 5, phase: 'progressive-overload', volumeModifier: 1.1, notes: 'Increase intensity and aim to beat previous numbers.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Heavy sets with lower rep ranges' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Vertical traction + heavy rows' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Leg overload + leg-press intensity' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Lateral overload + arm heavy sets' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'High load compound pairing' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Short intervals + core circuit' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  { week: 6, phase: 'progressive-overload', volumeModifier: 1.15, notes: 'Peak overload week for phase 2.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Max strength sets and heavy volume' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Max back load + bicep stretch' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Heavy quad and glute emphasis' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Shoulder peak + arm density' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'High-load compound day' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Conditioning under fatigue + core' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  // Weeks 7–9: High Stimulus
  { week: 7, phase: 'high-stimulus', volumeModifier: 1.2, notes: 'Begin intensity techniques. Push close to failure on key sets.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Intensity techniques on chest finishers' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Rest-pause and drop set strategies' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'High stimulus leg session' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Mechanical drop sets and supersets for arms' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'High density chest + back pairing' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Conditioning + intense core circuit' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  { week: 8, phase: 'high-stimulus', volumeModifier: 1.25, notes: 'Peak volume with heavy use of intensity techniques.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Giant sets and drop sets for chest' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Myo-reps and rest-pause for biceps' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Leg extension rest-pause + heavy squats' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'High density arm protocols' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'High density compound day' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Interval overload + core finishers' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  { week: 9, phase: 'high-stimulus', volumeModifier: 1.2, notes: 'Maintain high stimulus before deload week.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Chest overload protocol' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Back width + bicep stretch blast' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Quad + hamstring superset' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Shoulder + tricep blast' },
      { dayNumber: 5, dayType: 'chest-back-core',      focus: 'Upper chest + straight arm combo' },
      { dayNumber: 6, dayType: 'cardio-core',          focus: 'Conditioning + core peak session' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Rest' },
    ],
  },
  // Week 10: Deload
  { week: 10, phase: 'deload', volumeModifier: 0.5, notes: 'Deload and assessment week. Recover and measure progress.',
    days: [
      { dayNumber: 1, dayType: 'chest-triceps-core',  focus: 'Light chest maintenance' },
      { dayNumber: 2, dayType: 'back-biceps',          focus: 'Light back maintenance' },
      { dayNumber: 3, dayType: 'legs-core',            focus: 'Light leg mobility and activation' },
      { dayNumber: 4, dayType: 'shoulders-arms',       focus: 'Light shoulder + arm maintenance' },
      { dayNumber: 5, dayType: 'recovery',             focus: 'Active recovery — walk, stretch' },
      { dayNumber: 6, dayType: 'recovery',             focus: 'Progress assessment + mobility' },
      { dayNumber: 7, dayType: 'recovery',             focus: 'Complete rest — 10 weeks completed' },
    ],
  },
]

export function getPhaseForWeek(week: number): PhaseConfig {
  return PHASES.find(p => p.weeks.includes(week)) || PHASES[0]
}

export function getWeekPlan(week: number): WeekPlan | undefined {
  return WEEK_PLANS.find(w => w.week === week)
}

export function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.min(Math.max(diffWeeks, 1), 10)
}

export const WORKOUT_DAY_LABELS: Record<WorkoutDay, string> = {
  'chest-triceps-core': 'Chest + Triceps + Core',
  'back-biceps':        'Back + Biceps',
  'legs-core':          'Legs + Core',
  'shoulders-arms':     'Shoulders + Arms',
  'chest-back-core':    'Chest + Back + Core',
  'weak-point':         'Weak Point Specialisation',
  'recovery':           'Recovery',
  'cardio-core':        'Cardio + Core Conditioning',
}

export const WORKOUT_DAY_SHORT: Record<WorkoutDay, string> = {
  'chest-triceps-core': 'Chest',
  'back-biceps':        'Back',
  'legs-core':          'Legs',
  'shoulders-arms':     'Shoulders',
  'chest-back-core':    'Push/Pull',
  'weak-point':         'Specialist',
  'recovery':           'Rest',
  'cardio-core':        'Cardio',
}

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  'volume-accumulation':  'Phase 1 – Volume Accumulation',
  'progressive-overload': 'Phase 2 – Progressive Overload',
  'high-stimulus':        'Phase 3 – High Stimulus',
  'deload':               'Deload & Assessment',
}
