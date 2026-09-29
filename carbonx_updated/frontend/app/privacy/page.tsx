'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Lock, FileText, Database, Key, Server,
  AlertTriangle, CheckCircle2, Mail, ExternalLink,
  Cpu, Satellite, Scale, Sparkles
} from 'lucide-react'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const SECTIONS = [
  {
    id: 'info-collected',
    icon: Database,
    title: '1. Information We Ingest & Process',
    summary: 'Minimalist data collection aligned with privacy-by-design principles.',
    content: 'We collect and process the following categories of information: (a) Registry Account Credentials: Name, corporate business email address, organization tax ID/CIN, and optional cryptographic wallet address. (b) On-Chain Transaction Telemetry: Smart contract interactions, credit minting transactions, retirement burns, and transaction hashes recorded on Polygon PoS. (c) Earth Observation Telemetry: Georeferenced bounding boxes, drone orthomosaics, and Sentinel-2 optical spectral band scores submitted for project MRV. (d) Diagnostic & System Telemetry: Cryptographic session cookies, IP addresses for API rate-limiting, and browser metadata.',
  },
  {
    id: 'purpose',
    icon: Server,
    title: '2. Purpose of Processing & Legal Basis',
    summary: 'Strictly bounded to protocol operation, verification, and statutory reporting.',
    content: 'Your data is processed exclusively to: (a) Maintain the integrity of the CarbonX Blue Carbon Registry. (b) Execute atomic tokenized carbon credit minting and retirement under ERC-1155 smart contracts. (c) Feed satellite MRV telemetry into automated vegetative index pipelines (NDVI/EVI). (d) Facilitate statutory compliance reports under SEBI BRSR Core and BEE Carbon Credit Trading Scheme (CCTS). (e) Secure API endpoints against sybil attacks and unauthorized access.',
  },
  {
    id: 'blockchain-transparency',
    icon: Cpu,
    title: '3. Blockchain Transparency & Ledger Permanence',
    summary: 'Public ledger mechanics and cryptographic immutability notice.',
    content: 'All carbon credit token minting events, serial tracking, and permanent retirement (burn) executions are irrevocably recorded on the Polygon Proof-of-Stake Mainnet (Chain ID: 137). In accordance with the consensus rules of distributed ledger systems: public wallet addresses, token IDs, transaction values, and timestamps become part of the public cryptographic ledger. Users understand that once a transaction is committed to the blockchain, CarbonX has no technical capacity to alter, erase, or reverse such on-chain records.',
    isCrucial: true,
  },
  {
    id: 'third-parties',
    icon: Lock,
    title: '4. Third-Party Infrastructure & Zero-Sale Guarantee',
    summary: 'Zero monetization of personal telemetry. Hardened service infrastructure.',
    content: 'CarbonX never sells, leases, or monetizes user personal data to third parties. We share encrypted data strictly with essential infrastructure partners: (a) Alchemy & Infura for decentralized Polygon RPC communication. (b) Stripe Inc. for PCI-DSS Level 1 payment processing. (c) European Space Agency (ESA) Copernicus Hub for open-access optical satellite tiles. (d) Accredited Carbon Verification Agencies (ACVA) under strict non-disclosure terms during third-party project audits.',
  },
  {
    id: 'security',
    icon: Shield,
    title: '5. Technical & Organizational Security Measures',
    summary: 'AES-256 encryption, HTTP-only JWTs, and multi-signature authorization.',
    content: 'We employ multi-layered cryptographic and administrative safeguards: (a) In-transit encryption using TLS 1.3 with Perfect Forward Secrecy. (b) Salted bcrypt password hashing with high work factors. (c) HTTP-only, SameSite=Strict secure session tokens to eliminate XSS session hijacking. (d) Gnosis Safe multi-signature quorum for institutional treasury operations. (e) Automated vulnerability scans and rate-limiting across all REST and GraphQL endpoints.',
  },
  {
    id: 'dpdp-rights',
    icon: Scale,
    title: '6. Statutory Rights under India DPDP Act 2023 & GDPR',
    summary: 'Data principal autonomy, correction, access, and erasure rights.',
    content: "Under India's Digital Personal Data Protection Act 2023 (DPDP Act) and international data protection standards, data principals possess enforceable rights: (a) Right to Access: Request an auditable summary of all personal data held off-chain. (b) Right to Correction & Erasure: Rectify inaccuracies or delete off-chain database records. (c) Right of Grievance Redressal: Direct recourse to our Data Protection Officer with guaranteed 72-hour SLA. (d) Right to Nominate: Designate a legal representative in the event of incapacity.",
  },
  {
    id: 'cookies',
    icon: Key,
    title: '7. Cookies & Local Cryptographic Storage',
    summary: 'Zero third-party tracking pixels. Essential authentication cookies only.',
    content: 'CarbonX utilizes only strictly necessary cookies: (a) `carbonx_token`: HttpOnly session identifier for verified authentication. (b) `user_session`: LocalStorage cache for role-based dashboard preferences. We do NOT deploy third-party advertising tracking cookies, canvas fingerprinting, or external cross-site ad beacons.',
  },
  {
    id: 'retention',
    icon: FileText,
    title: '8. Data Retention & Archival Policies',
    summary: 'Off-chain data purged according to statutory limitation statutes.',
    content: 'Off-chain operational records are maintained for the active lifecycle of your registered account plus 7 years to satisfy the Companies Act 2013 and SEBI compliance guidelines. After expiration of statutory retention windows, off-chain data is cryptographically shredded. Public Polygon ledger entries remain permanent by inherent cryptographic consensus.',
  },
  {
    id: 'dpo-contact',
    icon: Mail,
    title: '9. Data Protection Officer & Redressal Mechanism',
    summary: 'Dedicated legal grievance mechanism with statutory response timelines.',
    content: 'For statutory rights requests, data disclosures, or security audit notifications, address correspondence to our appointed Data Protection Officer: Email: privacy@carbonx.app · Postal Address: CarbonX Privacy & Legal Compliance Bureau, 4th Floor, Tech Innovation Corridor, Bengaluru, Karnataka 560001, India.',
  },
]

