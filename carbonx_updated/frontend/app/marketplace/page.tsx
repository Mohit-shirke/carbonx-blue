'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Sparkles, Shield, TreeDeciduous, Activity, Layers, ArrowUpRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/marketplace/ProjectCard'
import { CheckoutDrawer } from '@/components/marketplace/CheckoutDrawer'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

export interface Project {
  id: string
  name: string
  location: string
  validator: 'Verra' | 'CCTS' | 'Gold Standard'
  tokenId: number
  priceUSD: number
  pricePerTon: number
  availableCredits: number
  ndvi: number
  description: string
  imageGradient: string
  imageUrl?: string
  status: 'active' | 'soldout' | 'upcoming'
}

const PROJECT_IMAGE_MAP: Record<string, string> = {
  '1001': '/images/projects/sundarbans.jpg',
  '1002': '/images/projects/bhitarkanika.jpg',
  '1003': '/images/projects/pichavaram.jpg',
  '1004': '/images/projects/godavari.jpg',
  '1005': '/images/projects/chilika.jpg',
  '1006': '/images/projects/andaman.jpg',
}

function getProjectImage(p: any): string {
  if (p.image_url && p.image_url.startsWith('/images/projects/')) {
    return p.image_url
  }
  const idKey = String(p.token_id || p.tokenId || '')
  if (PROJECT_IMAGE_MAP[idKey]) return PROJECT_IMAGE_MAP[idKey]
  const name = (p.name || '').toLowerCase()
  if (name.includes('sundarban')) return '/images/projects/sundarbans.jpg'
  if (name.includes('bhitarkanika')) return '/images/projects/bhitarkanika.jpg'
  if (name.includes('pichavaram')) return '/images/projects/pichavaram.jpg'
  if (name.includes('godavari') || name.includes('coringa')) return '/images/projects/godavari.jpg'
  if (name.includes('chilika')) return '/images/projects/chilika.jpg'
  if (name.includes('andaman') || name.includes('mannar')) return '/images/projects/andaman.jpg'
  return p.image_url || '/images/projects/sundarbans.jpg'
}

const PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Sundarbans Mangrove Reserve', location: 'West Bengal, India',
    validator: 'Verra', tokenId: 1001, priceUSD: 28.50, pricePerTon: 28.50,
    availableCredits: 8200, ndvi: 0.84, status: 'active',
    description: 'UNESCO-listed mangrove delta protecting 10,000+ km² of coastal wetland.',
    imageGradient: 'from-emerald-900 to-teal-800',
    imageUrl: '/images/projects/sundarbans.jpg',
  },
  {
    id: 'p2', name: 'Bhitarkanika Coastal Forest', location: 'Odisha, India',
    validator: 'CCTS', tokenId: 1002, priceUSD: 22.00, pricePerTon: 22.00,
    availableCredits: 5100, ndvi: 0.76, status: 'active',
    description: 'Ramsar-designated wetland home to saltwater crocodiles and migratory birds.',
    imageGradient: 'from-green-900 to-emerald-800',
    imageUrl: '/images/projects/bhitarkanika.jpg',
  },
  {
    id: 'p3', name: 'Pichavaram Mangrove Block', location: 'Tamil Nadu, India',
    validator: 'Gold Standard', tokenId: 1003, priceUSD: 19.75, pricePerTon: 19.75,
    availableCredits: 3400, ndvi: 0.71, status: 'active',
    description: 'Second largest mangrove forest in the world with exceptional biodiversity.',
    imageGradient: 'from-cyan-900 to-blue-800',
    imageUrl: '/images/projects/pichavaram.jpg',
  },
  {
    id: 'p4', name: 'Godavari Delta Reserve', location: 'Andhra Pradesh, India',
    validator: 'Verra', tokenId: 1004, priceUSD: 31.00, pricePerTon: 31.00,
    availableCredits: 6700, ndvi: 0.79, status: 'active',
    description: 'Rich river delta ecosystem spanning 729 km² of protected mangrove habitat.',
    imageGradient: 'from-teal-900 to-green-900',
    imageUrl: '/images/projects/godavari.jpg',
  },
  {
    id: 'p5', name: 'Chilika Lagoon Seagrass', location: 'Odisha, India',
    validator: 'Verra', tokenId: 1005, priceUSD: 31.00, pricePerTon: 31.00,
    availableCredits: 2100, ndvi: 0.68, status: 'active',
    description: "Asia's largest coastal lagoon and winter home to Irrawaddy dolphins and migratory waterfowl.",
    imageGradient: 'from-blue-900 to-indigo-900',
    imageUrl: '/images/projects/chilika.jpg',
  },
  {
    id: 'p6', name: 'Andaman Pristine Mangrove', location: 'Andaman & Nicobar Islands, India',
    validator: 'CCTS', tokenId: 1006, priceUSD: 34.00, pricePerTon: 34.00,
    availableCredits: 9400, ndvi: 0.89, status: 'active',
    description: 'Pristine island mangrove forests and seagrass beds in the Andaman archipelago.',
    imageGradient: 'from-slate-800 to-blue-900',
    imageUrl: '/images/projects/andaman.jpg',
  },
]

