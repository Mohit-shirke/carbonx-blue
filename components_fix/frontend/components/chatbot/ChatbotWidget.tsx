'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Leaf, Bot } from 'lucide-react'

// ── Mira AI — O(k) hash-map intent engine ────────────────────────
const INTENTS: Record<string, { keys: string[]; reply: string }> = {
  greeting:    { keys:['hi','hello','hey','mira','start'], reply:"Hello! 👋 I'm **Mira**, CarbonX's AI assistant. I can help with carbon credits, MRV, marketplace, and more. What would you like to know?" },
  marketplace: { keys:['buy','purchase','marketplace','credit','price','ton','tonne'], reply:"You can buy blue carbon credits on our **Marketplace** 🛒. Each credit = 1 tCO₂e. Projects start from $22/tonne. Visit `/marketplace` to browse 6 verified Indian mangrove projects." },
  mrv:         { keys:['mrv','satellite','ndvi','scan','verify','sentinel'], reply:"Our **MRV pipeline** uses Copernicus Sentinel-2 satellite data 🛰️ to compute NDVI scores. Projects need NDVI ≥ 0.80 for verification. All data is SHA-256 signed for integrity." },
  ledger:      { keys:['retire','burn','offset','ledger','permanent'], reply:"The **Ledger** page lets you permanently retire carbon credits ♻️. Retirement burns tokens to 0x0000 on Polygon — irreversible and publicly verifiable on Polygonscan." },
  blockchain:  { keys:['polygon','blockchain','wallet','metamask','erc','token'], reply:"CarbonX runs on **Polygon Mainnet** ⛓️ (Chain ID: 137). We use ERC-1155 tokens — 1 token = 1 tCO₂e. Gas fees are ~$0.001. Connect MetaMask or any WalletConnect wallet." },
  methodology: { keys:['bee','ipcc','methodology','standard','ccts','verra','carbon accounting'], reply:"We support **BEE BM FR05.001** (India CCTS), **Verra VM0033**, and **Isometric Mangrove v1.0** 📋. Carbon calculations use IPCC Tier 2 allometric equations (Komiyama 2005)." },
  pricing:     { keys:['fee','cost','subscription','stripe','payment','charge'], reply:"CarbonX charges **2.9% transaction fee** on card payments 💳. MATIC/crypto payments are free. Subscriptions: Starter $99/mo, Pro $499/mo, Enterprise $2000/mo. Visit `/pricing`." },
  dashboard:   { keys:['dashboard','kpi','stats','analytics','map'], reply:"Your **Dashboard** shows real-time KPIs — credits purchased, CO₂ retired, NDVI scores, and an India SVG map of active projects. Go to `/dashboard`." },
  esg:         { keys:['esg','report','iso','tcfd','brsr','gri','ghg'], reply:"Generate **ESG reports** in 6 formats — ISO 14064-3, GHG Protocol, BRSR India, TCFD, GRI 305, and CarbonX Certificate. All are print-ready PDFs. Visit `/esg`." },
  research:    { keys:['research','paper','publication','ieee','citation'], reply:"Our **Research** page has 15 peer-reviewed citations with IEEE/APA formats and BibTeX export 📚. CarbonX also has 5 world-first innovations at `/innovations`." },
  passport:    { keys:['passport','project','evidence','lineage','audit'], reply:"Every project has a **Project Passport** 🌿 — complete evidence record from satellite pixel to token. Visit `/passport` to see MRV history, retirements, biodiversity data, and on-chain proof." },
  grievance:   { keys:['grievance','complaint','issue','problem','report'], reply:"CarbonX has an **ICVCM-compliant Grievance Mechanism** ⚖️. Submit concerns at `/grievance`. Anonymous submissions accepted. All cases publicly disclosed." },
  default:     { keys:[], reply:"I'm not sure about that specific question. You can explore: **Marketplace** (`/marketplace`), **Dashboard** (`/dashboard`), **MRV** (`/mrv`), or **Contact** us at `/contact`. 🌱" },
}

function getMiraResponse(input: string): string {
  const q = input.toLowerCase().trim()
  for (const [, intent] of Object.entries(INTENTS)) {
    if (intent.keys.some(k => q.includes(k))) return intent.reply
  }
  return INTENTS.default.reply
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-primary-500/10 text-primary-500 px-1 rounded text-[10px]">$1</code>')
}

interface Message { role: 'user'|'mira'; text: string; ts: Date }

export function ChatbotWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role:'mira', text:"Hi! 👋 I'm **Mira**, CarbonX's AI assistant. Ask me anything about carbon credits, MRV, blockchain, or our platform!", ts: new Date() }
  ])
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const bottomRef               = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages, typing])

  const send = async () => {
    const q = input.trim()
    if (!q) return
    setInput('')
    setMessages(m => [...m, { role:'user', text:q, ts:new Date() }])
    setTyping(true)
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    const reply = getMiraResponse(q)
    setMessages(m => [...m, { role:'mira', text:reply, ts:new Date() }])
    setTyping(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
        className="fixed bottom-20 right-4 z-[250] w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white shadow-xl flex items-center justify-center"
        aria-label="Open Mira AI">
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x"    initial={{ rotate:-90,opacity:0 }} animate={{ rotate:0,opacity:1 }} exit={{ opacity:0 }}><X className="w-5 h-5"/></motion.div>
            : <motion.div key="chat" initial={{ rotate:90, opacity:0 }} animate={{ rotate:0,opacity:1 }} exit={{ opacity:0 }}><MessageCircle className="w-5 h-5"/></motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, scale:0.95, y:20 }}
            animate={{ opacity:1, scale:1,    y:0 }}
            exit={{ opacity:0, scale:0.95, y:20 }}
            transition={{ type:'spring', stiffness:400, damping:30 }}
            className="fixed bottom-36 right-4 z-[249] w-[calc(100vw-2rem)] sm:w-96 h-[480px] flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-gradient-to-r from-primary-900/30 to-teal-900/20 shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white"/>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text)]">Mira</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>
                  <p className="text-[10px] text-[var(--text-muted)]">CarbonX AI · Always online</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scroll-smooth">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.role==='mira'?'bg-primary-500':'bg-[var(--border)]'}`}>
                    {m.role === 'mira'
                      ? <Leaf className="w-3 h-3 text-white"/>
                      : <span className="text-[9px] font-bold text-[var(--text-muted)]">You</span>}
                  </div>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role==='mira'?'bg-[var(--bg)] text-[var(--text)] rounded-tl-none':'bg-primary-500 text-white rounded-tr-none'}`}>
                    {m.role === 'mira'
                      ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}/>
                      : m.text
                    }
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                    <Leaf className="w-3 h-3 text-white"/>
                  </div>
                  <div className="bg-[var(--bg)] px-3 py-2.5 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-bounce"
                        style={{ animationDelay:`${i*0.15}s` }}/>
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {['Buy credits','Retirement','MRV Pipeline','Blockchain'].map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="shrink-0 text-[10px] bg-primary-500/10 text-primary-500 border border-primary-500/20 px-2.5 py-1 rounded-full hover:bg-primary-500/20 transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--border)] shrink-0">
              <input
                value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Ask Mira anything…"
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-primary-500 transition-colors placeholder:text-[var(--text-muted)]"/>
              <button onClick={send} disabled={!input.trim()}
                className="w-8 h-8 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0">
                <Send className="w-3.5 h-3.5"/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
