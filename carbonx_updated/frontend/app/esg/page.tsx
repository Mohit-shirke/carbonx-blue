'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, CheckCircle, BarChart2,
  Building2, Award, ExternalLink, Copy, CheckCheck,
  Loader, Info, DollarSign, ShieldCheck, Sparkles
} from 'lucide-react'
import { generateESGReport } from '@/lib/pdfGenerator'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { AuthGate } from '@/components/auth/AuthGate'

const MOCK_PORTFOLIO = {
  company:       'TechCorp India Pvt Ltd',
  reporting_yr:  2026,
  total_purchased: 1240,
  total_retired:    980,
  total_available:  260,
  total_spent_usd: 35380,
  co2e_per_rupee: 0.000035,
  net_zero_progress_pct: 78,
  projects: [
    { name:'Sundarbans Mangrove Reserve', validator:'Verra', purchased:500, retired:500, vintage:2026, serial_range:'CX-VERRA-SDB001-2026-0000001 to 0000500' },
    { name:'Godavari Delta Reserve',      validator:'Verra', purchased:480, retired:480, vintage:2026, serial_range:'CX-VERRA-GDV001-2026-0000001 to 0000480' },
    { name:'Bhitarkanika Coastal Forest', validator:'CCTS',  purchased:260, retired:0,   vintage:2026, serial_range:'CX-CCTS-BHT001-2026-0000001 to 0000260' },
  ],
  retirements: [
    { id:'CX-RET-001', date:'2026-06-20', project:'Sundarbans', amount:500, purpose:'Q2 2026 Scope 3 Emissions', certificate:'CERT-SDB-500-2026' },
    { id:'CX-RET-002', date:'2026-05-15', project:'Godavari',   amount:480, purpose:'Annual Manufacturing Offset',certificate:'CERT-GDV-480-2026' },
  ],
  scope_breakdown: { scope1: 320, scope2: 280, scope3: 380 },
}

