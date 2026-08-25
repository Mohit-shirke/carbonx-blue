'use client'

import { useAccount, useChainId, useSwitchChain, useDisconnect } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, AlertTriangle, ChevronDown, LogOut, Copy, CheckCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { polygonAmoy } from '@/lib/web3Config'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'

interface Props { compact?: boolean }

// 1. Rename the core rendering function to keep internal logic clean
function WalletConnectButtonInner({ compact }: Props) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { disconnect } = useDisconnect()
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isWrongNetwork = isConnected && chainId !== polygonAmoy.id
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openModal = () => {
    const modal = document.querySelector('w3m-button') as any
    if (modal) {
      modal.click()
    } else {
      document.dispatchEvent(new CustomEvent('w3m-open-modal'))
    }
  }

  if (isWrongNetwork) {
    return (
      <motion.button
        onClick={() => switchChain({ chainId: polygonAmoy.id })}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-500 text-sm font-medium"
        whileHover={{ scale: 1.015, boxShadow: '0px 0px 8px rgba(245,158,11,0.4)' }}
        whileTap={{ scale: 0.975 }}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {!compact && 'Switch to Amoy'}
      </motion.button>
    )
  }

  if (!isConnected) {
    return (
      <motion.button
        onClick={openModal}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium"
        whileHover={{ scale: 1.015, boxShadow: '0px 0px 8px rgba(52,211,153,0.4)' }}
        whileTap={{ scale: 0.975 }}
      >
        <Wallet className="w-3.5 h-3.5" />
        {!compact && 'Connect Wallet'}
      </motion.button>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setMenuOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-500 dark:text-primary-400 text-sm font-medium"
        whileHover={{ scale: 1.015, boxShadow: '0px 0px 8px rgba(52,211,153,0.4)' }}
        whileTap={{ scale: 0.975 }}
      >
        <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
        {short}
        <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', menuOpen && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)]">Connected on</p>
              <p className="text-sm font-medium text-primary-500">Polygon Amoy</p>
            </div>
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
            <button
              onClick={() => { disconnect(); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// 2. Export dynamically with SSR disabled to block Node.js from running the internal hooks
export const WalletConnectButton = dynamic(
  () => Promise.resolve(WalletConnectButtonInner),
  {
    ssr: false,
    loading: () => (
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-500 opacity-50 text-sm font-medium cursor-not-allowed">
        <Wallet className="w-3.5 h-3.5" />
        Loading...
      </button>
    )
  }
)