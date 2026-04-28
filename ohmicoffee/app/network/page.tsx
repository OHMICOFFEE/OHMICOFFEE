import { getPackages, getRanks, getSettings } from '@/lib/supabase'
import Marquee from '@/components/Marquee'
import Nav from '@/components/Nav'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { fmt, RANKS_TABLE } from '@/lib/types'
export const revalidate = 60
export default async function NetworkPage() {
  const [packages, ranks, settings] = await Promise.all([getPackages(), getRanks(), getSettings()])
  return (
    <main className="bg-black min-h-screen">
      <Marquee text={settings.marquee_text} />
      <Nav />
      {/* Hero */}
      <div className="min-h-[60vh] flex items-end px-10 pb-12 pt-28 border-b border-white/[0.07] relative overflow-hidden">
        <div className="absolute left-0 bottom-[-3rem] font-cond font-black text-[14rem] text-white/[0.025] leading-none pointer-events-none select-none whitespace-nowrap">NETWORK</div>
        <div className="relative z-10 max-w-[700px]">
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-5">OHMI Network Marketing</p>
          <h1 className="font-cond font-black uppercase text-[5.5rem] leading-[0.85] mb-6">
            BUILD YOUR<br/>FUTURE WITH<br/><span className="text-red">OHMI</span>
          </h1>
          <p className="text-white/45 text-[13px] leading-[2.1] font-light max-w-[500px] mb-8">
            Join South Africa's most exciting coffee network. Our binary structure creates unlimited earning potential — up to R200,000/month. Two packages available to match your ambition.
          </p>
          <div className="flex gap-3">
            <Link href="/rep/register" className="bg-white text-black font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 hover:opacity-90 transition-opacity">
              Apply Now
            </Link>
            <button className="border border-white/25 text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-7 py-3 hover:border-red hover:text-red transition-all">
              Download Info Pack
            </button>
          </div>
        </div>
      </div>
      {/* Packages */}
      <div className="grid grid-cols-3 border-b border-white/[0.07]">
        {packages.map((pkg, i) => (
          <div key={pkg.id} className={`px-10 py-12 border-r border-white/[0.07] last:border-r-0 ${i===1?'bg-red':''}`}>
            <div className={`font-cond text-[10px] tracking-[0.4em] uppercase font-bold mb-2 ${i===1?'text-white/60':'text-red'}`}>
              {['Entry Level','Most Popular','Elite'][i]}
            </div>
            <div className="font-cond font-black text-[2.8rem] uppercase mb-2">{pkg.name}</div>
            <div className={`font-cond font-black text-[2.2rem] mb-1 ${i===1?'text-white/90':'text-red'}`}>
              {fmt(pkg.once_off_fee)}<span className="text-[13px] font-sans font-light opacity-40"> once-off</span>
            </div>
            <div className="text-white/35 text-[12px] mb-2">+ {fmt(pkg.monthly_fee)}/month to stay active</div>
            <div className="text-[11px] font-medium mb-6 py-2 border-y border-white/[0.1]">
              <span className="text-white/40">Direct commission: </span>
              <span className={i===1?'text-white':'text-red'}>{fmt(pkg.direct_commission)} per referral</span>
            </div>
            <ul className="space-y-2 mb-8">
              {pkg.features?.map(f => (
                <li key={f} className="flex items-center gap-2 text-[12px] font-light" style={{color:i===1?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.5)'}}>
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{background:i===1?'rgba(255,255,255,0.4)':'#C41E4A'}} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/rep/register" className={`block text-center font-cond font-bold text-[11px] tracking-[0.22em] uppercase py-3 transition-all ${i===1?'bg-white/15 border border-white/25 text-white hover:bg-white/25':'bg-red text-white hover:bg-red-dark'}`}>
              Join as {pkg.name}
            </Link>
          </div>
        ))}
      </div>
      {/* Full rank table */}
      <div className="px-10 py-16 border-b border-white/[0.07]">
        <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-2">Residual Income</p>
        <h2 className="font-cond font-black uppercase text-[3rem] leading-[0.9] mb-8">14 Ranks.<br/>Up to R200,000/month.</h2>
        <div className="border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Rank','Left Team','Right Team','Monthly Earnings'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] tracking-[0.25em] uppercase text-white/25 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranks.map((r, i) => (
                <tr key={r.id} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-cond font-bold text-[13px]">{r.name}</td>
                  <td className="px-5 py-3 font-cond text-[13px] text-white/60">{r.left_required}</td>
                  <td className="px-5 py-3 font-cond text-[13px] text-white/60">{r.right_required}</td>
                  <td className="px-5 py-3 font-cond font-black text-red text-[1.1rem]">R{r.monthly_earnings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-white/20 text-[11px] mt-4 leading-relaxed">Disclaimer: Income figures represent potential earnings and are not guaranteed. Success requires dedication, consistent effort, and maintaining active downline requirements.</p>
      </div>
      {/* Binary explained */}
      <div className="px-10 py-16">
        <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">How the Binary Works</p>
        <h2 className="font-cond font-black uppercase text-[3rem] leading-[0.9] mb-6">Two Legs. <span className="text-red">Unlimited Growth.</span></h2>
        <p className="text-white/45 text-[13px] leading-[2.1] font-light max-w-[600px] mb-10">
          In OHMI's binary structure, you build two teams — a left leg and a right leg. You earn residual income based on your balanced team volume each week. To qualify, you must have a minimum of 2 active monthly subscribers on each side. Payouts happen every Friday.
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-[700px]">
          {[['Weekly Payouts','Every Friday, guaranteed'],['Minimum Activity','2 active subs each leg to qualify'],['Spillover','Excess recruits fill your downline automatically']].map(([t,d]) => (
            <div key={t} className="bg-[#141414] border border-white/[0.07] px-5 py-5">
              <div className="font-cond font-bold text-[13px] text-white mb-2">{t}</div>
              <div className="text-white/40 text-[12px] font-light leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
