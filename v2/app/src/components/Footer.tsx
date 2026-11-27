import Link from 'next/link'
import { getSite } from '../lib/data'

export default async function Footer({ store = false }: { store?: boolean }) {
  const site = await getSite()
  const platforms = store ? [] : (site.platformLinks ?? [])
  const socials = store ? [] : (site.socialLinks ?? [])

  return (
    <footer className="site-footer">
      <div className="site-footer__links">
        {store && site.contactEmail && <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>}
        {platforms.map((l) => (
          <a key={l.id ?? l.platform} href={l.url} rel="noopener noreferrer">
            {l.platform}
          </a>
        ))}
        {socials.map((l) => (
          <a key={l.id ?? l.platform} href={l.url} rel="noopener noreferrer">
            {l.platform}
          </a>
        ))}
      </div>
      <div className="site-footer__bottom">
        <Link href="/">DEIGINEOR</Link>
        <p className="mono">© {new Date().getFullYear()}</p>
        <span className="site-footer__legal">
          <Link href="/terms">Terms</Link> · <Link href="/privacy">Privacy</Link> ·{' '}
          <Link href="/refund">Refunds</Link> · <Link href="/account">Account</Link>
        </span>
      </div>
    </footer>
  )
}
