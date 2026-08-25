'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, ExternalLink, Search, Download, Filter,
  CheckCircle, Copy, CheckCheck, Shield, Leaf,
  TrendingUp, Hash, Calendar, FileText, X
} from 'lucide-react'

const RETIREMENTS = [
  { id:'r1', project:'Sundarbans Mangrove Reserve', tokenId:1001, amount:50,  address:'0x3a2f…9b1c', note:'Q2 2025 Corporate Carbon Offset — TechCorp India',     date:'2025-06-20', txHash:'0xabc1…f234', validator:'Verra',        verified:true  },
  { id:'r2', project:'Pichavaram Mangrove Block',   tokenId:1003, amount:10,  address:'0x7f11…c3de', note:'Annual ESG Report Offset — Green Solutions Ltd',         date:'2025-06-18', txHash:'0xdef4…a567', validator:'Gold Standard', verified:true  },
  { id:'r3', project:'Godavari Delta Reserve',      tokenId:1004, amount:100, address:'0x9c4a…f2e1', note:'Manufacturing Plant Scope 3 Emissions 2024',             date:'2025-06-15', txHash:'0x123b…c890', validator:'Verra',        verified:true  },
  { id:'r4', project:'Bhitarkanika Coastal Forest', tokenId:1002, amount:25,  address:'0x1d8b…7a3f', note:'Employee Travel Carbon Offset Program — Q1 2025',        date:'2025-06-12', txHash:'0x456d…e012', validator:'CCTS',         verified:true  },
  { id:'r5', project:'Sundarbans Mangrove Reserve', tokenId:1001, amount:200, address:'0x5e6c…8b2d', note:'Annual Net-Zero Commitment 2025 — Global Exports Ltd',   date:'2025-06-10', txHash:'0x789f…g345', validator:'Verra',        verified:true  },
  { id:'r6', project:'Pichavaram Mangrove Block',   tokenId:1003, amount:15,  address:'0x2f3a…1c4d', note:'Conference Carbon Neutral Pledge — IIT Bombay',          date:'2025-06-05', txHash:'0xabc7…h678', validator:'Gold Standard', verified:true  },
]

const VALIDATOR_COLORS: Record<string,string> = {
  'Verra':        'text-blue-400   bg-blue-500/10   border-blue-500/20',
  'CCTS':         'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Gold Standard':'text-amber-400  bg-amber-500/10  border-amber-500/20',
}

// Retirement form
function RetirementForm({ onSuccess }: { onSuccess: (record: any) => void }) {
  const [form, setForm]     = useState({ tokenId:'', amount:'', note:'' })
  const [loading, setLoad]  = useState(false)
  const [step, setStep]     = useState<'form'|'confirm'|'done'>('form')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 'form') { setStep('confirm'); return }
    setLoad(true)
    await new Promise(r => setTimeout(r, 2000))
    onSuccess({ ...form, id: Math.random().toString(36).slice(2), date: new Date().toISOString().split('T')[0], txHash: '0x'+Math.random().toString(16).slice(2,8)+'…'+Math.random().toString(16).slice(2,6), verified: true })
    setLoad(false)
    setStep('done')
  }

  const TOKEN_OPTIONS = [
    { id:'1001', name:'Sundarbans (ERC-1155 #1001)' },
    { id:'1002', name:'Bhitarkanika (ERC-1155 #1002)' },
    { id:'1003', name:'Pichavaram (ERC-1155 #1003)' },
    { id:'1004', name:'Godavari (ERC-1155 #1004)' },
  ]

  if (step === 'done') return (
    <div className="flex flex-col items-center py-8 text-center gap-4">
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300,damping:20}}
        className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-primary-500"/>
      </motion.div>
      <h3 className="font-bold text-[var(--text)] text-lg">Credits Retired Successfully!</h3>
      <p className="text-sm text-[var(--text-muted)]">Your {form.amount} tCO₂e have been permanently burned on-chain. The retirement is now publicly verifiable.</p>
      <button onClick={() => { setStep('form'); setForm({ tokenId:'', amount:'', note:'' }) }}
        className="text-sm text-primary-500 hover:underline">Retire more credits</button>
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-4">
      {step === 'confirm' ? (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          className="space-y-4">
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-bold text-[var(--text)] mb-1">⚠️ This action is irreversible</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Retiring credits permanently burns them to address(0). This cannot be undone.
                  The on-chain record will be publicly visible forever.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Token ID</span><span className="font-bold text-[var(--text)]">ERC-1155 #{form.tokenId}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Amount</span><span className="font-bold text-primary-500">{form.amount} tCO₂e</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Note</span><span className="font-bold text-[var(--text)] text-right max-w-[60%] truncate">{form.note}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Burn address</span><span className="font-mono text-[var(--text-muted)]">0x0000…0000</span></div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('form')}
              className="flex-1 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium py-2.5 rounded-xl text-sm transition-colors">
              Back
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Burning…</> : <><Flame className="w-4 h-4"/>Confirm Retirement</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text)]">Carbon Credit Token <span className="text-red-500">*</span></label>
            <select value={form.tokenId} onChange={set('tokenId')} required
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors">
              <option value="">Select token…</option>
              {TOKEN_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text)]">Amount (tCO₂e) <span className="text-red-500">*</span></label>
            <input type="number" min={1} value={form.amount} onChange={set('amount')} required placeholder="e.g. 10"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--text)]">Retirement Note <span className="text-red-500">*</span></label>
            <textarea value={form.note} onChange={set('note')} required rows={3} placeholder="e.g. Q3 2025 Scope 3 emissions offset — Company Name"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
            <p className="text-[10px] text-amber-400 font-semibold mb-1">⚠️ Testnet Mode</p>
            <p className="text-[10px] text-[var(--text-muted)]">Connect MetaMask to Polygon Amoy (Chain ID: 80002) to sign the retirement transaction.</p>
          </div>
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-red-500/25">
            <Flame className="w-4 h-4"/> Review & Retire Credits
          </button>
        </>
      )}
    </form>
  )
}

