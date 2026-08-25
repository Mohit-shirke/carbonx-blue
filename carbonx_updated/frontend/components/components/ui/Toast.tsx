'use client'
import { useState, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type TType = 'success'|'error'|'warning'|'info'
interface Toast { id:string; type:TType; title:string; message?:string; duration?:number }
interface ToastCtx { toast:(o:Omit<Toast,'id'>)=>void; success:(t:string,m?:string)=>void; error:(t:string,m?:string)=>void; warning:(t:string,m?:string)=>void; info:(t:string,m?:string)=>void }

const Ctx = createContext<ToastCtx|null>(null)
const ICONS = { success:CheckCircle, error:XCircle, warning:AlertTriangle, info:Info }
const STYLES = { success:'border-primary-500/30 bg-primary-500/10', error:'border-red-500/30 bg-red-500/10', warning:'border-amber-500/30 bg-amber-500/10', info:'border-blue-500/30 bg-blue-500/10' }
const ICLR  = { success:'text-primary-500', error:'text-red-400', warning:'text-amber-400', info:'text-blue-400' }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const remove = useCallback((id:string) => setToasts(t=>t.filter(x=>x.id!==id)), [])
  const toast  = useCallback((o:Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t=>[...t,{...o,id}])
    setTimeout(()=>remove(id), o.duration??4000)
  }, [remove])
  const success = useCallback((t:string,m?:string)=>toast({type:'success',title:t,message:m}),[toast])
  const error   = useCallback((t:string,m?:string)=>toast({type:'error',  title:t,message:m}),[toast])
  const warning = useCallback((t:string,m?:string)=>toast({type:'warning',title:t,message:m}),[toast])
  const info    = useCallback((t:string,m?:string)=>toast({type:'info',   title:t,message:m}),[toast])
  return (
    <Ctx.Provider value={{toast,success,error,warning,info}}>
      {children}
      <div className="fixed top-16 sm:top-20 right-3 sm:right-4 z-[200] flex flex-col gap-2 w-[calc(100vw-24px)] sm:w-80 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(t=>{
            const Icon=ICONS[t.type]
            return (
              <motion.div key={t.id} className={`card border px-3 sm:px-4 py-3 flex items-start gap-3 shadow-lg pointer-events-auto ${STYLES[t.type]}`}
                initial={{opacity:0,x:48,scale:0.96}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:48,scale:0.96}}
                transition={{type:'spring',stiffness:400,damping:30}}>
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${ICLR[t.type]}`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text)]">{t.title}</p>
                  {t.message&&<p className="text-xs text-[var(--text-muted)] mt-0.5">{t.message}</p>}
                </div>
                <button onClick={()=>remove(t.id)} className="text-[var(--text-muted)] hover:text-[var(--text)] shrink-0 pointer-events-auto">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be within ToastProvider')
  return ctx
}
