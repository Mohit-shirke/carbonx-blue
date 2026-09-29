'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Leaf, Shield, Satellite, Zap, Globe, Lock,
  DollarSign, CheckCircle, Star, Sparkles, ChevronDown,
  Layers, TreeDeciduous, Award, ArrowUpRight
} from 'lucide-react'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'

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
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])
  return { count, ref }
}

// ── Stat card with animated counter & 21st.dev Spotlight ───────────
function StatCard({ value, label, prefix = '', suffix = '', color, icon: Icon }: { value: number; label: string; prefix?: string; suffix?: string; color: string; icon: any }) {
  const { count, ref } = useCounter(value)
  return (
    <SpotlightCard className="p-5 text-center flex flex-col items-center justify-center">
      <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div ref={ref}>
        <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono tracking-tight ${color}`}>
          {prefix}{count.toLocaleString()}{suffix}
        </p>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">{label}</p>
      </div>
    </SpotlightCard>
  )
}

const FEATURES = [
  { icon: Satellite, title: 'AI Satellite MRV', desc: 'Copernicus Sentinel-2 at 10m/px. NDVI biomass index validated automatically with zero manual bias.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Shield, title: 'Triple-Certified Standards', desc: 'Verra VCS, India CCTS, and Gold Standard alignment. Every project verified before a single token is minted.', color: 'text-primary-500', bg: 'bg-primary-500/10' },
  { icon: Zap, title: 'Polygon ERC-1155 On-Chain', desc: 'Every blue carbon credit is an audited fungible token on Polygon Mainnet (Chain 137). Liquid, tradeable, and retirable.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Globe, title: 'Blue Carbon Density', desc: 'Mangrove deltas sequester 3–5× more carbon per hectare than terrestrial rainforests, protecting coastal biodiversity.', color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { icon: Lock, title: 'Immutable Proof-of-Burn', desc: 'Retired credits permanently burn to address(0). The Merkle cryptographic audit trail is verifiable on Polygonscan forever.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: DollarSign, title: 'Zero Platform Fee on Web3', desc: 'Pure non-custodial smart contracts. Pay standard gas on Polygon or standard 2.9% on fiat card checkouts with Stripe.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
]

const STEPS = [
  { n: '01', title: 'NGO Proposes Basin', desc: 'Project developers submit precise GPS polygonal coordinates, mangrove species, and tenure records.' },
  { n: '02', title: 'Copernicus MRV Analyzes', desc: 'Automated satellite pipeline downloads multispectral Sentinel-2 imagery, computing Band 4/8 NDVI indices.' },
  { n: '03', title: 'ERC-1155 Minting', desc: 'Upon ACVA and validator confirmation, audited smart contracts mint tokens on Polygon PoS Mainnet.' },
  { n: '04', title: 'Retire & Cryptographic Burn', desc: 'Corporates and climate funds permanently retire tokens to address(0), receiving an auditable Certificate with QR proof.' },
]

const TESTIMONIALS = [
  { name: 'Ravi Menon', role: 'ESG Director, TechCorp India', rating: 5, text: 'CarbonX is the only registry where I can verify every credit on a blockchain explorer. The satellite NDVI data gives our board full confidence in our corporate net-zero claims.' },
  { name: 'Dr. Anita Rao', role: 'Climate Scientist, IISc Bengaluru', rating: 5, text: 'The Sentinel-2 MRV pipeline is genuinely innovative. It automates what used to take months of manual field surveys with high-resolution 10m/px optical feeds.' },
  { name: 'James Wu', role: 'Carbon Fund Manager, Singapore', rating: 5, text: 'We moved our entire blue carbon portfolio to CarbonX. The on-chain transparency, Merkle-DAG proofs, and ERC-1155 tokens make ESG compliance seamless.' },
]

const PARTNERS = ['Verra VCS', 'BEE India CCTS', 'Gold Standard', 'Polygon PoS', 'Stripe Climate', 'ESA Copernicus Sentinel-2']

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center px-4 sm:px-6 pt-8 pb-16">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Mainnet Live Badge with 21st.dev BorderBeam */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block relative"
          >
            <div className="relative inline-flex items-center gap-2 text-xs font-semibold text-primary-500 bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] px-4 py-2 rounded-full shadow-lg overflow-hidden">
              <BorderBeam size={120} duration={6} colorFrom="#10B981" colorTo="#8247E5" borderWidth={1.5} />
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              <span>Live on Polygon PoS Mainnet · Chain ID: 137</span>
              <span className="hidden sm:inline text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                23,400 tCO₂e Available
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text)] leading-[1.1] tracking-tight"
          >
            The World&apos;s First<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              AI-Verified Blue Carbon
            </span><br />
            Registry
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Satellite-verified coastal wetland carbon credits tokenized on Polygon. Zero greenwashing, automated Copernicus Sentinel-2 MRV, and tamper-proof on-chain retirements.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2"
          >
            <Link href="/marketplace">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
            <Link href="/ledger">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] hover:border-primary-500/60 text-[var(--text)] hover:text-primary-500 font-semibold px-7 py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-sm cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Lock className="w-4 h-4 text-primary-500" />
                <span>On-Chain Ledger</span>
              </motion.button>
            </Link>
            <Link href="/calculator">
              <motion.button
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-primary-500 font-semibold px-5 py-3.5 rounded-2xl text-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                whileHover={{ scale: 1.02 }}
                aria-label="Navigate to Carbon Calculator"
              >
                <span>Carbon Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3"
          >
            {[
              { icon: Shield, text: 'Verra & CCTS Audited' },
              { icon: CheckCircle, text: 'Sentinel-2 Satellite MRV' },
              { icon: Lock, text: 'Non-Custodial Polygon Proofs' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)] font-medium">
                <Icon className="w-4 h-4 text-primary-500 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll down indicator */}
          <motion.div
            className="pt-8 flex flex-col items-center gap-1.5"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[11px] uppercase tracking-widest text-[var(--text-muted)] font-semibold">Explore</span>
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] opacity-80" aria-hidden="true" />
            <span className="sr-only">Scroll down to view platform telemetry</span>
          </motion.div>
        </div>
      </section>

      {/* ── LIVE STATS (21st.dev Spotlight Cards) ──────────────────── */}
      <section className="relative z-10 py-12 sm:py-16 border-y border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard value={23400} label="tCO₂e Live Available" suffix="+" color="text-primary-500" icon={Leaf} />
            <StatCard value={6} label="Verified Coastal Basins" prefix="" color="text-blue-400" icon={TreeDeciduous} />
            <StatCard value={89320} label="ERC-1155 Credits Minted" suffix="+" color="text-purple-400" icon={Layers} />
            <StatCard value={38450} label="Tons Permanently Burned" suffix="+" color="text-teal-400" icon={Award} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (21st.dev Process Flow) ──────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Architecture Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mt-3 tracking-tight">
            From Coastal Mangrove to Tokenized Credit in 4 Steps
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <SpotlightCard className="p-6 h-full flex flex-col justify-between relative group">
                <div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-primary-500/20 group-hover:text-primary-500/40 transition-colors mb-3 leading-none">
                    {s.n}
                  </div>
                  <h3 className="font-bold text-base text-[var(--text)] mb-2 group-hover:text-primary-500 transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES (21st.dev Spotlight Grid) ────────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Scientific Rigor & Web3 Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mt-3 tracking-tight">
            Built for Institutional & Scientific Trust
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            Eliminating greenwashing with multi-spectral satellite intelligence, cryptographic nonces, and public on-chain auditability.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <SpotlightCard className="p-6 h-full flex flex-col justify-between group">
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <h3 className="font-bold text-base text-[var(--text)] mb-2 group-hover:text-primary-500 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {desc}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS (21st.dev Spotlight Cards) ───────────────── */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 bg-[var(--card)]/50 border-y border-[var(--border)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">
              Industry Validation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mt-2 tracking-tight">
              Trusted by Climate Scientists & ESG Executives
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <SpotlightCard className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed italic mb-6">
                      &quot;{t.text}&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]/60">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center font-bold text-primary-500 shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text)]">{t.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS & STANDARDS ─────────────────────────────────── */}
      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">
            Standards & Infrastructure Integrations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {PARTNERS.map((p, i) => (
              <motion.div
                key={p}
                className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)]/80 text-xs font-semibold text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500/40 transition-colors shadow-sm cursor-default"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                {p}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER WITH BORDERBEAM ─────────────────────────────── */}
      <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 sm:p-14 text-center overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* 21st.dev Laser BorderBeam */}
            <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={2} />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-500 mx-auto mb-5 shadow-sm">
                <Leaf className="w-7 h-7" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight mb-3">
                Start Offsetting Your Carbon Footprint Today
              </h2>
              <p className="text-[var(--text-muted)] text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
                Join verified NGOs, international carbon validators, and corporate ESG leaders on India&apos;s premier blue carbon blockchain registry.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth">
                  <motion.button
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-xl shadow-emerald-500/25 cursor-pointer w-full sm:w-auto"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link href="/marketplace">
                  <motion.button
                    className="flex items-center justify-center gap-2 bg-[var(--bg)] border border-[var(--border)] hover:border-primary-500/60 text-[var(--text)] hover:text-primary-500 font-semibold px-8 py-3.5 rounded-2xl text-sm sm:text-base transition-all shadow-sm cursor-pointer w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>Browse Projects</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-5">
                No credit card required · Instant demo sandbox available · Polygon Mainnet (Chain 137)
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
