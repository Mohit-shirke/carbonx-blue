'use client'
import { motion } from 'framer-motion'

interface BackgroundGridProps {
  pattern?: 'grid' | 'dots'
  opacity?: number
  className?: string
}

export function BackgroundGrid({
  pattern = 'grid',
  opacity = 0.15,
  className = '',
}: BackgroundGridProps = {}) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}>
      {/* SVG Matrix Pattern */}
      <svg
        className="absolute inset-0 h-full w-full stroke-primary-500/10 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
        style={{ opacity }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={pattern === 'dots' ? 'ledger-dots-pattern' : 'ledger-grid-pattern'}
            width={pattern === 'dots' ? 24 : 48}
            height={pattern === 'dots' ? 24 : 48}
            patternUnits="userSpaceOnUse"
            x="50%"
            y="-1"
          >
            {pattern === 'dots' ? (
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            ) : (
              <path d="M.5 48V.5H48" fill="none" />
            )}
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          strokeWidth="0"
          fill={`url(#${pattern === 'dots' ? 'ledger-dots-pattern' : 'ledger-grid-pattern'})`}
        />
      </svg>

      {/* Floating ambient glow orbs */}
      <motion.div
        className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.5, 0.25],
          x: [-30, 30, -30],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-48 right-1/4 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1.15, 1, 1.15],
          opacity: [0.2, 0.45, 0.2],
          y: [-25, 25, -25],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  )
}