export default function MarketplacePage() {
  const [projectsList, setProjectsList] = useState<Project[]>(PROJECTS)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all')
  const [selectedValidator, setSelectedValidator] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/projects`)
      .then(res => res.json())
      .then(data => {
        if (data && data.projects && data.projects.length > 0) {
          const gradients = [
            'from-emerald-900 to-teal-800',
            'from-green-900 to-emerald-800',
            'from-cyan-900 to-blue-800',
            'from-teal-900 to-green-900',
            'from-blue-900 to-indigo-900',
            'from-slate-800 to-blue-900',
          ]
          const mapped: Project[] = data.projects.map((p: any, i: number) => ({
            id: p.id,
            name: p.name,
            location: p.location || 'India',
            validator: (p.validator_badge || 'Verra') as any,
            tokenId: p.token_id || 1001 + i,
            priceUSD: parseFloat(p.price_per_ton_usd) || 28.5,
            pricePerTon: parseFloat(p.price_per_ton_usd) || 28.5,
            availableCredits: p.available_credits ?? 1000,
            ndvi: parseFloat(p.ndvi_score) || 0.75,
            description: p.description || '',
            imageGradient: gradients[i % gradients.length],
            imageUrl: getProjectImage(p),
            status: p.status === 'active' || p.status === 'upcoming' || p.status === 'soldout' ? p.status : 'active',
          }))
          setProjectsList(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return projectsList.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.tokenId.toString().includes(search)
      const matchFilter = filter === 'all' || p.status === filter
      const matchValidator = selectedValidator === 'all' || p.validator === selectedValidator
      return matchSearch && matchFilter && matchValidator
    })
  }, [projectsList, search, filter, selectedValidator])

  // Summary statistics
  const totalAvailable = useMemo(() => {
    return projectsList.reduce((acc, p) => acc + (p.status === 'active' ? p.availableCredits : 0), 0)
  }, [projectsList])

  const avgNdvi = useMemo(() => {
    if (!projectsList.length) return 0.8
    return (projectsList.reduce((acc, p) => acc + p.ndvi, 0) / projectsList.length).toFixed(2)
  }, [projectsList])

  const handlePurchase = (project: Project) => {
    setSelectedProject(project)
    setDrawerOpen(true)
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
              Polygon PoS Mainnet · Verified Sequestration Registry
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Blue Carbon Marketplace
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Institutional-grade tokenized mangrove and coastal wetland carbon credits. Each credit is backed by Sentinel-2 NDVI satellite monitoring, Verra/CCTS certification, and cryptographic Polygon ERC-1155 smart contracts.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-500 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Available Supply</p>
                <p className="text-base font-bold font-mono text-[var(--text)]">{totalAvailable.toLocaleString()} tCO₂e</p>
              </div>
            </div>
          </div>
        </header>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Pools</span>
              <TreeDeciduous className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              {projectsList.filter(p => p.status === 'active').length}
            </p>
            <p className="text-xs text-primary-500 font-medium mt-1">
              Coastal Wetland Basins
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Canopy NDVI</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              {avgNdvi}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Sentinel-2 L2A Calibrated
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Standards</span>
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              Verra · CCTS
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Gold Standard Audited
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Settlement Layer</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono">
              Polygon PoS
            </p>
            <p className="text-xs text-purple-400 font-medium mt-1 flex items-center gap-1">
              ERC-1155 Tokenized <ArrowUpRight className="w-3 h-3" />
            </p>
          </SpotlightCard>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              aria-label="Search blue carbon projects by name, location, or token ID"
              placeholder="Search by project name, location, or Token ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>

          {/* Status & Validator Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Tabs */}
            <div role="tablist" aria-label="Filter by project availability" className="flex items-center p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              {(['all', 'active', 'upcoming'] as const).map(f => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    filter === f
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Validator Dropdown */}
            <div role="tablist" aria-label="Filter by verification standard" className="flex items-center p-1 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
              {['all', 'Verra', 'CCTS', 'Gold Standard'].map(val => (
                <button
                  key={val}
                  role="tab"
                  aria-selected={selectedValidator === val}
                  onClick={() => setSelectedValidator(val)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    selectedValidator === val
                      ? 'bg-[var(--card)] text-primary-500 shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {val === 'all' ? 'All Standards' : val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid with Framer Motion Choreography */}
        <div
          id="marketplace-grid"
          role="region"
          aria-label="Carbon project listings"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              id={`project-card-${project.id}`}
            >
              <ProjectCard project={project} onPurchase={handlePurchase} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            role="status"
            aria-live="polite"
            className="text-center py-20 rounded-3xl bg-[var(--card)] border border-[var(--border)] p-8"
          >
            <Search className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-50" />
            <h3 className="text-base font-bold text-[var(--text)]">No blue carbon projects match your query</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Try adjusting your search criteria or resetting filters.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => { setSearch(''); setFilter('all'); setSelectedValidator('all') }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Checkout Drawer */}
        <CheckoutDrawer
          open={drawerOpen}
          project={selectedProject}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  )
}
