import type { Metadata } from 'next'

import LegalPage, { ContactLink } from '../../../components/LegalPage'
import { RESELLER } from '../../../lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What data deigineor.com collects, why, and how to exercise your rights.',
}

// Same rationale as the other pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>Who is responsible</h2>
      <p>
        Bohdan Sukhomlinov, individual entrepreneur (sole proprietor) registered in Ukraine, trading
        as &quot;Deigineor&quot;. Contact for any data request: <ContactLink />.
      </p>

      <h2>Payments</h2>
      <p>
        We collect no payment data. Orders are handled by {RESELLER}, which processes your payment
        under its own privacy policy.
      </p>

      <h2>Order data</h2>
      <p>
        We receive from {RESELLER} your name, email, country and order details. We use them only to
        deliver the product, issue the license and give support.
      </p>

      <h2>Site analytics</h2>
      <p>
        We use OpenPanel, a web analytics tool that we host ourselves, to see which pages are
        visited and which outgoing links are clicked. We use no advertising trackers.
      </p>

      <h2>Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>have inaccurate data corrected (rectification);</li>
        <li>have your data deleted.</li>
      </ul>
      <p>Write to us to use any of them.</p>
    </LegalPage>
  )
}
