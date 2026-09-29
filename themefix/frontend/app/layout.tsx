import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3Providers } from '@/components/web3/Web3Providers'
import { ThemeProvider }  from '@/hooks/useTheme'
import { Navbar }        from '@/components/layout/Navbar'
import { Footer }        from '@/components/layout/Footer'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { ScrollToTop }   from '@/components/layout/ScrollToTop'
import { ProgressBar }   from '@/components/layout/ProgressBar'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

const inter = Inter({ subsets:['latin'], display:'swap' })

export const metadata: Metadata = {
  title:       'CarbonX — Blue Carbon Registry',
  description: 'AI-verified mangrove blue carbon credits on Polygon blockchain.',
  keywords:    'carbon credits, blue carbon, mangrove, blockchain, Polygon, India, CCTS, ESG',
  authors:     [{ name:'CarbonX Research Group' }],
  openGraph: {
    title:      'CarbonX — Blue Carbon Registry',
    description:'AI-verified mangrove blue carbon credits on Polygon blockchain',
    url:        'https://carbonx.app',
    siteName:   'CarbonX',
    type:       'website',
  },
  twitter: {
    card:       'summary_large_image',
    title:      'CarbonX — Blue Carbon Registry',
    description:'AI-verified mangrove blue carbon credits on Polygon blockchain',
  },
  robots: { index:true, follow:true },
}

export const viewport: Viewport = {
  themeColor:'#10B981', width:'device-width', initialScale:1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html:`
          try {
            var t = localStorage.getItem('carbonx-theme') || 'dark';
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.className = t;
          } catch(e) {
            document.documentElement.setAttribute('data-theme', 'dark');
          }
        `}}/>
      </head>
      <body className={inter.className + ' bg-[var(--bg)] text-[var(--text)] min-h-screen'}>
        <Web3Providers>
          <ThemeProvider>
            <ProgressBar/>
            <Navbar/>
            <main className="pt-14 sm:pt-16 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
            <Footer/>
            <CookieConsent/>
            <ScrollToTop/>
            <ChatbotWidget/>
          </ThemeProvider>
        </Web3Providers>
      </body>
    </html>
  )
}
