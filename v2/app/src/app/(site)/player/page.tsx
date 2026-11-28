import type { Metadata } from 'next'
import Link from 'next/link'

import { PreviousVersions } from '../../../components/PreviousVersions'
import { OS_NAME, OSES, getReleases } from '../../../lib/download/studio'

export const metadata: Metadata = {
  title: 'Librarium Player',
  description: 'Free edition of Librarium: load and play Librarium instruments in your DAW.',
}

// Reads the latest GitHub release per request; no prerender in CI.
export const dynamic = 'force-dynamic'

export default async function Player() {
  const token = process.env.GITHUB_RELEASES_TOKEN
  const releases = token ? await getReleases(token).catch(() => []) : []
  const latest = releases[0]

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
      <PreviousVersions releases={releases} zip="player" href={(v, os) => `/api/download/player?os=${os}&version=${v}`} />

      <div className="callout">
        <span>Want to build your own instruments?</span>
        <Link className="btn" href="/instruments/librarium">
          Librarium Studio →
        </Link>
      </div>
    </div>
  )
}
