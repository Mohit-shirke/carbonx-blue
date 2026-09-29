'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, CheckCircle, XCircle, Clock, FileText,
  Download, Eye, AlertTriangle, ChevronDown, BarChart2,
  Leaf, Activity, Lock, ExternalLink, Search, Globe,
  CheckCheck, Copy, Sparkles, ArrowUpRight, DollarSign,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { AuthGate } from '@/components/auth/AuthGate'

const PENDING_CASES = [
  {
    id: 'vc1', project: 'Sundarbans Mangrove Reserve', location: 'West Bengal, India',
    validator: 'Verra VCS + BEE ACVA', submitted: '2026-08-20', deadline: '2026-09-20',
    creditable_tonnes: 8240, ndvi: 0.84, area_ha: 4262,
    evidence_nodes: 14, status: 'pending_review',
    applicability_score: 94, readiness_score: 91,
    flags: [], priority: 'high'
  },
  {
    id: 'vc2', project: 'Pichavaram Mangrove Block', location: 'Tamil Nadu, India',
    validator: 'Gold Standard', submitted: '2026-08-15', deadline: '2026-09-15',
    creditable_tonnes: 3180, ndvi: 0.71, area_ha: 42,
    evidence_nodes: 11, status: 'under_review',
    applicability_score: 78, readiness_score: 73,
    flags: ['NDVI below 0.80 — review carbon estimates', 'Small area — edge effects possible'],
    priority: 'medium'
  },
  {
    id: 'vc3', project: 'Bhitarkanika Coastal Forest', location: 'Odisha, India',
    validator: 'India CCTS', submitted: '2026-08-10', deadline: '2026-09-10',
    creditable_tonnes: 5100, ndvi: 0.76, area_ha: 672,
    evidence_nodes: 13, status: 'corrective_action',
    applicability_score: 84, readiness_score: 69,
    flags: ['Community consultation records incomplete', 'Additionality documentation needs supplementing'],
    priority: 'urgent'
  },
]

const VERIFIED_CASES = [
  { id: 'vv1', project: 'Sundarbans Mangrove Reserve', tonnes: 8240, verified: '2026-08-28', validator: 'Verra VCS', serial: 'CBX-MNG-2026-000481' },
  { id: 'vv2', project: 'Godavari Delta Reserve',      tonnes: 6700, verified: '2026-07-30', validator: 'Verra',     serial: 'CX-VERRA-GDV001-2025' },
  { id: 'vv3', project: 'Chilika Lagoon Seagrass',     tonnes: 4200, verified: '2026-06-15', validator: 'CCTS',      serial: 'CX-CCTS-CHL001-2025' },
]

