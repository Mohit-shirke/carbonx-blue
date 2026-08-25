'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Minimize2, Maximize2, Leaf, RotateCcw, Copy, CheckCheck } from 'lucide-react'
import { generateResponse, extractEntities, type AIResponse } from '@/lib/ai/engine'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  pills?: string[]
  calculation?: AIResponse['calculation']
  ts: number
}

const SUGGESTIONS = [
  'What is CarbonX?',
  'Sundarbans 5 tons price',
  'List all projects',
  'How do I buy credits?',
  'What is blue carbon?',
  'Platform stats',
]

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: "Hi! I'm **Mira** 🌿, your CarbonX AI guide.\n\nI can calculate prices, explain carbon science, compare projects, and answer anything about the platform. What can I help you with?",
  pills: ['🧮 Calculate a price', '📊 Platform stats', '📖 What is CarbonX?'],
  ts: Date.now(),
}

function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}/>
      ))}
    </div>
  )
}

function CalcCard({ calc }: { calc: NonNullable<AIResponse['calculation']> }) {
  return (
    <div className="mt-2 bg-[var(--bg)] rounded-xl overflow-hidden border border-[var(--border)]">
      <div className="px-3 py-2 bg-primary-500/10 border-b border-[var(--border)]">
        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wider">{calc.label}</p>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {calc.rows.map(row => (
          <div key={row.label} className={`flex items-center justify-between px-3 py-1.5 ${row.highlight ? 'bg-primary-500/5' : ''}`}>
            <span className={`text-[11px] ${row.highlight ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{row.label}</span>
            <span className={`text-[11px] font-bold ${row.highlight ? 'text-primary-500' : 'text-[var(--text)]'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChatbotWidget() {
  const [open, setOpen]           = useState(false)
  const [fullscreen, setFull]     = useState(false)
  const [messages, setMessages]   = useState<Message[]>([WELCOME])
  const [input, setInput]         = useState('')
  const [typing, setTyping]       = useState(false)
  const [copied, setCopied]       = useState<string | null>(null)
  const [unread, setUnread]       = useState(0)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])
  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200) } }, [open])

  const send = useCallback(async (text: string) => {
    const q = text.trim()
    if (!q) return
    setInput('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)

    // Simulate thinking delay (50–150ms per word, min 600ms)
    const delay = Math.max(600, Math.min(q.split(' ').length * 80, 1800))
    await new Promise(r => setTimeout(r, delay))

    const response = generateResponse(q)
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: response.text,
      pills: response.pills,
      calculation: response.calculation,
      ts: Date.now(),
    }
    setTyping(false)
    setMessages(prev => [...prev, aiMsg])
    if (!open) setUnread(n => n + 1)
  }, [open])

  const copyMsg = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\*\*/g, '').replace(/\n/g, ' '))
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const reset = () => setMessages([WELCOME])

  const widgetClass = fullscreen
    ? 'fixed inset-0 z-[300] flex flex-col bg-[var(--card)]'
    : 'fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-[300] w-[calc(100vw-24px)] sm:w-[380px] h-[520px] sm:h-[560px] flex flex-col card shadow-2xl rounded-2xl overflow-hidden'

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[299] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/40 flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        aria-label="Open Mira AI">
        <AnimatePresence mode="wait" initial={false}>
          {open
            ? <motion.span key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}><X className="w-5 h-5 sm:w-6 sm:h-6"/></motion.span>
            : <motion.span key="m" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}}><MessageSquare className="w-5 h-5 sm:w-6 sm:h-6"/></motion.span>
          }
        </AnimatePresence>
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div className={widgetClass}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white"/>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">Mira</p>
                  <p className="text-[10px] text-primary-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse inline-block"/>
                    CarbonX AI · Always online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={reset} className="w-7 h-7 rounded-lg hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors" title="Reset chat">
                  <RotateCcw className="w-3.5 h-3.5"/>
                </button>
                <button onClick={() => setFull(v => !v)} className="w-7 h-7 rounded-lg hover:bg-[var(--border)] hidden sm:flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  {fullscreen ? <Minimize2 className="w-3.5 h-3.5"/> : <Maximize2 className="w-3.5 h-3.5"/>}
                </button>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg hover:bg-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 no-scrollbar">
              {/* Quick suggestions (only when just welcome message) */}
              {messages.length === 1 && (
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-left text-[10px] sm:text-xs text-[var(--text-muted)] hover:text-primary-500 border border-[var(--border)] hover:border-primary-500 px-2.5 py-2 rounded-xl transition-colors leading-snug">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[88%] ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm' : 'bg-[var(--bg)] text-[var(--text)] rounded-2xl rounded-tl-sm border border-[var(--border)]'} px-3 py-2.5`}>
                    <div className="text-xs sm:text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}/>
                    {msg.calculation && <CalcCard calc={msg.calculation}/>}
                    {msg.pills && msg.pills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {msg.pills.map(pill => (
                          <button key={pill} onClick={() => send(pill.replace(/^[^\w]+/, '').trim())}
                            className="text-[10px] font-medium bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 border border-primary-500/20 px-2.5 py-1 rounded-full transition-colors">
                            {pill}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.role === 'assistant' && (
                      <button onClick={() => copyMsg(msg.text, msg.id)}
                        className="mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--text)]">
                        {copied === msg.id ? <CheckCheck className="w-3 h-3 text-primary-500"/> : <Copy className="w-3 h-3"/>}
                      </button>
                    )}
                    <p className="text-[9px] opacity-40 mt-1">{new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-tl-sm">
                    <TypingDots/>
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-[var(--border)] bg-[var(--card)] shrink-0">
              <form onSubmit={e => { e.preventDefault(); send(input) }} className="flex items-center gap-2">
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask Mira anything…"
                  className="flex-1 px-3 py-2.5 rounded-xl text-xs sm:text-sm bg-[var(--input-bg)] text-[var(--text)] border border-[var(--border)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
                <motion.button type="submit" disabled={!input.trim() || typing}
                  className="w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Send className="w-4 h-4"/>
                </motion.button>
              </form>
              <p className="text-[9px] text-center text-[var(--text-muted)] mt-1.5">Mira runs locally · No data sent to external servers</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
