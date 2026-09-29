'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MapPin, Shield, Leaf, CheckCircle,
  ExternalLink, Download, Lock, Globe,
  Copy, CheckCheck, Loader, Sparkles, Activity, Layers, QrCode
} from 'lucide-react'
import { generatePassportPDF } from '@/lib/pdfGenerator'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'

const PASSPORTS = [
  {
    id:'CXP-SDB-001', project:'Sundarbans Mangrove Reserve',
    location:'West Bengal, India', coordinates:'21.9497° N, 89.1833° E',
    ecosystem:'Mangrove Delta', area_ha:4262, established:'2024-01-15',
    methodology:'BEE BM FR05.001 + IPCC Tier 2',
    standard:'India CCTS + Verra VCS',
    validator:'Bureau Veritas India (ACVA)', status:'active',
    ndvi_current:0.84, ndvi_baseline:0.35, ndvi_trend:'improving',
    carbon:{ gross_co2e:12400, net_co2e:9840, creditable:8200, retired:1240, buffer_pool:820, available:8200, co2e_per_ha_yr:2.9 },
    mrv_history:[
      { date:'2026-06-15', ndvi:0.84, status:'verified', creditable:8240 },
      { date:'2026-03-10', ndvi:0.81, status:'verified', creditable:7980 },
      { date:'2025-12-05', ndvi:0.79, status:'verified', creditable:7640 },
      { date:'2025-09-01', ndvi:0.76, status:'verified', creditable:7320 },
    ],
    retirements:[
      { id:'CX-RET-001', date:'2026-06-20', buyer:'TechCorp India', amount:500, purpose:'Q2 2026 Scope 3 offset' },
      { id:'CX-RET-002', date:'2026-05-15', buyer:'Green Finance Ltd', amount:740, purpose:'Annual ESG commitment' },
    ],
    biodiversity:{ score:98, species:312, keystone:'Bengal Tiger, Irrawaddy Dolphin' },
    community:{ households:4200, jobs:340, benefit_sharing_pct:30 },
    risk:{ permanence:'LOW', leakage:'MEDIUM', additionality:'HIGH' },
    verif_history:[
      { date:'2026-06-30', body:'Bureau Veritas India', outcome:'Approved', tonnes:8240 },
      { date:'2025-12-15', body:'Bureau Veritas India', outcome:'Approved', tonnes:7640 },
    ],
    external_serial:'VCS-9234-2026-MNGRV-IN-SDB',
    ipfs_hash:'QmX7kP9...3vN2',
    tx_hash:'0x7a3f8901bc45de67890123456789abcdef012345',
  },
  {
    id:'CXP-BHT-002', project:'Bhitarkanika Coastal Forest',
    location:'Odisha, India', coordinates:'20.7000° N, 86.9000° E',
    ecosystem:'Ramsar Estuarine Wetland', area_ha:672, established:'2024-03-01',
    methodology:'BEE BM FR05.001 + IPCC Tier 2',
    standard:'India CCTS',
    validator:'SGS India Pvt Ltd (ACVA)', status:'active',
    ndvi_current:0.76, ndvi_baseline:0.32, ndvi_trend:'stable',
    carbon:{ gross_co2e:8200, net_co2e:6560, creditable:5100, retired:420, buffer_pool:510, available:5100, co2e_per_ha_yr:2.4 },
    mrv_history:[
      { date:'2026-06-12', ndvi:0.76, status:'verified', creditable:5100 },
      { date:'2025-12-01', ndvi:0.74, status:'verified', creditable:4840 },
    ],
    retirements:[
      { id:'CX-RET-003', date:'2026-04-10', buyer:'Coastal Corp', amount:420, purpose:'Carbon neutral pledge 2026' },
    ],
    biodiversity:{ score:91, species:215, keystone:'Saltwater Crocodile, Olive Ridley Turtle' },
    community:{ households:1800, jobs:142, benefit_sharing_pct:28 },
    risk:{ permanence:'MEDIUM', leakage:'LOW', additionality:'HIGH' },
    verif_history:[
      { date:'2026-06-20', body:'SGS India', outcome:'Approved', tonnes:5100 },
    ],
    external_serial:'CCTS-1045-2026-MNGRV-IN-BHT',
    ipfs_hash:'QmY8mQ1...4wO3',
    tx_hash:'0x2b19cd88ef0123456789abcdef0123456789abcd',
  },
]

