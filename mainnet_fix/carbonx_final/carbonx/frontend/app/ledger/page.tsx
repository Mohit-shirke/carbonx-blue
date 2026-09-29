'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, ExternalLink, CheckCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Web3Providers } from '@/components/web3/Web3Providers'
import { WalletConnectButton } from '@/components/web3/WalletConnectButton'

interface RetirementRecord {
  id: string
  tokenId: number
  amount: number
  retiree: string
  note: string
  txHash: string
  timestamp: string
  blockNumber: number
}

const MOCK_RETIREMENTS: RetirementRecord[] = [
  { id: 'r1', tokenId: 1001, amount: 250, retiree: '0xAbCd…1234', note: 'Q1 2025 Scope 3 offset – Acme Corp', txHash: '0x7a3f…b29c', timestamp: '2025-06-15 14:32', blockNumber: 8824401 },
  { id: 'r2', tokenId: 1002, amount: 100, retiree: '0xDeFg…5678', note: 'Flight emissions offset – Personal', txHash: '0x2b19…d441', timestamp: '2025-06-14 09:17', blockNumber: 8819832 },
  { id: 'r3', tokenId: 1001, amount: 500, retiree: '0x9Hji…8901', note: 'Annual corporate sustainability report 2024', txHash: '0x4c82…f003', timestamp: '2025-06-12 16:55', blockNumber: 8811203 },
  { id: 'r4', tokenId: 1003, amount: 75, retiree: '0xKlMn…2345', note: 'Green conference sponsorship – Summit 2025', txHash: '0x6e54…a117', timestamp: '2025-06-10 11:04', blockNumber: 8800941 },
]

function LedgerPageContent() {
  const [mounted, setMounted] = useState(false)
  const [search, setSearch] = useState('')
  const [retireTokenId, setRetireTokenId] = useState('')
  const [retireAmount, setRetireAmount] = useState('')
  const [retireNote, setRetireNote] = useState('')
  const [retirements, setRetirements] = useState<RetirementRecord[]>(MOCK_RETIREMENTS)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = retirements.filter(r =>
    r.note.toLowerCase().includes(search.toLowerCase()) ||
    r.retiree.toLowerCase().includes(search.toLowerCase()) ||
    r.tokenId.toString().includes(search)
  )

  const handleRetire = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    await new Promise(r => setTimeout(r, 1500))
    const newRecord: RetirementRecord = {
      id: Math.random().toString(36).slice(2),
      tokenId: parseInt(retireTokenId),
      amount: parseInt(retireAmount),
      retiree: '0xYour…Wallet',
      note: retireNote,
      txHash: `0x${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`,
      timestamp: new Date().toLocaleString(),
      blockNumber: Math.floor(Math.random() * 1000000 + 8000000),
    }
    setRetirements(prev => [newRecord, ...prev])
    setRetireTokenId('')
    setRetireAmount('')
    setRetireNote('')
    setProcessing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 4000)
  }

  // Prevent server render engine from choking on Web3 components
  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-[var(--text-muted)] animate-pulse">Initializing Ledger Ledger Node...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Dynamic Dashboard Header including our Wallet connection button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">On-Chain Ledger</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">Immutable retirement records · ERC-1155 burn events · Polygon</p>
        </div>
        <div>
          <WalletConnectButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Retire form */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="font-semibold text-[var(--text)]">Retire Credits</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
              Burning credits transfers tokens to <span className="font-mono">address(0)</span> — permanent and irreversible on Polygon.
            </p>
            <form onSubmit={handleRetire} className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text)]">Token ID</label>
                <input placeholder="1001" type="number" value={retireTokenId} onChange={e => setRetireTokenId(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text)]">Amount (tCO₂e)</label>
                <input placeholder="100" type="number" value={retireAmount} onChange={e => setRetireAmount(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text)]">Retirement Note</label>
                <textarea placeholder="e.g. Q2 2025 Scope 1 emissions offset" value={retireNote} onChange={e => setRetireNote(e.target.value)} required rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-all resize-none" />
              </div>
              {success && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs">
                  <CheckCircle className="w-4 h-4" />Retirement recorded on ledger!
                </motion.div>
              )}
              <Button type="submit" variant="danger" className="w-full" loading={processing} icon={<Flame className="w-4 h-4" />}>
                {processing ? 'Processing…' : 'Retire & Burn Credits'}
              </Button>
            </form>
          </div>

          {/* Chain info */}
          <div className="card p-4 mt-4 space-y-2">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Chain Info</p>
            {[['Network','Polygon'],['Chain ID','137'],['Standard','ERC-1155'],['Burn Address','0x0000…0000']].map(([k,v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">{k}</span>
                <span className="text-[var(--text)] font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Records table */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <h2 className="font-semibold text-[var(--text)] flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-500" />Retirement Records
              </h2>
              <input
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-40 px-3 py-1.5 text-xs rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                    {['Token ID','Amount','Retiree','Note','Tx Hash','Date'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-[var(--text-muted)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="border-b border-[var(--border)]/50 hover:bg-[var(--border)]/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-primary-500">#{r.tokenId}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">{r.amount.toLocaleString()} tCO₂e</td>
                      <td className="px-4 py-3 font-mono text-[var(--text-muted)]">{r.retiree}</td>
                      <td className="px-4 py-3 text-[var(--text)] max-w-[160px] truncate">{r.note}</td>
                      <td className="px-4 py-3">
                        <a href={`https://www.oklink.com/polygon/tx/${r.txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          {r.txHash}<ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">{r.timestamp}</td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">No records match.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{filtered.length} records</span>
              <div className="flex items-center gap-1.5 text-xs text-primary-500">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />Polygon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Global Provider Wrapper
export default function LedgerPage() {
  return (
    <Web3Providers>
      <LedgerPageContent />
    </Web3Providers>
  )
}