'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Wallet, Shield, Leaf, Building2, GraduationCap,
  Copy, CheckCheck, ExternalLink, LogOut, Award, Download,
  CheckCircle2, RefreshCw, ChevronRight, Settings, FileText, ArrowUpRight,
  TrendingUp, Activity, Sparkles, AlertCircle, DollarSign, Globe,
  Search, Check, Zap, MapPin, Phone, MessageSquare, AlertTriangle, Send
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { WalletConnectButton } from '@/components/web3/WalletConnectButton'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { AuthGate } from '@/components/auth/AuthGate'
import { useAuth } from '@/hooks/useAuth'

type RoleKey = 'ngo' | 'government' | 'academic' | 'corporate' | 'individual' | 'public'

const DEFAULT_PURCHASES = [
  { id: 't1', project: 'Sundarbans Mangrove Reserve', amount: 250, cost: '$7,125.00', date: '2026-08-20', txHash: '0x9a8f23b7e412567a98b0f7192841029c48194a0d', status: 'active', tokenId: 1001, serials: ['CBX-MNG-2026-100201 to 100450'] },
  { id: 't2', project: 'Bhitarkanika Coastal Forest', amount: 100, cost: '$2,480.00', date: '2026-08-14', txHash: '0x123f45a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2', status: 'retired', tokenId: 1002, serials: ['CBX-MNG-2026-200101 to 200200'] },
  { id: 't3', project: 'Pichavaram Mangrove Block',   amount: 50,  cost: '$1,100.00', date: '2026-07-29', txHash: '0x889a7b1c3d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a', status: 'active', tokenId: 1003, serials: ['CBX-MNG-2026-300051 to 300100'] },
]

