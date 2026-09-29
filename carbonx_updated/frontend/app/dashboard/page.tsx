'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, TrendingUp, Leaf, Globe, Zap, RefreshCw, Satellite,
  Layers, ShieldCheck, ArrowRight, Sparkles, ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { MangroveMap } from '@/components/dashboard/MangroveMap'
import { TransactionTicker } from '@/components/dashboard/TransactionTicker'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { AuthGate } from '@/components/auth/AuthGate'

const KPI_CARDS = [
  { label: 'Total Credits Issued', value: '142,925', unit: 'tCO₂e', icon: Leaf, delta: '+14.8%', color: 'text-primary-500', desc: 'Sentinel-2 satellite verified' },
  { label: 'Credits Retired & Burned', value: '38,450', unit: 'tCO₂e', icon: Zap, delta: '+12.1%', color: 'text-blue-400', desc: 'Irreversible address(0) sink' },
  { label: 'Protected Wetland Area', value: '24,800', unit: 'hectares', icon: Globe, delta: '+4 basins', color: 'text-emerald-400', desc: 'Sundarbans, Godavari, Andaman' },
  { label: 'Avg Canopy NDVI Index', value: '0.84', unit: 'score', icon: Activity, delta: '+0.04', color: 'text-purple-400', desc: 'Dense vegetation index' },
]

export default function DashboardPage() {
  const [blockHeight, setBlockHeight] = useState(8824401)
  const [gasPrice, setGasPrice] = useState(32)

  useEffect(() => {
    const timer = setInterval(() => {
      setBlockHeight(b => b + 1)
      setGasPrice(Math.floor(28 + Math.random() * 8))
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <AuthGate
      pageTitle="Environmental Command Center"
      description="Access to the live environmental command center and real-time on-chain portfolio telemetry requires an authenticated CarbonX organization or individual account."
    >
      <div className="relative min-h-screen pb-16 overflow-hidden">
        {/* 21st.dev Ambient Matrix Grid Background */}
        <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Page Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Live Telemetry Stream · Polygon PoS Mainnet
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Environmental Command Center
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Real-time geospatial monitoring, Copernicus Sentinel-2 satellite feeds, and immutable Polygon on-chain retirement telemetry for India&apos;s blue carbon ecosystems.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/ledger"
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span>Retire Credits</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-primary-500/50 text-[var(--text)] text-sm font-semibold shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span>Explore Marketplace</span>
            </Link>
          </div>
        </div>

        {/* Live Network & Satellite Telemetry Ticker Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[var(--card)]/60 border border-[var(--border)] text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-[var(--border)]/60">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Polygon Block</p>
              <p className="font-mono font-bold text-[var(--text)]">#{blockHeight.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-[var(--border)]/60">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Gas Price</p>
              <p className="font-mono font-bold text-[var(--text)]">{gasPrice} Gwei</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5 border-r border-[var(--border)]/60">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Satellite Feed</p>
              <p className="font-mono font-bold text-emerald-400">Sentinel-2 Orbit</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
            <div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase font-semibold">Integrity</p>
              <p className="font-mono font-bold text-primary-500">100% Audited</p>
            </div>
          </div>
        </div>

        {/* KPI Row (4 SpotlightCards with spring motion) */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <SpotlightCard className="p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center ${kpi.color}`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-primary-500 bg-primary-500/10 border border-primary-500/20 px-2.5 py-0.5 rounded-full">
                      {kpi.delta}
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-[var(--text)] font-mono tracking-tight">{kpi.value}</p>
                  <p className="text-xs font-semibold text-[var(--text)] mt-1">{kpi.label}</p>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border)]/50">
                  {kpi.desc}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid: Geospatial Map + Live Ledger Ticker */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Geospatial Map – 2/3 column with border styling */}
          <div className="xl:col-span-2 rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl p-5 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-500" />
                <h2 className="text-base font-bold text-[var(--text)]">High-Resolution Mangrove Basins</h2>
              </div>
              <span className="text-xs text-[var(--text-muted)]">Sentinel-2 Optical & SAR</span>
            </div>
            <MangroveMap />
          </div>

          {/* Transaction Ticker – 1/3 column */}
          <div className="xl:col-span-1 rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl p-5 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-[var(--text)]">On-Chain Stream</h2>
              </div>
              <span className="text-[10px] text-primary-500 font-mono font-bold bg-primary-500/10 px-2 py-0.5 rounded">
                POLYGON 137
              </span>
            </div>
            <TransactionTicker />
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  )
}
