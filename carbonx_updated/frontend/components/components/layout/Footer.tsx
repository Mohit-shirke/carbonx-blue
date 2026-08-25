import Link from 'next/link'
import { Leaf, Github, Mail } from 'lucide-react'

// ── X (Twitter) SVG icon — correct 2024 logo ─────────────────────
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="X (formerly Twitter)">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z"/>
    </svg>
  )
}

const LINKS = {
  Platform: [
    { href:'/marketplace', label:'Marketplace'       },
    { href:'/dashboard',   label:'Dashboard'         },
    { href:'/mrv',         label:'MRV Pipeline'      },
    { href:'/ledger',      label:'Ledger'            },
    { href:'/calculator',  label:'Carbon Calculator' },
    { href:'/pricing',     label:'Pricing'           },
  ],
  Company: [
    { href:'/about',    label:'About Us'  },
    { href:'/blog',     label:'Blog'      },
    { href:'/feedback', label:'Feedback'  },
    { href:'/contact',  label:'Contact'   },
  ],
  Legal: [
    { href:'/terms',   label:'Terms of Service' },
    { href:'/privacy', label:'Privacy Policy'   },
  ],
  Blockchain: [
    { href:'https://www.oklink.com/amoy',        label:'OKLink Explorer', ext:true },
    { href:'https://faucet.polygon.technology/', label:'Polygon Faucet',  ext:true },
    { href:'https://dashboard.stripe.com',       label:'Stripe Sandbox',  ext:true },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-white"/>
              </div>
              <span className="font-bold text-base text-[var(--text)]">
                Carbon<span className="text-primary-500">X</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              AI-verified blue carbon registry. Satellite-validated ERC-1155 credits on Polygon with transparent on-chain retirement.
            </p>
            <div className="flex items-center gap-2">
              {/* GitHub */}
              <a href="https://github.com/carbonx-registry" target="_blank" rel="noopener noreferrer"
                aria-label="GitHub" title="GitHub"
                className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors">
                <Github className="w-3.5 h-3.5"/>
              </a>
              {/* X (formerly Twitter) — correct SVG logo */}
              <a href="https://x.com/carbonx_app" target="_blank" rel="noopener noreferrer"
                aria-label="X (formerly Twitter)" title="X (formerly Twitter)"
                className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors">
                <XIcon className="w-3.5 h-3.5"/>
              </a>
              {/* Email */}
              <a href="mailto:support@carbonx.app" aria-label="Email us" title="Email us"
                className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-primary-500 hover:border-primary-500 transition-colors">
                <Mail className="w-3.5 h-3.5"/>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">{section}</h4>
              <ul className="space-y-2">
                {links.map((l: any) => (
                  <li key={l.label}>
                    {l.ext ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                        {l.label} ↗
                      </a>
                    ) : (
                      <Link href={l.href}
                        className="text-xs text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} CarbonX. Open-source blue carbon registry. MIT License.
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"/>
              Polygon Amoy
            </span>
            <span>·</span>
            <span>ERC-1155</span>
            <span>·</span>
            <span>Sentinel-2 MRV</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
