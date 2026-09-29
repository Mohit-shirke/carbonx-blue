'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, Car, Plane, Zap, Home, ShoppingCart,
  Utensils, TreePine, ArrowRight, RotateCcw, Sparkles,
  ShieldCheck, Leaf, TrendingDown
} from 'lucide-react'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'

const CATEGORIES = [
  { id:'car',      label:'Car Travel',       icon:Car,         unit:'km/yr',    placeholder:'12000', factor:0.21,     color:'text-blue-400', bg:'bg-blue-500/10' },
  { id:'flights',  label:'Commercial Air',   icon:Plane,       unit:'hrs/yr',   placeholder:'8',     factor:255,      color:'text-purple-400', bg:'bg-purple-500/10' },
  { id:'electric', label:'Grid Electricity', icon:Zap,         unit:'kWh/mo',   placeholder:'350',   factor:0.82,     color:'text-amber-400', bg:'bg-amber-500/10' },
  { id:'home',     label:'Cooking Gas (LPG)',icon:Home,        unit:'cyl/mo',   placeholder:'1',     factor:28.5,     color:'text-red-400', bg:'bg-red-500/10' },
  { id:'shopping', label:'Retail Spending',  icon:ShoppingCart,unit:'₹/mo',     placeholder:'15000', factor:0.00055,  color:'text-pink-400', bg:'bg-pink-500/10' },
  { id:'diet',     label:'Dietary Pattern',  icon:Utensils,    unit:'meals/day',placeholder:'3',     factor:365*2.5,  color:'text-emerald-400', bg:'bg-emerald-500/10' },
]

const PROJECTS = [
  { name:'Pichavaram Mangrove Block', price:19.75, location:'Tamil Nadu' },
  { name:'Bhitarkanika Coastal Forest', price:22.00, location:'Odisha' },
  { name:'Sundarbans Mangrove Reserve', price:28.50, location:'West Bengal' },
  { name:'Godavari Delta Reserve', price:31.00, location:'Andhra Pradesh' },
]

function calcKg(id:string, val:number, factor:number): number {
  if(id==='car')      return val*factor
  if(id==='flights')  return val*factor
  if(id==='electric') return val*12*factor
  if(id==='home')     return val*12*factor
  if(id==='shopping') return val*12*factor
  if(id==='diet')     return factor
  return 0
}

export default function CalculatorPage() {
  const [values, setValues] = useState<Record<string,string>>({ car:'10000', electric:'250', diet:'3' })
  const [step, setStep]     = useState<'input'|'result'>('input')

  const totalKg = CATEGORIES.reduce((sum,cat) => sum + calcKg(cat.id, parseFloat(values[cat.id]||'0')||0, cat.factor), 0)
  const totalTons = totalKg / 1000
  const breakdown = CATEGORIES.map(cat => {
    const kg = calcKg(cat.id, parseFloat(values[cat.id]||'0')||0, cat.factor)
    return { ...cat, kg, pct: totalKg > 0 ? (kg/totalKg)*100 : 0 }
  }).filter(c => c.kg > 0).sort((a,b) => b.kg - a.kg)

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              GHG Protocol Scope 1, 2 & 3 Household & Enterprise Factors
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Carbon Footprint Engine
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Calculate your personal or enterprise annual CO₂e footprint and seamlessly offset via verified Indian blue carbon mangrove pools.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-right">
              <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Global Benchmark</p>
              <p className="text-sm font-bold font-mono text-[var(--text)]">4.70 tCO₂e / person</p>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* 6 Category Input Cards with 21st.dev Spotlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat, i) => (
                  <SpotlightCard key={cat.id} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl ${cat.bg} flex items-center justify-center ${cat.color} shrink-0`}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text)]">{cat.label}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Unit: {cat.unit}</p>
                      </div>
                    </div>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        min="0"
                        value={values[cat.id] || ''}
                        onChange={e => setValues(v => ({ ...v, [cat.id]: e.target.value }))}
                        placeholder={cat.placeholder}
                        className="w-full px-3.5 py-2.5 pr-16 rounded-xl text-sm font-mono bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] font-mono">
                        {cat.unit}
                      </span>
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              {/* Bottom Total & Calculate Trigger */}
              <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Live Estimated Carbon Footprint</p>
                  <p className="text-3xl font-extrabold text-primary-500 font-mono mt-0.5">
                    {totalTons.toFixed(2)} <span className="text-sm font-normal text-[var(--text)]">tCO₂e / year</span>
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    India national average: ~1.90 tCO₂e · Global target: &lt;2.00 tCO₂e
                  </p>
                </div>

                <button
                  onClick={() => setStep('result')}
                  disabled={totalTons === 0}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <span>View Impact & Offset Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-6"
            >
              {/* Results Hero Card with BorderBeam */}
              <div className="relative rounded-3xl border border-primary-500/40 bg-[var(--card)] p-6 sm:p-8 shadow-2xl overflow-hidden">
                <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={2} />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Your Calculated Annual Emissions
                    </p>
                    <p className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] font-mono mt-1">
                      {totalTons.toFixed(2)} <span className="text-lg text-primary-500 font-sans">tCO₂e</span>
                    </p>
                    <p className={`text-xs mt-2 font-semibold flex items-center gap-1.5 ${totalTons > 4.7 ? 'text-amber-400' : 'text-primary-500'}`}>
                      <Leaf className="w-4 h-4" />
                      {totalTons > 4.7
                        ? `${(totalTons - 4.7).toFixed(1)} tCO₂e above global average`
                        : `${(4.7 - totalTons).toFixed(1)} tCO₂e below global average`}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
                    {[
                      { label: 'Mangrove Trees', value: Math.round(totalTons * 4.8).toLocaleString() },
                      { label: 'Flights Equiv', value: (totalTons * 0.5).toFixed(1) },
                      { label: 'Car Km Equiv', value: Math.round(totalTons * 4760).toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[var(--bg)] rounded-2xl p-3 border border-[var(--border)]">
                        <p className="text-lg font-bold font-mono text-[var(--text)]">{value}</p>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emissions Breakdown Progress Bars */}
              {breakdown.length > 0 && (
                <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
                    Source Attribution Breakdown
                  </h3>
                  <div className="space-y-3">
                    {breakdown.map(cat => (
                      <div key={cat.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-[var(--text)] font-medium">
                            <cat.icon className={`w-3.5 h-3.5 ${cat.color}`} />
                            {cat.label}
                          </span>
                          <span className="font-mono font-bold text-[var(--text)]">
                            {(cat.kg / 1000).toFixed(2)} tCO₂e ({cat.pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${cat.pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Blue Carbon Offset Projects */}
              <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text)]">Offset Your Carbon Footprint</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Instant retirement of {totalTons.toFixed(2)} tCO₂e across verified Indian blue carbon basins.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROJECTS.map(p => (
                    <SpotlightCard key={p.name} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[var(--text)]">{p.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{p.location} · ${p.price}/ton</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold font-mono text-primary-500">
                          ${(totalTons * p.price).toFixed(2)}
                        </p>
                        <p className="text-[9px] text-[var(--text-muted)]">Full Offset Cost</p>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/marketplace" className="flex-1">
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer">
                      <TreePine className="w-4 h-4" />
                      <span>Purchase & Retire Verified Credits</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => { setStep('input') }}
                    className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500 font-semibold py-3 px-6 rounded-2xl text-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recalculate Inputs</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
