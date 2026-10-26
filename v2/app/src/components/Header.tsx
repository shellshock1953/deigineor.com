import Link from 'next/link'
import { LogoMark } from './Logo'

const NAV = [
  { href: '/music', label: 'Music' },
  { href: '/game-audio', label: 'Game audio' },
  { href: '/instruments', label: 'Instruments' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  return (
    <header className="site-header">
      <Link className="site-header__brand" href="/" aria-label="DEIGINEOR — home">
        <LogoMark className="site-header__mark" title="" aria-hidden="true" />
        <span className="site-header__name">DEIGINEOR</span>
      </Link>
      <nav className="site-header__nav" aria-label="Main">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
