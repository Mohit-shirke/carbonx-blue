'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, TreePine, Layers } from 'lucide-react'

interface Zone {
  id: string
  name: string
  cx: number
  cy: number
  r: number
  ndvi: number
  treeDensity: number
  creditsAvailable: number
  status: 'verified' | 'pending' | 'proposed'
}

const ZONES: Zone[] = [
  { id: 'z1', name: 'Sundarbans Delta – Sector A', cx: 280, cy: 180, r: 38, ndvi: 0.84, treeDensity: 1420, creditsAvailable: 8200, status: 'verified' },
  { id: 'z2', name: 'Bhitarkanika Wetland', cx: 390, cy: 240, r: 28, ndvi: 0.76, treeDensity: 980, creditsAvailable: 5100, status: 'verified' },
  { id: 'z3', name: 'Pichavaram Mangrove', cx: 320, cy: 310, r: 22, ndvi: 0.71, treeDensity: 760, creditsAvailable: 3400, status: 'pending' },
  { id: 'z4', name: 'Godavari Delta Zone', cx: 200, cy: 270, r: 30, ndvi: 0.79, treeDensity: 1100, creditsAvailable: 6700, status: 'verified' },
  { id: 'z5', name: 'Gulf of Mannar Block 3', cx: 460, cy: 340, r: 20, ndvi: 0.65, treeDensity: 540, creditsAvailable: 2100, status: 'proposed' },
  { id: 'z6', name: 'Chilika Lagoon Reserve', cx: 160, cy: 200, r: 24, ndvi: 0.68, treeDensity: 620, creditsAvailable: 2800, status: 'pending' },
]

const STATUS_COLORS: Record<Zone['status'], string> = {
  verified: '#10B981',
  pending: '#F59E0B',
  proposed: '#60A5FA',
}

const NDVI_TO_COLOR = (ndvi: number) => {
  if (ndvi >= 0.80) return '#059669'
  if (ndvi >= 0.70) return '#10B981'
  if (ndvi >= 0.60) return '#34D399'
  return '#6EE7B7'
}

export function MangroveMap() {
  const [activeZone, setActiveZone] = useState<Zone | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  return (
    <div className="card overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div>
          <h2 className="font-semibold text-[var(--text)] text-sm">Coastal Wetland Ecosystem Map</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Sundarbans & Bay of Bengal Region · Live Telemetry</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {[['#10B981', 'Verified'], ['#F59E0B', 'Pending'], ['#60A5FA', 'Proposed']].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* SVG Map canvas */}
      <div className="relative bg-gradient-to-br from-[#0c2340] to-[#0a3d2e] p-2">
        <svg
          viewBox="0 0 600 420"
          className="w-full h-auto max-h-[400px]"
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
          }}
        >
          {/* Ocean background */}
          <defs>
            <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.05" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="600" height="420" fill="url(#oceanGrad)" />

          {/* Grid lines */}
          {[...Array(8)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 60} x2="600" y2={i * 60} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={i * 66} y1="0" x2={i * 66} y2="420" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}

          {/* Coastline path (stylized Bay of Bengal) */}
          <path
            d="M80,60 Q140,80 160,120 Q180,160 220,170 Q260,180 290,200 Q320,220 350,240 Q380,260 400,290 Q420,320 440,360 Q460,380 480,400"
            stroke="rgba(148,163,184,0.3)" strokeWidth="2" fill="none" strokeDasharray="6,4"
          />

          {/* Land mass suggestion */}
          <path
            d="M0,60 Q80,60 160,120 Q220,170 290,200 Q350,240 400,290 Q440,360 480,420 L0,420 Z"
            fill="rgba(16,185,129,0.06)" stroke="rgba(16,185,129,0.15)" strokeWidth="1"
          />

          {/* Zone circles */}
          {ZONES.map((zone) => (
            <g key={zone.id} className="cursor-pointer" onClick={() => setActiveZone(zone)}>
              {/* Outer pulse ring */}
              <motion.circle
                cx={zone.cx} cy={zone.cy} r={zone.r + 8}
                fill="none"
                stroke={STATUS_COLORS[zone.status]}
                strokeWidth="1"
                strokeOpacity="0.4"
                animate={{ r: [zone.r + 6, zone.r + 14], opacity: [0.4, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
              />
              {/* Main zone circle */}
              <motion.circle
                cx={zone.cx} cy={zone.cy} r={zone.r}
                fill={NDVI_TO_COLOR(zone.ndvi)}
                fillOpacity="0.25"
                stroke={STATUS_COLORS[zone.status]}
                strokeWidth="2"
                filter="url(#glow)"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              {/* Zone label */}
              <text
                x={zone.cx} y={zone.cy + zone.r + 14}
                textAnchor="middle"
                fontSize="9"
                fill="rgba(255,255,255,0.6)"
                className="pointer-events-none select-none"
              >
                {zone.name.split(' ')[0]}
              </text>
              {/* NDVI value inside */}
              <text
                x={zone.cx} y={zone.cy + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="white"
                className="pointer-events-none select-none"
              >
                {zone.ndvi}
              </text>
            </g>
          ))}

          {/* Compass rose */}
          <g transform="translate(555, 35)">
            <circle cx="0" cy="0" r="16" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x="0" y="-8" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.7)" fontWeight="600">N</text>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Hover telemetry modal */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-4 z-20"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-semibold text-sm text-[var(--text)]">{activeZone.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${
                  activeZone.status === 'verified' ? 'bg-primary-500/10 text-primary-500' :
                  activeZone.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {activeZone.status.charAt(0).toUpperCase() + activeZone.status.slice(1)}
                </span>
              </div>
              <button onClick={() => setActiveZone(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Activity, label: 'NDVI', value: activeZone.ndvi.toFixed(2), color: 'text-primary-500' },
                { icon: TreePine, label: 'Tree Density', value: `${activeZone.treeDensity.toLocaleString()}/km²`, color: 'text-green-400' },
                { icon: Layers, label: 'Credits Available', value: `${(activeZone.creditsAvailable / 1000).toFixed(1)}K tCO₂e`, color: 'text-blue-400' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-[var(--bg)] rounded-lg p-2.5 text-center">
                  <Icon className={`w-3.5 h-3.5 mx-auto mb-1 ${color}`} />
                  <p className="text-xs font-semibold text-[var(--text)]">{value}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
