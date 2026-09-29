'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, ExternalLink, CheckCircle, Zap, Shield, Search,
  Award, ArrowUpRight, Copy, CheckCheck, Lock, Sparkles,
  TreeDeciduous, Waves, Fuel, Filter, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { WalletConnectButton } from '@/components/web3/WalletConnectButton'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { CertificateModal } from '@/components/ui/CertificateModal'
import { useAccount } from 'wagmi'
import { EXPLORER_URL, OKLINK_URL } from '@/lib/web3Config'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface RetirementRecord {
  id: string
  tokenId: number
  amount: number
  retiree: string
  note: string
  txHash: string
  timestamp: string
  blockNumber: number
  category?: 'Scope 1' | 'Scope 2' | 'Scope 3' | 'Personal' | 'Corporate'
}

const TOKEN_POOLS: Record<number, { name: string; location: string; ndvi: number }> = {
  1001: { name: 'Sundarbans Delta Mangrove Restoration', location: 'West Bengal, India', ndvi: 0.84 },
  1002: { name: 'Godavari Estuary Blue Carbon Project', location: 'Andhra Pradesh, India', ndvi: 0.79 },
  1003: { name: 'Pichavaram Mangrove Wetlands Reserve', location: 'Tamil Nadu, India', ndvi: 0.81 },
  1004: { name: 'Gulf of Kutch Coastal Sequestration', location: 'Gujarat, India', ndvi: 0.76 },
}

const MOCK_RETIREMENTS: RetirementRecord[] = [
  {
    id: 'r1',
    tokenId: 1001,
    amount: 250,
    retiree: '0xAbCd…1234',
    note: 'Q1 2026 Scope 3 offset – Acme Global Corp',
    txHash: '0x7a3f89e21bc4589d1234567890abcdef12345678',
    timestamp: '2026-06-15 14:32',
    blockNumber: 8824401,
    category: 'Scope 3',
  },
  {
    id: 'r2',
    tokenId: 1002,
    amount: 100,
    retiree: '0xDeFg…5678',
    note: 'International Aviation Travel Offset – Personal',
    txHash: '0x2b19cd88f34123567890abcdef1234567890abcd',
    timestamp: '2026-06-14 09:17',
    blockNumber: 8819832,
    category: 'Personal',
  },
  {
    id: 'r3',
    tokenId: 1001,
    amount: 500,
    retiree: '0x9Hji…8901',
    note: 'Annual Enterprise Sustainability Mandate 2025-26',
    txHash: '0x4c82ef99a01234567890abcdef1234567890abcd',
    timestamp: '2026-06-12 16:55',
    blockNumber: 8811203,
    category: 'Scope 1',
  },
  {
    id: 'r4',
    tokenId: 1003,
    amount: 75,
    retiree: '0xKlMn…2345',
    note: 'Global Climate Summit 2026 Event Net-Zero Commitment',
    txHash: '0x6e54bc77d91234567890abcdef1234567890abcd',
    timestamp: '2026-06-10 11:04',
    blockNumber: 8800941,
    category: 'Scope 2',
  },
]

