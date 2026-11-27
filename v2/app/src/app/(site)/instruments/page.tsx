import type { Metadata } from 'next'

import { LibraryCard } from '../../../components/cards'
import { getLibraries } from '../../../lib/data'

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
