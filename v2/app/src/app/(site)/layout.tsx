import { OpenPanelComponent } from '@openpanel/nextjs'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'DEIGINEOR', template: '%s | DEIGINEOR' },
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  // Read per request, not at build time.
  const openPanelClientId = process.env.OPENPANEL_CLIENT_ID

  return (
    <html lang="en">
      <body>
        {openPanelClientId && (
          <OpenPanelComponent
            clientId={openPanelClientId}
            trackScreenViews={true}
            apiUrl="https://openpanel.libra.dnull.systems/api"
            scriptUrl="https://openpanel.libra.dnull.systems/op1.js"
          />
        )}
        {children}
      </body>
    </html>
  )
}
