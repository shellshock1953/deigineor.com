/** Shared presentational helpers (all server-safe). */

export const KIND_LABELS: Record<string, string> = {
  single: 'Single',
  album: 'Album',
  ep: 'EP',
  ost: 'OST',
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** "2024-09-19T00:00:00.000Z" -> "19 Sep 2024" */
export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

/** Newest-first position of a release, as a rack-style catalogue number ("REL 018"). */
export function releaseIndex(slug: string, newestFirstSlugs: string[]): string {
  const pos = newestFirstSlugs.indexOf(slug)
  if (pos < 0) return 'REL —'
  return `REL ${String(newestFirstSlugs.length - pos).padStart(3, '0')}`
}

export function priceLabel(price: number, currency?: string | null): string {
  const symbol = currency === 'EUR' ? '€' : currency === 'UAH' ? '₴' : '$'
  return `${symbol}${price} ${currency ?? 'USD'}`
}

/** Spotify share URL -> embed URL, or null when it's not a Spotify link. */
export function spotifyEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/open\.spotify\.com\/(album|track|playlist|artist|episode|show)\/([A-Za-z0-9]+)/)
  if (!m) return null
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`
}
