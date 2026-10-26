import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Payload local-API helpers for the public site.
 * `getPayload` caches the instance per config, so the Postgres pool is reused.
 */

const payload = () => getPayload({ config })

export async function getSite() {
  return payload().then((p) => p.findGlobal({ slug: 'site' }))
}

export async function getReleases() {
  const { docs } = await payload().then((p) =>
    p.find({ collection: 'releases', sort: '-releaseDate', depth: 1, limit: 200, pagination: false }),
  )
  return docs
}

export async function getReleaseBySlug(slug: string) {
  const { docs } = await payload().then((p) =>
    p.find({ collection: 'releases', where: { slug: { equals: slug } }, depth: 1, limit: 1 }),
  )
  return docs[0] ?? null
}

export async function getVideos() {
  const { docs } = await payload().then((p) =>
    p.find({ collection: 'videos', sort: 'order', depth: 1, limit: 100, pagination: false }),
  )
  // Wwise reels first, everything else after — within a category by `order`.
  const rank = (c: string) => (c === 'wwise' ? 0 : c === 'showreel' ? 1 : 2)
  return [...docs].sort((a, b) => rank(a.category) - rank(b.category) || (a.order ?? 0) - (b.order ?? 0))
}

export async function getLibraries() {
  const { docs } = await payload().then((p) =>
    p.find({ collection: 'libraries', sort: 'order', depth: 1, limit: 100, pagination: false }),
  )
  return docs
}

export async function getLibraryBySlug(slug: string) {
  const { docs } = await payload().then((p) =>
    p.find({ collection: 'libraries', where: { slug: { equals: slug } }, depth: 1, limit: 1 }),
  )
  return docs[0] ?? null
}
