'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, Leaf, Globe, Zap, RefreshCw } from 'lucide-react'
import { MangroveMap } from '@/components/dashboard/MangroveMap'
import { TransactionTicker } from '@/components/dashboard/TransactionTicker'

const KPI_CARDS = [
  { label: 'Total Credits Issued', value: '89,320', unit: 'tCO₂e', icon: Leaf, delta: '+12.4%', color: 'text-primary-500' },
  { label: 'Credits Retired', value: '24,500', unit: 'tCO₂e', icon: Zap, delta: '+8.1%', color: 'text-blue-400' },
  { label: 'Active Projects', value: '142', unit: 'projects', icon: Globe, delta: '+3', color: 'text-amber-400' },
  { label: 'Avg NDVI Index', value: '0.84', unit: 'score', icon: Activity, delta: '+0.03', color: 'text-purple-400' },
]

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Environmental Dashboard</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Real-time blue carbon registry analytics · Polygon Amoy Testnet
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="card p-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.015, boxShadow: '0px 0px 8px rgba(52, 211, 153, 0.4)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-current/10 flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                {kpi.delta}
              </span>
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{kpi.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{kpi.label} <span className="opacity-60">({kpi.unit})</span></p>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Geospatial map – takes 2/3 */}
        <div className="xl:col-span-2">
          <MangroveMap />
        </div>
        {/* Transaction ticker – 1/3 */}
        <div className="xl:col-span-1">
          <TransactionTicker />
        </div>
      </div>
    </div>
  )
}
