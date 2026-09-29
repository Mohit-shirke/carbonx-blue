'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'

interface TxRow {
  id: string
  hash: string
  timestamp: string
  action: 'MINT' | 'RETIRE' | 'TRANSFER' | 'VERIFY'
  tokenId: string
  value: string
}

const ACTION_STYLES: Record<TxRow['action'], string> = {
  MINT:     'bg-primary-500/10 text-primary-500',
  RETIRE:   'bg-red-500/10 text-red-400',
  TRANSFER: 'bg-blue-500/10 text-blue-400',
  VERIFY:   'bg-amber-500/10 text-amber-400',
}

function randomHash(): string {
  const chars = '0123456789abcdef'
  const full = Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * 16)]).join('')
  return `0x${full.slice(0, 4)}…${full.slice(-4)}`
}

function randomTx(): TxRow {
  const actions: TxRow['action'][] = ['MINT', 'RETIRE', 'TRANSFER', 'VERIFY']
  const action = actions[Math.floor(Math.random() * actions.length)]
  const amount = Math.floor(Math.random() * 500 + 10)
  return {
    id: Math.random().toString(36).slice(2),
    hash: randomHash(),
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    action,
    tokenId: `ERC1155-${Math.floor(Math.random() * 9000 + 1000)}`,
    value: `${amount} tCO₂e`,
  }
}

const INITIAL_ROWS: TxRow[] = Array.from({ length: 12 }, randomTx)

export function TransactionTicker() {
  const [rows, setRows] = useState<TxRow[]>(INITIAL_ROWS)

  useEffect(() => {
    const interval = setInterval(() => {
      setRows(prev => [randomTx(), ...prev.slice(0, 24)])
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="card flex flex-col h-full min-h-[420px]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-[var(--border)] shrink-0">
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        <h2 className="font-semibold text-sm text-[var(--text)]">Live Block Feed</h2>
        <span className="ml-auto text-xs text-[var(--text-muted)] font-mono">Polygon Mainnet</span>
        <Zap className="w-3.5 h-3.5 text-primary-500" />
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 border-b border-[var(--border)] shrink-0">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tx Hash</span>
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Action</span>
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Amount</span>
      </div>

      {/* Scrollable rows */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto space-y-0">
          <AnimatePresence initial={false}>
            {rows.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: -12, backgroundColor: 'rgba(16,185,129,0.08)' }}
                animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(16,185,129,0)' }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-4 py-2.5 border-b border-[var(--border)]/50 hover:bg-[var(--border)]/30 transition-colors"
              >
                <div>
                  <p className="text-xs font-mono text-[var(--text)]">{tx.hash}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{tx.timestamp} · {tx.tokenId}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ACTION_STYLES[tx.action]}`}>
                  {tx.action}
                </span>
                <span className="text-xs font-medium text-[var(--text)] whitespace-nowrap text-right">
                  {tx.value}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {/* Fade out at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--card)] to-transparent pointer-events-none" />
      </div>
    </div>
  )
}
