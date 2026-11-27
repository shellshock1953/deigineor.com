import Link from 'next/link'
import { STORE_URL } from '../lib/email'
import { LogoMark } from './Logo'

const NAV = [
  { href: '/music', label: 'Music' },
  { href: '/game-audio', label: 'Game audio' },
  { href: STORE_URL, label: 'Store' }, // free Kontakt libraries stay at /instruments, off the menu
  { href: '/about', label: 'About' },
  { href: '/cv', label: 'CV' },
]

const STORE_NAV = [{ href: '/', label: 'Store' }]

export default function Header({ store = false }: { store?: boolean }) {
  return (
    <header className="site-header">
      <Link className="site-header__brand" href="/" aria-label="DEIGINEOR — home">
        <LogoMark className="site-header__mark" title="" aria-hidden="true" />
        <span className="site-header__name">DEIGINEOR</span>
      </Link>
      <nav className="site-header__nav" aria-label="Main">
        {(store ? STORE_NAV : NAV).map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Accounts live only on the store host. */}
      {store && (
        <Link className="site-header__account" href="/account">
          Account
        </Link>
      )}
    </header>
  )
}
