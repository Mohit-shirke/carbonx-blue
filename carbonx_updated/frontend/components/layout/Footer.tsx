import Link from 'next/link'
import { Leaf, Github, Mail } from 'lucide-react'

function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="X (formerly Twitter)">
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
    </svg>
  )
}

const LINKS = {
  Platform:   [{ href:'/marketplace',label:'Marketplace'},{ href:'/dashboard',label:'Dashboard'},{ href:'/mrv',label:'MRV Pipeline'},{ href:'/ledger',label:'Ledger'},{ href:'/calculator',label:'Calculator'},{ href:'/pricing',label:'Pricing'}],
  Company:    [{ href:'/about',label:'About Us'},{ href:'/blog',label:'Blog'},{ href:'/feedback',label:'Feedback'},{ href:'/contact',label:'Contact'}],
  Legal:      [{ href:'/terms',label:'Terms of Service'},{ href:'/privacy',label:'Privacy Policy'}],
  Blockchain: [{ href:'https://www.oklink.com/polygon',label:'OKLink Explorer',ext:true},{ href:'https://polygonscan.com',label:'Polygonscan',ext:true}],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white"/>
              </div>
              <span className="font-bold text-base text-[var(--text)]">Carbon<span className="text-primary-500">X</span></span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">AI-verified blue carbon registry. Satellite-validated ERC-1155 credits on Polygon with transparent on-chain retirement.</p>
            <div className="flex items-center gap-2">
              <a href="https://github.com/carbonx-registry" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository"
                className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <Github className="w-4 h-4"/>
              </a>
              <a href="https://x.com/carbonx_app" target="_blank" rel="noopener noreferrer" aria-label="X (formerly Twitter)" title="Follow on X"
                className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <XLogo className="w-3.5 h-3.5"/>
              </a>
              <a href="mailto:support@carbonx.app" aria-label="Email Support"
                className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                <Mail className="w-4 h-4"/>
              </a>
            </div>
          </div>
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((l: any) => (
                  <li key={l.label}>
                    {l.ext ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-muted)] hover:text-primary-500 transition-colors inline-block py-0.5">{l.label} ↗</a>
                    ) : (
                      <Link href={l.href} className="text-sm text-[var(--text-muted)] hover:text-primary-500 transition-colors inline-block py-0.5">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} CarbonX. Open-source blue carbon registry. MIT License.</p>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>Polygon</span>
            <span>·</span><span>ERC-1155</span><span>·</span><span>Sentinel-2 MRV</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
