import Link from 'next/link'
import { Package, Rank, fmt } from '@/lib/types'

export default function NetworkTeaser({ packages, ranks }: { packages: Package[], ranks: Rank[] }) {
  return (
    <section className="border-t border-white/[0.07]">
      {/* Header */}
      <div className="px-10 py-16 border-b border-white/[0.07] grid grid-cols-2 gap-16 items-end">
        <div>
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">OHMI Network</p>
          <h2 className="font-cond font-black uppercase text-[4.5rem] leading-[0.88]">
            BUILD YOUR<br/>FUTURE WITH<br/><span className="text-red">OHMI</span>
          </h2>
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-white/45 text-[13px] leading-[2.1] font-light mb-6">
            Join South Africa's most exciting coffee network. Our binary structure creates unlimited earning potential — up to R200,000/month. Share extraordinary coffee and build a business alongside a community that cares.
          </p>
          <Link href="/network" className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 w-fit transition-colors">
            See Full Compensation Plan
          </Link>
        </div>
      </div>
      {/* Packages */}
      <div className="grid grid-cols-3 border-b border-white/[0.07]">
        {packages.map((pkg, i) => (
          <div key={pkg.id} className={`px-10 py-12 border-r border-white/[0.07] last:border-r-0 ${i === 1 ? 'bg-red' : ''}`}>
            <div className={`font-cond text-[10px] tracking-[0.4em] uppercase font-bold mb-2 ${i === 1 ? 'text-white/60' : 'text-red'}`}>
              {i === 0 ? 'Entry Level' : i === 1 ? 'Most Popular' : 'Elite'}
            </div>
            <div className="font-cond font-black text-[2.5rem] uppercase mb-2">{pkg.name}</div>
            <div className={`font-cond font-black text-[2.2rem] mb-1 ${i === 1 ? 'text-white/90' : 'text-red'}`}>
              {fmt(pkg.once_off_fee)}<span className="text-[1rem] font-light opacity-50 font-sans"> once-off</span>
            </div>
            <div className="text-white/40 text-[12px] mb-6">+ {fmt(pkg.monthly_fee)}/month</div>
            <ul className="space-y-2 mb-8">
              {pkg.features?.map(f => (
                <li key={f} className="flex items-center gap-2 text-[12px] font-light" style={{color: i===1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'}}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{background: i===1 ? 'rgba(255,255,255,0.4)' : '#C41E4A'}} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/network" className={`block text-center font-cond font-bold text-[11px] tracking-[0.22em] uppercase py-3 transition-all ${i===1 ? 'bg-white/15 border border-white/25 text-white hover:bg-white/25' : 'bg-red text-white hover:bg-red-dark'}`}>
              Apply for {pkg.name}
            </Link>
          </div>
        ))}
      </div>
      {/* Rank preview */}
      <div className="px-10 py-12 overflow-x-auto">
        <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-6">Rank Structure — 14 Levels</p>
        <div className="flex gap-2">
          {ranks.slice(0,7).map(r => (
            <div key={r.id} className="flex-shrink-0 bg-[#141414] border border-white/[0.07] px-4 py-3 min-w-[140px]">
              <div className="font-cond font-bold text-[11px] leading-tight text-white mb-1">{r.name}</div>
              <div className="text-red font-cond font-black text-[1.1rem]">R{r.monthly_earnings.toLocaleString()}<span className="text-white/30 text-[10px] font-sans">/mo</span></div>
              <div className="text-white/25 text-[10px] mt-1">{r.left_required}L + {r.right_required}R</div>
            </div>
          ))}
          <div className="flex-shrink-0 bg-red border border-red px-4 py-3 min-w-[140px] flex flex-col justify-center">
            <div className="font-cond font-black text-white text-center">+7 more<br/>ranks</div>
            <Link href="/network" className="text-white/70 text-[10px] text-center mt-1 underline">See all</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
