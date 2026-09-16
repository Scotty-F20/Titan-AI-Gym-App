'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function useCountdownTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onCompleteRef = useRef<(() => void) | null>(null)

  const start = useCallback((duration?: number, onComplete?: () => void) => {
    if (duration !== undefined) setSeconds(duration)
    if (onComplete) onCompleteRef.current = onComplete
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => setIsRunning(false), [])

  const reset = useCallback((duration?: number) => {
    setIsRunning(false)
    setSeconds(duration ?? initialSeconds)
    onCompleteRef.current = null
  }, [initialSeconds])

  const skip = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
    onCompleteRef.current?.()
    onCompleteRef.current = null
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsRunning(false)
            onCompleteRef.current?.()
            onCompleteRef.current = null
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const progress = initialSeconds > 0 ? 1 - seconds / initialSeconds : 0

  return { seconds, isRunning, progress, start, pause, reset, skip }
}

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const startTimeRef = useRef<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000
    setIsRunning(true)
  }, [elapsed])

  const stop = useCallback(() => setIsRunning(false), [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(0)
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  const format = () => {
    const h = Math.floor(elapsed / 3600)
    const m = Math.floor((elapsed % 3600) / 60)
    const s = elapsed % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return { elapsed, isRunning, start, stop, reset, format }
}

export function formatSeconds(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
