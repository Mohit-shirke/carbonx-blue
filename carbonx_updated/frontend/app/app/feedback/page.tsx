'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ThumbsUp, Send, CheckCircle, Lightbulb, Bug, Heart, Loader } from 'lucide-react'

type FType = 'general'|'bug'|'feature'|'praise'

const TYPES = [
  {id:'general' as FType, label:'General',         icon:MessageSquare, color:'text-blue-400   bg-blue-500/10   border-blue-500/20'  },
  {id:'bug'     as FType, label:'Bug Report',      icon:Bug,           color:'text-red-400    bg-red-500/10    border-red-500/20'   },
  {id:'feature' as FType, label:'Feature Request', icon:Lightbulb,     color:'text-amber-400  bg-amber-500/10  border-amber-500/20' },
  {id:'praise'  as FType, label:'Praise',          icon:Heart,         color:'text-pink-400   bg-pink-500/10   border-pink-500/20'  },
]

const TYPE_COLORS: Record<FType,string> = {
  general:'bg-blue-500/10  text-blue-400  border-blue-500/20',
  bug:    'bg-red-500/10   text-red-400   border-red-500/20',
  feature:'bg-amber-500/10 text-amber-400 border-amber-500/20',
  praise: 'bg-pink-500/10  text-pink-400  border-pink-500/20',
}

const INIT_REVIEWS = [
  {id:'r1', type:'feature' as FType, rating:5, message:'The Mira AI is incredible! It instantly calculated the price for Sundarbans credits. Please add voice input next!',       author:'Rahul S.',  role:'Corporate Buyer',      date:'2025-06-20', likes:24},
  {id:'r2', type:'praise'  as FType, rating:5, message:'First blockchain carbon registry that works on mobile. The checkout drawer is very smooth!',                             author:'Priya N.',  role:'NGO Proposer',         date:'2025-06-18', likes:18},
  {id:'r3', type:'bug'     as FType, rating:3, message:'The MRV terminal sometimes freezes on mobile Safari. Please fix.',                                                       author:'Amit K.',   role:'Government Validator', date:'2025-06-15', likes:7 },
  {id:'r4', type:'feature' as FType, rating:4, message:'Would love a portfolio tracker showing all my retired credits over time.',                                                author:'Deepa R.',  role:'Academic Auditor',     date:'2025-06-12', likes:31},
  {id:'r5', type:'praise'  as FType, rating:5, message:'The NDVI map is beautiful! Real-time satellite data this elegantly visualized is amazing.',                              author:'Kiran M.',  role:'Corporate Buyer',      date:'2025-06-10', likes:15},
]

