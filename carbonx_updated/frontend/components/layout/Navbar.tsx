'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Search, Sun, Moon, Menu, X, ChevronDown,
  BarChart2, ShoppingCart, Satellite, Lock, DollarSign,
  Calculator, Star, Info, Phone, Shield, AlertTriangle,
  FileText, BookOpen, Code2, TrendingUp, Microscope,
  Users, Globe, User, Sparkles, LogOut
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { WalletConnectButton } from '@/components/web3/WalletConnectButton'

const NAV_MAIN = [
  { href:'/dashboard',   label:'Dashboard',  icon:BarChart2    },
  { href:'/marketplace', label:'Marketplace',icon:ShoppingCart },
  { href:'/mrv',         label:'MRV',        icon:Satellite    },
  { href:'/ledger',      label:'Ledger',     icon:Lock         },
  { href:'/pricing',     label:'Pricing',    icon:DollarSign   },
]

const NAV_MORE = [
  { group:'Tools',
    items:[
      { href:'/profile',    label:'User Profile',        icon:User,          desc:'Credits owned, retirements, KYC & wallet'   },
      { href:'/calculator', label:'Carbon Calculator',   icon:Calculator,    desc:'Calculate your CO₂ footprint'              },
      { href:'/propose',    label:'Propose a Project',   icon:Leaf,          desc:'BEE FR05.001 eligibility wizard'            },
      { href:'/esg',        label:'ESG Reporting',       icon:FileText,      desc:'ISO 14064, GHG Protocol, BRSR, TCFD, GRI'  },
    ]
  },
  { group:'Registry',
    items:[
      { href:'/passport',   label:'Project Passport',   icon:Globe,         desc:'Complete immutable project records'         },
      { href:'/verifier',   label:'Verifier Portal',    icon:Shield,        desc:'ACVA/VVB independent verification'          },
      { href:'/admin',      label:'Risk Console',       icon:AlertTriangle, desc:'Portfolio risk monitoring dashboard'        },
      { href:'/grievance',  label:'Grievance Mechanism',icon:Users,         desc:'Report concerns (ICVCM compliant)'          },
    ]
  },
  { group:'Knowledge',
    items:[
      { href:'/innovations',label:'5 World Innovations',icon:Sparkles,     desc:'Novel research & patent-grade proofs'       },
      { href:'/research',   label:'Research & Citations',icon:Microscope,   desc:'15 peer-reviewed references + BibTeX'       },
      { href:'/api-docs',   label:'API Documentation',  icon:Code2,        desc:'REST API reference for developers'          },
      { href:'/blog',       label:'Blog',               icon:BookOpen,     desc:'Carbon science and market insights'         },
    ]
  },
  { group:'Support',
    items:[
      { href:'/about',      label:'About Us',           icon:Info,         desc:'Mission, team, and values'                  },
      { href:'/feedback',   label:'Feedback',           icon:Star,         desc:'Rate and review the platform'               },
      { href:'/contact',    label:'Contact',            icon:Phone,        desc:'Get in touch with our team'                 },
    ]
  },
]

// Flat list for search
const ALL_PAGES = [
  ...NAV_MAIN.map(n => ({ href:n.href, label:n.label, desc:'', icon: n.icon })),
  ...NAV_MORE.flatMap(g => g.items.map(n => ({ href:n.href, label:n.label, desc:n.desc, icon: n.icon }))),
  { href:'/auth',    label:'Sign In / Register',  desc:'', icon: User },
  { href:'/profile', label:'My Profile',           desc:'', icon: User },
  { href:'/terms',   label:'Terms of Service',     desc:'', icon: FileText },
  { href:'/privacy', label:'Privacy Policy',       desc:'', icon: Shield },
]

