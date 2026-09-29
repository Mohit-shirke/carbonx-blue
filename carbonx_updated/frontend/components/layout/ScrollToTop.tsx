'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    const onDrawer = (e: any) => setDrawerOpen(Boolean(e.detail?.open))
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('carbonx:drawer', onDrawer)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('carbonx:drawer', onDrawer)
    }
  }, [])

  const scrollTop = () => window.scrollTo({ top:0, behavior:'smooth' })

  if (drawerOpen || pathname === '/auth') return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollTop}
          initial={{ opacity:0, scale:0.8 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:0.8 }}
          whileHover={{ scale:1.08 }}
          whileTap={{ scale:0.95 }}
          aria-label="Scroll to top of page"
          className="scroll-to-top-btn fixed bottom-6 left-6 z-[200] w-11 h-11 rounded-full bg-[var(--card)]/90 backdrop-blur-md hover:bg-primary-500 text-[var(--text-muted)] hover:text-white border border-[var(--border)] shadow-xl flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          <ChevronUp className="w-5 h-5"/>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
