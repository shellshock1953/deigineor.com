import type { MetadataRoute } from 'next'

import { STORE_URL } from '../lib/email'
import { isStoreRequest } from '../lib/store'

// Per request: the store host serves its own robots.txt.
export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = (await isStoreRequest())
    ? STORE_URL
    : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
