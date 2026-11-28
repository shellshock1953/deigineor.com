import type { Metadata } from 'next'
import Link from 'next/link'

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

      <div className="grid" style={{ marginTop: 28 }}>
        {/* Free edition of Librarium: not a CMS library, so a static card. */}
        <Link className="card card--link" href="/player">
          <div className="card__body">
            <div className="card__meta">
              <span className="mono">Plugin</span>
              <span className="mono mono--accent">Free</span>
            </div>
            <h3 className="card__title">Librarium Player</h3>
            <p className="card__tagline">Free edition: plays any Librarium instrument.</p>
          </div>
        </Link>
        {libraries.map((l) => (
          <LibraryCard key={l.id} library={l} />
        ))}
      </div>
    </div>
  )
}
