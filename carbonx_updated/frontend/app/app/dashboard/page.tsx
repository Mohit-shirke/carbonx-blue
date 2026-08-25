'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart2, Leaf, Zap, TrendingUp, TrendingDown,
  Globe, Activity, RefreshCw, ExternalLink, Shield,
  Download, Bell, AlertCircle
} from 'lucide-react'

// ── Mock live data ───────────────────────────────────────────────
const PROJECTS = [
  { id:'p1', name:'Sundarbans',    ndvi:0.84, credits:8200, price:28.50, status:'active',   validator:'Verra',        tokenId:1001, lat:21.95, lng:89.18, color:'#10B981' },
  { id:'p2', name:'Bhitarkanika', ndvi:0.76, credits:5100, price:22.00, status:'active',   validator:'CCTS',         tokenId:1002, lat:20.70, lng:86.90, color:'#3B82F6' },
  { id:'p3', name:'Pichavaram',   ndvi:0.71, credits:3400, price:19.75, status:'active',   validator:'Gold Standard', tokenId:1003, lat:11.42, lng:79.77, color:'#8B5CF6' },
  { id:'p4', name:'Godavari',     ndvi:0.79, credits:6700, price:31.00, status:'active',   validator:'Verra',        tokenId:1004, lat:16.50, lng:82.00, color:'#F59E0B' },
  { id:'p5', name:'Gulf Mannar',  ndvi:0.65, credits:2100, price:16.50, status:'upcoming', validator:'CCTS',         tokenId:1005, lat:9.20,  lng:79.10, color:'#EF4444' },
  { id:'p6', name:'Chilika',      ndvi:0.68, credits:0,    price:24.00, status:'soldout',  validator:'Gold Standard', tokenId:1006, lat:19.72, lng:85.32, color:'#6B7280' },
]

const KPIS = [
  { label:'Total tCO₂e Available', value:'25,500',  change:'+3.2%',  up:true,  icon:Leaf,      color:'text-primary-500', bg:'bg-primary-500/10' },
  { label:'Active Projects',       value:'4',       change:'0%',     up:true,  icon:Globe,     color:'text-blue-400',    bg:'bg-blue-500/10'    },
  { label:'Credits Minted',        value:'89,320',  change:'+12.1%', up:true,  icon:Zap,       color:'text-amber-400',   bg:'bg-amber-500/10'   },
  { label:'Total Retired',         value:'24,500',  change:'+8.7%',  up:true,  icon:Shield,    color:'text-purple-400',  bg:'bg-purple-500/10'  },
]

