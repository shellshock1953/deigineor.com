import type { Metadata } from 'next'
import Link from 'next/link'

import FeatureGate from '../../../components/FeatureGate'
import { PaddleScript } from '../../../components/PaddleBuyButton'
import { getPaddleConfig } from '../../../lib/paddle'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

// Env is read per request (see lib/paddle.ts); no prerender without it.
export const dynamic = 'force-dynamic'

/** Paddle default payment link: Paddle.js opens the checkout for a `?_ptxn=txn_…` query on its own. */
export default function Checkout() {
  const config = getPaddleConfig()
  return (
    <div className="container">
      <h1>Checkout</h1>
      <FeatureGate
        flag="deigineor.sales-paused"
        fallback={
          <>
            <p>Your secure checkout opens here. If nothing appears, reload the page.</p>
            {config && <PaddleScript {...config} />}
          </>
        }
      >
        <p>Sales are paused for a moment, please try again later.</p>
      </FeatureGate>
      <p>
        <Link href="/instruments">Back to instruments</Link>
      </p>
    </div>
  )
}
