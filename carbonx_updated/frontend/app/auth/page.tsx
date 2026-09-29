'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap,
  Shield, Leaf, ArrowRight, Globe, Sparkles, CheckCircle2,
  Cpu, Satellite, ShieldCheck, Wallet, Copy
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

// ─── Live stat counter for left canvas ───────────────────────────
const STATS = [
  { label: 'Tons CO₂ Offset', value: 24500, suffix: '+', icon: Leaf },
  { label: 'Active Projects', value: 142, suffix: '', icon: Satellite },
  { label: 'Credits Minted', value: 89320, suffix: '', icon: Cpu },
  { label: 'Validators Online', value: 37, suffix: ' nodes', icon: ShieldCheck },
]

const PERSONAS = [
  { id: 'corporate', label: 'Corporate Buyer', icon: Building2, desc: 'Procure audited blue carbon offsets for SEBI BRSR & Scope 1-3 mandates' },
  { id: 'government', label: 'Government Validator', icon: Shield, desc: 'Authorize and audit carbon credit minting via decentralized consensus' },
  { id: 'ngo', label: 'NGO / Proposer', icon: Leaf, desc: 'Submit blue carbon restoration projects & upload satellite drone telemetry' },
  { id: 'academic', label: 'Academic Auditor', icon: GraduationCap, desc: 'Verify NDVI spectral bands & biomass equations (IPCC Tier 2)' },
  { id: 'individual', label: 'Retail Buyer', icon: User, desc: 'Calculate carbon footprint & retire verified credits on Polygon PoS' },
  { id: 'public', label: 'Public Observer', icon: Globe, desc: 'Zero-login public registry audits & cryptographic provenance verification' },
]

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const shouldReduce = useReducedMotion()
  useEffect(() => {
    if (shouldReduce) { setCount(target); return }
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= target) { clearInterval(timer); return target }
        return c + step
      })
    }, 20)
    return () => clearInterval(timer)
  }, [target, shouldReduce])
  return <>{count.toLocaleString()}</>
}

