'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Satellite, CheckCircle, XCircle, Clock, Play,
  ChevronDown, AlertTriangle, Loader, FileCheck,
  Download, RefreshCw, Info, Shield, BarChart2
} from 'lucide-react'

const PROJECTS = [
  { id:'p1', name:'Sundarbans Mangrove Reserve', location:'West Bengal, India',    ndvi:0.84, status:'verified',  lastRun:'2025-06-15', validator:'Verra',        area:4262 },
  { id:'p2', name:'Bhitarkanika Coastal Forest', location:'Odisha, India',         ndvi:0.76, status:'verified',  lastRun:'2025-06-12', validator:'CCTS',         area:672  },
  { id:'p3', name:'Pichavaram Mangrove Block',   location:'Tamil Nadu, India',     ndvi:0.71, status:'pending',   lastRun:'2025-06-10', validator:'Gold Standard', area:42   },
  { id:'p4', name:'Godavari Delta Reserve',      location:'Andhra Pradesh, India', ndvi:0.79, status:'verified',  lastRun:'2025-06-08', validator:'Verra',        area:729  },
  { id:'p5', name:'Gulf of Mannar Marine Park',  location:'Tamil Nadu, India',     ndvi:0.65, status:'pending',   lastRun:'2025-06-01', validator:'CCTS',         area:560  },
  { id:'p6', name:'Chilika Lagoon Sanctuary',    location:'Odisha, India',         ndvi:0.68, status:'failed',    lastRun:'2025-05-28', validator:'Gold Standard', area:1165 },
]

const MRV_STEPS = [
  { id:1, label:'Fetching Sentinel-2 imagery',      detail:'Downloading 10m resolution multispectral bands B4 (Red) and B8 (NIR) from Copernicus Open Access Hub…'         },
  { id:2, label:'Preprocessing satellite bands',    detail:'Applying atmospheric correction, cloud masking, and radiometric calibration to raw satellite data…'              },
  { id:3, label:'Computing NDVI index',             detail:'Formula: NDVI = (NIR − Red) / (NIR + Red). Processing 4,262 km² grid at 10m resolution…'                       },
  { id:4, label:'Historical deforestation check',  detail:'Cross-referencing 24-month historical NDVI time-series. Checking for anomalous biomass loss events…'            },
  { id:5, label:'Carbon sequestration estimate',   detail:'Converting NDVI biomass index to tCO₂e using IPCC Tier 2 allometric equations for mangrove ecosystems…'        },
  { id:6, label:'Boundary verification',           detail:'Validating project GPS coordinates against satellite imagery. Checking for encroachment or land-use change…'    },
  { id:7, label:'Cryptographic signature',         detail:'Generating SHA-256 hash of NDVI results. Signing with validator private key for on-chain submission…'           },
  { id:8, label:'On-chain status update',          detail:'Submitting verification proof to CarbonCredit.sol contract on Polygon Amoy. Recording IPFS metadata hash…'     },
]

type RunState = 'idle'|'running'|'done'|'failed'

