'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, CheckCircle, BarChart2,
  Building2, Award, ExternalLink, Copy, CheckCheck,
  Loader, Info, DollarSign
} from 'lucide-react'
import { generateESGReport } from '@/lib/pdfGenerator'

const MOCK_PORTFOLIO = {
  company:       'TechCorp India Pvt Ltd',
  reporting_yr:  2025,
  total_purchased: 1240,
  total_retired:    980,
  total_available:  260,
  total_spent_usd: 35380,
  co2e_per_rupee: 0.000035,
  net_zero_progress_pct: 78,
  projects: [
    { name:'Sundarbans Mangrove Reserve', validator:'Verra', purchased:500, retired:500, vintage:2025, serial_range:'CX-VERRA-SDB001-2025-0000001 to 0000500' },
    { name:'Godavari Delta Reserve',      validator:'Verra', purchased:480, retired:480, vintage:2025, serial_range:'CX-VERRA-GDV001-2025-0000001 to 0000480' },
    { name:'Bhitarkanika Coastal Forest', validator:'CCTS',  purchased:260, retired:0,   vintage:2025, serial_range:'CX-CCTS-BHT001-2025-0000001 to 0000260' },
  ],
  retirements: [
    { id:'CX-RET-001', date:'2025-06-20', project:'Sundarbans', amount:500, purpose:'Q2 2025 Scope 3 Emissions', certificate:'CERT-SDB-500-2025' },
    { id:'CX-RET-002', date:'2025-05-15', project:'Godavari',   amount:480, purpose:'Annual Manufacturing Offset',certificate:'CERT-GDV-480-2025' },
  ],
  scope_breakdown: { scope1: 320, scope2: 280, scope3: 380 },
}

const REPORT_TYPES = [
  { id:'iso14064', label:'ISO 14064-3',        desc:'GHG statement with retirement evidence',          icon:'📋', standard:'ISO/IEC 14064-3:2019',              color:'text-blue-400   bg-blue-500/10   border-blue-500/20'   },
  { id:'ghgp',     label:'GHG Protocol',        desc:'Scope 1, 2, 3 emissions and offset summary',     icon:'🌍', standard:'WRI/WBCSD GHG Protocol v2',          color:'text-green-400  bg-green-500/10  border-green-500/20'  },
  { id:'brsr',     label:'BRSR India',           desc:'SEBI Business Responsibility & Sustainability',  icon:'🇮🇳', standard:'SEBI BRSR Core (2023)',              color:'text-amber-400  bg-amber-500/10  border-amber-500/20'  },
  { id:'tcfd',     label:'TCFD Disclosure',      desc:'Climate-related financial disclosures',          icon:'🏛️', standard:'TCFD Recommendations (2017)',         color:'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id:'gri',      label:'GRI 305 Emissions',    desc:'Global Reporting Initiative disclosure',         icon:'📊', standard:'GRI 305: Emissions 2016',             color:'text-teal-400   bg-teal-500/10   border-teal-500/20'   },
  { id:'carbonx',  label:'CarbonX Certificate',  desc:'Detailed retirement certificate with on-chain',  icon:'🌿', standard:'CarbonX Registry v1.0',               color:'text-primary-500 bg-primary-500/10 border-primary-500/20'},
]

function ProgressRing({ pct, color = '#10B981' }: { pct: number; color?: string }) {
  const r = 36; const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="6"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition:'stroke-dasharray 1s ease' }}/>
      <text x="45" y="45" textAnchor="middle" dominantBaseline="central"
        fill="var(--text)" fontSize="14" fontWeight="bold">{pct}%</text>
    </svg>
  )
}

