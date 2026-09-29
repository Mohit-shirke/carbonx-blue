'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, Search, Sun, Moon, Menu, X, ChevronDown,
  BarChart2, ShoppingCart, Satellite, BookOpen,
  Calculator, Star, Info, Phone, Shield, Lock,
  AlertTriangle, FileText, BarChart
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

const NAV_MAIN = [
  { href:'/dashboard',   label:'Dashboard',  icon:BarChart2    },
  { href:'/marketplace', label:'Marketplace',icon:ShoppingCart },
  { href:'/mrv',         label:'MRV',        icon:Satellite    },
  { href:'/ledger',      label:'Ledger',     icon:Lock         },
  { href:'/pricing',     label:'Pricing',    icon:BarChart     },
]

const NAV_MORE = [
  { href:'/calculator', label:'Carbon Calculator',  icon:Calculator,    desc:'Calculate your footprint'               },
  { href:'/passport',   label:'Project Passport',   icon:FileText,      desc:'Complete project evidence records'      },
  { href:'/verifier',   label:'Verifier Portal',    icon:Shield,        desc:'ACVA/VVB independent verification'      },
  { href:'/admin',      label:'Risk Console',        icon:AlertTriangle, desc:'Admin portfolio risk monitoring'        },
  { href:'/esg',        label:'ESG Reports',         icon:BarChart2,     desc:'Corporate carbon reporting'             },
  { href:'/grievance',  label:'Grievance Mechanism', icon:AlertTriangle, desc:'Report project concerns (ICVCM)'        },
  { href:'/feedback',   label:'Feedback',            icon:Star,          desc:'Rate and review the platform'           },
  { href:'/blog',       label:'Blog',                icon:BookOpen,      desc:'Carbon science and market insights'     },
  { href:'/about',      label:'About',               icon:Info,          desc:'Our mission and team'                   },
  { href:'/contact',    label:'Contact',             icon:Phone,         desc:'Get in touch with us'                   },
]

const PAGES_SEARCH = [
  ...NAV_MAIN.map(n => ({ href:n.href, label:n.label, desc:'' })),
  ...NAV_MORE.map(n => ({ href:n.href, label:n.label, desc:n.desc })),
  { href:'/auth',    label:'Sign In / Register', desc:'' },
  { href:'/profile', label:'My Profile',          desc:'' },
  { href:'/terms',   label:'Terms of Service',    desc:'' },
  { href:'/privacy', label:'Privacy Policy',      desc:'' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery]       = useState('')
  const moreRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMenuOpen(false); setMoreOpen(false) }, [pathname])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
      if (e.key === 'Escape') { setSearchOpen(false); setMoreOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100)
  }, [searchOpen])

  const filtered = PAGES_SEARCH.filter(p =>
    !query || p.label.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8)

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] h-14 sm:h-16 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] flex items-center px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-4 sm:gap-6 w-full max-w-7xl mx-auto">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white"/>
            </div>
            <span className="font-bold text-sm sm:text-base text-[var(--text)] hidden xs:block">
              Carbon<span className="text-primary-500">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_MAIN.map(({ href, label, icon:Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive(href)?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                <Icon className="w-3.5 h-3.5"/>{label}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${moreOpen?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'}`}>
                More <ChevronDown className={`w-3 h-3 transition-transform ${moreOpen?'rotate-180':''}`}/>
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)}/>
                    <motion.div
                      initial={{ opacity:0, y:8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
                      exit={{ opacity:0, y:8, scale:0.97 }} transition={{ duration:0.15 }}
                      className="absolute left-0 top-full mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-20">
                      <div className="p-2 grid grid-cols-1 gap-0.5">
                        {NAV_MORE.map(({ href, label, icon:Icon, desc }) => (
                          <Link key={href} href={href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--border)] transition-colors group">
                            <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0 group-hover:bg-primary-500/20 transition-colors">
                              <Icon className="w-3.5 h-3.5 text-primary-500"/>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[var(--text)]">{label}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            <button onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] hover:border-primary-500 hover:text-primary-500 transition-colors">
              <Search className="w-3.5 h-3.5"/>
              <span>Search…</span>
              <span className="text-[10px] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded-md font-mono">⌘K</span>
            </button>
            <button onClick={() => setSearchOpen(true)} className="sm:hidden p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <Search className="w-4 h-4"/>
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>

            {/* Auth */}
            <Link href="/auth"
              className="hidden sm:flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors">
              Sign In
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors">
              {menuOpen ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="fixed top-14 left-0 right-0 z-[190] bg-[var(--card)] border-b border-[var(--border)] overflow-y-auto max-h-[80vh]">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {[...NAV_MAIN, ...NAV_MORE].map(({ href, label, icon:Icon }) => (
                <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(href)?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)]'}`}>
                  <Icon className="w-4 h-4 shrink-0"/><span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
              <div className="pt-2 border-t border-[var(--border)]">
                <Link href="/auth" className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                  Sign In / Register
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 z-[400] backdrop-blur-sm" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => { setSearchOpen(false); setQuery('') }}/>
            <motion.div initial={{ opacity:0, scale:0.96, y:-16 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
              className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] sm:w-[560px] z-[401] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0"/>
                <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages, projects, features…"
                  className="flex-1 bg-transparent text-sm text-[var(--text)] focus:outline-none placeholder:text-[var(--text-muted)]"/>
                <button onClick={() => { setSearchOpen(false); setQuery('') }} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><X className="w-4 h-4"/></button>
              </div>
              <div className="divide-y divide-[var(--border)] max-h-80 overflow-y-auto">
                {filtered.map(p => (
                  <Link key={p.href} href={p.href} onClick={() => { setSearchOpen(false); setQuery('') }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--border)] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                      <Leaf className="w-3.5 h-3.5 text-primary-500"/>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{p.label}</p>
                      {p.desc && <p className="text-[10px] text-[var(--text-muted)]">{p.desc}</p>}
                    </div>
                    <p className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">{p.href}</p>
                  </Link>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">No results for "{query}"</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                <span>↑↓ Navigate</span><span>↵ Select</span><span>Esc Close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
