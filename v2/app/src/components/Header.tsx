import Link from 'next/link'
import { STORE_URL } from '../lib/email'
import { LogoMark } from './Logo'

const NAV = [
  { href: '/music', label: 'Music' },
  { href: '/game-audio', label: 'Game audio' },
  { href: '/instruments', label: 'Libraries' }, // free Kontakt libraries
  { href: STORE_URL, label: 'Store' },
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
]

export default function Header({ store = false }: { store?: boolean }) {
  return (
    <header className="site-header">
      <Link className="site-header__brand" href="/" aria-label="DEIGINEOR — home">
        <LogoMark className="site-header__mark" title="" aria-hidden="true" />
        <span className="site-header__name">DEIGINEOR</span>
      </Link>
      {/* The store host needs no menu: the brand links to the store home. */}
      {!store && (
        <nav className="site-header__nav" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      {/* Accounts live only on the store host. */}
      {store && (
        <Link className="site-header__account" href="/account">
          Account
        </Link>
      )}
    </header>
  )
}
