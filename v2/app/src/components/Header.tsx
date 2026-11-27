import Link from 'next/link'
import { STORE_URL } from '../lib/email'
import { LogoMark } from './Logo'

const NAV = [
  { href: '/music', label: 'Music' },
  { href: '/game-audio', label: 'Game audio' },
  { href: '/instruments', label: 'Instruments' },
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
      {/* The shop's account lives on the store host; absolute so the main site needs no redirect hop. */}
      <a className="site-header__account" href={`${store ? '' : STORE_URL}/account`}>
        Account
      </a>
    </header>
  )
}
