'use client'
import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import Logo from '@/components/ui/Logo'

export default function RepSidebar() {
  const path = usePathname()
  const params = useParams()
  const repId = params?.repId as string

  const nav = [
    { href: `/rep/${repId}/dashboard`, label: 'Dashboard' },
    { href: `/rep/${repId}/downline`, label: 'My Downline' },
    { href: `/rep/${repId}/earnings`, label: 'My Earnings' },
  ]

  return (
    <aside className="w-[200px] min-w-[200px] bg-ink border-r border-navy-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-navy-border">
        <Logo size="sm" />
        <div className="text-[9px] tracking-[0.35em] text-cream-muted/25 uppercase mt-1">Rep Portal</div>
      </div>
      <div className="flex-1 overflow-y-auto py-3">
        <div className="mb-3">
          <div className="px-5 py-1 text-[9px] tracking-[0.35em] uppercase text-cream-muted/20 font-medium">My Account</div>
          {nav.map(item => {
            const active = path === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`nav-link flex items-center px-5 py-2 ${active ? 'active text-cream' : ''}`}>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="px-5 py-4 border-t border-navy-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[6px] h-[6px] bg-emerald-400 rounded-full pulse" />
          <span className="text-[10px] text-cream-muted/25">Active</span>
        </div>
        <Link href="/rep/login" className="text-[11px] text-cream-muted/30 hover:text-crimson transition-colors">
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
