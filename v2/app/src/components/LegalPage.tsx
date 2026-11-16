import type { ReactNode } from 'react'

import { LEGAL_UPDATED } from '../lib/legal'
import { getSite } from '../lib/data'

export async function ContactLink() {
  const site = await getSite()
  return site.contactEmail ? <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> : null
}

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container">
      <header className="page-head">
        <h1>{title}</h1>
        <p className="page-head__sub mono">Last updated: {LEGAL_UPDATED}</p>
      </header>
      <div className="rich-text" style={{ maxWidth: '72ch', marginTop: 24 }}>
        {children}
      </div>
    </div>
  )
}
