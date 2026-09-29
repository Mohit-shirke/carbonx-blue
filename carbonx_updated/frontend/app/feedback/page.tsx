'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle, Lightbulb, Bug, Heart, Sparkles } from 'lucide-react'
import { BackgroundGrid } from '@/components/ui/BackgroundGrid'
import { BorderBeam } from '@/components/ui/BorderBeam'
import { SpotlightCard } from '@/components/ui/SpotlightCard'

type FType = 'general'|'bug'|'feature'|'praise'
const TYPES = [
  {id:'general',label:'General',        icon:MessageSquare,color:'text-blue-400 bg-blue-500/10 border-blue-500/20'  },
  {id:'bug',    label:'Bug Report',     icon:Bug,          color:'text-red-400 bg-red-500/10 border-red-500/20'    },
  {id:'feature',label:'Feature Request',icon:Lightbulb,    color:'text-amber-400 bg-amber-500/10 border-amber-500/20'},
  {id:'praise', label:'Praise',         icon:Heart,        color:'text-pink-400 bg-pink-500/10 border-pink-500/20' },
]
const TYPE_COLORS:Record<FType,string>={general:'bg-blue-500/10 text-blue-400 border-blue-500/20',bug:'bg-red-500/10 text-red-400 border-red-500/20',feature:'bg-amber-500/10 text-amber-400 border-amber-500/20',praise:'bg-pink-500/10 text-pink-400 border-pink-500/20'}
const INIT_REVIEWS = [
  {id:'r1',type:'feature' as FType,rating:5,message:'The Mira AI is incredible! It instantly calculated the price for Sundarbans credits. Please add voice input next!',author:'Rahul S.',role:'Corporate Buyer',date:'2025-06-20',likes:24},
  {id:'r2',type:'praise'  as FType,rating:5,message:'First blockchain carbon registry that works on mobile. The checkout drawer is very smooth!',author:'Priya N.',role:'NGO Proposer',date:'2025-06-18',likes:18},
  {id:'r3',type:'bug'     as FType,rating:3,message:'The MRV terminal sometimes freezes on mobile Safari. Please fix.',author:'Amit K.',role:'Government Validator',date:'2025-06-15',likes:7},
  {id:'r4',type:'feature' as FType,rating:4,message:'Would love a portfolio tracker showing all my retired credits over time.',author:'Deepa R.',role:'Academic Auditor',date:'2025-06-12',likes:31},
  {id:'r5',type:'praise'  as FType,rating:5,message:'The NDVI map is beautiful! Real-time satellite data this elegantly visualized is amazing.',author:'Kiran M.',role:'Corporate Buyer',date:'2025-06-10',likes:15},
]

