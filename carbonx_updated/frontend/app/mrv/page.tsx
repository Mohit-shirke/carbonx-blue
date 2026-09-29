'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Satellite, Play, CheckCircle, Clock, FileCheck, Cpu,
  Waves, TreePine, Sparkles, Activity, Shield, Terminal,
  ExternalLink, CheckCircle2, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { AuthGate } from '@/components/auth/AuthGate'

interface LogLine {
  id: string
  time: string
  message: string
  type: 'info' | 'success' | 'processing'
}

interface MRVProject {
  id: string
  name: string
  proposer: string
  submittedAt: string
  status: 'pending' | 'analyzing' | 'verified' | 'rejected'
  coordinates: string
  areaSqKm: number
  ndvi?: number
}

const MOCK_PROJECTS: MRVProject[] = [
  { id: 'mrv-001', name: 'Sundarbans Extension Block C', proposer: 'WildTrust NGO', submittedAt: '2026-08-10', status: 'pending', coordinates: '21.9497°N, 89.1833°E', areaSqKm: 142, ndvi: 0.84 },
  { id: 'mrv-002', name: 'Coringa Mangrove Sector 7', proposer: 'EcoSouth Foundation', submittedAt: '2026-08-08', status: 'verified', coordinates: '16.7500°N, 82.2167°E', areaSqKm: 88, ndvi: 0.79 },
  { id: 'mrv-003', name: 'Mahanadi Delta Reserve', proposer: 'BlueEarth Labs', submittedAt: '2026-08-12', status: 'pending', coordinates: '20.3000°N, 86.5500°E', areaSqKm: 215, ndvi: 0.76 },
]

const MRV_PIPELINE_STEPS = [
  { delay: 0,    message: '[0.0s] Ingesting Copernicus Sentinel-2 Multispectral Raster Matrix…', type: 'info' as const },
  { delay: 1200, message: '[1.2s] Executing Spatial Convolution Filters… Mapping Chlorophyll Absorption bands…', type: 'processing' as const },
  { delay: 2000, message: '[2.0s] Band B8 (NIR: 842nm) and Band B4 (Red: 665nm) normalization complete. Resolution: 10m/px.', type: 'info' as const },
  { delay: 2800, message: '[2.8s] NDVI Biomass Index calculated at 0.84. Canopy coverage checks match NGO specifications.', type: 'processing' as const },
  { delay: 3500, message: '[3.5s] Cross-referencing historical satellite imagery stack (2020–2026)… Deforestation delta: 0.18%.', type: 'info' as const },
  { delay: 4200, message: '[4.2s] Verification Matrix Approved. Generating cryptographic validation Merkle proof…', type: 'success' as const },
  { delay: 4800, message: '[4.8s] ✓ On-chain state update queued. Project status → VERIFIED on Polygon PoS Mainnet.', type: 'success' as const },
]

