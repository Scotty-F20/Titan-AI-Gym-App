import type { WorkoutLog, ProgressionSuggestion, SetLog } from './types'

export function getProgressionSuggestions(
  exerciseId: string,
  logs: WorkoutLog[],
): ProgressionSuggestion[] {
  const exerciseLogs = logs
    .flatMap(log => log.exercises)
    .filter(e => e.exerciseId === exerciseId)
    .slice(-4)

  if (exerciseLogs.length < 2) return []

  const suggestions: ProgressionSuggestion[] = []
  const latestLog = exerciseLogs[exerciseLogs.length - 1]
  const prevLog = exerciseLogs[exerciseLogs.length - 2]

  const latestSets = latestLog.sets.filter(s => s.completed)
  const prevSets = prevLog.sets.filter(s => s.completed)

  if (latestSets.length === 0) return []

  const latestAvgRIR = average(latestSets.map(s => s.rir ?? 2))
  const latestAvgReps = average(latestSets.map(s => s.actualReps ?? 0))
  const latestWeight = latestSets[0]?.weight ?? 0
  const prevWeight = prevSets[0]?.weight ?? 0

  // If consistently hitting top of rep range with RIR >= 2 → increase weight
  if (latestAvgRIR >= 2 && allSetsCompleted(latestSets)) {
    const increment = latestWeight >= 80 ? 2.5 : latestWeight >= 40 ? 2.5 : 1.25
    suggestions.push({
      exerciseId,
      type: 'weight-increase',
      amount: increment,
      reason: `You're completing all sets with ${latestAvgRIR.toFixed(1)} RIR. Add ${increment}kg next session.`,
      confidence: 0.9,
    })
  }

  // If failing sets consistently → deload or maintain
  if (!allSetsCompleted(latestSets)) {
    const failRate = latestSets.filter(s => !s.completed).length / latestSets.length
    if (failRate > 0.5) {
      suggestions.push({
        exerciseId,
        type: 'deload',
        amount: 10, // percent reduction
        reason: 'Failed > 50% of sets. Consider a 10% weight reduction to restore technique and stimulus quality.',
        confidence: 0.8,
      })
    } else {
      suggestions.push({
        exerciseId,
        type: 'maintain',
        reason: 'Some missed reps. Stay at current weight and focus on completing all reps before adding load.',
        confidence: 0.85,
      })
    }
  }

  // If weight hasn't changed in 3 sessions and RIR is high → suggest adding a set
  if (latestWeight === prevWeight && latestAvgRIR > 3) {
    suggestions.push({
      exerciseId,
      type: 'set-increase',
      amount: 1,
      reason: 'Weight stagnant but RIR is high. Add 1 set to increase volume stimulus before deloading.',
      confidence: 0.7,
    })
  }

  return suggestions
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function allSetsCompleted(sets: SetLog[]): boolean {
  return sets.every(s => s.completed)
}

export function calculateTotalVolume(sets: SetLog[]): number {
  return sets.reduce((total, s) => {
    if (s.completed && s.weight && s.actualReps) {
      return total + s.weight * s.actualReps
    }
    return total
  }, 0)
}

export function estimateStrengthLevel(maxWeight: number, reps: number): number {
  // Epley formula for 1RM estimation
  if (reps === 1) return maxWeight
  return maxWeight * (1 + reps / 30)
}

export function suggestStartingWeight(
  exerciseId: string,
  bodyweight: number = 80,
): number {
  const defaults: Record<string, number> = {
    'incline-bb-press': bodyweight * 0.5,
    'flat-bb-press':    bodyweight * 0.6,
    'incline-db-press': bodyweight * 0.2,
    // weighted pull-ups removed from primary plan; use lat-pulldown instead
    'lat-pulldown':     bodyweight * 0.4,
    'cable-row':        bodyweight * 0.35,
    'vertical-traction-machine': bodyweight * 0.45,
    'back-extension':   20,
    'cable-woodchop':   12,
    'russian-twist-weighted': 12,
    'db-lateral-raise': 8,
    'cable-lateral-raise': 6,
    'incline-db-curl':  12,
    'overhead-tricep-extension': 20,
    'skull-crusher':    bodyweight * 0.25,
    'hack-squat':       bodyweight * 0.7,
    'leg-press':        bodyweight * 1.0,
    'cable-crunch':     25,
  }
  return defaults[exerciseId] ?? 20
}
