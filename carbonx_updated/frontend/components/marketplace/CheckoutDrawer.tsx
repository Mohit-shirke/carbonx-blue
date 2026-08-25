'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet, CreditCard, Zap, AlertCircle, CheckCircle, Fuel } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/app/marketplace/page'

interface Props {
  open: boolean
  project: Project | null
  onClose: () => void
}

type Channel = 'web3' | 'fiat'

export function CheckoutDrawer({ open, project, onClose }: Props) {
  const [channel, setChannel] = useState<Channel>('web3')
  const [quantity, setQuantity] = useState(10)
  const [gasEstimate, setGasEstimate] = useState('0.0021')
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Read wallet from wagmi store without hooks (avoids provider issues)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wagmi.store')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const addr = parsed?.state?.connections?.value?.[0]?.[1]?.accounts?.[0]
          if (addr) setWalletAddress(addr)
        } catch { /* ignore */ }
      }
    }
  }, [open])

  // Simulate dynamic gas estimate
  useEffect(() => {
    if (!open) return
    const timer = setInterval(() => {
      setGasEstimate((Math.random() * 0.003 + 0.001).toFixed(4))
    }, 4000)
    return () => clearInterval(timer)
  }, [open])

  if (!project) return null

  const totalUSD = (project.pricePerTon * quantity).toFixed(2)
  const totalMATIC = (quantity * 0.06).toFixed(4)

  const handleWeb3Purchase = async () => {
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
    setSuccess(true)
  }

  const handleFiatPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/payments/create-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            project_id: project.id,
            token_amount: quantity,
            buyer_wallet: walletAddress ?? '',
            amount_usd: Math.round(parseFloat(totalUSD) * 100),
          }),
        }
      )
      if (!res.ok) throw new Error('Payment intent failed')
      await new Promise(r => setTimeout(r, 1500))
      setSuccess(true)
    } catch {
      alert('Payment failed. Make sure the backend is running on port 4000.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-[var(--card)] border-l border-[var(--border)] z-50 flex flex-col overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="font-semibold text-[var(--text)]">Checkout</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{project.name}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)]">Purchase Successful!</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {quantity} tCO₂e of ERC-1155 #{project.tokenId} have been queued for transfer to your wallet.
                </p>
                <Button onClick={() => { setSuccess(false); onClose() }} variant="primary" className="w-full mt-4">
                  Close
                </Button>
              </motion.div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Quantity */}
                <div className="p-5 border-b border-[var(--border)]">
                  <label className="text-sm font-medium text-[var(--text)] block mb-2">Carbon Credits (tCO₂e)</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 10))} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-colors font-bold">−</button>
                    <input
                      type="number"
                      value={quantity}
                      min={1}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center bg-[var(--bg)] border border-[var(--border)] rounded-lg py-2 text-sm font-semibold text-[var(--text)] focus:outline-none focus:border-primary-500"
                    />
                    <button onClick={() => setQuantity(q => Math.min(project.availableCredits, q + 10))} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-colors font-bold">+</button>
                  </div>
                </div>

                {/* Channel toggle */}
                <div className="p-5 border-b border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)] mb-3">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([['web3', 'Web3 / MATIC', Wallet], ['fiat', 'Card / USD', CreditCard]] as const).map(([id, label, Icon]) => (
                      <button
                        key={id}
                        onClick={() => setChannel(id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${channel === id ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/40'}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Web3 */}
                {channel === 'web3' && (
                  <div className="p-5 space-y-4">
                    {!walletAddress && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        Connect your MetaMask wallet first using the Navbar button.
                      </div>
                    )}
                    <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">{quantity} tCO₂e × {project.pricePerTon} USD</span>
                        <span className="font-medium text-[var(--text)]">{totalMATIC} MATIC</span>
                      </div>
                      <div className="flex justify-between text-sm items-center">
                        <span className="text-[var(--text-muted)] flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />Gas Fee (est.)</span>
                        <span className="font-medium text-[var(--text)] font-mono">{gasEstimate} MATIC <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse inline-block" /></span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-2 flex justify-between font-semibold">
                        <span className="text-[var(--text)]">Total</span>
                        <span className="text-primary-500">{(parseFloat(totalMATIC) + parseFloat(gasEstimate)).toFixed(4)} MATIC</span>
                      </div>
                    </div>
                    <Button onClick={handleWeb3Purchase} variant="primary" size="lg" className="w-full" loading={processing} icon={<Zap className="w-4 h-4" />}>
                      {processing ? 'Broadcasting…' : 'Confirm On-Chain Purchase'}
                    </Button>
                  </div>
                )}

                {/* Fiat */}
                {channel === 'fiat' && (
                  <form onSubmit={handleFiatPurchase} className="p-5 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Cardholder Name</label>
                      <input type="text" placeholder="Jane Smith" required className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[var(--text)] block mb-1.5">Card Details (Test Mode)</label>
                      <div className="bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-3 flex items-center justify-between">
                        <span className="font-mono text-sm text-[var(--text)]">4242 4242 4242 4242</span>
                        <div className="flex gap-2 text-xs text-[var(--text-muted)]">
                          <span>12/26</span><span>123</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">Stripe sandbox mode · pk_test key active</p>
                    </div>
                    <div className="bg-[var(--bg)] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">{quantity} Carbon Credits</span>
                        <span className="text-[var(--text)]">${totalUSD}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Processing Fee (2.9%)</span>
                        <span className="text-[var(--text)]">${(parseFloat(totalUSD) * 0.029).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-2 flex justify-between font-semibold">
                        <span className="text-[var(--text)]">Total USD</span>
                        <span className="text-primary-500">${(parseFloat(totalUSD) * 1.029).toFixed(2)}</span>
                      </div>
                    </div>
                    <Button type="submit" variant="primary" size="lg" className="w-full" loading={processing} icon={<CreditCard className="w-4 h-4" />}>
                      {processing ? 'Processing…' : `Pay $${(parseFloat(totalUSD) * 1.029).toFixed(2)}`}
                    </Button>
                    <p className="text-center text-xs text-[var(--text-muted)]">🔒 Stripe Test Sandbox · No real charges</p>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