export default function LedgerPage() {
  const [search, setSearch]       = useState('')
  const [retirements, setRet]     = useState(RETIREMENTS)
  const [copied, setCopied]       = useState<string|null>(null)

  const filtered = useMemo(() =>
    retirements.filter(r =>
      !search ||
      r.project.toLowerCase().includes(search.toLowerCase()) ||
      r.note.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase())
    ), [retirements, search])

  const totalRetired = retirements.reduce((s, r) => s + r.amount, 0)
  const uniqueProjects = new Set(retirements.map(r => r.project)).size

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  const onNewRetirement = (record: any) => {
    setRet(prev => [{ ...record, project:'Sundarbans Mangrove Reserve', validator:'Verra', address:'0xYour…wallet' }, ...prev])
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

      {/* Header */}
      <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">On-Chain Retirement Ledger</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Permanently burned credits · Immutable public record · Verifiable on OKLink Explorer</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label:'Total Retired',    value:`${totalRetired.toLocaleString()} tCO₂e`, icon:Flame,       color:'text-red-400'     },
          { label:'Retirement Events',value:retirements.length.toString(),             icon:Hash,        color:'text-blue-400'    },
          { label:'Projects Covered', value:uniqueProjects.toString(),                 icon:Leaf,        color:'text-primary-500' },
          { label:'Verification Rate',value:'100%',                                    icon:Shield,      color:'text-amber-400'   },
        ].map(({ label, value, icon:Icon, color }, i) => (
          <motion.div key={label} className="card p-3 sm:p-4"
            initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
            <Icon className={`w-4 h-4 ${color} mb-2`}/>
            <p className="text-lg sm:text-xl font-black text-[var(--text)]">{value}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Retirement form */}
        <motion.div className="card p-4 sm:p-5 lg:col-span-1 h-fit"
          initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.2}}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Flame className="w-4 h-4 text-red-400"/>
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">Retire Credits</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Permanently burn to claim offset</p>
            </div>
          </div>
          <RetirementForm onSuccess={onNewRetirement}/>
        </motion.div>

        {/* Ledger table */}
        <motion.div className="lg:col-span-2 space-y-3" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.25}}>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search retirements…"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
            </div>
            <a href="https://www.oklink.com/amoy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shrink-0">
              <ExternalLink className="w-4 h-4"/> Explorer
            </a>
          </div>

          {/* Desktop table */}
          <div className="card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                    {['Project','Amount','Address','Date','Tx Hash','Validator'].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filtered.map(r=>(
                      <motion.tr key={r.id} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                        className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[var(--text)] truncate max-w-[140px]">{r.project}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate max-w-[140px]">{r.note}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-red-400 whitespace-nowrap">{r.amount} tCO₂e</td>
                        <td className="px-4 py-3 font-mono text-[var(--text-muted)]">{r.address}</td>
                        <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{r.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-blue-400">{r.txHash}</span>
                            <button onClick={()=>copy(r.txHash,r.id)} className="text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                              {copied===r.id?<CheckCheck className="w-3 h-3 text-primary-500"/>:<Copy className="w-3 h-3"/>}
                            </button>
                            <a href={`https://www.oklink.com/amoy/tx/${r.txHash}`} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                              <ExternalLink className="w-3 h-3"/>
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${VALIDATOR_COLORS[r.validator]}`}>{r.validator}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            {filtered.length===0&&(
              <div className="py-12 text-center text-[var(--text-muted)]">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-40"/>
                <p className="text-sm">No retirements match your search.</p>
              </div>
            )}
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            <AnimatePresence initial={false}>
              {filtered.map(r=>(
                <motion.div key={r.id} className="card p-4 space-y-2"
                  initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text)] truncate">{r.project}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{r.note}</p>
                    </div>
                    <span className="font-bold text-red-400 text-sm shrink-0">{r.amount} tCO₂e</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--text-muted)]">{r.date}</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full border ${VALIDATOR_COLORS[r.validator]}`}>{r.validator}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-mono text-blue-400">{r.txHash}</span>
                    <button onClick={()=>copy(r.txHash,r.id)} className="text-[var(--text-muted)] hover:text-primary-500">
                      {copied===r.id?<CheckCheck className="w-3 h-3 text-primary-500"/>:<Copy className="w-3 h-3"/>}
                    </button>
                    <a href={`https://www.oklink.com/amoy/tx/${r.txHash}`} target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-primary-500">
                      <ExternalLink className="w-3 h-3"/>
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </div>
  )
}
