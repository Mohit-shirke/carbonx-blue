'use client'
import { motion } from 'framer-motion'
import { Check, Zap, Building2, DollarSign, Globe, Shield, BarChart2, Leaf } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  { name:'Starter', icon:Leaf, price:99, color:'text-primary-500', bg:'bg-primary-500/10', border:'border-primary-500/30', highlight:false,
    features:['Up to 500 tCO₂e/month','Basic ESG reports (PDF)','All active projects','Email support','On-chain retirement certificates'] },
  { name:'Pro', icon:Zap, price:499, color:'text-blue-400', bg:'bg-blue-500/10', border:'border-blue-500/50', highlight:true,
    features:['Up to 5,000 tCO₂e/month','Advanced ESG + Scope 3 reports','REST API access','Priority support (24hr)','Bulk purchase discounts','Project NDVI analytics','Custom retirement notes'] },
  { name:'Enterprise', icon:Building2, price:2000, color:'text-amber-400', bg:'bg-amber-500/10', border:'border-amber-500/30', highlight:false,
    features:['Unlimited tCO₂e purchases','Custom ESG reporting suite','Dedicated API endpoint','Dedicated account manager','SLA 99.9% uptime','White-label certificates','Carbon data licensing included'] },
]

const OTHER = [
  { icon:Globe,    title:'Project Listing Fee',  who:'NGOs',              price:'$500–$2,000',       desc:'One-time fee to list a new blue carbon project on the registry.' },
  { icon:Shield,   title:'MRV Validation Fee',   who:'Government Validators', price:'$100–$500/run',  desc:'Charged per AI satellite MRV pipeline run. Projects need re-validation every 6 months.' },
  { icon:BarChart2,title:'Carbon Data Licensing',who:'ESG Firms / Researchers', price:'$5,000–$50,000', desc:'License access to NDVI scores, sequestration rates, and satellite-verified mangrove health data.' },
]

const EXAMPLES = [
  {tons:10,  project:'Pichavaram',  price:19.75},
  {tons:100, project:'Sundarbans',  price:28.50},
  {tons:1000,project:'Godavari',    price:31.00},
]

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 lg:py-14 space-y-10 sm:space-y-14">
      <motion.div className="text-center space-y-3" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-500 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>Transparent Pricing
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text)]">Simple, Honest Pricing</h1>
        <p className="text-[var(--text-muted)] text-sm sm:text-base max-w-2xl mx-auto">Account creation is always free. You only pay when you purchase carbon credits or use premium features.</p>
      </motion.div>

      {/* Transaction fee banner */}
      <motion.div className="card p-4 sm:p-6 bg-primary-500/5 border-primary-500/20" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-5 h-5 text-primary-500"/><h2 className="text-lg font-bold text-[var(--text)]">2.9% Transaction Fee</h2></div>
            <p className="text-sm text-[var(--text-muted)]">Applied to card/Stripe purchases only. Web3/MATIC payments have zero platform fee — only standard gas.</p>
          </div>
          <div className="shrink-0 bg-primary-500/10 border border-primary-500/20 rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-bold text-primary-500">2.9%</p>
            <p className="text-xs text-[var(--text-muted)]">card only</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EXAMPLES.map(ex=>{
            const sub=ex.tons*ex.price; const fee=sub*0.029
            return (
              <div key={ex.project} className="bg-[var(--bg)] rounded-xl p-3">
                <p className="text-xs text-[var(--text-muted)] mb-2">{ex.tons} tons × {ex.project}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs"><span className="text-[var(--text-muted)]">Subtotal</span><span className="text-[var(--text)] font-medium">${sub.toLocaleString('en-US',{minimumFractionDigits:2})}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-[var(--text-muted)]">Platform fee</span><span className="text-[var(--text)]">${fee.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs font-semibold border-t border-[var(--border)] pt-1">
                    <span className="text-[var(--text)]">Total</span><span className="text-primary-500">${(sub+fee).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Subscription plans */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-2">Corporate Subscription Plans</h2>
        <p className="text-[var(--text-muted)] text-sm mb-6">For organizations needing bulk purchasing, API access, and advanced ESG reporting.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {PLANS.map((plan,i)=>(
            <motion.div key={plan.name} className={`card p-5 flex flex-col relative ${plan.highlight?'border-blue-500/50 ring-1 ring-blue-500/20':''}`}
              initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.1+i*0.08}}>
              {plan.highlight&&<div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span></div>}
              <div className={`w-10 h-10 rounded-xl ${plan.bg} flex items-center justify-center mb-4`}><plan.icon className={`w-5 h-5 ${plan.color}`}/></div>
              <h3 className="text-lg font-bold text-[var(--text)] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4"><span className="text-3xl font-bold text-[var(--text)]">${plan.price}</span><span className="text-[var(--text-muted)] text-sm">/month</span></div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f=>(
                  <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
                    <Check className={`w-4 h-4 ${plan.color} shrink-0 mt-0.5`}/>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" className={`w-full flex items-center justify-center font-medium py-2.5 px-4 rounded-xl text-sm transition-colors ${plan.highlight?'bg-blue-500 hover:bg-blue-600 text-white':'border border-[var(--border)] hover:border-primary-500 text-[var(--text)] hover:text-primary-500'}`}>
                {plan.name==='Enterprise'?'Contact Sales':'Get Started'}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Other fees */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] mb-2">Other Revenue Streams</h2>
        <p className="text-[var(--text-muted)] text-sm mb-6">Fees charged to NGOs, validators, and data partners.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {OTHER.map(({icon:Icon,title,who,price,desc},i)=>(
            <motion.div key={title} className="card p-4 sm:p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.07}}>
              <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3"><Icon className="w-4 h-4 text-primary-500"/></div>
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text)] mb-1">{title}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-2">Paid by: {who}</p>
              <p className="text-primary-500 font-bold text-sm mb-2">{price}</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Free tier */}
      <motion.div className="card p-5 sm:p-6 text-center" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-2">Always Free</h2>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {['Account creation','Browse all projects','View ledger & retirements','Chat with Mira AI','View NDVI scores','Carbon footprint calculator','Blog & resources'].map(f=>(
            <div key={f} className="flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-500 text-xs font-medium px-3 py-1.5 rounded-full">
              <Check className="w-3 h-3"/>{f}
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link href="/auth" className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">Create Free Account</Link>
          <Link href="/marketplace" className="border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">Browse Marketplace</Link>
        </div>
      </motion.div>
    </div>
  )
}
