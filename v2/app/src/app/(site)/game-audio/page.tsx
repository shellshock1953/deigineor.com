import type { Metadata } from 'next'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import Embed from '../../../components/Embed'
import { formatDate, KIND_LABELS } from '../../../lib/format'
import { getReleases, getVideos } from '../../../lib/data'

export const metadata: Metadata = {
  title: 'Game audio',
  description: 'Game audio by Deigineor — Wwise and Unreal Engine 5 implementation reels and original game soundtracks.',
}

// Same rationale as the other listing pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default async function GameAudio() {
  const [videos, releases] = await Promise.all([getVideos(), getReleases()])
  const osts = releases.filter((r) => r.kind === 'ost')
  const tools = [...new Set(videos.flatMap((v) => (v.tools ?? []).map((t) => t.tool)))]

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">CH 02 · Game audio</span>
        <h1>Game audio</h1>
        <p className="page-head__sub">
          Audio implementation demos and original game soundtracks.
        </p>
      </header>

      {tools.length > 0 && (
        <div className="chips" aria-label="Tools">
          {tools.map((t) => (
            <span className="chip chip--accent" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}

      {videos.length === 0 ? (
        <p className="empty" style={{ marginTop: 28 }}>
          No videos yet.
        </p>
      ) : (
        <section className="section" aria-labelledby="reels-h">
          <div className="section__head">
            <div>
              <span className="section__kicker">Wwise first</span>
              <h2 id="reels-h">Implementation reels</h2>
            </div>
          </div>
          {videos.map((v) => (
            <div className="video-card" key={v.id}>
              <Embed kind="youtube" id={v.youtubeId} title={v.title} />
              <div className="video-card__body">
                <h3 className="video-card__title">{v.title}</h3>
                <div className="video-card__row">
                  <span className="mono">{v.category.toUpperCase()}</span>
                  {v.tools?.map((t) => (
                    <span className="chip" key={t.id ?? t.tool}>
                      {t.tool}
                    </span>
                  ))}
                  {v.relatedRelease && typeof v.relatedRelease !== 'number' && (
                    <Link className="chip chip--accent" href={`/music/${v.relatedRelease.slug}`}>
                      OST: {v.relatedRelease.title}
                    </Link>
                  )}
                </div>
                {v.description && (
                  <div className="rich-text" style={{ marginTop: 14 }}>
                    <RichText data={v.description} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {osts.length > 0 && (
        <section className="section" aria-labelledby="osts-h">
          <div className="section__head">
            <div>
              <span className="section__kicker">CH 01 · Soundtracks</span>
              <h2 id="osts-h">Original game soundtracks</h2>
            </div>
          </div>
          <ul className="tracklist">
            {osts.map((r) => (
              <li key={r.id}>
                <span className="tracklist__num">{formatDate(r.releaseDate).slice(-4)}</span>
                <span className="tracklist__title">
                  <Link href={`/music/${r.slug}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
                    {r.title}
                  </Link>
                </span>
                <span className="tracklist__dur">{KIND_LABELS[r.kind]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
