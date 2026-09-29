'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scale, FileText, Cpu, Coins, ShieldAlert,
  Gavel, CheckCircle2, Mail, ExternalLink, FileCheck,
  Flame, Lock, Layers, AlertTriangle, Sparkles
} from 'lucide-react'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const SECTIONS = [
  {
    id: 'acceptance',
    icon: FileText,
    title: '1. Acceptance of Terms & Protocol Agreement',
    summary: 'Binding agreement governing registry usage, API integrations, and smart contracts.',
    content: 'By accessing, connecting a Web3 wallet, or utilizing any feature of the CarbonX Registry ("Platform"), you enter into a legally binding agreement with CarbonX Technologies Ltd. If you do not accept these terms in their entirety, you must immediately terminate platform access and disconnect your wallet. CarbonX reserves the right to modify these terms with on-chain changelog notifications posted on the registry repository.',
  },
  {
    id: 'service',
    icon: Layers,
    title: '2. Description of Registry Service & MRV Infrastructure',
    summary: 'Decentralized blue carbon issuance, satellite observation, and trading gateway.',
    content: 'CarbonX provides decentralized infrastructure for: (a) Project listing and geographic polygon registration for coastal blue carbon reserves (mangroves, seagrass meadows, salt marshes). (b) AI-driven satellite MRV analysis leveraging European Space Agency Sentinel-2 Level-2A multi-spectral data. (c) Tokenized carbon credit issuance, minting, and retirement via ERC-1155 semi-fungible smart contracts on Polygon Mainnet (Chain ID: 137).',
  },
  {
    id: 'accounts-wallets',
    icon: Lock,
    title: '3. Web3 Wallets, Credentials & Private Key Custody',
    summary: 'Non-custodial architecture. Sole user responsibility for cryptographic key security.',
    content: 'CarbonX is a non-custodial decentralized platform. You maintain sole custody, control, and responsibility over your Web3 private keys, seed phrases, and hardware wallets. CarbonX has no technical capability to recover lost private keys, reverse unauthorized cryptographic signatures, or access your wallet funds. You represent that you are at least 18 years of age and possess full legal capacity to execute smart contract transactions.',
  },
  {
    id: 'token-mechanics',
    icon: Flame,
    title: '4. Carbon Credits, ERC-1155 Tokens & Irrevocable Retirement',
    summary: 'On-chain burning mechanics are cryptographically permanent and irreversible.',
    content: 'Carbon credits minted on CarbonX exist as ERC-1155 smart contract tokens on Polygon PoS. All token purchases, transfers, and retirements (burns) are final and irreversible upon block inclusion. When a credit is retired via the CarbonX Burn Vault, the token is permanently destroyed with an on-chain Certificate of Retirement generated. Retired credits cannot be resold, transferred, or double-counted. CarbonX does not warrant that credits satisfy statutory emissions obligations in every global jurisdiction.',
    isIrrevocable: true,
  },
  {
    id: 'fees-payments',
    icon: Coins,
    title: '5. Platform Fees, Gas Costs & Settlement Mechanics',
    summary: 'Transparent 2.9% fiat gateway fee vs 0% Web3 protocol fees with network gas.',
    content: 'Transactions conducted via fiat credit cards incur a 2.9% third-party gateway fee processed via Stripe. Web3 transactions in MATIC or USDC incur zero CarbonX markup and only require network gas fees (<$0.001 per tx on Polygon). Project listing fees and third-party ACVA validation audit fees are billed separately. All payment obligations are non-refundable once on-chain state updates occur.',
  },
  {
    id: 'prohibited-activities',
    icon: ShieldAlert,
    title: '6. Prohibited Activities & Anti-Fraud Enforcement',
    summary: 'Strict bans on double-counting, false MRV submissions, and sybil manipulation.',
    content: 'Users strictly agree not to: (a) Submit fraudulent drone telemetry, manipulated GPS polygons, or synthetic vegetation indices. (b) Attempt double-issuance or double-selling of carbon claims registered with other registries (Verra, Gold Standard, CCTS). (c) Engage in wash trading, price manipulation, or front-running liquidity pools. (d) Deploy malicious smart contracts, exploit reentrancy vulnerabilities, or launch denial-of-service attacks against CarbonX RPC endpoints.',
  },
  {
    id: 'warranty-disclaimer',
    icon: AlertTriangle,
    title: '7. Disclaimer of Warranties & Earth Observation Disclaimers',
    summary: 'As-is protocol deployment. Satellite NDVI values are scientific algorithmic estimates.',
    content: 'The Platform, smart contracts, and satellite MRV pipelines are provided "as-is" and "as-available" without warranties of merchantability, fitness for a particular regulatory regime, or bug-free continuity. Satellite-derived NDVI values and carbon stock estimates are generated via scientific models (IPCC Tier 2) and do not constitute personal financial, tax, or legal advice.',
  },
  {
    id: 'limitation-liability',
    icon: Scale,
    title: '8. Limitation of Liability & Protocol Caps',
    summary: 'Liability capped at fees paid in preceding 12-month period.',
    content: "To the maximum extent permitted by applicable law, CarbonX Technologies Ltd, its directors, researchers, and validators shall not be liable for indirect, incidental, consequential, or punitive damages, including loss of profits, cryptographic assets, or regulatory compliance status. CarbonX's aggregate liability under any cause of action shall not exceed the actual fees paid by you to CarbonX during the preceding 12 months.",
  },
  {
    id: 'governing-law',
    icon: Gavel,
    title: '9. Governing Law & Mandatory Binding Arbitration',
    summary: 'Jurisdiction in Bengaluru, Karnataka, India under Arbitration and Conciliation Act 1996.',
    content: 'These Terms and any dispute arising out of or in connection with the Platform shall be governed by the laws of India. Any controversy, claim, or dispute shall be resolved through final and binding arbitration in Bengaluru, Karnataka, India, in accordance with the Arbitration and Conciliation Act, 1996, conducted in the English language before a sole arbitrator.',
  },
  {
    id: 'legal-contact',
    icon: Mail,
    title: '10. Legal Inquiries & Official Notices',
    summary: 'Statutory service address and regulatory inquiry protocol.',
    content: 'Formal legal notices, regulatory correspondence, and compliance communications must be submitted to: legal@carbonx.app or served by registered post to: CarbonX Legal Operations Department, Tech Innovation Corridor, Bengaluru, Karnataka 560001, India.',
  },
]

