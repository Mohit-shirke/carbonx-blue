import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import { QueryProvider } from '@/components/ui/QueryProvider'
import { Web3Providers } from '@/components/web3/Web3Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'CarbonX – Blockchain Blue Carbon Registry & MRV',
  description: 'Transparent, verifiable carbon credit registry powered by ERC-1155 on Polygon with AI-driven MRV satellite validation.',
  keywords: ['carbon credits', 'blockchain', 'MRV', 'blue carbon', 'polygon', 'ERC-1155', 'mangrove'],
  authors: [{ name: 'CarbonX Team' }],
  openGraph: {
    title: 'CarbonX – Blockchain Blue Carbon Registry',
    description: 'Satellite-verified, blockchain-backed blue carbon credits on Polygon.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10B981',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            <QueryProvider>
              <Web3Providers>
                <Navbar />
                <main className="pt-14 sm:pt-16 flex-1 bg-[var(--bg)] text-[var(--text)]">
                  {children}
                </main>
                <Footer />
                <ChatbotWidget />
              </Web3Providers>
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
