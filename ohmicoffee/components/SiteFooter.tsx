import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="bg-[#0c0c0c] border-t border-white/[0.07] pt-16 pb-8 px-10">
      <div className="grid grid-cols-5 gap-10 mb-14">
        <div className="col-span-2">
          <div className="font-cond font-black text-[1.05rem] tracking-[0.2em] uppercase text-white mb-3">
            OHMI <span className="text-red">COFFEE CO.</span>
          </div>
          <p className="text-white/25 text-[12px] leading-[2.1] font-light italic mb-4">
            "Brew Good, Do Good."<br/>"From our cup to their cup."<br/><br/>
            Danki Pa Estate, Rietvlei Road<br/>Ganze Valley, Plettenberg Bay, 6600<br/>Western Cape, South Africa
          </p>
        </div>
        {[
          { heading: 'Shop', items: [['/', 'Home'], ['/coffees', 'Our Coffees'], ['/shop', 'All Products'], ['/shop', 'Barista Gear'], ['/shop', 'Gift Sets']] },
          { heading: 'Company', items: [['/foundation', 'Foundation'], ['/network', 'Network'], ['/', 'Sustainability'], ['/', 'Press']] },
          { heading: 'Support', items: [['/', 'Shipping & Deliveries'], ['/', 'FAQ'], ['/', 'Returns Policy'], ['/', 'Bulk Orders']] },
          { heading: 'Contact', items: [['mailto:sales@ohmicoffee.co.za', 'sales@ohmicoffee.co.za'], ['tel:+27741842265', '+27 74 184 2265'], ['/', 'Instagram'], ['/', 'Facebook']] },
        ].map(col => (
          <div key={col.heading}>
            <h4 className="text-[10px] tracking-[0.35em] uppercase text-red font-bold mb-4">{col.heading}</h4>
            <ul className="space-y-[6px]">
              {col.items.map(([href, label]) => (
                <li key={label}><Link href={href} className="text-[12px] text-white/30 hover:text-white transition-colors font-light">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/[0.06] pt-5 flex justify-between items-center">
        <span className="text-[10px] tracking-wider text-white/[0.15]">© 2025 OHMI Coffee Co. All rights reserved. · Payment via iKhokha</span>
        <span className="font-cond font-bold text-[13px] tracking-[0.2em] uppercase text-red">Brew Good, Do Good.</span>
      </div>
    </footer>
  )
}
