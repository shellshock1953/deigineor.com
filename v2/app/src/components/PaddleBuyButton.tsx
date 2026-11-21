'use client'

import Script from 'next/script'

import type { PaddleConfig } from '../lib/paddle'

type PaddleGlobal = {
  Initialized?: boolean
  Environment: { set: (env: string) => void }
  Initialize: (opts: {
    token: string
    eventCallback?: (e: { name?: string; data?: { transaction_id?: string } }) => void
  }) => void
  Checkout: { open: (opts: object) => void }
}

const paddle = () => (window as unknown as { Paddle?: PaddleGlobal }).Paddle

/** Loads Paddle.js v2 and initializes it; also opens a checkout for `?_ptxn=` links. */
export function PaddleScript({ env, token }: PaddleConfig) {
  return (
    <Script
      src="https://cdn.paddle.com/paddle/v2/paddle.js"
      strategy="afterInteractive"
      onReady={() => {
        const p = paddle()
        if (!p || p.Initialized) return
        if (env === 'sandbox') p.Environment.set('sandbox')
        p.Initialize({
          token,
          // Overlay or payment link: land on the page that shows the issued licence.
          eventCallback: (e) => {
            const id = e.data?.transaction_id
            if (e.name === 'checkout.completed' && id) {
              const url = new URL('/thanks', window.location.origin)
              url.searchParams.set('txn', id)
              window.location.href = url.href
            }
          },
        })
      }}
    />
  )
}

export default function PaddleBuyButton({
  config,
  priceId,
  slug,
  label,
}: {
  config: PaddleConfig
  priceId: string
  slug: string
  label: string
}) {
  return (
    <>
      <PaddleScript {...config} />
      <button
        type="button"
        className="btn btn--primary"
        data-track="library_get"
        data-library={slug}
        data-action="buy"
        onClick={() =>
          paddle()?.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            settings: {
              displayMode: 'overlay',
              successUrl: `${window.location.origin}/thanks`,
            },
          })
        }
      >
        {label}
      </button>
    </>
  )
}
