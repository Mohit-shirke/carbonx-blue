'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAccount, useChainId, useDisconnect, useSwitchChain, useConnect, useBalance } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ChevronDown, LogOut, Copy, CheckCheck, AlertTriangle,
  ExternalLink, X, Shield, Sparkles, Loader2, Info, Search,
  CheckCircle2, ArrowRight, Smartphone, Key, Lock, Cpu
} from 'lucide-react'
import { EXPLORER_URL, OKLINK_URL, CHAIN_ID, web3ModalInstance, initWeb3Modal } from '@/lib/web3Config'
import { BorderBeam } from '@/components/ui/BorderBeam'

// ── Official Web3 Vector Logos ──────────────────────────────────────────────────

function MetaMaskIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 318.6 318.6" fill="none">
      <path fill="#E2761B" stroke="#E2761B" strokeMiterlimit="10" d="m274.1 35.5-99.5 73.9L194 65.8z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m44.4 35.5 98.7 74.6-18.7-44.3z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m238.3 206.8-28.5 43.4 59.8 16.5 17.2-59.2z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m31.8 207.4 17.1 59.3 59.9-16.5-28.5-43.4z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m101.8 130-19 28.5 68.3 2.1-2.4-73.8z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m216.8 130-47.5-43.7-2 74.3 68.4-2.1z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m108.8 250.2 39.5 27.5-6.5-28.4z"/>
      <path fill="#E4761B" stroke="#E4761B" strokeMiterlimit="10" d="m170.3 250.2-33 27.6 39.5-27.6z"/>
      <path fill="#D7C1B3" stroke="#D7C1B3" strokeMiterlimit="10" d="m176.8 277.8 33-27.6-26.5-1.1z"/>
      <path fill="#D7C1B3" stroke="#D7C1B3" strokeMiterlimit="10" d="m108.8 250.2 33 27.6-6.5-28.7z"/>
      <path fill="#233447" stroke="#233447" strokeMiterlimit="10" d="m106.8 183.1 31.5-14.8-27-21.3z"/>
      <path fill="#233447" stroke="#233447" strokeMiterlimit="10" d="m211.8 183.1-4.5-36.1-27 21.3z"/>
      <path fill="#CD6116" stroke="#CD6116" strokeMiterlimit="10" d="m106.8 183.1 4.5-36.1 48 3.5z"/>
      <path fill="#CD6116" stroke="#CD6116" strokeMiterlimit="10" d="m207.3 147-48 3.5 48 32.6z"/>
      <path fill="#E4751F" stroke="#E4751F" strokeMiterlimit="10" d="m82.8 158.5 26 24.6 2.5-36.1z"/>
      <path fill="#E4751F" stroke="#E4751F" strokeMiterlimit="10" d="m207.3 147 2.5 36.1 26-24.6z"/>
      <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="m108.8 206.8 33 24.1-28.5-43.4z"/>
      <path fill="#F6851B" stroke="#F6851B" strokeMiterlimit="10" d="m209.8 206.8-4.5-19.3-28.5 43.4z"/>
      <path fill="#C0AD9E" stroke="#C0AD9E" strokeMiterlimit="10" d="m176.8 230.9-35 2.1 6.5 16.2z"/>
      <path fill="#161616" stroke="#161616" strokeMiterlimit="10" d="m141.8 233 35-2.1-17.5-15.9z"/>
      <path fill="#763D16" stroke="#763D16" strokeMiterlimit="10" d="m279.3 173.8 7.5-35.3-12.7-3-20.3 71.3z"/>
      <path fill="#763D16" stroke="#763D16" strokeMiterlimit="10" d="m31.8 135.5 7.5 35.3 25.5 33-20.3-71.3z"/>
    </svg>
  )
}

function CoinbaseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="none">
      <circle cx="512" cy="512" r="512" fill="#0052FF"/>
      <path d="M512 256C370.6 256 256 370.6 256 512s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm-64 320c-35.3 0-64-28.7-64-64s28.7-64 64-64h128c35.3 0 64 28.7 64 64s-28.7 64-64 64H448z" fill="#fff"/>
    </svg>
  )
}

function WalletConnectIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 185" fill="none">
      <path d="M59.6 35.7C109.5-12.1 190.5-12.1 240.4 35.7L246.3 41.4C248.8 43.8 248.8 47.7 246.3 50.1L225.9 69.6C224.7 70.8 222.7 70.8 221.5 69.6L213.7 62.1C178.6 28.5 121.4 28.5 86.3 62.1L78.2 69.9C77 71.1 75 71.1 73.8 69.9L53.7 50.4C51.2 48 51.2 44.1 53.7 41.7L59.6 35.7ZM293.4 92.1L312.4 110.3C314.9 112.7 314.9 116.6 312.4 119L226.3 201.5C223.8 203.9 219.8 203.9 217.3 201.5L150.3 137.3C149.7 136.7 148.7 136.7 148.1 137.3L81.5 201C79 203.4 75 203.4 72.5 201L-12.4 119.7C-14.9 117.3-14.9 113.4-12.4 111L6.6 92.8C9.1 90.4 13.1 90.4 15.6 92.8L82.2 156.5C82.8 157.1 83.8 157.1 84.4 156.5L151 92.8C153.5 90.4 157.5 90.4 160 92.8L226.6 156.5C227.2 157.1 228.2 157.1 228.8 156.5L295.4 92.8C294.8 92.2 293.9 92.1 293.4 92.1Z" fill="#3B99FC"/>
    </svg>
  )
}

function PhantomIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 128" fill="none">
      <rect width="128" height="128" rx="28" fill="#AB9FF2"/>
      <path d="M104.7 66.8c-1.3-14.5-12.3-25.7-27.1-25.7H47.4C33.4 41.1 22 52.4 22 66.4c0 14 11.4 25.3 25.4 25.3h1.8v-8.4c0-3.9 3.2-7.1 7.1-7.1s7.1 3.2 7.1 7.1v8.4h7.5v-8.4c0-3.9 3.2-7.1 7.1-7.1s7.1 3.2 7.1 7.1v8.4h7.5v-8.4c0-3.9 3.2-7.1 7.1-7.1s7.1 3.2 7.1 7.1v8.4h1.7c7.2 0 13.5-4.1 16.3-10.1 1-2.2 1.4-4.5 1.5-6.9z" fill="#FFF"/>
      <circle cx="53" cy="62" r="4.5" fill="#4B4075"/>
      <circle cx="75" cy="62" r="4.5" fill="#4B4075"/>
    </svg>
  )
}

function SafeWalletIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" className="text-emerald-500 fill-emerald-500/10"/>
      <circle cx="12" cy="12" r="3" className="text-emerald-500"/>
      <path d="M12 9v1" className="text-emerald-500"/>
      <path d="M12 14v1" className="text-emerald-500"/>
      <path d="M14 12h1" className="text-emerald-500"/>
      <path d="M9 12h1" className="text-emerald-500"/>
    </svg>
  )
}

