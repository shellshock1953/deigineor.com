import type { Metadata } from 'next'

import { LibraryCard } from '../../../components/cards'
import { getLibraries } from '../../../lib/data'

export const metadata: Metadata = {
  title: 'Instruments',
  description: 'Sample libraries and plugins by Deigineor — free Kontakt libraries on Pianobook and more.',
}

// Same rationale as the other listing pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default async function Instruments() {
  const libraries = await getLibraries()

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">CH 03 · Instruments</span>
        <h1>Instruments &amp; plugins</h1>
        <p className="page-head__sub">
          {libraries.length} instruments · free downloads on Pianobook, plugins and more.
        </p>
      </header>

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
