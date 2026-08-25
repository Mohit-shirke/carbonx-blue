'use client'

import { motion } from 'framer-motion'
import { MapPin, Shield, Layers, TrendingUp, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Project } from '@/app/marketplace/page'

const VALIDATOR_STYLES: Record<string, string> = {
  'Verra':         'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'CCTS':          'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Gold Standard': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

interface Props {
  project: Project
  onPurchase: (p: Project) => void
}

export function ProjectCard({ project, onPurchase }: Props) {
  const isSoldOut = project.status === 'soldout'
  const isUpcoming = project.status === 'upcoming'

  return (
    <motion.div
      className="card overflow-hidden flex flex-col h-full group"
      whileHover={isSoldOut ? {} : { scale: 1.015, boxShadow: '0px 0px 8px rgba(52, 211, 153, 0.4)' }}
      whileTap={isSoldOut ? {} : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* Image banner */}
      <div className={`h-36 bg-gradient-to-br ${project.imageGradient} relative overflow-hidden`}>
        {/* NDVI heatmap overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, rgba(16,185,129,${project.ndvi}) 0%, transparent 70%)`,
          }}
        />
        {/* Token ID badge */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
          ERC-1155 #{project.tokenId}
        </div>
        {/* Status badge */}
        {isSoldOut && (
          <div className="absolute top-3 right-3 bg-red-500/80 text-white text-xs px-2 py-1 rounded-md font-semibold">
            SOLD OUT
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-3 right-3 bg-blue-500/80 text-white text-xs px-2 py-1 rounded-md font-semibold">
            UPCOMING
          </div>
        )}
        {/* NDVI indicator */}
        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-[10px] text-white/60">NDVI</p>
          <p className="text-sm font-bold text-primary-400">{project.ndvi.toFixed(2)}</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Validator badge */}
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${VALIDATOR_STYLES[project.validator]}`}>
            <Shield className="w-2.5 h-2.5 inline mr-1" />
            {project.validator}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {project.location.split(',')[0]}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-[var(--text)] leading-snug">{project.name}</h3>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{project.description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="bg-[var(--bg)] rounded-lg p-2">
            <p className="text-[10px] text-[var(--text-muted)]">Available</p>
            <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1">
              <Layers className="w-3 h-3 text-primary-500" />
              {isSoldOut ? '—' : `${project.availableCredits.toLocaleString()} tCO₂e`}
            </p>
          </div>
          <div className="bg-[var(--bg)] rounded-lg p-2">
            <p className="text-[10px] text-[var(--text-muted)]">Price / Ton</p>
            <p className="text-sm font-semibold text-[var(--text)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-blue-400" />
              ${project.pricePerTon.toFixed(2)}
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant={isSoldOut ? 'ghost' : 'primary'}
          size="sm"
          className="w-full mt-1"
          disabled={isSoldOut || isUpcoming}
          icon={<ShoppingCart className="w-3.5 h-3.5" />}
          onClick={() => onPurchase(project)}
        >
          {isSoldOut ? 'Sold Out' : isUpcoming ? 'Coming Soon' : 'Purchase Carbon Credits'}
        </Button>
      </div>
    </motion.div>
  )
}
