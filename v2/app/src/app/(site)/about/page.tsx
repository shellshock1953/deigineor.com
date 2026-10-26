import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getSite } from '../../../lib/data'

export const metadata: Metadata = {
  title: 'About',
  description: 'Deigineor — sound producer from Ukraine. Ambition Music Development.',
}

// Same rationale as the other pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export default async function About() {
  const site = await getSite()
  const platforms = site.platformLinks ?? []
  const socials = site.socialLinks ?? []

  return (
    <div className="container">
      <header className="page-head">
        <span className="section__kicker">CH 04 · About</span>
        <h1>About</h1>
      </header>

      <div className="about-grid" style={{ marginTop: 24 }}>
        <div>
          {site.about ? (
            <div className="rich-text" style={{ maxWidth: '72ch' }}>
              <RichText data={site.about} />
            </div>
          ) : (
            site.shortBio && <p className="page-head__sub">{site.shortBio}</p>
          )}

          {site.contactEmail && (
            <p style={{ marginTop: 24 }}>
              <a className="btn btn--sm" href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>
            </p>
          )}
        </div>

        <aside aria-label="Links">
          {platforms.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', marginBottom: 10 }}>
                <span className="section__kicker">Listen on</span>
              </h2>
              <ul className="link-list">
                {platforms.map((l) => (
                  <li key={l.id ?? l.platform}>
                    <span className="mono">{l.platform}</span>
                    <a href={l.url} rel="noopener noreferrer">
                      {l.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {socials.length > 0 && (
            <>
              <h2 style={{ fontSize: '1rem', margin: '26px 0 10px' }}>
                <span className="section__kicker">Social</span>
              </h2>
              <ul className="link-list">
                {socials.map((l) => (
                  <li key={l.id ?? l.platform}>
                    <span className="mono">{l.platform}</span>
                    <a href={l.url} rel="noopener noreferrer">
                      {l.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
