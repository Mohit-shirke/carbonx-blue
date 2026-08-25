'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProjectCard } from '@/components/marketplace/ProjectCard'
import { CheckoutDrawer } from '@/components/marketplace/CheckoutDrawer'

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
  status: 'active' | 'soldout' | 'upcoming'
}

const PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Sundarbans Mangrove Reserve', location: 'West Bengal, India',
    validator: 'Verra', tokenId: 1001, priceUSD: 28.50, pricePerTon: 28.50,
    availableCredits: 8200, ndvi: 0.84, status: 'active',
    description: 'UNESCO-listed mangrove delta protecting 10,000+ km² of coastal wetland.',
    imageGradient: 'from-emerald-900 to-teal-800',
  },
  {
    id: 'p2', name: 'Bhitarkanika Coastal Forest', location: 'Odisha, India',
    validator: 'CCTS', tokenId: 1002, priceUSD: 22.00, pricePerTon: 22.00,
    availableCredits: 5100, ndvi: 0.76, status: 'active',
    description: 'Ramsar-designated wetland home to saltwater crocodiles and migratory birds.',
    imageGradient: 'from-green-900 to-emerald-800',
  },
  {
    id: 'p3', name: 'Pichavaram Mangrove Block', location: 'Tamil Nadu, India',
    validator: 'Gold Standard', tokenId: 1003, priceUSD: 19.75, pricePerTon: 19.75,
    availableCredits: 3400, ndvi: 0.71, status: 'active',
    description: 'Second largest mangrove forest in the world with exceptional biodiversity.',
    imageGradient: 'from-cyan-900 to-blue-800',
  },
  {
    id: 'p4', name: 'Godavari Delta Reserve', location: 'Andhra Pradesh, India',
    validator: 'Verra', tokenId: 1004, priceUSD: 31.00, pricePerTon: 31.00,
    availableCredits: 6700, ndvi: 0.79, status: 'active',
    description: 'Rich river delta ecosystem spanning 729 km² of protected mangrove habitat.',
    imageGradient: 'from-teal-900 to-green-900',
  },
  {
    id: 'p5', name: 'Gulf of Mannar Marine Park', location: 'Tamil Nadu, India',
    validator: 'CCTS', tokenId: 1005, priceUSD: 16.50, pricePerTon: 16.50,
    availableCredits: 2100, ndvi: 0.65, status: 'upcoming',
    description: 'Marine biosphere reserve with seagrass beds and coral reef carbon sinks.',
    imageGradient: 'from-blue-900 to-indigo-900',
  },
  {
    id: 'p6', name: 'Chilika Lagoon Sanctuary', location: 'Odisha, India',
    validator: 'Gold Standard', tokenId: 1006, priceUSD: 24.00, pricePerTon: 24.00,
    availableCredits: 0, ndvi: 0.68, status: 'soldout',
    description: "Asia's largest coastal lagoon and winter home to Irrawaddy dolphins.",
    imageGradient: 'from-slate-800 to-blue-900',
  },
]

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filtered = PROJECTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.status === filter
    return matchSearch && matchFilter
  })

  const handlePurchase = (project: Project) => {
    setSelectedProject(project)
    setDrawerOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Carbon Credit Marketplace</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {PROJECTS.filter(p => p.status === 'active').length} verified blue carbon projects available
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'active', 'upcoming'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search projects or locations…"
          icon={<Search className="w-4 h-4" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Projects grid */}
      <div
        id="marketplace-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {filtered.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            id={`project-card-${project.id}`}
          >
            <ProjectCard project={project} onPurchase={handlePurchase} />
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p>No projects match your search.</p>
        </div>
      )}

      {/* Checkout drawer */}
      <CheckoutDrawer
        open={drawerOpen}
        project={selectedProject}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
