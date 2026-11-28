import type { Metadata } from 'next'

import { LibraryCard } from '../../../components/cards'
import { getLibraries } from '../../../lib/data'

export const metadata: Metadata = { title: 'Store' }

// Same rationale as the other listing pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

/** Store home, served at the root of the store host (see lib/store.ts). Paid items only. */
export default async function Store() {
  const libraries = (await getLibraries()).filter((l) => l.pricing === 'paid')

  return (
    <div className="container">
      <header className="page-head">
        <h1>Store</h1>
      </header>

      {libraries.length === 0 ? (
        <p className="empty">Nothing here yet.</p>
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
