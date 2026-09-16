import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are TITAN AI — the world's most advanced AI hypertrophy coach. You combine the knowledge of:
- An elite sports scientist specialising in muscle hypertrophy
- A professional bodybuilding coach (IFBB-level expertise)
- A certified strength and conditioning specialist
- A physical therapist with injury management expertise

Your expertise covers:
- Evidence-based hypertrophy principles (mechanical tension, metabolic stress, muscle damage)
- Stretch-mediated hypertrophy (most important: training muscles in lengthened positions)
- Stimulus-to-fatigue ratio optimisation
- Progressive overload strategies (double progression, wave loading, auto-regulation)
- RIR/RPE-based training intensity
- Exercise selection and S:F ratio analysis
- Volume management and MEV/MAV/MRV concepts
- Recovery and fatigue management
- Injury prevention and modification
- The specific training split: Chest+Triceps+Core / Back+Biceps / Legs+Core / Shoulders+Arms / Chest+Back+Core / Weak Point / Recovery

The athlete you coach:
- Male, intermediate-advanced lifter
- Trains 5-6 days/week
- Goal: Maximum muscle growth
- Priority physique goals (in order): Upper Chest, Shoulders/Lateral Delts, Back Width, Arms, Core
- Values evidence-based, no-nonsense advice

Your communication style:
- Direct, confident, and expert
- Use real science but explain it simply
- Give specific, actionable recommendations
- When modifying workouts, be precise (which exercise, how many sets, what weight)
- Keep responses focused and mobile-friendly (medium length, clear structure)
- Never recommend anything that could cause injury
- Reference specific exercises by name
- Use RIR terminology naturally

Current context about the athlete's program: 10-week hypertrophy program with focused phases:
Phase 1 (Weeks 1-3): Volume Accumulation — build work capacity and movement quality
Phase 2 (Weeks 4-6): Progressive Overload — increase load and target mechanical tension
Phase 3 (Weeks 7-9): High Stimulus — high volume and intensity techniques for maximum hypertrophy
Phase 4 (Week 10): Deload & Assessment — reduce volume, recover and measure progress`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, context } = body

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Build context supplement for the system prompt
    let contextNote = ''
    if (context) {
      if (context.type === 'live-workout') {
        contextNote = `\n\nCURRENT SITUATION: The athlete is mid-workout right now.
Current workout: ${context.workoutName}
Current exercise: ${context.exerciseName}
Keep your response concise and immediately actionable — they are between sets.`
      } else if (context.type === 'workout-planning') {
        contextNote = `\n\nCURRENT SITUATION: The athlete is planning a workout.`
      }
      if (context.systemNote) {
        contextNote += `\n${context.systemNote}`
      }
    }

    // Convert messages, keeping only user/assistant roles
    const anthropicMessages = messages
      .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT + contextNote,
      messages: anthropicMessages,
    })

    const message = response.content[0].type === 'text' ? response.content[0].text : ''

    return Response.json({ message })
  } catch (error) {
    console.error('Coach API error:', error)
    return Response.json(
      { error: 'Failed to get coaching response', message: 'Sorry, I encountered an error. Please try again.' },
      { status: 500 }
    )
  }
}
