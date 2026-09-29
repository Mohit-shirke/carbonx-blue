'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, Copy, CheckCheck, ChevronDown, ChevronRight,
  Shield, Zap, Globe, Lock, Key, BookOpen, ExternalLink
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface Endpoint {
  method: 'GET'|'POST'|'PUT'|'DELETE'
  path:   string
  desc:   string
  auth:   boolean
  body?:  string
  response: string
  example?: string
}

interface APIGroup {
  id:        string
  title:     string
  icon:      any
  color:     string
  endpoints: Endpoint[]
}

// ── API Reference Data ────────────────────────────────────────────
const API_GROUPS: APIGroup[] = [
  {
    id:'auth', title:'Authentication', icon:Lock, color:'text-blue-400',
    endpoints:[
      { method:'POST', path:'/api/v1/auth/register', auth:false, desc:'Register a new user account',
        body:`{
  "full_name": "Jane Smith",
  "email": "jane@company.com",
  "password": "SecurePass123!",
  "assigned_role": "corporate"
}`,
        response:`{
  "message": "Account created successfully.",
  "user": {
    "id": "uuid-v4",
    "email": "jane@company.com",
    "full_name": "Jane Smith",
    "assigned_role": "corporate"
  }
}` },
      { method:'POST', path:'/api/v1/auth/login', auth:false, desc:'Sign in and receive JWT cookie',
        body:`{
  "email": "jane@company.com",
  "password": "SecurePass123!"
}`,
        response:`{
  "message": "Signed in successfully.",
  "user": {
    "id": "uuid-v4",
    "email": "jane@company.com",
    "assigned_role": "corporate"
  }
}` },
      { method:'GET',  path:'/api/v1/auth/me',       auth:true,  desc:'Get current authenticated user',
        response:`{
  "user": {
    "id": "uuid-v4",
    "email": "jane@company.com",
    "full_name": "Jane Smith",
    "assigned_role": "corporate",
    "wallet_address": "0x1234…abcd",
    "created_at": "2025-06-20T10:00:00Z"
  }
}` },
      { method:'POST', path:'/api/v1/auth/logout',   auth:true,  desc:'Sign out and clear session cookie',
        response:`{ "message": "Signed out successfully." }` },
      { method:'POST', path:'/api/v1/auth/forgot-password', auth:false, desc:'Request password reset link via email',
        body:`{ "email": "jane@company.com" }`,
        response:`{ "message": "If that email exists, a reset link has been sent." }` },
    ]
  },
  {
    id:'projects', title:'Projects', icon:Globe, color:'text-primary-500',
    endpoints:[
      { method:'GET', path:'/api/v1/projects', auth:false, desc:'List all carbon projects with filters',
        example:'?status=active&ecosystem=mangrove&limit=10&page=1',
        response:`{
  "projects": [
    {
      "id": "uuid-v4",
      "name": "Sundarbans Mangrove Reserve",
      "ecosystem": "mangrove",
      "status": "active",
      "price_per_ton_usd": 28.50,
      "available_credits": 8200,
      "ndvi_score": 0.84,
      "validator_badge": "Verra",
      "token_id": 1001,
      "location": "West Bengal, India"
    }
  ],
  "total": 6,
  "page": 1
}` },
      { method:'GET', path:'/api/v1/projects/:id', auth:false, desc:'Get single project details by UUID',
        response:`{
  "id": "uuid-v4",
  "name": "Sundarbans Mangrove Reserve",
  "description": "UNESCO-listed mangrove delta…",
  "area_sq_km": 4262,
  "ndvi_score": 0.84,
  "price_per_ton_usd": 28.50,
  "available_credits": 8200,
  "issued_credits": 8240,
  "retired_credits": 1240,
  "token_id": 1001,
  "validator_badge": "Verra",
  "ecosystem": "mangrove",
  "status": "active"
}` },
    ]
  },
  {
    id:'mrv', title:'MRV Pipeline', icon:Zap, color:'text-amber-400',
    endpoints:[
      { method:'GET',  path:'/api/v1/mrv', auth:false, desc:'List all MRV runs with pagination',
        example:'?project_id=uuid&limit=20',
        response:`{
  "runs": [
    {
      "id": "uuid-v4",
      "project_id": "uuid-v4",
      "project_name": "Sundarbans",
      "ndvi_score": 0.84,
      "status": "verified",
      "created_at": "2025-06-15T10:00:00Z"
    }
  ]
}` },
      { method:'POST', path:'/api/v1/mrv/run', auth:true, desc:'Trigger full MRV pipeline for a project (IPCC Tier 2 + BEE BM FR05.001)',
        body:`{
  "project_id": "uuid-v4",
  "ndvi_score": 0.84,
  "baseline_ndvi": 0.35,
  "area_ha": 4262,
  "ecosystem": "mangrove",
  "region": "india_sundarbans",
  "project_age_yr": 1,
  "leakage_fraction": 0.10,
  "uncertainty_pct": 0.15
}`,
        response:`{
  "run_id": "uuid-v4",
  "status": "verified",
  "carbon_accounting": {
    "result": {
      "gross_co2e_tonnes": 12400.00,
      "net_co2e_tonnes": 9840.00,
      "creditable_co2e_tonnes": 8200.00,
      "annual_credits": 8200.00
    },
    "confidence": { "score": 88, "rating": "High" }
  },
  "permanence_risk": { "rating": "LOW", "buffer_required_pct": 10 },
  "double_counting": { "cleared": true },
  "evidence_graph": {
    "graph_id": "uuid-v4",
    "root_hash": "sha256-hash",
    "nodes": 8
  }
}` },
    ]
  },
  {
    id:'ledger', title:'Ledger', icon:Shield, color:'text-purple-400',
    endpoints:[
      { method:'GET',  path:'/api/v1/ledger', auth:false, desc:'List all on-chain retirement records',
        example:'?project_id=uuid&page=1&limit=20',
        response:`{
  "retirements": [
    {
      "id": "uuid-v4",
      "retirement_id": "CX-RET-ABC123",
      "project_name": "Sundarbans Mangrove Reserve",
      "amount": 500,
      "note": "Q2 2025 Scope 3 offset",
      "tx_hash": "0x3a2f…9b1c",
      "created_at": "2025-06-20T10:00:00Z"
    }
  ],
  "total": 6
}` },
      { method:'POST', path:'/api/v1/ledger/retire', auth:true, desc:'Retire (permanently burn) carbon credits',
        body:`{
  "project_id": "uuid-v4",
  "token_id": 1001,
  "amount": 100,
  "note": "Annual Scope 3 emissions offset — TechCorp India 2025"
}`,
        response:`{
  "message": "Credits retired successfully.",
  "retirement": {
    "id": "uuid-v4",
    "retirement_id": "CX-RET-A1B2C3",
    "amount": 100,
    "note": "Annual Scope 3 emissions offset…",
    "tx_hash": null,
    "created_at": "2025-06-20T10:00:00Z"
  }
}` },
    ]
  },
  {
    id:'payments', title:'Payments', icon:Key, color:'text-green-400',
    endpoints:[
      { method:'POST', path:'/api/v1/payments/intent', auth:true, desc:'Create Stripe payment intent for credit purchase',
        body:`{
  "project_id": "uuid-v4",
  "amount_tons": 10
}`,
        response:`{
  "client_secret": "pi_xxx_secret_xxx",
  "amount_usd_cents": 29355
}` },
      { method:'POST', path:'/api/v1/payments/webhook', auth:false, desc:'Stripe webhook endpoint (raw body, Stripe-Signature header required)',
        response:`{ "received": true }` },
    ]
  },
  {
    id:'email', title:'Email / Newsletter', icon:BookOpen, color:'text-teal-400',
    endpoints:[
      { method:'POST', path:'/api/v1/email/subscribe', auth:false, desc:'Subscribe to CarbonX newsletter',
        body:`{ "email": "user@company.com" }`,
        response:`{ "message": "Subscribed successfully! Check your email for confirmation." }` },
      { method:'POST', path:'/api/v1/email/contact', auth:false, desc:'Submit contact form message',
        body:`{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "subject": "Partnership enquiry",
  "message": "We are interested in CarbonX for our 2025 ESG programme…"
}`,
        response:`{ "message": "Message sent! We will reply within 24 hours." }` },
    ]
  },
]

