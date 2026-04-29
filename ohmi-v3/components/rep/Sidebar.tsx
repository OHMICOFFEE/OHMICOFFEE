'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function RepSidebar({ repId, name }: { repId: string; name: string }) {
  const path = usePathname()
  const links = [
    { href: `/rep/${repId}/dashboard`, label: 'Dashboard' },
    { href: `/rep/${repId}/downline`, label: 'My Downline' },
    { href: `/rep/${repId}/earnings`, label: 'My Earnings' },
  ]
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-name">OHMI</div>
        <div className="sidebar-logo-sub">Rep Portal</div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">Menu</div>
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link${path === l.href ? ' active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{fontSize:11,color:'var(--text3)',marginBottom:6}}>{name}</div>
        <Link href="/rep/login" style={{fontSize:11,color:'var(--text4)',textDecoration:'none'}}>Sign Out</Link>
      </div>
    </aside>
  )
}
