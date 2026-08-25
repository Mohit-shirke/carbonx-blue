'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Leaf, Shield, Satellite, Zap, Globe, Lock,
  DollarSign, Play, CheckCircle, Star, TrendingUp, Users,
  Award, ExternalLink, ChevronDown
} from 'lucide-react'

// ── Animated counter hook ────────────────────────────────────────
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return { count, ref }
}

// ── Stat card with animated counter ─────────────────────────────
function StatCard({ value, label, prefix = '', suffix = '', color }: { value: number; label: string; prefix?: string; suffix?: string; color: string }) {
  const { count, ref } = useCounter(value)
  return (
    <div ref={ref} className="text-center">
      <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${color}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  )
}

const FEATURES = [
  { icon: Satellite, title: 'AI Satellite MRV',       desc: 'Copernicus Sentinel-2 at 10m/px. NDVI biomass index validated automatically — no manual auditors.',         color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  { icon: Shield,    title: 'Triple-Certified',        desc: 'Verra VCS, CCTS, and Gold Standard badges. All projects verified before a single token is minted.',          color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { icon: Zap,       title: 'ERC-1155 On-Chain',       desc: 'Every credit is a fungible token on Polygon. Transparent, tradeable, and permanently retirable.',            color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  { icon: Globe,     title: 'Blue Carbon Focus',       desc: 'Mangroves store 3–5× more carbon than forests. We target India\'s most threatened coastal ecosystems.',       color: 'text-teal-400',    bg: 'bg-teal-500/10'    },
  { icon: Lock,      title: 'Immutable Ledger',        desc: 'Retired credits burn to address(0). The on-chain record is public, tamper-proof, and auditable forever.',     color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
  { icon: DollarSign,title: 'Transparent Pricing',     desc: 'No hidden fees. 2.9% on card payments only. Web3/MATIC purchases pay zero platform fee.',                     color: 'text-green-400',   bg: 'bg-green-500/10'   },
]

const STEPS = [
  { n: '01', title: 'NGO Proposes',   desc: 'NGO submits GPS coordinates, area data, and ecosystem type for a coastal project.'         },
  { n: '02', title: 'AI Validates',   desc: 'Our pipeline downloads Sentinel-2 imagery, computes NDVI, and verifies sequestration rate.' },
  { n: '03', title: 'Credits Minted', desc: 'Upon verification, ERC-1155 tokens are minted on Polygon — one token per tonne of CO₂e.'   },
  { n: '04', title: 'Buy & Retire',   desc: 'Corporates buy credits via MATIC or card. Retiring burns tokens — creating a permanent offset certificate.' },
]

const TESTIMONIALS = [
  { name: 'Ravi Menon',     role: 'ESG Director, TechCorp India',       rating: 5, text: 'CarbonX is the only registry where I can verify every credit on a blockchain explorer. The satellite NDVI data gives us full confidence in the carbon claims.'        },
  { name: 'Dr. Anita Rao',  role: 'Climate Scientist, IISc Bengaluru',  rating: 5, text: 'The Sentinel-2 MRV pipeline is genuinely innovative. It automates what used to take months of field surveys. This is the future of carbon verification.'              },
  { name: 'James Wu',       role: 'Carbon Fund Manager, Singapore',     rating: 5, text: 'We moved our entire blue carbon portfolio to CarbonX. The on-chain transparency and ERC-1155 standard make auditing trivial. Excellent platform.'                      },
]

const PARTNERS = ['Verra', 'CCTS', 'Gold Standard', 'Polygon', 'Stripe', 'ESA Copernicus']

export default function HomePage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-[var(--bg)] to-blue-900/10 pointer-events-none"/>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-primary-500/5"
              style={{ width: 200 + i * 120, height: 200 + i * 120, left: `${(i * 31) % 90}%`, top: `${(i * 47) % 80}%` }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6 + i * 0.8, repeat: Infinity, delay: i * 0.5 }}/>
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-500 bg-primary-500/10 border border-primary-500/30 px-4 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"/>
              Live on Polygon Amoy · 23,400 tCO₂e Available
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--text)] leading-[1.1] tracking-tight">
            The World's First<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">
              AI-Verified Blue Carbon
            </span><br/>
            Registry
          </motion.h1>

          {/* Subheadline */}
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Satellite-verified carbon credits as ERC-1155 tokens on Polygon. No greenwashing. No spreadsheets. Just immutable on-chain proof.
          </motion.p>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/marketplace">
              <motion.button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-primary-500/25"
                whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(16,185,129,0.4)' }} whileTap={{ scale: 0.97 }}>
                Explore Marketplace <ArrowRight className="w-4 h-4"/>
              </motion.button>
            </Link>
            <Link href="/auth">
              <motion.button className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500 font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                Create Free Account
              </motion.button>
            </Link>
            <Link href="/calculator">
              <motion.button className="w-full sm:w-auto flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-primary-500 font-medium px-4 py-3.5 rounded-xl text-sm transition-all"
                whileHover={{ scale: 1.02 }}>
                Calculate Your Footprint →
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
            {[
              { icon: Shield,       text: 'Verra & CCTS Certified'    },
              { icon: CheckCircle,  text: 'Satellite Verified'         },
              { icon: Lock,         text: 'On-Chain Transparent'       },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Icon className="w-3.5 h-3.5 text-primary-500 shrink-0"/>{text}
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5 text-[var(--text-muted)]"/>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE STATS ────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-y border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <StatCard value={23400}  label="tCO₂e Available"       suffix="+"  color="text-primary-500"/>
            <StatCard value={4}      label="Verified Projects"      prefix=""   color="text-blue-400"   />
            <StatCard value={89320}  label="Credits Minted"         suffix="+"  color="text-amber-400"  />
            <StatCard value={24500}  label="Tons Offset"            suffix="+"  color="text-teal-400"   />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 sm:mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">How It Works</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mt-2">From Mangrove to Token in 4 Steps</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} className="relative card p-5 sm:p-6"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <div className="text-4xl sm:text-5xl font-black text-primary-500/15 mb-3 leading-none">{s.n}</div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--text)] mb-2">{s.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
              {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-primary-500/30"/>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div className="text-center mb-10 sm:mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Why CarbonX</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mt-2">Built for the Next Generation of Carbon Markets</h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Every design decision prioritises trust, transparency, and scientific rigour.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div key={title} className="card p-5 sm:p-6 group"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${color}`}/>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--text)] mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-10 sm:mb-14" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Testimonials</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-2">Trusted by Climate Leaders</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} className="card p-5 sm:p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400"/>)}
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed flex-1 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-500">{t.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">{t.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ──────────────────────────────────────── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-7">Powered by & Certified by</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {PARTNERS.map((p, i) => (
              <motion.div key={p} className="px-4 sm:px-6 py-2 sm:py-3 card text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500/40 transition-colors cursor-default"
                initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                {p}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────── */}
      <section className="py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="relative card p-8 sm:p-12 text-center overflow-hidden"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 pointer-events-none"/>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto mb-5">
                <Leaf className="w-7 h-7 text-white"/>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)] mb-3">
                Start Offsetting Your Carbon Footprint Today
              </h2>
              <p className="text-[var(--text-muted)] text-sm sm:text-base mb-7 max-w-xl mx-auto leading-relaxed">
                Join thousands of NGOs, validators, and corporate buyers on the world's most transparent blue carbon registry.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth">
                  <motion.button className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all w-full sm:w-auto"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(16,185,129,0.4)' }} whileTap={{ scale: 0.97 }}>
                    Create Free Account <ArrowRight className="w-4 h-4"/>
                  </motion.button>
                </Link>
                <Link href="/marketplace">
                  <motion.button className="flex items-center justify-center gap-2 border-2 border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500 font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    Browse Projects
                  </motion.button>
                </Link>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-4">No credit card required · Free to browse · 2.9% fee on purchases only</p>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
