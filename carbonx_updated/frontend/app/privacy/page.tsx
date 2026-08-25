import { Shield } from 'lucide-react'
const SECTIONS = [
  { title:'1. Information We Collect', content:'We collect: (a) Account information — name, email, and optional wallet address. (b) Transaction data — purchases, retirements, and blockchain hashes. (c) Usage data — pages visited and device information. (d) MRV data — satellite imagery results for submitted projects.' },
  { title:'2. How We Use Your Information', content:"We use your information to: provide and improve the Platform, process carbon credit transactions, run AI satellite MRV validation, send account and transaction notifications, comply with legal obligations, and improve Mira AI's responses." },
  { title:'3. Blockchain Transparency', content:'All carbon credit purchases, minting events, and retirement transactions are permanently recorded on the Polygon blockchain and are publicly visible. Wallet addresses and transaction amounts are public. We do not control this transparency — it is fundamental to blockchain technology.' },
  { title:'4. Data Sharing', content:'We do not sell your personal data. We share data only with: Stripe for payment processing, Alchemy for blockchain RPC services, and law enforcement when required by law.' },
  { title:'5. Data Security', content:'We use industry-standard security measures: JWT tokens in HTTP-only cookies, bcrypt password hashing, HTTPS encryption, rate limiting on all API endpoints, and regular security audits.' },
  { title:'6. Your Rights (DPDP Act 2023)', content:"Under India's Digital Personal Data Protection Act 2023, you have the right to: access your personal data, correct inaccurate data, erase your account data (subject to blockchain immutability), and nominate a representative. Contact privacy@carbonx.app to exercise these rights." },
  { title:'7. Cookies', content:'We use essential cookies for authentication (carbonx_token) and theme preferences. We do not use advertising or tracking cookies.' },
  { title:'8. Data Retention', content:'We retain account data for as long as your account is active. Transaction records are kept for 7 years for legal compliance. Blockchain records are permanent and cannot be deleted.' },
  { title:'9. Contact', content:'For privacy concerns, contact our Data Protection Officer at privacy@carbonx.app or write to: CarbonX Privacy Team, Bengaluru, Karnataka 560001, India.' },
]
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center"><Shield className="w-5 h-5 text-primary-500"/></div>
        <div><h1 className="text-2xl font-bold text-[var(--text)]">Privacy Policy</h1><p className="text-xs text-[var(--text-muted)]">Last updated: June 2025 · Compliant with India DPDP Act 2023</p></div>
      </div>
      <div className="space-y-4">
        {SECTIONS.map(s=>(
          <div key={s.title} className="card p-4 sm:p-5">
            <h2 className="font-semibold text-sm sm:text-base text-[var(--text)] mb-2">{s.title}</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
