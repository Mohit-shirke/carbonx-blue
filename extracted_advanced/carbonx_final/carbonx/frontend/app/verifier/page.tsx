'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, CheckCircle, XCircle, Clock, FileText,
  Download, Eye, AlertTriangle, ChevronDown, BarChart2,
  Leaf, Activity, Lock, ExternalLink, Search
} from 'lucide-react'
import Link from 'next/link'

// Mock data for verifier portal
const PENDING_CASES = [
  {
    id:'vc1', project:'Sundarbans Mangrove Reserve', location:'West Bengal, India',
    validator:'Verra VCS', submitted:'2025-06-20', deadline:'2025-07-20',
    creditable_tonnes: 8240, ndvi: 0.84, area_ha: 4262,
    evidence_nodes: 14, status:'pending_review',
    applicability_score: 92, readiness_score: 87,
    flags: [], priority:'high'
  },
  {
    id:'vc2', project:'Pichavaram Mangrove Block', location:'Tamil Nadu, India',
    validator:'Gold Standard', submitted:'2025-06-15', deadline:'2025-07-15',
    creditable_tonnes: 3180, ndvi: 0.71, area_ha: 42,
    evidence_nodes: 11, status:'under_review',
    applicability_score: 78, readiness_score: 73,
    flags: ['NDVI below 0.80 — review carbon estimates', 'Small area — edge effects possible'],
    priority:'medium'
  },
  {
    id:'vc3', project:'Bhitarkanika Coastal Forest', location:'Odisha, India',
    validator:'CCTS', submitted:'2025-06-10', deadline:'2025-07-10',
    creditable_tonnes: 5100, ndvi: 0.76, area_ha: 672,
    evidence_nodes: 13, status:'corrective_action',
    applicability_score: 84, readiness_score: 69,
    flags: ['Community consultation records incomplete', 'Additionality documentation needs supplementing'],
    priority:'urgent'
  },
]

const VERIFIED_CASES = [
  { id:'vv1', project:'Godavari Delta Reserve', tonnes: 6700, verified:'2025-05-30', validator:'Verra', serial:'CX-VERRA-GDV001-2025' },
  { id:'vv2', project:'Chilika Lagoon',         tonnes: 4200, verified:'2025-04-15', validator:'CCTS',  serial:'CX-CCTS-CHL001-2025' },
]

const STATUS_CFG: Record<string,{ label:string; color:string; icon:any }> = {
  pending_review:   { label:'Pending Review',    color:'text-amber-400  bg-amber-500/10  border-amber-500/20',  icon:Clock        },
  under_review:     { label:'Under Review',      color:'text-blue-400   bg-blue-500/10   border-blue-500/20',   icon:Eye          },
  corrective_action:{ label:'Corrective Action', color:'text-red-400    bg-red-500/10    border-red-500/20',    icon:AlertTriangle},
  verified:         { label:'Verified',          color:'text-primary-500 bg-primary-500/10 border-primary-500/20',icon:CheckCircle },
  rejected:         { label:'Rejected',          color:'text-red-400    bg-red-500/10    border-red-500/20',    icon:XCircle     },
}

const PRIORITY_COLORS: Record<string,string> = {
  urgent:'text-red-400 bg-red-500/10',
  high:  'text-amber-400 bg-amber-500/10',
  medium:'text-blue-400 bg-blue-500/10',
}

