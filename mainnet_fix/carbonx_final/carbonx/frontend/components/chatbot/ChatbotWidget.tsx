'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, ChevronRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
  pills?: string[]
  timestamp: Date
}

// ─── Keyword → Response map ──────────────────────────────────────
const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['token', 'erc', '1155', 'nft', 'blockchain', 'polygon', 'polygon', 'web3'],
    response: `CarbonX uses the **ERC-1155 multi-token standard** on the Polygon Mainnet (Chain ID: 137). Each carbon project gets a unique Token ID. When credits are purchased or minted, they appear in your wallet as fungible quantities under that Token ID. Retiring credits calls \`retireCredits()\` which transfers tokens to \`address(0)\` — permanently burning them and creating an on-chain offset proof. Gas fees on Polygon are extremely low (~$0.001), making it ideal for high-frequency registry operations.`,
  },
  {
    keywords: ['mrv', 'satellite', 'sentinel', 'ndvi', 'validation', 'verify', 'ai'],
    response: `Our AI MRV (Measurement, Reporting & Verification) pipeline ingests **Copernicus Sentinel-2** multispectral imagery at 10m/pixel resolution. The engine executes spatial convolution filters to isolate NIR (Band B8) and Red (Band B4) channels, computing the NDVI Biomass Index. An NDVI above 0.80 signals healthy, dense canopy. Once verified, a cryptographic signature is generated and the project's on-chain status is updated to VERIFIED, unlocking the mint function.`,
  },
  {
    keywords: ['carbon', 'credit', 'offset', 'retire', 'burn', 'co2', 'sequestration'],
    response: `Blue carbon credits represent verified carbon dioxide sequestered in **coastal wetland ecosystems** — mangroves, seagrasses, and salt marshes. One credit = 1 tonne of CO₂ equivalent (tCO₂e) offset. Credits are minted as ERC-1155 tokens post-MRV verification. Corporations or individuals purchase credits to offset Scope 1/2/3 emissions. Retiring credits burns them on-chain, generating a public, timestamped offset certificate visible on OKLink block explorer.`,
  },
  {
    keywords: ['stripe', 'payment', 'fiat', 'card', 'buy', 'purchase', 'pay', 'usd'],
    response: `CarbonX supports both **Web3-native MATIC payments** and **traditional Stripe card checkout**. In the marketplace, clicking "Purchase Carbon Credits" opens a dual-channel drawer. The Stripe integration runs in sandbox mode using test keys — use card 4242 4242 4242 4242 for testing. Upon successful payment, a backend webhook fires \`mintCarbonCredits()\` on-chain via a server-side relayer wallet, automatically delivering ERC-1155 tokens to your address.`,
  },
  {
    keywords: ['role', 'ngo', 'validator', 'corporate', 'academic', 'register', 'persona'],
    response: `CarbonX has four user roles: **NGO/Project Proposers** submit mangrove restoration projects with metadata hashes and GPS coordinates. **Government Validators** run MRV pipelines and call \`verifyProject()\` to authorize minting. **Corporate Enterprise Buyers** purchase credits at scale via the marketplace. **Academic Auditors** perform independent third-party reviews of verification data. Each role unlocks different platform capabilities after registration.`,
  },
  {
    keywords: ['verra', 'ccts', 'gold standard', 'certification', 'badge', 'standard'],
    response: `Projects on CarbonX carry **third-party validator badges** from Verra (VCS Standard), CCTS (Climate, Community & Biodiversity Standards), or Gold Standard. These standards define rigorous requirements for additionality, permanence, and co-benefits measurement. Badge eligibility is reviewed during the initial project proposal phase before satellite MRV validation begins.`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'help', 'start', 'guide'],
    response: `Welcome to CarbonX! I can help you navigate the platform. You can explore the **Marketplace** to browse verified blue carbon projects, run **MRV validation** for satellite-verified sequestration data, check the **Ledger** for immutable on-chain retirement records, or connect your **MetaMask wallet** to interact with smart contracts on Polygon Mainnet. What would you like to explore?`,
  },
]

const TOUR_STEPS: { message: string; action?: () => void }[] = []

const QUICK_PILLS = [
  { label: '💡 Tour the Marketplace', action: 'tour_marketplace' },
  { label: '🌱 Learn About AI MRV', action: 'learn_mrv' },
  { label: '🔒 View Ledger Transparency', action: 'view_ledger' },
  { label: '🪙 How do tokens work?', action: 'tokens_info' },
]

// ─── Keyword matcher ─────────────────────────────────────────────
function getResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.response
    }
  }
  return `I didn't quite catch that! Try asking about **tokens & blockchain**, **MRV satellite validation**, **carbon credits**, **payments**, or **user roles**. You can also click one of the quick-action buttons above to start a guided tour.`
}

function makeId() {
  return Math.random().toString(36).slice(2)
}

