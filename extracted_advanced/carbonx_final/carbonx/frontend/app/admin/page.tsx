'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, AlertTriangle, CheckCircle, XCircle, BarChart2,
  TrendingUp, TrendingDown, Activity, RefreshCw, Eye,
  Lock, Globe, Leaf, Zap, DollarSign, Users, FileText, Bell
} from 'lucide-react'

const PROJECTS_RISK = [
  {
    id:'p1', name:'Sundarbans Mangrove Reserve', location:'West Bengal',
    risks: { legal:90, additionality:85, ecology:88, mrv:92, permanence:75, community:95, verification:60 },
    overall:84, trend:'up', credits_issued:8200, revenue_usd:234000, status:'active'
  },
  {
    id:'p2', name:'Bhitarkanika Coastal Forest', location:'Odisha',
    risks: { legal:80, additionality:78, ecology:82, mrv:76, permanence:70, community:85, verification:45 },
    overall:74, trend:'stable', credits_issued:5100, revenue_usd:112000, status:'active'
  },
  {
    id:'p3', name:'Pichavaram Mangrove Block', location:'Tamil Nadu',
    risks: { legal:75, additionality:72, ecology:78, mrv:68, permanence:82, community:80, verification:30 },
    overall:69, trend:'down', credits_issued:3400, revenue_usd:67000, status:'review'
  },
  {
    id:'p4', name:'Godavari Delta Reserve', location:'Andhra Pradesh',
    risks: { legal:88, additionality:84, ecology:90, mrv:85, permanence:78, community:92, verification:72 },
    overall:84, trend:'up', credits_issued:6700, revenue_usd:207000, status:'active'
  },
]

const RISK_LABELS: Record<string, string> = {
  legal:'Legal Rights', additionality:'Additionality', ecology:'Ecology',
  mrv:'MRV Quality', permanence:'Permanence', community:'Community', verification:'Verification'
}

const PLATFORM_METRICS = {
  total_credits:     25500,
  total_retired:     24500,
  total_revenue_usd: 620000,
  active_projects:   4,
  pending_verif:     3,
  buffer_pool:       2840,
  avg_ndvi:          0.78,
  total_users:       247,
}

const ALERTS = [
  { id:'a1', severity:'critical', project:'Pichavaram',  message:'Verification pending >45 days. Credits at risk of suspension.', time:'2h ago'  },
  { id:'a2', severity:'high',     project:'Bhitarkanika', message:'NDVI declined 0.06 from last reading. Monitoring elevated.',     time:'6h ago'  },
  { id:'a3', severity:'medium',   project:'All Projects', message:'3 verifier review cases approaching deadline.',                  time:'1d ago'  },
  { id:'a4', severity:'info',     project:'Sundarbans',   message:'New MRV run completed. 8,240 tCO₂e creditable (IPCC Tier 2).', time:'2d ago'  },
]

const ALERT_COLORS: Record<string,string> = {
  critical:'text-red-400    bg-red-500/10    border-red-500/20',
  high:    'text-amber-400  bg-amber-500/10  border-amber-500/20',
  medium:  'text-blue-400   bg-blue-500/10   border-blue-500/20',
  info:    'text-primary-500 bg-primary-500/10 border-primary-500/20',
}

