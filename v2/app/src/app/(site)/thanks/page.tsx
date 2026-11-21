import type { Metadata } from 'next'

import { ContactLink } from '../../../components/LegalPage'
import LicenseDownload from '../../../components/LicenseDownload'

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
}

// The licence is looked up per visit; no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default async function Thanks({ searchParams }: { searchParams: Promise<{ txn?: string }> }) {
  const { txn } = await searchParams
  return (
    <div className="container">
      <header className="page-head">
        <h1>Thank you</h1>
      </header>
      <div className="rich-text" style={{ maxWidth: '72ch', marginTop: 24 }}>
        {txn && /^txn_[0-9a-z]{1,64}$/.test(txn) ? (
          <LicenseDownload txn={txn} contact={<ContactLink />} />
        ) : (
          <p>
            We could not find your order reference. Use the link in your Paddle receipt, or contact us at{' '}
            <ContactLink />.
          </p>
        )}
      </div>
    </div>
  )
}