function AssistantBubble({ message }: { message: Message }) {
  // Render basic markdown-like bold
  const rendered = message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-primary-500" />
      </div>
      <div className="max-w-[85%]">
        <div
          className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs text-[var(--text)] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
        {message.pills && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.pills.map(p => (
              <button
                key={p}
                className="text-[10px] font-medium bg-primary-500/10 hover:bg-primary-500/20 text-primary-500 border border-primary-500/20 px-2.5 py-1 rounded-full transition-colors"
                onClick={() => {
                  // Pills are handled by parent via data attribute — dispatch a custom event
                  window.dispatchEvent(new CustomEvent('chatbot-pill', { detail: p }))
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] bg-primary-500 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs leading-relaxed">
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2">
      <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary-500" />
      </div>
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

// ─── Tour engine ─────────────────────────────────────────────────
function runMarketplaceTour(addMessage: (m: Omit<Message, 'id' | 'timestamp'>) => void) {
  const steps = [
    { delay: 0,    msg: '🗺️ Starting marketplace tour! First, let me highlight the **Wallet Connector** in the navbar — this is how you authenticate with Polygon Mainnet.' },
    { delay: 2000, msg: '💼 The wallet connect button lets you link MetaMask, WalletConnect, or Coinbase Wallet. Without it, on-chain purchases are disabled.', highlight: '[data-tour="wallet"]' },
    { delay: 4500, msg: '🛒 Now scrolling to the **Project Marketplace Grid** — each card shows a verified blue carbon project with NDVI scores and Verra/CCTS badges.' },
    { delay: 6000, msg: '📦 Click **"Purchase Carbon Credits"** on any active project to open the dual-channel checkout drawer — pay with MATIC or Stripe card!', highlight: '[id^="project-card-"]', scroll: '#marketplace-grid' },
    { delay: 8500, msg: '✅ Tour complete! You now know how to browse and purchase verified blue carbon credits. Try the MRV page to see satellite validation in action.' },
  ]

  steps.forEach(({ delay, msg, highlight, scroll: scrollTo }) => {
    setTimeout(() => {
      addMessage({ role: 'assistant', content: msg })
      if (highlight) {
        const el = document.querySelector(highlight) as HTMLElement | null
        if (el) {
          el.classList.add('tour-highlight')
          setTimeout(() => el.classList.remove('tour-highlight'), 3000)
        }
      }
      if (scrollTo) {
        const el = document.querySelector(scrollTo)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, delay)
  })
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: makeId(), timestamp: new Date() }])
  }, [])

  // Welcome message on first open
  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true)
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: 'Hello! I am your **CarbonX AI Guide**. Select an onboarding option below to explore our platform.',
          pills: QUICK_PILLS.map(p => p.label),
        })
      }, 300)
    }
  }, [open, initialized, addMessage])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Listen for pill events
  useEffect(() => {
    const handler = (e: Event) => {
      const pill = (e as CustomEvent<string>).detail
      handlePillClick(pill)
    }
    window.addEventListener('chatbot-pill', handler)
    return () => window.removeEventListener('chatbot-pill', handler)
  }, [])

  const handlePillClick = (label: string) => {
    const action = QUICK_PILLS.find(p => p.label === label)?.action
    addMessage({ role: 'user', content: label })
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      if (action === 'tour_marketplace') {
        addMessage({ role: 'assistant', content: '🚀 Starting guided marketplace tour! Navigating you through the key UI elements...' })
        // Navigate to marketplace first
        if (typeof window !== 'undefined') {
          window.location.href = '/marketplace'
        }
        setTimeout(() => runMarketplaceTour(addMessage), 1500)
      } else if (action === 'learn_mrv') {
        addMessage({
          role: 'assistant',
          content: `Our **AI MRV Pipeline** uses Copernicus Sentinel-2 satellite imagery to automatically validate mangrove ecosystem health. The pipeline:
1. Ingests multispectral raster data at 10m resolution
2. Computes NDVI (Normalized Difference Vegetation Index) — a score above 0.80 = healthy canopy
3. Cross-references historical imagery to detect deforestation
4. Generates a cryptographic validation signature on successful verification

Head to the **MRV page** to run a live validation pipeline simulation!`,
        })
      } else if (action === 'view_ledger') {
        addMessage({
          role: 'assistant',
          content: `The **On-Chain Ledger** is CarbonX's transparency layer. Every carbon credit retirement is an irreversible ERC-1155 burn event recorded on Polygon Mainnet. You can view:
• The retiring wallet address
• Token ID and amount burned (tCO₂e)
• A retirement note (e.g. "Q2 2025 Scope 3 offset")
• The transaction hash verifiable on OKLink block explorer

This creates tamper-proof offset certificates that anyone can audit independently.`,
        })
      } else if (action === 'tokens_info') {
        addMessage({ role: 'assistant', content: getResponse('token blockchain polygon') })
      }
    }, 750)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    addMessage({ role: 'user', content: trimmed })
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      addMessage({ role: 'assistant', content: getResponse(trimmed) })
    }, 750)
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-500 text-white shadow-green-glow flex items-center justify-center glow-ring"
        whileHover={{ scale: 1.1, boxShadow: '0px 0px 16px rgba(52, 211, 153, 0.6)' }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[380px] max-h-[580px] flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-primary-500 rounded-t-2xl">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">CarbonX AI Guide</p>
                <p className="text-[10px] text-primary-100">Powered by keyword intelligence</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <span className="text-xs text-primary-100">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.role === 'assistant'
                      ? <AssistantBubble message={msg} />
                      : <UserBubble message={msg} />
                    }
                  </motion.div>
                ))}
              </AnimatePresence>
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 py-3 border-t border-[var(--border)] bg-[var(--card)]"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask anything about CarbonX…"
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-primary-500 transition-colors"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-8 h-8 rounded-xl bg-primary-500 disabled:opacity-40 flex items-center justify-center text-white shrink-0"
                whileTap={{ scale: 0.9 }}
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
