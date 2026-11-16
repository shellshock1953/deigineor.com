import type { Metadata } from 'next'

import LegalPage, { ContactLink } from '../../../components/LegalPage'
import { RESELLER } from '../../../lib/legal'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Full refund within 14 days of purchase, no questions asked.',
}

// Same rationale as the other pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default function Refund() {
  return (
    <LegalPage title="Refund Policy">
      <h2>14-day refund</h2>
      <p>
        If you are not happy with a product, ask for a full refund within 14 days of purchase. No
        questions asked.
      </p>

      <h2>How to request it</h2>
      <ul>
        <li>
          Through {RESELLER}: use the link in your order email.
        </li>
        <li>
          Or contact us at <ContactLink /> with the email you used for the order.
        </li>
      </ul>
      <p>
        Refunds are paid out by {RESELLER} to the original payment method. After a refund the
        license for that product ends.
      </p>
    </LegalPage>
  )
}