function KPICard({ kpi, i }: { kpi: typeof KPIS[0]; i: number }) {
  return (
    <motion.div className="card p-4 sm:p-5"
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
          <kpi.icon className={`w-4 h-4 ${kpi.color}`}/>
        </div>
        <span className={`flex items-center gap-1 text-[10px] font-bold ${kpi.up ? 'text-primary-500' : 'text-red-400'}`}>
          {kpi.up ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
          {kpi.change}
        </span>
      </div>
      <p className="text-xl sm:text-2xl font-black text-[var(--text)]">{kpi.value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{kpi.label}</p>
    </motion.div>
  )
}

// ── Live transaction ticker ───────────────────────────────────────
function TransactionTicker() {
  const TXNS = [
    { type:'mint',   project:'Sundarbans',   amount:50,  address:'0x3a2f…9b1c', time:'2s ago'  },
    { type:'retire', project:'Pichavaram',   amount:10,  address:'0x7f11…c3de', time:'18s ago' },
    { type:'mint',   project:'Godavari',     amount:100, address:'0x9c4a…f2e1', time:'45s ago' },
    { type:'retire', project:'Bhitarkanika', amount:25,  address:'0x1d8b…7a3f', time:'2m ago'  },
    { type:'mint',   project:'Sundarbans',   amount:200, address:'0x5e6c…8b2d', time:'5m ago'  },
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => { const t = setInterval(() => setIdx(i => (i+1)%TXNS.length), 2500); return () => clearInterval(t) }, [])
  const tx = TXNS[idx]
  return (
    <motion.div key={idx} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }}
      className="flex items-center gap-3 bg-[var(--bg)] rounded-xl px-3 py-2.5">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tx.type==='mint'?'text-primary-500 bg-primary-500/10 border-primary-500/20':'text-red-400 bg-red-500/10 border-red-500/20'}`}>
        {tx.type.toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--text)] truncate">{tx.address} · {tx.amount} tCO₂e · {tx.project}</p>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] shrink-0">{tx.time}</p>
    </motion.div>
  )
}

// ── SVG India Map ─────────────────────────────────────────────────
function IndiaMap() {
  const [selected, setSelected] = useState<typeof PROJECTS[0]|null>(null)
  // Approximate India bounding box: lat 8–37, lng 68–97
  const toX = (lng: number) => ((lng - 68) / (97 - 68)) * 100
  const toY = (lat: number) => 100 - ((lat - 8) / (37 - 8)) * 100

  return (
    <div className="relative w-full h-[260px] sm:h-[320px] bg-[var(--bg)] rounded-2xl overflow-hidden border border-[var(--border)]">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[...Array(10)].map((_,i) => <line key={`h${i}`} x1="0" y1={i*10} x2="100" y2={i*10} stroke="currentColor" strokeWidth="0.5"/>)}
        {[...Array(10)].map((_,i) => <line key={`v${i}`} x1={i*10} y1="0" x2={i*10} y2="100" stroke="currentColor" strokeWidth="0.5"/>)}
      </svg>

      {/* Project dots */}
      {PROJECTS.map(p => {
        const x = toX(p.lng); const y = toY(p.lat)
        return (
          <motion.button key={p.id}
            style={{ left:`${x}%`, top:`${y}%`, background: p.color }}
            className="absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg cursor-pointer"
            whileHover={{ scale: 1.8 }} onClick={() => setSelected(s => s?.id===p.id?null:p)}
            animate={p.status==='active'?{boxShadow:[`0 0 0 0 ${p.color}50`,`0 0 0 6px transparent`,`0 0 0 0 ${p.color}50`]}:{}}
            transition={{ duration: 2, repeat: Infinity }}>
          </motion.button>
        )
      })}

      {/* Tooltip */}
      {selected && (
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          className="absolute top-3 left-3 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-xl z-10 min-w-[160px]">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{background:selected.color}}/>
            <p className="text-xs font-bold text-[var(--text)]">{selected.name}</p>
          </div>
          <div className="space-y-1 text-[10px] text-[var(--text-muted)]">
            <div className="flex justify-between gap-4"><span>NDVI</span><span className="font-bold text-[var(--text)]">{selected.ndvi.toFixed(2)}</span></div>
            <div className="flex justify-between gap-4"><span>Price</span><span className="font-bold text-[var(--text)]">${selected.price}/ton</span></div>
            <div className="flex justify-between gap-4"><span>Status</span><span className={`font-bold ${selected.status==='active'?'text-primary-500':'text-[var(--text-muted)]'}`}>{selected.status}</span></div>
          </div>
          <button onClick={() => setSelected(null)} className="absolute top-1.5 right-1.5 text-[var(--text-muted)] hover:text-[var(--text)]"><span className="text-xs">✕</span></button>
        </motion.div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        {PROJECTS.filter(p=>p.status==='active').map(p=>(
          <div key={p.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
            <span className="text-[9px] text-[var(--text-muted)]">{p.name}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-3 right-3">
        <p className="text-[10px] text-[var(--text-muted)] font-medium">Tap a dot for details</p>
      </div>
    </div>
  )
}

// ── NDVI Bar chart ────────────────────────────────────────────────
function NDVIChart() {
  return (
    <div className="space-y-2.5">
      {PROJECTS.filter(p=>p.status!=='soldout').map((p,i)=>{
        const pct = Math.round(p.ndvi * 100)
        const color = p.ndvi>=0.8?'bg-primary-500':p.ndvi>=0.65?'bg-amber-500':'bg-red-500'
        return (
          <motion.div key={p.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--text)]">{p.name}</span>
              <span className={`text-xs font-bold ${p.ndvi>=0.8?'text-primary-500':p.ndvi>=0.65?'text-amber-500':'text-red-500'}`}>{p.ndvi.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div className={`h-full ${color} rounded-full`}
                initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:'easeOut',delay:i*0.07}}/>
            </div>
          </motion.div>
        )
      })}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
        {[{label:'≥0.80 Verified',color:'bg-primary-500'},{label:'0.65–0.79 Review',color:'bg-amber-500'},{label:'<0.65 Failed',color:'bg-red-500'}].map(l=>(
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${l.color}`}/>
            <span className="text-[9px] text-[var(--text-muted)]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [lastRefresh, setRefresh] = useState(new Date())
  const refresh = () => setRefresh(new Date())

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Registry Dashboard</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Last updated: {lastRefresh.toLocaleTimeString('en-IN')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 text-xs border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-primary-500 rounded-xl transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
          <a href="https://www.oklink.com/amoy" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-xs bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors">
            <ExternalLink className="w-3.5 h-3.5"/> Explorer
          </a>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {KPIS.map((kpi, i) => <KPICard key={kpi.label} kpi={kpi} i={i}/>)}
      </div>

      {/* Map + NDVI chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <motion.div className="card p-4 sm:p-5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">Project Locations — India</h2>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>Live
            </span>
          </div>
          <IndiaMap/>
        </motion.div>

        <motion.div className="card p-4 sm:p-5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.35}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">NDVI Scores</h2>
            <span className="text-[10px] text-[var(--text-muted)]">Satellite · Sentinel-2</span>
          </div>
          <NDVIChart/>
        </motion.div>
      </div>

      {/* Live transactions + project table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Live tx feed */}
        <motion.div className="card p-4 sm:p-5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">Live Transactions</h2>
            <span className="text-[10px] text-primary-500 flex items-center gap-1">
              <Activity className="w-3 h-3"/> Real-time
            </span>
          </div>
          <div className="space-y-2"><TransactionTicker/></div>
          <a href="https://www.oklink.com/amoy" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary-500 hover:underline mt-3">
            <ExternalLink className="w-3 h-3"/> View all on OKLink Explorer
          </a>
        </motion.div>

        {/* Project summary table */}
        <motion.div className="card overflow-hidden" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.45}}>
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">Project Registry</h2>
            <span className="text-[10px] text-[var(--text-muted)]">{PROJECTS.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  {['Project','NDVI','Price','Credits','Status'].map(h=>(
                    <th key={h} className="px-3 py-2 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map(p=>(
                  <tr key={p.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-[var(--text)] whitespace-nowrap">{p.name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`font-bold ${p.ndvi>=0.8?'text-primary-500':p.ndvi>=0.65?'text-amber-500':'text-red-500'}`}>{p.ndvi.toFixed(2)}</span>
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-[var(--text)]">${p.price}</td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">{p.credits.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.status==='active'?'text-primary-500 bg-primary-500/10 border-primary-500/20':p.status==='soldout'?'text-red-400 bg-red-500/10 border-red-500/20':'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Alert banner */}
      <motion.div className="card p-4 border-amber-500/30 bg-amber-500/5 flex items-start gap-3"
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">Testnet Mode Active</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">CarbonX is running on Polygon Amoy Testnet (Chain ID: 80002). All transactions use test MATIC. Get free MATIC at <a href="https://faucet.polygon.technology" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">faucet.polygon.technology</a>.</p>
        </div>
      </motion.div>

    </div>
  )
}
