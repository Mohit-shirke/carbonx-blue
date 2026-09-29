'use client'
import { useState, useEffect } from 'react'
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ChevronDown, LogOut, Copy, CheckCheck, AlertTriangle, ExternalLink } from 'lucide-react'
import { polygonMainnet, EXPLORER_URL } from '@/lib/web3Config'

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected }      = useAccount()
  const chainId                        = useChainId()
  const { connect, connectors }        = useConnect()
  const { disconnect }                 = useDisconnect()
  const { switchChain }               = useSwitchChain()
  const [open, setOpen]               = useState(false)
  const [copied, setCopied]           = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => setMounted(true), [])

  const isWrongNetwork = isConnected && chainId !== polygonMainnet.id

  const copy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  if (!mounted) return null

  // ── Wrong network warning ────────────────────────────────────────
  if (isWrongNetwork) return (
    <button onClick={() => switchChain({ chainId: polygonMainnet.id })}
      className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
      <AlertTriangle className="w-3.5 h-3.5"/>
      {!compact && 'Switch to Polygon'}
    </button>
  )

  // ── Not connected ────────────────────────────────────────────────
  if (!isConnected) return (
    <button onClick={() => connect({ connector: connectors[0] })}
      className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
      <Wallet className="w-3.5 h-3.5"/>
      {!compact && 'Connect Wallet'}
    </button>
  )

  // ── Connected ────────────────────────────────────────────────────
  const shortAddr = `${address?.slice(0,6)}…${address?.slice(-4)}`

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20 text-primary-500 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors">
        <div className="w-2 h-2 rounded-full bg-primary-500"/>
        {!compact && <span>{shortAddr}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}/>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:8 }} transition={{ duration:0.15 }}
              className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-20 p-2">

              {/* Network badge */}
              <div className="px-3 py-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"/>
                  <p className="text-xs font-semibold text-[var(--text)]">Polygon Mainnet</p>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Chain ID: 137</p>
              </div>

              {/* Address */}
              <div className="px-3 py-2 bg-[var(--bg)] rounded-xl mb-1">
                <p className="text-[10px] text-[var(--text-muted)]">Wallet Address</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs font-mono text-[var(--text)] truncate">{shortAddr}</p>
                  <button onClick={copy} className="shrink-0 text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                    {copied ? <CheckCheck className="w-3 h-3 text-primary-500"/> : <Copy className="w-3 h-3"/>}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <a href={`${EXPLORER_URL}/address/${address}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--border)] transition-colors text-xs text-[var(--text-muted)] hover:text-[var(--text)]">
                <ExternalLink className="w-3.5 h-3.5"/>View on Polygonscan
              </a>

              <button onClick={() => { disconnect(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-xs text-red-400 mt-0.5">
                <LogOut className="w-3.5 h-3.5"/>Disconnect
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
