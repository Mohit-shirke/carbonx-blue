'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Car, Plane, Zap, Home, ShoppingCart, Utensils, TreePine, ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { id:'car',      label:'Car Travel',       icon:Car,         unit:'km/year',    placeholder:'15000', factor:0.21,     color:'text-blue-400'    },
  { id:'flights',  label:'Flights',          icon:Plane,       unit:'hours/year', placeholder:'10',    factor:255,      color:'text-purple-400'  },
  { id:'electric', label:'Home Electricity', icon:Zap,         unit:'kWh/month',  placeholder:'300',   factor:0.82,     color:'text-amber-400'   },
  { id:'home',     label:'Cooking Gas',      icon:Home,        unit:'units/month',placeholder:'50',    factor:2.1,      color:'text-red-400'     },
  { id:'shopping', label:'Shopping',         icon:ShoppingCart,unit:'₹/month',    placeholder:'10000', factor:0.00055,  color:'text-pink-400'    },
  { id:'diet',     label:'Diet',             icon:Utensils,    unit:'meals/day',  placeholder:'3',     factor:365*2.5,  color:'text-orange-400'  },
]

const PROJECTS = [
  {name:'Pichavaram',  price:19.75},{name:'Bhitarkanika',price:22.00},
  {name:'Sundarbans',  price:28.50},{name:'Godavari',    price:31.00},
]

function calcKg(id:string, val:number, factor:number):number {
  if(id==='car')      return val*factor
  if(id==='flights')  return val*factor
  if(id==='electric') return val*12*factor
  if(id==='home')     return val*12*factor
  if(id==='shopping') return val*12*factor
  if(id==='diet')     return factor
  return 0
}

export default function CalculatorPage() {
  const [values,setValues] = useState<Record<string,string>>({})
  const [step,setStep]     = useState<'input'|'result'>('input')

  const totalKg = CATEGORIES.reduce((sum,cat) => sum + calcKg(cat.id, parseFloat(values[cat.id]||'0')||0, cat.factor), 0)
  const totalTons = totalKg/1000
  const breakdown = CATEGORIES.map(cat=>{
    const kg=calcKg(cat.id,parseFloat(values[cat.id]||'0')||0,cat.factor)
    return {...cat,kg,pct:totalKg>0?(kg/totalKg)*100:0}
  }).filter(c=>c.kg>0).sort((a,b)=>b.kg-a.kg)

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-6">
      <motion.div className="text-center space-y-2" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}>
        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto">
          <Calculator className="w-6 h-6 text-primary-500"/>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">Carbon Footprint Calculator</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-xl mx-auto">Calculate your annual CO₂ emissions and see how many credits you need to offset them.</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {step==='input' ? (
          <motion.div key="input" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              {CATEGORIES.map((cat,i)=>(
                <motion.div key={cat.id} className="card p-4" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-current/10 flex items-center justify-center ${cat.color}`}>
                      <cat.icon className="w-4 h-4"/>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">{cat.label}</p>
                  </div>
                  <div className="relative">
                    <input type="number" min="0" value={values[cat.id]||''}
                      onChange={e=>setValues(v=>({...v,[cat.id]:e.target.value}))}
                      placeholder={cat.placeholder}
                      className="w-full px-3 py-2.5 pr-16 rounded-lg text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] whitespace-nowrap">{cat.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Estimated annual footprint</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-500">{totalTons.toFixed(2)} tCO₂e</p>
                <p className="text-xs text-[var(--text-muted)]">Global avg: 4.7t · India avg: 1.9t</p>
              </div>
              <button onClick={()=>setStep('result')} disabled={totalTons===0}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors w-full sm:w-auto justify-center">
                Calculate Offset <ArrowRight className="w-4 h-4"/>
              </button>
            </div>
          </motion.div>
        ):(
          <motion.div key="result" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} className="space-y-4">
            {/* Score */}
            <div className={`card p-5 sm:p-6 border-2 ${totalTons>4.7?'border-red-500/30 bg-red-500/5':'border-primary-500/30 bg-primary-500/5'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Your annual carbon footprint</p>
                  <p className="text-4xl font-bold text-[var(--text)]">{totalTons.toFixed(2)}<span className="text-xl ml-1">tCO₂e</span></p>
                  <p className={`text-sm mt-1 font-medium ${totalTons>4.7?'text-red-400':'text-primary-500'}`}>
                    {totalTons>4.7?`⚠️ ${(totalTons-4.7).toFixed(1)}t above`:`✅ ${(4.7-totalTons).toFixed(1)}t below`} global average
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[{label:'Trees needed',value:Math.round(totalTons*16.5).toLocaleString()},{label:'Flights equiv',value:(totalTons*0.5).toFixed(1)},{label:'Car miles',value:Math.round(totalTons*2481).toLocaleString()}].map(({label,value})=>(
                    <div key={label} className="bg-[var(--bg)] rounded-xl p-2.5">
                      <p className="text-base font-bold text-[var(--text)]">{value}</p>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            {breakdown.length>0&&(
              <div className="card p-4 sm:p-5">
                <h3 className="font-semibold text-sm text-[var(--text)] mb-3">Emissions Breakdown</h3>
                <div className="space-y-2.5">
                  {breakdown.map(cat=>(
                    <div key={cat.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-[var(--text)]"><cat.icon className={`w-3.5 h-3.5 ${cat.color}`}/>{cat.label}</span>
                        <span className="text-xs font-semibold text-[var(--text)]">{(cat.kg/1000).toFixed(2)}t</span>
                      </div>
                      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full bg-current ${cat.color}`}
                          initial={{width:0}} animate={{width:`${cat.pct}%`}} transition={{duration:0.6,ease:'easeOut'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offset options */}
            <div className="card p-4 sm:p-5">
              <h3 className="font-semibold text-sm sm:text-base text-[var(--text)] mb-1">Offset Your Footprint</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3">You need <strong className="text-[var(--text)]">{totalTons.toFixed(2)} tCO₂e</strong> to fully offset.</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {PROJECTS.map(p=>(
                  <div key={p.name} className="bg-[var(--bg)] rounded-xl p-3 flex items-center justify-between">
                    <div><p className="text-xs font-semibold text-[var(--text)]">{p.name}</p><p className="text-[10px] text-[var(--text-muted)]">${p.price}/ton</p></div>
                    <p className="text-sm font-bold text-primary-500">${(totalTons*p.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/marketplace" className="flex-1">
                  <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                    <TreePine className="w-4 h-4"/> Buy Offset Credits
                  </button>
                </Link>
                <button onClick={()=>{setStep('input');setValues({})}}
                  className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium py-2.5 px-5 rounded-xl text-sm transition-colors">
                  <RotateCcw className="w-4 h-4"/> Recalculate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
