'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle, Send, Loader, FileText,
  MapPin, Users, Shield, Eye, Clock, Search, ChevronRight
} from 'lucide-react'

type GType = 'land_rights'|'community'|'environmental'|'data'|'fraud'|'double_counting'|'boundary'|'other'

const TYPES: { id:GType; label:string; icon:string; desc:string }[] = [
  { id:'land_rights',    label:'Land Rights Issue',       icon:'🏛️', desc:'Dispute over land ownership or project boundaries' },
  { id:'community',      label:'Community Concern',        icon:'👥', desc:'Community not properly consulted or benefit sharing dispute' },
  { id:'environmental',  label:'Environmental Issue',      icon:'🌿', desc:'Negative ecological impact or biodiversity concern' },
  { id:'data',           label:'Data Integrity',           icon:'📊', desc:'Satellite data, NDVI scores, or calculations appear incorrect' },
  { id:'fraud',          label:'Fraud / Misrepresentation',icon:'🚨', desc:'Credits claimed for non-existent or already-destroyed ecosystem' },
  { id:'double_counting',label:'Double Counting',          icon:'🔢', desc:'Same credit sold or claimed more than once' },
  { id:'boundary',       label:'Boundary Dispute',         icon:'📍', desc:'GPS coordinates or project area boundary is incorrect' },
  { id:'other',          label:'Other Concern',            icon:'📋', desc:'Any other concern not covered above' },
]

const PUBLIC_CASES = [
  { id:'GRV-001', type:'community',   project:'Sundarbans Mangrove Reserve', status:'resolved',    opened:'2025-04-10', resolved:'2025-05-15', summary:'Benefit sharing payment delayed by 45 days. Resolved by project developer with backdated payment.',    outcome:'Benefit sharing schedule updated to monthly' },
  { id:'GRV-002', type:'data',        project:'Pichavaram Mangrove Block',    status:'in_progress', opened:'2025-05-20', resolved:null,         summary:'NDVI score for Q1 2025 run appears 0.06 higher than field measurements suggest. Under investigation.', outcome:null },
  { id:'GRV-003', type:'boundary',    project:'Bhitarkanika Coastal Forest',  status:'closed',      opened:'2025-03-01', resolved:'2025-04-02', summary:'GPS boundary coordinates shifted 200m north of actual project area. Corrected in database.',             outcome:'Boundary updated, MRV re-run ordered' },
]

const STATUS_CFG: Record<string,{ label:string; color:string; icon:any }> = {
  open:        { label:'Open',        color:'text-amber-400  bg-amber-500/10  border-amber-500/20',  icon:Clock        },
  in_progress: { label:'In Progress', color:'text-blue-400   bg-blue-500/10   border-blue-500/20',   icon:Eye          },
  resolved:    { label:'Resolved',    color:'text-primary-500 bg-primary-500/10 border-primary-500/20',icon:CheckCircle },
  closed:      { label:'Closed',      color:'text-[var(--text-muted)] bg-[var(--border)] border-[var(--border)]',icon:FileText },
}

