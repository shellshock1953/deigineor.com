import type { MetadataRoute } from 'next'

import { getLibraries, getReleases } from '../lib/data'
import { STORE_URL } from '../lib/email'
import { isStoreRequest } from '../lib/store'

// Per request: the store host serves its own sitemap.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await isStoreRequest()
  const base = () => (store ? STORE_URL : (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''))
  const legal = ['terms', 'privacy', 'refund'].map((p) => ({
    url: `${base()}/${p}`,
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  }))
  if (store) {
    const entries: MetadataRoute.Sitemap = [{ url: `${base()}/`, changeFrequency: 'weekly', priority: 1 }, ...legal]
    try {
      for (const l of (await getLibraries()).filter((l) => l.pricing === 'paid')) {
        entries.push({ url: `${base()}/instruments/${l.slug}`, lastModified: l.updatedAt, priority: 0.6 })
      }
    } catch {
      // No database at build time.
    }
    return entries
  }
  const entries: MetadataRoute.Sitemap = [
    { url: `${base()}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base()}/music`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base()}/game-audio`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base()}/instruments`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base()}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base()}/cv`, changeFrequency: 'monthly', priority: 0.5 },
    ...legal,
  ]

  // CI builds the image without a database; the base routes are enough there.
  // AfterChange hooks revalidate /sitemap.xml so new releases appear here too.
  try {
    const [releases, libraries] = await Promise.all([getReleases(), getLibraries()])
    for (const r of releases) {
      entries.push({
        url: `${base()}/music/${r.slug}`,
        lastModified: r.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
    for (const l of libraries) {
      entries.push({
        url: `${base()}/instruments/${l.slug}`,
        lastModified: l.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch {
    // No database at build time — ship the static routes only.
  }

  return entries
}