const REPORT_TYPES = [
  { id:'iso14064', label:'ISO 14064-3 Statement', desc:'GHG statement with cryptographic retirement evidence', icon:'📋', standard:'ISO/IEC 14064-3:2019', color:'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id:'ghgp',     label:'GHG Protocol Corporate', desc:'Scope 1, 2, 3 emissions and offset balance sheet', icon:'🌍', standard:'WRI/WBCSD GHG Protocol v2', color:'text-green-400 bg-green-500/10 border-green-500/20' },
  { id:'brsr',     label:'SEBI BRSR Core', desc:'India mandatory ESG reporting with on-chain proofs', icon:'🇮🇳', standard:'SEBI BRSR Core (2023)', color:'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id:'tcfd',     label:'TCFD Disclosure Report', desc:'Climate-related governance & risk disclosures', icon:'🏛️', standard:'TCFD Recommendations', color:'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id:'gri',      label:'GRI 305 Emissions', desc:'Global Reporting Initiative environmental disclosure', icon:'📊', standard:'GRI 305: Emissions 2016', color:'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  { id:'carbonx',  label:'CarbonX Master Certificate', desc:'Full cryptographic audit package with Polygon hashes', icon:'🌿', standard:'CarbonX Registry v1.0', color:'text-primary-500 bg-primary-500/10 border-primary-500/20' },
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
        fill="var(--text)" fontSize="15" fontWeight="bold" fontFamily="monospace">{pct}%</text>
    </svg>
  )
}

export default function ESGPage() {
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated]   = useState<Set<string>>(new Set())
  const [copied, setCopied]         = useState<string | null>(null)

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text); setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerate = async (type: string) => {
    setGenerating(type)
    try {
      await new Promise(r => setTimeout(r, 400))
      generateESGReport(type, MOCK_PORTFOLIO)
      setGenerated(prev => new Set([...prev, type]))
    } catch {
      alert('PDF generation failed. Please allow pop-ups for this site and try again.')
    } finally {
      setTimeout(() => setGenerating(null), 1500)
    }
  }

  const P = MOCK_PORTFOLIO

  return (
    <AuthGate
      requiredRoles={['corporate', 'government', 'academic']}
      pageTitle="Corporate ESG Reporting Suite"
      description="Automated statutory disclosure reports (SEBI BRSR Core, ISO 14064, GHG Protocol Scope 1-3) with on-chain cryptographic retirement proofs require Corporate, Government, or Academic credentials."
    >
      <div className="relative min-h-screen pb-16 overflow-hidden">
        {/* 21st.dev Ambient Matrix Grid Background */}
        <BackgroundGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              ISO 14064 · GHG Protocol · SEBI BRSR Core · TCFD · GRI
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Corporate ESG Audit & Reporting
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Generate 1-click international compliance PDF reports backed by on-chain Polygon PoS retirement proofs and Sentinel-2 satellite telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Audit Ready</p>
                <p className="text-xs font-bold text-primary-500">100% Cryptographic Proof</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Summary Container with BorderBeam */}
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-2xl overflow-hidden">
          <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--text)]">{P.company}</h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Reporting Cycle: {P.reporting_yr} · Institutional ESG Account
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ProgressRing pct={P.net_zero_progress_pct} />
              <div>
                <p className="text-xs font-bold text-[var(--text)]">Net-Zero Progress</p>
                <p className="text-[11px] text-[var(--text-muted)]">78% Target Achieved</p>
              </div>
            </div>
          </div>

          {/* 4 KPI Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label:'Credits Purchased', value:`${P.total_purchased.toLocaleString()} tCO₂e`, color:'text-blue-400' },
              { label:'Credits Retired', value:`${P.total_retired.toLocaleString()} tCO₂e`, color:'text-red-400' },
              { label:'Available in Vault', value:`${P.total_available.toLocaleString()} tCO₂e`, color:'text-amber-400' },
              { label:'Total ESG Investment', value:`$${P.total_spent_usd.toLocaleString()}`, color:'text-primary-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[var(--bg)] rounded-2xl p-3.5 text-center border border-[var(--border)]">
                <p className={`text-lg font-black font-mono tracking-tight ${color}`}>{value}</p>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scope Breakdown Progress Bars */}
        <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            GHG Emissions Offset by Scope
          </h3>
          <div className="space-y-3">
            {[
              { label:'Scope 1 — Direct Combustion & Mobile Sources', value:P.scope_breakdown.scope1, color:'from-blue-500 to-cyan-400', total:980 },
              { label:'Scope 2 — Indirect Purchased Electricity & Steam', value:P.scope_breakdown.scope2, color:'from-purple-500 to-indigo-400', total:980 },
              { label:'Scope 3 — Value Chain, Logistics & Business Travel', value:P.scope_breakdown.scope3, color:'from-amber-500 to-orange-400', total:980 },
            ].map(({ label, value, color, total }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text)] font-medium">{label}</span>
                  <span className="font-mono font-bold text-[var(--text)]">{value} tCO₂e</span>
                </div>
                <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(value/total)*100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6 Report Generation Standards with 21st.dev Spotlight */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">Generate Compliance ESG PDF Reports</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Print-ready A4 documentation formatted with your corporate data, Merkle root hashes, and auditor signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TYPES.map(r => (
              <SpotlightCard key={r.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl p-2 rounded-xl bg-[var(--bg)] border border-[var(--border)]">{r.icon}</span>
                    {generated.has(r.id) && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text)]">{r.label}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1 mb-3">{r.desc}</p>
                  <p className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border inline-block mb-4 ${r.color}`}>
                    {r.standard}
                  </p>
                </div>

                <button
                  onClick={() => handleGenerate(r.id)}
                  disabled={generating === r.id}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  {generating === r.id ? (
                    <><Loader className="w-3.5 h-3.5 animate-spin" /> Preparing PDF…</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Download Report</>
                  )}
                </button>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  )
}
