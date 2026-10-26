import Link from 'next/link'

import { LogoMark } from '../../components/Logo'

export default function NotFound() {
  return (
    <div className="container">
      <section className="not-found">
        <p className="not-found__code" role="text" aria-label="404">
          4 · 0 · 4
        </p>
        <h1 className="not-found__title">Signal lost</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '44ch', marginInline: 'auto' }}>
          This channel is silent — the page you are looking for does not exist.
        </p>
        <LogoMark className="not-found__wave" title="" aria-hidden="true" />
        <p>
          <Link className="btn btn--primary" href="/">
            Back to the signal
          </Link>
        </p>
      </section>
    </div>
  )
}