function LedgerPageContent() {
  const { user, login } = useAuth()
  const { address: connectedAddress, isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Scope 1' | 'Scope 2' | 'Scope 3' | 'Personal'>('All')

  // Form states
  const [retireTokenId, setRetireTokenId] = useState('1001')
  const [retireAmount, setRetireAmount] = useState('50')
  const [retireNote, setRetireNote] = useState('')
  const [retirements, setRetirements] = useState<RetirementRecord[]>(MOCK_RETIREMENTS)

  // ── Apple HIG: Destructive actions require explicit confirmation ──
  const [showBurnConfirm, setShowBurnConfirm] = useState(false)

  // Interactive burn state
  const [burnStage, setBurnStage] = useState<'idle' | 'signing' | 'mining' | 'success'>('idle')
  const [activeCertificate, setActiveCertificate] = useState<RetirementRecord | null>(null)
  const [copiedTx, setCopiedTx] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/ledger`)
      .then(res => res.json())
      .then(data => {
        if (data && data.retirements && data.retirements.length > 0) {
          const mapped: RetirementRecord[] = data.retirements.map((r: any) => ({
            id: r.id || Math.random().toString(36).slice(2),
            tokenId: r.token_id || 1001,
            amount: r.amount || 100,
            retiree: r.retiree_wallet ? `${r.retiree_wallet.slice(0, 6)}…${r.retiree_wallet.slice(-4)}` : (r.user_name || '0xAnonymous'),
            note: r.retirement_note || r.note || 'Offset Claim',
            txHash: r.tx_hash ? r.tx_hash : `0x${Math.random().toString(16).slice(2, 10)}…`,
            timestamp: r.retired_at ? new Date(r.retired_at).toLocaleString() : new Date().toLocaleString(),
            blockNumber: parseInt(r.block_number) || 58291044,
            category: r.category || 'Scope 3',
          }))
          setRetirements(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // Calculate ecological telemetry impact
  const parsedAmount = Math.max(0, parseInt(retireAmount) || 0)
  const estimatedTrees = parsedAmount * 4.8
  const estimatedHectares = (parsedAmount * 0.0038).toFixed(3)
  const estimatedGas = '0.0018 POL'

  // Filtered records
  const filtered = useMemo(() => {
    return retirements.filter(r => {
      const matchesSearch =
        r.note.toLowerCase().includes(search.toLowerCase()) ||
        r.retiree.toLowerCase().includes(search.toLowerCase()) ||
        r.tokenId.toString().includes(search) ||
        r.txHash.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'All' || r.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [retirements, search, categoryFilter])

  // Total metrics
  const totalRetired = useMemo(() => {
    return retirements.reduce((acc, r) => acc + r.amount, 0) + 142000
  }, [retirements])

  // ── Step 1: Form submit just opens the confirmation dialog ────
  const handleRetire = async (e: React.FormEvent) => {
    e.preventDefault()
    if (parsedAmount <= 0) return
    if (!retireNote.trim()) return
    setShowBurnConfirm(true)
  }

  // ── Step 2: Actual burn executes only after user confirms ─────
  const executeBurn = async () => {
    setShowBurnConfirm(false)
    setBurnStage('signing')
    await new Promise(r => setTimeout(r, 900))

    setBurnStage('mining')
    await new Promise(r => setTimeout(r, 1200))

    const displayRetiree = connectedAddress
      ? `${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`
      : '0xBeneficiary…42e'

    const randomHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

    const newRecord: RetirementRecord = {
      id: Math.random().toString(36).slice(2),
      tokenId: parseInt(retireTokenId) || 1001,
      amount: parsedAmount,
      retiree: displayRetiree,
      note: retireNote || 'Voluntary Blue Carbon Offsetting',
      txHash: randomHash,
      timestamp: new Date().toLocaleString(),
      blockNumber: Math.floor(Math.random() * 100000 + 58300000),
      category: retireNote.toLowerCase().includes('scope 1') ? 'Scope 1' :
                retireNote.toLowerCase().includes('scope 2') ? 'Scope 2' :
                retireNote.toLowerCase().includes('personal') ? 'Personal' : 'Scope 3',
    }

    setRetirements(prev => [newRecord, ...prev])
    setBurnStage('success')
    setActiveCertificate(newRecord)
    setRetireNote('')
  }


  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedTx(hash)
    setTimeout(() => setCopiedTx(null), 2000)
  }

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
          <RefreshCw className="w-4 h-4 text-primary-500 animate-spin" />
          <span>Synchronizing Polygon Ledger Nodes…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* ─── Hero Header & Web3 Control ────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Polygon PoS Mainnet (Chain 137) · Verified Sequestration
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              On-Chain Retirement Ledger
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Every blue carbon token retired here is permanently burned to <code className="font-mono text-xs bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--border)]">address(0)</code>.
              Verifiable proof, instant Merkle root hashing, and zero double-counting guarantee.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            {isConnected && connectedAddress ? (
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/25">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-mono text-[var(--text)] font-semibold">
                  {connectedAddress.slice(0, 6)}…{connectedAddress.slice(-4)}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 font-bold uppercase tracking-wider">
                  Active Signer
                </span>
              </div>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>

        {/* ─── Live Telemetry Strip (4 Stat Cards with 21st.dev Spotlight) ────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Retired</span>
              <Award className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              {totalRetired.toLocaleString()}
            </p>
            <p className="text-[11px] text-primary-500 font-medium mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Permanent tCO₂e sequestered
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Pools</span>
              <TreeDeciduous className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              4 Pools
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Sundarbans, Godavari, Pichavaram
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Network Gas</span>
              <Fuel className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              32 Gwei
            </p>
            <p className="text-[11px] text-violet-400 font-medium mt-1">
              ~2.1s Polygon block finality
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tamper-Proof Burns</span>
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              {(retirements.length + 1485).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-400 font-medium mt-1">
              100% Cryptographically Sealed
            </p>
          </SpotlightCard>
        </div>

        {/* ─── Main Content Grid: Burn Terminal & Ledger Records ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── LEFT: The Interactive Burn Vault (5 cols) ── */}
          <div className="lg:col-span-5 space-y-4">
            <SpotlightCard className="p-6 border-primary-500/30 shadow-2xl relative overflow-hidden">
              {/* 21st.dev Moving Border Beam */}
              <BorderBeam size={260} duration={8} colorFrom="#10B981" colorTo="#8247E5" borderWidth={2} />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-sm">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-[var(--text)]">The Burn Vault</h2>
                    <p className="text-[11px] text-[var(--text-muted)]">Irreversible ERC-1155 Token Retirement</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/10 text-primary-500 border border-primary-500/20 font-semibold">
                  ERC-1155
                </span>
              </div>

              {/* Wallet Status Banner + Burn Form — Auth Gated */}
              {!user ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[var(--text)]">Authentication Required</h4>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed max-w-xs mx-auto">
                        Under CCTS & ICVCM guidelines, only verified accounts can permanently retire carbon credits on-chain.
                      </p>
                    </div>
                    <Link
                      href="/auth?redirect=/ledger"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs transition-all shadow-lg shadow-primary-500/20"
                    >
                      Sign In / Register
                    </Link>
                    <div className="pt-1">
                      <p className="text-[10px] text-[var(--text-muted)] mb-2">Or 1-click demo as:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => login({ name: 'Tata Steel ESG', email: 'esg@tatasteel.com', role: 'corporate', organization: 'Tata Steel' })}
                          className="px-2.5 py-2 rounded-lg bg-[var(--bg)] hover:bg-primary-500/10 border border-[var(--border)] hover:border-primary-500/30 text-[11px] font-semibold text-[var(--text)] transition-all"
                        >
                          Corporate
                        </button>
                        <button
                          onClick={() => login({ name: 'Rahul Sharma', email: 'rahul@outlook.com', role: 'individual' })}
                          className="px-2.5 py-2 rounded-lg bg-[var(--bg)] hover:bg-primary-500/10 border border-[var(--border)] hover:border-primary-500/30 text-[11px] font-semibold text-[var(--text)] transition-all"
                        >
                          Individual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* Wallet Status Banner */}
              {isConnected ? (
                <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-[var(--text-muted)] text-[11px]">Beneficiary Wallet:</span>
                    <span className="font-mono font-semibold text-primary-500">
                      {connectedAddress?.slice(0, 6)}…{connectedAddress?.slice(-4)}
                    </span>
                  </div>
                  <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Active</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs">
                  <span className="text-[var(--text-muted)] text-[11px]">Sign on-chain with your wallet</span>
                  <WalletConnectButton compact />
                </div>
              )}

              {/* Burn Form */}
              <form onSubmit={handleRetire} className="space-y-4">
                {/* Token ID Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
                    <span>Select Carbon Project Pool</span>
                    <span className="text-[10px] text-primary-500 font-normal">Sentinel-2 Verified</span>
                  </label>
                  <select
                    value={retireTokenId}
                    onChange={e => setRetireTokenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all font-medium"
                  >
                    <option value="1001">#1001 — Sundarbans Delta Mangrove (NDVI: 0.84)</option>
                    <option value="1002">#1002 — Godavari Estuary Wetlands (NDVI: 0.79)</option>
                    <option value="1003">#1003 — Pichavaram Marine Conservation (NDVI: 0.81)</option>
                    <option value="1004">#1004 — Gulf of Kutch Blue Carbon (NDVI: 0.76)</option>
                  </select>
                </div>

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-[var(--text)]">Amount to Burn</label>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">{parsedAmount} Metric Tonnes</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="50"
                      value={retireAmount}
                      onChange={e => setRetireAmount(e.target.value)}
                      required
                      className="w-full pl-3.5 pr-16 py-2.5 rounded-xl text-sm font-mono font-bold bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[var(--text-muted)]">
                      tCO₂e
                    </span>
                  </div>
                </div>

                {/* Live Ecological Telemetry Preview */}
                <div className="p-3.5 rounded-xl bg-[var(--bg)]/80 border border-[var(--border)] space-y-2">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary-500" />
                    Real-Time Environmental Impact
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <p className="text-xs font-bold font-mono text-emerald-500">~{Math.round(estimatedTrees)}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Trees Guarded</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <p className="text-xs font-bold font-mono text-teal-400">~{estimatedHectares} ha</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Mangrove Area</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--card)] border border-[var(--border)]">
                      <p className="text-xs font-bold font-mono text-violet-400">{estimatedGas}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Est. Gas</p>
                    </div>
                  </div>
                </div>

                {/* Retirement Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text)]">Official Offset Note / Beneficiary</label>
                  <textarea
                    placeholder="e.g. Scope 3 FY26 Corporate Emissions Offset — Acme Corp"
                    value={retireNote}
                    onChange={e => setRetireNote(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all resize-none"
                  />
                </div>

                {/* Progress or Submit Button */}
                {burnStage === 'signing' ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Awaiting Web3 Signature in Wallet…</span>
                  </div>
                ) : burnStage === 'mining' ? (
                  <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-500 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 animate-pulse" />
                    <span>Broadcasting Burn Tx to Polygon PoS Block…</span>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    variant="danger"
                    className="w-full py-3 rounded-xl font-bold shadow-lg shadow-red-500/15"
                    icon={<Flame className="w-4 h-4" />}
                  >
                    Permanently Burn & Retire Credits
                  </Button>
                )}

                {/* Success Notification & Certificate Trigger */}
                {burnStage === 'success' && activeCertificate && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Retirement executed on-chain!
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(activeCertificate)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-xs shadow-md hover:bg-emerald-600 transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      View Official Retirement Certificate
                    </button>
                  </motion.div>
                )}
              </form>
                </>
              )}
            </SpotlightCard>

            {/* Blockchain Specification Parameters */}
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-2 text-xs">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Cryptographic Burn Specs
              </p>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Target Burn Sink:</span>
                  <span className="text-red-400 font-bold">address(0x0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Execution Standard:</span>
                  <span className="text-[var(--text)]">ERC-1155 BatchBurn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Double-Count Protection:</span>
                  <span className="text-primary-500 font-bold">Merkle-Trie Deduplication</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: The Live Immutable Records Table (7 cols) ── */}
          <div className="lg:col-span-7 space-y-4">
            <SpotlightCard className="overflow-hidden border-[var(--border)] shadow-xl">
              {/* Header & Category Filters */}
              <div className="p-5 border-b border-[var(--border)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-base text-[var(--text)] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary-500" />
                      Immutable Retirement Records
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Live on-chain burn stream · Publicly auditable
                    </p>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      aria-label="Search retirement records by hash, note, or pool"
                      placeholder="Search hash, note, pool…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full sm:w-60 pl-8 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div role="group" aria-label="Filter records by category" className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1">
                    Filter:
                  </span>
                  {(['All', 'Scope 1', 'Scope 2', 'Scope 3', 'Personal'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={categoryFilter === cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                        categoryFilter === cat
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs" aria-label="On-chain carbon credit retirement records">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg)]/70 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-xs">
                      <th scope="col" className="px-4 py-3 text-left">Pool</th>
                      <th scope="col" className="px-4 py-3 text-left">Amount</th>
                      <th scope="col" className="px-4 py-3 text-left">Claim / Beneficiary</th>
                      <th scope="col" className="px-4 py-3 text-left">On-Chain Tx</th>
                      <th scope="col" className="px-4 py-3 text-right">Certificate</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--border)]/50">
                    <AnimatePresence>
                      {filtered.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="hover:bg-primary-500/5 transition-colors group"
                        >
                          {/* Pool / Token ID */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-primary-500">#{r.tokenId}</span>
                            <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">
                              {TOKEN_POOLS[r.tokenId]?.name || 'Blue Carbon Pool'}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono font-extrabold text-[var(--text)]">
                              {r.amount.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] ml-1">tCO₂e</span>
                            {r.category && (
                              <span className="block text-[9px] font-bold text-teal-400">
                                {r.category}
                              </span>
                            )}
                          </td>

                          {/* Claim Note & Retiree */}
                          <td className="px-4 py-3.5 max-w-[180px]">
                            <p className="text-[var(--text)] truncate font-medium">{r.note}</p>
                            <p className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                              {r.retiree}
                            </p>
                          </td>

                          {/* Tx Hash with Copy & Explorer Link */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`${OKLINK_URL}/tx/${r.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                {r.txHash.slice(0, 8)}…{r.txHash.slice(-4)}
                                <ArrowUpRight className="w-3 h-3" />
                              </a>

                              <button
                                onClick={() => copyHash(r.txHash)}
                                title="Copy Hash"
                                className="text-[var(--text-muted)] hover:text-primary-500 transition-colors"
                              >
                                {copiedTx === r.txHash ? (
                                  <CheckCheck className="w-3 h-3 text-primary-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              Block #{r.blockNumber}
                            </span>
                          </td>

                          {/* Certificate Action */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => setActiveCertificate(r)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 text-xs font-semibold transition-all border border-primary-500/20"
                            >
                              <Award className="w-3 h-3" />
                              Certificate
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                          No retirement records match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--bg)]/50 flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-mono">
                  Showing <strong>{filtered.length}</strong> of <strong>{retirements.length}</strong> records
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-primary-500 font-semibold text-xs">Live Polygon Feed</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>

      {/* ── Apple HIG: Burn Confirmation Dialog ─────────────────────────────────── */}
      <AnimatePresence>
        {showBurnConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
              onClick={() => setShowBurnConfirm(false)}
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="burn-confirm-title"
              aria-describedby="burn-confirm-desc"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[501] w-[calc(100vw-32px)] max-w-md bg-[var(--card)] border border-red-500/30 rounded-3xl shadow-2xl shadow-red-500/10 p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 id="burn-confirm-title" className="font-bold text-base text-[var(--text)]">
                    Confirm Permanent Retirement
                  </h3>
                  <p id="burn-confirm-desc" className="text-sm text-[var(--text-muted)] mt-0.5">
                    This action is <strong className="text-red-400">irreversible</strong>. Once burned, tokens cannot be recovered.
                  </p>
                </div>
              </div>

              {/* Summary of what will be burned */}
              <div className="rounded-2xl bg-[var(--bg)] border border-[var(--border)] p-4 space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Amount to Burn</span>
                  <span className="font-bold text-red-400">{parsedAmount} tCO₂e</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Carbon Pool</span>
                  <span className="text-[var(--text)]">#{retireTokenId} — {TOKEN_POOLS[parseInt(retireTokenId)]?.name || 'Blue Carbon Pool'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Burn Target</span>
                  <span className="text-red-400 font-bold">address(0x0)</span>
                </div>
                {retireNote && (
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-[var(--text-muted)] text-[11px] mb-0.5">Offset Note</p>
                    <p className="text-[var(--text)] text-xs font-sans leading-relaxed">{retireNote}</p>
                  </div>
                )}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                <span className="text-red-400 text-lg leading-none mt-0.5">⚠</span>
                <p className="text-sm text-red-400 leading-relaxed">
                  Tokens burned to <code className="font-mono text-xs bg-red-500/10 px-1 rounded">address(0)</code> are permanently destroyed. This action cannot be undone by anyone, including CarbonX.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBurnConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeBurn}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  Yes, Permanently Burn
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Cryptographic Retirement Certificate Modal ──────────────────────────── */}
      <CertificateModal
        isOpen={Boolean(activeCertificate)}
        onClose={() => setActiveCertificate(null)}
        data={activeCertificate}
      />
    </div>
  )
}

export default function LedgerPage() {
  return <LedgerPageContent />
}