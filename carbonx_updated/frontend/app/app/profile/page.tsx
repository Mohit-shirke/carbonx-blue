'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Wallet, Shield, Leaf, Building2,
  GraduationCap, Copy, CheckCheck, ExternalLink, LogOut, RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ROLE_MAP: Record<string,{label:string; icon:any; color:string; desc:string}> = {
  ngo:        { label:'NGO / Project Proposer',      icon:Leaf,          color:'text-primary-500 bg-primary-500/10', desc:'Submit and manage blue carbon projects'   },
  government: { label:'Government Validator',         icon:Shield,        color:'text-blue-400    bg-blue-500/10',    desc:'Run MRV pipelines and verify projects'    },
  corporate:  { label:'Corporate Enterprise Buyer',   icon:Building2,     color:'text-amber-400   bg-amber-500/10',   desc:'Purchase carbon credits at scale'         },
  academic:   { label:'Independent Academic Auditor', icon:GraduationCap, color:'text-purple-400  bg-purple-500/10',  desc:'Conduct third-party scientific review'    },
}

const MOCK_PURCHASES = [
  { id:'t1', project:'Sundarbans Mangrove Reserve', amount:10, cost:'$285.00', date:'2025-06-15', txHash:'0x3a2f…9b1c', status:'active'  },
  { id:'t2', project:'Pichavaram Mangrove Block',   amount:5,  cost:'$98.75',  date:'2025-06-10', txHash:'0x7f11…c3de', status:'retired' },
]

export default function ProfilePage() {
  const router              = useRouter()
  const [user, setUser]     = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiUser, setApiUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user_session')
    if (stored) { setUser(JSON.parse(stored)); setLoading(false) }
    else { router.push('/auth'); return }

    // Try to fetch live user from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/me`, {
      credentials: 'include'
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setApiUser(data.user) })
      .catch(() => {}) // Silently fail if backend not running
  }, [router])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/auth/logout`, {
        method: 'POST', credentials: 'include'
      })
    } catch { /* silent fail */ }
    localStorage.removeItem('user_session')
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"/>
    </div>
  )

  if (!user) return null

  const displayUser = apiUser || user
  const role        = ROLE_MAP[displayUser.role || displayUser.assigned_role] || ROLE_MAP.corporate
  const RoleIcon    = role.icon
  const totalSpent  = MOCK_PURCHASES.reduce((s,p) => s + parseFloat(p.cost.replace('$','')), 0)
  const totalTons   = MOCK_PURCHASES.reduce((s,p) => s + p.amount, 0)
  const retired     = MOCK_PURCHASES.filter(p=>p.status==='retired').reduce((s,p) => s + p.amount, 0)

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">My Profile</h1>
        <div className="flex items-center gap-2">
          {apiUser && (
            <span className="flex items-center gap-1.5 text-xs text-primary-500 bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>
              Live
            </span>
          )}
          <button onClick={logout}
            className="flex items-center gap-2 text-xs sm:text-sm text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="w-3.5 h-3.5"/> Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Avatar card */}
        <motion.div className="card p-5 flex flex-col items-center text-center"
          initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-500/20 flex items-center justify-center mb-3">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-500"/>
          </div>
          <h2 className="font-bold text-base sm:text-lg text-[var(--text)]">
            {displayUser.full_name || displayUser.name}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{displayUser.email}</p>
          <div className={`flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-medium ${role.color}`}>
            <RoleIcon className="w-3.5 h-3.5"/>{role.label}
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-snug">{role.desc}</p>
          <Link href="/marketplace"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium py-2 rounded-xl transition-colors">
            Browse Marketplace
          </Link>
        </motion.div>

        {/* Account details */}
        <motion.div className="card p-5 sm:col-span-2 space-y-3"
          initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.08}}>
          <h3 className="font-semibold text-sm text-[var(--text)]">Account Details</h3>

          {[
            { icon:User,   label:'Full Name',     value: displayUser.full_name || displayUser.name  },
            { icon:Mail,   label:'Email Address', value: displayUser.email                          },
            { icon:Shield, label:'Role',          value: role.label                                 },
          ].map(({ icon:Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-primary-500"/>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
                <p className="text-xs sm:text-sm font-medium text-[var(--text)] truncate">{value}</p>
              </div>
            </div>
          ))}

          {/* Wallet */}
          <div className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-primary-500"/>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[var(--text-muted)]">Wallet Address</p>
              <p className="text-xs font-mono text-[var(--text)] truncate">
                {displayUser.wallet || displayUser.wallet_address || 'Not connected — connect MetaMask in the navbar'}
              </p>
            </div>
            {(displayUser.wallet || displayUser.wallet_address) && (
              <div className="flex gap-1 shrink-0">
                <button onClick={() => copy(displayUser.wallet || displayUser.wallet_address)}
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
                  title="Copy address">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500"/> : <Copy className="w-3.5 h-3.5"/>}
                </button>
                <a href={`https://www.oklink.com/amoy/address/${displayUser.wallet || displayUser.wallet_address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
                  title="View on explorer">
                  <ExternalLink className="w-3.5 h-3.5"/>
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Credits Purchased', value:`${totalTons} tCO₂e`        },
          { label:'Credits Retired',   value:`${retired} tCO₂e`          },
          { label:'Total Spent',       value:`$${totalSpent.toFixed(2)}`  },
        ].map(({ label, value }, i) => (
          <motion.div key={label} className="card p-3 sm:p-4 text-center"
            initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.15+i*0.07}}>
            <p className="text-lg sm:text-xl font-bold text-primary-500">{value}</p>
            <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Purchase history */}
      <motion.div className="card overflow-hidden"
        initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-semibold text-sm sm:text-base text-[var(--text)]">Purchase History</h3>
          <Link href="/ledger" className="text-xs text-primary-500 hover:underline">View Ledger →</Link>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                {['Project','Amount','Cost','Date','Tx Hash','Status'].map(h=>(
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PURCHASES.map(p=>(
                <tr key={p.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--text)]">{p.project}</td>
                  <td className="px-4 py-3 text-[var(--text)]">{p.amount} tCO₂e</td>
                  <td className="px-4 py-3 text-primary-500 font-semibold">{p.cost}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{p.date}</td>
                  <td className="px-4 py-3 font-mono text-blue-400">{p.txHash}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status==='active'?'bg-primary-500/10 text-primary-500 border border-primary-500/20':'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-[var(--border)]">
          {MOCK_PURCHASES.map(p=>(
            <div key={p.id} className="px-4 py-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--text)] truncate pr-2">{p.project}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.status==='active'?'bg-primary-500/10 text-primary-500':'bg-red-500/10 text-red-400'}`}>
                  {p.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">{p.amount} tCO₂e · {p.date}</span>
                <span className="text-primary-500 font-semibold">{p.cost}</span>
              </div>
              <p className="text-[10px] font-mono text-blue-400">{p.txHash}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
