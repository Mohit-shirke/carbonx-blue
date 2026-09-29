'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Shield, Layers, TrendingUp, ShoppingCart, Sparkles, Satellite, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BorderBeam } from '@/components/ui/BorderBeam'
import type { Project } from '@/app/marketplace/page'

const VALIDATOR_STYLES: Record<string, string> = {
  'Verra':         'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'CCTS':          'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Gold Standard': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

interface Props {
  project: Project
  onPurchase: (p: Project) => void
}

export function ProjectCard({ project, onPurchase }: Props) {
  const isSoldOut = project.status === 'soldout'
  const isUpcoming = project.status === 'upcoming'
  const isFeatured = project.ndvi >= 0.82 || project.tokenId === 1001

  // Spotlight mouse tracker
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={cardRef}
      role="article"
      aria-label={`Carbon offset project: ${project.name}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex flex-col h-full group shadow-md transition-shadow hover:shadow-xl hover:shadow-emerald-500/10"
      whileHover={isSoldOut ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      {/* 21st.dev Spotlight cursor illumination */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.12), transparent 60%)`,
        }}
      />

      {/* 21st.dev BorderBeam for premier projects */}
      {isFeatured && !isSoldOut && (
        <BorderBeam size={220} duration={9} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
      )}

      {/* Image banner */}
      <div className={`h-48 bg-gradient-to-br ${project.imageGradient} relative overflow-hidden shrink-0`}>
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}

        {/* Dark vignette overlay for crisp badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

        {/* Dynamic NDVI heatmap simulation glow */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, rgba(16,185,129,${project.ndvi}) 0%, transparent 70%)`,
          }}
        />

        {/* Top Badges: Token ID + Featured */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
          <div className="bg-black/70 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-xl font-mono border border-white/15 shadow-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            ERC-1155 #{project.tokenId}
          </div>
          {isFeatured && (
            <div className="bg-primary-500/90 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-lg font-bold shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> High Canopy
            </div>
          )}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-20">
          {isSoldOut && (
            <div className="bg-red-500/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-xl font-bold shadow-sm">
              SOLD OUT
            </div>
          )}
          {isUpcoming && (
            <div className="bg-blue-500/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-xl font-bold shadow-sm">
              UPCOMING
            </div>
          )}
        </div>

        {/* Bottom Bar inside Image: Sentinel-2 & NDVI Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-20">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-xl px-2.5 py-1 border border-white/10 text-[11px] text-white/90">
            <Satellite className="w-3 h-3 text-cyan-400" />
            <span>Sentinel-2 L2A</span>
          </div>

          <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-1 border border-white/10 shadow-sm text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">NDVI</span>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">{project.ndvi.toFixed(2)}</span>
            </div>
            {/* Health Meter bar */}
            <div
              role="progressbar"
              aria-label="NDVI canopy health index"
              aria-valuenow={Math.round(project.ndvi * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-16 h-1 bg-white/20 rounded-full overflow-hidden mt-0.5"
            >
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, project.ndvi * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 gap-3.5 relative z-20">
        {/* Validator & Location */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${VALIDATOR_STYLES[project.validator] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
            <Shield className="w-3 h-3 inline mr-1" />
            {project.validator} Verified
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            {project.location.split(',')[0]}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="font-bold text-base text-[var(--text)] group-hover:text-primary-500 transition-colors leading-snug">
            {project.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 mt-1">
            {project.description}
          </p>
        </div>

        {/* Scientific Telemetry Row */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-[var(--border)]/60">
          <div className="bg-[var(--bg)] rounded-xl p-2.5 border border-[var(--border)]/50">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Available Credits</p>
            <p className="text-sm font-bold text-[var(--text)] font-mono flex items-center gap-1.5 mt-0.5">
              <Layers className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              {isSoldOut ? '0 tCO₂e' : `${project.availableCredits.toLocaleString()} tCO₂e`}
            </p>
          </div>
          <div className="bg-[var(--bg)] rounded-xl p-2.5 border border-[var(--border)]/50">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Price / Ton</p>
            <p className="text-sm font-bold text-primary-500 font-mono flex items-center gap-1.5 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary-500 shrink-0" />
              ${project.pricePerTon.toFixed(2)}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant={isSoldOut ? 'ghost' : 'primary'}
          size="sm"
          aria-label={isSoldOut ? `${project.name} is sold out` : isUpcoming ? `${project.name} is coming soon` : `Purchase carbon credits from ${project.name}`}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all ${
            isSoldOut ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-emerald-500/25 active:scale-95'
          }`}
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