export default function FeedbackPage() {
  const [type,setType]         = useState<FType>('general')
  const [rating,setRating]     = useState(0)
  const [hover,setHover]       = useState(0)
  const [message,setMessage]   = useState('')
  const [email,setEmail]       = useState('')
  const [submitted,setSubmit]  = useState(false)
  const [loading,setLoading]   = useState(false)
  const [filter,setFilter]     = useState<FType|'all'>('all')
  const [liked,setLiked]       = useState<Set<string>>(new Set())
  const [reviews,setReviews]   = useState(INIT_REVIEWS)

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); if(!rating) return
    setLoading(true); await new Promise(r=>setTimeout(r,1200))
    setReviews(prev=>[{id:Math.random().toString(36).slice(2),type,rating,message,author:email.split('@')[0]||'Anonymous',role:'CarbonX User',date:new Date().toISOString().split('T')[0],likes:0},...prev])
    setLoading(false); setSubmit(true)
  }

  const toggleLike = (id:string) => {
    setLiked(prev=>{
      const next=new Set(prev)
      if(next.has(id)){next.delete(id);setReviews(r=>r.map(x=>x.id===id?{...x,likes:x.likes-1}:x))}
      else{next.add(id);setReviews(r=>r.map(x=>x.id===id?{...x,likes:x.likes+1}:x))}
      return next
    })
  }

  const filtered = filter==='all' ? reviews : reviews.filter(r=>r.type===filter)
  const avgRating = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)

  return (
    <div className="relative min-h-screen pb-16 overflow-hidden">
      {/* 21st.dev Ambient Matrix Grid Background */}
      <BackgroundGrid />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <motion.div className="text-center space-y-2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/25 text-primary-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Decentralized Community Feedback Loop
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">Community Feedback & Reviews</h1>
          <p className="text-[var(--text-muted)] text-sm max-w-xl mx-auto">Help us refine CarbonX. Your feedback shapes the future of algorithmic blue carbon conservation.</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s=><Star key={s} className={`w-5 h-5 ${s<=parseFloat(avgRating)?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>)}
            </div>
            <span className="text-2xl font-black font-mono text-[var(--text)]">{avgRating}</span>
            <span className="text-xs text-[var(--text-muted)]">({reviews.length} reviews)</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form with BorderBeam */}
          <div className="relative rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-2xl overflow-hidden h-fit">
            <BorderBeam size={260} duration={8} colorFrom="#10B981" colorTo="#06B6D4" borderWidth={1.5} />
            <h2 className="font-bold text-base sm:text-lg text-[var(--text)] mb-4">Share Your Feedback</h2>
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary-500"/>
              </div>
              <h3 className="font-bold text-[var(--text)]">Thank you!</h3>
              <p className="text-sm text-[var(--text-muted)]">Your review has been posted.</p>
              <button onClick={()=>{setSubmit(false);setRating(0);setMessage('');setEmail('')}} className="text-sm text-primary-500 hover:underline">Submit another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {/* Type */}
              <div>
                <label className="text-xs font-medium text-[var(--text)] block mb-2">Feedback Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(({id,label,icon:Icon,color})=>(
                    <button key={id} type="button" onClick={()=>setType(id as FType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${type===id?color:'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/40'}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Stars */}
              <div>
                <label className="text-xs font-medium text-[var(--text)] block mb-2">Rating <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} type="button" onClick={()=>setRating(s)} onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} className="transition-transform hover:scale-110">
                      <Star className={`w-7 h-7 transition-colors ${s<=(hover||rating)?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>
                    </button>
                  ))}
                  {rating>0&&<span className="ml-2 text-xs text-[var(--text-muted)]">{['','Poor','Fair','Good','Great','Excellent'][rating]}</span>}
                </div>
              </div>
              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Review <span className="text-red-500">*</span></label>
                <textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={4}
                  placeholder="Tell us about your experience…"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
              </div>
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Email (optional)</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
              </div>
              <button type="submit" disabled={!rating||!message||loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-primary-500/25 transition-all">
                {loading?<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</>:<><Send className="w-4 h-4"/>Submit Feedback</>}
              </button>
            </form>
          )}
          </div>

        {/* Reviews */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['all','general','bug','feature','praise'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${filter===f?'bg-primary-500 text-white border-primary-500 shadow-sm':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filtered.map((fb,i)=>{
                const TIcon=TYPES.find(t=>t.id===fb.type)?.icon||MessageSquare
                return (
                  <SpotlightCard key={fb.id} className="p-4 sm:p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-500/15 border border-primary-500/25 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold font-mono text-primary-400">{fb.author[0]}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text)]">{fb.author}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{fb.role} · {fb.date}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${TYPE_COLORS[fb.type]}`}>{fb.type}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s=><Star key={s} className={`w-3.5 h-3.5 ${s<=fb.rating?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>)}
                    </div>
                    <p className="text-xs text-[var(--text)] leading-relaxed mb-3">{fb.message}</p>
                    <button onClick={()=>toggleLike(fb.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${liked.has(fb.id)?'text-primary-400':'text-[var(--text-muted)] hover:text-primary-400'}`}>
                      <ThumbsUp className="w-3.5 h-3.5"/> {fb.likes} helpful
                    </button>
                  </SpotlightCard>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
