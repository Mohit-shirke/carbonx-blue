import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import { ToastProvider } from '@/components/ui/Toast'
import { QueryProvider } from '@/components/ui/QueryProvider'
import { Web3Providers } from '@/components/web3/Web3Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { ScrollToTop } from '@/components/ui/ScrollToTop'
import { ProgressBar } from '@/components/ui/ProgressBar'

export const metadata: Metadata = {
  title: { default: 'CarbonX – Blockchain Blue Carbon Registry', template: '%s | CarbonX' },
  description: 'The world\'s first AI-verified blue carbon registry. Satellite-verified ERC-1155 carbon credits on Polygon with transparent on-chain retirement.',
  keywords: ['carbon credits', 'blue carbon', 'blockchain', 'MRV', 'polygon', 'ERC-1155', 'mangrove', 'sustainability', 'ESG', 'carbon offset'],
  authors: [{ name: 'CarbonX Team', url: 'https://carbonx.app' }],
  creator: 'CarbonX',
  publisher: 'CarbonX',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'CarbonX',
    title: 'CarbonX – Blockchain Blue Carbon Registry',
    description: 'AI-verified blue carbon credits as ERC-1155 tokens on Polygon. Transparent, satellite-verified, permanently retired on-chain.',
  },
  twitter: { card: 'summary_large_image', title: 'CarbonX – Blockchain Blue Carbon Registry', description: 'AI-verified blue carbon credits on Polygon.' },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#10B981' }, { media: '(prefers-color-scheme: dark)', color: '#34D399' }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <QueryProvider>
              <Web3Providers>
                <ProgressBar />
                <Navbar />
                <main className="pt-14 sm:pt-16 flex-1 bg-[var(--bg)] text-[var(--text)]">
                  {children}
                </main>
                <Footer />
                <ChatbotWidget />
                <CookieConsent />
                <ScrollToTop />
              </Web3Providers>
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