export default function ProfilePage() {
  const router = useRouter()
  const { address: connectedWallet } = useAccount()
  const { user: authUser, logout: authLogout, switchRole: authSwitchRole, login: authLogin } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState<RoleKey>('ngo')
  const [activeTab, setActiveTab] = useState<'profile' | 'holdings' | 'retirements' | 'security'>('profile')
  const [purchases, setPurchases] = useState(DEFAULT_PURCHASES)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')

  // Community Concern Form state
  const [concernName, setConcernName] = useState('')
  const [concernLocation, setConcernLocation] = useState('')
  const [concernRole, setConcernRole] = useState('Local Coastal Fisherfolk')
  const [concernProject, setConcernProject] = useState('Sundarbans Mangrove Reserve')
  const [concernText, setConcernText] = useState('')
  const [concernSubmitted, setConcernSubmitted] = useState(false)

  useEffect(() => {
    if (authUser) {
      setUser(authUser)
      setNameInput(authUser.name || '')
      if (authUser.role) {
        const r = authUser.role.toLowerCase() as RoleKey
        if (['ngo', 'government', 'academic', 'corporate', 'individual', 'public'].includes(r)) {
          setSelectedRole(r)
        }
      }
    } else {
      setUser(null)
    }

    try {
      const storedPurchases = localStorage.getItem('user_purchases')
      if (storedPurchases) {
        const parsedPurchases = JSON.parse(storedPurchases)
        if (Array.isArray(parsedPurchases) && parsedPurchases.length > 0) {
          const merged = [...parsedPurchases, ...DEFAULT_PURCHASES.filter(d => !parsedPurchases.some((p: any) => p.id === d.id))]
          setPurchases(merged)
        }
      }
    } catch { /* ignore */ }
  }, [authUser])

  const copy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveName = () => {
    if (!nameInput.trim() || !user) return
    const updated = { ...user, name: nameInput.trim(), role: selectedRole }
    setUser(updated)
    authLogin(updated)
    setIsEditing(false)
  }

  const handleSelectRole = (roleKey: RoleKey) => {
    setSelectedRole(roleKey)
    if (user) {
      const updated = { ...user, role: roleKey }
      setUser(updated)
      authLogin(updated)
    } else {
      authSwitchRole(roleKey)
    }
  }

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!concernText.trim()) return
    setConcernSubmitted(true)
    try {
      await fetch('http://localhost:4000/api/v1/grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: '55f9768b-6f87-4344-8903-127b36ebced5',
          type: 'community_observation',
          description: `[${concernRole} - ${concernLocation}] ${concernText}`,
          contact_email: concernName ? `${concernName}@community.local` : 'anonymous@community.local',
          anonymous: !concernName,
        })
      })
    } catch { /* offline fallback */ }
    setTimeout(() => {
      setConcernText('')
      setConcernSubmitted(false)
    }, 4000)
  }

  const logout = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '')
      await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {}
    authLogout()
    router.push('/auth')
  }

  const activeWallet = connectedWallet || user?.wallet || ''
  const displayWallet = activeWallet
    ? `${activeWallet.slice(0, 6)}…${activeWallet.slice(-4)}`
    : 'No wallet linked'

  const activePurchases = purchases.filter(p => p.status === 'active')
  const retiredPurchases = purchases.filter(p => p.status === 'retired')
  const totalOwnedTons = activePurchases.reduce((acc, p) => acc + (p.amount || 0), 0)
  const totalRetiredTons = retiredPurchases.reduce((acc, p) => acc + (p.amount || 0), 0)

  return (
    <AuthGate
      pageTitle="Institutional Profile & KYC"
      description="Access to institutional credentials, ESG holdings, verification keys, and regulatory reporting history requires an authenticated CarbonX organization or individual account."
    >
      {user ? (
        <div className="relative min-h-screen pb-16 overflow-hidden">
          {/* 21st.dev Ambient Matrix Grid Background */}
          <BackgroundGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">

        {/* Profile Header Card with 21st.dev BorderBeam */}
        <div className="card p-6 sm:p-8 relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-2xl">
          <BorderBeam size={320} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary-400/20 to-primary-600/30 border border-primary-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/10">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-2.5 py-1 text-base font-bold bg-[var(--bg)] border border-primary-500 rounded-lg text-[var(--text)] outline-none"
                    />
                    <button onClick={handleSaveName} className="text-xs px-2.5 py-1 bg-primary-500 text-white rounded-lg font-medium">
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">{user.name}</h1>
                    <button onClick={() => setIsEditing(true)} className="text-[11px] text-primary-400 hover:underline">
                      Edit
                    </button>
                  </>
                )}
                
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-primary-500/10 border-primary-500/20 text-primary-400">
                  <Shield className="w-3.5 h-3.5" />
                  {selectedRole === 'ngo' && 'NGO / Project Proposer'}
                  {selectedRole === 'government' && 'Government Validator'}
                  {selectedRole === 'academic' && 'Academic Auditor'}
                  {selectedRole === 'corporate' && 'Corporate Buyer'}
                  {selectedRole === 'individual' && 'Retail Buyer'}
                  {selectedRole === 'public' && 'Public / Community'}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                {user.email}
              </p>
              
              <div className="flex items-center gap-2 pt-1 text-xs font-mono text-[var(--text-muted)]">
                <Wallet className="w-3.5 h-3.5 text-primary-400" />
                <span>{displayWallet}</span>
                {activeWallet && (
                  <button onClick={() => copy(activeWallet)} title="Copy Address" className="hover:text-primary-400 transition-colors p-0.5">
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
                {activeWallet && (
                  <a
                    href={`https://polygonscan.com/address/${activeWallet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-400 transition-colors p-0.5"
                    title="View on Polygonscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <WalletConnectButton compact />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 px-3 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Stakeholder Role Switcher Navigation */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" /> 6 Stakeholder Profiles (Full Platform Specification)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Switch between stakeholder profiles to explore verified credentials, governance safeguards, and technical deliverables.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 hidden sm:inline-block">
            6 Profiles Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {[
            { key: 'ngo', label: '1. NGO Proposer', icon: Leaf, color: 'text-emerald-400', desc: 'Restoration Funding' },
            { key: 'government', label: '2. Govt Validator', icon: Shield, color: 'text-blue-400', desc: 'Legal Compliance' },
            { key: 'academic', label: '3. Academic Auditor', icon: GraduationCap, color: 'text-purple-400', desc: 'Scientific Peer-Review' },
            { key: 'corporate', label: '4. Corporate Buyer', icon: Building2, color: 'text-amber-400', desc: 'Scope 1-3 Offsets' },
            { key: 'individual', label: '5. Retail Buyer', icon: User, color: 'text-green-400', desc: 'Personal Footprint' },
            { key: 'public', label: '6. Public Community', icon: Globe, color: 'text-teal-400', desc: 'Radical Transparency' },
          ].map(r => {
            const Icon = r.icon
            const isSelected = selectedRole === r.key
            return (
              <button
                key={r.key}
                onClick={() => handleSelectRole(r.key as RoleKey)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10 shadow-md ring-1 ring-primary-500/30'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border)]/80 text-[var(--text-muted)]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? r.color : 'text-[var(--text-muted)]'}`} />
                <span className={`text-xs font-bold ${isSelected ? 'text-[var(--text)]' : ''}`}>{r.label}</span>
                <span className="text-[10px] text-[var(--text-muted)] opacity-70">{r.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2 text-sm font-semibold">
        {[
          { id: 'profile', label: 'Stakeholder Profile & Credentials' },
          { id: 'holdings', label: `Credit Holdings (${activePurchases.length})` },
          { id: 'retirements', label: `Retirements (${retiredPurchases.length})` },
          { id: 'security', label: 'Security & Registry Keys' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* ══════════════ 1. NGO / PROJECT PROPOSER PROFILE ══════════════ */}
            {selectedRole === 'ngo' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                      <Leaf className="w-4 h-4" /> Deliverable from Platform: Restoration Funding & Verified Track Record
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      Direct restoration funding ($98,400 earned), a public verified track record for CCTS/BEE compliance, and automated 70% revenue split as credits sell.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/propose" className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors">
                      + Submit New Project Proposal
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Legal Identity */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" /> Legal Identity (Non-Negotiable Gate)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        TIER 2 KYC VERIFIED
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Registered Organization Name</p>
                        <p className="font-semibold text-[var(--text)]">Sundarbans Coastal Restoration Trust</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)]">Registration / Inc. Number</p>
                          <p className="font-mono text-[var(--text)]">NGO-WB-2018-094812</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)]">Date of Establishment</p>
                          <p className="font-semibold text-[var(--text)]">March 14, 2018 (8 Years)</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)]">Jurisdiction of Registration</p>
                          <p className="font-semibold text-[var(--text)]">West Bengal, India</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--text-muted)]">Tax ID / Nonprofit Status</p>
                          <p className="font-mono text-emerald-400">12A & 80G Certified (PAN: AABTS8921K)</p>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text-muted)]">Authorized Signatory</p>
                        <p className="font-semibold text-[var(--text)]">Dr. Arindam Mukherjee — Managing Trustee (Govt ID: ****-****-8842 Verified)</p>
                      </div>
                    </div>
                  </div>

                  {/* Track Record */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-400" /> Conservation Track Record
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        8+ YEARS OPERATING
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Mangrove & Coastal Expertise</p>
                        <p className="font-semibold text-[var(--text)]">Specialized in Rhizophora mucronata & Avicennia marina tidal mudflat restoration</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Past Restoration Portfolio</p>
                        <p className="font-semibold text-[var(--text)]">1,200 ha restored across Sundarbans delta · 450,000 viable saplings planted</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Team Credentials</p>
                        <p className="font-semibold text-emerald-400">2 In-House Marine Biologists & 1 Certified Silviculturist (Zero Subcontracting)</p>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Banking */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Financial & Banking KYC
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        BANK KYC'D FOR PAYOUTS
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Verified Payout Bank Account</p>
                        <p className="font-mono text-[var(--text)]">State Bank of India (IFSC: SBIN0001234, A/C: ****-****-9481)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Financial Audit History</p>
                        <p className="font-semibold text-[var(--text)]">Clean unqualified independent audits (FY21-FY25) by Deloitte India</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Automated Revenue Split Allocation</p>
                        <p className="font-semibold text-emerald-400">70% Direct to NGO Restoration Account · 15% Coastal Community Escrow</p>
                      </div>
                    </div>
                  </div>

                  {/* Mangrove Community Linkage */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-400" /> Local Community Partnership Linkage
                      </span>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        MOU RATIFIED
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Coastal Community Partnership</p>
                        <p className="font-semibold text-[var(--text)]">Formal Bilateral MoU with Gosaba Fisherfolk Cooperative (4,200 member households)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Community Buy-In Proof</p>
                        <p className="font-semibold text-[var(--text)]">Gram Panchayat resolution passed with 94% approval for mangrove green belt protection</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Direct Benefit Sharing</p>
                        <p className="font-semibold text-purple-400">30% of project revenue ring-fenced for women's nursery cooperatives and embankment defense</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 2. GOVERNMENT VALIDATOR PROFILE ══════════════ */}
            {selectedRole === 'government' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-blue-400 text-sm flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Deliverable from Platform: Real-Time Compliance Log & Anti-Fraud Proof
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      An immutable compliance log proving official oversight, and cryptographic prevention of fraudulent land/carbon claims via Patricia Trie anti-double-counting verification.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/verifier" className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors">
                      Open Compliance Review Queue
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institutional Credentials */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" /> Institutional Credentials (Named Ministry)
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        OFFICIAL APPOINTMENT
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Government Department / Ministry</p>
                        <p className="font-semibold text-[var(--text)]">Ministry of Environment, Forest & Climate Change (MoEFCC) / Bureau of Energy Efficiency (BEE)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Official Statutory Jurisdiction</p>
                        <p className="font-semibold text-[var(--text)]">National Coastal Regulation Zone (CRZ) & India Carbon Market (CCTS Registry)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Validator Appointment Reference</p>
                        <p className="font-mono text-[var(--text)]">Civil Service Order #CC-2024-BEE-0091 (Directorate of Energy Transition)</p>
                      </div>
                      <div className="pt-1 border-t border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text-muted)]">Registered Platform Digital Seal (Non-Repudiation)</p>
                        <p className="font-mono text-blue-400 text-[11px] truncate">SHA-256 Registered Seal: 0x7b2f91a084c8e14d9b23fa89... (IT Act 2000 Binding)</p>
                      </div>
                    </div>
                  </div>

                  {/* Scope of Authority */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" /> Scope of Statutory Authority
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        STATUTORY AUTHORITY
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Authorized Project Categories</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-md text-[10px]">CRZ Coastal Clearances</span>
                          <span className="bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-md text-[10px]">State Forest Land Tenure</span>
                          <span className="bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-md text-[10px]">BEE CCTS Methodologies</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Why Named Ministry Tracking Matters</p>
                        <p className="text-[var(--text-muted)] leading-relaxed">
                          When corporate buyers are audited by their regulatory bodies, approvals trace back to a named government ministry, guaranteeing legal standing in court or arbitration.
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Anti-Fraud Protection</p>
                        <p className="font-semibold text-emerald-400">Patricia Trie Nonce #9824 - Verified Zero Overlapping Land Claims</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 3. INDEPENDENT ACADEMIC AUDITOR PROFILE ══════════════ */}
            {selectedRole === 'academic' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-purple-400 text-sm flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" /> Deliverable from Platform: Public Scientific Record & $1,200 Audit Honorarium
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      A public scientific record of verification work (peer review ledger, DOI citations), and an honorarium fee of $1,200 per milestone audit disbursed from our dedicated 5% reserve.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/research" className="px-3 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-colors">
                      Review DOI Ledger
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Academic Affiliation */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Scientific & Academic Affiliation
                      </span>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        PH.D. CREDENTIALED
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Academic Institution / Body</p>
                        <p className="font-semibold text-[var(--text)]">Indian Institute of Technology (IIT) Kharagpur — School of Environmental Science</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Highest Relevant Degree & Field</p>
                        <p className="font-semibold text-[var(--text)]">Ph.D. in Marine Coastal Biogeochemistry & Carbon Dynamics (Oxford / IIT)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Publication Record & Citation IDs</p>
                        <p className="font-mono text-purple-400">ORCID: 0000-0002-1825-009X · Google Scholar: scholar.google.com/dr_sinha</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">42 Peer-Reviewed Papers in Aquatic Botany & Nature Climate Change</p>
                      </div>
                    </div>
                  </div>

                  {/* Carbon Methodologies & COI */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-400" /> Methodologies & Conflict-of-Interest Declaration
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        COI DECLARED & VERIFIED
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Certified Carbon Methodologies</p>
                        <p className="font-semibold text-[var(--text)]">Verra VCS VM0033 Mangrove Restoration, BEE BM FR05.001, Gold Standard Blue Carbon, IPCC Tier 2</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Conflict-of-Interest (COI) Nonce Attestation</p>
                        <p className="text-[var(--text-muted)] leading-relaxed italic bg-[var(--bg)] p-2 rounded-xl border border-[var(--border)]">
                          "I declare under penalty of decertification that I have never been paid, employed, or compensated by the audited NGO within the preceding 5 years."
                        </p>
                      </div>
                      <div className="pt-1 border-t border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text-muted)]">NVIDIA-Style Blind Reviewer Pool</p>
                        <p className="font-semibold text-purple-400">Randomized blind project rotation prevents NGO collusion · $1,200 honorarium earned per milestone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 4. CORPORATE ENTERPRISE BUYER PROFILE ══════════════ */}
            {selectedRole === 'corporate' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" /> Deliverable from Platform: Auditable Offsets & ESG PDF Reports
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      A verifiable, auditable offset you can cite in Scope 1–3 ESG/sustainability reports (ISO 14064, SEBI BRSR Core, TCFD, GRI 305), with full satellite coordinate traceability.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/esg" className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors">
                      Generate ESG Disclosure PDF
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Identity */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" /> Enterprise Legal Entity
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        TIER 1 COMPLIANCE
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Company Legal Name & Reg No</p>
                        <p className="font-semibold text-[var(--text)]">TechCorp International India Pvt Ltd (CIN: U72200KA2015PTC082914)</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Industry Sector</p>
                        <p className="font-semibold text-[var(--text)]">Cloud Computing, Enterprise Infrastructure & Logistics</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Chief Sustainability Officer (Actual Decision Maker)</p>
                        <p className="font-semibold text-[var(--text)]">Sarah Jenkins (VP ESG Disclosure & Net-Zero Strategy)</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Direct Contact: s.jenkins@techcorp.com · Sustainability Office</p>
                      </div>
                    </div>
                  </div>

                  {/* Disclosure & Integration */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-amber-400" /> Emissions Disclosure & ESG Stack
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ERP CONNECTED
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Public Emissions Disclosure Reference</p>
                        <p className="font-semibold text-[var(--text)]">CDP Climate Score A- · FY2025 Scope 1-3 Footprint: 28,400 tCO₂e</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Procurement & Billing Contact</p>
                        <p className="font-mono text-[var(--text)]">procurement-invoicing@techcorp.com</p>
                      </div>
                      <div className="pt-1 border-t border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text-muted)]">ESG Software Integration Webhook</p>
                        <p className="font-semibold text-emerald-400">Salesforce Net Zero Cloud + Watershed API + SAP Sustainability Control Tower (Active)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 5. INDIVIDUAL / RETAIL BUYER PROFILE ══════════════ */}
            {selectedRole === 'individual' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-green-400 text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4" /> Deliverable from Platform: Lightweight, Zero-Friction Personal Offsets
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      Offset personal flight emissions, lifestyle footprints, or green events with zero KYC friction and instant on-chain retirement certificates.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/marketplace" className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors">
                      Offset Personal Footprint
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-5 space-y-3">
                    <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider block border-b border-[var(--border)] pb-2">
                      Personal Identity (Lightweight by Design)
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Citizen / Individual Name</p>
                        <p className="font-semibold text-[var(--text)]">Jane Doe</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Email</p>
                        <p className="font-mono text-[var(--text)]">jane.doe@gmail.com</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Primary Payment Method</p>
                        <p className="font-semibold text-[var(--text)]">MetaMask Web3 / Credit Card (No heavy paperwork required)</p>
                      </div>
                    </div>
                  </div>

                  <div className="card p-5 space-y-3">
                    <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider block border-b border-[var(--border)] pb-2">
                      Offset Motivation & Impact
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Self-Reported Offset Reason</p>
                        <p className="font-semibold text-[var(--text)]">International Flight Emissions & Eco-Conscious Lifestyle</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)]">Total Tonnes Offset</p>
                        <p className="text-base font-bold text-green-400">12 tCO₂e (~60 Standing Mangrove Trees Protected)</p>
                      </div>
                      <div className="pt-1">
                        <Link href="/ledger" className="text-xs font-semibold text-primary-400 hover:underline">
                          Print Personal Green Citizen Certificate →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════ 6. PUBLIC / LOCAL COMMUNITY (READ-ONLY + CONCERNS) ══════════════ */}
            {selectedRole === 'public' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h3 className="font-bold text-teal-400 text-sm flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> Deliverable from Platform: Radical Transparency & Community Feedback
                    </h3>
                    <p className="text-[var(--text-muted)] mt-0.5">
                      Zero-login credit authenticity verification for anyone, plus an accountable channel for coastal community members to submit on-ground observations.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/verifier" className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors">
                      Zero-Login Credit Verifier
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Public Read-Only Verification */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-teal-400" /> Public Transparency (No Account Needed)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        100% OPEN
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Anyone — independent journalists, climate researchers, or coastal residents — can verify whether a claimed carbon offset corresponds to real, protected mangrove trees on Polygon Mainnet.
                    </p>
                    <div className="p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)] space-y-1 text-xs font-mono">
                      <p className="text-[10px] text-[var(--text-muted)]">Live Test Serial Number</p>
                      <p className="text-primary-400 font-bold">CBX-MNG-2026-000481</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Sundarbans Mangrove Reserve (21.9497° N, 89.1833° E)</p>
                    </div>
                    <Link
                      href="/verifier"
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 text-xs font-bold transition-colors"
                    >
                      Search Any Serial on Public Registry <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Community Whistleblower & Observation Channel */}
                  <div className="card p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                      <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Coastal Community Whistleblower & Observations
                      </span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                        ACCOUNTABLE FEEDBACK
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Notice a discrepancy between the map and the ground? Submit an observation directly into the compliance registry:
                    </p>

                    {concernSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                        <p className="text-xs font-bold text-[var(--text)]">Observation Logged</p>
                        <p className="text-[10px] text-[var(--text-muted)]">Your ground report has been recorded in the platform compliance audit queue.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleCommunitySubmit} className="space-y-2.5 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Your Name (Optional)</label>
                            <input
                              value={concernName}
                              onChange={e => setConcernName(e.target.value)}
                              placeholder="Leave blank for anonymous"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[var(--text-muted)] block mb-1">Coastal Village / Location</label>
                            <input
                              value={concernLocation}
                              onChange={e => setConcernLocation(e.target.value)}
                              placeholder="e.g. Gosaba, Sundarbans"
                              required
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] block mb-1">Your Relationship to Site</label>
                          <select
                            value={concernRole}
                            onChange={e => setConcernRole(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] outline-none"
                          >
                            <option value="Local Coastal Fisherfolk">Local Coastal Fisherfolk</option>
                            <option value="Village Panchayat Resident">Village Panchayat Resident</option>
                            <option value="Independent Environmental Watchdog">Independent Environmental Watchdog</option>
                            <option value="Citizen Observer">Citizen Observer</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] block mb-1">Field Observation / Concern</label>
                          <textarea
                            value={concernText}
                            onChange={e => setConcernText(e.target.value)}
                            rows={2}
                            placeholder="Describe what you see on the ground (sapling health, embankment, community consultation)..."
                            required
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] text-[var(--text)] outline-none resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Ground Observation
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'holdings' && (
          <motion.div
            key="holdings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--text)]">Verified Carbon Assets</h3>
                <p className="text-xs text-[var(--text-muted)]">ERC-1155 Tokenized Carbon Units held in registry custody ({totalOwnedTons} tCO₂e total)</p>
              </div>
              <Link href="/marketplace" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Explore Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Project</th>
                    <th className="px-5 py-3 text-left">Token ID / Serials</th>
                    <th className="px-5 py-3 text-left">Balance</th>
                    <th className="px-5 py-3 text-left">Estimated Value</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/50">
                  {activePurchases.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--border)]/20 transition-colors">
                      <td className="px-5 py-4 font-medium text-[var(--text)]">{item.project}</td>
                      <td className="px-5 py-4 font-mono text-[var(--text-muted)]">
                        <div>#{item.tokenId}</div>
                        {item.serials && item.serials.length > 0 && (
                          <div className="text-[10px] text-primary-400 truncate max-w-[180px]">{item.serials[0]}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-[var(--text)]">{item.amount} tCO₂e</td>
                      <td className="px-5 py-4 font-semibold text-primary-400">{item.cost}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href="/ledger"
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold border border-red-500/20 transition-colors"
                        >
                          Retire Token
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'retirements' && (
          <motion.div
            key="retirements"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--text)]">Immutable Retirement Ledger</h3>
                <p className="text-xs text-[var(--text-muted)]">Permanently retired credits burned to 0x0000 on Polygon Mainnet ({totalRetiredTons} tCO₂e total)</p>
              </div>
              <Link href="/ledger" className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Public Ledger <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]/50 text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Project</th>
                    <th className="px-5 py-3 text-left">Retired Tonnes</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left">Tx Hash</th>
                    <th className="px-5 py-3 text-right">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]/50">
                  {retiredPurchases.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--border)]/20 transition-colors">
                      <td className="px-5 py-4 font-medium text-[var(--text)]">{item.project}</td>
                      <td className="px-5 py-4 font-semibold text-[var(--text)]">{item.amount} tCO₂e</td>
                      <td className="px-5 py-4 text-[var(--text-muted)]">{item.date}</td>
                      <td className="px-5 py-4 font-mono text-blue-400">
                        <a
                          href={`https://polygonscan.com/tx/${item.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {item.txHash.slice(0, 10)}… <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href="/esg"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 hover:bg-primary-500/20 font-semibold transition-colors"
                        >
                          <FileText className="w-3 h-3" /> Certificate PDF
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Shield className="w-4 h-4 text-primary-400" />
                <span>KYC & Compliance Status</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Verified organizational identity compliant with India CCTS & ICVCM Core Carbon Principles.</p>
              <div className="p-3 bg-[var(--bg)] rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text)]">Identity Verification</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  TIER 2 VERIFIED
                </span>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text)]">Anti-Double Counting</span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  PATRICIA TRIE ACTIVE
                </span>
              </div>
            </div>

            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Settings className="w-4 h-4 text-primary-400" />
                <span>API & Integrations</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">Use your API credentials to programmatically purchase, verify, and retire credits.</p>
              <div className="p-3 bg-[var(--bg)] rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">Production API Key</p>
                  <p className="text-[11px] font-mono text-[var(--text-muted)]">cx_live_89a***f201</p>
                </div>
                <Link href="/api-docs" className="text-xs font-semibold text-primary-400 hover:underline">
                  View Docs
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
      ) : (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
    </AuthGate>
  )
}
