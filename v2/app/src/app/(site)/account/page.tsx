import type { Metadata } from 'next'

import { licensesFor, sessionEmail } from '../../../lib/account-server'
import { PreviousVersions } from '../../../components/PreviousVersions'
import { getReleases, OS_NAME, OSES } from '../../../lib/download/studio'
import { formatDate } from '../../../lib/format'
import { PRODUCTS } from '../../../lib/products'

export const metadata: Metadata = {
  title: 'Account',
  robots: { index: false, follow: false },
}

// Per-visitor (cookie) and DB-backed: never prerendered.
export const dynamic = 'force-dynamic'

async function studioReleases() {
  const token = process.env.GITHUB_RELEASES_TOKEN
  if (!token) return []
  return getReleases(token).catch(() => [])
}

export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string; sent?: string; invalid?: string }>
}) {
  const { expired, sent, invalid } = await searchParams
  const email = await sessionEmail()

  if (!email) {
    return (
      <div className="container">
        <header className="page-head">
          <h1>Account</h1>
        </header>
        <div className="rich-text" style={{ marginTop: 24 }}>
          {expired && (
            <p role="alert">That sign-in link has expired or is not valid. Request a new one below.</p>
          )}
          {invalid && <p role="alert">Enter a valid email address.</p>}
          {sent && (
            <p role="status">If this email has purchases, a sign-in link is on its way. It is valid for 15 minutes.</p>
          )}
          <p>Sign in with the email you used at checkout to see your purchases and download them again. We will email you a sign-in link.</p>
          <form method="post" action="/api/account/login" className="account-form">
            <label htmlFor="account-email">Email</label>
            <input id="account-email" name="email" type="email" autoComplete="email" required />
            <button type="submit" className="btn btn--primary">
              Email me a sign-in link
            </button>
          </form>
        </div>
      </div>
    )
  }

  const [licenses, releases] = await Promise.all([licensesFor(email), studioReleases()])
  const latest = releases[0]
  const version = latest?.version
  return (
    <div className="container">
      <header className="page-head">
        <h1>Account</h1>
      </header>
      <div className="account">
        <div className="account-bar">
          <p>
            Signed in as <strong>{email}</strong>
          </p>
          <form method="post" action="/api/account/logout">
            <button type="submit" className="btn btn--sm">
              Sign out
            </button>
          </form>
        </div>
        <h2 className="account-heading">Purchases</h2>
        {licenses.length === 0 && <p>No purchases found for this email.</p>}
        <ul className="account-list">
          {licenses.map((l) => {
            const product = PRODUCTS[l.product]
            const active = l.status === 'active'
            return (
              <li key={l.txn} className="account-item">
                <div className="account-item__head">
                  <h3 className="account-item__title">{product?.title ?? l.product}</h3>
                  <span className={`account-status${active ? ' account-status--active' : ''}`}>
                    {active ? 'Active' : 'Refunded'}
                  </span>
                </div>
                <p className="mono account-item__meta">
                  Bought {formatDate(l.createdAt)}
                  {active && product?.studioDownloads && version ? ` · latest version ${version}` : ''}
                </p>
                {active && (
                  <div className="account-item__actions">
                    {product?.studioDownloads && (
                      <>
                        {OSES.map((os) =>
                          !latest || latest.assets[os] ? (
                            <a key={os} className="btn btn--primary" href={`/api/download/studio?txn=${l.txn}&os=${os}`}>
                              Download for {OS_NAME[os]}
                            </a>
                          ) : (
                            <span key={os} className="mono">{OS_NAME[os]}: coming soon</span>
                          ),
                        )}
                      </>
                    )}
                    <a className="btn" href={`/api/licence/${l.txn}`} download="Librarium.lic">
                      Licence file
                    </a>
                  </div>
                )}
                {active && product?.studioDownloads && (
                  <PreviousVersions releases={releases} zip="assets" href={(v, os) => `/api/download/studio?txn=${l.txn}&os=${os}&version=${v}`} />
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
