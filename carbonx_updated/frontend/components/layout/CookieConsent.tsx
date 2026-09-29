'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Shield } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('carbonx-cookies')
      if (!accepted) setTimeout(() => setVisible(true), 2000)
    } catch {}
  }, [])

  const accept = () => {
    try { localStorage.setItem('carbonx-cookies', 'accepted') } catch {}
    setVisible(false)
  }

  const decline = () => {
    try { localStorage.setItem('carbonx-cookies', 'declined') } catch {}
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity:0, y:80 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:80 }}
          transition={{ type:'spring', stiffness:300, damping:30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[300]">
          <div className="card p-4 border-primary-500/20 bg-[var(--card)] shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Cookie className="w-4 h-4 text-primary-500 shrink-0"/>
                <p className="text-sm font-bold text-[var(--text)]">Cookie Notice</p>
              </div>
              <button onClick={decline} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              We use essential cookies to keep you signed in and improve your experience.
              No tracking or advertising cookies.
            </p>
            <div className="flex gap-2">
              <button onClick={accept}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                Accept
              </button>
              <button onClick={decline}
                className="flex-1 border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-[var(--text)] text-xs font-semibold py-2 rounded-xl transition-colors">
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
