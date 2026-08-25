import { Scale } from 'lucide-react'
const SECTIONS = [
  { title:'1. Acceptance of Terms', content:'By accessing or using CarbonX you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. CarbonX reserves the right to update these terms at any time with notice posted on the Platform.' },
  { title:'2. Description of Service', content:'CarbonX is a blockchain-based registry for blue carbon credits. The Platform allows NGOs to list projects, government validators to verify them via AI satellite MRV, and corporate buyers to purchase ERC-1155 carbon credit tokens on the Polygon Amoy network.' },
  { title:'3. User Accounts', content:'You must create an account to access most features. You are responsible for maintaining the security of your credentials and wallet private keys. CarbonX cannot recover lost private keys. You must be at least 18 years old to use the Platform.' },
  { title:'4. Carbon Credits and Tokens', content:'Carbon credits on CarbonX are ERC-1155 tokens on the Polygon blockchain. All purchases are final. Retired (burned) credits cannot be reversed, resold, or reused. CarbonX does not guarantee regulatory acceptance of credits in any particular jurisdiction.' },
  { title:'5. Fees and Payments', content:'CarbonX charges a 2.9% platform fee on card payments processed via Stripe. Web3/MATIC payments incur only blockchain gas fees. Project listing fees and MRV validation fees are charged separately. All fees are non-refundable except where required by law.' },
  { title:'6. Prohibited Activities', content:'You may not use the Platform to: commit fraud or misrepresentation, manipulate carbon credit prices, list projects without proper authorization, violate any applicable laws or regulations, or attempt to hack or gain unauthorized access to the Platform.' },
  { title:'7. Disclaimer of Warranties', content:'The Platform is provided as-is without warranties of any kind. CarbonX does not warrant that the Platform will be uninterrupted, error-free, or that credits will be accepted for regulatory compliance. NDVI satellite data is for informational purposes.' },
  { title:'8. Limitation of Liability', content:"CarbonX's total liability to you for any claim shall not exceed the fees paid by you in the 12 months preceding the claim. CarbonX is not liable for indirect, incidental, consequential, or punitive damages." },
  { title:'9. Governing Law', content:'These Terms are governed by the laws of India. Any disputes shall be resolved by arbitration in Bengaluru, Karnataka, India under the Arbitration and Conciliation Act, 1996.' },
  { title:'10. Contact', content:'For questions about these Terms, contact us at legal@carbonx.app or through our Contact page.' },
]
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center"><Scale className="w-5 h-5 text-primary-500"/></div>
        <div><h1 className="text-2xl font-bold text-[var(--text)]">Terms of Service</h1><p className="text-xs text-[var(--text-muted)]">Last updated: June 2025</p></div>
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
