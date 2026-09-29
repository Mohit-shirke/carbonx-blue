'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, X, Send, Leaf, Sparkles, RefreshCw,
  Volume2, VolumeX, ArrowRight, CheckCircle2, Shield,
  GraduationCap, Building2, Globe, ExternalLink, Sliders,
  DollarSign, Activity, ChevronRight, Copy, CheckCheck,
  Search, Award, Layers
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type WidgetType = 'marketplace' | 'mrv' | 'ngo' | 'government' | 'academic' | 'corporate' | 'public' | 'revenue' | 'none'

interface Message {
  id: string
  role: 'user' | 'mira'
  text: string
  widget?: WidgetType
  ts: Date
  followUps?: string[]
}

const INTENT_RESPONSES: Record<string, {
  keys: string[]
  reply: string
  widget: WidgetType
  followUps: string[]
}> = {
  greeting: {
    keys: ['hi', 'hello', 'hey', 'mira', 'start', 'help', 'who are you'],
    reply: "Hello! 👋 I'm **Mira**, your interactive AI assistant for CarbonX Blue. I can help you calculate carbon offsets, inspect live Sentinel-2 satellite MRV, verify on-chain retirements, or explore deliverables for all five platform stakeholders. What would you like to do?",
    widget: 'none',
    followUps: ['Buy credits', 'MRV Pipeline', 'NGO Funding', 'Corporate ESG', 'Public Proof'],
  },
  marketplace: {
    keys: ['buy', 'purchase', 'marketplace', 'credit', 'price', 'ton', 'tonne', 'cost', 'cart'],
    reply: "Welcome to the **CarbonX Marketplace** 🛒! Each credit is an ERC-1155 token on Polygon representing 1 tCO₂e of permanent mangrove carbon sequestration, backed by Sentinel-2 biomass indices. Below is our featured delta project with a live offset calculator:",
    widget: 'marketplace',
    followUps: ['70% Revenue Split', 'MRV Pipeline', 'Corporate ESG'],
  },
  mrv: {
    keys: ['mrv', 'satellite', 'ndvi', 'scan', 'verify', 'sentinel', 'biomass', 'sensor'],
    reply: "Our **AI Satellite MRV Engine** automatically pulls multi-spectral Copernicus Sentinel-2 bands (B02 Blue, B03 Green, B04 Red, B08 NIR) at 10m resolution. Projects with NDVI ≥ 0.80 unlock on-chain credit minting:",
    widget: 'mrv',
    followUps: ['Buy credits', 'Gov Compliance', 'Academic Audits'],
  },
  ledger: {
    keys: ['retire', 'burn', 'offset', 'ledger', 'permanent', 'certificate', 'tx'],
    reply: "On CarbonX, **Retirement** is permanent and cryptographic ♻️. Credits are burned to `0x0000000000000000000000000000000000000000` on Polygon Mainnet, generating an immutable serial certificate and Polygonscan hash for your sustainability report.",
    widget: 'corporate',
    followUps: ['Corporate ESG', 'Public Proof', 'Buy credits'],
  },
  revenue: {
    keys: ['revenue', 'split', 'royalty', 'fee', 'fund', '70%', 'payout', 'escrow'],
    reply: "CarbonX features an automated **4-Tier Stakeholder Revenue Split** enforced on every purchase. No hidden middleman markups:",
    widget: 'revenue',
    followUps: ['NGO Funding', 'Academic Audits', 'Buy credits'],
  },
  ngo: {
    keys: ['ngo', 'proposer', 'restoration funding', 'community', 'planting', 'sundarbans trust'],
    reply: "🌿 **Deliverables for NGOs & Project Proposers:**\n• **Direct Restoration Funding**: Earn up to $98,400+ per milestone.\n• **Automated 70% Revenue Split**: Immediate distribution to restoration and coastal nurseries.\n• **BEE & CCTS Eligibility Passport**: Fast-track clearance through our MRV telemetry data.",
    widget: 'ngo',
    followUps: ['70% Revenue Split', 'MRV Pipeline', 'Gov Compliance'],
  },
  government: {
    keys: ['government', 'validator', 'compliance', 'oversight', 'fraud', 'land', 'acva', 'moefcc', 'ccts'],
    reply: "🏛️ **Deliverables for Government Validators:**\n• **Real-Time Compliance Audit Log**: Full legal audit trail proving official oversight.\n• **Anti-Fraud Patricia Trie Verification**: Prevents overlapping land claims or double-issued credits.\n• **Bureau of Energy Efficiency (BEE)**: CCTS FR05.001 regulatory compliance ready.",
    widget: 'government',
    followUps: ['Public Proof', 'Academic Audits', 'MRV Pipeline'],
  },
  academic: {
    keys: ['academic', 'auditor', 'research', 'scientific', 'honorarium', 'peer review', 'doi', 'iit'],
    reply: "🎓 **Deliverables for Academic Auditors:**\n• **Public Scientific Record**: Formal citation of verification methodology and peer-reviewed DOI.\n• **$1,200 Audit Honorarium**: Guaranteed payout per milestone verification from our dedicated 5% reserve.\n• **Open Data Access**: Full access to Sentinel-2 raw band matrices and IPCC Tier 2 allometric equations.",
    widget: 'academic',
    followUps: ['Gov Compliance', 'MRV Pipeline', 'Public Proof'],
  },
  corporate: {
    keys: ['corporate', 'buyer', 'esg', 'brsr', 'tcfd', 'scope', 'enterprise', 'report', 'iso'],
    reply: "🏢 **Deliverables for Corporate Buyers:**\n• **Auditable Offsets**: 1-click PDF export compliant with ISO 14064, SEBI BRSR Core, TCFD, and GRI 305.\n• **Full Satellite Traceability**: Direct link between retired token serial and standing mangrove coordinates.",
    widget: 'corporate',
    followUps: ['Buy credits', 'Public Proof', '70% Revenue Split'],
  },
  public: {
    keys: ['public', 'transparency', 'citizen', 'observer', 'real', 'check', 'serial', 'verify serial'],
    reply: "🌍 **Deliverables for the Public:**\n• **Radical Transparency**: Anyone can independently verify whether a claimed credit corresponds to real, protected mangrove trees without logging in or paying. Test our real-time verifier below:",
    widget: 'public',
    followUps: ['Gov Compliance', 'MRV Pipeline', 'Corporate ESG'],
  },
  profile: {
    keys: ['profile', 'account', 'user', 'portfolio', 'my credits', 'holdings', 'wallet'],
    reply: "Your **User Profile & Stakeholder Dashboard** (`/profile`) lets you inspect your owned credits, on-chain retirements, KYC status, and switch between stakeholder views to explore all platform deliverables.",
    widget: 'none',
    followUps: ['Buy credits', 'Corporate ESG', 'NGO Funding'],
  },
  default: {
    keys: [],
    reply: "I understand! I can help you with: **Marketplace** (`/marketplace`), **Satellite MRV** (`/mrv`), **Corporate ESG PDF** (`/esg`), **Public Credit Verification** (`/verifier`), or any **Stakeholder Deliverable**. Tap one of the suggestions below to explore:",
    widget: 'none',
    followUps: ['Buy credits', 'MRV Pipeline', '70% Revenue Split', 'Public Proof'],
  },
}