const METHOD_COLORS: Record<string,string> = {
  GET:   'bg-blue-500/10  text-blue-400   border border-blue-500/20',
  POST:  'bg-primary-500/10 text-primary-500 border border-primary-500/20',
  PUT:   'bg-amber-500/10 text-amber-400  border border-amber-500/20',
  DELETE:'bg-red-500/10   text-red-400    border border-red-500/20',
}

function CodeBlock({ code, lang = 'json' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group">
      <div className="bg-[#0d1117] rounded-xl overflow-hidden border border-[#30363d]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d]">
          <span className="text-[10px] text-gray-500 font-mono">{lang}</span>
          <button onClick={copy} className="text-gray-500 hover:text-gray-300 transition-colors">
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500"/> : <Copy className="w-3.5 h-3.5"/>}
          </button>
        </div>
        <pre className="p-4 text-[11px] text-gray-300 font-mono overflow-x-auto leading-relaxed">{code}</pre>
      </div>
    </div>
  )
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-[var(--border)]/20 transition-colors">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
        <code className="text-xs sm:text-sm font-mono text-[var(--text)] flex-1">{ep.path}</code>
        {ep.auth && <Lock className="w-3 h-3 text-amber-400 shrink-0" title="Authentication required"/>}
        {open ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0"/> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0"/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} className="border-t border-[var(--border)] overflow-hidden">
            <div className="p-4 space-y-4 bg-[var(--bg)]">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-[var(--text-muted)]">{ep.desc}</p>
                {ep.auth && (
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5"/> JWT Auth Required
                  </span>
                )}
              </div>

              {ep.example && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Query Parameters</p>
                  <CodeBlock code={ep.example} lang="query"/>
                </div>
              )}

              {ep.body && (
                <div>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Request Body</p>
                  <CodeBlock code={ep.body} lang="json"/>
                </div>
              )}

              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Response (200 OK)</p>
                <CodeBlock code={ep.response} lang="json"/>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function APIDocsPage() {
  const [activeGroup, setActiveGroup] = useState('auth')
  const [baseUrl] = useState('http://localhost:4000')
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const group = API_GROUPS.find(g => g.id === activeGroup)!

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-5 h-5 text-primary-500"/>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">API Documentation</h1>
          <span className="text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20 px-2 py-0.5 rounded-full">v1.0</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">REST API · JSON · JWT Auth · Base URL: {baseUrl}</p>
      </div>

      {/* Quick start */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs font-bold text-[var(--text)] mb-2">🔐 Authentication</p>
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
            CarbonX uses JWT tokens stored in HTTP-only cookies. Call <code className="text-primary-500">/auth/login</code> to authenticate, then all subsequent requests carry the cookie automatically.
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-[var(--text)] mb-2">📦 Base URL</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-[10px] font-mono text-primary-500 bg-primary-500/10 px-2 py-1 rounded-lg flex-1 truncate">
              {baseUrl}
            </code>
            <button onClick={() => copy(baseUrl)} className="text-[var(--text-muted)] hover:text-primary-500 transition-colors shrink-0">
              {copied ? <CheckCheck className="w-3.5 h-3.5 text-primary-500"/> : <Copy className="w-3.5 h-3.5"/>}
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">Production: Set NEXT_PUBLIC_API_URL in .env</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-bold text-[var(--text)] mb-2">📋 Content Type</p>
          <code className="text-[10px] font-mono text-primary-500 bg-primary-500/10 px-2 py-1 rounded-lg block">Content-Type: application/json</code>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">All endpoints accept and return JSON. Include credentials for cookie-based auth.</p>
        </div>
      </div>

      {/* Rate limits */}
      <div className="card p-4 mb-6 border-amber-500/20 bg-amber-500/5">
        <p className="text-xs font-bold text-amber-400 mb-2">⚡ Rate Limits</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { endpoint:'Global API',         limit:'150 req / 15 min' },
            { endpoint:'Auth endpoints',     limit:'10 req / 15 min'  },
            { endpoint:'Password reset',     limit:'3 req / hour'     },
            { endpoint:'Registration',       limit:'5 req / hour'     },
          ].map(({ endpoint, limit }) => (
            <div key={endpoint} className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-[var(--text)]">{endpoint}</p>
              <p className="text-[10px] font-bold text-amber-400">{limit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick code example */}
      <div className="card p-4 sm:p-5 mb-6">
        <p className="text-xs font-bold text-[var(--text)] mb-3">🚀 Quick Start — Get all projects</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wider">JavaScript / Fetch</p>
            <CodeBlock code={`const res = await fetch(
  '${baseUrl}/api/v1/projects?status=active',
  { credentials: 'include' }
)
const { projects } = await res.json()
console.log(projects[0].name)
// → "Sundarbans Mangrove Reserve"`} lang="javascript"/>
          </div>
          <div>
            <p className="text-[10px] text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wider">cURL</p>
            <CodeBlock code={`curl -X GET \\
  "${baseUrl}/api/v1/projects?status=active" \\
  -H "Content-Type: application/json" \\
  --cookie "carbonx_token=YOUR_JWT"`} lang="bash"/>
          </div>
        </div>
      </div>

      {/* Main docs area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-2 sticky top-20">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">Endpoints</p>
            {API_GROUPS.map(g => (
              <button key={g.id} onClick={() => setActiveGroup(g.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${activeGroup===g.id?'bg-primary-500/10 text-primary-500':'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)]'}`}>
                {React.createElement(g.icon, { className:`w-3.5 h-3.5 ${g.color} shrink-0` })}
                {g.title}
                <span className="ml-auto text-[9px] bg-[var(--bg)] px-1.5 py-0.5 rounded-full">{g.endpoints.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            {React.createElement(group.icon, { className:`w-5 h-5 ${group.color}` })}
            <h2 className="text-base font-bold text-[var(--text)]">{group.title}</h2>
            <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded-full">
              {group.endpoints.length} endpoint{group.endpoints.length>1?'s':''}
            </span>
          </div>
          {group.endpoints.map((ep, i) => (
            <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
              <EndpointCard ep={ep}/>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Health check */}
      <div className="card p-4 mt-6">
        <p className="text-xs font-bold text-[var(--text)] mb-2">🏥 Health Check Endpoints</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { path:'/health',    desc:'Server status + timestamp'           },
            { path:'/health/db', desc:'PostgreSQL connection status'        },
          ].map(({ path, desc }) => (
            <div key={path} className="flex items-center gap-3 p-3 bg-[var(--bg)] rounded-xl">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">GET</span>
              <div>
                <code className="text-xs font-mono text-[var(--text)]">{path}</code>
                <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
