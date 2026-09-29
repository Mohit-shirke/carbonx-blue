'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top:0, behavior:'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollTop}
          initial={{ opacity:0, scale:0.8 }}
          animate={{ opacity:1, scale:1 }}
          exit={{ opacity:0, scale:0.8 }}
          whileHover={{ scale:1.1 }}
          whileTap={{ scale:0.95 }}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-4 z-[200] w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg flex items-center justify-center transition-colors">
          <ChevronUp className="w-5 h-5"/>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
