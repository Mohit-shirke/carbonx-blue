'use client'
import { useState, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Eye, EyeOff, AlertCircle, Loader, Shield, Building2, GraduationCap } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Tab  = 'login' | 'register'
type Role = 'ngo' | 'government' | 'corporate' | 'academic'

const ROLES = [
  { id:'ngo'        as Role, label:'NGO / Project Proposer',      icon:Leaf,          desc:'Submit blue carbon projects',      color:'text-primary-500 bg-primary-500/10 border-primary-500/30' },
  { id:'government' as Role, label:'Government Validator',         icon:Shield,        desc:'Run MRV validations',              color:'text-blue-400    bg-blue-500/10    border-blue-500/30'    },
  { id:'corporate'  as Role, label:'Corporate Buyer',              icon:Building2,     desc:'Purchase credits at scale',        color:'text-amber-400   bg-amber-500/10   border-amber-500/30'   },
  { id:'academic'   as Role, label:'Academic Auditor',             icon:GraduationCap, desc:'Conduct scientific review',        color:'text-purple-400  bg-purple-500/10  border-purple-500/30'  },
]

interface Errors { name?:string; email?:string; password?:string; confirm?:string; api?:string }

function validate(form: any, tab: Tab): Errors {
  const e: Errors = {}
  if (tab==='register') {
    if (!form.name?.trim())                          e.name     = 'Full name is required'
    else if (form.name.trim().length < 2)            e.name     = 'Name must be at least 2 characters'
  }
  if (!form.email?.trim())                           e.email    = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email))        e.email    = 'Enter a valid email address'
  if (!form.password)                                e.password = 'Password is required'
  else if (form.password.length < 8)                 e.password = 'Password must be at least 8 characters'
  if (tab==='register') {
    if (!form.confirm)                               e.confirm  = 'Please confirm your password'
    else if (form.confirm !== form.password)         e.confirm  = 'Passwords do not match'
  }
  return e
}

function AuthForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/dashboard'

  const [tab, setTab]         = useState<Tab>('login')
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', role:'corporate' as Role })
  const [showPwd, setShowPwd] = useState(false)
  const [showCfm, setShowCfm] = useState(false)
  const [errors, setErrors]   = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(prev => ({ ...prev, [k]: '', api: '' }))
  }

  const switchTab = (t: Tab) => { setTab(t); setErrors({}); setForm({ name:'', email:'', password:'', confirm:'', role:'corporate' }) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form, tab)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})

    try {
      const endpoint = tab === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register'
      const body     = tab === 'login'
        ? { email: form.email.toLowerCase().trim(), password: form.password }
        : { full_name: form.name.trim(), email: form.email.toLowerCase().trim(), password: form.password, assigned_role: form.role }

      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${endpoint}`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrors({ api: data.error || data.details?.[0] || 'Something went wrong. Please try again.' })
        setLoading(false)
        return
      }

      // Save session for demo/profile page
      if (data.user) {
        localStorage.setItem('user_session', JSON.stringify({
          name:   data.user.full_name,
          email:  data.user.email,
          role:   data.user.assigned_role,
          wallet: data.user.wallet_address,
        }))
      }

      router.push(redirect)
    } catch (err: any) {
      // Demo fallback when backend not running
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        localStorage.setItem('user_session', JSON.stringify({
          name:   form.name || form.email.split('@')[0],
          email:  form.email,
          role:   form.role,
          wallet: null,
        }))
        router.push(redirect)
        return
      }
      setErrors({ api: 'Connection error. Please check your internet and try again.' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 sm:py-12 bg-[var(--bg)]">
      <div className="w-full max-w-md">

        {/* Logo */}
        <motion.div className="text-center mb-8" initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}>
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-7 h-7 text-white"/>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {tab==='login' ? 'Welcome back' : 'Join CarbonX'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {tab==='login' ? 'Sign in to your account' : 'Create your free account — no credit card needed'}
          </p>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-1 mb-5">
          {(['login','register'] as Tab[]).map(t=>(
            <button key={t} type="button" onClick={()=>switchTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab===t?'bg-primary-500 text-white shadow-sm':'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
              {t==='login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <motion.form key={tab} onSubmit={submit} className="card p-5 sm:p-6 space-y-4"
          initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.25}}>

          {/* API error */}
          {errors.api && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
              <p className="text-xs text-red-400">{errors.api}</p>
            </div>
          )}

          {/* Name — register only */}
          <AnimatePresence>
            {tab==='register' && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="flex flex-col gap-1 overflow-hidden">
                <label className="text-xs font-semibold text-[var(--text)]">Full Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={set('name')} placeholder="Jane Smith" autoComplete="name"
                  className={`w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border ${errors.name?'border-red-500':'border-[var(--border)]'} focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]`}/>
                {errors.name && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.name}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text)]">Email Address <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" autoComplete="email"
              className={`w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border ${errors.email?'border-red-500':'border-[var(--border)]'} focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]`}/>
            {errors.email && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text)]">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPwd?'text':'password'} value={form.password} onChange={set('password')}
                placeholder="Min. 8 characters" autoComplete={tab==='login'?'current-password':'new-password'}
                className={`w-full px-3 py-2.5 pr-10 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border ${errors.password?'border-red-500':'border-[var(--border)]'} focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]`}/>
              <button type="button" onClick={()=>setShowPwd(v=>!v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                aria-label={showPwd?'Hide password':'Show password'}>
                {showPwd?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.password}</p>}
          </div>

          {/* Confirm password + role — register only */}
          <AnimatePresence>
            {tab==='register' && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="space-y-4 overflow-hidden">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text)]">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input type={showCfm?'text':'password'} value={form.confirm} onChange={set('confirm')}
                      placeholder="Repeat your password" autoComplete="new-password"
                      className={`w-full px-3 py-2.5 pr-10 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border ${errors.confirm?'border-red-500':'border-[var(--border)]'} focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]`}/>
                    <button type="button" onClick={()=>setShowCfm(v=>!v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                      {showCfm?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-[10px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.confirm}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text)] block mb-2">Your Role <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(({ id, label, icon:Icon, desc, color })=>(
                      <button key={id} type="button" onClick={()=>setForm(f=>({...f, role:id}))}
                        className={`flex flex-col items-start gap-1 p-2.5 rounded-xl border-2 text-left transition-all ${form.role===id?color:'border-[var(--border)] hover:border-primary-500/40'}`}>
                        <Icon className="w-4 h-4 shrink-0"/>
                        <p className="text-[10px] font-bold text-[var(--text)] leading-tight">{label}</p>
                        <p className="text-[9px] text-[var(--text-muted)]">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot password link */}
          {tab==='login' && (
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-primary-500 hover:underline">
                Forgot your password?
              </Link>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98]">
            {loading
              ? <><Loader className="w-4 h-4 animate-spin"/>{tab==='login'?'Signing in…':'Creating account…'}</>
              : tab==='login' ? 'Sign In' : 'Create Free Account'
            }
          </button>

          {/* Switch tab */}
          <p className="text-center text-xs text-[var(--text-muted)]">
            {tab==='login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={()=>switchTab(tab==='login'?'register':'login')}
              className="text-primary-500 hover:underline font-semibold">
              {tab==='login' ? 'Create one free' : 'Sign in'}
            </button>
          </p>

          {/* Demo note */}
          <div className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
            <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
              <strong className="text-[var(--text)]">Demo mode:</strong> Works without backend.
              Your session is saved locally. A welcome email is sent when backend is running.
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"/>
      </div>
    }>
      <AuthForm/>
    </Suspense>
  )
}