export function Navbar() {
  const pathname            = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, logout }    = useAuth()
  const [moreOpen, setMore] = useState(false)
  const [menuOpen, setMenu] = useState(false)
  const [searchOpen, setSO] = useState(false)
  const [query, setQuery]   = useState('')
  const searchRef           = useRef<HTMLInputElement>(null)

  useEffect(() => { 
    setMenu(false); 
    setMore(false)
  }, [pathname])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); setSO(v=>!v) }
      if (e.key==='Escape') { setSO(false); setMore(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100) }, [searchOpen])

  const filtered = ALL_PAGES.filter(p =>
    !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] h-14 sm:h-16 bg-[var(--card)]/85 backdrop-blur-xl border-b border-[var(--border)] shadow-sm flex items-center px-3 sm:px-4 lg:px-6 transition-all duration-200">
        <div className="flex items-center gap-3 sm:gap-5 w-full max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 min-h-[44px] min-w-0 px-1">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-white"/>
            </div>
            <span className="font-bold text-sm sm:text-base text-[var(--text)] hidden xs:block">
              Carbon<span className="text-primary-500">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_MAIN.map(({ href, label, icon:Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${isActive(href)?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                <Icon className="w-3.5 h-3.5"/>{label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button onClick={() => setMore(v=>!v)}
                className={`flex items-center gap-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${moreOpen?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                More <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen?'rotate-180':''}`}/>
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMore(false)}/>
                    <motion.div
                      initial={{ opacity:0, y:8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:8, scale:0.97 }} transition={{ duration:0.15 }}
                      className="absolute left-0 top-full mt-2 w-[560px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-20">
                      <div className="p-3 grid grid-cols-2 gap-x-2">
                        {NAV_MORE.map(group => (
                          <div key={group.group} className="space-y-0.5">
                            <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-2 py-1">{group.group}</p>
                            {group.items.map(({ href, label, icon:Icon, desc }) => (
                              <Link key={href} href={href}
                                className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-[var(--border)] transition-colors group min-h-[44px]">
                                <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 group-hover:bg-primary-500/20 transition-colors">
                                  <Icon className="w-3.5 h-3.5 text-primary-500"/>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-[var(--text)] truncate">{label}</p>
                                  <p className="text-[11px] text-[var(--text-muted)] truncate">{desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>


          {/* Right side */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={() => setSO(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] hover:border-primary-500 hover:text-primary-500 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Open search">
              <Search className="w-3.5 h-3.5"/>Search…
              <span className="text-[11px] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
            </button>
            <button onClick={() => setSO(true)} className="sm:hidden p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label="Open search">
              <Search className="w-4 h-4"/>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme==='dark'?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}
            </button>
            <div className="hidden sm:flex items-center">
              <WalletConnectButton compact />
            </div>
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/25 hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <User className="w-3.5 h-3.5 text-primary-500 shrink-0"/>
                  <span className="max-w-[100px] truncate">{user.name || 'Member'}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary-500/20 border border-primary-500/30 uppercase font-bold text-primary-700 dark:text-primary-300">
                    {user.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="p-2.5 rounded-xl hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="hidden sm:flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                Sign In
              </Link>
            )}
            <button onClick={() => setMenu(v=>!v)} className="lg:hidden p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
              {menuOpen?<X className="w-4 h-4"/>:<Menu className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      </nav>


      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="fixed top-14 left-0 right-0 z-[190] bg-[var(--card)] border-b border-[var(--border)] overflow-y-auto max-h-[80vh]">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-4">
              {[{ group:'Main', items: NAV_MAIN.map(n=>({...n,desc:''})) }, ...NAV_MORE].map(group => (
                <div key={group.group}>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1 mb-1">{group.group}</p>
                  <div className="space-y-0.5">
                    {group.items.map(({ href, label, icon:Icon }) => (
                      <Link key={href} href={href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(href)?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)]'}`}>
                        <Icon className="w-4 h-4 shrink-0"/><span className="text-sm font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
                <div className="flex justify-center pb-1">
                  <WalletConnectButton />
                </div>
                {user ? (
                  <>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/25">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{user.name}</p>
                          <p className="text-[10px] uppercase font-mono text-primary-600 dark:text-primary-400 font-bold">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={logout}
                        className="text-xs text-rose-500 font-medium px-2 py-1 rounded hover:bg-rose-500/10"
                      >
                        Sign Out
                      </button>
                    </div>
                    <Link href="/profile" className="flex items-center justify-center gap-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-semibold py-2.5 rounded-xl text-sm transition-colors">
                      My Profile & Holdings
                    </Link>
                  </>
                ) : (
                  <Link href="/auth" className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                    Sign In / Register
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-[400] backdrop-blur-sm"
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => { setSO(false); setQuery('') }}/>
            <motion.div initial={{ opacity:0, scale:0.96, y:-16 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.96 }}
              className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:w-[560px] z-[401] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0"/>
                <input ref={searchRef} value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder="Search pages, features, projects…"
                  className="flex-1 bg-transparent text-sm text-[var(--text)] focus:outline-none placeholder:text-[var(--text-muted)]"/>
                <button onClick={() => { setSO(false); setQuery('') }} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              <div className="divide-y divide-[var(--border)] max-h-[60vh] overflow-y-auto">
                {filtered.map(p => {
                  const PageIcon = p.icon || Leaf
                  return (
                    <Link key={p.href} href={p.href} onClick={() => { setSO(false); setQuery('') }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--border)] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                        <PageIcon className="w-3.5 h-3.5 text-primary-500"/>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text)]">{p.label}</p>
                        {p.desc && <p className="text-[10px] text-[var(--text-muted)] truncate">{p.desc}</p>}
                      </div>
                      <p className="ml-auto text-[10px] text-[var(--text-muted)] font-mono shrink-0">{p.href}</p>
                    </Link>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">No results for "{query}"</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[10px] text-[var(--text-muted)]">
                <span>↑↓ Navigate</span><span>↵ Select</span><span>Esc Close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
