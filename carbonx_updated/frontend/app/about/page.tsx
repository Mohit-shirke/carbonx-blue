'use client'
import { motion } from 'framer-motion'
import { Leaf, Shield, Satellite, Globe, Users, Zap, Github, Mail, Sparkles, Award, Cpu, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const VALUES = [
  { icon:Satellite, title:'Science-first MRV',    desc:'Every credit backed by ESA Sentinel-2 spectral NDVI indices — not static paperwork.'         },
  { icon:Shield,    title:'Tamper-proof Ledger',  desc:'On-chain ERC-1155 retirement records are immutable and publicly auditable on Polygon forever.'      },
  { icon:Globe,     title:'Blue Carbon Focus',    desc:'Mangroves, seagrass, tidal salt marshes — sequestering up to 10x more CO₂ than terrestrial forests.'         },
  { icon:Users,     title:'Inclusive Consortium', desc:'NGOs, MoEFCC/BEE validators, corporates and academic auditors united in one open standard.'          },
  { icon:Zap,       title:'Automated Telemetry',  desc:'Algorithmic dMRV telemetry eliminates rent-seeking auditors, slashing MRV costs by 90%.'         },
  { icon:Leaf,      title:'Open Architecture',    desc:'Cryptographic proof, smart contracts, and spectral pipelines are fully open-source.'                           },
]

const TEAM = [
  { name:'Dr. Arjun Mehta', role:'Founder & CEO',           avatar:'AM', spec:'Ex-TERI · Coastal Ecologist' },
  { name:'Priya Nair',      role:'Head of MRV Science',     avatar:'PN', spec:'Ph.D. Remote Sensing · ISRO Scholar' },
  { name:'Rahul Sharma',    role:'Lead Blockchain Engineer', avatar:'RS', spec:'Solidity & Polygon PoS Specialist' },
  { name:'Dr. Kavya Reddy', role:'Carbon Market Analyst',   avatar:'KR', spec:'BEE CCTS Advisor · Climate Finance' },
]

const TIMELINE = [
  { year:'2023 Q1', event:'CarbonX founded — pioneering open algorithmic blue carbon protocols for India.' },
  { year:'2023 Q3', event:'Sentinel-2 multi-spectral pipeline validated on Sundarbans delta ground-truth plots.' },
  { year:'2024 Q1', event:'ERC-1155 multi-token smart contract deployed to Polygon Mainnet (Chain ID: 137).' },
  { year:'2024 Q2', event:'Stripe Live fiat + Web3 multi-rail atomic checkout launched for instant settlement.' },
  { year:'2024 Q3', event:'Real-time dMRV pipeline integrated with automated BEE BM FR05.001 additionality scoring.' },
  { year:'2025',    event:'Institutional buyer gateway + ISO 14064 & SEBI BRSR Core corporate compliance engine.' },
]

export default function AboutPage() {
  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
        {/* Hero with BorderBeam */}
        <motion.div 
          className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl p-8 sm:p-12 text-center space-y-5 shadow-2xl overflow-hidden"
          initial={{opacity:0,y:16}} 
          animate={{opacity:1,y:0}}
        >
          <BorderBeam size={300} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Decentralized Blue Carbon MRV Registry
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text)] tracking-tight">
            Building the Sovereign Standard for <span className="bg-gradient-to-r from-primary-400 via-cyan-400 to-primary-500 bg-clip-text text-transparent">Blue Carbon</span>
          </h1>

          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            CarbonX combines ESA Sentinel-2 orbital multi-spectral imaging, automated machine learning, and Polygon PoS blockchain consensus to deliver institutional-grade coastal carbon offsets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/marketplace" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/25 transition-all w-full sm:w-auto text-center">
              Explore Marketplace
            </Link>
            <a href="https://github.com/carbonx" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 bg-[var(--card)] text-[var(--text)] text-sm font-semibold px-6 py-3 rounded-2xl transition-all w-full sm:w-auto">
              <Github className="w-4 h-4 text-primary-500"/> GitHub Repository
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[var(--border)]/70 mt-6 text-left">
            {[
              { label:'Smart Contract', val:'ERC-1155 (Polygon)' },
              { label:'MRV Resolution', val:'10m Sentinel-2' },
              { label:'Audit Standard', val:'BEE BM FR05.001' },
              { label:'Double-Count Defense', val:'Cryptographic Nonce' },
            ].map((m, i) => (
              <div key={i} className="p-3 rounded-xl bg-[var(--bg)]/80 border border-[var(--border)]">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{m.label}</p>
                <p className="text-xs font-bold font-mono text-primary-400 mt-0.5">{m.val}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mission Statement */}
        <SpotlightCard className="p-6 sm:p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-3 flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-primary-500" /> Scientific & Ecological Mission
          </h2>
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            To create an <strong className="text-[var(--text)]">immutable, satellite-verified, blockchain-backed registry</strong> for blue carbon credits that eliminates greenwashing, reduces MRV overhead by 90%, and channels direct sovereign capital into protecting India's critical coastal wetlands.
          </p>
        </SpotlightCard>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">Core Architectural Pillars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(({icon:Icon,title,desc},i)=>(
              <SpotlightCard key={title} className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary-500"/>
                </div>
                <h3 className="font-bold text-sm text-[var(--text)] mb-1.5">{title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">Protocol Milestones</h2>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-cyan-500/30 to-transparent"/>
            <div className="space-y-6">
              {TIMELINE.map((m,i)=>(
                <motion.div key={m.year} initial={{opacity:0,x:i%2===0?-16:16}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.07}}
                  className={`relative flex items-start gap-4 sm:gap-0 ${i%2===0?'sm:flex-row':'sm:flex-row-reverse'}`}>
                  <div className="absolute left-4 sm:left-1/2 w-3.5 h-3.5 rounded-full bg-primary-500 border-2 border-[var(--bg)] shadow-md shadow-primary-500/50 -translate-x-1.5 mt-1.5"/>
                  <div className={`pl-10 sm:pl-0 sm:w-1/2 ${i%2===0?'sm:pr-8 sm:text-right':'sm:pl-8'}`}>
                    <span className="text-xs font-bold font-mono text-primary-400 bg-primary-500/10 px-2.5 py-0.5 rounded-full border border-primary-500/20">{m.year}</span>
                    <p className="text-sm text-[var(--text)] mt-1.5 leading-snug">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6 text-center">Leadership & Science Advisory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map(({name,role,avatar,spec},i)=>(
              <SpotlightCard key={name} className="p-5 text-center bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400/20 to-cyan-500/30 border border-primary-500/30 flex items-center justify-center mx-auto mb-3 shadow-md shadow-primary-500/10">
                  <span className="text-primary-400 font-bold text-base font-mono">{avatar}</span>
                </div>
                <p className="font-bold text-sm text-[var(--text)]">{name}</p>
                <p className="text-xs text-primary-500 font-medium mt-0.5">{role}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">{spec}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>

        {/* CTA with BorderBeam */}
        <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center space-y-4 shadow-2xl overflow-hidden">
          <BorderBeam size={260} duration={8} colorFrom="#06B6D4" colorTo="#10B981" borderWidth={1.5} />
          <h2 className="text-xl font-bold text-[var(--text)]">Participate in India's Blue Carbon Future</h2>
          <p className="text-[var(--text-muted)] text-sm max-w-xl mx-auto">CarbonX is an open consortium. We welcome NGOs, verified audit bodies (VVBs), corporate buyers, and independent research fellows.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all w-full sm:w-auto text-center">Create Stakeholder Account</Link>
            <Link href="/contact" className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] text-sm font-semibold px-6 py-2.5 rounded-xl transition-all w-full sm:w-auto">
              <Mail className="w-4 h-4 text-primary-500"/> Contact Our Science Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
