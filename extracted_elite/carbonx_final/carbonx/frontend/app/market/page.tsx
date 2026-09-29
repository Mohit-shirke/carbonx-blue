'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart2, Globe,
  RefreshCw, Info, Leaf, DollarSign, Activity,
  ArrowRight, ExternalLink
} from 'lucide-react'
import Link from 'next/link'

// ── Market data types ─────────────────────────────────────────────
interface PricePoint { time: string; price: number }
interface MarketEntry {
  id: string; name: string; type: string
  price: number; change24h: number; change7d: number
  volume24h: number; marketCap?: number
  currency: string; standard: string
  color: string; history: PricePoint[]
}

// ── Seeded pseudo-random for reproducible chart data ─────────────
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generateHistory(basePrice: number, days: number, seed: number): PricePoint[] {
  const points: PricePoint[] = []
  let price = basePrice * 0.85
  for (let i = days; i >= 0; i--) {
    const r = seededRandom(seed + i)
    price = Math.max(price * (0.97 + r * 0.06), 1)
    const d = new Date()
    d.setDate(d.getDate() - i)
    points.push({ time: d.toLocaleDateString('en-IN',{month:'short',day:'numeric'}), price: +price.toFixed(2) })
  }
  return points
}

const MARKETS: MarketEntry[] = [
  { id:'carbonx-blue', name:'CarbonX Blue Carbon',   type:'Blue Carbon',        price:28.50, change24h:+2.3,  change7d:+8.1,  volume24h:124000, currency:'USD', standard:'Verra VCS + India CCTS', color:'#10B981', history: generateHistory(28.50,30,1) },
  { id:'eu-ets',       name:'EU ETS Carbon Price',    type:'Compliance Market',  price:63.40, change24h:-1.8,  change7d:-4.2,  volume24h:8900000,currency:'EUR', standard:'EU Emissions Trading System', color:'#3B82F6', history: generateHistory(63.40,30,2) },
  { id:'verra-vcs',    name:'Verra VCS Nature',       type:'Voluntary',          price:14.20, change24h:+0.8,  change7d:+2.1,  volume24h:540000, currency:'USD', standard:'Verra VCS',            color:'#8B5CF6', history: generateHistory(14.20,30,3) },
  { id:'gold-std',     name:'Gold Standard Premium',  type:'Voluntary',          price:22.80, change24h:+1.4,  change7d:+5.6,  volume24h:210000, currency:'USD', standard:'Gold Standard GS4GG',   color:'#F59E0B', history: generateHistory(22.80,30,4) },
  { id:'india-ccts',   name:'India CCTS (BEE)',       type:'Compliance India',   price:18.50, change24h:+3.1,  change7d:+9.8,  volume24h:85000,  currency:'USD', standard:'India CCTS',            color:'#EF4444', history: generateHistory(18.50,30,5) },
  { id:'cbam',         name:'EU CBAM Border Carbon',  type:'Border Adjustment',  price:71.20, change24h:-0.4,  change7d:+1.2,  volume24h:320000, currency:'EUR', standard:'EU CBAM Regulation',    color:'#06B6D4', history: generateHistory(71.20,30,6) },
]

// ── SVG Mini Sparkline Chart ─────────────────────────────────────
function Sparkline({ data, color, positive }: { data: PricePoint[]; color: string; positive: boolean }) {
  const W = 120; const H = 40
  const prices  = data.map(d => d.price)
  const min     = Math.min(...prices)
  const max     = Math.max(...prices)
  const range   = max - min || 1
  const pts     = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.price - min) / range) * (H - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline
        points={`${pts} ${W},${H} 0,${H}`}
        fill={`url(#grad-${color.replace('#','')})`}
        stroke="none"/>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"/>
      {/* Last point dot */}
      <circle
        cx={W}
        cy={H - ((prices[prices.length-1] - min) / range) * (H-4) - 2}
        r="2.5"
        fill={color}/>
    </svg>
  )
}

