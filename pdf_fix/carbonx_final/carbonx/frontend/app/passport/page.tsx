'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, MapPin, Shield, Leaf, CheckCircle,
  ExternalLink, Download, Lock, Globe,
  Copy, CheckCheck, Loader
} from 'lucide-react'
import { generatePassportPDF } from '@/lib/pdfGenerator'

const PASSPORTS = [
  {
    id:'CXP-SDB-001', project:'Sundarbans Mangrove Reserve',
    location:'West Bengal, India', coordinates:'21.9497° N, 89.1833° E',
    ecosystem:'Mangrove', area_ha:4262, established:'2024-01-15',
    methodology:'BEE BM FR05.001 + IPCC Tier 2',
    standard:'India CCTS + Verra VCS',
    validator:'Bureau Veritas India (ACVA)', status:'active',
    ndvi_current:0.84, ndvi_baseline:0.35, ndvi_trend:'improving',
    carbon:{ gross_co2e:12400, net_co2e:9840, creditable:8200, retired:1240, buffer_pool:820, available:8200, co2e_per_ha_yr:2.9 },
    mrv_history:[
      { date:'2025-06-15', ndvi:0.84, status:'verified',  creditable:8240 },
      { date:'2025-03-10', ndvi:0.81, status:'verified',  creditable:7980 },
      { date:'2024-12-05', ndvi:0.79, status:'verified',  creditable:7640 },
      { date:'2024-09-01', ndvi:0.76, status:'verified',  creditable:7320 },
    ],
    retirements:[
      { id:'CX-RET-001', date:'2025-06-20', buyer:'TechCorp India',    amount:500, purpose:'Q2 2025 Scope 3 offset'    },
      { id:'CX-RET-002', date:'2025-05-15', buyer:'Green Finance Ltd',  amount:740, purpose:'Annual ESG commitment'     },
    ],
    biodiversity:{ score:98, species:312, keystone:'Bengal Tiger, Irrawaddy Dolphin' },
    community:{ households:4200, jobs:340, benefit_sharing_pct:30 },
    risk:{ permanence:'LOW', leakage:'MEDIUM', additionality:'HIGH' },
    verif_history:[
      { date:'2025-06-30', body:'Bureau Veritas India', outcome:'Approved', tonnes:8240 },
      { date:'2024-12-15', body:'Bureau Veritas India', outcome:'Approved', tonnes:7640 },
    ],
    external_serial:'VCS-9234-2025-MNGRV-IN-SDB',
    ipfs_hash:'QmX7kP9...3vN2',
    tx_hash:'0x3a2f...9b1c',
  },
  {
    id:'CXP-BHT-002', project:'Bhitarkanika Coastal Forest',
    location:'Odisha, India', coordinates:'20.7000° N, 86.9000° E',
    ecosystem:'Mangrove', area_ha:672, established:'2024-03-01',
    methodology:'BEE BM FR05.001 + IPCC Tier 2',
    standard:'India CCTS',
    validator:'SGS India Pvt Ltd (ACVA)', status:'active',
    ndvi_current:0.76, ndvi_baseline:0.32, ndvi_trend:'stable',
    carbon:{ gross_co2e:8200, net_co2e:6560, creditable:5100, retired:420, buffer_pool:510, available:5100, co2e_per_ha_yr:2.4 },
    mrv_history:[
      { date:'2025-06-12', ndvi:0.76, status:'verified', creditable:5100 },
      { date:'2024-12-01', ndvi:0.74, status:'verified', creditable:4840 },
    ],
    retirements:[
      { id:'CX-RET-003', date:'2025-04-10', buyer:'Coastal Corp', amount:420, purpose:'Carbon neutral pledge 2025' },
    ],
    biodiversity:{ score:91, species:215, keystone:'Saltwater Crocodile, Olive Ridley Turtle' },
    community:{ households:1800, jobs:142, benefit_sharing_pct:28 },
    risk:{ permanence:'MEDIUM', leakage:'LOW', additionality:'HIGH' },
    verif_history:[
      { date:'2025-06-20', body:'SGS India', outcome:'Approved', tonnes:5100 },
    ],
    external_serial:'CCTS-1045-2025-MNGRV-IN-BHT',
    ipfs_hash:'QmY8mQ1...4wO3',
    tx_hash:'0x7f11...c3de',
  },
]

const RISK_COLORS: Record<string,string> = {
  LOW:   'text-primary-500 bg-primary-500/10 border-primary-500/20',
  MEDIUM:'text-amber-400   bg-amber-500/10   border-amber-500/20',
  HIGH:  'text-red-400     bg-red-500/10     border-red-500/20',
}