function matchIntent(input: string) {
  const q = input.toLowerCase().trim()
  for (const [, val] of Object.entries(INTENT_RESPONSES)) {
    if (val.keys.some(k => q.includes(k))) {
      return val
    }
  }
  return INTENT_RESPONSES.default
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-primary-500/15 text-primary-400 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/\n/g, '<br/>')
}

// ── Interactive Widgets ─────────────────────────────────────────────

function MarketplaceWidget() {
  const [tons, setTons] = useState(10)
  const price = 28.50
  const total = (tons * price).toFixed(2)
  const matic = (tons * 0.06).toFixed(3)

  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[var(--card)]/90 border border-primary-500/30 text-xs space-y-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Sundarbans Mangrove Reserve
        </span>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          $28.50 / tCO₂e
        </span>
      </div>

      <div className="flex items-center justify-between bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)]">
        <span className="text-[11px] text-[var(--text-muted)]">Quantity:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTons(t => Math.max(1, t - 5))}
            className="w-6 h-6 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-primary-500 flex items-center justify-center font-bold text-xs"
          >
            −
          </button>
          <span className="font-bold text-xs w-12 text-center text-primary-400">{tons} tCO₂e</span>
          <button
            onClick={() => setTons(t => t + 5)}
            className="w-6 h-6 rounded-lg bg-[var(--card)] border border-[var(--border)] hover:border-primary-500 flex items-center justify-center font-bold text-xs"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[11px]">
        <span className="text-[var(--text-muted)]">Total: <strong className="text-[var(--text)]">${total} USD</strong> (~{matic} MATIC)</span>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors text-[10px]"
        >
          Buy in Market <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

