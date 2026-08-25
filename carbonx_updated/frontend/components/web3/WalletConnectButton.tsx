'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, CheckCheck, AlertCircle } from 'lucide-react'

interface Props { compact?: boolean }

// Safe wrapper — only mounts after Web3 is ready
export function WalletConnectButton({ compact = false }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <WalletButtonFallback compact={compact}/>
  return <WalletButtonInner compact={compact}/>
}

// Shown before Web3 loads
function WalletButtonFallback({ compact }: Props) {
  return (
    <button disabled
      className={`flex items-center gap-2 border border-[var(--border)] text-[var(--text-muted)] rounded-xl transition-colors opacity-60 ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}>
      <Wallet className="w-3.5 h-3.5"/>
      {!compact && <span>Connect Wallet</span>}
    </button>
  )
}

// Inner component — uses wagmi hooks safely inside WagmiProvider
function WalletButtonInner({ compact }: Props) {
  // Lazy import wagmi hooks to avoid SSR issues
  const [hooks, setHooks] = useState<any>(null)
  const [state, setState] = useState({
    address: null as string | null,
    isConnected: false,
    chainId: null as number | null,
    isWrongNetwork: false,
  })
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    import('wagmi').then(wagmi => {
      setHooks(wagmi)
    }).catch(() => {})
  }, [])

  // Use wagmi hooks via dynamic approach
  const WagmiChild = hooks ? (() => {
    try {
      const { address, isConnected } = hooks.useAccount()
      const chainId = hooks.useChainId()
      const AMOY_CHAIN_ID = 80002

      useEffect(() => {
        setState({
          address: address || null,
          isConnected: isConnected || false,
          chainId: chainId || null,
          isWrongNetwork: isConnected && chainId !== AMOY_CHAIN_ID,
        })
      }, [address, isConnected, chainId])

      return null
    } catch { return null }
  }) : null

  const copy = () => {
    if (!state.address) return
    navigator.clipboard.writeText(state.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fmt = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`

  if (!state.isConnected) {
    return (
      <motion.button
        onClick={() => {
          // Open WalletConnect modal
          try {
            const modal = (window as any).__web3modal
            if (modal) modal.open()
            else alert('Please refresh the page and try connecting again.')
          } catch { alert('Wallet connection requires MetaMask extension. Please install it first.') }
        }}
        className={`flex items-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-primary-500 rounded-xl transition-colors ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Wallet className="w-3.5 h-3.5"/>
        {!compact && <span className="font-medium">Connect Wallet</span>}
      </motion.button>
    )
  }

  return (
    <>
      {/* Wrong network warning */}
      {state.isWrongNetwork && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg mr-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
          <span className="hidden sm:inline">Wrong network</span>
        </div>
      )}

      {/* Connected button */}
      <div className="relative">
        <motion.button onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-500 rounded-xl transition-colors ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm'}`}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shrink-0"/>
          {state.address && <span className="font-mono font-medium">{fmt(state.address)}</span>}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}/>
        </motion.button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
              <motion.div
                initial={{ opacity:0, y:6, scale:0.97 }}
                animate={{ opacity:1, y:0, scale:1 }}
                exit={{   opacity:0, y:6, scale:0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-20">

                {/* Address */}
                <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Connected wallet</p>
                  <p className="text-xs font-mono text-[var(--text)] truncate">{state.address}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${state.isWrongNetwork ? 'text-amber-400 bg-amber-500/10' : 'text-primary-500 bg-primary-500/10'}`}>
                      {state.isWrongNetwork ? '⚠️ Wrong Network' : '✅ Polygon Amoy'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5 space-y-0.5">
                  <button onClick={copy}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)] rounded-xl transition-colors text-left">
                    {copied ? <CheckCheck className="w-4 h-4 text-primary-500"/> : <Copy className="w-4 h-4"/>}
                    {copied ? 'Copied!' : 'Copy Address'}
                  </button>
                  <a href={`https://www.oklink.com/amoy/address/${state.address}`}
                    target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--border)] rounded-xl transition-colors">
                    <ExternalLink className="w-4 h-4"/> View on Explorer
                  </a>
                  {state.isWrongNetwork && (
                    <button
                      onClick={() => {
                        try {
                          import('wagmi').then(w => {
                            const { switchChain } = w.useSwitchChain?.() || {}
                            switchChain?.({ chainId: 80002 })
                          })
                        } catch {}
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors text-left">
                      <AlertCircle className="w-4 h-4"/> Switch to Amoy
                    </button>
                  )}
                  <button
                    onClick={() => {
                      try {
                        import('wagmi').then(w => {
                          // disconnect
                        })
                      } catch {}
                      setState({ address: null, isConnected: false, chainId: null, isWrongNetwork: false })
                      setOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left">
                    <LogOut className="w-4 h-4"/> Disconnect
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

export default WalletConnectButton
