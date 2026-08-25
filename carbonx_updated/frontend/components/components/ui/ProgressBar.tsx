'use client'
import { useState, useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

export function ProgressBar() {
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSpring(progress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const pct = scrollTop / (scrollHeight - clientHeight)
      setProgress(isNaN(pct) ? 0 : Math.min(pct * 100, 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div className="fixed top-0 left-0 right-0 z-[999] h-0.5 bg-primary-500 origin-left pointer-events-none"
      style={{ scaleX: useTransform(smoothProgress, [0, 100], [0, 1]) }}/>
  )
}
