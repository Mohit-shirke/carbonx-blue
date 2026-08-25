'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  isAutoMode: boolean
  setAutoMode: (v: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getTimeBasedTheme(): Theme {
  const hour = new Date().getHours()
  return hour >= 18 || hour < 6 ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [isAutoMode, setAutoModeState] = useState(true)
  const [mounted, setMounted] = useState(false)

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setThemeState(t)
  }, [])

  // Initialize on mount — runs only on client
  useEffect(() => {
    const stored = localStorage.getItem('carbonx-theme') as Theme | null
    const autoMode = localStorage.getItem('carbonx-auto-mode')

    if (stored && autoMode === 'false') {
      setAutoModeState(false)
      applyTheme(stored)
    } else {
      applyTheme(getTimeBasedTheme())
      setAutoModeState(true)
    }
    setMounted(true)
  }, [applyTheme])

  // Cron-like auto loop — every 60 seconds
  useEffect(() => {
    if (!mounted || !isAutoMode) return
    const interval = setInterval(() => {
      applyTheme(getTimeBasedTheme())
    }, 60_000)
    return () => clearInterval(interval)
  }, [mounted, isAutoMode, applyTheme])

  const setTheme = useCallback(
    (t: Theme) => {
      localStorage.setItem('carbonx-theme', t)
      localStorage.setItem('carbonx-auto-mode', 'false')
      setAutoModeState(false)
      applyTheme(t)
    },
    [applyTheme]
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  const setAutoMode = useCallback(
    (v: boolean) => {
      setAutoModeState(v)
      localStorage.setItem('carbonx-auto-mode', String(v))
      if (v) {
        localStorage.removeItem('carbonx-theme')
        applyTheme(getTimeBasedTheme())
      }
    },
    [applyTheme]
  )

  // Avoid flash of wrong theme — render nothing until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{
          theme: 'light',
          setTheme,
          toggleTheme,
          isAutoMode,
          setAutoMode,
        }}
      >
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, isAutoMode, setAutoMode }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
