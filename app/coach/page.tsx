'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, Send, Zap, Dumbbell, Heart, Brain, Clock, ChevronRight } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const QUICK_PROMPTS = [
  { label: 'Upper chest exercise?',    prompt: 'What is the best exercise for upper chest growth?' },
  { label: 'Side delt sets?',           prompt: 'How many sets should I do for side delts per week?' },
  { label: 'Shoulder hurts',            prompt: 'My shoulder hurts doing incline press. What should I do?' },
  { label: 'Only 30 minutes',           prompt: 'I only have 30 minutes. Give me the most effective chest workout possible.' },
  { label: 'Not growing',               prompt: 'Why am I not growing? I train hard 5 days a week.' },
  { label: 'Travelling',                prompt: 'I am travelling and only have dumbbells. Give me a full upper body workout.' },
  { label: 'Arm finisher',              prompt: 'Give me an arm workout that absolutely destroys my triceps.' },
  { label: 'Gym is crowded',            prompt: 'The gym is very crowded today. What exercises can I do without machines or a bench?' },
  { label: 'Feeling fatigued',          prompt: 'I feel very fatigued today. Should I still train and how should I modify the session?' },
  { label: 'Hack squat alternative',   prompt: 'What is the best alternative to hack squats?' },
  { label: 'Back width tips',           prompt: 'Give me your top 3 tips for maximising back width.' },
  { label: 'Explain RIR',              prompt: 'Explain RIR training and how I should use it.' },
]

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: `Welcome. I'm TITAN AI — your elite hypertrophy coach.

I combine the expertise of a sports scientist, bodybuilding coach, and strength specialist. Ask me anything about your training.

**What I can help with:**
• Workout programming and modifications
• Exercise selection and substitutions
• Recovery and fatigue management
• Scientific explanations of hypertrophy
• Technique coaching
• Nutrition timing (training nutrition)
• Plateau-busting strategies

What do you need from me today?`,
  timestamp: Date.now(),
}

function formatMessage(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return (
        <p key={i} className="font-bold text-titan-text mt-2 mb-1">
          {line.slice(2, -2)}
        </p>
      )
    }
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <li key={i} className="flex items-start gap-2 ml-1">
          <span className="w-1 h-1 rounded-full bg-titan-accent flex-shrink-0 mt-2" />
          <span>{line.slice(2)}</span>
        </li>
      )
    }
    if (line.trim() === '') return <br key={i} />

    // Inline bold
    const parts = line.split(/\*\*(.*?)\*\*/)
    return (
      <p key={i} className="leading-relaxed">
        {parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j} className="font-bold text-titan-text">{p}</strong> : p
        )}
      </p>
    )
  })
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    const text = content.trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, context: { type: 'general' } }),
      })

      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Sorry, something went wrong.',
        timestamp: Date.now(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="px-4 pt-8 pb-4 border-b border-titan-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-titan flex items-center justify-center shadow-titan">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-titan-text">TITAN AI Coach</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-titan-green animate-pulse-slow" />
                <span className="text-xs text-titan-green font-medium">Always available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-titan flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm
                  ${msg.role === 'user'
                    ? 'bg-titan-accent text-white rounded-br-sm'
                    : 'bg-titan-card border border-titan-border text-titan-muted rounded-bl-sm'
                  }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-titan flex items-center justify-center flex-shrink-0 mr-2">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-titan-card border border-titan-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-titan-accent animate-bounce"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (shown when no loading) */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-2">
            <p className="text-2xs font-bold tracking-widest uppercase text-titan-muted mb-2">Quick Questions</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {QUICK_PROMPTS.slice(0, 6).map(p => (
                <button
                  key={p.prompt}
                  onClick={() => sendMessage(p.prompt)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl bg-titan-card border border-titan-border text-xs text-titan-text whitespace-nowrap touch-target hover:border-titan-accent/50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-titan-border">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask your coach anything..."
              className="flex-1 bg-titan-card border border-titan-border rounded-2xl px-4 py-3 text-sm text-titan-text placeholder:text-titan-muted focus:outline-none focus:border-titan-accent transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl bg-titan-accent flex items-center justify-center disabled:opacity-40 flex-shrink-0 touch-target transition-all active:scale-90"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
