'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

const nav = [
  { section: 'Overview', links: [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/leaderboard', label: 'Leaderboard' },
  ]},
  { section: 'Catalogue', links: [
    { href: '/admin/products', label: 'Products' },
  ]},
  { section: 'Network', links: [
    { href: '/admin/network', label: 'Representatives' },
    { href: '/admin/tree', label: 'Network Tree' },
    { href: '/admin/kyc', label: 'KYC Verification' },
    { href: '/admin/commissions', label: 'Commissions' },
    { href: '/admin/payouts', label: 'Payouts' },
  ]},
]

export default function AdminSidebar() {
  const path = usePathname()
  const router = useRouter()

  async function signOut() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

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
        <div className="live-dot">
          <div className="live-dot-circle" />
          <span className="live-dot-text">Live</span>
        </div>
        <button onClick={signOut} style={{fontSize:11,color:'var(--text4)',background:'none',border:'none',cursor:'pointer',padding:0,textAlign:'left'}}>Sign Out</button>
      </div>
    </aside>
  )
}