export default function GrievancePage() {
  const [form, setForm]         = useState({ type:'' as GType|'', project:'', description:'', evidence:'', contact:'', anonymous:false })
  const [step, setStep]         = useState<'form'|'confirm'|'done'>('form')
  const [loading, setLoading]   = useState(false)
  const [refId, setRefId]       = useState('')
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [tab, setTab]           = useState<'submit'|'track'>('submit')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.type || !form.description.trim() || description.length < 50) {
      setError('Please select a type and provide a detailed description (min 50 characters).'); return
    }
    if (step === 'form') { setStep('confirm'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    const ref = `GRV-${Date.now().toString(36).toUpperCase().slice(-6)}`
    setRefId(ref); setStep('done'); setLoading(false)
  }

  const filtered = PUBLIC_CASES.filter(c =>
    !search || c.project.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())
  )

  const description = form.description

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Grievance Mechanism</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Report concerns about any CarbonX project. All submissions are reviewed by our compliance team within 5 business days.
          Required by ICVCM Core Carbon Principles for high-integrity certification.
        </p>
      </motion.div>

      {/* Notice */}
      <div className="card p-4 border-blue-500/20 bg-blue-500/5 flex items-start gap-3">
        <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">ICVCM Compliant Grievance Process</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
            This mechanism complies with ICVCM Core Carbon Principles Criterion 8 (Safeguards) and India CCTS community protection requirements.
            Anonymous submissions are accepted. All cases are publicly disclosed (outcomes only) to ensure transparency.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[var(--card)] border border-[var(--border)] rounded-xl p-1 w-fit">
        {([['submit','Submit Grievance'],['track','Public Cases']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${tab===t?'bg-primary-500 text-white':'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'submit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form */}
          <motion.div className="lg:col-span-2 card p-5 sm:p-6"
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}>

            {step === 'done' ? (
              <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="flex flex-col items-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-500"/>
                </div>
                <h3 className="font-bold text-lg text-[var(--text)]">Grievance Submitted</h3>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">
                  Your concern has been recorded. Our compliance team will review and respond within 5 business days.
                </p>
                <div className="bg-[var(--bg)] rounded-xl px-6 py-3 border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--text-muted)]">Your Reference ID</p>
                  <p className="text-xl font-mono font-bold text-primary-500">{refId}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Save this for tracking your case</p>
                </div>
                <button onClick={() => { setStep('form'); setForm({ type:'', project:'', description:'', evidence:'', contact:'', anonymous:false }) }}
                  className="text-sm text-primary-500 hover:underline">Submit another</button>
              </motion.div>
            ) : step === 'confirm' ? (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                <h3 className="font-bold text-sm text-[var(--text)]">Review Your Submission</h3>
                <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2 text-xs">
                  {[
                    { label:'Type',    value:TYPES.find(t=>t.id===form.type)?.label || form.type },
                    { label:'Project', value:form.project || 'Not specified'                      },
                    { label:'Anonymous',value:form.anonymous ? 'Yes' : 'No'                       },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[var(--text-muted)]">{label}</span>
                      <span className="font-semibold text-[var(--text)]">{value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-[var(--text-muted)] mb-1">Description</p>
                    <p className="text-[var(--text)] leading-relaxed">{form.description}</p>
                  </div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[10px] text-amber-400 font-semibold mb-1">⚠️ Before submitting</p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    False or malicious grievances may result in account suspension. Please ensure your concern is genuine and evidence-based.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('form')}
                    className="flex-1 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium py-2.5 rounded-xl text-sm transition-colors">
                    Back
                  </button>
                  <button onClick={submit} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                    {loading ? <><Loader className="w-4 h-4 animate-spin"/>Submitting…</> : <><Send className="w-4 h-4"/>Confirm Submit</>}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="font-bold text-base text-[var(--text)]">Submit a Concern</h3>
                {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">{error}</p></div>}

                {/* Type selector */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] block mb-2">Type of Concern <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES.map(t => (
                      <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, type: t.id }))}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border text-left transition-all ${form.type===t.id?'border-primary-500 bg-primary-500/5':'border-[var(--border)] hover:border-primary-500/40'}`}>
                        <span className="text-sm shrink-0">{t.icon}</span>
                        <div>
                          <p className="text-[10px] font-bold text-[var(--text)] leading-tight">{t.label}</p>
                          <p className="text-[9px] text-[var(--text-muted)] leading-tight mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text)]">Project Concerned (optional)</label>
                  <select value={form.project} onChange={set('project')}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors">
                    <option value="">Select project or leave blank for platform-wide</option>
                    {['Sundarbans Mangrove Reserve','Bhitarkanika Coastal Forest','Pichavaram Mangrove Block','Godavari Delta Reserve'].map(p=>(
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    Detailed Description <span className="text-red-500">*</span>
                    <span className="ml-2 text-[var(--text-muted)] font-normal">({form.description.length}/50 min)</span>
                  </label>
                  <textarea value={form.description} onChange={set('description')} rows={5}
                    placeholder="Please describe your concern in detail. Include dates, specific locations, parties involved, and any evidence you have observed…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
                </div>

                {/* Evidence */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[var(--text)]">Supporting Evidence (optional)</label>
                  <input value={form.evidence} onChange={set('evidence')}
                    placeholder="URLs, document references, transaction hashes, GPS coordinates…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
                </div>

                {/* Contact + anonymous */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[var(--text)]">Contact Email (optional)</label>
                    <input type="email" value={form.contact} onChange={set('contact')} disabled={form.anonymous}
                      placeholder={form.anonymous ? 'Hidden (anonymous)' : 'your@email.com'}
                      className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)] disabled:opacity-50"/>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <button type="button" onClick={() => setForm(f => ({ ...f, anonymous: !f.anonymous }))}
                      className={`w-10 h-5 rounded-full transition-colors ${form.anonymous?'bg-primary-500':'bg-[var(--border)]'} flex items-center`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${form.anonymous?'translate-x-5':'translate-x-0'}`}/>
                    </button>
                    <label className="text-xs text-[var(--text-muted)]">Submit anonymously</label>
                  </div>
                </div>

                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                  <ChevronRight className="w-4 h-4"/> Review & Submit Grievance
                </button>
              </form>
            )}
          </motion.div>

          {/* Process sidebar */}
          <motion.div className="space-y-4" initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.1 }}>
            <div className="card p-4">
              <h3 className="text-xs font-bold text-[var(--text)] mb-3">Review Process</h3>
              {[
                { step:'1', label:'Submission',        desc:'Your grievance is logged and assigned a reference ID',        time:'Immediate'   },
                { step:'2', label:'Initial Review',    desc:'Compliance team assesses severity and gathers information',   time:'1–2 days'    },
                { step:'3', label:'Investigation',     desc:'Technical review of evidence, satellite data, field checks',  time:'5–15 days'   },
                { step:'4', label:'Resolution',        desc:'Decision communicated to complainant and publicly disclosed', time:'30 days max' },
              ].map(({ step, label, desc, time }) => (
                <div key={step} className="flex gap-3 mb-3 last:mb-0">
                  <div className="w-6 h-6 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary-500">{step}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">{label} <span className="text-[var(--text-muted)] font-normal">· {time}</span></p>
                    <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="card p-4 border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-bold text-amber-400 mb-1">🚨 Urgent Safety Issues</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
                For immediate safety concerns or active fraud, contact us directly: <span className="text-primary-500">security@carbonx.app</span>
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Public cases */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases by project or ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
          </div>
          <div className="space-y-3">
            {filtered.map(c => {
              const st = STATUS_CFG[c.status]
              const StIcon = st.icon
              return (
                <motion.div key={c.id} className="card p-4" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">{c.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.color}`}>
                          <StIcon className="w-2.5 h-2.5 inline mr-1"/>{st.label}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[var(--text)]">{c.project}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)] shrink-0`}>
                      {c.type.replace('_',' ')}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed mb-2">{c.summary}</p>
                  {c.outcome && (
                    <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-primary-500 font-semibold">Resolution: {c.outcome}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-[var(--text-muted)] mt-2">
                    Opened: {c.opened}{c.resolved ? ` · Resolved: ${c.resolved}` : ''}
                  </p>
                </motion.div>
              )
            })}
          </div>
          <p className="text-[10px] text-center text-[var(--text-muted)]">
            Case summaries are disclosed publicly per ICVCM Transparency Principle. Personal details are never shared.
          </p>
        </div>
      )}
    </div>
  )
}
