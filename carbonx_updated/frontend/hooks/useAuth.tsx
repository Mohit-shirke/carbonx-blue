'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export type UserRole = 'corporate' | 'government' | 'ngo' | 'academic' | 'individual' | 'public'

export interface UserSession {
  name: string
  email: string
  role: UserRole
  wallet?: string
  organization?: string
}

interface AuthContextValue {
  user: UserSession | null
  loading: boolean
  login: (userData: UserSession) => void
  logout: () => void
  switchRole: (newRole: UserRole) => void
  hasRole: (allowedRoles: (UserRole | string)[]) => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync state from localStorage on mount & listen to changes
  useEffect(() => {
    const syncSession = () => {
      try {
        const stored = localStorage.getItem('user_session')
        if (stored) {
          const parsed = JSON.parse(stored)
          setUser({
            ...parsed,
            role: (parsed.role || 'corporate').toLowerCase() as UserRole,
          })
          // Keep cookie in sync for SSR/middleware checks
          document.cookie = `carbonx_session=1; path=/; max-age=604800; SameSite=Lax`
          document.cookie = `carbonx_role=${parsed.role || 'corporate'}; path=/; max-age=604800; SameSite=Lax`
        } else {
          setUser(null)
          document.cookie = `carbonx_session=; path=/; max-age=0`
          document.cookie = `carbonx_role=; path=/; max-age=0`
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    syncSession()

    // Listen to cross-window or internal session changes
    const onAuthEvent = () => syncSession()
    window.addEventListener('carbonx:auth', onAuthEvent)
    window.addEventListener('storage', onAuthEvent)

    return () => {
      window.removeEventListener('carbonx:auth', onAuthEvent)
      window.removeEventListener('storage', onAuthEvent)
    }
  }, [])

  const login = useCallback((userData: UserSession) => {
    const normalized: UserSession = {
      ...userData,
      role: (userData.role || 'corporate').toLowerCase() as UserRole,
    }
    localStorage.setItem('user_session', JSON.stringify(normalized))
    document.cookie = `carbonx_session=1; path=/; max-age=604800; SameSite=Lax`
    document.cookie = `carbonx_role=${normalized.role}; path=/; max-age=604800; SameSite=Lax`
    setUser(normalized)
    window.dispatchEvent(new CustomEvent('carbonx:auth', { detail: normalized }))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('user_session')
    document.cookie = `carbonx_session=; path=/; max-age=0`
    document.cookie = `carbonx_role=; path=/; max-age=0`
    setUser(null)
    window.dispatchEvent(new CustomEvent('carbonx:auth', { detail: null }))
  }, [])

  const switchRole = useCallback((newRole: UserRole) => {
    if (!user) return
    const updated: UserSession = { ...user, role: newRole }
    login(updated)
  }, [user, login])

  const hasRole = useCallback((allowedRoles: (UserRole | string)[]) => {
    if (!user) return false
    return allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchRole,
        hasRole,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

