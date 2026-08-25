'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, Leaf, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── Live stat counter for left canvas ───────────────────────────
const STATS = [
  { label: 'Tons CO₂ Offset', value: 24500, suffix: '' },
  { label: 'Active Projects', value: 142, suffix: '' },
  { label: 'Credits Minted', value: 89320, suffix: '' },
  { label: 'Validators Online', value: 37, suffix: '' },
]

const PERSONAS = [
  { id: 'ngo', label: 'NGO / Project Proposer', icon: Leaf, desc: 'Submit and manage carbon sequestration projects' },
  { id: 'government', label: 'Government Validator', icon: Shield, desc: 'Authorize and verify project compliance' },
  { id: 'corporate', label: 'Corporate Enterprise Buyer', icon: Building2, desc: 'Purchase verified carbon credits at scale' },
  { id: 'academic', label: 'Independent Academic Auditor', icon: GraduationCap, desc: 'Conduct third-party scientific audits' },
]

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      setCount(c => {
        if (c + step >= target) { clearInterval(timer); return target }
        return c + step
      })
    }, 20)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString()}</>
}

function LeftCanvas() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center relative bg-gradient-to-br from-primary-900 via-[#064E3B] to-[#030712] p-12 overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary-400"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-sm">
        <motion.div
          className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Leaf className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-2">CarbonX Registry</h1>
        <p className="text-primary-200 text-sm mb-10">
          Blockchain-verified blue carbon credits with AI-driven MRV satellite validation.
        </p>

        {/* Live stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter target={stat.value} />
                {stat.suffix}
              </p>
              <p className="text-xs text-primary-200 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <p className="text-primary-300 text-xs mt-8">
          Powered by ERC-1155 on Polygon Amoy · Verra & CCTS Validated
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', fullName: '', walletAddress: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register' && !selectedPersona) {
      setError('Please select your user role to continue.')
      return
    }
    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : {
            email: form.email,
            password: form.password,
            full_name: form.fullName,
            assigned_role: selectedPersona,
          }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed')

      // Save session for pages (like /profile) that read from localStorage
      localStorage.setItem('user_session', JSON.stringify({
        name:   data.user.full_name,
        email:  data.user.email,
        role:   data.user.assigned_role,
        wallet: data.user.wallet_address,
      }))

      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <LeftCanvas />

      {/* Right: Auth Form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 bg-[var(--bg)]">
        <div className="w-full max-w-md">
          {/* Mode switcher */}
          <div className="flex rounded-xl border border-[var(--border)] p-1 mb-8 bg-[var(--card)]">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {mode === 'register' && (
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  icon={<User className="w-4 h-4" />}
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  required
                />
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@organization.com"
                icon={<Mail className="w-4 h-4" />}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  iconRight={
                    <button type="button" onClick={() => setShowPassword(v => !v)} className="text-[var(--text-muted)]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {mode === 'register' && (
                <>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock className="w-4 h-4" />}
                    value={form.confirmPassword}
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    required
                  />
                  <Input
                    label="Wallet Address (optional)"
                    placeholder="0x..."
                    value={form.walletAddress}
                    onChange={e => setForm(f => ({ ...f, walletAddress: e.target.value }))}
                    hint="Connect your MetaMask wallet to enable on-chain actions"
                  />

                  {/* Persona selection */}
                  <div>
                    <label className="text-sm font-medium text-[var(--text)] block mb-2">
                      Select Your Role <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {PERSONAS.map(({ id, label, icon: Icon, desc }) => (
                        <motion.button
                          key={id}
                          type="button"
                          onClick={() => setSelectedPersona(id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                            selectedPersona === id
                              ? 'border-primary-500 bg-primary-500/10 text-[var(--text)]'
                              : 'border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:border-primary-500/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedPersona === id ? 'bg-primary-500 text-white' : 'bg-[var(--border)] text-[var(--text-muted)]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                            <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                iconRight={<ArrowRight className="w-4 h-4" />}
              >
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
