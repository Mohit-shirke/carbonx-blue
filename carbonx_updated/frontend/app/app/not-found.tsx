import Link from 'next/link'
import { Leaf, Home, ShoppingBag } from 'lucide-react'
export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-6">
          <Leaf className="w-8 h-8 text-primary-500"/>
        </div>
        <h1 className="text-6xl font-bold text-primary-500 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-[var(--text)] mb-3">Page Not Found</h2>
        <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
          Looks like this page got lost in the mangroves. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Home className="w-4 h-4"/> Go Home
          </Link>
          <Link href="/marketplace" className="flex items-center justify-center gap-2 border border-[var(--border)] hover:border-primary-500 text-[var(--text)] font-medium px-5 py-2.5 rounded-xl text-sm transition-colors">
            <ShoppingBag className="w-4 h-4"/> View Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
