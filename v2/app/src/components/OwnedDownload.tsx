'use client'

import { useEffect, useState } from 'react'

import { PRODUCTS } from '../lib/products'

/** Shows "Download latest" to a signed-in buyer of this library; renders nothing for everyone else. */
export default function OwnedDownload({ slug }: { slug: string }) {
  const [version, setVersion] = useState<string | null | undefined>(undefined) // undefined: not owned

  useEffect(() => {
    const entitlement = Object.keys(PRODUCTS).find((k) => PRODUCTS[k].librarySlug === slug && PRODUCTS[k].studioDownloads)
    if (!entitlement) return
    fetch('/api/account/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then(async (me: { products: string[] } | null) => {
        if (!me?.products.includes(entitlement)) return
        const latest = await fetch('/api/download/studio/latest', { cache: 'no-store' })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null) // the button works without the version label
        setVersion(latest?.version ?? null)
      })
      .catch(() => {}) // signed-out look is the fallback
  }, [slug])

  if (version === undefined) return null
  return (
    <a className="btn btn--primary" href="/account" data-track="library_get" data-library={slug} data-action="download">
      Download latest{version ? ` v${version}` : ''}
    </a>
  )
}
