import type { Metadata } from 'next'

import LegalPage, { ContactLink } from '../../../components/LegalPage'
import { RESELLER } from '../../../lib/legal'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service and End User License Agreement for software sold on deigineor.com.',
}

// Same rationale as the other pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default function Terms() {
  return (
    <LegalPage title="Terms of Service">
      <h2>1. Who we are</h2>
      <p>
        This site is operated by Bohdan Sukhomlinov, an individual entrepreneur (sole proprietor)
        registered in Ukraine, trading as &quot;Deigineor&quot; (&quot;we&quot;, &quot;us&quot;).
        Contact: <ContactLink />.
      </p>

      <h2>2. Products and orders</h2>
      <p>
        We sell digital downloads: audio plugins and sample libraries. Orders are processed by{' '}
        {RESELLER}, which acts as Merchant of Record and is the seller of record. It is shown at
        checkout and handles payment, VAT/sales tax, invoices and refunds. Its own terms apply to
        the purchase transaction.
      </p>

      <h2>3. Software license (EULA)</h2>
      <p>
        When you buy a plugin you receive a personal, non-exclusive, non-transferable, perpetual
        license to use it. You may:
      </p>
      <ul>
        <li>install and use it on your own computers;</li>
        <li>use it commercially, including music and audio you make with it.</li>
      </ul>
      <p>You may not:</p>
      <ul>
        <li>copy, share, redistribute, sublicense, rent or resell the software or your license key;</li>
        <li>reverse engineer, decompile or disassemble the software.</li>
      </ul>
      <p>
        We keep all rights in the software that are not granted here. The license ends if you
        breach these terms.
      </p>

      <h2>4. Free libraries</h2>
      <p>
        Free libraries keep the terms of the place where they are hosted (for example Pianobook).
        Check the terms there before use.
      </p>

      <h2>5. Warranty and liability</h2>
      <p>
        The software is provided &quot;as is&quot;, without warranty of any kind. To the extent
        permitted by law, we are not liable for indirect or consequential damages, or for any loss
        beyond the price you paid for the product. Nothing here limits rights you have under
        mandatory consumer law.
      </p>

      <h2>6. Refunds and privacy</h2>
      <p>
        See the <a href="/refund">Refund Policy</a> and the <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of Ukraine.</p>
    </LegalPage>
  )
}