export default function ESGPage() {
  const [generating, setGenerating]   = useState<string | null>(null)
  const [generated, setGenerated]     = useState<Set<string>>(new Set())
  const [copied, setCopied]           = useState<string | null>(null)

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // ✅ WORKING PDF GENERATION
  const handleGenerate = async (type: string) => {
    setGenerating(type)
    try {
      await new Promise(r => setTimeout(r, 400)) // Small delay for UX
      generateESGReport(type, MOCK_PORTFOLIO)
      setGenerated(prev => new Set([...prev, type]))
    } catch (err) {
      alert('PDF generation failed. Please allow pop-ups for this site and try again.')
    } finally {
      setTimeout(() => setGenerating(null), 1500)
    }
  }

  const P = MOCK_PORTFOLIO

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Corporate ESG Reporting</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          One-click professional PDF reports — ISO 14064, GHG Protocol, BRSR, TCFD, GRI compliant. Print-ready A4 format.
        </p>
      </motion.div>

      {/* Info notice */}
      <div className="card p-3 border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/>
        <p className="text-[10px] text-[var(--text-muted)]">
          Click any report button below to open a print-ready PDF in a new tab. Use <strong className="text-[var(--text)]">Ctrl+P / Cmd+P</strong> → Save as PDF, or your browser will auto-trigger print. Allow pop-ups when prompted.
        </p>
      </div>

      {/* Company summary */}
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-500"/>
            </div>
            <div>
              <h2 className="font-bold text-sm text-[var(--text)]">{P.company}</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Reporting Year: {P.reporting_yr} · Carbon Portfolio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <ProgressRing pct={P.net_zero_progress_pct}/>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Net-Zero Progress</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:'Credits Purchased',  value:`${P.total_purchased.toLocaleString()} tCO₂e`, color:'text-blue-400'    },
            { label:'Credits Retired',    value:`${P.total_retired.toLocaleString()} tCO₂e`,   color:'text-red-400'     },
            { label:'Available',          value:`${P.total_available.toLocaleString()} tCO₂e`, color:'text-amber-400'   },
            { label:'Total Investment',   value:`$${P.total_spent_usd.toLocaleString()}`,       color:'text-primary-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[var(--bg)] rounded-xl p-3 text-center">
              <p className={`text-base sm:text-lg font-black ${color}`}>{value}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scope breakdown */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-4">GHG Emissions Offset by Scope</h3>
        <div className="space-y-3">
          {[
            { label:'Scope 1 — Direct emissions (fuel, company vehicles)',         value:P.scope_breakdown.scope1, color:'bg-blue-500',   total:980 },
            { label:'Scope 2 — Indirect emissions (purchased electricity)',         value:P.scope_breakdown.scope2, color:'bg-purple-500', total:980 },
            { label:'Scope 3 — Value chain emissions (travel, supply chain, waste)',value:P.scope_breakdown.scope3, color:'bg-amber-500',  total:980 },
          ].map(({ label, value, color, total }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">{label}</span>
                <span className="text-xs font-bold text-[var(--text)]">{value} tCO₂e</span>
              </div>
              <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                <motion.div className={`h-full ${color} rounded-full`}
                  initial={{ width:0 }} animate={{ width:`${(value/total)*100}%` }} transition={{ duration:0.8 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credit portfolio */}
      <div className="card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-[var(--border)]">
          <h3 className="font-bold text-sm text-[var(--text)]">Credit Portfolio</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                {['Project','Validator','Purchased','Retired','Vintage','Serial Range','Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {P.projects.map(p => (
                <tr key={p.name} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--text)]">{p.name}</td>
                  <td className="px-4 py-3"><span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 text-[10px] font-bold">{p.validator}</span></td>
                  <td className="px-4 py-3 text-[var(--text)]">{p.purchased} tCO₂e</td>
                  <td className="px-4 py-3 text-red-400 font-semibold">{p.retired} tCO₂e</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{p.vintage}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[140px]">{p.serial_range.slice(0,28)}…</span>
                      <button onClick={() => copy(p.serial_range, p.name)} className="text-[var(--text-muted)] hover:text-primary-500 transition-colors shrink-0">
                        {copied===p.name ? <CheckCheck className="w-3 h-3 text-primary-500"/> : <Copy className="w-3 h-3"/>}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.retired===p.purchased?'text-primary-500 bg-primary-500/10':'text-amber-400 bg-amber-500/10'}`}>
                      {p.retired===p.purchased ? 'FULLY RETIRED' : 'PARTIAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ WORKING Report generation */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-1">Generate ESG Reports</h3>
        <p className="text-[10px] text-[var(--text-muted)] mb-4">
          Professional A4 print-ready PDFs. Each report opens in a new tab → use Ctrl+P → Save as PDF.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(r => (
            <motion.div key={r.id} className={`card p-4 ${generated.has(r.id)?'border-primary-500/30 bg-primary-500/5':''}`}
              whileHover={{ scale:1.015 }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xl">{r.icon}</span>
                {generated.has(r.id) && <CheckCircle className="w-4 h-4 text-primary-500 shrink-0"/>}
              </div>
              <p className="text-xs font-bold text-[var(--text)]">{r.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 mb-1">{r.desc}</p>
              <p className={`text-[9px] font-medium px-2 py-0.5 rounded-full border inline-block mb-3 ${r.color}`}>{r.standard}</p>

              {/* ✅ WORKING PDF BUTTON */}
              <button onClick={() => handleGenerate(r.id)} disabled={generating === r.id}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium py-2 rounded-xl text-xs transition-all hover:shadow-md hover:shadow-primary-500/25 active:scale-95">
                {generating === r.id
                  ? <><Loader className="w-3.5 h-3.5 animate-spin"/>Opening PDF…</>
                  : generated.has(r.id)
                  ? <><Download className="w-3.5 h-3.5"/>Generate Again</>
                  : <><Download className="w-3.5 h-3.5"/>Generate PDF</>
                }
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Retirement certificates */}
      <div className="card p-4 sm:p-5">
        <h3 className="font-bold text-sm text-[var(--text)] mb-4">Retirement Certificates</h3>
        <div className="space-y-3">
          {P.retirements.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
              <Award className="w-5 h-5 text-amber-400 shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[var(--text)] truncate">{r.purpose}</p>
                  <p className="text-xs font-bold text-red-400 shrink-0">{r.amount} tCO₂e</p>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-[10px] text-[var(--text-muted)]">{r.project} · {r.date}</p>
                  <p className="text-[10px] font-mono text-blue-400">{r.certificate}</p>
                </div>
              </div>
              {/* ✅ Working certificate PDF button */}
              <button onClick={() => handleGenerate('carbonx')} disabled={generating === 'carbonx'}
                className="flex items-center gap-1.5 text-[10px] bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 font-medium">
                {generating === 'carbonx'
                  ? <><Loader className="w-3 h-3 animate-spin"/>…</>
                  : <><Download className="w-3 h-3"/> PDF</>
                }
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-3 text-center">
          Each certificate includes on-chain retirement proof, serial numbers, and ACVA/VVB verification reference
        </p>
      </div>

    </div>
  )
}
