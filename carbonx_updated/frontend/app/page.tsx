'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Leaf, Shield, Satellite, Zap, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  { icon: Satellite, title: 'AI Satellite MRV', desc: 'Automated Sentinel-2 multispectral validation with NDVI biomass indexing.' },
  { icon: Shield, title: 'Verra & CCTS Certified', desc: 'All projects carry internationally recognized third-party validator badges.' },
  { icon: Zap, title: 'ERC-1155 On-Chain', desc: 'Carbon credits minted as fungible tokens on Polygon Amoy for transparent trading.' },
  { icon: Globe, title: 'Blue Carbon Focus', desc: 'Targeting mangroves, seagrasses and coastal wetlands — the ocean\'s carbon sinks.' },
  { icon: Lock, title: 'Immutable Retirements', desc: 'Every offset burns tokens to address(0) creating a permanent on-chain certificate.' },
  { icon: Leaf, title: 'Multi-Role Platform', desc: 'NGOs, validators, corporates and academics all participate in one unified registry.' },
]

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <section className="py-24 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-500 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
            Live on Polygon Amoy Testnet
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight">
            The Open Blue Carbon{' '}
            <span className="text-primary-500">Registry</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mt-4 leading-relaxed">
            Blockchain-verified carbon credit issuance, AI satellite MRV validation, and transparent
            on-chain retirement — all in one open-source platform.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Link href="/marketplace">
            <Button variant="primary" size="lg" iconRight={<ArrowRight className="w-4 h-4" />}>
              Explore Marketplace
            </Button>
          </Link>
          <Link href="/auth">
            <Button variant="outline" size="lg">
              Create Account
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              whileHover={{ scale: 1.015, boxShadow: '0px 0px 8px rgba(52, 211, 153, 0.4)' }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-[var(--text)] mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
