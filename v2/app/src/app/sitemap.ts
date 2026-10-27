import type { MetadataRoute } from 'next'

import { getLibraries, getReleases } from '../lib/data'

export const revalidate = 60

const base = () => (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${base()}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base()}/music`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base()}/game-audio`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base()}/instruments`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base()}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base()}/cv`, changeFrequency: 'monthly', priority: 0.5 },
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