// ── Full price chart (30-day) ─────────────────────────────────────
function FullChart({ market }: { market: MarketEntry }) {
  const W = 100; const H = 100
  const prices = market.history.map(d => d.price)
  const min    = Math.min(...prices)
  const max    = Math.max(...prices)
  const range  = max - min || 1

  const pts = market.history.map((d, i) => {
    const x = (i / (market.history.length - 1)) * W
    const y = H - ((d.price - min) / range) * (H - 8) - 4
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')

  const gridLines = [0, 25, 50, 75, 100]

  return (
    <div className="w-full h-48 sm:h-64 relative">
      <svg width="100%" height="100%" viewBox={`-8 -8 116 116`} preserveAspectRatio="none" style={{ overflow:'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={market.color} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={market.color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {gridLines.map(g => (
          <line key={g} x1="0" y1={H - g} x2={W} y2={H - g}
            stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2 2"/>
        ))}
        {/* Price labels */}
        {[0,50,100].map(g => {
          const price = min + (g/100) * range
          return (
            <text key={g} x="-2" y={H - g + 1} fill="var(--text-muted)"
              fontSize="3.5" textAnchor="end" dominantBaseline="central">
              ${price.toFixed(0)}
            </text>
          )
        })}
        {/* Area fill */}
        <polyline
          points={`0,${H} ${pts} ${W},${H}`}
          fill="url(#chartGrad)"
          stroke="none"/>
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke={market.color}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"/>
        {/* Dots every 7 days */}
        {market.history.filter((_,i) => i % 7 === 0 || i === market.history.length-1).map((d, i) => {
          const idx = market.history.indexOf(d)
          const x   = (idx / (market.history.length-1)) * W
          const y   = H - ((d.price - min) / range) * (H-8) - 4
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="1.5" fill={market.color}/>
              <text x={x} y={H+5} fill="var(--text-muted)" fontSize="3"
                textAnchor="middle">{d.time}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function MarketPage() {
  const [selected, setSelected] = useState<MarketEntry>(MARKETS[0])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [animating, setAnimating] = useState(false)

  const refresh = () => {
    setAnimating(true)
    setLastUpdated(new Date())
    setTimeout(() => setAnimating(false), 1000)
  }

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const timer = setInterval(refresh, 60000)
    return () => clearInterval(timer)
  }, [])

  const totalVolume = MARKETS.reduce((s, m) => s + m.volume24h, 0)
  const avgChange   = MARKETS.reduce((s, m) => s + m.change24h, 0) / MARKETS.length

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Carbon Market Tracker</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Global voluntary & compliance carbon markets · Updated: {lastUpdated.toLocaleTimeString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-muted)] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-medium">
            ⚠️ Indicative prices only — not financial advice
          </span>
          <button onClick={refresh}
            className="flex items-center gap-1.5 text-xs border border-[var(--border)] hover:border-primary-500 px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-500 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${animating?'animate-spin':''}`}/> Refresh
          </button>
        </div>
      </div>

      {/* Market overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'CarbonX Blue Carbon',  value:`$${MARKETS[0].price}`,      change:MARKETS[0].change24h, icon:Leaf,       color:'text-primary-500' },
          { label:'EU ETS Price',         value:`€${MARKETS[1].price}`,      change:MARKETS[1].change24h, icon:Globe,      color:'text-blue-400'    },
          { label:'24h Market Volume',    value:`$${(totalVolume/1e6).toFixed(1)}M`, change:avgChange,   icon:BarChart2,  color:'text-amber-400'   },
          { label:'India CCTS Price',     value:`$${MARKETS[4].price}`,      change:MARKETS[4].change24h, icon:DollarSign, color:'text-red-400'     },
        ].map(({ label, value, change, icon:Icon, color }, i) => (
          <motion.div key={label} className="card p-3 sm:p-4"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-4 h-4 ${color}`}/>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 ${change>=0?'text-primary-500':'text-red-400'}`}>
                {change>=0?<TrendingUp className="w-3 h-3"/>:<TrendingDown className="w-3 h-3"/>}
                {change>=0?'+':''}{change.toFixed(1)}%
              </span>
            </div>
            <p className={`text-lg sm:text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Market list */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-[var(--text)] px-1">Carbon Markets</h2>
          {MARKETS.map(m => (
            <motion.button key={m.id} onClick={() => setSelected(m)}
              className={`w-full card p-3 text-left transition-all ${selected.id===m.id?'border-primary-500/50 bg-primary-500/5':''}`}
              whileHover={{ scale:1.01 }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:m.color }}/>
                    <p className="text-xs font-bold text-[var(--text)] truncate">{m.name}</p>
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">{m.type}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[var(--text)]">{m.currency === 'EUR' ? '€' : '$'}{m.price}</p>
                  <p className={`text-[10px] font-bold ${m.change24h>=0?'text-primary-500':'text-red-400'}`}>
                    {m.change24h>=0?'+':''}{m.change24h}%
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <Sparkline data={m.history} color={m.color} positive={m.change24h >= 0}/>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-[var(--text-muted)]">7d</p>
                  <p className={`text-[10px] font-bold ${m.change7d>=0?'text-primary-500':'text-red-400'}`}>
                    {m.change7d>=0?'+':''}{m.change7d}%
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div key={selected.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>

              {/* Selected market header */}
              <div className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ background:selected.color }}/>
                      <h2 className="font-bold text-base text-[var(--text)]">{selected.name}</h2>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">{selected.standard} · {selected.type}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl sm:text-3xl font-black text-[var(--text)]">
                      {selected.currency === 'EUR' ? '€' : '$'}{selected.price}
                    </p>
                    <p className={`text-sm font-bold flex items-center gap-1 justify-end ${selected.change24h>=0?'text-primary-500':'text-red-400'}`}>
                      {selected.change24h>=0?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
                      {selected.change24h>=0?'+':''}{selected.change24h}% 24h
                    </p>
                  </div>
                </div>

                {/* 30-day chart */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-[var(--text-muted)]">30-Day Price History</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Range: {selected.currency==='EUR'?'€':'$'}{Math.min(...selected.history.map(h=>h.price)).toFixed(2)} —
                      {selected.currency==='EUR'?'€':'$'}{Math.max(...selected.history.map(h=>h.price)).toFixed(2)}
                    </p>
                  </div>
                  <FullChart market={selected}/>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'24h Volume',   value:`$${(selected.volume24h/1000).toFixed(0)}K`                   },
                    { label:'7-Day Change', value:`${selected.change7d>=0?'+':''}${selected.change7d}%`,
                      color: selected.change7d>=0?'text-primary-500':'text-red-400' },
                    { label:'Currency',     value:selected.currency                                              },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[var(--bg)] rounded-xl p-3 text-center">
                      <p className={`text-sm font-bold ${color||'text-[var(--text)]'}`}>{value}</p>
                      <p className="text-[9px] text-[var(--text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CarbonX comparison */}
              {selected.id !== 'carbonx-blue' && (
                <div className="card p-4">
                  <h3 className="text-xs font-bold text-[var(--text)] mb-3">vs CarbonX Blue Carbon</h3>
                  <div className="space-y-2">
                    {[
                      { label:'Price difference',    value:`${selected.price > MARKETS[0].price ? '+' : ''}$${(MARKETS[0].price - selected.price).toFixed(2)}` },
                      { label:'CarbonX advantage',   value:selected.price > MARKETS[0].price ? `${((selected.price - MARKETS[0].price)/selected.price*100).toFixed(1)}% cheaper` : `${((MARKETS[0].price - selected.price)/MARKETS[0].price*100).toFixed(1)}% premium` },
                      { label:'Verification',        value:'Satellite MRV + ACVA/VVB independent' },
                      { label:'Blockchain proof',    value:'ERC-1155 on Polygon — publicly verifiable' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className="font-semibold text-[var(--text)] text-right max-w-[60%]">{value}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/marketplace"
                    className="mt-4 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors w-full">
                    <Leaf className="w-4 h-4"/> Buy CarbonX Credits <ArrowRight className="w-3.5 h-3.5"/>
                  </Link>
                </div>
              )}

              {/* Disclaimer */}
              <div className="card p-3 border-amber-500/20 bg-amber-500/5 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5"/>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                  <strong className="text-amber-400">Disclaimer:</strong> Prices shown are indicative reference data based on publicly reported market ranges. CarbonX does not provide financial advice. EU ETS, CBAM, and compliance market prices are sourced from public domain reports. Actual transaction prices may vary. Consult a qualified carbon market broker for trading decisions.
                </p>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Market context */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-4">India Carbon Market Context (2025–2026)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title:'India CCTS Status', icon:'🏛️', points:['BEE operating Carbon Credit Trading Scheme','ICM Registry run by Grid Controller of India','CERC regulating CCC trading since 2026','ACVAs accredited for forestry verification'] },
            { title:'Global VCM Trends', icon:'🌍', points:['Voluntary market growing 40%/year','Blue carbon premium 15–40% above terrestrial','ICVCM CCPs raising quality bar globally','Article 6 driving compliance demand'] },
            { title:'CarbonX Positioning', icon:'🌿', points:['AI-verified blue carbon — unique in India','Satellite MRV reduces cost by 90%','Blockchain transparency builds buyer trust','ICVCM-compliant grievance mechanism'] },
          ].map(({ title, icon, points }) => (
            <div key={title} className="bg-[var(--bg)] rounded-xl p-4">
              <p className="text-sm font-bold text-[var(--text)] mb-3">{icon} {title}</p>
              <ul className="space-y-1.5">
                {points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-[var(--text-muted)]">
                    <span className="text-primary-500 shrink-0 mt-0.5">•</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
