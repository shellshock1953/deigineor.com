import type { Metadata } from 'next'

import { LibraryCard } from '../../../components/cards'
import { getLibraries } from '../../../lib/data'
import { STORE_URL } from '../../../lib/email'
import { OS_NAME, OSES } from '../../../lib/download/studio'

export const metadata: Metadata = {
  title: 'Free Kontakt libraries',
  description: 'Free Kontakt libraries by Deigineor on Pianobook.',
}

// Same rationale as the other listing pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default async function Instruments() {
  // Paid software lives on the store host.
  const libraries = (await getLibraries()).filter((l) => l.pricing === 'free')

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">CH 03 · Libraries</span>
        <h1>Free Kontakt libraries</h1>
        <p className="page-head__sub">
          {libraries.length} free downloads on Pianobook.
        </p>
      </header>

      <div className="callout callout--solid">
        <span>
          <strong>Librarium Player</strong> — our own free sampler plugin.{' '}
          <span className="mono mono--accent">Free · {OSES.map((o) => OS_NAME[o]).join(' · ')}</span>
        </span>
        <a className="btn btn--primary" href={`${STORE_URL}/player`}>
          Get Player →
        </a>
      </div>

      {libraries.length === 0 ? (
        <p className="empty">Nothing here yet — the signal is still on the way.</p>
      ) : (
        <div className="grid" style={{ marginTop: 28 }}>
          {libraries.map((l) => (
            <LibraryCard key={l.id} library={l} />
          ))}
        </div>
      )}
    </div>
  )
}
