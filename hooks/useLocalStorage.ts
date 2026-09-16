'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`useLocalStorage read error for key "${key}":`, error)
    }
    setIsHydrated(true)
  }, [key])

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const nextValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        window.localStorage.setItem(key, JSON.stringify(nextValue))
        return nextValue
      })
    } catch (error) {
      console.error(`useLocalStorage write error for key "${key}":`, error)
    }
  }, [key])

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.error(`useLocalStorage remove error for key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue, isHydrated] as const
}
