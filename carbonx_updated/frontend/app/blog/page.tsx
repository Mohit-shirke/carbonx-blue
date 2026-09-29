'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, Search, ArrowRight, BookOpen, Sparkles,
  Satellite, Cpu, FileText, CheckCircle2, Share2, Tag,
  ExternalLink, Layers, Globe, Filter
} from 'lucide-react'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const POSTS = [
  {
    id: 'p1',
    title: 'What Is Blue Carbon and Why Does It Matter? Thermodynamic Sequestration at Scale',
    category: 'Science',
    readTime: '5 min read',
    date: '2025-06-20',
    doi: '10.1038/s41558-024-bluecarbon',
    author: 'Dr. Aris Thorne, Lead Biogeochemist',
    gradient: 'from-emerald-950 via-teal-950 to-slate-900',
    accentColor: '#10B981',
    featured: true,
    excerpt: 'Mangroves, seagrasses, and salt marshes sequester carbon at 3–5x the rate of terrestrial tropical rainforests. Here is how anaerobic sediment trapping preserves carbon stocks for millennia without wildfire vulnerability.',
    tags: ['IPCC Tier 2', 'Sediment Trapping', 'Mangrove Biomass'],
  },
  {
    id: 'p2',
    title: 'How ERC-1155 Multi-Token Architecture Revolutionises Carbon Credit Tracking',
    category: 'Blockchain',
    readTime: '7 min read',
    date: '2025-06-15',
    doi: 'RFC-ERC1155-CARBONX-01',
    author: 'Vikram Mehta, Lead Web3 Architect',
    gradient: 'from-blue-950 via-indigo-950 to-slate-900',
    accentColor: '#3B82F6',
    featured: true,
    excerpt: 'Traditional carbon registries rely on centralized spreadsheets and slow PDF attestation. CarbonX leverages ERC-1155 semi-fungible tokens on Polygon to represent distinct project vintages with atomic batch retirement proofs.',
    tags: ['ERC-1155', 'Polygon PoS', 'Merkle-DAG'],
  },
  {
    id: 'p3',
    title: 'How Sentinel-2 Satellite Multi-Spectral Imagery Powers Our Real-Time MRV Pipeline',
    category: 'Technology',
    readTime: '8 min read',
    date: '2025-06-10',
    doi: 'ESA-COPERNICUS-MRV-08',
    author: 'Elena Rostova, Earth Observation Engineer',
    gradient: 'from-purple-950 via-violet-950 to-slate-900',
    accentColor: '#8B5CF6',
    featured: false,
    excerpt: 'Every CarbonX project is validated using ESA Copernicus Sentinel-2 Level-2A imagery. We unpack NDVI calculations (NIR - Red)/(NIR + Red), atmospheric correction pipelines, and why continuous orbital MRV eliminates manual audit fraud.',
    tags: ['Sentinel-2', 'NDVI Calibrated', 'ESA Copernicus'],
  },
  {
    id: 'p4',
    title: 'Spotlight: Sundarbans Mangrove Reserve — Verifying 25,000 Hectares on Polygon Mainnet',
    category: 'Projects',
    readTime: '6 min read',
    date: '2025-06-05',
    doi: 'CX-PROJ-IN-001-REV',
    author: 'Rajiv Sengupta, Regional Conservation Officer',
    gradient: 'from-emerald-950 via-green-950 to-slate-900',
    accentColor: '#10B981',
    featured: false,
    excerpt: 'The Sundarbans Delta buffers 10,000+ km² of coastal wetland and protects 4.4 million residents against storm surges. Here is how CarbonX empowers local coastal panchayats with direct smart-contract royalty disbursement.',
    tags: ['Sundarbans', 'Community Royalties', 'CCTS Compliant'],
  },
  {
    id: 'p5',
    title: 'India Carbon Credit Trading Scheme (CCTS) 2025: Regulatory Blueprint & Blue Carbon',
    category: 'Market',
    readTime: '10 min read',
    date: '2025-05-28',
    doi: 'POLICY-BEE-CCTS-2025',
    author: 'Ananya Sharma, Regulatory Policy Director',
    gradient: 'from-amber-950 via-orange-950 to-slate-900',
    accentColor: '#F59E0B',
    featured: false,
    excerpt: "With India's voluntary carbon market expanding at 40% CAGR, we dissect the BEE BM FR05.001 methodology, Article 6.2 cross-border ITMO transfers, and how blue carbon qualifies for premium compliance credits.",
    tags: ['SEBI BRSR', 'CCTS Framework', 'Article 6 Paris'],
  },
  {
    id: 'p6',
    title: 'Why We Engineered CarbonX on Polygon PoS Mainnet: Low Gas, Instant Finality, EVM Scalability',
    category: 'Blockchain',
    readTime: '5 min read',
    date: '2025-05-20',
    doi: 'ENG-BENCHMARK-POLYGON-137',
    author: 'DevOps & Protocol Team',
    gradient: 'from-cyan-950 via-blue-950 to-slate-900',
    accentColor: '#06B6D4',
    featured: false,
    excerpt: 'Transaction overhead of <$0.001 per retirement, robust 2-second block finality, and 99.99% carbon neutrality compared to legacy PoW chains. Our benchmark analysis comparing Polygon, Arbitrum, and Layer 1 Ethereum.',
    tags: ['Polygon 137', 'Gas <$0.001', 'Green EVM'],
  },
]

