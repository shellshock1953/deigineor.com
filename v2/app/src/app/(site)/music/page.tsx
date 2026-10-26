import type { Metadata } from 'next'
import Link from 'next/link'

import { ReleaseCard } from '../../../components/cards'
import { KIND_LABELS, releaseIndex } from '../../../lib/format'
import { getReleases } from '../../../lib/data'

export const metadata: Metadata = {
  title: 'Music',
  description: 'Releases by Deigineor — singles, albums and game soundtracks.',
}

// `?kind=` is read per request; nothing here may be prerendered without a DB.
export const dynamic = 'force-dynamic'

const KINDS = ['single', 'album', 'ep', 'ost'] as const

export default async function Music({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind } = await searchParams
  const releases = await getReleases()
  const active = KINDS.includes(kind as (typeof KINDS)[number]) ? kind : null
  const filtered = active ? releases.filter((r) => r.kind === active) : releases
  const slugs = releases.map((r) => r.slug)

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">CH 01 · Discography</span>
        <h1>Music</h1>
        <p className="page-head__sub">
          {releases.length} releases · {active ? `${KIND_LABELS[active]}s` : 'newest first'}
        </p>
      </header>

      <nav className="filters" aria-label="Filter releases by kind">
        <Link href="/music" aria-current={active === null ? 'page' : undefined}>
          All
        </Link>
        {KINDS.map((k) => (
          <Link key={k} href={`/music?kind=${k}`} aria-current={active === k ? 'page' : undefined}>
            {KIND_LABELS[k]}s
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="empty">Nothing here yet — the signal is still on the way.</p>
      ) : (
        <div className="grid">
          {filtered.map((r) => (
            <ReleaseCard key={r.id} release={r} relNumber={releaseIndex(r.slug, slugs)} />
          ))}
        </div>
      )}
    </div>
  )
}
