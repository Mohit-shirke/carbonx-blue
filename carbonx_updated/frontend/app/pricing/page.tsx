'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Building2, DollarSign, Globe, Shield, BarChart2, Leaf, Sparkles, ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'

const PLANS = [
  {
    name: 'Starter', icon: Leaf, price: 99, color: 'text-primary-500', bg: 'bg-primary-500/10',
    desc: 'For early-stage sustainability teams and SMEs beginning their net-zero journey.',
    cta: 'Get Started', ctaHref: '/auth',
    features: ['Up to 500 tCO₂e/month', 'Basic ISO/GHG reports (PDF)', 'Full access to active projects', 'Standard email support', 'On-chain retirement certificates']
  },
  {
    name: 'Pro', icon: Zap, price: 499, color: 'text-blue-400', bg: 'bg-blue-500/10', highlight: true,
    desc: 'For mid-market enterprises requiring high-volume retirements and automated audit trails.',
    cta: 'Start Free Trial', ctaHref: '/auth',
    features: ['Up to 5,000 tCO₂e/month', 'Advanced Scope 1, 2 & 3 reporting', 'Full REST & Webhook API access', 'Priority 24hr engineering support', 'Bulk token purchase discounts', 'Sentinel-2 NDVI raw analytics', 'Custom on-chain retirement notes']
  },
  {
    name: 'Enterprise', icon: Building2, price: 2000, color: 'text-amber-400', bg: 'bg-amber-500/10',
    desc: 'For global conglomerates, ESG funds, and sovereign climate initiatives.',
    cta: 'Contact Sales', ctaHref: 'mailto:sales@carbonx.app',
    ctaExternal: true,
    features: ['Unlimited monthly retirements', 'Custom multi-standard ESG suite', 'Dedicated high-throughput RPC', 'Dedicated climate account director', 'SLA 99.99% smart contract uptime', 'White-label retirement certificates', 'Global carbon data licensing']
  },
]

const OTHER = [
  { icon: Globe, title: 'Project Listing Protocol', who: 'NGOs & Restoration Trusts', price: '$500–$2,000', desc: 'One-time onboarding fee for satellite boundary mapping and tenure audit.' },
  { icon: Shield, title: 'MRV Validation Run', who: 'Accredited ACVA Validators', price: '$100–$500 / run', desc: 'Automated Copernicus Sentinel-2 multispectral pipeline execution and verification.' },
  { icon: BarChart2, title: 'Carbon Data Licensing', who: 'ESG Funds & Researchers', price: '$5,000–$50,000', desc: 'Enterprise data feed licensing for canopy NDVI, biomass density, and permanence indices.' },
]

const EXAMPLES = [
  { tons: 10, project: 'Pichavaram Mangrove', price: 19.75 },
  { tons: 100, project: 'Sundarbans Reserve', price: 28.50 },
  { tons: 1000, project: 'Godavari Delta Basin', price: 31.00 },
]

export default function PricingPage() {
  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-10 sm:space-y-14">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Transparent, Zero-Spread Carbon Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Honest, Predictable Pricing
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Zero platform fees for Web3 transactions. Direct capital flows to verified coastal restoration communities and satellite MRV infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-right">
              <p className="text-[11px] uppercase font-semibold text-[var(--text-muted)]">Web3 Fee</p>
              <p className="text-sm font-bold font-mono text-emerald-400">0% Platform Fee</p>
            </div>
          </div>
        </div>

        {/* Transaction Fee Banner */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-bold text-[var(--text)]">Standard 2.9% Card Fee · Zero Web3 Fee</h2>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                Card checkouts via Stripe incur standard payment processor fees. Direct Polygon Web3 wallet payments pay zero platform fee.
              </p>
            </div>
            <div className="shrink-0 bg-primary-500/10 border border-primary-500/20 rounded-2xl px-5 py-2.5 text-center">
              <p className="text-2xl font-bold font-mono text-primary-500">2.9%</p>
              <p className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Card only</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {EXAMPLES.map(ex => {
              const sub = ex.tons * ex.price
              const fee = sub * 0.029
              return (
                <div key={ex.project} className="bg-[var(--bg)] rounded-2xl p-4 border border-[var(--border)]">
                  <p className="text-sm font-bold text-[var(--text)] mb-2">{ex.tons} tCO₂e · {ex.project}</p>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Token Subtotal</span>
                      <span>${sub.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-muted)]">
                      <span>Card Gateway Fee</span>
                      <span>${fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-[var(--border)] pt-1 text-[var(--text)]">
                      <span>Total</span>
                      <span className="text-primary-500">${(sub + fee).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Corporate Subscription Plans */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)] tracking-tight">Corporate Subscription Plans</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              For organizations requiring programmatic API streaming, custom ESG disclosures, and high-volume retirement reserves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => {
              const isHighlight = plan.highlight

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative rounded-3xl border flex flex-col justify-between p-6 transition-all bg-[var(--card)]/90 shadow-xl overflow-hidden ${
                    isHighlight ? 'border-blue-500/60 shadow-blue-500/10' : 'border-[var(--border)] hover:border-primary-500/40'
                  }`}
                >
                  {isHighlight && (
                    <BorderBeam size={240} duration={8} colorFrom="#3B82F6" colorTo="#10B981" borderWidth={2} />
                  )}

                  <div>
                    {isHighlight && (
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500 text-white uppercase tracking-wider inline-block mb-3 shadow-sm">
                        Most Popular
                      </span>
                    )}
                    <div className={`w-10 h-10 rounded-2xl ${plan.bg} flex items-center justify-center mb-3 ${plan.color}`}>
                      <plan.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text)]">{plan.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1 min-h-[40px]">{plan.desc}</p>
                    <div className="flex items-baseline gap-1 my-4">
                      <span className="text-4xl font-extrabold font-mono text-[var(--text)]">${plan.price}</span>
                      <span className="text-sm text-[var(--text-muted)] font-medium">/ month</span>
                    </div>

                    <ul className="space-y-2.5 pt-2 border-t border-[var(--border)]/60 mb-6" role="list">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                          <Check className={`w-4 h-4 ${plan.color} shrink-0 mt-0.5`} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ── CTA button — correctly labeled per destination ── */}
                  {plan.ctaExternal ? (
                    <a
                      href={plan.ctaHref}
                      className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        isHighlight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                          : 'bg-[var(--bg)] border border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{plan.cta}</span>
                    </a>
                  ) : (
                    <Link href={plan.ctaHref} className="w-full">
                      <button className={`w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                        isHighlight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                          : 'bg-[var(--bg)] border border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500'
                      }`}>
                        <span>{plan.cta}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Other Ecosystem Revenue Streams */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">Ecosystem Platform Services</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">Transparent protocol pricing for validators, project listing, and research partners.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {OTHER.map(({ icon: Icon, title, who, price, desc }) => (
              <SpotlightCard key={title} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text)]">{title}</h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Audience: {who}</p>
                  <p className="text-base font-bold font-mono text-primary-500 my-2">{price}</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* Always Free Registry Tier */}
        <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-[var(--text)]">Always Free for Individuals & Community Members</h2>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {['Account creation', 'Explore all projects', 'Inspect public ledger', 'Mira AI Assistant', 'Copernicus NDVI telemetry', 'Carbon Footprint Engine'].map(f => (
              <span key={f} className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-500 text-sm font-semibold px-3 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span>{f}</span>
              </span>
            ))}
          </div>
          <div className="pt-2">
            <Link href="/auth">
              <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold px-7 py-3 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
                Create Free CarbonX Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
