'use client'
/**
 * CarbonX Theme System
 * Provides ThemeProvider context + useTheme hook
 * Supports: 'dark' | 'light' — persisted to localStorage
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme:       Theme
  toggleTheme: () => void
  setTheme:    (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // Sync with localStorage + document on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carbonx-theme') as Theme | null
      const initial = saved === 'light' ? 'light' : 'dark'
      setThemeState(initial)
      applyTheme(initial)
    } catch {
      applyTheme('dark')
    }
  }, [])

  const applyTheme = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
    document.documentElement.className = t
  }

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    try { localStorage.setItem('carbonx-theme', t) } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
