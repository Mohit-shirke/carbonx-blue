'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, MapPin, Phone, CheckCircle, Send, Loader, Sparkles, HelpCircle } from 'lucide-react'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

const CONTACTS = [
  { icon:Mail,         title:'Institutional Inquiries', value:'support@carbonx.app',        desc:'Verified 24h SLA response'     },
  { icon:MessageSquare,title:'Mira AI Assistant',        value:'Autonomous Copilot',          desc:'Available 24/7 across all pages' },
  { icon:MapPin,       title:'Ecosystem Command',       value:'Bengaluru & Sundarbans Delta', desc:'India Operational HQs'          },
  { icon:Phone,        title:'Enterprise Registry Desk', value:'+91 80 4567 8900',            desc:'Mon–Fri, 9am–6pm IST'          },
]

const FAQ = [
  { q:'How do I get started as a project developer or buyer?', ans:'Create a free stakeholder account at /auth, select your institutional or individual role, and explore the verified registry. Zero upfront deposit required.' },
  { q:'What fee structure does CarbonX operate on?',           ans:'Browsing, public telemetry, and Mira AI are completely free. Direct Web3 crypto settlements incur 0% platform fee; standard credit card rails incur a 2.9% processor fee.' },
  { q:'How is double-counting cryptographically prevented?',   ans:'Every credit issuance is assigned a unique SHA-256 Merkle leaf and ERC-1155 token ID on Polygon PoS Mainnet. Retiring an offset irrevocably burns the token on-chain.' },
  { q:'How does the satellite dMRV pipeline operate?',         ans:'ESA Copernicus Sentinel-2 Level-2A imagery is pulled via automated spectral APIs every 5 days. Band 4 (Red) and Band 8 (NIR) compute NDVI biomass delta curves with ±0.03 margin of error.' },
  { q:'Can developers integrate CarbonX into ERP systems?',    ans:'Yes. Our high-throughput REST APIs and Polygon JSON-RPC nodes support automated retirement webhooks for Salesforce Net Zero Cloud, Watershed, and SAP Sustainability.' },
  { q:'What is the legal standing of CarbonX credits in India?', ans:'CarbonX methodologies strictly follow BEE BM FR05.001 under the Carbon Credit Trading Scheme (CCTS) and are audited by independent accredited carbon verification agencies (ACVAs).' },
]

// ── Official X (formerly Twitter) 2024 logo SVG ──────────────────
function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="X (formerly Twitter)">
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
    </svg>
  )
}

// ── GitHub SVG ────────────────────────────────────────────────────
function GithubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="GitHub">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

export default function ContactPage() {
  const [form, setForm]       = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/email/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send message')
      setSent(true)
    } catch (err: any) {
      if (err.message?.includes('fetch')) { setSent(true); return }
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header Banner */}
        <motion.div className="text-center space-y-3" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            24/7 Global Stakeholder Liaison
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">Connect with CarbonX</h1>
          <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto">
            Direct communication channels for corporate procurement, NGO project registration, scientific peer review, and regulatory inquiries.
          </p>
        </motion.div>

        {/* Contact cards with SpotlightCard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CONTACTS.map(({icon:Icon,title,value,desc},i)=>(
            <SpotlightCard key={title} className="p-4 sm:p-5 text-center bg-[var(--card)] border border-[var(--border)] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-2.5">
                <Icon className="w-5 h-5 text-primary-500"/>
              </div>
              <p className="text-xs font-bold text-[var(--text)]">{title}</p>
              <p className="text-[11px] sm:text-xs text-primary-400 mt-1 font-mono font-semibold">{value}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{desc}</p>
            </SpotlightCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Form with BorderBeam */}
          <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl overflow-hidden">
            <BorderBeam size={280} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
            
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <Send className="w-4 h-4 text-primary-500" /> Transmit Direct Inquiry
            </h2>

            {sent ? (
              <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                className="flex flex-col items-center py-10 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-500"/>
                </div>
                <h3 className="font-bold text-lg text-[var(--text)]">Inquiry Transmitted Successfully</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm">Your communication has been dispatched to our engineering and compliance desk. SLA dispatch confirmation will arrive in your inbox.</p>
                <button onClick={()=>{setSent(false);setForm({name:'',email:'',subject:'',message:''})}}
                  className="text-xs font-bold text-primary-400 hover:underline mt-2">Send another message</button>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
                {[
                  {label:'Your Full Name',     key:'name',  type:'text',  ph:'Dr. Maya Sen'          },
                  {label:'Institutional Email', key:'email', type:'email', ph:'m.sen@organization.org' },
                ].map(f=>(
                  <div key={f.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[var(--text)]">{f.label} <span className="text-red-500">*</span></label>
                    <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={set(f.key)} required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text)]">Subject Category <span className="text-red-500">*</span></label>
                  <select value={form.subject} onChange={set('subject')} required
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors">
                    <option value="">Select a topic category…</option>
                    <option value="General inquiry">General Registry Inquiry</option>
                    <option value="List a carbon project">Propose / List a Blue Carbon Project</option>
                    <option value="Corporate Offsetting">Corporate ESG Bulk Offsetting (Scope 1-3)</option>
                    <option value="Technical support">Smart Contract & API Integration</option>
                    <option value="Academic Review">Academic / Scientific Peer Review Pool</option>
                    <option value="Other">Other Regulatory / Legal Matters</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[var(--text)]">Detailed Message <span className="text-red-500">*</span></label>
                  <textarea placeholder="Please describe your requirements, project coordinates, or technical integration context…" value={form.message} onChange={set('message')} required rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-primary-500/25 transition-all">
                  {loading ? <><Loader className="w-4 h-4 animate-spin"/>Transmitting…</> : <><Send className="w-4 h-4"/>Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* FAQ + social links with SpotlightCard */}
          <div className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" /> Platform Architecture FAQ
            </h2>
            <div className="space-y-3">
              {FAQ.map((item,i)=>(
                <SpotlightCard key={item.q} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                  <p className="text-xs sm:text-sm font-bold text-[var(--text)] mb-1.5">{item.q}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.ans}</p>
                </SpotlightCard>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com/carbonx-registry" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-primary-400 transition-colors border border-[var(--border)] hover:border-primary-500 bg-[var(--card)] px-4 py-2.5 rounded-xl">
                <GithubLogo className="w-4 h-4"/>
                GitHub Organization
              </a>
              <a href="https://x.com/carbonx_app" target="_blank" rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-primary-400 transition-colors border border-[var(--border)] hover:border-primary-500 bg-[var(--card)] px-4 py-2.5 rounded-xl">
                <XLogo className="w-3.5 h-3.5"/>
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
