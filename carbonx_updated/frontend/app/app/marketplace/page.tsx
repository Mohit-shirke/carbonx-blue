'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, SlidersHorizontal, Leaf, Shield, Zap,
  MapPin, TrendingUp, ChevronDown, X, ShoppingCart,
  CheckCircle, Clock, AlertCircle, Star, BarChart2
} from 'lucide-react'
import Link from 'next/link'

interface Project {
  id: string; name: string; shortName: string; location: string
  validator: 'Verra' | 'CCTS' | 'Gold Standard'
  pricePerTon: number; availableCredits: number
  ndvi: number; status: 'active' | 'soldout' | 'upcoming'
  tokenId: number; area: number; description: string
  ecosystem: 'mangrove' | 'seagrass' | 'wetland'
  co2PerYear: number; biodiversityScore: number
}

const PROJECTS: Project[] = [
  { id:'p1', name:'Sundarbans Mangrove Reserve', shortName:'Sundarbans',    location:'West Bengal, India',    validator:'Verra',        pricePerTon:28.50, availableCredits:8200, ndvi:0.84, status:'active',   tokenId:1001, area:4262, description:'UNESCO-listed mangrove delta protecting 10,000+ km² of coastal wetland in the Bay of Bengal. Home to Bengal tigers and Irrawaddy dolphins.', ecosystem:'mangrove', co2PerYear:12400, biodiversityScore:98 },
  { id:'p2', name:'Bhitarkanika Coastal Forest', shortName:'Bhitarkanika',  location:'Odisha, India',         validator:'CCTS',         pricePerTon:22.00, availableCredits:5100, ndvi:0.76, status:'active',   tokenId:1002, area:672,  description:'Ramsar-designated wetland and second-largest mangrove forest in India. Critical nesting site for saltwater crocodiles and olive ridley turtles.', ecosystem:'mangrove', co2PerYear:8200,  biodiversityScore:91 },
  { id:'p3', name:'Pichavaram Mangrove Block',   shortName:'Pichavaram',    location:'Tamil Nadu, India',     validator:'Gold Standard', pricePerTon:19.75, availableCredits:3400, ndvi:0.71, status:'active',   tokenId:1003, area:42,   description:'Second largest mangrove forest in the world. A labyrinth of waterways supporting rare bird species and coastal fishing communities.', ecosystem:'mangrove', co2PerYear:5100,  biodiversityScore:87 },
  { id:'p4', name:'Godavari Delta Reserve',      shortName:'Godavari',      location:'Andhra Pradesh, India', validator:'Verra',        pricePerTon:31.00, availableCredits:6700, ndvi:0.79, status:'active',   tokenId:1004, area:729,  description:'Rich river delta ecosystem spanning 729 km² of protected mangrove and estuarine habitat. Critical for migratory waterbirds.', ecosystem:'wetland',  co2PerYear:9800,  biodiversityScore:93 },
  { id:'p5', name:'Gulf of Mannar Marine Park',  shortName:'Gulf of Mannar',location:'Tamil Nadu, India',     validator:'CCTS',         pricePerTon:16.50, availableCredits:2100, ndvi:0.65, status:'upcoming', tokenId:1005, area:560,  description:'Marine biosphere reserve with seagrass beds, coral reefs, and 3,600+ marine species. One of the richest marine biodiversity zones in Asia.', ecosystem:'seagrass', co2PerYear:4200,  biodiversityScore:96 },
  { id:'p6', name:'Chilika Lagoon Sanctuary',    shortName:'Chilika',       location:'Odisha, India',         validator:'Gold Standard', pricePerTon:24.00, availableCredits:0,    ndvi:0.68, status:'soldout',  tokenId:1006, area:1165, description:"Asia's largest coastal lagoon and Ramsar site. Winter home to Irrawaddy dolphins and over 160 migratory bird species from Central Asia.", ecosystem:'wetland',  co2PerYear:7600,  biodiversityScore:94 },
]