export default function FeedbackPage() {
  const [type, setType]         = useState<FType>('general')
  const [rating, setRating]     = useState(0)
  const [hover, setHover]       = useState(0)
  const [message, setMessage]   = useState('')
  const [email, setEmail]       = useState('')
  const [submitted, setSubmit]  = useState(false)
  const [loading, setLoading]   = useState(false)
  const [formErr, setFormErr]   = useState('')
  const [filter, setFilter]     = useState<FType|'all'>('all')
  const [liked, setLiked]       = useState<Set<string>>(new Set())
  const [reviews, setReviews]   = useState(INIT_REVIEWS)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating)         { setFormErr('Please select a star rating.'); return }
    if (!message.trim()) { setFormErr('Please write your review.'); return }
    setLoading(true); setFormErr('')
    await new Promise(r => setTimeout(r, 1000))
    const newReview = {
      id: Math.random().toString(36).slice(2),
      type, rating, message,
      author: email ? email.split('@')[0] : 'Anonymous',
      role: 'CarbonX User',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    }
    setReviews(prev => [newReview, ...prev])
    setLoading(false)
    setSubmit(true)
  }

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setReviews(r => r.map(x => x.id===id ? {...x, likes: x.likes-1} : x))
      } else {
        next.add(id)
        setReviews(r => r.map(x => x.id===id ? {...x, likes: x.likes+1} : x))
      }
      return next
    })
  }

  const filtered  = filter==='all' ? reviews : reviews.filter(r => r.type===filter)
  const avgRating = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-8">

      {/* Header */}
      <motion.div className="text-center space-y-2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Feedback & Reviews</h1>
        <p className="text-[var(--text-muted)] text-sm">Help us improve CarbonX. Your feedback shapes the future of the platform.</p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s=>(
              <Star key={s} className={`w-5 h-5 ${s<=parseFloat(avgRating)?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>
            ))}
          </div>
          <span className="text-2xl font-bold text-[var(--text)]">{avgRating}</span>
          <span className="text-sm text-[var(--text-muted)]">({reviews.length} reviews)</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Submit form */}
        <motion.div className="card p-5 sm:p-6 h-fit"
          initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.1}}>
          <h2 className="font-bold text-base sm:text-lg text-[var(--text)] mb-4">Share Your Feedback</h2>

          {submitted ? (
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
              className="flex flex-col items-center py-8 text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary-500"/>
              </div>
              <h3 className="font-bold text-[var(--text)]">Thank you for your feedback!</h3>
              <p className="text-sm text-[var(--text-muted)]">Your review has been posted and helps improve CarbonX.</p>
              <button onClick={()=>{setSubmit(false);setRating(0);setMessage('');setEmail('');setFormErr('')}}
                className="text-sm text-primary-500 hover:underline">Submit another</button>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {formErr && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-red-400">{formErr}</p>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="text-xs font-medium text-[var(--text)] block mb-2">Feedback Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(({id,label,icon:Icon,color})=>(
                    <button key={id} type="button" onClick={()=>setType(id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${type===id ? color : 'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500/40'}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stars */}
              <div>
                <label className="text-xs font-medium text-[var(--text)] block mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} type="button"
                      onClick={()=>{setRating(s);setFormErr('')}}
                      onMouseEnter={()=>setHover(s)}
                      onMouseLeave={()=>setHover(0)}
                      className="transition-transform hover:scale-110 active:scale-95">
                      <Star className={`w-7 h-7 transition-colors ${s<=(hover||rating)?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">
                      {['','Poor','Fair','Good','Great','Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Your Review <span className="text-red-500">*</span></label>
                <textarea value={message} onChange={e=>{setMessage(e.target.value);setFormErr('')}} rows={4}
                  placeholder="Tell us about your experience with CarbonX…"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors resize-none placeholder:text-[var(--text-muted)]"/>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text)]">Email (optional)</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin"/>Submitting…</>
                  : <><Send className="w-4 h-4"/>Submit Feedback</>
                }
              </button>
            </form>
          )}
        </motion.div>

        {/* Reviews list */}
        <div className="space-y-3">
          {/* Filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {(['all','general','bug','feature','praise'] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${filter===f?'bg-primary-500 text-white border-primary-500':'border-[var(--border)] text-[var(--text-muted)] hover:border-primary-500'}`}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                <span className="ml-1 text-[10px] opacity-70">
                  ({f==='all' ? reviews.length : reviews.filter(r=>r.type===f).length})
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {filtered.map((fb,i)=>{
                const TIcon = TYPES.find(t=>t.id===fb.type)?.icon || MessageSquare
                return (
                  <motion.div key={fb.id} className="card p-4"
                    initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-500">{fb.author[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text)]">{fb.author}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{fb.role} · {fb.date}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${TYPE_COLORS[fb.type]}`}>
                        {fb.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 mb-2">
                      {[1,2,3,4,5].map(s=>(
                        <Star key={s} className={`w-3 h-3 ${s<=fb.rating?'text-amber-400 fill-amber-400':'text-[var(--border)]'}`}/>
                      ))}
                    </div>

                    <p className="text-xs text-[var(--text)] leading-relaxed mb-2">{fb.message}</p>

                    <button onClick={()=>toggleLike(fb.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-medium transition-colors ${liked.has(fb.id)?'text-primary-500':'text-[var(--text-muted)] hover:text-primary-500'}`}>
                      <ThumbsUp className={`w-3 h-3 ${liked.has(fb.id)?'fill-primary-500':''}`}/>
                      {fb.likes} {fb.likes===1?'person found this helpful':'people found this helpful'}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-10 text-[var(--text-muted)]">
                <p className="text-sm">No reviews in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
