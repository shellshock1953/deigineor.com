import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { CoverImage, coverUrl } from '../../../../components/cards'
import Embed from '../../../../components/Embed'
import { formatDate, KIND_LABELS, releaseIndex, spotifyEmbedUrl } from '../../../../lib/format'
import { getReleaseBySlug, getReleases } from '../../../../lib/data'
import { excerpt } from '../../../../lib/rich-text'

export const revalidate = 60

/**
 * CI builds the image without a database, so params can only be listed when
 * the DB is reachable; unknown slugs are still rendered on demand at runtime
 * (`dynamicParams` default) and cached for 60s.
 */
export async function generateStaticParams() {
  try {
    const releases = await getReleases()
    return releases.map((r) => ({ slug: r.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const r = await getReleaseBySlug(slug)
  if (!r) return { title: 'Not found' }
  const description = excerpt(r.description, 160) || undefined
  const image = coverUrl(r.cover, 'og') ?? coverUrl(r.cover, 'card') ?? undefined
  return {
    title: r.title,
    description,
    openGraph: {
      title: r.title,
      description,
      type: 'music.album',
      images: image
        ? [{ url: image, alt: r.cover && typeof r.cover === 'object' ? r.cover.alt : undefined }]
        : undefined,
    },
  }
}

export default async function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [r, all] = await Promise.all([getReleaseBySlug(slug), getReleases()])
  if (!r) notFound()

  const slugs = all.map((x) => x.slug)
  const pos = slugs.indexOf(r.slug)
  const prev = pos > 0 ? all[pos - 1] : null
  const next = pos >= 0 && pos < all.length - 1 ? all[pos + 1] : null

  const links: { label: string; url: string }[] = []
  if (r.spotifyUrl) links.push({ label: 'Spotify', url: r.spotifyUrl })
  if (r.appleMusicUrl) links.push({ label: 'Apple Music', url: r.appleMusicUrl })
  if (r.youtubeId) links.push({ label: 'YouTube', url: `https://www.youtube.com/watch?v=${r.youtubeId}` })
  if (r.hyperfollowUrl) links.push({ label: 'All platforms', url: r.hyperfollowUrl })
  for (const l of r.extraLinks ?? []) links.push({ label: l.label, url: l.url })

  const spotifySrc = spotifyEmbedUrl(r.spotifyUrl)
  const poster = coverUrl(r.cover, 'card')

  return (
    <article className="container">
      <div className="detail">
        <div className="detail__media">
          <CoverImage media={r.cover} size="card" />
        </div>
        <div>
          <header className="detail__head">
            <div className="detail__meta">
              <span className="mono mono--accent">{releaseIndex(r.slug, slugs)}</span>
              <span className="mono">{KIND_LABELS[r.kind] ?? r.kind}</span>
              <time className="mono" dateTime={r.releaseDate}>
                {formatDate(r.releaseDate)}
              </time>
            </div>
            <h1 className="detail__title">{r.title}</h1>
            {r.genres && r.genres.length > 0 && (
              <div className="chips">
                {r.genres.map((g) => (
                  <span className="chip" key={g.id ?? g.genre}>
                    {g.genre}
                  </span>
                ))}
              </div>
            )}
          </header>

          {r.description && (
            <div className="rich-text">
              <RichText data={r.description} />
            </div>
          )}

          <div className="detail__links">
            {links.map((l) => (
              <a key={l.label} className="btn btn--sm" href={l.url} rel="noopener noreferrer">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {(r.youtubeId || spotifySrc) && (
        <section className="section" aria-label="Listen">
          <div className="detail__meta" style={{ marginBottom: 16 }}>
            <span className="section__kicker" style={{ marginBottom: 0 }}>
              Playback
            </span>
          </div>
          <div className="embeds">
            {r.youtubeId && <Embed kind="youtube" id={r.youtubeId} title={r.title} poster={poster} />}
            {spotifySrc && <Embed kind="spotify" src={spotifySrc} title={r.title} poster={poster} />}
          </div>
        </section>
      )}

      {r.tracklist && r.tracklist.length > 0 && (
        <section className="section" aria-labelledby="tracklist-h">
          <h2 id="tracklist-h" style={{ marginBottom: 18 }}>
            Tracklist
          </h2>
          <ol className="tracklist">
            {r.tracklist.map((t, i) => (
              <li key={t.id ?? i}>
                <span className="tracklist__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tracklist__title">{t.title}</span>
                {t.duration && <span className="tracklist__dur">{t.duration}</span>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <nav className="pager" aria-label="More releases">
        {prev ? (
          <Link className="pager__item" href={`/music/${prev.slug}`}>
            <span className="mono">← Newer</span>
            <span className="pager__title">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="pager__item pager__item--next" href={`/music/${next.slug}`}>
            <span className="mono">Older →</span>
            <span className="pager__title">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