const VALIDATOR_COLORS = {
  'Verra':        'text-blue-400   bg-blue-500/10   border-blue-500/20',
  'CCTS':         'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Gold Standard':'text-amber-400  bg-amber-500/10  border-amber-500/20',
}
const ECOSYSTEM_ICONS = { mangrove:'🌿', seagrass:'🌊', wetland:'🦢' }
const STATUS_CONFIG = {
  active:   { label:'Active',    icon:CheckCircle, color:'text-primary-500 bg-primary-500/10 border-primary-500/20' },
  soldout:  { label:'Sold Out',  icon:AlertCircle, color:'text-red-400     bg-red-500/10     border-red-500/20'     },
  upcoming: { label:'Upcoming',  icon:Clock,       color:'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
}

function NDVIBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = score >= 0.8 ? 'bg-primary-500' : score >= 0.65 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <motion.div className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}/>
      </div>
      <span className="text-[10px] font-bold text-[var(--text-muted)] w-7 text-right">{score.toFixed(2)}</span>
    </div>
  )
}

function ProjectCard({ project, onBuy }: { project: Project; onBuy: (p: Project) => void }) {
  const st = STATUS_CONFIG[project.status]
  const StIcon = st.icon
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div className="card overflow-hidden group"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: project.status === 'active' ? '0 0 20px rgba(16,185,129,0.15)' : 'none' }}>

      {/* NDVI gradient banner */}
      <div className="h-28 sm:h-32 relative overflow-hidden bg-gradient-to-br from-primary-900/60 via-primary-800/40 to-teal-900/60">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl opacity-30">{ECOSYSTEM_ICONS[project.ecosystem]}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-white/60 mb-0.5">NDVI Score</p>
              <div className="w-32"><NDVIBar score={project.ndvi}/></div>
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-black text-white">${project.pricePerTon}</p>
              <p className="text-[10px] text-white/60">per tCO₂e</p>
            </div>
          </div>
        </div>
        {/* Token ID badge */}
        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-lg">
          <p className="text-[10px] text-white/80 font-mono">ERC-1155 #{project.tokenId}</p>
        </div>
        {/* Status badge */}
        <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold backdrop-blur-sm ${st.color}`}>
          <StIcon className="w-3 h-3"/>{st.label}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Title & location */}
        <div className="mb-2">
          <h3 className="font-bold text-sm sm:text-base text-[var(--text)] leading-snug">{project.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[var(--text-muted)] shrink-0"/>
            <p className="text-[10px] text-[var(--text-muted)] truncate">{project.location}</p>
          </div>
        </div>

        {/* Validator badge */}
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${VALIDATOR_COLORS[project.validator]}`}>
          <Shield className="w-2.5 h-2.5"/>{project.validator}
        </span>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label:'Area',      value:`${project.area.toLocaleString()} km²`     },
            { label:'CO₂/yr',   value:`${(project.co2PerYear/1000).toFixed(1)}k t` },
            { label:'Biodiv.',  value:`${project.biodiversityScore}/100`           },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[var(--bg)] rounded-lg p-2 text-center">
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
              <p className="text-xs font-bold text-[var(--text)] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Description toggle */}
        <button onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-primary-500 mt-2 transition-colors">
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}/>
          {expanded ? 'Show less' : 'Project details'}
        </button>
        {expanded && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="text-[10px] sm:text-xs text-[var(--text-muted)] leading-relaxed mt-2 border-t border-[var(--border)] pt-2">
            {project.description}
          </motion.p>
        )}

        {/* Available credits */}
        {project.status === 'active' && (
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Available</span>
            <span className="font-bold text-primary-500">{project.availableCredits.toLocaleString()} tCO₂e</span>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => project.status === 'active' && onBuy(project)}
          disabled={project.status !== 'active'}
          className={`w-full mt-3 flex items-center justify-center gap-2 font-semibold py-2.5 rounded-xl text-sm transition-all ${
            project.status === 'active'
              ? 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-lg hover:shadow-primary-500/25'
              : project.status === 'soldout'
              ? 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
              : 'border-2 border-amber-500/50 text-amber-400 cursor-not-allowed'
          }`}>
          <ShoppingCart className="w-4 h-4"/>
          {project.status === 'active' ? 'Purchase Credits' : project.status === 'soldout' ? 'Sold Out' : 'Coming Soon'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Checkout drawer ───────────────────────────────────────────────
function CheckoutDrawer({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [qty, setQty]   = useState(1)
  const [method, setMethod] = useState<'card'|'web3'>('card')
  const [step, setStep] = useState<'select'|'confirm'|'done'>('select')

  if (!project) return null
  const subtotal = qty * project.pricePerTon
  const fee      = method === 'card' ? subtotal * 0.029 : 0
  const total    = subtotal + fee

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-[400] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}/>
          <motion.div
            className="fixed bottom-0 left-0 right-0 sm:top-0 sm:right-0 sm:left-auto sm:w-[420px] z-[401] bg-[var(--card)] rounded-t-2xl sm:rounded-none sm:rounded-l-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-screen"
            initial={{ y: '100%', x: 0 }} animate={{ y: 0, x: 0 }}
            exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 35 }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
              <div>
                <h3 className="font-bold text-[var(--text)]">Purchase Credits</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{project.name}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {step === 'done' ? (
                <div className="flex flex-col items-center py-10 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary-500"/>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text)]">Purchase Initiated!</h3>
                  <p className="text-sm text-[var(--text-muted)]">Your {qty} tCO₂e credits from {project.shortName} are being minted. Check your wallet in 1–2 minutes.</p>
                  <Link href="/ledger" onClick={onClose} className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">View in Ledger</Link>
                </div>
              ) : (
                <>
                  {/* Quantity */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-2">Quantity (tCO₂e)</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-xl border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-bold text-lg flex items-center justify-center transition-colors">−</button>
                      <input type="number" min={1} max={project.availableCredits} value={qty}
                        onChange={e => setQty(Math.max(1, Math.min(project.availableCredits, parseInt(e.target.value)||1)))}
                        className="flex-1 text-center text-lg font-bold text-[var(--text)] bg-[var(--input-bg)] border border-[var(--border)] rounded-xl py-2 focus:outline-none focus:border-primary-500"/>
                      <button onClick={() => setQty(q => Math.min(project.availableCredits, q + 1))}
                        className="w-9 h-9 rounded-xl border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-bold text-lg flex items-center justify-center transition-colors">+</button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">{project.availableCredits.toLocaleString()} tCO₂e available</p>
                  </div>

                  {/* Quick qty buttons */}
                  <div className="flex gap-2">
                    {[1,5,10,50,100].map(q => (
                      <button key={q} onClick={() => setQty(q)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${qty===q?'bg-primary-500 text-white border-primary-500':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] block mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id:'card', label:'💳 Card / USD', desc:'2.9% platform fee' },
                        { id:'web3', label:'⟠ MATIC',       desc:'Zero platform fee' },
                      ] as const).map(m => (
                        <button key={m.id} onClick={() => setMethod(m.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${method===m.id?'border-primary-500 bg-primary-500/5':'border-[var(--border)] hover:border-primary-500/40'}`}>
                          <p className="text-xs font-bold text-[var(--text)]">{m.label}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold text-[var(--text)] mb-3">Order Summary</h4>
                    {[
                      { label:`${qty} × ${project.shortName}`,     value:`$${subtotal.toFixed(2)}`      },
                      { label:`Platform fee (${method==='card'?'2.9%':'0%'})`, value:`$${fee.toFixed(2)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className="text-[var(--text)]">{value}</span>
                      </div>
                    ))}
                    <div className="border-t border-[var(--border)] pt-2 flex justify-between">
                      <span className="text-sm font-bold text-[var(--text)]">Total</span>
                      <span className="text-sm font-bold text-primary-500">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Test card hint */}
                  {method === 'card' && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                      <p className="text-[10px] text-blue-400 font-semibold mb-1">Test Mode — Stripe Sandbox</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">4242 4242 4242 4242 · 12/26 · 123</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {step !== 'done' && (
              <div className="p-5 border-t border-[var(--border)] shrink-0">
                <button onClick={() => setStep('done')}
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary-500/30">
                  <ShoppingCart className="w-4 h-4"/>
                  {method === 'card' ? `Pay $${total.toFixed(2)}` : `Pay ${(qty * 0.06).toFixed(4)} MATIC`}
                </button>
                <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">Credits will be minted to your wallet within 1–2 minutes</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Main Marketplace Page ─────────────────────────────────────────
export default function MarketplacePage() {
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<'all'|'active'|'upcoming'|'soldout'>('all')
  const [validatorFilter, setValid] = useState<'all'|'Verra'|'CCTS'|'Gold Standard'>('all')
  const [ecoFilter, setEco]         = useState<'all'|'mangrove'|'seagrass'|'wetland'>('all')
  const [sortBy, setSort]           = useState<'price_asc'|'price_desc'|'ndvi'|'area'>('price_asc')
  const [showFilters, setShowFilters] = useState(false)
  const [buying, setBuying]         = useState<Project | null>(null)

  const filtered = useMemo(() => {
    let list = [...PROJECTS]
    if (search)                     list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'all')     list = list.filter(p => p.status === statusFilter)
    if (validatorFilter !== 'all')  list = list.filter(p => p.validator === validatorFilter)
    if (ecoFilter !== 'all')        list = list.filter(p => p.ecosystem === ecoFilter)
    list.sort((a, b) => {
      if (sortBy === 'price_asc')  return a.pricePerTon - b.pricePerTon
      if (sortBy === 'price_desc') return b.pricePerTon - a.pricePerTon
      if (sortBy === 'ndvi')       return b.ndvi - a.ndvi
      if (sortBy === 'area')       return b.area - a.area
      return 0
    })
    return list
  }, [search, statusFilter, validatorFilter, ecoFilter, sortBy])

  const activeCount = PROJECTS.filter(p => p.status === 'active').length
  const totalCredits = PROJECTS.filter(p => p.status === 'active').reduce((s, p) => s + p.availableCredits, 0)

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-6">

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Carbon Marketplace</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {activeCount} active projects · {totalCredits.toLocaleString()} tCO₂e available · All satellite-verified
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"/>
          Live data · Updated hourly
        </div>
      </motion.div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects or locations…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
        </div>
        <div className="flex gap-2">
          <select value={sortBy} onChange={e => setSort(e.target.value as any)}
            className="px-3 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 cursor-pointer">
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="ndvi">NDVI ↓</option>
            <option value="area">Area ↓</option>
          </select>
          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-all ${showFilters ? 'bg-primary-500 text-white border-primary-500' : 'bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
            <SlidersHorizontal className="w-4 h-4"/> Filters
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {[
              { label:'Status',    value:statusFilter,   setter:setStatus,   opts:[['all','All'],['active','Active'],['upcoming','Upcoming'],['soldout','Sold Out']] },
              { label:'Validator', value:validatorFilter, setter:setValid,    opts:[['all','All'],['Verra','Verra'],['CCTS','CCTS'],['Gold Standard','Gold Standard']] },
              { label:'Ecosystem', value:ecoFilter,      setter:setEco,      opts:[['all','All'],['mangrove','Mangrove 🌿'],['seagrass','Seagrass 🌊'],['wetland','Wetland 🦢']] },
            ].map(({ label, value, setter, opts }) => (
              <div key={label}>
                <label className="text-xs font-semibold text-[var(--text)] block mb-2">{label}</label>
                <div className="flex flex-wrap gap-1.5">
                  {opts.map(([val, display]) => (
                    <button key={val} onClick={() => setter(val as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${value === val ? 'bg-primary-500 text-white border-primary-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
                      {display}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Showing {filtered.length} of {PROJECTS.length} projects</p>
        {(statusFilter !== 'all' || validatorFilter !== 'all' || ecoFilter !== 'all' || search) && (
          <button onClick={() => { setStatus('all'); setValid('all'); setEco('all'); setSearch('') }}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
            <X className="w-3 h-3"/> Clear all filters
          </button>
        )}
      </div>

      {/* Project grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40"/>
          <p className="text-sm">No projects match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onBuy={setBuying}/>)}
        </div>
      )}

      {/* Checkout drawer */}
      <CheckoutDrawer project={buying} onClose={() => setBuying(null)}/>
    </div>
  )
}