export default function PassportPage() {
  const [selected, setSelected]     = useState(PASSPORTS[0])
  const [section, setSection]       = useState<string>('overview')
  const [copied, setCopied]         = useState(false)
  const [generating, setGenerating] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    setGenerating(true)
    try {
      await new Promise(r => setTimeout(r, 300))
      generatePassportPDF(selected)
    } catch {
      alert('PDF generation failed. Please allow pop-ups for this site.')
    } finally {
      setTimeout(() => setGenerating(false), 1500)
    }
  }

  const SECTIONS = ['overview','carbon','mrv','retirements','biodiversity','community','verification']

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              Digital Product Passport (DPP) · EU CSRD & India CCTS Compliant
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Cryptographic Project Passport
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Complete, immutable chain-of-custody evidence record for every blue carbon project. Transparent verification lineage, Sentinel-2 vegetation curves, and on-chain retirement receipts.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <button
              onClick={handleExportPDF}
              disabled={generating}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {generating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{generating ? 'Compiling PDF…' : 'Export Passport PDF'}</span>
            </button>
          </div>
        </div>

        {/* Project Selector Pills */}
        <div className="flex gap-3 overflow-x-auto pb-1">
          {PASSPORTS.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setSection('overview') }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                selected.id === p.id
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/25'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/50 bg-[var(--card)]/80'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{p.project}</span>
            </button>
          ))}
        </div>

        {/* Active Passport Container with 21st.dev BorderBeam */}
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden">
          <BorderBeam size={280} duration={9} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={2} />

          {/* Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-[var(--card)] p-6 sm:p-7 border-b border-[var(--border)]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                    <Leaf className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[var(--text)]">{selected.project}</h2>
                      <span className="text-[10px] font-bold text-primary-400 bg-primary-500/15 border border-primary-500/30 px-2.5 py-0.5 rounded-full">
                        ACTIVE PASSPORT
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-500" />
                      <span>{selected.location} · {selected.coordinates}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-xl font-semibold">
                    {selected.methodology}
                  </span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-xl font-semibold">
                    {selected.standard}
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-xl font-semibold">
                    {selected.validator}
                  </span>
                </div>
              </div>

              {/* Passport ID & Explorer Links */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className="bg-[var(--bg)] p-2.5 rounded-xl border border-[var(--border)] text-right">
                  <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Passport Serial ID</p>
                  <div className="flex items-center gap-2 justify-end mt-0.5">
                    <p className="font-mono text-xs font-bold text-[var(--text)]">{selected.id}</p>
                    <button
                      onClick={() => copy(selected.id)}
                      className="text-[var(--text-muted)] hover:text-primary-500 cursor-pointer"
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <a
                  href={`https://polygonscan.com/tx/${selected.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                  <span>Polygonscan On-Chain Proof</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg)]/50">
            {SECTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`shrink-0 text-xs font-semibold px-4 py-2.5 border-b-2 transition-all capitalize cursor-pointer ${
                  section === s
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Section Content Area */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {section === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {[
                    { label: 'Protected Wetland Area', value: `${selected.area_ha.toLocaleString()} ha` },
                    { label: 'Primary Ecosystem', value: selected.ecosystem },
                    { label: 'Registry Inception', value: selected.established },
                    { label: 'Auditing Validator', value: selected.validator.split('(')[0].trim() },
                    { label: 'Current NDVI Score', value: selected.ndvi_current.toFixed(2) },
                    { label: 'Vegetation Trajectory', value: selected.ndvi_trend.toUpperCase() },
                    { label: 'Registry Serial Range', value: selected.external_serial },
                    { label: 'IPFS Provenance CID', value: selected.ipfs_hash },
                  ].map(({ label, value }) => (
                    <SpotlightCard key={label} className="p-4">
                      <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">{label}</p>
                      <p className="text-xs font-bold text-[var(--text)] font-mono mt-1 truncate">{value}</p>
                    </SpotlightCard>
                  ))}
                </motion.div>
              )}

              {section === 'carbon' && (
                <motion.div
                  key="carbon"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Gross Sequestration', value: `${selected.carbon.gross_co2e.toLocaleString()} tCO₂e`, color: 'text-[var(--text)]' },
                      { label: 'Net Carbon Balance', value: `${selected.carbon.net_co2e.toLocaleString()} tCO₂e`, color: 'text-[var(--text)]' },
                      { label: 'Creditable Carbon', value: `${selected.carbon.creditable.toLocaleString()} tCO₂e`, color: 'text-primary-500' },
                      { label: 'Permanently Retired', value: `${selected.carbon.retired.toLocaleString()} tCO₂e`, color: 'text-red-400' },
                      { label: 'Kalman Buffer Reserve', value: `${selected.carbon.buffer_pool.toLocaleString()} tCO₂e`, color: 'text-blue-400' },
                      { label: 'Sequestration Rate', value: `${selected.carbon.co2e_per_ha_yr} t/ha/yr`, color: 'text-amber-400' },
                    ].map(({ label, value, color }) => (
                      <SpotlightCard key={label} className="p-4.5 text-center">
                        <p className={`text-xl font-extrabold font-mono ${color}`}>{value}</p>
                        <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] mt-1">{label}</p>
                      </SpotlightCard>
                    ))}
                  </div>
                </motion.div>
              )}

              {section === 'mrv' && (
                <motion.div
                  key="mrv"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                    <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Historical Sentinel-2 NDVI Passes</h3>
                    <div className="space-y-2">
                      {selected.mrv_history.map(h => (
                        <div key={h.date} className="flex items-center justify-between p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs">
                          <span className="font-mono text-[var(--text-muted)]">{h.date}</span>
                          <span className="font-mono text-emerald-400 font-bold">NDVI: {h.ndvi.toFixed(2)}</span>
                          <span className="font-mono text-[var(--text)]">{h.creditable.toLocaleString()} tCO₂e</span>
                          <span className="text-[10px] font-bold text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">VERIFIED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {section === 'retirements' && (
                <motion.div
                  key="retirements"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-3"
                >
                  {selected.retirements.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-xs">
                      <div>
                        <p className="font-bold text-[var(--text)]">{r.purpose}</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-mono">{r.buyer} · {r.date}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-bold text-red-400">-{r.amount} tCO₂e</p>
                        <p className="text-[10px] text-primary-500">Burned to address(0)</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
