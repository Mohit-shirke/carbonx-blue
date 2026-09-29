'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf, MapPin, Shield, CheckCircle, AlertTriangle,
  ChevronRight, ChevronLeft, Loader, FileText,
  Users, Globe, BarChart2, Lock, Info, XCircle
} from 'lucide-react'

// ── Multi-step project proposal wizard ───────────────────────────
const STEPS = [
  { id:1, title:'Project Identity',       icon:Leaf,     desc:'Basic project information'            },
  { id:2, title:'Location & Boundary',    icon:MapPin,   desc:'GPS coordinates and area'             },
  { id:3, title:'Ecosystem & Ecology',    icon:Globe,    desc:'Ecosystem type and condition'         },
  { id:4, title:'Legal Rights',           icon:Shield,   desc:'Land tenure and community agreements' },
  { id:5, title:'Additionality',          icon:BarChart2,desc:'Why this project is additional'       },
  { id:6, title:'Community Safeguards',   icon:Users,    desc:'Social impact and benefit sharing'    },
  { id:7, title:'Review & Submit',        icon:FileText, desc:'Review all information and submit'    },
]

// BEE BM FR05.001 eligibility check
function checkMethodologyEligibility(form: any) {
  return [
    { rule:'Degraded mangrove habitat',         pass: form.is_degraded === 'yes',           fatal:true,  detail:'BEE BM FR05.001 §4.1 — Must be degraded mangrove' },
    { rule:'≥90% mangrove species planting',    pass: parseInt(form.mangrove_pct||'0')>=90, fatal:true,  detail:'BEE BM FR05.001 §4.3 — >90% mangrove species' },
    { rule:'No soil disturbance',               pass: form.soil_disturbance === 'no',       fatal:true,  detail:'BEE BM FR05.001 §4.4 — No significant soil disturbance' },
    { rule:'Valid hydrology',                   pass: form.hydrology === 'intact',           fatal:false, detail:'Tidal hydrology should be intact for restoration success' },
    { rule:'Legal land access',                 pass: form.land_tenure === 'owned' || form.land_tenure === 'leased', fatal:true, detail:'Valid land tenure required' },
    { rule:'Community consultation completed',  pass: form.community_consulted === 'yes',   fatal:false, detail:'ICVCM CCPs require free, prior and informed consent' },
    { rule:'Project not already government funded', pass: form.govt_funded !== 'fully',     fatal:false, detail:'MISHTI/government-funded projects need additionality check' },
    { rule:'Minimum area ≥ 0.1 ha',             pass: parseFloat(form.area_ha||'0')>=0.1,  fatal:true,  detail:'Minimum project area required' },
  ]
}

function calculateReadinessScore(form: any) {
  const weights: Record<string,number> = {
    legal_score:9, ecology_score:8, community_score:7,
    additionality_score:9, methodology_score:8, mrv_score:6,
    financial_score:5, permanence_score:6
  }
  let total = 0; let maxTotal = 0
  Object.entries(weights).forEach(([key, w]) => {
    const val = parseInt(form[key] || '0')
    total    += val * w
    maxTotal += 100 * w
  })
  return Math.round((total / maxTotal) * 100)
}

