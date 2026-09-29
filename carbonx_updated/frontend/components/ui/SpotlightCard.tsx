'use client'
import React, { useRef, useState } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SpotlightCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  disableLift?: boolean
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(16, 185, 129, 0.12)',
  disableLift = false,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return
    const div = divRef.current
    const rect = div.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => { setIsFocused(true); setOpacity(1) }}
      onBlur={() => { setIsFocused(false); setOpacity(0) }}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      whileHover={disableLift ? {} : { y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm transition-colors',
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(380px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 55%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
