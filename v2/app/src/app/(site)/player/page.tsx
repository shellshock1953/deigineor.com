import type { Metadata } from 'next'
import Link from 'next/link'

import { OS_NAME, OSES, getLatest } from '../../../lib/download/studio'

export const metadata: Metadata = {
  title: 'Librarium Player',
  description: 'Free edition of Librarium: load and play Librarium instruments in your DAW.',
}

// Reads the latest GitHub release per request; no prerender in CI.
export const dynamic = 'force-dynamic'

export default async function Player() {
  const token = process.env.GITHUB_RELEASES_TOKEN
  const latest = token ? await getLatest(token).catch(() => null) : null

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">Free · VST3</span>
        <h1>Librarium Player{latest ? ` ${latest.version}` : ''}</h1>
        <p className="page-head__sub">
          Free edition of Librarium: load and play Librarium instruments in your DAW. No account, no licence.
        </p>
      </header>

      <div className="downloads">
        {OSES.map((os) =>
          latest?.player[os] ? (
            <a key={os} className="btn btn--primary" href={`/api/download/player?os=${os}`}>
              Download for {OS_NAME[os]}
            </a>
          ) : (
            <p key={os} className="mono">
              {OS_NAME[os]}: coming soon.
            </p>
          ),
        )}
      </div>

      <div className="callout">
        <span>Want to build your own instruments?</span>
        <Link className="btn" href="/instruments/librarium">
          Librarium Studio →
        </Link>
      </div>
    </div>
  )
}
