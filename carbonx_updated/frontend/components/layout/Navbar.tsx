'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Leaf, Menu, X, BarChart2, ShoppingBag, FileCheck, Zap, DollarSign, Info, Mail, User, BookOpen, MessageSquare, Calculator, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/hooks/useTheme'
import { WalletConnectButton } from '@/components/web3/WalletConnectButton'
import { GlobalSearch } from '@/components/ui/GlobalSearch'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href:'/dashboard',   label:'Dashboard',   icon:BarChart2   },
  { href:'/marketplace', label:'Marketplace', icon:ShoppingBag },
  { href:'/mrv',         label:'MRV',         icon:FileCheck   },
  { href:'/ledger',      label:'Ledger',       icon:Zap         },
  { href:'/pricing',     label:'Pricing',      icon:DollarSign  },
]

const MORE_LINKS = [
  { href:'/calculator', label:'Carbon Calculator', icon:Calculator  },
  { href:'/blog',       label:'Blog',              icon:BookOpen    },
  { href:'/feedback',   label:'Feedback',          icon:MessageSquare },
  { href:'/about',      label:'About',             icon:Info        },
  { href:'/contact',    label:'Contact',           icon:Mail        },
  { href:'/profile',    label:'My Profile',        icon:User        },
]

export function Navbar() {
  const { theme, toggleTheme, isAutoMode } = useTheme()
  const [open, setOpen]         = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-full flex items-center justify-between gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
            <motion.div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-500 flex items-center justify-center"
              whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
              <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"/>
            </motion.div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[var(--text)]">
              Carbon<span className="text-primary-500">X</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label, icon:Icon }) => {
              const active = pathname?.startsWith(href)
              return (
                <Link key={href} href={href} className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
                )}>
                  <Icon className="w-3.5 h-3.5"/>{label}
                </Link>
              )
            })}

            {/* More dropdown */}
            <div className="relative">
              <button onClick={() => setMoreOpen(v => !v)}
                className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  MORE_LINKS.some(l => pathname?.startsWith(l.href))
                    ? 'bg-primary-500/10 text-primary-500'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]')}>
                More <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', moreOpen && 'rotate-180')}/>
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <>
                    <motion.div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)}/>
                    <motion.div
                      initial={{opacity:0,y:6,scale:0.97}} animate={{opacity:1,y:0,scale:1}}
                      exit={{opacity:0,y:6,scale:0.97}} transition={{duration:0.15}}
                      className="absolute right-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-20">
                      {MORE_LINKS.map(({ href, label, icon:Icon }) => (
                        <Link key={href} href={href} onClick={() => setMoreOpen(false)}
                          className={clsx('flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                            pathname?.startsWith(href) ? 'text-primary-500 bg-primary-500/5' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]')}>
                          <Icon className="w-4 h-4 shrink-0"/>{label}
                        </Link>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">
            {/* Global Search */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>

            {/* Theme toggle */}
            <motion.button onClick={toggleTheme} aria-label="Toggle theme"
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] hover:border-primary-500 transition-colors"
              whileHover={{scale:1.015}} whileTap={{scale:0.975}}>
              <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark'
                  ? <motion.span key="moon" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.2}}><Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></motion.span>
                  : <motion.span key="sun"  initial={{rotate:90,opacity:0}}  animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.2}}><Sun  className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></motion.span>
                }
              </AnimatePresence>
              {isAutoMode && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary-500"/>}
            </motion.button>

            {/* Wallet */}
            <div className="hidden sm:block" data-tour="wallet">
              <WalletConnectButton compact/>
            </div>

            {/* Hamburger */}
            <motion.button className="lg:hidden w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]"
              onClick={() => setOpen(v => !v)} whileTap={{scale:0.95}} aria-label="Menu">
              {open ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setOpen(false)}/>
            <motion.div
              className="fixed top-14 left-0 right-0 bottom-0 z-40 lg:hidden bg-[var(--card)] border-t border-[var(--border)] flex flex-col overflow-y-auto"
              initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
              {/* Mobile search */}
              <div className="p-4 border-b border-[var(--border)]">
                <GlobalSearch/>
              </div>
              <div className="flex-1 p-3 space-y-0.5">
                {[...NAV_LINKS, ...MORE_LINKS].map(({ href, label, icon:Icon }) => {
                  const active = pathname?.startsWith(href)
                  return (
                    <Link key={href} href={href} onClick={() => setOpen(false)}
                      className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                        active ? 'bg-primary-500/10 text-primary-500' : 'text-[var(--text)] hover:bg-[var(--border)]')}>
                      <Icon className="w-5 h-5 shrink-0"/>{label}
                    </Link>
                  )
                })}
              </div>
              <div className="p-4 border-t border-[var(--border)]" data-tour="wallet">
                <WalletConnectButton/>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