function TrafficLight({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-primary-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const label = score >= 80 ? 'GREEN' : score >= 60 ? 'AMBER' : 'RED'
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`}/>
      <span className={`text-[10px] font-bold ${score>=80?'text-primary-500':score>=60?'text-amber-400':'text-red-400'}`}>{label}</span>
    </div>
  )
}

function RiskBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? 'bg-primary-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
        <span className={`text-[10px] font-bold ${score>=80?'text-primary-500':score>=60?'text-amber-400':'text-red-400'}`}>{score}</span>
      </div>
      <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div className={`h-full ${color} rounded-full`}
          initial={{ width:0 }} animate={{ width:`${score}%` }} transition={{ duration:0.8 }}/>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [selected, setSelected] = useState<typeof PROJECTS_RISK[0] | null>(null)
  const [showAlerts, setShowAlerts] = useState(true)

  const criticalAlerts = ALERTS.filter(a => a.severity === 'critical').length

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-5 h-5 text-primary-500"/>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Admin Risk Console</h1>
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
              {criticalAlerts} CRITICAL
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Real-time portfolio risk monitoring · Carbon quality assurance · Platform oversight</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAlerts(v => !v)}
            className="flex items-center gap-1.5 text-xs border border-[var(--border)] hover:border-primary-500 px-3 py-2 rounded-lg text-[var(--text-muted)] hover:text-primary-500 transition-colors">
            <Bell className="w-3.5 h-3.5"/> Alerts {showAlerts ? '▲' : '▼'}
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5"/> Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
            <div className="space-y-2">
              {ALERTS.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${ALERT_COLORS[a.severity]}`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)]">{a.project} — {a.message}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Credits',      value:`${PLATFORM_METRICS.total_credits.toLocaleString()} tCO₂e`, icon:Leaf,       color:'text-primary-500' },
          { label:'Total Revenue',      value:`$${(PLATFORM_METRICS.total_revenue_usd/1000).toFixed(0)}K`, icon:DollarSign, color:'text-amber-400'   },
          { label:'Buffer Pool',        value:`${PLATFORM_METRICS.buffer_pool.toLocaleString()} tCO₂e`,   icon:Shield,     color:'text-blue-400'    },
          { label:'Pending Verif.',     value:PLATFORM_METRICS.pending_verif,                              icon:Clock,      color:'text-red-400'     },
        ].map(({ label, value, icon:Icon, color }, i) => (
          <motion.div key={label} className="card p-3 sm:p-4"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            <Icon className={`w-4 h-4 ${color} mb-2`}/>
            <p className={`text-lg sm:text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Project Risk Console */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Risk table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold text-sm text-[var(--text)]">Project Risk Console</h2>
            <span className="text-[10px] text-[var(--text-muted)]">Click row for full breakdown</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                  {['Project','Overall','Legal','MRV','Verif.','Trend','Status'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTS_RISK.map(p => (
                  <tr key={p.id}
                    className={`border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors cursor-pointer ${selected?.id===p.id?'bg-primary-500/5':''}`}
                    onClick={() => setSelected(selected?.id===p.id ? null : p)}>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-[var(--text)] truncate max-w-[120px]">{p.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{p.location}</p>
                    </td>
                    <td className="px-3 py-2.5"><TrafficLight score={p.overall}/></td>
                    <td className="px-3 py-2.5"><TrafficLight score={p.risks.legal}/></td>
                    <td className="px-3 py-2.5"><TrafficLight score={p.risks.mrv}/></td>
                    <td className="px-3 py-2.5"><TrafficLight score={p.risks.verification}/></td>
                    <td className="px-3 py-2.5">
                      {p.trend==='up'
                        ? <TrendingUp className="w-4 h-4 text-primary-500"/>
                        : p.trend==='down'
                        ? <TrendingDown className="w-4 h-4 text-red-400"/>
                        : <Activity className="w-4 h-4 text-amber-400"/>
                      }
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.status==='active'?'text-primary-500 bg-primary-500/10 border-primary-500/20':'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected project detail */}
        <div>
          {selected ? (
            <motion.div className="card p-4 sm:p-5 space-y-4"
              initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[var(--text)]">{selected.name}</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">{selected.location}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${selected.overall>=80?'text-primary-500':selected.overall>=60?'text-amber-400':'text-red-400'}`}>{selected.overall}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Risk Score</p>
                </div>
              </div>

              {/* All risk dimensions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[var(--text)]">Risk Dimensions</h4>
                {Object.entries(selected.risks).map(([key, val]) => (
                  <RiskBar key={key} score={val} label={RISK_LABELS[key] || key}/>
                ))}
              </div>

              {/* Financial */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Credits Issued', value:`${selected.credits_issued.toLocaleString()} tCO₂e` },
                  { label:'Revenue (USD)',  value:`$${(selected.revenue_usd/1000).toFixed(0)}K`         },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--bg)] rounded-xl p-3 text-center">
                    <p className="text-sm font-bold text-primary-500">{value}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {selected.risks.verification < 60 && (
                  <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                    <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1"/>
                    <p className="text-[10px] text-red-400 font-semibold">Verification Score Critical</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Assign ACVA/VVB immediately</p>
                  </div>
                )}
                {selected.overall >= 80 && (
                  <div className="flex-1 bg-primary-500/10 border border-primary-500/20 rounded-xl p-3 text-center">
                    <CheckCircle className="w-4 h-4 text-primary-500 mx-auto mb-1"/>
                    <p className="text-[10px] text-primary-500 font-semibold">Project Healthy</p>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">No immediate action required</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center h-64 text-center">
              <BarChart2 className="w-10 h-10 text-[var(--text-muted)] opacity-30 mb-3"/>
              <p className="text-sm text-[var(--text-muted)]">Click a project row to see full risk breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Buffer Pool Status */}
      <div className="card p-4 sm:p-5">
        <h2 className="font-bold text-sm text-[var(--text)] mb-4">Buffer Pool Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label:'Buffer Pool Reserves',     value:`${PLATFORM_METRICS.buffer_pool.toLocaleString()} tCO₂e`, desc:'Available for reversal coverage',      color:'text-primary-500' },
            { label:'Total Credits Issued',      value:`${PLATFORM_METRICS.total_credits.toLocaleString()} tCO₂e`, desc:'Across all active projects',        color:'text-blue-400'    },
            { label:'Buffer Pool %',             value:`${((PLATFORM_METRICS.buffer_pool/PLATFORM_METRICS.total_credits)*100).toFixed(1)}%`, desc:'Target: 10–20%', color:'text-amber-400' },
          ].map(({ label, value, desc, color }) => (
            <div key={label} className="bg-[var(--bg)] rounded-xl p-4">
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-[var(--text)] mt-1">{label}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

// Missing import
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  )
}
