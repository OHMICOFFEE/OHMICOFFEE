'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const sections = [
  { label: 'Overview', items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: '▦' }] },
  { label: 'Catalogue', items: [
    { href: '/admin/products', label: 'Products', badge: '10' },
    { href: '/admin/products/pricing', label: 'Pricing & Variants' },
    { href: '/admin/products/inventory', label: 'Inventory' },
  ]},
  { label: 'Commerce', items: [
    { href: '/admin/orders', label: 'Orders', badge: 'New' },
    { href: '/admin/customers', label: 'Customers' },
  ]},
  { label: 'Network', items: [
    { href: '/admin/network', label: 'Binary Network' },
    { href: '/admin/network/members', label: 'All Representatives' },
    { href: '/admin/commissions', label: 'Commissions' },
    { href: '/admin/payouts', label: 'Payouts' },
    { href: '/admin/kyc', label: 'KYC Verification', badge: '!' },
  ]},
  { label: 'Impact', items: [{ href: '/admin/foundation', label: 'Foundation' }] },
  { label: 'Site', items: [
    { href: '/admin/settings', label: 'Settings' },
    { href: '/admin/media', label: 'Media Library' },
  ]},
]

export default function AdminSidebar() {
  const path = usePathname()
  return (
    <div className="w-[210px] min-w-[210px] bg-[#0c0c0c] border-r border-white/[0.07] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/[0.07]">
        <div className="font-cond font-black text-[0.85rem] tracking-[0.15em] uppercase">OHMI <span className="text-red">COFFEE CO.</span></div>
        <div className="text-[9px] tracking-[0.25em] text-white/20 uppercase mt-[2px]">Admin Console</div>
      </div>
      {/* Admin user */}
      <div className="px-5 py-3 border-b border-white/[0.07] flex items-center gap-2">
        <div className="w-7 h-7 bg-red rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">BM</div>
        <div>
          <div className="text-[11px] font-medium text-white">Brandon Marriott</div>
          <div className="text-[9px] tracking-[0.1em] text-white/30 uppercase">Super Admin</div>
        </div>
      </div>
      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-2">
        {sections.map(section => (
          <div key={section.label} className="mb-1">
            <div className="px-5 py-1 text-[9px] tracking-[0.3em] uppercase text-white/20 font-medium">{section.label}</div>
            {section.items.map(item => {
              const active = path === item.href || path.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}
                  className={`admin-sidebar-item flex items-center justify-between px-5 py-[7px] text-[12px] font-medium ${active ? 'active' : 'text-white/40'}`}>
                  <span>{item.label}</span>
                  {'badge' in item && item.badge && (
                    <span className="bg-red text-white text-[9px] px-[6px] py-[1px] rounded-full font-bold">{item.badge}</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] text-white/30">LIVE · ohmicoffee.co.za</span>
        </div>
      </div>
    </div>
  )
}