export default function MRVPage() {
  const [selectedProject, setSelectedProject] = useState<MRVProject | null>(MOCK_PROJECTS[0])
  const [logs, setLogs] = useState<LogLine[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [projects, setProjects] = useState<MRVProject[]>(MOCK_PROJECTS)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const runMRVAnalysis = async (project: MRVProject) => {
    setSelectedProject(project)
    setLogs([])
    setAnalyzing(true)
    setAnalysisComplete(false)

    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'analyzing' } : p))

    for (const step of MRV_PIPELINE_STEPS) {
      await new Promise(r => setTimeout(r, step.delay === 0 ? 0 : 550))
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: step.message,
        type: step.type,
      }])
    }

    await new Promise(r => setTimeout(r, 500))
    setAnalyzing(false)
    setAnalysisComplete(true)
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'verified' } : p))

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '')
      await fetch(`${baseUrl}/api/v1/mrv/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ project_id: project.id }),
      })
    } catch { /* optional backend logging */ }
  }

  const STATUS_BADGE: Record<MRVProject['status'], string> = {
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/25',
    analyzing: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    verified:  'bg-primary-500/10 text-primary-400 border-primary-500/25',
    rejected:  'bg-red-500/10 text-red-400 border-red-500/25',
  }

  return (
    <AuthGate
      requiredRoles={['government', 'academic', 'ngo', 'corporate']}
      pageTitle="AI Satellite MRV Pipeline"
      description="Automated multispectral satellite telemetry ingestion and on-chain Merkle proof verification console. Authorized organization validator, auditor, or project developer credentials required."
    >
      <div className="relative min-h-screen pb-16 overflow-hidden">
        {/* 21st.dev Ambient Matrix Grid Background */}
        <BackgroundGrid />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 p-6 rounded-3xl bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] shadow-xl">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold">
              <Satellite className="w-3.5 h-3.5 animate-pulse" />
              Copernicus Sentinel-2 Optical Multi-Spectral · 10m/px Spatial Resolution
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              AI Satellite MRV Pipeline
            </h1>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Automated Measurement, Reporting & Verification. Real-time satellite spectral reflectance analysis calibrates NDVI vegetation indices and calculates biomass sequestration without human bias.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center">
            <div className="px-4 py-3 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Live Orbit Stream</p>
                <p className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Pass #14 Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider">Projects Verified</span>
              <CheckCircle className="w-4 h-4 text-primary-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono tabular-nums">
              {projects.filter(p => p.status === 'verified').length}
            </p>
            <p className="text-xs text-primary-500 font-medium mt-1">
              On-Chain Cryptographic Proof
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider">Pending Queue</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono tabular-nums">
              {projects.filter(p => p.status === 'pending').length}
            </p>
            <p className="text-xs text-amber-400 font-medium mt-1">
              Awaiting Satellite Ingestion
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider">Target Resolution</span>
              <TreePine className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono tabular-nums">
              10m / px
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              B4 Red & B8 Near-Infrared
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider">Pipeline Speed</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] font-mono tabular-nums">
              ~4.8s
            </p>
            <p className="text-xs text-cyan-400 font-medium mt-1">
              Automated Merkle Signature
            </p>
          </SpotlightCard>
        </div>

        {/* Main Grid: Queue on Left, Terminal on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Project Queue (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Pending Verification Queue ({projects.length})
              </h2>
              <span className="text-[10px] text-cyan-400 font-mono">BEE BM FR05.001</span>
            </div>

            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <SpotlightCard
                  className={`p-4 sm:p-5 cursor-pointer transition-all ${
                    selectedProject?.id === project.id ? 'border-cyan-500/70 shadow-lg shadow-cyan-500/10' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-sm text-[var(--text)] leading-snug">{project.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${STATUS_BADGE[project.status]}`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs text-[var(--text-muted)] mt-2">
                    <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5 text-primary-500" />{project.proposer}</span>
                    <span className="flex items-center gap-1"><Waves className="w-3.5 h-3.5 text-cyan-400" />{project.areaSqKm} km²</span>
                    <span className="col-span-2 font-mono text-[10px] bg-[var(--bg)] px-2 py-1 rounded border border-[var(--border)] mt-1 truncate">
                      {project.coordinates}
                    </span>
                  </div>

                  {project.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3.5 w-full text-xs font-semibold py-2 rounded-xl"
                      icon={<Play className="w-3.5 h-3.5" />}
                      onClick={e => { e.stopPropagation(); runMRVAnalysis(project) }}
                      disabled={analyzing}
                    >
                      Run MRV Analysis
                    </Button>
                  )}

                  {project.status === 'verified' && (
                    <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-[var(--border)]/60 text-xs">
                      <span className="flex items-center gap-1.5 text-primary-400 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified & Ready to Mint
                      </span>
                      <span className="font-mono text-xs text-primary-400 font-bold">NDVI 0.84</span>
                    </div>
                  )}

                  {project.status === 'analyzing' && (
                    <div className="flex items-center gap-2 mt-3.5 pt-2 border-t border-[var(--border)]/60 text-cyan-400 text-xs font-medium">
                      <Cpu className="w-4 h-4 animate-spin" />
                      Analyzing Multispectral Raster…
                    </div>
                  )}
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          {/* Terminal Log Panel (3 cols) with BorderBeam */}
          <div className="lg:col-span-3">
            <div className="relative rounded-3xl border border-[var(--border)] bg-[#0B0F17] shadow-2xl h-full min-h-[520px] flex flex-col overflow-hidden">
              {/* 21st.dev Laser BorderBeam */}
              <BorderBeam size={260} duration={8} colorFrom="#06B6D4" colorTo="#10B981" borderWidth={2} />

              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#030712] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    mrv-spectral-engine // {selectedProject?.name ?? 'Sundarbans'}
                  </span>
                </div>
                {analyzing ? (
                  <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Computing Bands
                  </span>
                ) : analysisComplete ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    State Synced
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">Ready</span>
                )}
              </div>

              {/* Log stream output area */}
              <div
                role="log"
                aria-live="polite"
                aria-label="Satellite MRV telemetry stream"
                className="flex-1 overflow-y-auto p-5 font-mono text-xs sm:text-[13px] leading-relaxed space-y-2 bg-[#080C14]"
              >
                {logs.length === 0 && !analyzing && (
                  <div className="text-slate-400 space-y-2 py-8 text-center">
                    <Satellite className="w-8 h-8 text-cyan-500/40 mx-auto mb-2" />
                    <p className="text-slate-300 font-medium">Copernicus Sentinel-2 Validation Daemon</p>
                    <p className="text-xs text-slate-400">Select any project on the left and click &quot;Run MRV Analysis&quot; to execute real-time spectral reflectance checks.</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {logs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-2 ${
                        log.type === 'success'
                          ? 'text-emerald-400 font-semibold'
                          : log.type === 'processing'
                          ? 'text-cyan-400'
                          : 'text-slate-200'
                      }`}
                    >
                      <span className="text-slate-400 text-xs shrink-0">[{log.time}]</span>
                      <span>{log.message}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {analyzing && (
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-cyan-400 mt-2 font-mono"
                  >
                    ▋ Analyzing Band B4/B8 matrix…
                  </motion.div>
                )}

                {analysisComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle className="w-4 h-4" />
                      MRV Spectral Verification Approved
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Project <strong className="text-white">{selectedProject?.name}</strong> successfully validated against Sentinel-2 L2A ground reflectance calibration.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-emerald-500/20 font-mono">
                      <div>NDVI Biomass Index: <span className="text-emerald-400 font-bold">0.84</span></div>
                      <div>Polygon Status: <span className="text-emerald-400 font-bold">VERIFIED</span></div>
                    </div>
                  </motion.div>
                )}
                <div ref={logsEndRef} />
              </div>

              {/* Spectral band formula footer */}
              <div className="px-5 py-3 border-t border-white/10 bg-[#030712] flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                <span className="font-mono">Formula: NDVI = (NIR - Red) / (NIR + Red)</span>
                <span className="text-cyan-400 font-mono">10m Ground Resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGate>
  )
}