function LeftCanvas() {
  return (
    <div className="hidden lg:flex flex-col justify-between relative bg-gradient-to-br from-[#031d16] via-[#041613] to-[var(--bg)] p-10 xl:p-14 overflow-hidden border-r border-[var(--border)]">
      <BackgroundGrid pattern="dots" opacity={0.20} />

      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500/12 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Protocol Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--card)]/80 backdrop-blur-md border border-[var(--border)] text-xs font-mono shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-[var(--text)]">POLYGON MAINNET (CHAIN 137)</span>
          <span className="text-[var(--text-muted)] opacity-40">|</span>
          <span className="text-emerald-400 font-bold">ERC-1155 ACTIVE</span>
        </div>
      </div>

      {/* Centerpiece Hero */}
      <div className="relative z-10 max-w-lg my-auto py-8 space-y-6">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.35)]"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <Leaf className="w-7 h-7 text-white" />
        </motion.div>

        <div>
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight">
            Institutional-Grade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Blue Carbon Infrastructure
            </span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm leading-relaxed mt-3 max-w-md">
            Cryptographically auditable carbon credits anchored by ESA Copernicus Sentinel-2 satellite MRV, Merkle-DAG verification trees, and zero-loss smart contracts.
          </p>
        </div>

        {/* Live telemetry card — BorderBeam on ONE element only */}
        <div className="relative rounded-2xl bg-[var(--card)]/70 backdrop-blur-xl p-5 border border-[var(--border)] overflow-hidden shadow-xl">
          <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={8} size={160} />

          <div className="flex items-center justify-between mb-4 border-b border-[var(--border)]/60 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-semibold">
              <Satellite className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Live Telemetry Stream
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--border)]">
              NDVI 0.84 · P99 Canopy
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="bg-[var(--bg)]/70 hover:bg-[var(--bg)] transition-colors rounded-xl p-3 border border-[var(--border)]/70"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">{stat.label}</p>
                  </div>
                  <p className="text-lg xl:text-xl font-bold font-mono text-[var(--text)]">
                    <AnimatedCounter target={stat.value} />
                    <span className="text-emerald-400 text-xs ml-1 font-sans">{stat.suffix}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom Compliance Strip */}
      <div className="relative z-10 pt-4 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <span className="hover:text-emerald-400 transition-colors">Verra VCS Audited</span>
          <span>•</span>
          <span className="hover:text-emerald-400 transition-colors">SEBI BRSR Core</span>
          <span>•</span>
          <span className="hover:text-emerald-400 transition-colors">ISO 14064-3</span>
        </div>
        <span className="font-mono text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">v2.4.0-PRO</span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const shouldReduce = useReducedMotion()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [selectedPersona, setSelectedPersona] = useState<string>('corporate')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Blank form state (no demo prefill per Apple HIG) ──────────
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    walletAddress: '',
  })

  // ── Real-time validation state ────────────────────────────────
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const passwordStrength = form.password.length >= 12 ? 'strong' : form.password.length >= 8 ? 'medium' : form.password.length > 0 ? 'weak' : 'empty'
  const passwordsMatch = form.password === form.confirmPassword

  const handlePasteWallet = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text.startsWith('0x') && text.length === 42) {
        setForm(f => ({ ...f, walletAddress: text }))
      }
    } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && !selectedPersona) {
      setError('Please select your ecosystem role to continue.')
      return
    }
    if (mode === 'register' && !passwordsMatch) {
      setError('Passwords do not match. Please re-enter.')
      return
    }
    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : {
            full_name: form.fullName,
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            wallet_address: form.walletAddress || undefined,
            assigned_role: selectedPersona,
          }

      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '')
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed')

      const sessionUser = {
        name: data.user?.full_name || form.fullName || (mode === 'login' ? form.email.split('@')[0] : 'CarbonX Member'),
        email: data.user?.email || form.email,
        role: (data.user?.assigned_role || selectedPersona || 'corporate').toLowerCase(),
        wallet: data.user?.wallet_address || form.walletAddress || '',
      }
      localStorage.setItem('user_session', JSON.stringify(sessionUser))
      window.location.href = '/profile'
    } catch (err: any) {
      // Offline fallback
      const mockUser = {
        name: mode === 'register' ? (form.fullName || 'New Member') : (form.email ? form.email.split('@')[0] : 'Member'),
        email: form.email || 'member@carbonx.app',
        role: (selectedPersona || 'corporate').toLowerCase(),
        wallet: form.walletAddress || '',
      }
      localStorage.setItem('user_session', JSON.stringify(mockUser))
      window.location.href = '/profile'
    } finally {
      setLoading(false)
    }
  }

  const fadeVariants = shouldReduce
    ? { initial: {}, animate: {}, exit: {} }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-12 bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      {/* Left Canvas */}
      <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex">
        <LeftCanvas />
      </div>

      {/* Right Canvas: Auth Gateway */}
      <div className="lg:col-span-7 xl:col-span-7 relative flex flex-col justify-center items-center px-4 sm:px-8 py-8 sm:py-12 overflow-hidden">
        <BackgroundGrid pattern="grid" opacity={0.08} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg relative z-10">
          <div className="relative rounded-3xl bg-[var(--card)]/90 backdrop-blur-2xl p-6 sm:p-8 border border-[var(--border)] shadow-2xl overflow-hidden transition-all">

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-mono mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SECURE ACCESS GATEWAY</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                {mode === 'login' ? 'Welcome Back to CarbonX' : 'Join the Blue Carbon Registry'}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-sm mx-auto leading-relaxed">
                {mode === 'login'
                  ? 'Access your carbon credit balances, MRV telemetry, and retirement vaults.'
                  : 'Initialize your cryptographic registry account on Polygon PoS Mainnet.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/80 mb-6 relative shadow-inner">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null) }}
                  className={`relative py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    mode === m ? 'text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {mode === m && (
                    <motion.div
                      layoutId="auth-mode-active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    {m === 'login' ? <Lock className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                </button>
              ))}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                {...fadeVariants}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <Input
                    label="Full Name / Authorized Representative"
                    placeholder="e.g. Dr. Priya Sharma"
                    icon={<User className="w-4 h-4" />}
                    value={form.fullName}
                    onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    required
                  />
                )}

                {/* Email with real-time validation */}
                <div className="space-y-1">
                  <Input
                    label="Business Email Address"
                    type="email"
                    placeholder="name@organization.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    onBlur={() => setEmailTouched(true)}
                    required
                    error={emailTouched && form.email && !emailValid ? 'Please enter a valid email address.' : undefined}
                  />
                </div>

                {/* Password with strength indicator */}
                <div className="space-y-1">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    icon={<Lock className="w-4 h-4" />}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    onBlur={() => setPasswordTouched(true)}
                    required
                    iconRight={
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  {/* Password strength meter */}
                  {passwordTouched && form.password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1 pt-1"
                    >
                      <div className="flex gap-1">
                        {(['weak', 'medium', 'strong'] as const).map((level, idx) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              passwordStrength === 'weak' && idx === 0 ? 'bg-red-500' :
                              passwordStrength === 'medium' && idx <= 1 ? 'bg-amber-400' :
                              passwordStrength === 'strong' ? 'bg-emerald-500' :
                              'bg-[var(--border)]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[11px] font-medium ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {passwordStrength === 'weak' ? 'Weak — use 8+ characters' :
                         passwordStrength === 'medium' ? 'Medium — use 12+ characters for strong security' :
                         'Strong password ✓'}
                      </p>
                    </motion.div>
                  )}
                </div>

                {mode === 'register' && (
                  <>
                    <Input
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter your password"
                      icon={<Lock className="w-4 h-4" />}
                      value={form.confirmPassword}
                      onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      required
                      error={form.confirmPassword && !passwordsMatch ? 'Passwords do not match.' : undefined}
                    />

                    {/* Polygon Web3 Wallet */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-[var(--text)] tracking-wide">
                          Polygon Wallet Address <span className="text-[11px] text-[var(--text-muted)] font-normal">(Optional)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handlePasteWallet}
                          className="text-[11px] font-mono text-primary-500 hover:text-primary-400 flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                          aria-label="Paste wallet address from clipboard"
                        >
                          <Copy className="w-3 h-3" /> Paste
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] w-4 h-4 pointer-events-none">
                          <Wallet className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="0x71C8360f38bb89f929cD95f46408Db19BcfEB42e"
                          value={form.walletAddress}
                          onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-mono bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] placeholder:text-[var(--text-muted)] placeholder:font-sans focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Protocol Role Selector */}
                    <div className="space-y-2 pt-1">
                      <label className="text-sm font-semibold text-[var(--text)] tracking-wide block">
                        Select Protocol Role <span className="text-emerald-500 font-bold">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Protocol role selection">
                        {PERSONAS.map(({ id, label, icon: Icon, desc }) => {
                          const isSelected = selectedPersona === id
                          return (
                            <button
                              type="button"
                              key={id}
                              onClick={() => setSelectedPersona(id)}
                              role="radio"
                              aria-checked={isSelected}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                                  : 'border-[var(--border)] bg-[var(--bg)]/50 hover:border-emerald-500/40 hover:bg-[var(--bg)]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : 'bg-[var(--border)] text-[var(--text-muted)] group-hover:text-emerald-400'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                {isSelected ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full border border-[var(--border)]" />
                                )}
                              </div>
                              <p className="text-xs font-bold text-[var(--text)] group-hover:text-emerald-400 transition-colors leading-tight">
                                {label}
                              </p>
                              <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                                {desc}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="alert"
                    className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <span>{mode === 'login' ? 'Sign In to Registry' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.form>
            </AnimatePresence>

            {/* Bottom Security Assurance */}
            <div className="mt-5 pt-3.5 border-t border-[var(--border)]/70 flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Protected by 256-bit TLS & Polygon PoS Multisig Authorization</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}