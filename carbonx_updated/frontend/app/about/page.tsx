'use client'
import { motion } from 'framer-motion'
import { Leaf, Shield, Satellite, Globe, Users, Zap, Github, Mail } from 'lucide-react'
import Link from 'next/link'

const VALUES = [
  { icon:Satellite, title:'Science-first',    desc:'Every credit backed by satellite-verified NDVI data — not paperwork.'         },
  { icon:Shield,    title:'Tamper-proof',      desc:'On-chain retirement records are immutable and publicly auditable forever.'      },
  { icon:Globe,     title:'Blue carbon focus', desc:'Mangroves, seagrass, wetlands — most efficient carbon sinks on Earth.'         },
  { icon:Users,     title:'Inclusive',         desc:'NGOs, governments, corporates and academics all in one open registry.'          },
  { icon:Zap,       title:'Automated',         desc:'AI-driven MRV replaces expensive auditors with satellite intelligence.'         },
  { icon:Leaf,      title:'Open source',       desc:'Transparent code, transparent carbon. MIT licensed.'                           },
]
const TEAM = [
  { name:'Dr. Arjun Mehta', role:'Founder & CEO',           avatar:'AM', bg:'bg-primary-500' },
  { name:'Priya Nair',      role:'Head of MRV Science',     avatar:'PN', bg:'bg-blue-500'    },
  { name:'Rahul Sharma',    role:'Lead Blockchain Engineer', avatar:'RS', bg:'bg-purple-500'  },
  { name:'Dr. Kavya Reddy', role:'Carbon Market Analyst',   avatar:'KR', bg:'bg-amber-500'   },
]
const TIMELINE = [
  { year:'2023 Q1', event:'CarbonX founded — targeting India\'s blue carbon ecosystems'      },
  { year:'2023 Q3', event:'First Sentinel-2 MRV pipeline validated on Sundarbans data'       },
  { year:'2024 Q1', event:'ERC-1155 smart contract deployed to Polygon Amoy testnet'         },
  { year:'2024 Q2', event:'Stripe + Web3 dual-payment checkout launched'                     },
  { year:'2024 Q3', event:'Mira AI assistant integrated — 30+ carbon credit intents'         },
  { year:'2025',    event:'Polygon mainnet deployment + institutional buyer onboarding'       },
]

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero */}
      <motion.div className="text-center space-y-4" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center mx-auto">
          <Leaf className="w-7 h-7 text-white"/>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)]">About CarbonX</h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          CarbonX is an open-source blockchain registry for blue carbon credits — built to make coastal ecosystem conservation transparent, verifiable, and accessible to everyone.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/marketplace" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto text-center">Explore Marketplace</Link>
          <a href="https://github.com/carbonx" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text-muted)] hover:text-primary-500 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto">
            <Github className="w-4 h-4"/> GitHub
          </a>
        </div>
      </motion.div>

      {/* Mission */}
      <motion.div className="card p-6 sm:p-8 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-3">Our Mission</h2>
        <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
          To create a <strong className="text-[var(--text)]">tamper-proof, satellite-verified, blockchain-backed registry</strong> for blue carbon credits that eliminates greenwashing, reduces MRV cost by 90%, and channels real capital into protecting India's coastal wetlands.
        </p>
      </motion.div>

      {/* Values */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VALUES.map(({icon:Icon,title,desc},i)=>(
            <motion.div key={title} className="card p-4 sm:p-5"
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.07}}>
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary-500"/>
              </div>
              <h3 className="font-semibold text-sm text-[var(--text)] mb-1">{title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-6 text-center">Our Journey</h2>
        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-[var(--border)]"/>
          <div className="space-y-6">
            {TIMELINE.map((m,i)=>(
              <motion.div key={m.year} initial={{opacity:0,x:i%2===0?-16:16}} animate={{opacity:1,x:0}} transition={{delay:0.1+i*0.07}}
                className={`relative flex items-start gap-4 sm:gap-0 ${i%2===0?'sm:flex-row':'sm:flex-row-reverse'}`}>
                <div className="absolute left-4 sm:left-1/2 w-3 h-3 rounded-full bg-primary-500 border-2 border-[var(--bg)] -translate-x-1.5 mt-1.5"/>
                <div className={`pl-10 sm:pl-0 sm:w-1/2 ${i%2===0?'sm:pr-8 sm:text-right':'sm:pl-8'}`}>
                  <span className="text-xs font-bold text-primary-500">{m.year}</span>
                  <p className="text-sm text-[var(--text)] mt-0.5 leading-snug">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-6 text-center">Core Team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEAM.map(({name,role,avatar,bg},i)=>(
            <motion.div key={name} className="card p-4 text-center"
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.07}}>
              <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
                <span className="text-white font-bold text-sm">{avatar}</span>
              </div>
              <p className="font-semibold text-xs sm:text-sm text-[var(--text)]">{name}</p>
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-0.5">{role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div className="card p-6 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
        <h2 className="text-lg font-bold text-[var(--text)] mb-2">Want to contribute?</h2>
        <p className="text-[var(--text-muted)] text-sm mb-4">CarbonX is open source. We welcome NGOs, validators, developers, and researchers.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto text-center">Create Account</Link>
          <Link href="/contact" className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors w-full sm:w-auto">
            <Mail className="w-4 h-4"/> Contact Us
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
