'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/earnings', label: 'My Earnings' },
  { href: '/downline', label: 'My Downline' },
  { href: '/orders', label: 'My Orders' },
  { href: '/shop', label: 'Wholesale Shop' },
  { href: '/profile', label: 'My Profile & KYC' },
]

export default function RepSidebar() {
  const path = usePathname()
  return (
    <div className="w-[200px] min-w-[200px] bg-[#0c0c0c] border-r border-white/[0.07] flex flex-col h-screen sticky top-0">
      <div className="px-5 py-4 border-b border-white/[0.07]">
        <div className="font-cond font-black text-[0.85rem] tracking-[0.15em] uppercase">OHMI <span className="text-red">REP PORTAL</span></div>
      </div>
      <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-2">
        <div className="w-7 h-7 bg-red rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">R</div>
        <div>
          <div className="text-[11px] font-medium text-white">Rep Dashboard</div>
          <div className="text-[9px] tracking-[0.1em] text-white/30 uppercase">Active</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {navItems.map(item => {
          const active = path === item.href || path.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`admin-sidebar-item flex items-center px-5 py-[8px] text-[12px] font-medium ${active ? 'active' : 'text-white/40'}`}>
              {item.label}
            </Link>
          )
        })}
      </div>
      <div className="px-5 py-3 border-t border-white/[0.07] space-y-2">
        <Link href="/" className="block text-[11px] text-white/30 hover:text-white transition-colors">← Back to Store</Link>
        <button className="block text-[11px] text-white/30 hover:text-red transition-colors">Sign Out</button>
      </div>
    </div>
  )
}