export default function ProposePage() {
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState<Record<string,string>>({})
  const [submitting, setSub]  = useState(false)
  const [submitted, setDone]  = useState(false)
  const [refId, setRefId]     = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const next = () => setStep(s => Math.min(s + 1, 7))
  const prev = () => setStep(s => Math.max(s - 1, 1))

  const submit = async () => {
    setSub(true)
    await new Promise(r => setTimeout(r, 2000))
    const ref = `CXP-${Date.now().toString(36).toUpperCase().slice(-8)}`
    setRefId(ref); setDone(true); setSub(false)
  }

  const eligibility     = checkMethodologyEligibility(form)
  const fatalFailures   = eligibility.filter(e => !e.pass && e.fatal)
  const readinessScore  = calculateReadinessScore(form)
  const gate = readinessScore >= 80 ? 'ADVANCE' : readinessScore >= 60 ? 'CONDITIONAL' : readinessScore >= 40 ? 'REVIEW' : 'REJECT'
  const gateColors: Record<string,string> = {
    ADVANCE:'text-primary-500 bg-primary-500/10 border-primary-500/20',
    CONDITIONAL:'text-amber-400 bg-amber-500/10 border-amber-500/20',
    REVIEW:'text-orange-400 bg-orange-500/10 border-orange-500/20',
    REJECT:'text-red-400 bg-red-500/10 border-red-500/20'
  }

  if (submitted) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300 }}
        className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-primary-500"/>
      </motion.div>
      <h2 className="text-2xl font-bold text-[var(--text)]">Proposal Submitted!</h2>
      <p className="text-[var(--text-muted)]">Your project proposal has been received. Our team will review within 5 business days.</p>
      <div className="card p-6 text-center">
        <p className="text-xs text-[var(--text-muted)]">Reference ID</p>
        <p className="text-2xl font-mono font-black text-primary-500 mt-1">{refId}</p>
        <p className="text-xs text-[var(--text-muted)] mt-2">Save this ID to track your proposal status</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { step:'1', label:'Initial Review',  time:'1–2 days'  },
          { step:'2', label:'Due Diligence',   time:'5–10 days' },
          { step:'3', label:'MRV Scheduling',  time:'2–4 weeks' },
        ].map(({ step: s, label, time }) => (
          <div key={s} className="card p-3">
            <div className="w-6 h-6 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-[10px] font-bold text-primary-500">{s}</span>
            </div>
            <p className="text-xs font-semibold text-[var(--text)]">{label}</p>
            <p className="text-[10px] text-[var(--text-muted)]">{time}</p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Propose a Carbon Project</h1>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          BEE BM FR05.001 eligibility wizard · Automated additionality assessment · CarbonX due diligence
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${step===s.id?'bg-primary-500 text-white':step>s.id?'bg-primary-500/10 text-primary-500':'bg-[var(--border)] text-[var(--text-muted)]'}`}>
              {step > s.id ? <CheckCircle className="w-3 h-3"/> : <s.icon className="w-3 h-3"/>}
              <span className="hidden sm:block">{s.title}</span>
              <span className="sm:hidden">{s.id}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-[var(--border)] shrink-0"/>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Form */}
        <div className="lg:col-span-2 card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            {React.createElement(STEPS[step-1].icon, { className:"w-5 h-5 text-primary-500" })}
            <div>
              <h2 className="font-bold text-sm text-[var(--text)]">{STEPS[step-1].title}</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Step {step} of {STEPS.length} · {STEPS[step-1].desc}</p>
            </div>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-16 }} className="space-y-4">

              {step === 1 && <>
                <Field label="Project Name" required><input value={form.name||''} onChange={set('name')} placeholder="e.g. Sundarbans Mangrove Restoration Block A" className={inputCls}/></Field>
                <Field label="Organisation / NGO Name" required><input value={form.org||''} onChange={set('org')} placeholder="e.g. Mangrove Foundation of India" className={inputCls}/></Field>
                <Field label="Contact Email" required><input type="email" value={form.email||''} onChange={set('email')} placeholder="contact@ngo.org" className={inputCls}/></Field>
                <Field label="Project Description" required>
                  <textarea value={form.description||''} onChange={set('description')} rows={4} placeholder="Describe the project goals, restoration approach, and expected outcomes…" className={`${inputCls} resize-none`}/>
                </Field>
                <Field label="Target Methodology">
                  <select value={form.methodology||''} onChange={set('methodology')} className={inputCls}>
                    <option value="">Select methodology…</option>
                    <option value="BEE_BM_FR05_001">BEE BM FR05.001 — Afforestation/Reforestation of Degraded Mangrove Habitats (India CCTS)</option>
                    <option value="VCS_VM0033">Verra VM0033 — Tidal Wetland and Seagrass Restoration</option>
                    <option value="ISOMETRIC_MANGROVE">Isometric Mangrove Restoration Protocol v1.0</option>
                    <option value="GOLD_STANDARD_FOREST">Gold Standard — Forest Land Use & Management</option>
                  </select>
                </Field>
              </>}

              {step === 2 && <>
                <Field label="Country / State" required>
                  <select value={form.state||''} onChange={set('state')} className={inputCls}>
                    <option value="">Select state…</option>
                    {['West Bengal','Odisha','Andhra Pradesh','Tamil Nadu','Kerala','Gujarat','Maharashtra','Goa','Karnataka','Andaman & Nicobar'].map(s=>(
                      <option key={s} value={s}>{s}, India</option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Latitude (°N)" required><input value={form.lat||''} onChange={set('lat')} placeholder="21.9497" className={inputCls}/></Field>
                  <Field label="Longitude (°E)" required><input value={form.lng||''} onChange={set('lng')} placeholder="89.1833" className={inputCls}/></Field>
                </div>
                <Field label="Project Area (hectares)" required><input type="number" value={form.area_ha||''} onChange={set('area_ha')} placeholder="e.g. 100" className={inputCls}/></Field>
                <Field label="GPS Boundary Available?">
                  <select value={form.gps_boundary||''} onChange={set('gps_boundary')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="shapefile">Yes — Shapefile (GeoJSON/KML)</option>
                    <option value="waypoints">Yes — GPS Waypoints</option>
                    <option value="approximate">Approximate — field survey needed</option>
                    <option value="no">No — not yet available</option>
                  </select>
                </Field>
                <Field label="Nearest Village / Town"><input value={form.nearest_town||''} onChange={set('nearest_town')} placeholder="e.g. Gosaba, West Bengal" className={inputCls}/></Field>
              </>}

              {step === 3 && <>
                <Field label="Ecosystem Type" required>
                  <select value={form.ecosystem||''} onChange={set('ecosystem')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="mangrove">Mangrove Forest</option>
                    <option value="seagrass">Seagrass Meadow</option>
                    <option value="saltmarsh">Salt Marsh / Tidal Wetland</option>
                  </select>
                </Field>
                <Field label="Is the project area currently degraded?" required>
                  <select value={form.is_degraded||''} onChange={set('is_degraded')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="yes">Yes — degraded mangrove habitat (required for BEE BM FR05.001)</option>
                    <option value="no">No — intact forest (may not qualify)</option>
                    <option value="partially">Partially degraded</option>
                  </select>
                </Field>
                <Field label="% of area planted with mangrove species" required>
                  <input type="number" min="0" max="100" value={form.mangrove_pct||''} onChange={set('mangrove_pct')} placeholder="Must be ≥90% for BEE BM FR05.001" className={inputCls}/>
                </Field>
                <Field label="Hydrology condition">
                  <select value={form.hydrology||''} onChange={set('hydrology')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="intact">Intact tidal hydrology</option>
                    <option value="altered">Altered — needs restoration</option>
                    <option value="blocked">Blocked — significant intervention needed</option>
                  </select>
                </Field>
                <Field label="Significant soil disturbance planned?">
                  <select value={form.soil_disturbance||''} onChange={set('soil_disturbance')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="no">No soil disturbance (preferred)</option>
                    <option value="minimal">Minimal — planting holes only</option>
                    <option value="yes">Yes — significant excavation/filling</option>
                  </select>
                </Field>
                <Field label="Estimated current NDVI score (if known)">
                  <input type="number" min="0" max="1" step="0.01" value={form.ndvi_estimate||''} onChange={set('ndvi_estimate')} placeholder="e.g. 0.35 (degraded) to 0.85 (healthy)" className={inputCls}/>
                </Field>
              </>}

              {step === 4 && <>
                <Field label="Land Tenure" required>
                  <select value={form.land_tenure||''} onChange={set('land_tenure')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="owned">Owned by project developer/NGO</option>
                    <option value="leased">Long-term lease (≥30 years)</option>
                    <option value="community">Community-owned with agreement</option>
                    <option value="government">Government land — MoU/permission obtained</option>
                    <option value="disputed">Disputed — not suitable</option>
                  </select>
                </Field>
                <Field label="Legal documentation available?">
                  <select value={form.legal_docs||''} onChange={set('legal_docs')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="complete">Complete — land records, title deeds</option>
                    <option value="partial">Partial — some documents pending</option>
                    <option value="none">None — not yet obtained</option>
                  </select>
                </Field>
                <Field label="Carbon rights agreement?">
                  <select value={form.carbon_rights||''} onChange={set('carbon_rights')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="signed">Signed carbon rights agreement</option>
                    <option value="in_progress">In progress</option>
                    <option value="no">Not yet established</option>
                  </select>
                </Field>
                <Field label="Any existing encumbrances or disputes?">
                  <select value={form.disputes||''} onChange={set('disputes')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="no">No disputes</option>
                    <option value="minor">Minor — being resolved</option>
                    <option value="yes">Yes — active dispute</option>
                  </select>
                </Field>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[10px] text-amber-400 font-semibold mb-1">⚠️ Legal Rights are Critical</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Projects without clear land tenure and carbon rights will be rejected at screening stage.
                    This is a hard requirement under ICVCM CCPs and BEE BM FR05.001.
                  </p>
                </div>
              </>}

              {step === 5 && <>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-blue-400 font-semibold mb-1">What is Additionality?</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    Additionality means the restoration would NOT happen without carbon finance. This is tested using the CDM Additionality Tool v07.0.0 — required by BEE BM FR05.001 §5.
                  </p>
                </div>
                <Field label="Would restoration happen without carbon revenue?" required>
                  <select value={form.would_happen||''} onChange={set('would_happen')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="no">No — not financially viable without carbon</option>
                    <option value="partially">Partially — carbon revenue is critical</option>
                    <option value="yes">Yes — would happen anyway (NOT additional)</option>
                  </select>
                </Field>
                <Field label="Is restoration legally mandated?">
                  <select value={form.legally_required||''} onChange={set('legally_required')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="no">No — voluntary restoration</option>
                    <option value="yes">Yes — legally required (NOT additional)</option>
                  </select>
                </Field>
                <Field label="Is the project fully funded by government (MISHTI etc.)?">
                  <select value={form.govt_funded||''} onChange={set('govt_funded')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="no">No — no government funding</option>
                    <option value="partial">Partial — carbon still needed for viability</option>
                    <option value="fully">Fully — government funded (additionality risk)</option>
                  </select>
                </Field>
                <Field label="% of similar land in region doing this restoration">
                  <input type="number" min="0" max="100" value={form.common_practice||''} onChange={set('common_practice')} placeholder="e.g. 5% (low = more additional)" className={inputCls}/>
                </Field>
                <Field label="Project IRR without carbon revenue (%)">
                  <input type="number" value={form.irr_without||''} onChange={set('irr_without')} placeholder="e.g. 3.5 (below 12% = financially not viable)" className={inputCls}/>
                </Field>
                <Field label="Additionality self-assessment score (0–100)">
                  <input type="range" min="0" max="100" value={form.additionality_score||'50'} onChange={set('additionality_score')} className="w-full"/>
                  <p className="text-xs text-primary-500 text-right mt-1">{form.additionality_score||50}/100</p>
                </Field>
              </>}

              {step === 6 && <>
                <Field label="Community consultation completed?" required>
                  <select value={form.community_consulted||''} onChange={set('community_consulted')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="yes">Yes — FPIC obtained, records available</option>
                    <option value="in_progress">In progress</option>
                    <option value="no">No — not yet started</option>
                  </select>
                </Field>
                <Field label="Number of households in project area">
                  <input type="number" value={form.households||''} onChange={set('households')} placeholder="e.g. 500" className={inputCls}/>
                </Field>
                <Field label="Benefit sharing percentage (% of carbon revenue to community)">
                  <input type="number" min="0" max="100" value={form.benefit_pct||''} onChange={set('benefit_pct')} placeholder="Recommended: 20–40%" className={inputCls}/>
                </Field>
                <Field label="Estimated direct jobs to be created">
                  <input type="number" value={form.jobs||''} onChange={set('jobs')} placeholder="e.g. 50" className={inputCls}/>
                </Field>
                <Field label="Grievance mechanism in place?">
                  <select value={form.grievance||''} onChange={set('grievance')} className={inputCls}>
                    <option value="">Select…</option>
                    <option value="yes">Yes — formal grievance mechanism</option>
                    <option value="planned">Planned — to be established</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <Field label="Legal self-assessment score (0–100)">
                  <input type="range" min="0" max="100" value={form.legal_score||'50'} onChange={set('legal_score')} className="w-full"/>
                  <p className="text-xs text-primary-500 text-right mt-1">{form.legal_score||50}/100</p>
                </Field>
                <Field label="Community self-assessment score (0–100)">
                  <input type="range" min="0" max="100" value={form.community_score||'50'} onChange={set('community_score')} className="w-full"/>
                  <p className="text-xs text-primary-500 text-right mt-1">{form.community_score||50}/100</p>
                </Field>
              </>}

              {step === 7 && (
                <div className="space-y-4">
                  {/* Eligibility check */}
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)] mb-2">BEE BM FR05.001 Eligibility Check</h3>
                    <div className="space-y-1.5">
                      {eligibility.map((e, i) => (
                        <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${e.pass?'bg-primary-500/5 border border-primary-500/20':'bg-red-500/5 border border-red-500/20'}`}>
                          {e.pass
                            ? <CheckCircle className="w-3.5 h-3.5 text-primary-500 shrink-0 mt-0.5"/>
                            : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5"/>
                          }
                          <div>
                            <p className={`text-[10px] font-semibold ${e.pass?'text-[var(--text)]':'text-red-400'}`}>{e.rule} {e.fatal&&!e.pass?'⛔ FATAL':''}</p>
                            <p className="text-[9px] text-[var(--text-muted)]">{e.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2 text-xs">
                    <h3 className="font-bold text-[var(--text)] mb-2">Project Summary</h3>
                    {[
                      { label:'Project', value:form.name||'—' },
                      { label:'NGO',     value:form.org||'—'  },
                      { label:'Location',value:`${form.state||'—'} · ${form.lat||'—'}°N, ${form.lng||'—'}°E` },
                      { label:'Area',    value:`${form.area_ha||'—'} ha` },
                      { label:'Ecosystem',value:form.ecosystem||'—' },
                      { label:'Methodology',value:form.methodology?.replace('_',' ')||'—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className="font-semibold text-[var(--text)] text-right max-w-[60%] truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {fatalFailures.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-sm font-bold text-red-400 mb-2">⛔ {fatalFailures.length} Fatal Eligibility Failure{fatalFailures.length>1?'s':''}</p>
                      <p className="text-xs text-[var(--text-muted)]">Please resolve these issues before submitting. Projects with fatal failures will be automatically rejected.</p>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]">
            <button onClick={prev} disabled={step===1}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-primary-500 rounded-xl text-sm transition-colors disabled:opacity-40">
              <ChevronLeft className="w-4 h-4"/> Back
            </button>
            {step < 7
              ? <button onClick={next}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors">
                  Next <ChevronRight className="w-4 h-4"/>
                </button>
              : <button onClick={submit} disabled={submitting || fatalFailures.length > 0}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors">
                  {submitting ? <><Loader className="w-4 h-4 animate-spin"/>Submitting…</> : <><CheckCircle className="w-4 h-4"/>Submit Proposal</>}
                </button>
            }
          </div>
        </div>

        {/* Sidebar — Live eligibility feedback */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-xs font-bold text-[var(--text)] mb-3">Live Eligibility Check</h3>
            <div className="space-y-1.5">
              {eligibility.slice(0, 4).map((e, i) => (
                <div key={i} className="flex items-center gap-2">
                  {e.pass
                    ? <CheckCircle className="w-3.5 h-3.5 text-primary-500 shrink-0"/>
                    : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0"/>
                  }
                  <p className={`text-[10px] ${e.pass?'text-[var(--text)]':'text-red-400'}`}>{e.rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-xs font-bold text-[var(--text)] mb-2">Readiness Score</h3>
            <div className="text-center py-3">
              <p className={`text-3xl font-black ${readinessScore>=80?'text-primary-500':readinessScore>=60?'text-amber-400':'text-red-400'}`}>{readinessScore}</p>
              <p className="text-[10px] text-[var(--text-muted)]">/ 100</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-2 inline-block ${gateColors[gate]}`}>{gate}</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mt-2">
              <motion.div className={`h-full rounded-full ${readinessScore>=80?'bg-primary-500':readinessScore>=60?'bg-amber-500':'bg-red-500'}`}
                animate={{ width:`${readinessScore}%` }} transition={{ duration:0.5 }}/>
            </div>
          </div>

          <div className="card p-4 border-blue-500/20 bg-blue-500/5">
            <p className="text-[10px] text-blue-400 font-semibold mb-1">📋 What happens next?</p>
            <div className="space-y-1.5 mt-2">
              {['CarbonX screens your proposal (2 days)','Legal & additionality review (5 days)','Satellite MRV scheduled','ACVA/VVB assigned','Credits issued after verification'].map((s,i)=>(
                <p key={i} className="text-[10px] text-[var(--text-muted)] flex items-start gap-1.5">
                  <span className="text-primary-500 font-bold shrink-0">{i+1}.</span>{s}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"

function Field({ label, required, children }: { label:string; required?:boolean; children:React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[var(--text)]">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  )
}

// ── Missing import fix ────────────────────────────────────────────
import React from 'react'