export default function MRVPage() {
  const [selectedProject, setSelected] = useState(PROJECTS[0])
  const [runState, setRunState]         = useState<RunState>('idle')
  const [currentStep, setCurrentStep]   = useState(0)
  const [stepLogs, setStepLogs]         = useState<string[]>([])
  const [ndviResult, setNdviResult]     = useState<number|null>(null)
  const [expandedStep, setExpandedStep] = useState<number|null>(null)
  const logRef                          = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [stepLogs])

  const runMRV = async () => {
    setRunState('running')
    setCurrentStep(0)
    setStepLogs([])
    setNdviResult(null)

    const logs: string[] = []
    const addLog = (msg: string) => { logs.push(msg); setStepLogs([...logs]) }

    for (let i = 0; i < MRV_STEPS.length; i++) {
      setCurrentStep(i + 1)
      const step = MRV_STEPS[i]
      addLog(`[${new Date().toLocaleTimeString()}] ► ${step.label}…`)

      // Variable delay per step
      const delays = [1800, 1200, 2200, 1500, 1800, 1000, 1400, 1600]
      await new Promise(r => setTimeout(r, delays[i]))

      if (i === 2) {
        const computed = +(selectedProject.ndvi + (Math.random() * 0.04 - 0.02)).toFixed(3)
        setNdviResult(computed)
        addLog(`[${new Date().toLocaleTimeString()}] ✓ NDVI computed: ${computed} — ${computed >= 0.80 ? 'PASS ✅' : 'BELOW THRESHOLD ⚠️'}`)
      } else {
        addLog(`[${new Date().toLocaleTimeString()}] ✓ ${step.label} complete`)
      }
    }

    const passed = (ndviResult ?? selectedProject.ndvi) >= 0.80
    addLog(`[${new Date().toLocaleTimeString()}] ═══ MRV VALIDATION ${passed ? 'PASSED ✅' : 'FAILED ❌'} ═══`)
    setRunState(passed ? 'done' : 'failed')
  }

  const reset = () => { setRunState('idle'); setCurrentStep(0); setStepLogs([]); setNdviResult(null) }

  const STATUS_CFG = {
    verified: { label:'Verified',  icon:CheckCircle, color:'text-primary-500 bg-primary-500/10 border-primary-500/20' },
    pending:  { label:'Pending',   icon:Clock,       color:'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
    failed:   { label:'Failed',    icon:XCircle,     color:'text-red-400     bg-red-500/10     border-red-500/20'     },
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6">

      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Satellite className="w-5 h-5 text-primary-500"/>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">AI Satellite MRV Pipeline</h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Copernicus Sentinel-2 · 10m resolution · Automated NDVI validation</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"/>
          Pipeline online · Last run 2h ago
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div className="card p-4 border-blue-500/20 bg-blue-500/5 flex items-start gap-3"
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}>
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-semibold text-[var(--text)]">How MRV Works</p>
          <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            CarbonX automates the Measurement, Reporting & Verification process using free Copernicus satellite imagery.
            Projects with NDVI ≥ 0.80 are automatically verified and eligible for credit minting.
            This replaces expensive third-party auditors ($50,000–$200,000/project) with a $100–$500 automated pipeline.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Project selector */}
        <motion.div className="card p-4 sm:p-5 lg:col-span-1" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.15}}>
          <h2 className="font-bold text-sm sm:text-base text-[var(--text)] mb-3">Select Project</h2>
          <div className="space-y-2">
            {PROJECTS.map(p => {
              const sc = STATUS_CFG[p.status as keyof typeof STATUS_CFG]
              const SIcon = sc.icon
              return (
                <button key={p.id} onClick={() => { setSelected(p); reset() }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${selectedProject.id===p.id?'border-primary-500 bg-primary-500/5':'border-[var(--border)] hover:border-primary-500/40'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">{p.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{p.location}</p>
                    </div>
                    <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>
                      <SIcon className="w-2.5 h-2.5"/>{sc.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)]">
                    <span>NDVI: <strong className={`${p.ndvi>=0.8?'text-primary-500':p.ndvi>=0.65?'text-amber-500':'text-red-500'}`}>{p.ndvi.toFixed(2)}</strong></span>
                    <span>{p.area.toLocaleString()} km²</span>
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* MRV Terminal */}
        <motion.div className="card p-4 sm:p-5 lg:col-span-2 flex flex-col" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.2}}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[var(--text)]">{selectedProject.name}</h2>
              <p className="text-[10px] text-[var(--text-muted)]">Validator: {selectedProject.validator} · Area: {selectedProject.area.toLocaleString()} km²</p>
            </div>
            <div className="flex items-center gap-2">
              {runState !== 'idle' && (
                <button onClick={reset} className="flex items-center gap-1.5 text-xs border border-[var(--border)] hover:border-primary-500 px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5"/> Reset
                </button>
              )}
              <button onClick={runMRV} disabled={runState==='running'}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm transition-colors">
                {runState==='running' ? <><Loader className="w-4 h-4 animate-spin"/> Running…</> : <><Play className="w-4 h-4"/> Run MRV Pipeline</>}
              </button>
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="space-y-2 mb-4">
            {MRV_STEPS.map((step, i) => {
              const done    = currentStep > step.id
              const active  = currentStep === step.id && runState === 'running'
              const pending = currentStep < step.id
              return (
                <div key={step.id}>
                  <button onClick={() => setExpandedStep(s => s===step.id?null:step.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                      done   ? 'border-primary-500/30 bg-primary-500/5' :
                      active ? 'border-amber-500/30 bg-amber-500/5 animate-pulse' :
                               'border-[var(--border)] opacity-50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      done   ? 'bg-primary-500 text-white' :
                      active ? 'bg-amber-500 text-white' :
                               'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                      {done ? '✓' : step.id}
                    </div>
                    <span className={`text-xs font-medium flex-1 ${done?'text-[var(--text)]':active?'text-amber-400':'text-[var(--text-muted)]'}`}>{step.label}</span>
                    {active && <Loader className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0"/>}
                    {!active && !pending && <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-transform ${expandedStep===step.id?'rotate-180':''}`}/>}
                  </button>
                  {expandedStep===step.id && (
                    <motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}}
                      className="text-[10px] text-[var(--text-muted)] leading-relaxed px-4 py-2 bg-[var(--bg)] rounded-xl mx-1 mt-1">
                      {step.detail}
                    </motion.p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Log terminal */}
          {stepLogs.length > 0 && (
            <div ref={logRef} className="bg-[#0d1117] rounded-xl p-3 font-mono text-[10px] sm:text-xs h-32 overflow-y-auto space-y-0.5 border border-[#30363d]">
              {stepLogs.map((log, i) => (
                <p key={i} className={`${log.includes('PASS')||log.includes('complete') ? 'text-primary-400' : log.includes('FAIL')||log.includes('BELOW') ? 'text-red-400' : 'text-gray-400'}`}>{log}</p>
              ))}
            </div>
          )}

          {/* Result banner */}
          <AnimatePresence>
            {(runState === 'done' || runState === 'failed') && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className={`mt-4 p-4 rounded-xl border ${runState==='done'?'bg-primary-500/10 border-primary-500/30':'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-center gap-3">
                  {runState==='done'
                    ? <CheckCircle className="w-6 h-6 text-primary-500 shrink-0"/>
                    : <XCircle className="w-6 h-6 text-red-400 shrink-0"/>
                  }
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[var(--text)]">
                      {runState==='done' ? '✅ MRV Validation PASSED — Credits Eligible for Minting' : '❌ MRV Validation FAILED — Review Required'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      NDVI Score: <strong className={runState==='done'?'text-primary-500':'text-red-400'}>{ndviResult ?? selectedProject.ndvi}</strong>
                      {runState==='done' ? ' (≥ 0.80 threshold — VERIFIED)' : ' (< 0.80 threshold — FAILED)'}
                    </p>
                  </div>
                  {runState==='done' && (
                    <button className="flex items-center gap-1.5 text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors shrink-0">
                      <Download className="w-3.5 h-3.5"/> Certificate
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* MRV Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label:'Total MRV Runs',       value:'247',     icon:BarChart2,  color:'text-blue-400'    },
          { label:'Verification Rate',    value:'78.5%',   icon:CheckCircle,color:'text-primary-500' },
          { label:'Avg NDVI Score',       value:'0.748',   icon:Satellite,  color:'text-amber-400'   },
          { label:'Cost per Validation',  value:'$127',    icon:Shield,     color:'text-purple-400'  },
        ].map(({ label, value, icon:Icon, color }, i) => (
          <motion.div key={label} className="card p-4" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.07}}>
            <Icon className={`w-4 h-4 ${color} mb-2`}/>
            <p className="text-xl font-black text-[var(--text)]">{value}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
