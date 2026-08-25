'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Check, Settings } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [show, setShow]       = useState(false)
  const [detail, setDetail]   = useState(false)
  const [prefs, setPrefs]     = useState({ essential: true, analytics: false, marketing: false })

  useEffect(() => {
    const stored = localStorage.getItem('carbonx_cookie_consent')
    if (!stored) setTimeout(() => setShow(true), 1500)
  }, [])

  const accept = (all: boolean) => {
    const consent = all ? { essential: true, analytics: true, marketing: true } : { ...prefs, essential: true }
    localStorage.setItem('carbonx_cookie_consent', JSON.stringify(consent))
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[300]">
          <div className="card border-primary-500/20 p-4 sm:p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4 text-primary-500"/>
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">Cookie Preferences</p>
              </div>
              <button onClick={() => setShow(false)} className="text-[var(--text-muted)] hover:text-[var(--text)] shrink-0">
                <X className="w-4 h-4"/>
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
              We use cookies for authentication and platform analytics. See our{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>.
            </p>

            {detail && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2 mb-3 border-t border-[var(--border)] pt-3">
                {[
                  { key: 'essential', label: 'Essential',  desc: 'Auth cookies, theme preference. Required.', required: true  },
                  { key: 'analytics', label: 'Analytics',  desc: 'Usage patterns to improve the platform.',   required: false },
                  { key: 'marketing', label: 'Marketing',  desc: 'Newsletter and campaign tracking.',          required: false },
                ].map(({ key, label, desc, required }) => (
                  <div key={key} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text)]">{label}{required && ' *'}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
                    </div>
                    <button
                      disabled={required}
                      onClick={() => !required && setPrefs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className={`shrink-0 w-9 h-5 rounded-full transition-colors ${(prefs as any)[key] ? 'bg-primary-500' : 'bg-[var(--border)]'} ${required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${(prefs as any)[key] ? 'translate-x-4' : 'translate-x-0'}`}/>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              <button onClick={() => accept(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors">
                <Check className="w-3.5 h-3.5"/> Accept All
              </button>
              <button onClick={() => detail ? accept(false) : setDetail(true)}
                className="flex-1 border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-[var(--text)] font-medium py-2 px-3 rounded-lg text-xs transition-colors">
                {detail ? 'Save Preferences' : 'Customise'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
