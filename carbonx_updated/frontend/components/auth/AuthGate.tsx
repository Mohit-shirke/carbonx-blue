'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Lock, Shield, ShieldAlert, ArrowRight, Building2,
  GraduationCap, Leaf, User, Globe, CheckCircle2, RefreshCw
} from 'lucide-react'
import { useAuth, type UserRole, type UserSession } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'

interface AuthGateProps {
  children: React.ReactNode
  requiredRoles?: UserRole[]
  pageTitle?: string
  description?: string
}

const ROLE_META: Record<UserRole, { label: string; icon: any; color: string; desc: string }> = {
  corporate: {
    label: 'Corporate Buyer',
    icon: Building2,
    color: 'emerald',
    desc: 'Procure audited blue carbon offsets for SEBI BRSR & Scope 1-3 mandates',
  },
  government: {
    label: 'Government Validator',
    icon: Shield,
    color: 'cyan',
    desc: 'Authorize and audit carbon credit minting via decentralized consensus',
  },
  ngo: {
    label: 'NGO / Proposer',
    icon: Leaf,
    color: 'teal',
    desc: 'Submit blue carbon restoration projects & upload satellite drone telemetry',
  },
  academic: {
    label: 'Academic Auditor',
    icon: GraduationCap,
    color: 'purple',
    desc: 'Verify NDVI spectral bands & biomass equations (IPCC Tier 2)',
  },
  individual: {
    label: 'Retail Buyer',
    icon: User,
    color: 'blue',
    desc: 'Calculate carbon footprint & retire verified credits on Polygon PoS',
  },
  public: {
    label: 'Public Observer',
    icon: Globe,
    color: 'slate',
    desc: 'Zero-login public registry audits & cryptographic provenance verification',
  },
}

export function AuthGate({
  children,
  requiredRoles,
  pageTitle = 'Protected Console',
  description,
}: AuthGateProps) {
  const { user, loading, login, switchRole, isAuthenticated, hasRole } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-[var(--text-muted)]">Verifying institutional credentials…</p>
      </div>
    )
  }

  // Case 1: User is NOT authenticated at all
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full"
        >
          <SpotlightCard className="p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
            <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={9} size={200} />

            <div className="w-16 h-16 rounded-3xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto text-primary-500 mb-5 shadow-lg shadow-primary-500/15">
              <Lock className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-600 dark:text-primary-400 text-xs font-mono font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>AUTHENTICATION REQUIRED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Sign In to Access {pageTitle}
            </h1>

            <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed max-w-md mx-auto">
              {description ||
                'This operational console is protected by institutional access controls. Please sign in with your verified organization account to proceed.'}
            </p>

            {requiredRoles && requiredRoles.length > 0 && (
              <div className="mt-5 p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-left">
                <p className="text-xs font-semibold text-[var(--text)] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-500" /> Authorized Roles for this Console:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {requiredRoles.map((role) => {
                    const meta = ROLE_META[role]
                    const Icon = meta.icon
                    return (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--text)]"
                      >
                        <Icon className="w-3 h-3 text-primary-500" />
                        {meta.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/auth?redirect=${encodeURIComponent(pathname)}`} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto text-sm font-bold shadow-lg shadow-primary-500/20"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In / Register
                </Button>
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
                  Browse Public Market
                </Button>
              </Link>
            </div>

            {/* Quick Persona Switcher for Live Demo Evaluation */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-left">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
                Quick Role Verification Demo:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(requiredRoles || (['corporate', 'government', 'ngo', 'academic'] as UserRole[])).map((r) => {
                  const meta = ROLE_META[r]
                  const Icon = meta.icon
                  return (
                    <button
                      key={r}
                      onClick={() =>
                        login({
                          name: `Demo ${meta.label}`,
                          email: `${r}@carbonx.app`,
                          role: r,
                          organization: `${meta.label} Consortium`,
                        })
                      }
                      className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:border-primary-500 hover:bg-primary-500/5 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-xs font-bold text-[var(--text)] truncate">{meta.label}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">1-Click Sign In</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    )
  }

  // Case 2: User IS authenticated, but lacks the required role
  if (requiredRoles && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    const currentMeta = ROLE_META[user.role] || ROLE_META.corporate
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full"
        >
          <SpotlightCard className="p-6 sm:p-10 text-center relative overflow-hidden shadow-2xl">
            <BorderBeam colorFrom="#F59E0B" colorTo="#EF4444" duration={9} size={200} />

            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 mb-5 shadow-lg shadow-amber-500/15">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>ROLE AUTHORIZATION REQUIRED</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
              Access Restricted for {currentMeta.label}
            </h1>

            <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed max-w-md mx-auto">
              You are signed in as <strong className="text-[var(--text)]">{user.name}</strong> ({currentMeta.label}). Access to the <strong className="text-[var(--text)]">{pageTitle}</strong> console is strictly limited to authorized organization roles.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-left space-y-2">
              <p className="text-xs font-semibold text-[var(--text)]">Required Roles for this Console:</p>
              <div className="flex flex-wrap gap-1.5">
                {requiredRoles.map((r) => {
                  const meta = ROLE_META[r]
                  const Icon = meta.icon
                  return (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-600 dark:text-primary-400 transition-colors cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      Switch to {meta.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm font-semibold">
                  Go to My Dashboard
                </Button>
              </Link>
              <Link href="/marketplace" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
                  View Marketplace
                </Button>
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    )
  }

  // Case 3: Fully Authorized! Render the protected console.
  return <>{children}</>
}

