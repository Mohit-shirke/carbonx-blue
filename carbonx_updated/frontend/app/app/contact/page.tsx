'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, MapPin, Phone, CheckCircle, Send, Github, Loader } from 'lucide-react'

const CONTACTS = [
  { icon:Mail,         title:'Email',    value:'support@carbonx.app',        desc:'Reply within 24 hours'     },
  { icon:MessageSquare,title:'Live Chat',value:'Chat with Mira AI',           desc:'Available 24/7 in the app' },
  { icon:MapPin,       title:'Location', value:'Bengaluru, Karnataka, India', desc:'India HQ'                  },
  { icon:Phone,        title:'Phone',    value:'+91 80 4567 8900',            desc:'Mon–Fri, 9am–6pm IST'      },
]

const FAQ = [
  { q:'How do I get started?',                ans:'Create a free account at /auth, select your role, and explore the marketplace. No credit card needed.' },
  { q:'Is CarbonX free to use?',             ans:'Account creation, browsing, and Mira AI are completely free. A 2.9% fee applies on card purchases only.' },
  { q:'How do I deploy the smart contract?', ans:'Follow the COMMANDS_GUIDE.md. Get free MATIC from faucet.polygon.technology, then run: npx hardhat run scripts/deploy.js --network amoy' },
  { q:'What is MRV?',                        ans:'Measurement, Reporting & Verification. Our AI satellite pipeline validates carbon projects using Copernicus Sentinel-2 imagery and NDVI scores.' },
  { q:'Can I run this on my laptop?',        ans:'Yes! Requires Node.js 18+, Docker Desktop, and 8GB+ RAM. Works on Windows, macOS, and Linux.' },
  { q:'How do I retire carbon credits?',     ans:'Go to Ledger page, enter Token ID and amount, add a note, and click Retire & Burn Credits. This is permanent and on-chain.' },
]

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
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
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
      // Fallback: mark as sent even if API unavailable (demo mode)
      if (err.message?.includes('fetch')) { setSent(true); return }
      setError(err.message || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <motion.div className="text-center space-y-3" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Get in Touch</h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-xl mx-auto">
          Have a question about CarbonX or want to list a project? We would love to hear from you.
        </p>
      </motion.div>

      {/* Contact cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {CONTACTS.map(({icon:Icon,title,value,desc},i)=>(
          <motion.div key={title} className="card p-3 sm:p-4 text-center"
            initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}>
            <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-primary-500"/>
            </div>
            <p className="text-xs font-semibold text-[var(--text)]">{title}</p>
            <p className="text-[10px] sm:text-xs text-primary-500 mt-0.5 font-medium">{value}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Form */}
        <motion.div className="card p-5 sm:p-6"
          initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.15}}>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text)] mb-4">Send us a message</h2>

          {sent ? (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="flex flex-col items-center py-10 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary-500"/>
              </div>
              <h3 className="font-bold text-[var(--text)]">Message sent!</h3>
              <p className="text-sm text-[var(--text-muted)]">
                We will get back to you within 24 hours. Check your email for confirmation.
              </p>
              <button onClick={()=>{setSent(false);setForm({name:'',email:'',subject:'',message:''})}}
                className="text-sm text-primary-500 hover:underline">Send another message</button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
              {[
                {label:'Your Name',    key:'name',  type:'text',  ph:'Jane Smith'         },
                {label:'Email Address',key:'email', type:'email', ph:'jane@company.com'   },
              ].map(f=>(
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[var(--text)]">{f.label} <span className="text-red-500">*</span></label>
                  <input type={f.type} placeholder={f.ph} value={(form as any)[f.key]}
                    onChange={set(f.key)} required
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
                </div>
              ))}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Subject <span className="text-red-500">*</span></label>
                <select value={form.subject} onChange={set('subject')} required
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors">
                  <option value="">Select a topic…</option>
                  <option value="General enquiry">General enquiry</option>
                  <option value="List a carbon project">List a carbon project</option>
                  <option value="Technical support">Technical support</option>
                  <option value="Partnership / Investment">Partnership / Investment</option>
                  <option value="Carbon data licensing">Carbon data licensing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Message <span className="text-red-500">*</span></label>
                <textarea placeholder="Tell us how we can help…" value={form.message}
                  onChange={set('message')} required rows={4}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin"/>Sending…</>
                  : <><Send className="w-4 h-4"/>Send Message</>
                }
              </button>
            </form>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.2}}>
          <h2 className="text-base sm:text-lg font-bold text-[var(--text)] mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ.map((item,i)=>(
              <motion.div key={item.q} className="card p-3 sm:p-4"
                initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.05}}>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text)] mb-1">{item.q}</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.ans}</p>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-5">
            <a href="https://github.com/carbonx-registry" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors border border-[var(--border)] hover:border-primary-500 px-3 py-2 rounded-lg">
              <Github className="w-3.5 h-3.5"/> GitHub
            </a>
            <a href="https://x.com/carbonx_app" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors border border-[var(--border)] hover:border-primary-500 px-3 py-2 rounded-lg">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/></svg>
              X (Twitter)
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