export function WalletConnectButton({ compact = false }: { compact?: boolean }) {
  const { address, isConnected, connector } = useAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { connect, connectors, isPending, error, reset } = useConnect()
  const { data: balanceData } = useBalance({ address, chainId: CHAIN_ID })

  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeConnectingId, setActiveConnectingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'installed' | 'mobile' | 'sandbox'>('all')
  const [missingWallet, setMissingWallet] = useState<'metamask' | 'phantom' | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close modal when successfully connected
  useEffect(() => {
    if (isConnected) {
      setModalOpen(false)
      setMissingWallet(null)
    }
  }, [isConnected])

  // Handle ESC key and scroll lock
  useEffect(() => {
    if (!modalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
        setMissingWallet(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  // Detect browser wallet extensions safely
  const isMetaMaskInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum?.isMetaMask)
  const isPhantomInjected = typeof window !== 'undefined' && Boolean((window as any).phantom?.ethereum?.isPhantom || (window as any).ethereum?.isPhantom)
  const isCoinbaseInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum?.isCoinbaseWallet)
  const isGenericInjected = typeof window !== 'undefined' && Boolean((window as any).ethereum)

  // Find wagmi connectors
  const metaMaskConnector = connectors.find(c =>
    c.id.toLowerCase().includes('metamask') || c.name.toLowerCase().includes('metamask')
  )
  const phantomConnector = connectors.find(c =>
    c.id.toLowerCase() === 'phantom' || c.name.toLowerCase().includes('phantom')
  )
  const coinbaseConnector = connectors.find(c =>
    c.id.toLowerCase().includes('coinbase') || c.name.toLowerCase().includes('coinbase')
  )
  const walletConnectConnector = connectors.find(c =>
    c.id === 'walletConnect' || c.name.toLowerCase().includes('walletconnect')
  )
  const injectedConnector = connectors.find(c => c.id === 'injected')
  const safeConnector = connectors.find(c => c.id === 'safe')
  const mockConnector = connectors.find(c => c.id === 'mock')

  const copy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWalletSelect = async (conn: any, identifier: string) => {
    try {
      reset()
      setMissingWallet(null)
      setActiveConnectingId(identifier)

      // If user clicks MetaMask but has no extension installed
      if (identifier === 'metamask' && !isMetaMaskInjected && !metaMaskConnector) {
        setMissingWallet('metamask')
        setActiveConnectingId(null)
        return
      }

      // If user clicks Phantom but has no extension installed
      if (identifier === 'phantom' && !isPhantomInjected && !phantomConnector) {
        setMissingWallet('phantom')
        setActiveConnectingId(null)
        return
      }

      if (conn) {
        connect({ connector: conn })
      } else {
        // Fallback to Web3Modal QR
        const modal = web3ModalInstance || initWeb3Modal()
        if (modal && typeof modal.open === 'function') {
          modal.open()
          setModalOpen(false)
        }
      }
    } catch (err) {
      console.error('Wallet connection error:', err)
    } finally {
      setActiveConnectingId(null)
    }
  }

  const openWeb3ModalDirectly = () => {
    setModalOpen(false)
    try {
      const modal = web3ModalInstance || initWeb3Modal()
      if (modal && typeof modal.open === 'function') {
        modal.open()
      }
    } catch (err) {
      console.warn('Web3Modal failed to open:', err)
    }
  }

  // Define wallet registry for rich UX
  const WALLET_OPTIONS = useMemo(() => [
    {
      id: 'metamask',
      name: 'MetaMask',
      badge: (isMetaMaskInjected || Boolean(metaMaskConnector)) ? 'Detected' : 'Popular',
      badgeColor: (isMetaMaskInjected || Boolean(metaMaskConnector)) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: (isMetaMaskInjected || Boolean(metaMaskConnector)) ? 'Connect local MetaMask browser extension' : 'Browser extension & iOS / Android mobile app',
      icon: MetaMaskIcon,
      iconBg: 'bg-orange-500/10',
      category: 'browser',
      connector: metaMaskConnector || injectedConnector,
      featured: true,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      badge: (isPhantomInjected || Boolean(phantomConnector)) ? 'Detected' : 'EVM Multi-chain',
      badgeColor: (isPhantomInjected || Boolean(phantomConnector)) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: (isPhantomInjected || Boolean(phantomConnector)) ? 'Connect local Phantom browser extension' : 'Browser extension & Phantom iOS / Android app',
      icon: PhantomIcon,
      iconBg: 'bg-purple-500/10',
      category: 'browser',
      connector: phantomConnector || (isPhantomInjected ? injectedConnector : undefined),
      featured: true,
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      badge: 'Smart Wallet',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Coinbase extension, mobile passkey & biometric login',
      icon: CoinbaseIcon,
      iconBg: 'bg-blue-500/10',
      category: 'browser',
      connector: coinbaseConnector,
      featured: false,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      badge: '300+ Wallets',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Rainbow, Trust, Zerion, Ledger & any mobile QR scanner',
      icon: WalletConnectIcon,
      iconBg: 'bg-sky-500/10',
      category: 'mobile',
      connector: walletConnectConnector,
      featured: true,
    },
    {
      id: 'injected',
      name: 'Browser Extension',
      badge: isGenericInjected ? 'Auto-detected' : 'Auto-detect',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Rabby, Brave Wallet, OKX, Opera Crypto, Bitget',
      icon: Shield,
      iconBg: 'bg-indigo-500/10',
      category: 'browser',
      connector: injectedConnector,
      featured: false,
    },
    {
      id: 'safe',
      name: 'Safe {Wallet}',
      badge: 'Multisig',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Gnosis Safe smart account for DAOs & institutional ESG',
      icon: SafeWalletIcon,
      iconBg: 'bg-emerald-500/10',
      category: 'multisig',
      connector: safeConnector,
      featured: false,
    },
    {
      id: 'sandbox',
      name: 'Instant Sandbox Demo',
      badge: '1-Click POL',
      badgeColor: 'text-primary-400 bg-primary-500/20 border-primary-500/30',
      description: 'Pre-loaded with 2,500 POL on Chain 137. Instant test retirement without extensions.',
      icon: Sparkles,
      iconBg: 'bg-primary-500/20',
      category: 'sandbox',
      connector: mockConnector,
      featured: true,
      isSandbox: true,
    },
  ], [
    isMetaMaskInjected, isPhantomInjected, isCoinbaseInjected, isGenericInjected,
    metaMaskConnector, phantomConnector, coinbaseConnector, walletConnectConnector, injectedConnector, safeConnector, mockConnector
  ])

  // Filtered list based on search and tab
  const filteredWallets = useMemo(() => {
    return WALLET_OPTIONS.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false
      if (activeTab === 'all') return true
      if (activeTab === 'installed') return w.id === 'metamask' && isMetaMaskInjected || w.id === 'phantom' && isPhantomInjected || w.id === 'injected' && isGenericInjected
      if (activeTab === 'mobile') return w.category === 'mobile' || w.id === 'walletconnect'
      if (activeTab === 'sandbox') return w.category === 'sandbox'
      return true
    })
  }, [WALLET_OPTIONS, searchQuery, activeTab, isMetaMaskInjected, isPhantomInjected, isGenericInjected])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-8 w-28 rounded-xl bg-[var(--border)] animate-pulse" />
    )
  }

  const isWrongNetwork = isConnected && chainId !== CHAIN_ID

  // ── Wrong network banner/button ───────────────────────────────────────────────
  if (isWrongNetwork) {
    return (
      <button
        onClick={() => switchChain({ chainId: CHAIN_ID })}
        className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-400 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
      >
        <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
        <span>Switch to Polygon Mainnet</span>
      </button>
    )
  }

  // ── Connected State ─────────────────────────────────────────────────────────
  if (isConnected && address) {
    const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`
    const isMock = connector?.id === 'mock'

    return (
      <div className="relative">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20 text-primary-500 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shrink-0" />
          <span className="font-mono text-xs text-[var(--text)] font-medium">
            {shortAddr}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400 uppercase font-bold tracking-wider">
            {isMock ? 'SANDBOX' : 'POLYGON'}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-50 p-3 space-y-2.5"
              >
                {/* Network & Balance Header */}
                <div className="px-3 py-2.5 bg-primary-500/5 border border-primary-500/15 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                      <p className="text-xs font-bold text-[var(--text)]">Polygon PoS Mainnet</p>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--border)]">Chain 137</span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1.5 border-t border-primary-500/10">
                    <span className="text-[11px] text-[var(--text-muted)]">Available Gas:</span>
                    <span className="text-xs font-semibold font-mono text-primary-500">
                      {isMock ? '2,500.00 POL' : balanceData ? `${parseFloat(balanceData.formatted).toFixed(4)} POL` : 'Loading…'}
                    </span>
                  </div>
                </div>

                {/* Address Box */}
                <div className="px-3 py-2 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">
                      {isMock ? 'Sandbox Test Account' : 'Connected Address'}
                    </p>
                    {isMock && (
                      <span className="text-[9px] text-primary-400 font-mono">Instant Mode</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-mono text-[var(--text)] truncate">{address}</p>
                    <button
                      onClick={copy}
                      title="Copy Address"
                      className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-primary-500 transition-colors cursor-pointer"
                    >
                      {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Explorer Links */}
                <div className="space-y-0.5">
                  <a
                    href={`${EXPLORER_URL}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--border)] transition-colors text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                      Polygonscan Explorer
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">↗</span>
                  </a>

                  <a
                    href={`${OKLINK_URL}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[var(--border)] transition-colors text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                      OKLink Explorer
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">↗</span>
                  </a>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={() => {
                    disconnect()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-xs transition-colors mt-1 cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect Wallet
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Disconnected State + Trigger Button ───────────────────────────────────────
  return (
    <>
      <button
        onClick={() => {
          setModalOpen(true)
          reset()
        }}
        className="relative group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer overflow-hidden"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>{compact ? 'Wallet' : 'Connect Wallet'}</span>
        <ChevronDown className="w-3 h-3 opacity-70 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* ── React Portal: True Viewport-Centered Web3 Connect Modal ─────────── */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
              {/* Fullscreen Dimmed Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setModalOpen(false)
                  setMissingWallet(null)
                  reset()
                }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-0"
              />

              {/* Centered Modal Window with 21st.dev BorderBeam */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl z-10 my-auto flex flex-col max-h-[88vh] overflow-hidden"
              >
                {/* 21st.dev Laser BorderBeam Effect */}
                <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#8247E5" borderWidth={2} />

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--bg)]/70 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[var(--text)]">Connect Web3 Wallet</h2>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 border border-primary-500/25">
                          Polygon 137
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">Select your preferred Polygon provider to sign transactions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalOpen(false)
                      setMissingWallet(null)
                      reset()
                    }}
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs & Search Bar */}
                <div className="px-5 pt-3 pb-2 border-b border-[var(--border)]/60 bg-[var(--bg)]/40 shrink-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                      {(['all', 'installed', 'mobile', 'sandbox'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all capitalize cursor-pointer ${
                            activeTab === tab
                              ? 'bg-primary-500 text-white shadow-sm'
                              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          {tab === 'sandbox' ? '✨ Sandbox' : tab}
                        </button>
                      ))}
                    </div>
                    <div className="relative flex-1 max-w-[170px]">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        placeholder="Search wallets…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallet Extension Not Installed Helper Alert */}
                {missingWallet && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mx-5 mt-3 p-3.5 rounded-2xl border shrink-0 space-y-2 ${
                      missingWallet === 'phantom'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        : 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 text-xs">
                      {missingWallet === 'phantom' ? (
                        <PhantomIcon className="w-5 h-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold">
                          {missingWallet === 'phantom' ? 'Phantom Wallet Not Detected' : 'MetaMask Extension Not Detected'}
                        </p>
                        <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                          {missingWallet === 'phantom'
                            ? 'Your browser does not have the Phantom extension installed. You can install Phantom, connect via Phantom Mobile QR, or try the instant Sandbox demo:'
                            : 'Your browser does not have the MetaMask extension installed. You can install it now, or connect immediately using MetaMask Mobile QR code or the Sandbox demo:'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={missingWallet === 'phantom' ? 'https://phantom.app/download' : 'https://metamask.io/download/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 text-center py-1.5 px-2 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                          missingWallet === 'phantom' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        Install {missingWallet === 'phantom' ? 'Phantom' : 'MetaMask'} <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={openWeb3ModalDirectly}
                        className="flex-1 py-1.5 px-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Smartphone className="w-3 h-3" /> Scan Mobile QR
                      </button>
                      <button
                        onClick={() => {
                          handleWalletSelect(mockConnector, 'sandbox')
                        }}
                        className="py-1.5 px-2.5 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Sandbox
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Wagmi Connection Error Notice */}
                {error && !missingWallet && (
                  <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Wallet Notice</p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        {error.message.toLowerCase().includes('rejected')
                          ? 'Connection request was cancelled.'
                          : error.message.toLowerCase().includes('provider not found') || error.message.toLowerCase().includes('connector not found') || error.message.includes('@wagmi')
                          ? 'No browser wallet extension detected. You can install MetaMask, Phantom, or use our instant Web3 Sandbox.'
                          : error.message.replace(/Version:.*$/i, '').trim().slice(0, 120)}
                      </p>
                    </div>
                    <button
                      onClick={() => reset()}
                      className="text-[11px] uppercase font-bold text-amber-400 hover:text-amber-300 ml-1 cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Wallet Options List (Scrollable, Clean Padding) */}
                <div className="p-5 space-y-2.5 overflow-y-auto flex-1 max-h-[52vh]">
                  {filteredWallets.map(w => {
                    const IconComponent = w.icon
                    const isConnecting = activeConnectingId === w.id && isPending

                    return (
                      <button
                        key={w.id}
                        onClick={() => handleWalletSelect(w.connector, w.id)}
                        disabled={isPending}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group cursor-pointer ${
                          w.isSandbox
                            ? 'border-dashed border-primary-500/50 bg-primary-500/5 hover:bg-primary-500/15'
                            : 'border-[var(--border)] bg-[var(--bg)] hover:border-primary-500/60 hover:bg-primary-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl ${w.iconBg} flex items-center justify-center p-1.5 shrink-0 transition-transform group-hover:scale-105`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-[var(--text)] group-hover:text-primary-500 transition-colors truncate">
                                {w.name}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${w.badgeColor}`}>
                                {w.badge}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                              {w.description}
                            </p>
                          </div>
                        </div>

                        <div className="pl-3 shrink-0">
                          {isConnecting ? (
                            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-[var(--border)]/50 flex items-center justify-center text-[var(--text-muted)] group-hover:bg-primary-500 group-hover:text-white transition-all">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {filteredWallets.length === 0 && (
                    <div className="text-center py-8 text-[var(--text-muted)] text-xs">
                      No wallets match &quot;{searchQuery}&quot;. Try selecting &quot;All&quot; or launch Web3Modal below.
                    </div>
                  )}
                </div>

                {/* Footer Security Badge & Direct Web3Modal Alternative */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-[var(--text-muted)] shrink-0">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span className="text-[11px]">Polygon Mainnet · Non-Custodial & Verified</span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={openWeb3ModalDirectly}
                      className="hover:text-primary-500 underline flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      Universal QR Modal
                    </button>
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary-500 underline flex items-center gap-1 text-[11px]"
                    >
                      Get MetaMask <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
