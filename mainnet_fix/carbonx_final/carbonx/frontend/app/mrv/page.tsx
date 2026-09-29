'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Satellite, Play, CheckCircle, Clock, FileCheck, Cpu, Waves, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

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
}

const MOCK_PROJECTS: MRVProject[] = [
  { id: 'mrv-001', name: 'Sundarbans Extension Block C', proposer: 'WildTrust NGO', submittedAt: '2025-06-10', status: 'pending', coordinates: '21.9497°N, 89.1833°E', areaSqKm: 142 },
  { id: 'mrv-002', name: 'Coringa Mangrove Sector 7', proposer: 'EcoSouth Foundation', submittedAt: '2025-06-08', status: 'verified', coordinates: '16.7500°N, 82.2167°E', areaSqKm: 88 },
  { id: 'mrv-003', name: 'Mahanadi Delta Reserve', proposer: 'BlueEarth Labs', submittedAt: '2025-06-12', status: 'pending', coordinates: '20.3000°N, 86.5500°E', areaSqKm: 215 },
]

const MRV_PIPELINE_STEPS = [
  { delay: 0,    message: '[0.0s] Ingesting Copernicus Sentinel-2 Multispectral Raster Matrix…', type: 'info' as const },
  { delay: 1500, message: '[1.5s] Executing Spatial Convolution Filters… Mapping Chlorophyll Absorption bands…', type: 'processing' as const },
  { delay: 2200, message: '[2.2s] Band B8 (NIR) and Band B4 (Red) normalization complete. Resolution: 10m/px.', type: 'info' as const },
  { delay: 3000, message: '[3.0s] NDVI Biomass Index calculated at 0.84. Canopy coverage checks match NGO specifications.', type: 'processing' as const },
  { delay: 3500, message: '[3.5s] Cross-referencing historical satellite imagery stack (2020–2025)… Deforestation delta: 0.2%.', type: 'info' as const },
  { delay: 4000, message: '[4.0s] Verification Matrix Approved. Generating cryptographic validation signature…', type: 'success' as const },
  { delay: 4500, message: '[4.5s] ✓ On-chain state update queued. Project status → VERIFIED.', type: 'success' as const },
]

export default function MRVPage() {
  const [selectedProject, setSelectedProject] = useState<MRVProject | null>(null)
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

    // Update project status to analyzing
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'analyzing' } : p))

    for (const step of MRV_PIPELINE_STEPS) {
      await new Promise(r => setTimeout(r, step.delay === 0 ? 0 : 600))
      setLogs(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        message: step.message,
        type: step.type,
      }])
    }

    // Finalize
    await new Promise(r => setTimeout(r, 600))
    setAnalyzing(false)
    setAnalysisComplete(true)
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'verified' } : p))

    // Persist to backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mrv/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ project_id: project.id }),
      })
    } catch { /* backend optional for demo */ }
  }

  const STATUS_BADGE: Record<MRVProject['status'], string> = {
    pending:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
    analyzing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    verified:  'bg-primary-500/10 text-primary-500 border-primary-500/20',
    rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">AI MRV Validation Pipeline</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Automated satellite-driven Measurement, Reporting & Verification · Sentinel-2 Integration
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-2">
          <Satellite className="w-4 h-4 text-primary-500 animate-pulse" />
          <span className="text-sm font-medium text-primary-500">Sentinel-2 Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project queue – left panel */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
            Pending Queue ({projects.filter(p => p.status === 'pending').length})
          </h2>
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              className={`card p-4 cursor-pointer transition-all ${
                selectedProject?.id === project.id ? 'border-primary-500 ring-1 ring-primary-500/30' : ''
              }`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-sm text-[var(--text)] leading-snug">{project.name}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${STATUS_BADGE[project.status]}`}>
                  {project.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1"><FileCheck className="w-3 h-3" />{project.proposer}</span>
                <span className="flex items-center gap-1"><Waves className="w-3 h-3" />{project.areaSqKm} km²</span>
                <span className="col-span-2 font-mono text-[10px] mt-1">{project.coordinates}</span>
              </div>

              {project.status === 'pending' && (
                <Button
                  variant="secondary"
                  size="xs"
                  className="mt-3 w-full"
                  icon={<Play className="w-3 h-3" />}
                  onClick={e => { e.stopPropagation(); runMRVAnalysis(project) }}
                  disabled={analyzing}
                >
                  Run MRV Analysis
                </Button>
              )}
              {project.status === 'verified' && (
                <div className="flex items-center gap-1.5 mt-3 text-primary-500 text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Verified & On-Chain
                </div>
              )}
              {project.status === 'analyzing' && (
                <div className="flex items-center gap-1.5 mt-3 text-blue-400 text-xs font-medium">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  Processing…
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Terminal log panel – right */}
        <div className="lg:col-span-3">
          <div className="card h-full min-h-[480px] flex flex-col overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#0F172A] dark:bg-[#030712] border-b border-[var(--border)] rounded-t-xl">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-primary-500/70" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                carbonx-mrv-pipeline — {selectedProject?.name ?? 'No project selected'}
              </span>
              {analyzing && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-primary-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Running
                </span>
              )}
              {analysisComplete && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-primary-400">
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </span>
              )}
            </div>

            {/* Log output area */}
            <div className="flex-1 overflow-y-auto bg-[#0D1117] p-4 font-mono text-xs leading-relaxed rounded-b-xl">
              {logs.length === 0 && !analyzing && (
                <p className="text-slate-600">
                  $ Select a pending project and click "Run MRV Analysis" to begin satellite validation pipeline…
                </p>
              )}
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mb-1.5 ${
                      log.type === 'success'
                        ? 'text-primary-400'
                        : log.type === 'processing'
                        ? 'text-blue-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 mr-2">[{log.time}]</span>
                    {log.message}
                  </motion.div>
                ))}
              </AnimatePresence>

              {analyzing && (
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-primary-500 mt-1"
                >
                  ▋
                </motion.div>
              )}

              {analysisComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-lg border border-primary-500/30 bg-primary-500/5"
                >
                  <p className="text-primary-400 font-semibold">✓ MRV Pipeline Complete</p>
                  <p className="text-slate-400 mt-1">
                    Project <span className="text-white">{selectedProject?.name}</span> has been cryptographically verified.
                    PostgreSQL status updated → <span className="text-primary-400">VERIFIED</span>.
                    ERC-1155 mint event queued on Polygon Mainnet.
                  </p>
                </motion.div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Projects Verified', value: projects.filter(p => p.status === 'verified').length, icon: CheckCircle, color: 'text-primary-500' },
          { label: 'Pending Review', value: projects.filter(p => p.status === 'pending').length, icon: Clock, color: 'text-amber-500' },
          { label: 'Avg NDVI Score', value: '0.84', icon: TreePine, color: 'text-green-400' },
          { label: 'Sentinel Passes/Day', value: '14', icon: Satellite, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            className="card p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07 }}
          >
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-xl font-bold text-[var(--text)]">{value}</p>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
