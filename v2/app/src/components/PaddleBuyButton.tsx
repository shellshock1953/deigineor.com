'use client'

import Script from 'next/script'

import type { PaddleConfig } from '../lib/paddle'

type PaddleGlobal = {
  Initialized?: boolean
  Environment: { set: (env: string) => void }
  Initialize: (opts: { token: string }) => void
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
        p.Initialize({ token })
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
              successUrl: `${window.location.origin}/instruments/${slug}?purchased=1`,
            },
          })
        }
      >
        {label}
      </button>
    </>
  )
}
