'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('CarbonX Error:', error) }, [error])
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[var(--bg)] px-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400"/>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Something went wrong</h1>
        <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
            <RefreshCw className="w-4 h-4"/> Try Again
          </button>
          <Link href="/" className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Home className="w-4 h-4"/> Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