function EvidenceLineage({ nodes }: { nodes: number }) {
  const LAYERS = [
    { label:'Sentinel-2 Imagery',       icon:'🛰️', color:'bg-blue-500/20'   },
    { label:'NDVI Processing',          icon:'📊', color:'bg-teal-500/20'   },
    { label:'Baseline Model',           icon:'📈', color:'bg-amber-500/20'  },
    { label:'Carbon Accounting',        icon:'🧮', color:'bg-purple-500/20' },
    { label:'Leakage + Uncertainty',    icon:'⚖️', color:'bg-pink-500/20'   },
    { label:'Evidence Graph',           icon:'🔗', color:'bg-primary-500/20'},
    { label:'CarbonX QA Gate',          icon:'✅', color:'bg-green-500/20'  },
  ]
  return (
    <div className="space-y-1.5">
      {LAYERS.map((layer, i) => (
        <motion.div key={layer.label}
          initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${layer.color}`}>
          <span className="text-sm">{layer.icon}</span>
          <span className="text-xs font-medium text-[var(--text)]">{layer.label}</span>
          <div className="ml-auto flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-primary-500"/>
            <span className="text-[10px] text-[var(--text-muted)]">Verified</span>
          </div>
        </motion.div>
      ))}
      <div className="text-center mt-2">
        <span className="text-[10px] text-[var(--text-muted)]">{nodes} evidence nodes · Tamper-evident SHA-256 hashes</span>
      </div>
    </div>
  )
}

function CaseCard({ c, onClick }: { c: typeof PENDING_CASES[0]; onClick: () => void }) {
  const st = STATUS_CFG[c.status]
  const StIcon = st.icon
  return (
    <motion.div className="card p-4 cursor-pointer hover:border-primary-500/40 transition-all"
      whileHover={{ scale:1.01 }} onClick={onClick}
      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority]}`}>
              {c.priority.toUpperCase()}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
              <StIcon className="w-2.5 h-2.5 inline mr-1"/>{st.label}
            </span>
          </div>
          <h3 className="text-sm font-bold text-[var(--text)] truncate">{c.project}</h3>
          <p className="text-[10px] text-[var(--text-muted)]">{c.location} · {c.validator}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-black text-primary-500">{c.creditable_tonnes.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--text-muted)]">tCO₂e</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label:'NDVI',     value:c.ndvi.toFixed(2),              color: c.ndvi>=0.80?'text-primary-500':'text-amber-400' },
          { label:'Area',     value:`${c.area_ha.toLocaleString()} ha`, color:'text-[var(--text)]' },
          { label:'Evidence', value:`${c.evidence_nodes} nodes`,    color:'text-blue-400' },
          { label:'Ready',    value:`${c.readiness_score}%`,        color: c.readiness_score>=80?'text-primary-500':'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[var(--bg)] rounded-lg p-2 text-center">
            <p className={`text-xs font-bold ${color}`}>{value}</p>
            <p className="text-[9px] text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      {c.flags.length > 0 && (
        <div className="space-y-1">
          {c.flags.map((flag, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
              <AlertTriangle className="w-3 h-3 shrink-0"/>{flag}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
        <span>Submitted: {c.submitted}</span>
        <span className="text-red-400">Deadline: {c.deadline}</span>
      </div>
    </motion.div>
  )
}

export default function VerifierPage() {
  const [selected, setSelected]   = useState<typeof PENDING_CASES[0] | null>(null)
  const [decision, setDecision]   = useState<'approve'|'reject'|'corrective'|null>(null)
  const [note, setNote]           = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [search, setSearch]       = useState('')
  const [tab, setTab]             = useState<'pending'|'verified'>('pending')

  const filtered = PENDING_CASES.filter(c =>
    !search || c.project.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmitDecision = async () => {
    if (!decision || !note.trim()) return
    setSubmitted(true)
    setTimeout(() => { setSelected(null); setDecision(null); setNote(''); setSubmitted(false) }, 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-500"/>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Verifier Portal</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">ACVA / VVB</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Independent validation & verification — required before any credit issuance</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"/>
          {PENDING_CASES.length} cases pending
        </div>
      </div>

      {/* Important notice */}
      <div className="card p-4 border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">Independent Verification Required</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
            CarbonX AI provides supporting evidence only. Final verification decisions must be made by an accredited ACVA/VVB independent of the project developer.
            No credits are minted without verifier approval. This portal complies with ICVCM Core Carbon Principles and India CCTS ACVA requirements.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Pending Review',   value:PENDING_CASES.filter(c=>c.status==='pending_review').length,   color:'text-amber-400',   icon:Clock         },
          { label:'Under Review',     value:PENDING_CASES.filter(c=>c.status==='under_review').length,     color:'text-blue-400',    icon:Eye           },
          { label:'Corrective Action',value:PENDING_CASES.filter(c=>c.status==='corrective_action').length,color:'text-red-400',     icon:AlertTriangle },
          { label:'Verified (All)',   value:VERIFIED_CASES.length,                                         color:'text-primary-500', icon:CheckCircle   },
        ].map(({ label, value, color, icon:Icon }, i) => (
          <motion.div key={label} className="card p-3 sm:p-4"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
            <Icon className={`w-4 h-4 ${color} mb-2`}/>
            <p className={`text-xl sm:text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {([['pending','Pending Cases'],['verified','Verified']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab===t?'bg-primary-500 text-white':'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'pending' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Case list */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cases…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
            </div>
            {filtered.map(c => <CaseCard key={c.id} c={c} onClick={() => { setSelected(c); setDecision(null); setNote(''); setSubmitted(false) }}/>)}
          </div>

          {/* Detail panel */}
          <div>
            {selected ? (
              <motion.div className="card p-5 space-y-5 sticky top-20"
                initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-base text-[var(--text)]">{selected.project}</h2>
                    <p className="text-xs text-[var(--text-muted)]">{selected.validator} · {selected.location}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-[var(--text-muted)] hover:text-[var(--text)] text-lg">✕</button>
                </div>

                {/* Readiness score */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[var(--text)]">Project Readiness Score</span>
                    <span className={`text-sm font-bold ${selected.readiness_score>=80?'text-primary-500':selected.readiness_score>=60?'text-amber-400':'text-red-400'}`}>{selected.readiness_score}/100</span>
                  </div>
                  <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${selected.readiness_score>=80?'bg-primary-500':selected.readiness_score>=60?'bg-amber-500':'bg-red-500'}`}
                      initial={{ width:0 }} animate={{ width:`${selected.readiness_score}%` }} transition={{ duration:0.8 }}/>
                  </div>
                </div>

                {/* Carbon accounting summary */}
                <div>
                  <h3 className="text-xs font-bold text-[var(--text)] mb-2">Carbon Accounting (IPCC Tier 2)</h3>
                  <div className="bg-[var(--bg)] rounded-xl p-3 space-y-1.5 text-xs">
                    {[
                      { label:'Methodology',      value:'BEE BM FR05.001 + IPCC Tier 2' },
                      { label:'NDVI Score',        value:selected.ndvi.toFixed(3)        },
                      { label:'Area',              value:`${selected.area_ha.toLocaleString()} ha` },
                      { label:'Creditable tCO₂e', value:`${selected.creditable_tonnes.toLocaleString()}`, highlight:true },
                      { label:'Evidence Nodes',   value:`${selected.evidence_nodes} (SHA-256 hashed)` },
                      { label:'Applicability',    value:`${selected.applicability_score}/100` },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className={`font-semibold ${highlight?'text-primary-500':'text-[var(--text)]'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence lineage */}
                <div>
                  <h3 className="text-xs font-bold text-[var(--text)] mb-2">Evidence Lineage</h3>
                  <EvidenceLineage nodes={selected.evidence_nodes}/>
                </div>

                {/* Flags */}
                {selected.flags.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)] mb-2">Flags for Review</h3>
                    <div className="space-y-1.5">
                      {selected.flags.map((f,i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5"/>{f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decision */}
                {submitted ? (
                  <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                    className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-primary-500 mx-auto mb-2"/>
                    <p className="text-sm font-bold text-[var(--text)]">Decision submitted successfully</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Project developer and CarbonX admin notified</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-[var(--text)]">Verification Decision</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id:'approve'   as const, label:'Approve',    color:'bg-primary-500 hover:bg-primary-600 text-white' },
                        { id:'corrective'as const, label:'Corrective', color:'bg-amber-500   hover:bg-amber-600   text-white' },
                        { id:'reject'   as const,  label:'Reject',     color:'bg-red-500     hover:bg-red-600     text-white' },
                      ]).map(({ id, label, color }) => (
                        <button key={id} onClick={() => setDecision(id)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border-2 ${decision===id?`${color} border-transparent`:`border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500`}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
                      placeholder="Enter verification findings, corrective actions required, or approval rationale…"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
                    <button onClick={handleSubmitDecision} disabled={!decision || !note.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                      <Shield className="w-4 h-4"/> Submit Verification Decision
                    </button>
                    <p className="text-[10px] text-center text-[var(--text-muted)]">
                      This decision is recorded in the audit log and linked to your verifier credentials
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center text-center h-64">
                <Shield className="w-10 h-10 text-[var(--text-muted)] opacity-30 mb-3"/>
                <p className="text-sm text-[var(--text-muted)]">Select a case to review evidence and submit your verification decision</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                {['Project','Tonnes Verified','Verified Date','Standard','Serial Range'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VERIFIED_CASES.map(v => (
                <tr key={v.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--text)]">{v.project}</td>
                  <td className="px-4 py-3 text-primary-500 font-bold">{v.tonnes.toLocaleString()} tCO₂e</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{v.verified}</td>
                  <td className="px-4 py-3"><span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{v.validator}</span></td>
                  <td className="px-4 py-3 font-mono text-[var(--text-muted)] text-[10px]">{v.serial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
