'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { section: 'Overview', links: [
    { href: '/admin/dashboard', label: 'Dashboard' },
  ]},
  { section: 'Catalogue', links: [
    { href: '/admin/products', label: 'Products' },
  ]},
  { section: 'Network', links: [
    { href: '/admin/network', label: 'Representatives' },
    { href: '/admin/tree', label: 'Network Tree' },
    { href: '/admin/commissions', label: 'Commissions' },
    { href: '/admin/payouts', label: 'Payouts' },
  ]},
]

export default function AdminSidebar() {
  const path = usePathname()
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-name">OHMI</div>
        <div className="sidebar-logo-sub">Admin Console</div>
      </div>
      <nav className="sidebar-nav">
        {nav.map(section => (
          <div key={section.section}>
            <div className="sidebar-section">{section.section}</div>
            {section.links.map(link => (
              <Link key={link.href} href={link.href}
                className={`nav-link${path === link.href || path.startsWith(link.href+'/') ? ' active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:'var(--green)'}} />
          <span style={{fontSize:10,color:'var(--text3)',letterSpacing:'0.08em'}}>LIVE</span>
        </div>
        <Link href="/admin/login" style={{fontSize:11,color:'var(--text4)',textDecoration:'none'}}>Sign Out</Link>
      </div>
    </aside>
  )
}
