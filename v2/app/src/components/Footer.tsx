import Link from 'next/link'
import { getSite } from '../lib/data'

export default async function Footer() {
  const site = await getSite()
  const platforms = site.platformLinks ?? []
  const socials = site.socialLinks ?? []

  return (
    <footer className="site-footer">
      <div className="site-footer__links">
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
      </div>
    </footer>
  )
}
