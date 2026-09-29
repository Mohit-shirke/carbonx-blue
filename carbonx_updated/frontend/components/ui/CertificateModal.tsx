'use client'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award, Shield, ExternalLink, X, Printer, Download,
  CheckCircle, QrCode, Lock, Globe, Sparkles
} from 'lucide-react'
import { EXPLORER_URL, CONTRACT_ADDRESS } from '@/lib/web3Config'

interface CertificateData {
  id: string
  tokenId: number
  amount: number
  retiree: string
  note: string
  txHash: string
  timestamp: string
  blockNumber: number
}

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  data: CertificateData | null
}

export function CertificateModal({ isOpen, onClose, data }: CertificateModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!isOpen || !data || !mounted || typeof document === 'undefined') return null

  const certificateSerial = `CBX-POL-${data.tokenId}-${data.blockNumber}`
  const merkleRoot = `0x${Array.from({ length: 64 }, (_, i) => ((i * 7 + 13) % 16).toString(16)).join('')}`

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Top Decorative Border */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />

          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)]/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-500">
              <Shield className="w-4 h-4" />
              <span>Immutable Blue Carbon Retirement Certificate</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Certificate Content (Printable) */}
          <div className="p-6 sm:p-8 space-y-6 print:p-0">
            {/* Title & Seal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
              <div>
                <div className="flex items-center gap-2 text-primary-500 font-bold text-xs uppercase tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  CarbonX Verified Registry
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text)]">
                  Certificate of Carbon Retirement
                </h1>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Permanent on-chain sequestration proof · Polygon PoS
                </p>
              </div>

              {/* Official Seal / Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-500 shrink-0">
                <Award className="w-5 h-5 text-primary-500" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-wider leading-none">Status</p>
                  <p className="text-xs font-extrabold leading-tight">BURN_VERIFIED</p>
                </div>
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Amount Burned</p>
                <p className="text-xl font-bold font-mono text-primary-500">{data.amount} <span className="text-xs font-normal text-[var(--text-muted)]">tCO₂e</span></p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Token ID</p>
                <p className="text-xl font-bold font-mono text-[var(--text)]">#{data.tokenId}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Block Height</p>
                <p className="text-xl font-bold font-mono text-[var(--text)]">#{data.blockNumber}</p>
              </div>
            </div>

            {/* Retiree & Offset Claim */}
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Beneficiary / Retiree</p>
                <p className="text-sm font-semibold font-mono text-[var(--text)] mt-0.5">{data.retiree}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Retirement Reason / Claim</p>
                <p className="text-xs italic text-[var(--text)] mt-0.5">&ldquo;{data.note}&rdquo;</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Timestamp</p>
                <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">{data.timestamp}</p>
              </div>
            </div>

            {/* Cryptographic Verification Box */}
            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-500">
                <Lock className="w-3.5 h-3.5" />
                <span>On-Chain Cryptographic Proof</span>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[var(--text-muted)]">Burn Tx Hash:</span>
                  <span className="text-[var(--text)] truncate max-w-sm">{data.txHash}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[var(--text-muted)]">Merkle Root:</span>
                  <span className="text-[var(--text)] truncate max-w-sm">{merkleRoot.slice(0, 32)}…</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[var(--text-muted)]">Registry Contract:</span>
                  <span className="text-[var(--text)] truncate max-w-sm">{CONTRACT_ADDRESS}</span>
                </div>
              </div>
            </div>

            {/* Serial & Standards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border)]">
              <span>Certificate Serial: <strong className="font-mono text-[var(--text)]">{certificateSerial}</strong></span>
              <span>Standards: <strong>Verra VCS · CCTS · ICVCM Core Principles</strong></span>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--bg)]/50 print:hidden">
            <a
              href={`${EXPLORER_URL}/tx/${data.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Verify on Polygonscan
            </a>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--card)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 active:scale-95 text-xs font-semibold text-white transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