function NDVISparkline({ history }: { history: typeof PASSPORTS[0]['mrv_history'] }) {
  const max = Math.max(...history.map(h => h.ndvi))
  const min = Math.min(...history.map(h => h.ndvi))
  const range = max - min || 0.1
  const W = 120; const H = 32
  const pts = history.map((h, i) => {
    const x = (i / (history.length - 1)) * W
    const y = H - ((h.ndvi - min) / range) * H
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {history.map((h, i) => (
        <circle key={i} cx={(i / (history.length - 1)) * W} cy={H - ((h.ndvi - min) / range) * H} r="2" fill="#10B981"/>
      ))}
    </svg>
  )
}

export default function PassportPage() {
  const [selected, setSelected]     = useState(PASSPORTS[0])
  const [section, setSection]       = useState<string>('overview')
  const [copied, setCopied]         = useState(false)
  const [generating, setGenerating] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text); setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportPDF = async () => {
    setGenerating(true)
    try {
      await new Promise(r => setTimeout(r, 300))
      generatePassportPDF(selected)
    } catch (err) {
      alert('PDF generation failed. Please allow pop-ups for this site.')
    } finally {
      setTimeout(() => setGenerating(false), 1500)
    }
  }

  const SECTIONS = ['overview','carbon','mrv','retirements','biodiversity','community','verification']

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Project Passport</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Complete immutable evidence record for every CarbonX project — like Carfax for carbon
        </p>
      </motion.div>

      {/* Project selector */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {PASSPORTS.map(p => (
          <button key={p.id} onClick={() => { setSelected(p); setSection('overview') }}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${selected.id===p.id?'bg-primary-500 text-white border-primary-500':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500 bg-[var(--card)]'}`}>
            <Leaf className="w-3.5 h-3.5"/>{p.project.split(' ').slice(0,2).join(' ')}
          </button>
        ))}
      </div>

      {/* Passport card */}
      <div className="card overflow-hidden">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary-900/40 to-teal-900/30 p-5 sm:p-6 border-b border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">{selected.project}</h2>
                    <span className="text-[10px] font-bold text-primary-500 bg-primary-500/10 border border-primary-500/20 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3"/>{selected.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">{selected.methodology}</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-medium">{selected.standard}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)]">Passport ID</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <p className="text-sm font-mono font-bold text-[var(--text)]">{selected.id}</p>
                  <button onClick={() => copy(selected.id)} className="text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500"/> : <Copy className="w-3.5 h-3.5"/>}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {/* ✅ WORKING PDF EXPORT BUTTON */}
                <button onClick={handleExportPDF} disabled={generating}
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white px-3 py-2 rounded-lg transition-colors font-medium">
                  {generating
                    ? <><Loader className="w-3 h-3 animate-spin"/> Generating…</>
                    : <><Download className="w-3 h-3"/> Export PDF</>
                  }
                </button>
                <a href={`https://www.oklink.com/amoy/tx/${selected.tx_hash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] sm:text-xs border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-primary-500 px-3 py-2 rounded-lg transition-colors">
                  <ExternalLink className="w-3 h-3"/> On-Chain
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 px-4 pt-3 overflow-x-auto no-scrollbar border-b border-[var(--border)] pb-0">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={`shrink-0 text-[10px] sm:text-xs font-medium px-3 py-2 border-b-2 transition-all capitalize ${section===s?'border-primary-500 text-primary-500':'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">

            {section === 'overview' && (
              <motion.div key="overview" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:'Area',           value:`${selected.area_ha.toLocaleString()} ha`   },
                  { label:'Ecosystem',      value:selected.ecosystem                           },
                  { label:'Established',    value:selected.established                         },
                  { label:'Validator',      value:selected.validator.split('(')[0].trim()      },
                  { label:'Coordinates',    value:selected.coordinates                         },
                  { label:'Current NDVI',   value:selected.ndvi_current.toFixed(2)             },
                  { label:'NDVI Trend',     value:selected.ndvi_trend.toUpperCase()            },
                  { label:'External Serial',value:selected.external_serial                     },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[var(--bg)] rounded-xl p-3">
                    <p className="text-[10px] text-[var(--text-muted)] mb-0.5">{label}</p>
                    <p className="text-xs font-semibold text-[var(--text)] break-all">{value}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {section === 'carbon' && (
              <motion.div key="carbon" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label:'Gross CO₂e',      value:`${selected.carbon.gross_co2e.toLocaleString()} tCO₂e`, color:'text-[var(--text)]'  },
                    { label:'Net CO₂e',        value:`${selected.carbon.net_co2e.toLocaleString()} tCO₂e`,   color:'text-[var(--text)]'  },
                    { label:'Creditable CO₂e', value:`${selected.carbon.creditable.toLocaleString()} tCO₂e`, color:'text-primary-500'    },
                    { label:'Retired',         value:`${selected.carbon.retired.toLocaleString()} tCO₂e`,    color:'text-red-400'        },
                    { label:'Buffer Pool',     value:`${selected.carbon.buffer_pool.toLocaleString()} tCO₂e`,color:'text-blue-400'       },
                    { label:'CO₂e/ha/yr',      value:`${selected.carbon.co2e_per_ha_yr} t`,                  color:'text-amber-400'      },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[var(--bg)] rounded-xl p-3 text-center">
                      <p className={`text-base font-black ${color}`}>{value}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[var(--bg)] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[var(--text)] mb-2">Methodology: {selected.methodology}</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                    Formula: Net Removals = Project Removals − Baseline Removals − Leakage − Uncertainty Discount<br/>
                    Calculated using IPCC Tier 2 allometric equations. Independent verification by {selected.validator} required.
                  </p>
                </div>
              </motion.div>
            )}

            {section === 'mrv' && (
              <motion.div key="mrv" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text)]">NDVI Trend</h3>
                  <NDVISparkline history={selected.mrv_history}/>
                </div>
                <div className="space-y-2">
                  {selected.mrv_history.map((run, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
                      <CheckCircle className="w-4 h-4 text-primary-500 shrink-0"/>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-[var(--text)]">{run.date}</p>
                          <p className="text-xs font-bold text-primary-500">{run.creditable.toLocaleString()} tCO₂e</p>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">NDVI: {run.ndvi.toFixed(3)} · Sentinel-2 · SHA-256 signed</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {section === 'retirements' && (
              <motion.div key="retirements" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-2">
                {selected.retirements.map(r => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
                    <Lock className="w-4 h-4 text-red-400 shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--text)] truncate">{r.buyer}</p>
                        <p className="text-xs font-bold text-red-400 shrink-0">{r.amount} tCO₂e</p>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{r.purpose} · {r.date}</p>
                      <p className="text-[10px] font-mono text-blue-400">{r.id}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
                  All retirements are permanent and publicly verifiable on the Polygon blockchain
                </p>
              </motion.div>
            )}

            {section === 'biodiversity' && (
              <motion.div key="biodiversity" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-3">
                {[
                  { label:'Biodiversity Score',    value:`${selected.biodiversity.score}/100`                  },
                  { label:'Species Count',         value:`${selected.biodiversity.species}+`                    },
                  { label:'Keystone Species',      value:selected.biodiversity.keystone                        },
                  { label:'Ecosystem Type',        value:selected.ecosystem                                     },
                  { label:'Protection Level',      value:'IUCN Category II — National Park equivalent'         },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl">
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    <p className="text-xs font-semibold text-[var(--text)] text-right max-w-[60%]">{value}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {section === 'community' && (
              <motion.div key="community" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-3">
                {[
                  { label:'Households Benefiting', value:`${selected.community.households.toLocaleString()}`           },
                  { label:'Direct Jobs Created',   value:`${selected.community.jobs}`                                   },
                  { label:'Benefit Sharing',       value:`${selected.community.benefit_sharing_pct}% of credit revenue` },
                  { label:'Consultation Status',   value:'Community agreements signed ✅'                               },
                  { label:'Grievance Mechanism',   value:'Active — /grievance for complaints'                           },
                  { label:'Gender Inclusion',      value:'35% women in project employment'                             },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between p-3 bg-[var(--bg)] rounded-xl">
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    <p className="text-xs font-semibold text-[var(--text)] text-right max-w-[60%]">{value}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {section === 'verification' && (
              <motion.div key="verification" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(selected.risk).map(([key, val]) => (
                    <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${RISK_COLORS[val as string]}`}>
                      {key.charAt(0).toUpperCase()+key.slice(1)} Risk: {val}
                    </div>
                  ))}
                </div>
                {selected.verif_history.map((v, i) => (
                  <div key={i} className="p-3 bg-[var(--bg)] rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-[var(--text)]">{v.body}</p>
                      <span className="text-[10px] text-primary-500 font-bold bg-primary-500/10 px-2 py-0.5 rounded-full">{v.outcome}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">{v.date} · {v.tonnes.toLocaleString()} tCO₂e verified</p>
                  </div>
                ))}
                <div className="p-3 bg-[var(--bg)] rounded-xl">
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold mb-1">On-Chain Evidence</p>
                  <p className="text-[10px] font-mono text-blue-400 break-all">IPFS: {selected.ipfs_hash}</p>
                  <p className="text-[10px] font-mono text-blue-400 break-all mt-0.5">Tx: {selected.tx_hash}</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* PDF export hint */}
      <div className="card p-3 border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
        <FileText className="w-4 h-4 text-blue-400 shrink-0"/>
        <p className="text-[10px] text-[var(--text-muted)]">
          Click <strong className="text-[var(--text)]">Export PDF</strong> to generate a complete A4 Project Passport with all carbon accounting, MRV history, retirements, biodiversity data, and verification records. Allow pop-ups when prompted.
        </p>
      </div>
    </div>
  )
}
