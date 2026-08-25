'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, Leaf, Calculator, FileCheck, Zap, DollarSign, Info, BookOpen, MessageSquare, User, Mail, ShoppingBag, BarChart2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AI_PROJECTS } from '@/lib/ai/knowledgeBase'

const PAGES = [
  { title:'Dashboard',         desc:'Real-time analytics & NDVI map',          href:'/dashboard',   icon:BarChart2,    color:'text-primary-500' },
  { title:'Marketplace',       desc:'Browse & buy blue carbon credits',         href:'/marketplace', icon:ShoppingBag,  color:'text-primary-500' },
  { title:'MRV Pipeline',      desc:'AI satellite validation',                  href:'/mrv',         icon:FileCheck,    color:'text-amber-400'   },
  { title:'Ledger',            desc:'On-chain retirement records',               href:'/ledger',      icon:Zap,          color:'text-blue-400'    },
  { title:'Carbon Calculator', desc:'Calculate your carbon footprint',          href:'/calculator',  icon:Calculator,   color:'text-purple-400'  },
  { title:'Pricing',           desc:'Transaction fees & subscriptions',         href:'/pricing',     icon:DollarSign,   color:'text-green-400'   },
  { title:'About',             desc:'Mission, team & values',                   href:'/about',       icon:Info,         color:'text-blue-400'    },
  { title:'Blog',              desc:'Carbon science & market insights',         href:'/blog',        icon:BookOpen,     color:'text-pink-400'    },
  { title:'Feedback',          desc:'Submit reviews & feature requests',        href:'/feedback',    icon:MessageSquare,color:'text-amber-400'   },
  { title:'Contact',           desc:'Get in touch with our team',               href:'/contact',     icon:Mail,         color:'text-red-400'     },
  { title:'Profile',           desc:'Account details & purchase history',       href:'/profile',     icon:User,         color:'text-purple-400'  },
]

export function GlobalSearch() {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const router            = useRouter()
  const inputRef          = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(v => !v) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100) }, [open])

  const projectResults = AI_PROJECTS.map(p => ({
    title: p.name,
    desc: `${p.location} · $${p.pricePerTon}/ton · ${p.status.toUpperCase()}`,
    href: '/marketplace',
    icon: Leaf,
    color: p.status === 'active' ? 'text-primary-500' : 'text-[var(--text-muted)]',
    isProject: true,
  }))

  const q = query.toLowerCase().trim()
  const pageResults = PAGES.filter(r => !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
  const projResults = projectResults.filter(r => !q || r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))

  const nav = (href: string) => { router.push(href); setOpen(false); setQuery('') }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500 hover:text-primary-500 transition-colors text-xs"
        aria-label="Search (Ctrl+K)">
        <Search className="w-3.5 h-3.5"/>
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden sm:inline text-[9px] bg-[var(--border)] px-1 py-0.5 rounded font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setOpen(false)}/>
            <motion.div
              className="fixed top-[8%] left-1/2 -translate-x-1/2 z-[201] w-[calc(100vw-24px)] sm:w-[580px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
              initial={{opacity:0,y:-20,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
              exit={{opacity:0,y:-20,scale:0.96}} transition={{type:'spring',stiffness:400,damping:30}}>

              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0"/>
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                  placeholder="Search pages, projects, features…"
                  className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"/>
                <div className="flex items-center gap-2 shrink-0">
                  {query && <button onClick={() => setQuery('')} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X className="w-4 h-4"/></button>}
                  <kbd className="text-[10px] bg-[var(--border)] text-[var(--text-muted)] px-1.5 py-0.5 rounded font-mono">ESC</kbd>
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[55vh] overflow-y-auto">
                {pageResults.length === 0 && projResults.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[var(--text-muted)]">No results for "{query}"</div>
                ) : (
                  <>
                    {pageResults.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-4 py-2 bg-[var(--bg)]">Pages</p>
                        {pageResults.map((r, i) => (
                          <button key={i} onClick={() => nav(r.href)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors text-left group">
                            <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center shrink-0 ${r.color}`}>
                              <r.icon className="w-4 h-4"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text)]">{r.title}</p>
                              <p className="text-xs text-[var(--text-muted)] truncate">{r.desc}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                          </button>
                        ))}
                      </div>
                    )}
                    {projResults.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-4 py-2 bg-[var(--bg)] border-t border-[var(--border)]">Projects</p>
                        {projResults.map((r, i) => (
                          <button key={i} onClick={() => nav(r.href)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--border)] transition-colors text-left group">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                              <r.icon className="w-4 h-4 text-primary-500"/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text)]">{r.title}</p>
                              <p className="text-xs text-[var(--text-muted)] truncate">{r.desc}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[10px] text-[var(--text-muted)] bg-[var(--bg)]">
                <span className="flex items-center gap-1"><kbd className="bg-[var(--border)] px-1 py-0.5 rounded font-mono">↵</kbd>Select</span>
                <span className="flex items-center gap-1"><kbd className="bg-[var(--border)] px-1 py-0.5 rounded font-mono">ESC</kbd>Close</span>
                <span className="ml-auto">CarbonX Search</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
