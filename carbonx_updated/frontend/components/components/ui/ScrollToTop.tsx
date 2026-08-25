'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-[150] w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top">
          <ArrowUp className="w-4 h-4"/>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