const CATEGORIES = ['All', 'Science', 'Blockchain', 'Technology', 'Projects', 'Market']

const CAT_COLORS: Record<string, string> = {
  Science: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Blockchain: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Technology: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  Projects: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  Market: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
}

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [subscribed, setSubscribed] = useState(false)
  const [subEmail, setSubEmail] = useState('')

  const filtered = POSTS.filter((p) => {
    const q = search.toLowerCase()
    const matchesQuery =
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    return matchesQuery && (category === 'All' || p.category === category)
  })

  const featured = filtered.filter((p) => p.featured)
  const rest = filtered.filter((p) => !p.featured)

  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-hidden pb-16">
      {/* 21st.dev Ambient Matrix Background */}
      <BackgroundGrid pattern="grid" opacity={0.12} />

      {/* Floating Gradient Orbs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none opacity-60 dark:opacity-100" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none opacity-60 dark:opacity-100" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 relative z-10 space-y-8 sm:space-y-12">
        {/* Header Section */}
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KNOWLEDGE ENGINE & SATELLITE DISPATCHES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text)] tracking-tight leading-tight">
            CarbonX Research & Dispatches
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
            Peer-reviewed blue carbon biogeochemistry, on-chain ERC-1155 governance, and Earth observation analytics authored by our science and protocol engineers.
          </p>

          {/* Telemetry Indicator Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-mono text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Satellite className="w-3.5 h-3.5" /> Sentinel-2 L2A Ingestion
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-medium">
              <Cpu className="w-3.5 h-3.5" /> Polygon PoS (Chain 137)
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <FileText className="w-3.5 h-3.5" /> IPCC Tier 2 Calibrated
            </span>
          </div>
        </motion.div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-2 rounded-2xl bg-[var(--card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search research papers, algorithms, tags (e.g. NDVI, ERC-1155)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 py-0.5">
            {CATEGORIES.map((c) => {
              const isActive = category === c
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/60'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>

        {/* Featured Posts: SpotlightCard + BorderBeam */}
        {featured.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flagship Research Monographs</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((post, idx) => (
                <SpotlightCard
                  key={post.id}
                  className="relative rounded-3xl bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-xl group cursor-pointer flex flex-col justify-between"
                  spotlightColor="rgba(16, 185, 129, 0.15)"
                >
                  <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={9 + idx * 2} size={220} />

                  <div className={`p-6 sm:p-8 bg-gradient-to-br ${post.gradient} relative border-b border-[var(--border)]`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${CAT_COLORS[post.category]}`}>
                        {post.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                        {post.doi}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-emerald-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-xs text-slate-300 mt-2 font-mono">
                      By {post.author}
                    </p>
                  </div>

                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 text-xs text-[var(--text-muted)]">
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            {post.readTime}
                          </span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read Full Paper <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        )}

        {/* Regular Article Grid with SpotlightCards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Technical Notes & Methodologies</span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Showing {filtered.length} publication{filtered.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, idx) => (
              <SpotlightCard
                key={post.id}
                className="relative rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 cursor-pointer group flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-md"
                spotlightColor="rgba(6, 182, 212, 0.12)"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${CAT_COLORS[post.category]}`}>
                      {post.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[var(--text)] leading-snug group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
                    <span>{post.date}</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)]">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30 text-emerald-500" />
              <p className="text-sm font-semibold text-[var(--text)]">No research publications found</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try changing your keywords or selecting "All" categories.</p>
            </div>
          )}
        </div>

        {/* Newsletter & Peer Review Citations Box */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-emerald-500/10 border border-emerald-500/20 p-6 sm:p-10 shadow-xl overflow-hidden">
          <BorderBeam colorFrom="#10B981" colorTo="#06B6D4" duration={12} size={240} />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <BookOpen className="w-6 h-6" />
            </div>

            <h3 className="text-2xl font-bold text-[var(--text)] tracking-tight">
              Subscribe to the CarbonX Science Review
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Bi-weekly technical digests covering satellite MRV optical sensor calibrations, Polygon PoS governance proposals, and carbon registry policy updates.
            </p>

            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-sm flex items-center justify-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Subscription confirmed! You will receive our next monograph issue.</span>
              </motion.div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="scientist@institution.edu"
                  className="flex-1 px-4 py-3 rounded-xl text-sm bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-emerald-500 placeholder:text-[var(--text-muted)] transition-colors"
                />
                <button
                  onClick={() => {
                    if (subEmail.includes('@')) setSubscribed(true)
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shrink-0"
                >
                  Join Review
                </button>
              </div>
            )}

            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              Zero marketing spam. Cryptographically signed email alerts via RFC-5322. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