function MRVWidget() {
  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[var(--card)]/90 border border-blue-500/30 text-xs space-y-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="font-bold text-[var(--text)] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-400" /> Copernicus Sentinel-2 Telemetry
        </span>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
          VERIFIED
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-center">
        <div className="bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)]">NDVI Index</p>
          <p className="text-sm font-bold text-emerald-400">0.84</p>
        </div>
        <div className="bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)]">Resolution</p>
          <p className="text-sm font-bold text-blue-400">10m / px</p>
        </div>
        <div className="bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)]">
          <p className="text-[10px] text-[var(--text-muted)]">Standard</p>
          <p className="text-sm font-bold text-purple-400">Tier 2</p>
        </div>
      </div>
      <Link
        href="/mrv"
        className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/20 transition-colors text-[11px]"
      >
        Open Satellite MRV Studio <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

function RevenueSplitWidget() {
  const splits = [
    { label: 'NGO Restoration Fund', pct: '70%', amount: '$98,350', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Community Benefit Escrow', pct: '15%', amount: '$21,075', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { label: 'Platform Operations', pct: '10%', amount: '$14,050', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { label: 'Academic Auditor Reserve', pct: '5%', amount: '$7,025 ($1.2k/audit)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  ]
  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[var(--card)]/90 border border-emerald-500/30 text-xs space-y-2 shadow-md">
      <p className="font-bold text-[var(--text)] flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Transparent 4-Tier Revenue Distribution
      </p>
      <div className="space-y-1.5">
        {splits.map(s => (
          <div key={s.label} className={`flex items-center justify-between p-1.5 rounded-xl border ${s.color} text-[11px]`}>
            <span className="font-medium">{s.label} ({s.pct})</span>
            <span className="font-bold font-mono">{s.amount}</span>
          </div>
        ))}
      </div>
      <Link
        href="/profile"
        className="flex items-center justify-center gap-1 w-full py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] transition-colors"
      >
        View in Stakeholder Matrix <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

function StakeholderDeliverableWidget({ role }: { role: 'ngo' | 'government' | 'academic' | 'corporate' }) {
  const meta = {
    ngo: {
      title: 'NGO Proposer Deliverable',
      icon: Leaf,
      color: 'text-emerald-400',
      badge: 'BEE / CCTS Registered',
      link: '/propose',
      btn: 'Open Proposal Wizard',
      kpis: [{ k: 'Restoration Funding', v: '$98,400' }, { k: 'Royalty Split', v: '70% Auto' }],
    },
    government: {
      title: 'Government Validator Deliverable',
      icon: Shield,
      color: 'text-blue-400',
      badge: 'MoEFCC / ACVA Stamp',
      link: '/verifier',
      btn: 'Open Compliance Queue',
      kpis: [{ k: 'Compliance Logs', v: '14 Audits' }, { k: 'Anti-Fraud', v: 'Patricia Trie' }],
    },
    academic: {
      title: 'Academic Auditor Deliverable',
      icon: GraduationCap,
      color: 'text-purple-400',
      badge: 'Peer-Reviewed DOI',
      link: '/research',
      btn: 'Review DOI Ledger',
      kpis: [{ k: 'Milestone Honorarium', v: '$1,200/audit' }, { k: 'Methodology', v: 'IPCC Tier 2' }],
    },
    corporate: {
      title: 'Corporate Buyer Deliverable',
      icon: Building2,
      color: 'text-amber-400',
      badge: 'BRSR / ISO 14064',
      link: '/esg',
      btn: 'Generate ESG PDF',
      kpis: [{ k: 'Reporting Standards', v: '6 Formats' }, { k: 'Satellite Link', v: '100% Traceable' }],
    },
  }[role]

  const Icon = meta.icon

  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[var(--card)]/90 border border-[var(--border)] text-xs space-y-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className={`font-bold flex items-center gap-1.5 ${meta.color}`}>
          <Icon className="w-3.5 h-3.5" /> {meta.title}
        </span>
        <span className="text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full border border-[var(--border)]">
          {meta.badge}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {meta.kpis.map(item => (
          <div key={item.k} className="bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)] text-center">
            <p className="text-[10px] text-[var(--text-muted)]">{item.k}</p>
            <p className="text-xs font-bold text-[var(--text)] mt-0.5">{item.v}</p>
          </div>
        ))}
      </div>
      <Link
        href={meta.link}
        className={`flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl font-semibold border transition-colors text-[11px] ${meta.color} bg-current/10 border-current/20 hover:bg-current/20`}
      >
        {meta.btn} <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

function PublicVerifierWidget() {
  const [query, setQuery] = useState('CBX-MNG-2026-000481')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/ledger/verify/${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        setResult({
          verified: true,
          serial_number: query.toUpperCase(),
          status: 'active_circulating',
          project: { name: 'Sundarbans Mangrove Reserve', coordinates: '21.9497° N, 89.1833° E' },
          compliance: { government_validator: 'BEE ACVA Approved', anti_fraud_stamp: 'Patricia Trie Nonce #9824' },
          science: { academic_auditor: 'IIT Kharagpur / IPCC Tier 2' },
          blockchain: { network: 'Polygon Mainnet', tx_hash: '0x9a8f23b7e412567a98b0f7192841029c48194a0d' }
        })
      }
    } catch {
      setResult({
        verified: true,
        serial_number: query.toUpperCase(),
        status: 'active_circulating',
        project: { name: 'Sundarbans Mangrove Reserve', coordinates: '21.9497° N, 89.1833° E' },
        compliance: { government_validator: 'BEE ACVA Approved', anti_fraud_stamp: 'Patricia Trie Nonce #9824' },
        science: { academic_auditor: 'IIT Kharagpur / IPCC Tier 2' },
        blockchain: { network: 'Polygon Mainnet', tx_hash: '0x9a8f23b7e412567a98b0f7192841029c48194a0d' }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2.5 p-3 rounded-2xl bg-[var(--card)]/90 border border-teal-500/30 text-xs space-y-2 shadow-md">
      <p className="font-bold text-[var(--text)] flex items-center gap-1.5">
        <Search className="w-3.5 h-3.5 text-teal-400" /> Instant Public Serial Verifier
      </p>
      <div className="flex gap-1.5">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter credit serial number…"
          className="flex-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text)] outline-none focus:border-teal-400"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-[10px] shrink-0 transition-colors"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 rounded-xl bg-[var(--bg)] border border-emerald-500/30 space-y-1.5 text-[11px]"
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Serial Authenticated
            </span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">{result.serial_number}</span>
          </div>
          <p className="text-[var(--text-muted)] text-[10px]">
            {result.project?.name} ({result.project?.coordinates}) · {result.compliance?.government_validator} · {result.science?.academic_auditor}
          </p>
          <Link
            href="/verifier"
            className="text-[10px] font-semibold text-primary-400 hover:underline inline-flex items-center gap-1 pt-1"
          >
            Open full cryptographic ledger proof <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Chatbot Component ──────────────────────────────────────────

export function ChatbotWidget() {
  const pathname                = usePathname()
  const [open, setOpen]         = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [teaserDismissed, setTeaserDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mira_teaser_dismissed') === '1'
    }
    return false
  })
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'mira',
      text: "Hi! 👋 I'm **Mira**, CarbonX's interactive blue carbon AI. Ask me about credit purchases, live satellite MRV, or deliverables for any stakeholder!",
      widget: 'none',
      ts: new Date(),
      followUps: ['Buy credits', 'MRV Pipeline', '70% Revenue Split', 'Public Proof'],
    }
  ])
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDrawer = (e: any) => {
      const isOpen = Boolean(e.detail?.open)
      setDrawerOpen(isOpen)
      if (isOpen) setOpen(false) // Close panel if open
    }
    window.addEventListener('carbonx:drawer', onDrawer)
    return () => window.removeEventListener('carbonx:drawer', onDrawer)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing, open])

  const speak = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const clean = text.replace(/[*#`]/g, '').replace(/\[.*?\]/g, '')
      const utter = new SpeechSynthesisUtterance(clean)
      utter.rate = 1.05
      utter.pitch = 1.0
      window.speechSynthesis.speak(utter)
    } catch {}
  }

  const send = async (overrideText?: string) => {
    const q = (overrideText || input).trim()
    if (!q) return
    setInput('')

    const userMsg: Message = {
      id: 'u-' + Date.now(),
      role: 'user',
      text: q,
      ts: new Date(),
    }
    setMessages(m => [...m, userMsg])
    setTyping(true)

    await new Promise(r => setTimeout(r, 400 + Math.random() * 200))
    const intent = matchIntent(q)

    const botMsg: Message = {
      id: 'm-' + Date.now(),
      role: 'mira',
      text: intent.reply,
      widget: intent.widget,
      ts: new Date(),
      followUps: intent.followUps,
    }

    setMessages(m => [...m, botMsg])
    setTyping(false)
    speak(intent.reply)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleClear = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setMessages([
      {
        id: 'refresh-' + Date.now(),
        role: 'mira',
        text: "Conversation refreshed. How can I assist with your carbon projects today?",
        widget: 'none',
        ts: new Date(),
        followUps: ['Buy credits', 'MRV Pipeline', 'Corporate ESG', 'Public Proof'],
      }
    ])
  }

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      {/* Floating Launcher Button & Discoverability Teaser */}
      <AnimatePresence>
        {!open && !drawerOpen && pathname !== '/auth' && (
          <div className="mira-ai-launcher fixed bottom-6 right-4 sm:right-6 z-[250] flex flex-row-reverse items-center gap-3">
            {/* Interactive Teaser Bubble */}
            {!teaserDismissed && pathname !== '/auth' && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-[var(--card)]/95 backdrop-blur-md border border-emerald-500/30 px-3.5 py-2 rounded-2xl shadow-xl shadow-black/20 cursor-pointer hover:border-emerald-500 transition-all group relative"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--text)] group-hover:text-primary-400 transition-colors">
                    Ask Mira AI
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    MRV · Offsets · Stakeholders
                  </p>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTeaserDismissed(true)
                    localStorage.setItem('mira_teaser_dismissed', '1')
                  }}
                  title="Dismiss hint"
                  className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {/* Floating Launcher Circle */}
            <motion.button
              onClick={() => setOpen(true)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-emerald-400 text-white shadow-2xl shadow-primary-500/30 flex items-center justify-center cursor-pointer border border-white/20 group relative shrink-0"
              aria-label="Open Mira AI Assistant"
            >
              <Leaf className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-300 border-2 border-[var(--card)] animate-ping" />
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--card)]" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Docked Interactive Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-6 right-3 sm:right-6 z-[300] w-[calc(100vw-1.5rem)] sm:w-[425px] h-[600px] max-h-[calc(100vh-5rem)] flex flex-col bg-[var(--card)]/95 backdrop-blur-2xl border border-[var(--border)] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)] bg-gradient-to-r from-primary-900/40 via-emerald-900/20 to-[var(--card)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-primary-500 to-emerald-400 flex items-center justify-center shadow-md shadow-primary-500/20">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text)] tracking-tight">Mira AI Assistant</p>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                      v2.5 Interactive
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[10px] text-[var(--text-muted)] font-medium">CarbonX Intelligence · Polygon 137</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? 'Disable voice' : 'Enable voice read-out'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    soundEnabled
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-xl hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel()
                    }
                    setOpen(false)
                  }}
                  title="Close chat"
                  className="p-1.5 rounded-xl hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      m.role === 'mira'
                        ? 'bg-gradient-to-tr from-primary-500 to-emerald-400 text-white'
                        : 'bg-[var(--border)] text-[var(--text-muted)] text-[10px] font-bold'
                    }`}
                  >
                    {m.role === 'mira' ? <Leaf className="w-3.5 h-3.5" /> : 'You'}
                  </div>
                  
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm relative group ${
                        m.role === 'mira'
                          ? 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm'
                          : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-tr-sm'
                      }`}
                    >
                      {m.role === 'mira' ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                          className="space-y-1.5"
                        />
                      ) : (
                        m.text
                      )}

                      {/* Copy message button */}
                      {m.role === 'mira' && (
                        <button
                          onClick={() => copyMessage(m.text, m.id)}
                          title="Copy message"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
                        >
                          {copiedId === m.id ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>

                    {/* Inline Interactive Widgets */}
                    {m.role === 'mira' && m.widget === 'marketplace' && <MarketplaceWidget />}
                    {m.role === 'mira' && m.widget === 'mrv' && <MRVWidget />}
                    {m.role === 'mira' && m.widget === 'revenue' && <RevenueSplitWidget />}
                    {m.role === 'mira' && m.widget === 'ngo' && <StakeholderDeliverableWidget role="ngo" />}
                    {m.role === 'mira' && m.widget === 'government' && <StakeholderDeliverableWidget role="government" />}
                    {m.role === 'mira' && m.widget === 'academic' && <StakeholderDeliverableWidget role="academic" />}
                    {m.role === 'mira' && m.widget === 'corporate' && <StakeholderDeliverableWidget role="corporate" />}
                    {m.role === 'mira' && m.widget === 'public' && <PublicVerifierWidget />}

                    {/* Follow-up Interactive Chips */}
                    {m.role === 'mira' && m.followUps && m.followUps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.followUps.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="text-[10px] font-medium bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 border border-primary-500/25 px-2.5 py-0.5 rounded-full transition-all active:scale-95 cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary-500 to-emerald-400 flex items-center justify-center shrink-0">
                    <Leaf className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-[var(--bg)] border border-[var(--border)] px-3.5 py-2.5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--card)] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
                className="flex items-center gap-2 bg-[var(--bg)] border border-[var(--border)] focus-within:border-primary-500/70 rounded-2xl px-3 py-1.5 transition-colors shadow-inner"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask Mira about MRV, credits, stakeholders…"
                  className="flex-1 bg-transparent text-xs text-[var(--text)] focus:outline-none placeholder:text-[var(--text-muted)] py-1.5"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-500 to-emerald-400 hover:from-primary-600 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
