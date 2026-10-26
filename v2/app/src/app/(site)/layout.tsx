import { OpenPanelComponent } from '@openpanel/nextjs'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Space_Grotesk, Unbounded } from 'next/font/google'
import type { ReactNode } from 'react'

import Footer from '../../components/Footer'
import Header from '../../components/Header'
import './site.css'

const display = Unbounded({
  subsets: ['latin'],
  variable: '--font-unbounded',
  display: 'swap',
})

const body = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'DEIGINEOR', template: '%s | DEIGINEOR' },
  description:
    'Deigineor — sound producer from Ukraine. Dark ambient to massive electronic grooves. Ambition Music Development.',
  openGraph: {
    type: 'website',
    siteName: 'DEIGINEOR',
    title: 'DEIGINEOR',
    description:
      'Deigineor — sound producer from Ukraine. Dark ambient to massive electronic grooves. Ambition Music Development.',
    images: ['/opengraph-image'],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: ['/favicon.ico', '/favicon.svg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#07090a',
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  // Read per request, not at build time.
  const openPanelClientId = process.env.OPENPANEL_CLIENT_ID

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {openPanelClientId && (
          <OpenPanelComponent
            clientId={openPanelClientId}
            trackScreenViews={true}
            // link_out {href} for every external link (streaming, Pianobook, stores), plus data-track buttons
            trackOutgoingLinks={true}
            trackAttributes={true}
            apiUrl="https://openpanel.libra.dnull.systems/api"
            scriptUrl="https://openpanel.libra.dnull.systems/op1.js"
          />
        )}
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