export default function PrivacyPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'blockchain' | 'rights'>('all')

  const filteredSections = SECTIONS.filter((s) => {
    if (activeFilter === 'blockchain') return s.id === 'blockchain-transparency' || s.id === 'security'
    if (activeFilter === 'rights') return s.id === 'dpdp-rights' || s.id === 'dpo-contact'
    return true
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden pb-16">
      {/* 21st.dev Ambient Matrix Background */}
      <BackgroundGrid pattern="grid" opacity={0.12} />

      {/* Ambient Neon Floating Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none opacity-60 dark:opacity-100" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none opacity-60 dark:opacity-100" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 relative z-10 space-y-8">
        {/* Header with BorderBeam */}
        <div className="relative rounded-3xl bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] p-6 sm:p-10 shadow-xl overflow-hidden">
          <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={10} size={220} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>STATUTORY DATA PRIVACY COMPLIANCE</span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1 rounded-full border border-[var(--border)]">
              DPDP ACT 2023 · ISO 27001 ALIGNED
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
            Privacy Policy & Cryptographic Ledger Disclosure
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-3xl leading-relaxed">
            Effective: June 2025 · Governing the processing of off-chain registry credentials and on-chain ERC-1155 smart contract data on Polygon Mainnet.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-[var(--border)] mt-6 text-xs text-[var(--text-muted)] font-mono">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'all'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              All Clauses ({SECTIONS.length})
            </button>
            <button
              onClick={() => setActiveFilter('blockchain')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'blockchain'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              Blockchain & Security
            </button>
            <button
              onClick={() => setActiveFilter('rights')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                activeFilter === 'rights'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              DPDP Rights & DPO
            </button>
          </div>
        </div>

        {/* Policy Section Cards with SpotlightCard */}
        <div className="space-y-4">
          {filteredSections.map((s, idx) => {
            const Icon = s.icon
            return (
              <SpotlightCard
                key={s.id}
                className={`p-6 sm:p-8 rounded-2xl border transition-all shadow-md ${
                  s.isCrucial
                    ? 'border-cyan-500/40 bg-[var(--card)]'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-emerald-500/30'
                }`}
                spotlightColor={s.isCrucial ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.12)'}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      s.isCrucial
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h2 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight">
                        {s.title}
                      </h2>
                      {s.isCrucial && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded w-fit">
                          Crucial Blockchain Notice
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
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

        {/* Data Protection Officer Verified Console Card */}
        <div className="relative rounded-2xl bg-[var(--card)] border border-emerald-500/30 p-6 sm:p-8 overflow-hidden shadow-xl">
          <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={8} size={180} />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Statutory Redressal Desk & DPO Officer
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Official inquiries are acknowledged within 24 hours with resolution reports issued in $\le 72$ hours.
              </p>
            </div>

            <a
              href="mailto:privacy@carbonx.app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact DPO Directly</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
