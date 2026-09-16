import type {
  GeneratedWorkout, PlannedExercise, WorkoutQuality,
  WorkoutDay, TrainingPhase, PlannedSet,
} from './types'
import { getPhaseForWeek } from './program'

// ─── Workout blueprints per day type ──────────────────────────────────────

type DayBlueprint = {
  name: string
  exercises: Array<{
    id: string
    category: PlannedExercise['category']
    sets: number
    reps: string
    rest: number
    tempo?: string
    reason: string
  }>
  targetMuscles: string[]
  estimatedMinutes: number
}

const WORKOUT_BLUEPRINTS: Record<WorkoutDay, DayBlueprint[]> = {
  'chest-triceps-core': [
    {
      name: 'Chest, Triceps & Core — Session A',
      estimatedMinutes: 75,
      targetMuscles: ['upper-chest', 'chest', 'triceps', 'abs'],
      exercises: [
        { id: 'incline-bb-press',           category: 'primary',   sets: 4, reps: '6-10',  rest: 180, tempo: '3-1-1-0', reason: 'Primary upper chest compound. Heavy loading maximises mechanical tension.' },
        { id: 'incline-db-press',           category: 'primary',   sets: 3, reps: '10-12', rest: 120, tempo: '3-0-1-0', reason: 'Superior ROM vs barbell. Full stretch on every rep for upper chest stretch-mediated hypertrophy.' },
        { id: 'cable-fly-low',              category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '2-0-2-0', reason: 'Pure upper chest isolation with constant cable tension. Maximises upper pec stimulus to fatigue ratio.' },
        { id: 'pec-deck',                   category: 'isolation', sets: 3, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Pump and contraction focus. Peak contraction training for maximum muscle damage.' },
        { id: 'overhead-tricep-extension',  category: 'secondary', sets: 4, reps: '10-15', rest: 90,  tempo: '3-0-1-0', reason: 'Best tricep exercise by S:F ratio. Long head stretch-mediated hypertrophy.' },
        { id: 'tricep-pushdown',            category: 'isolation', sets: 3, reps: '12-15', rest: 60,  tempo: '2-0-1-0', reason: 'Lateral head pump. High rep finishing work for tricep density.' },
        { id: 'cable-crunch',               category: 'core',      sets: 4, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Weighted ab progression. Apply progressive overload to abs like any other muscle.' },
        { id: 'hanging-leg-raise-weighted', category: 'core',      sets: 3, reps: '12-15', rest: 60,  tempo: '2-0-2-0', reason: 'Full ab ROM from stretch to contraction. Builds rectus abdominis thickness.' },
      ],
    },
    {
      name: 'Chest, Triceps & Core — Session B',
      estimatedMinutes: 70,
      targetMuscles: ['chest', 'lower-chest', 'triceps', 'abs'],
      exercises: [
        { id: 'flat-db-press',             category: 'primary',   sets: 4, reps: '8-12',  rest: 150, tempo: '3-1-1-0', reason: 'Greater ROM than barbell. Full chest stretch on every rep.' },
        { id: 'incline-db-press',          category: 'primary',   sets: 3, reps: '10-12', rest: 120, tempo: '3-0-1-0', reason: 'Upper chest remains a priority target. Volume accumulation for upper pec.' },
        { id: 'cable-fly-high',            category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '2-0-2-0', reason: 'Lower chest isolation. Constant tension through complete adduction.' },
        { id: 'dip',                       category: 'secondary', sets: 3, reps: '8-12',  rest: 90,  tempo: '3-0-1-0', reason: 'Compound chest and tricep finisher. Forward lean biases chest.' },
        { id: 'skull-crusher',             category: 'primary',   sets: 4, reps: '8-12',  rest: 120, tempo: '3-0-1-0', reason: 'Heavy tricep compound with long head stretch. Builds arm mass.' },
        { id: 'overhead-tricep-extension', category: 'isolation', sets: 3, reps: '12-15', rest: 75,  tempo: '3-0-1-0', reason: 'Long head stretch. Maximum tricep hypertrophic stimulus.' },
        { id: 'cable-crunch',              category: 'core',      sets: 4, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Weighted ab overload. Core responds to progressive overload.' },
        { id: 'pallof-press',              category: 'core',      sets: 3, reps: '12-15', rest: 45,  tempo: '2-2-2-0', reason: 'Anti-rotation stability. Builds deep core musculature and functional strength.' },
      ],
    },
  ],

  'back-biceps': [
    {
      name: 'Back & Biceps',
      estimatedMinutes: 75,
      targetMuscles: ['lats', 'back', 'upper-back', 'biceps'],
      exercises: [
        { id: 'lat-pulldown',            category: 'primary',   sets: 4, reps: '6-10',  rest: 180, tempo: '3-1-1-0', reason: 'Vertical traction machine substitute for pull-ups. Allows precise loading and lat stretch.' },
        { id: 'vertical-traction-machine', category: 'secondary', sets: 3, reps: '8-12', rest: 90, tempo: '3-0-1-0', reason: 'Machine-based vertical traction for lat density with stable loading and controlled ROM.' },
        { id: 'cable-row',             category: 'primary',   sets: 4, reps: '8-12',  rest: 150, tempo: '3-1-1-0', reason: 'Back thickness. Mid and upper back density with constant cable tension.' },
        { id: 'straight-arm-pulldown', category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '3-0-1-0', reason: 'Pure lat isolation. Stretch-mediated with extremely high S:F ratio.' },
        { id: 'back-extension',        category: 'secondary', sets: 3, reps: '10-15', rest: 90,  tempo: '2-1-2-0', reason: 'Lower back strengthening and hypertrophy. Safe, spine-friendly posterior chain accessory.' },
        { id: 'chest-supported-row',   category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '3-0-1-0', reason: 'Upper back without lower back fatigue. Targets rhomboids and rear delts.' },
        { id: 'incline-db-curl',       category: 'primary',   sets: 4, reps: '10-12', rest: 90,  tempo: '3-0-1-0', reason: 'Best bicep exercise by stretch-mediated hypertrophy. Long head stretch produces maximum growth stimulus.' },
        { id: 'cable-curl-low',        category: 'secondary', sets: 3, reps: '12-15', rest: 75,  tempo: '2-0-2-0', reason: 'Constant cable tension with stretch at the loaded position. High stimulus to fatigue ratio.' },
        { id: 'hammer-curl',           category: 'isolation', sets: 3, reps: '12-15', rest: 60,  tempo: '2-0-1-0', reason: 'Brachialis and brachioradialis. Adds arm thickness and width to the peak.' },
      ],
    },
  ],

  'legs-core': [
    {
      name: 'Legs & Core',
      estimatedMinutes: 85,
      targetMuscles: ['quads', 'hamstrings', 'glutes', 'abs', 'core'],
      exercises: [
        { id: 'hack-squat',              category: 'primary',   sets: 4, reps: '8-12',  rest: 180, tempo: '3-1-1-0', reason: 'King of quad hypertrophy machines. Deep stretch, high quad bias, spine-safe.' },
        { id: 'bulgarian-split-squat',   category: 'primary',   sets: 3, reps: '10-12', rest: 150, tempo: '3-1-1-0', reason: 'Elite unilateral quad + glute builder. Massive ROM and excellent glute stretch at bottom.' },
        { id: 'leg-extension',           category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '2-1-3-0', reason: 'Quad isolation with peak contraction. Rectus femoris involvement in hip-flexed position.' },
        { id: 'leg-press',               category: 'primary',   sets: 4, reps: '8-12',  rest: 150, tempo: '2-1-2-0', reason: 'Heavy, loadable quad/glute builder on a machine — safe and highly effective for mass.' },
        { id: 'lying-leg-curl',          category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '2-1-3-0', reason: 'Hamstring isolation. Full range from stretch to peak contraction.' },
        { id: 'back-extension',          category: 'secondary', sets: 3, reps: '10-15', rest: 90,  tempo: '2-1-2-0', reason: 'Lower back strengthening as accessory work on leg day.' },
        { id: 'cable-crunch',            category: 'core',      sets: 4, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Weighted abs on leg day. Core recovery complements leg training.' },
        { id: 'weighted-sit-up',         category: 'core',      sets: 3, reps: '10-15', rest: 60,  tempo: '3-0-2-0', reason: 'Overloadable ab compound. Different movement pattern from crunches and leg raises.' },
        { id: 'hanging-leg-raise-weighted', category: 'core',   sets: 3, reps: '12-15', rest: 60,  tempo: '2-0-2-0', reason: 'Full ab ROM. Third weekly weighted core session as prescribed.' },
      ],
    },
  ],

  'shoulders-arms': [
    {
      name: 'Shoulders & Arms',
      estimatedMinutes: 80,
      targetMuscles: ['lateral-delts', 'shoulders', 'front-delts', 'biceps', 'triceps'],
      exercises: [
        { id: 'machine-shoulder-press',      category: 'primary',   sets: 4, reps: '8-12',  rest: 150, tempo: '3-1-1-0', reason: 'Shoulder compound to initiate the session while fresh. Sets weekly pressing baseline.' },
        { id: 'leaning-lateral-raise',        category: 'primary',   sets: 4, reps: '12-15', rest: 90,  tempo: '2-0-3-0', reason: 'Best lateral delt exercise. Maximum stretch via leaning position creates huge hypertrophic stimulus.' },
        { id: 'cable-lateral-raise',          category: 'secondary', sets: 3, reps: '15-20', rest: 60,  tempo: '2-0-3-0', reason: 'Constant tension lateral raise. High volume lateral delt work for capped shoulder width.' },
        { id: 'face-pull',                    category: 'secondary', sets: 4, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Rear delt and upper back health. Essential for shoulder balance and longevity.' },
        { id: 'skull-crusher',                category: 'primary',   sets: 4, reps: '8-12',  rest: 120, tempo: '3-0-1-0', reason: 'Heavy tricep strength. Long head stretch for maximum arm mass.' },
        { id: 'overhead-tricep-extension',    category: 'secondary', sets: 3, reps: '12-15', rest: 75,  tempo: '3-0-1-0', reason: 'Long head isolation. Stretch-mediated tricep hypertrophy.' },
        { id: 'incline-db-curl',              category: 'primary',   sets: 4, reps: '10-12', rest: 90,  tempo: '3-0-1-0', reason: 'Maximum bicep stretch. Best bicep exercise by hypertrophic stimulus.' },
        { id: 'ez-bar-curl',                  category: 'secondary', sets: 3, reps: '10-12', rest: 75,  tempo: '2-0-2-0', reason: 'Bilateral bicep overload. Wrist-friendly heavy loading for arm mass.' },
      ],
    },
  ],

  'chest-back-core': [
    {
      name: 'Chest + Back + Core',
      estimatedMinutes: 80,
      targetMuscles: ['upper-chest', 'lats', 'back', 'abs'],
      exercises: [
        { id: 'incline-db-press',        category: 'primary',   sets: 4, reps: '8-12',  rest: 150, tempo: '3-1-1-0', reason: 'Upper chest priority. The #1 physique goal receives maximum attention.' },
        { id: 'lat-pulldown',            category: 'primary',   sets: 4, reps: '10-12', rest: 120, tempo: '3-1-1-0', reason: 'Back width pairing with chest work. Opposing muscle groups allow faster recovery.' },
        { id: 'vertical-traction-machine', category: 'secondary', sets: 3, reps: '8-12', rest: 90, tempo: '3-0-1-0', reason: 'Supplemental vertical traction to complement pulldowns and add density.' },
        { id: 'cable-fly-low',           category: 'secondary', sets: 3, reps: '12-15', rest: 90,  tempo: '2-0-2-0', reason: 'Upper chest isolation. Low cable flies maximise upper pec stretch and contraction.' },
        { id: 'straight-arm-pulldown',   category: 'secondary', sets: 3, reps: '12-15', rest: 75,  tempo: '3-0-1-0', reason: 'Pure lat isolation to complement the compound pull. Highest S:F ratio back exercise.' },
        { id: 'incline-bb-press',        category: 'secondary', sets: 3, reps: '6-10',  rest: 150, tempo: '3-1-1-0', reason: 'Second heavy upper chest set. Barbell allows heavier loading for mechanical tension.' },
        { id: 'cable-row',               category: 'secondary', sets: 3, reps: '10-12', rest: 90,  tempo: '3-1-1-0', reason: 'Back thickness to complement lat work. Full back development in a single session.' },
        { id: 'cable-crunch',            category: 'core',      sets: 4, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Weekly weighted core volume. Abs are a muscle — they need progressive overload.' },
        { id: 'dragon-flag',             category: 'core',      sets: 3, reps: '8-12',  rest: 75,  tempo: '3-1-2-0', reason: 'Advanced bodyweight core finisher. Builds extreme core strength without equipment.' },
      ],
    },
  ],

  'cardio-core': [
    {
      name: 'Cardio & Core Conditioning',
      estimatedMinutes: 45,
      targetMuscles: ['abs', 'core', 'glutes', 'calves'],
      exercises: [
        { id: 'treadmill-run',           category: 'primary',   sets: 1, reps: '20-30 min', rest: 0,   tempo: '', reason: 'Interval treadmill work — primary conditioning block.' },
        { id: 'stair-climber',           category: 'primary',   sets: 1, reps: '10-20 min', rest: 0,   tempo: '', reason: 'Steady-state or interval stair climber for lower-body conditioning.' },
        { id: 'cable-crunch',            category: 'core',      sets: 4, reps: '12-20',     rest: 45,  tempo: '2-1-2-0', reason: 'Weighted ab progression — progressive overload for rectus abdominis.' },
        { id: 'hanging-leg-raise-weighted', category: 'core',    sets: 4, reps: '10-15',     rest: 45,  tempo: '2-0-2-0', reason: 'Weighted hanging leg raises for full-range core strength.' },
        { id: 'cable-woodchop',         category: 'core',      sets: 3, reps: '12-15',     rest: 45,  tempo: '2-1-2-0', reason: 'Anti-rotation and oblique biasing movement for love-handle reduction focus.' },
        { id: 'russian-twist-weighted', category: 'core',      sets: 3, reps: '16-24',     rest: 30,  tempo: '1-0-1-0', reason: 'Rotational core overload targeting obliques and love handles.' },
        { id: 'pallof-press',            category: 'core',      sets: 3, reps: '12-15',     rest: 30,  tempo: '2-2-2-0', reason: 'Anti-rotation core stability under fatigue.' },
        { id: 'dragon-flag',             category: 'core',      sets: 3, reps: '6-10',      rest: 60,  tempo: '3-1-2-0', reason: 'Advanced core control and strength finisher.' },
      ],
    },
  ],

  'weak-point': [
    {
      name: 'Upper Chest Specialisation',
      estimatedMinutes: 55,
      targetMuscles: ['upper-chest', 'chest'],
      exercises: [
        { id: 'incline-db-press',  category: 'primary',   sets: 5, reps: '10-12', rest: 120, tempo: '3-1-1-0', reason: 'Maximum upper chest volume specialisation. Extra frequency accelerates weak point development.' },
        { id: 'cable-fly-low',     category: 'primary',   sets: 4, reps: '12-15', rest: 90,  tempo: '2-0-2-0', reason: 'Isolation volume for upper chest. Constant tension for hypertrophy accumulation.' },
        { id: 'incline-bb-press',  category: 'secondary', sets: 3, reps: '6-10',  rest: 150, tempo: '3-1-1-0', reason: 'Heavy loading for upper chest mechanical tension.' },
        { id: 'pec-deck',          category: 'isolation', sets: 3, reps: '15-20', rest: 60,  tempo: '2-1-2-0', reason: 'Pump and peak contraction finisher. Drives blood and nutrients to the target muscle.' },
      ],
    },
    {
      name: 'Lateral Delt Specialisation',
      estimatedMinutes: 45,
      targetMuscles: ['lateral-delts', 'shoulders'],
      exercises: [
        { id: 'leaning-lateral-raise',  category: 'primary',   sets: 5, reps: '12-15', rest: 90, tempo: '2-0-3-0', reason: 'Maximum lateral delt stretch specialisation. Accelerates shoulder width development.' },
        { id: 'cable-lateral-raise',    category: 'primary',   sets: 4, reps: '15-20', rest: 60, tempo: '2-0-3-0', reason: 'Constant tension volume. High rep lateral delt work for 3D shoulder development.' },
        { id: 'db-lateral-raise',       category: 'secondary', sets: 3, reps: '15-20', rest: 60, tempo: '2-0-2-0', reason: 'Additional lateral volume to exceed MRV for rapid weak point improvement.' },
        { id: 'face-pull',              category: 'isolation', sets: 3, reps: '15-20', rest: 60, tempo: '2-0-2-0', reason: 'Rear delt balance within specialisation to maintain shoulder health.' },
      ],
    },
    {
      name: 'Arms Specialisation',
      estimatedMinutes: 55,
      targetMuscles: ['biceps', 'triceps'],
      exercises: [
        { id: 'incline-db-curl',            category: 'primary',   sets: 4, reps: '10-12', rest: 90,  tempo: '3-0-1-0', reason: 'Maximum bicep stretch specialisation. Extra frequency accelerates arm growth.' },
        { id: 'cable-curl-low',             category: 'primary',   sets: 3, reps: '12-15', rest: 75,  tempo: '2-0-2-0', reason: 'Stretch-loaded bicep volume. Constant tension through full ROM.' },
        { id: 'overhead-tricep-extension',  category: 'primary',   sets: 4, reps: '12-15', rest: 90,  tempo: '3-0-1-0', reason: 'Maximum tricep stretch specialisation. Long head bias for arm mass.' },
        { id: 'skull-crusher',              category: 'secondary', sets: 3, reps: '8-12',  rest: 120, tempo: '3-0-1-0', reason: 'Heavy tricep loading for arm strength and mass.' },
        { id: 'ez-bar-curl',                category: 'secondary', sets: 3, reps: '10-12', rest: 90,  tempo: '2-0-2-0', reason: 'Bilateral bicep overload. Additional arm volume for weak point attack.' },
        { id: 'tricep-pushdown',            category: 'isolation', sets: 3, reps: '15-20', rest: 60,  tempo: '2-0-1-0', reason: 'Pump finisher for triceps. Drive blood into the muscle post-strength work.' },
      ],
    },
    {
      name: 'Back Width Specialisation',
      estimatedMinutes: 55,
      targetMuscles: ['lats', 'back'],
      exercises: [
        { id: 'lat-pulldown',          category: 'primary',   sets: 5, reps: '6-10',  rest: 180, tempo: '3-1-1-0', reason: 'Vertical traction machine substitute for pull-ups. Extra frequency compounds lat development.' },
        { id: 'lat-pulldown',          category: 'primary',   sets: 4, reps: '10-12', rest: 90,  tempo: '3-1-1-0', reason: 'Volume accumulation for lat width. High S:F ratio lat exercise.' },
        { id: 'straight-arm-pulldown', category: 'secondary', sets: 4, reps: '12-15', rest: 75,  tempo: '3-0-1-0', reason: 'Pure lat isolation. Best stretch-mediated lat exercise available.' },
        { id: 'db-row',                category: 'secondary', sets: 3, reps: '10-12', rest: 90,  tempo: '3-0-1-0', reason: 'Unilateral lat loading. Full ROM and heavy loading for thickness and width.' },
      ],
    },
  ],

  'recovery': [
    {
      name: 'Active Recovery',
      estimatedMinutes: 30,
      targetMuscles: [],
      exercises: [],
    },
  ],
}

// ─── Generate a workout ────────────────────────────────────────────────────

export function generateWorkout(
  day: WorkoutDay,
  week: number = 1,
  phase: TrainingPhase = 'volume-accumulation',
  variant: number = 0,
): GeneratedWorkout {
  const phaseConfig = getPhaseForWeek(week)
  const blueprints = WORKOUT_BLUEPRINTS[day]
  const blueprint = blueprints[variant % blueprints.length]

  const exercises: PlannedExercise[] = blueprint.exercises.map((ex, i) => {
    const setConfig: PlannedSet = {
      reps: ex.reps,
      rir: phaseConfig.rirTarget.max,
      rest: ex.rest,
      tempo: ex.tempo,
    }

    // Scale sets based on phase volume modifier
    const weekPlan = { volumeModifier: 1.0 } // simplified
    const scaledSets = Math.max(2, Math.round(ex.sets * (phaseConfig.setsPerMuscle.max / 16)))

    return {
      exerciseId: ex.id,
      category: ex.category,
      sets: scaledSets,
      setConfig,
      reasonForInclusion: ex.reason,
      order: i,
    }
  })

  const quality = calculateWorkoutQuality(exercises, phaseConfig)

  return {
    id: `${day}-w${week}-${Date.now()}`,
    name: blueprint.name,
    day,
    phase,
    week,
    duration: blueprint.estimatedMinutes,
    exercises,
    quality,
    warmup: generateWarmup(day),
    notes: `Week ${week} — ${phaseConfig.name}. ${phaseConfig.intensityNotes}`,
    targetMuscles: blueprint.targetMuscles as any,
  }
}

function generateWarmup(day: WorkoutDay): string[] {
  const base = [
    '5 min cardio to raise core temperature',
    'Dynamic mobility — joint circles, leg swings, arm circles',
  ]
  const specific: Partial<Record<WorkoutDay, string[]>> = {
    'chest-triceps-core': [
      'Band pull-aparts x 15 (activate posterior chain)',
      'Light cable fly x 15 (prime chest)',
      '2 × warm-up sets on primary compound at 50%, 70%',
    ],
    'back-biceps': [
      'Cat-cow x 10 (spine mobility)',
      'Dead hang x 30s (lat activation and grip)',
      '2 × warm-up sets on pull-ups/pulldown at 50%, 70%',
    ],
    'legs-core': [
      'Leg swings forward and lateral x 10 each',
      'Bodyweight squats x 20',
      'Hip circles x 10',
      '2 × warm-up sets on primary leg exercise at 50%, 70%',
    ],
    'shoulders-arms': [
      'Shoulder circles x 20 each direction',
      'Band pull-aparts x 15',
      'Light lateral raise x 15 each side',
    ],
  }
  return [...base, ...(specific[day] || [])]
}

function calculateWorkoutQuality(
  exercises: PlannedExercise[],
  phaseConfig: ReturnType<typeof getPhaseForWeek>,
): WorkoutQuality {
  const totalSets = exercises.reduce((s, e) => s + e.sets, 0)
  const avgHypertrophy = 7.5
  const volume = Math.min(100, (totalSets / 28) * 100)
  const fatigue = Math.min(100, (totalSets / 35) * 100)
  const recoveryDemand = fatigue > 80 ? 5 : fatigue > 60 ? 4 : fatigue > 40 ? 3 : 2
  const hypertrophyRating = avgHypertrophy * 10
  const muscleCoverage = Math.min(100, exercises.length * 12)
  const overall = Math.round((volume * 0.3 + hypertrophyRating * 0.4 + muscleCoverage * 0.3))

  return { overall, volume, fatigue, recoveryDemand, hypertrophyRating, muscleCoverage }
}

export { WORKOUT_BLUEPRINTS }