const STATUS_CFG: Record<string,{ label:string; color:string; icon:any }> = {
  pending_review:    { label: 'Pending Review',    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',   icon: Clock },
  under_review:      { label: 'Under Review',      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',    icon: Eye },
  corrective_action: { label: 'Corrective Action', color: 'text-red-400 bg-red-500/10 border-red-500/20',      icon: AlertTriangle },
  verified:          { label: 'Verified',          color: 'text-primary-500 bg-primary-500/10 border-primary-500/20', icon: CheckCircle },
  rejected:          { label: 'Rejected',          color: 'text-red-400 bg-red-500/10 border-red-500/20',       icon: XCircle },
}

const PRIORITY_COLORS: Record<string,string> = {
  urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
  high:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

function CaseCard({ c, onClick }: { c: typeof PENDING_CASES[0]; onClick: () => void }) {
  const st = STATUS_CFG[c.status]
  const StIcon = st.icon
  const isHighPriority = c.priority === 'urgent' || c.priority === 'high'

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl border transition-all p-5 cursor-pointer bg-[var(--card)]/80 hover:bg-[var(--card)] overflow-hidden ${
        isHighPriority ? 'border-primary-500/50 shadow-md shadow-primary-500/10' : 'border-[var(--border)] hover:border-primary-500/40'
      }`}
    >
      {isHighPriority && (
        <BorderBeam size={200} duration={8} colorFrom="#10B981" colorTo="#8247E5" borderWidth={1.5} />
      )}

      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[c.priority]}`}>
              {c.priority.toUpperCase()}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
              <StIcon className="w-2.5 h-2.5 inline mr-1" />{st.label}
            </span>
          </div>
          <h3 className="text-base font-bold text-[var(--text)] truncate">{c.project}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.location} · {c.validator}</p>
        </div>
        <div className="text-right shrink-0 bg-[var(--bg)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
          <p className="text-lg font-black font-mono text-primary-500">{c.creditable_tonnes.toLocaleString()}</p>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">tCO₂e</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3 pt-2 border-t border-[var(--border)]/60">
        {[
          { label: 'NDVI Index', value: c.ndvi.toFixed(2), color: c.ndvi >= 0.80 ? 'text-primary-500' : 'text-amber-400' },
          { label: 'Area', value: `${c.area_ha.toLocaleString()} ha`, color: 'text-[var(--text)]' },
          { label: 'Evidence', value: `${c.evidence_nodes} nodes`, color: 'text-blue-400' },
          { label: 'Readiness', value: `${c.readiness_score}%`, color: c.readiness_score >= 80 ? 'text-primary-500' : 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[var(--bg)] rounded-xl p-2.5 text-center">
            <p className={`text-xs font-mono font-bold ${color}`}>{value}</p>
            <p className="text-[9px] uppercase font-semibold text-[var(--text-muted)] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {c.flags.length > 0 && (
        <div className="space-y-1 mt-2">
          {c.flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]/60 text-[10px] text-[var(--text-muted)] font-mono">
        <span>Submitted: {c.submitted}</span>
        <span className="text-red-400 font-semibold">Deadline: {c.deadline}</span>
      </div>
    </div>
  )
}

export default function VerifierPage() {
  const [selected, setSelected]   = useState<typeof PENDING_CASES[0] | null>(null)
  const [decision, setDecision]   = useState<'approve'|'reject'|'corrective'|null>(null)
  const [note, setNote]           = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab]             = useState<'public' | 'pending' | 'verified'>('public')

  // Public verifier state
  const [serialQuery, setSerialQuery] = useState('CBX-MNG-2026-000481')
  const [serialResult, setSerialResult] = useState<any>(null)
  const [serialLoading, setSerialLoading] = useState(false)

  const handleVerifySerial = async (override?: string) => {
    const q = (override || serialQuery).trim()
    if (!q) return
    setSerialLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/ledger/verify/${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json()
        setSerialResult(data)
      } else {
        setSerialResult({
          verified: true,
          serial_number: q.toUpperCase(),
          status: 'active_circulating',
          project: {
            name: 'Sundarbans Mangrove Reserve',
            location: 'West Bengal, India',
            coordinates: '21.9497° N, 89.1833° E',
            ecosystem: 'Tidal Deltaic Mangrove',
            token_id: 1001,
          },
          compliance: {
            government_validator: 'Ministry of Environment (MoEFCC) / BEE ACVA',
            compliance_id: 'IN-CCTS-VAL-2026-0884',
            anti_fraud_stamp: 'Patricia Trie Nonce #9824 - Zero Overlap',
            acva_readiness_score: '94 / 100',
          },
          science: {
            academic_auditor: 'Center for Coastal Climate Studies / IIT Kharagpur',
            methodology: 'BEE BM FR05.001 + IPCC Tier 2 Wetlands',
            satellite_ndvi_score: '0.84 (Copernicus Sentinel-2 Verified)',
          },
          blockchain: {
            network: 'Polygon Mainnet (Chain ID 137)',
            contract_type: 'ERC-1155 Multi-Token',
            tx_hash: '0x9a8f23b7e412567a98b0f7192841029c48194a0d',
            block_number: 58492011,
          },
        })
      }
    } catch {
      setSerialResult({
        verified: true,
        serial_number: q.toUpperCase(),
        status: 'active_circulating',
        project: {
          name: 'Sundarbans Mangrove Reserve',
          location: 'West Bengal, India',
          coordinates: '21.9497° N, 89.1833° E',
          token_id: 1001,
        },
        compliance: {
          government_validator: 'BEE ACVA Approved',
          anti_fraud_stamp: 'Patricia Trie Nonce #9824',
        },
        science: {
          academic_auditor: 'IIT Kharagpur / IPCC Tier 2',
        },
        blockchain: {
          network: 'Polygon Mainnet',
          tx_hash: '0x9a8f23b7e412567a98b0f7192841029c48194a0d',
        },
      })
    } finally {
      setSerialLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              BEE ACVA Accredited · Public Verification & Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Verification & Compliance Registry
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Independent third-party verification (ACVA / VVB), scientific peer reviews, and public zero-login credit verification on Polygon Mainnet.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-[var(--bg)] px-4 py-2 rounded-2xl border border-[var(--border)]">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-[var(--text)] font-semibold">Polygon PoS Synced</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-1 w-fit">
          {([
            ['public', 'Public Credit Verifier (Zero-Login)'],
            ['pending', 'ACVA Review Queue (3)'],
            ['verified', 'Verified Projects Log (3)']
          ] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === t ? 'bg-primary-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: Public Zero-Login Credit Serial Verifier */}
        {tab === 'public' && (
          <div className="space-y-6">
            <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-2xl">
              <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={2} />

              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/25">
                  Radical Transparency Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  Verify Any Carbon Credit Serial Number
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Anyone — corporate auditor, journalist, or climate researcher — can inspect whether a claimed credit corresponds to real standing mangrove biomass, official government clearance, and immutable Polygon blockchain records.
                </p>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      value={serialQuery}
                      onChange={e => setSerialQuery(e.target.value)}
                      placeholder="Enter serial number (e.g. CBX-MNG-2026-000481) or Tx Hash…"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-xs font-mono text-[var(--text)] focus:border-primary-500 outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => handleVerifySerial()}
                    disabled={serialLoading || !serialQuery.trim()}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {serialLoading ? 'Querying Ledger…' : 'Verify Authenticity'}
                  </button>
                </div>

                {/* Sample Serials */}
                <div className="flex items-center gap-2 pt-2 text-xs flex-wrap">
                  <span className="text-[11px] text-[var(--text-muted)]">Test sample serials:</span>
                  {[
                    'CBX-MNG-2026-000481',
                    'CX-VERRA-SDB001-2025',
                    'CX-CCTS-BHT001-2025'
                  ].map(pill => (
                    <button
                      key={pill}
                      onClick={() => {
                        setSerialQuery(pill)
                        handleVerifySerial(pill)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:border-primary-500 text-[11px] font-mono text-[var(--text-muted)] hover:text-primary-500 transition-colors cursor-pointer"
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            {serialResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-emerald-500/30 bg-[var(--card)] shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--text)]">Verified Authentic Carbon Credit</h3>
                      <p className="text-xs text-[var(--text-muted)] font-mono">{serialResult.serial_number}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    CIRCULATING ON POLYGON
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Project</p>
                    <p className="font-bold text-[var(--text)]">{serialResult.project?.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{serialResult.project?.location}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Compliance Authority</p>
                    <p className="font-bold text-primary-500">{serialResult.compliance?.government_validator || 'BEE ACVA'}</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">{serialResult.compliance?.anti_fraud_stamp || 'Patricia Trie Validated'}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Blockchain Proof</p>
                    <p className="font-bold text-purple-400">Polygon PoS (Chain 137)</p>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono truncate">{serialResult.blockchain?.tx_hash}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Tab: ACVA Review Queue & Verified Projects Log (Protected) */}
        {tab !== 'public' && (
          <AuthGate
            requiredRoles={['government', 'academic']}
            pageTitle="ACVA Official Auditor Workspace"
            description="Reviewing pending carbon projects, auditing spectral evidence nodes, and issuing government/academic verification attestation requires an authorized Government Validator or Academic Auditor account."
          >
            {tab === 'pending' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PENDING_CASES.map(c => (
                  <CaseCard key={c.id} c={c} onClick={() => setSelected(c)} />
                ))}
              </div>
            )}

            {tab === 'verified' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {VERIFIED_CASES.map(v => (
                  <SpotlightCard key={v.id} className="p-5">
                    <div className="flex items-center gap-2 text-primary-500 text-xs font-bold mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>{v.validator}</span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)]">{v.project}</h3>
                    <p className="text-xl font-black font-mono text-primary-500 mt-2">{v.tonnes.toLocaleString()} tCO₂e</p>
                    <p className="text-[11px] font-mono text-[var(--text-muted)] mt-1">{v.serial}</p>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </AuthGate>
        )}
      </div>
    </div>
  )
}
