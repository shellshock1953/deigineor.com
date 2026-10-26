import Link from 'next/link'

import { CoverImage, LibraryCard, ReleaseCard } from '../../components/cards'
import Embed from '../../components/Embed'
import { Wordmark } from '../../components/Logo'
import Oscilloscope from '../../components/Oscilloscope'
import { formatDate, KIND_LABELS, releaseIndex } from '../../lib/format'
import { getLibraries, getReleases, getSite, getVideos } from '../../lib/data'
import { excerpt } from '../../lib/rich-text'

// Rendered per request: the Docker image is built without a database
// (CI runs `next build` with no Postgres), so no page may be prerendered
// at build time. Payload's local API is pooled, so this stays cheap.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [site, releases, videos, libraries] = await Promise.all([
    getSite(),
    getReleases(),
    getVideos(),
    getLibraries(),
  ])

  const featured = releases.find((r) => r.featured) ?? releases[0]
  const latest = releases.filter((r) => r.id !== featured?.id).slice(0, 6)
  const slugs = releases.map((r) => r.slug)
  const reel = videos.find((v) => v.category === 'wwise') ?? videos[0]
  const strip = libraries.slice(0, 3)
  const aboutExcerpt = excerpt(site.about, 240)

  return (
    <>
      <section className="hero container" aria-labelledby="hero-title">
        <h1 className="hero__logo" id="hero-title">
          <Wordmark />
        </h1>
        {site.tagline && <p className="hero__tagline">{site.tagline}</p>}
        {site.shortBio && <p className="hero__bio">{site.shortBio}</p>}
        <div className="hero__ctas">
          <Link className="btn btn--primary" href="/music">
            Listen
          </Link>
          <Link className="btn" href="/game-audio">
            Game audio
          </Link>
          <Link className="btn" href="/instruments">
            Instruments
          </Link>
        </div>
        <div className="hero__scope">
          <Oscilloscope />
        </div>
      </section>

      {featured && (
        <section className="section" aria-labelledby="latest-h">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="section__kicker">CH 01 · Releases</span>
                <h2 id="latest-h">{featured.featured ? 'Featured release' : 'Latest release'}</h2>
              </div>
              <Link className="btn btn--sm" href="/music">
                All releases
              </Link>
            </div>
            <div className="feature">
              <div className="feature__media">
                <CoverImage media={featured.cover} size="card" />
              </div>
              <div className="feature__body">
                <h3 className="feature__title">
                  <Link href={`/music/${featured.slug}`}>{featured.title}</Link>
                </h3>
                <div className="chips" style={{ marginTop: 12 }}>
                  <span className="chip chip--accent">{KIND_LABELS[featured.kind] ?? featured.kind}</span>
                  <span className="chip">{formatDate(featured.releaseDate)}</span>
                  {featured.genres?.slice(0, 4).map((g) => (
                    <span className="chip" key={g.id ?? g.genre}>
                      {g.genre}
                    </span>
                  ))}
                </div>
                {featured.description && (
                  <div className="feature__desc">{excerpt(featured.description, 220)}</div>
                )}
                <div className="feature__actions">
                  <Link className="btn btn--sm" href={`/music/${featured.slug}`}>
                    Open release
                  </Link>
                  {featured.spotifyUrl && (
                    <a className="btn btn--sm" href={featured.spotifyUrl} rel="noopener noreferrer">
                      Spotify
                    </a>
                  )}
                  {featured.youtubeId && (
                    <a
                      className="btn btn--sm"
                      href={`https://www.youtube.com/watch?v=${featured.youtubeId}`}
                      rel="noopener noreferrer"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            </div>
            {latest.length > 0 && (
              <div className="releases-grid-wrap" style={{ marginTop: 32 }}>
                <div className="grid">
                  {latest.map((r) => (
                    <ReleaseCard key={r.id} release={r} relNumber={releaseIndex(r.slug, slugs)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {reel && (
        <section className="section" aria-labelledby="reel-h">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="section__kicker">CH 02 · Game audio</span>
                <h2 id="reel-h">Wwise & Unreal Engine 5</h2>
              </div>
              <Link className="btn btn--sm" href="/game-audio">
                All videos
              </Link>
            </div>
            <Embed kind="youtube" id={reel.youtubeId} title={reel.title} />
            <div className="chips" style={{ marginTop: 14 }}>
              {reel.tools?.map((t) => (
                <span className="chip chip--accent" key={t.id ?? t.tool}>
                  {t.tool}
                </span>
              ))}
              {reel.relatedRelease && typeof reel.relatedRelease !== 'number' && (
                <Link className="chip" href={`/music/${reel.relatedRelease.slug}`}>
                  OST: {reel.relatedRelease.title}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {strip.length > 0 && (
        <section className="section" aria-labelledby="instruments-h">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="section__kicker">CH 03 · Instruments</span>
                <h2 id="instruments-h">Sample libraries & plugins</h2>
              </div>
              <Link className="btn btn--sm" href="/instruments">
                All instruments
              </Link>
            </div>
            <div className="instruments-strip">
              {strip.map((l) => (
                <LibraryCard key={l.id} library={l} />
              ))}
            </div>
          </div>
        </section>
      )}

      {aboutExcerpt && (
        <section className="section" aria-labelledby="about-h">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="section__kicker">CH 04 · About</span>
                <h2 id="about-h">Deigineor</h2>
              </div>
              <Link className="btn btn--sm" href="/about">
                Full bio
              </Link>
            </div>
            <p className="page-head__sub" style={{ marginTop: 0 }}>
              {aboutExcerpt.slice(0, 240)}
              {aboutExcerpt.length > 240 ? '…' : ''}
            </p>
          </div>
        </section>
      )}

      {site.platformLinks && site.platformLinks.length > 0 && (
        <section className="section" aria-labelledby="platforms-h">
          <div className="container">
            <div className="section__head">
              <div>
                <span className="section__kicker">CH 05 · Platforms</span>
                <h2 id="platforms-h">Listen everywhere</h2>
              </div>
            </div>
            <div className="chips">
              {site.platformLinks.map((l) => (
                <a
                  className="chip"
                  key={l.id ?? l.platform}
                  href={l.url}
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  {l.platform}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