export default function TermsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'tokens' | 'legal'>('all')

  const filteredSections = SECTIONS.filter((s) => {
    if (activeFilter === 'tokens') return s.id === 'token-mechanics' || s.id === 'fees-payments' || s.id === 'prohibited-activities'
    if (activeFilter === 'legal') return s.id === 'governing-law' || s.id === 'limitation-liability' || s.id === 'acceptance'
    return true
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden pb-16">
      {/* 21st.dev Ambient Matrix Background */}
      <BackgroundGrid pattern="grid" opacity={0.12} />

      {/* Ambient Neon Floating Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[130px] pointer-events-none opacity-60 dark:opacity-100" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-60 dark:opacity-100" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 relative z-10 space-y-8">
        {/* Header with BorderBeam */}
        <div className="relative rounded-3xl bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] p-6 sm:p-10 shadow-xl overflow-hidden">
          <BorderBeam colorFrom="#8247E5" colorTo="#10B981" duration={11} size={220} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold">
              <Scale className="w-3.5 h-3.5" />
              <span>SMART CONTRACT OPERATING TERMS</span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">
              POLYGON POS (137) · ARBITRATION ACT 1996
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
            Terms of Service & Token Protocol Agreement
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-3xl leading-relaxed">
            Effective: June 2025 · Regulating smart contract invocations, ERC-1155 token mechanics, satellite MRV data, and statutory dispute arbitration.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[var(--border)] mt-6 text-xs text-[var(--text-muted)] font-mono">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'all'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              All Articles ({SECTIONS.length})
            </button>
            <button
              onClick={() => setActiveFilter('tokens')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'tokens'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Tokens & Burning
            </button>
            <button
              onClick={() => setActiveFilter('legal')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'legal'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Liability & Arbitration
            </button>
          </div>
        </div>

        {/* Section Cards with SpotlightCard */}
        <div className="space-y-4">
          {filteredSections.map((s, idx) => {
            const Icon = s.icon
            return (
              <SpotlightCard
                key={s.id}
                className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-md ${
                  s.isIrrevocable
                    ? 'border-emerald-500/40 bg-[var(--card)]'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-purple-500/30'
                }`}
                spotlightColor={s.isIrrevocable ? 'rgba(16, 185, 129, 0.16)' : 'rgba(130, 71, 229, 0.12)'}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      s.isIrrevocable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
                        {s.title}
                      </h2>
                      {s.isIrrevocable && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded w-fit flex items-center gap-1 font-semibold">
                          <Flame className="w-3 h-3" />
                          Permanent On-Chain Burn Mechanism
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-medium">
                      {s.summary}
                    </p>

                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed pt-1">
                      {s.content}
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            )
          })}
        </div>

        {/* Legal Counsel & Notice Gateway Card with BorderBeam */}
        <div className="relative rounded-2xl bg-[var(--card)] border border-purple-500/30 p-6 sm:p-8 overflow-hidden shadow-xl">
          <BorderBeam colorFrom="#8247E5" colorTo="#06B6D4" duration={9} size={180} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                Legal Inquiries & Notice Service
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Formal legal notices and court correspondence must be directed to our registered legal counsel.
              </p>
            </div>

            <a
              href="mailto:legal@carbonx.app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition-all"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Contact Legal Team</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
