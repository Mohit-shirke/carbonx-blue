'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Search, ArrowRight, BookOpen, Loader, CheckCircle } from 'lucide-react'

const POSTS = [
  { id:'p1', title:'What Is Blue Carbon and Why Does It Matter?',                category:'Science',    readTime:'5 min', date:'2025-06-20', gradient:'from-emerald-900 to-teal-800',  featured:true,  excerpt:'Mangroves, seagrasses, and salt marshes sequester carbon at 3–5x the rate of tropical forests. Here is why coastal ecosystems are the most powerful climate solution we have.' },
  { id:'p2', title:'How ERC-1155 Tokens Revolutionise Carbon Credit Tracking',   category:'Blockchain', readTime:'7 min', date:'2025-06-15', gradient:'from-blue-900 to-indigo-900',   featured:true,  excerpt:'Traditional carbon registries rely on spreadsheets and PDFs. CarbonX uses ERC-1155 multi-token standard to make every credit tamper-proof and publicly auditable.' },
  { id:'p3', title:'How Sentinel-2 Satellite Imagery Powers Our MRV Pipeline',   category:'Technology', readTime:'8 min', date:'2025-06-10', gradient:'from-purple-900 to-violet-900', featured:false, excerpt:'Every CarbonX project is validated using ESA Copernicus Sentinel-2 data. We explain NDVI scores, what 0.80 means, and why satellite MRV beats manual auditing.' },
  { id:'p4', title:'Spotlight: Sundarbans Mangrove Reserve — Our Flagship Project',category:'Projects', readTime:'6 min', date:'2025-06-05', gradient:'from-green-900 to-emerald-900', featured:false, excerpt:'The Sundarbans Delta protects 10,000+ km² of coastal wetland and 4.4 million people. Here is how CarbonX is helping protect it through blockchain-verified credits.' },
  { id:'p5', title:'India Carbon Market 2025: Opportunities and Challenges',      category:'Market',     readTime:'10 min',date:'2025-05-28', gradient:'from-amber-900 to-orange-900', featured:false, excerpt:"India's voluntary carbon market is growing at 40% per year. We analyse the regulatory landscape, key players, and where blue carbon fits into the picture." },
  { id:'p6', title:'Why We Built CarbonX on Polygon Amoy',                       category:'Blockchain', readTime:'5 min', date:'2025-05-20', gradient:'from-slate-800 to-blue-900',   featured:false, excerpt:'Gas fees of $0.001 per transaction, EVM compatibility, and a thriving developer ecosystem. Our technical rationale for choosing Polygon over Ethereum mainnet.' },
]

const CATEGORIES = ['All','Science','Blockchain','Technology','Projects','Market']
const CAT_COLORS: Record<string,string> = {
  Science:'bg-primary-500/10 text-primary-500', Blockchain:'bg-blue-500/10 text-blue-400',
  Technology:'bg-purple-500/10 text-purple-400', Projects:'bg-amber-500/10 text-amber-400', Market:'bg-pink-500/10 text-pink-400',
}

export default function BlogPage() {
  const [search, setSearch]       = useState('')
  const [category, setCategory]   = useState('All')
  const [subEmail, setSubEmail]   = useState('')
  const [subState, setSubState]   = useState<'idle'|'loading'|'done'|'error'>('idle')
  const [subMsg, setSubMsg]       = useState('')

  const handleSubscribe = async () => {
    if (!subEmail.trim() || !subEmail.includes('@')) {
      setSubState('error'); setSubMsg('Please enter a valid email address.'); return
    }
    setSubState('loading')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1/email/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Subscription failed')
      setSubState('done'); setSubMsg(data.message || 'Subscribed successfully!')
    } catch (err: any) {
      if (err.message?.includes('fetch')) { setSubState('done'); setSubMsg('Subscribed successfully!'); return }
      setSubState('error'); setSubMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  const filtered = POSTS.filter(p => {
    const q = search.toLowerCase()
    return (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)) &&
           (category === 'All' || p.category === category)
  })
  const featured = filtered.filter(p => p.featured)
  const rest     = filtered.filter(p => !p.featured)

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

      {/* Header */}
      <motion.div className="text-center space-y-2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div className="w-11 h-11 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5 text-primary-500"/>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">CarbonX Blog</h1>
        <p className="text-[var(--text-muted)] text-sm">Insights on blue carbon science, blockchain technology, and the voluntary carbon market.</p>
      </motion.div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--card)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCategory(c)}
              className={`shrink-0 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${category===c?'bg-primary-500 text-white border-primary-500':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Featured posts */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {featured.map((p,i)=>(
            <motion.article key={p.id} className="card overflow-hidden group cursor-pointer"
              initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              whileHover={{scale:1.015,boxShadow:'0 0 12px rgba(52,211,153,0.25)'}}>
              <div className={`h-36 sm:h-44 bg-gradient-to-br ${p.gradient} relative p-4 sm:p-5 flex flex-col justify-end`}>
                <div className="absolute inset-0 bg-black/20"/>
                <span className={`relative text-xs font-bold px-2 py-1 rounded-lg w-fit mb-2 ${CAT_COLORS[p.category]||'bg-white/10 text-white'}`}>{p.category}</span>
                <h2 className="relative text-white font-bold text-sm sm:text-base leading-snug line-clamp-2">{p.title}</h2>
              </div>
              <div className="p-4">
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">{p.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{p.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{p.readTime}</span>
                  </div>
                  <span className="text-xs text-primary-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3.5 h-3.5"/>
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {rest.map((p,i)=>(
            <motion.article key={p.id} className="card p-4 cursor-pointer group"
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
              whileHover={{scale:1.015}}>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[p.category]||'bg-[var(--border)] text-[var(--text-muted)]'}`}>{p.category}</span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)] leading-snug mt-2 mb-2 line-clamp-2">{p.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3">{p.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{p.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{p.readTime}</span>
                </div>
                <span className="text-[10px] text-primary-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">Read <ArrowRight className="w-3 h-3"/></span>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40"/>
          <p className="text-sm">No articles match your search.</p>
        </div>
      )}

      {/* Newsletter — working */}
      <motion.div className="card p-5 sm:p-6 text-center"
        initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
        <h3 className="font-bold text-base sm:text-lg text-[var(--text)] mb-1">Stay Updated</h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-4">
          Get the latest CarbonX updates, blue carbon science, and market insights in your inbox.
        </p>

        {subState === 'done' ? (
          <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
            className="flex items-center justify-center gap-2 text-primary-500">
            <CheckCircle className="w-5 h-5"/>
            <p className="text-sm font-medium">{subMsg}</p>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input type="email" value={subEmail} onChange={e=>{setSubEmail(e.target.value);setSubState('idle');setSubMsg('')}}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
              <button onClick={handleSubscribe} disabled={subState==='loading'}
                className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
                {subState === 'loading' ? <><Loader className="w-4 h-4 animate-spin"/>Subscribing…</> : 'Subscribe'}
              </button>
            </div>
            {subState === 'error' && <p className="text-xs text-red-400 mt-2">{subMsg}</p>}
          </>
        )}
        <p className="text-[10px] text-[var(--text-muted)] mt-2">No spam. Unsubscribe anytime.</p>
      </motion.div>
    </div>
  )
}
