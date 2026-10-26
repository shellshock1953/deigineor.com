import Link from 'next/link'
import type { Library, Media, Release } from '../payload-types'
import { KIND_LABELS, formatDate, priceLabel } from '../lib/format'

export function coverUrl(media: number | Media | null | undefined, size: 'thumb' | 'card' | 'og') {
  if (!media || typeof media === 'number') return null
  return media.sizes?.[size]?.url ?? media.url ?? null
}

export function coverDims(media: number | Media | null | undefined, size: 'thumb' | 'card' | 'og') {
  if (!media || typeof media === 'number') return null
  const s = media.sizes?.[size]
  if (s?.width && s?.height) return { width: s.width, height: s.height }
  if (media.width && media.height) return { width: media.width, height: media.height }
  return null
}

/** Cover image with explicit dimensions (no layout shift); `alt` from the media record. */
export function CoverImage({
  media,
  size,
  className,
}: {
  media: number | Media | null | undefined
  size: 'thumb' | 'card' | 'og'
  className?: string
}) {
  const url = coverUrl(media, size)
  const dims = coverDims(media, size)
  if (!url) return null
  const alt = media && typeof media === 'object' ? (media.alt ?? '') : ''
  return (
    // eslint-disable-next-line @next/next/no-img-element -- Payload serves the sizes; dimensions are known
    <img
      className={className}
      src={url}
      alt={alt}
      width={dims?.width}
      height={dims?.height}
      loading="lazy"
      decoding="async"
    />
  )
}

export function ReleaseCard({ release, relNumber }: { release: Release; relNumber?: string }) {
  return (
    <Link className="card card--link" href={`/music/${release.slug}`}>
      <div className="card__media">
        <CoverImage media={release.cover} size="card" />
      </div>
      <div className="card__body">
        <div className="card__meta">
          {relNumber && <span className="mono">{relNumber}</span>}
          <span className="mono">{formatDate(release.releaseDate)}</span>
          <span className="mono">{KIND_LABELS[release.kind] ?? release.kind}</span>
        </div>
        <h3 className="card__title">{release.title}</h3>
        {release.genres && release.genres.length > 0 && (
          <div className="chips" aria-label="Genres">
            {release.genres.slice(0, 3).map((g) => (
              <span className="chip" key={g.id ?? g.genre}>
                {g.genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function LibraryCard({ library }: { library: Library }) {
  const pricing =
    library.pricing === 'paid' && library.price != null ? priceLabel(library.price, library.currency) : 'Free'
  return (
    <Link className="card card--link" href={`/instruments/${library.slug}`}>
      <div className="card__media">
        <CoverImage media={library.image} size="card" />
      </div>
      <div className="card__body">
        <div className="card__meta">
          <span className="mono">{library.kind === 'plugin' ? 'Plugin' : 'Sample library'}</span>
          <span className={`mono${library.pricing === 'paid' ? '' : ' mono--accent'}`}>{pricing}</span>
        </div>
        <h3 className="card__title">{library.title}</h3>
        {library.tagline && <p className="card__tagline">{library.tagline}</p>}
      </div>
    </Link>
  )
}
