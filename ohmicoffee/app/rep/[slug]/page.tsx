import { supabase, getProducts, getSettings } from '@/lib/supabase'
import Marquee from '@/components/Marquee'
import CollectionGrid from '@/components/CollectionGrid'
import SiteFooter from '@/components/SiteFooter'
import Link from 'next/link'
import { fmt } from '@/lib/types'
export const revalidate = 60

export default async function RepSitePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [{ data: rep }, products, settings] = await Promise.all([
    supabase.from('representatives').select('*').eq('rep_slug', slug).single(),
    getProducts(),
    getSettings(),
  ])

  if (!rep) {
    return (
      <main className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="font-cond font-black text-[3rem] text-red mb-2">404</div>
          <div className="text-white/40 text-[13px]">This rep site doesn't exist yet.</div>
          <Link href="/" className="text-red hover:underline text-[12px] mt-4 block">← Back to OHMI</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-black min-h-screen">
      <Marquee text={settings.marquee_text} />
      {/* Rep header */}
      <div className="bg-[#0c0c0c] border-b border-white/[0.07] px-10 py-4 flex items-center justify-between">
        <div className="font-cond font-black text-[1rem] tracking-[0.2em] uppercase text-white">
          OHMI <span className="text-red">COFFEE CO.</span>
          <span className="text-white/25 font-normal text-[11px] ml-4">Your Rep: {rep.first_name} {rep.last_name}</span>
        </div>
        <Link href={`/rep/${slug}`} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[11px] tracking-[0.2em] uppercase px-5 py-2 transition-colors">
          Shop with {rep.first_name}
        </Link>
      </div>
      {/* Hero */}
      <div className="px-10 py-16 border-b border-white/[0.07] grid grid-cols-2 gap-10 items-center min-h-[55vh]">
        <div>
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">
            OHMI Coffee Co. · {rep.current_rank}
          </p>
          <h1 className="font-cond font-black uppercase text-[4.5rem] leading-[0.9] mb-5">
            SHOP WITH<br/>{rep.first_name.toUpperCase()}<br/><span className="text-red">{rep.last_name.toUpperCase()}</span>
          </h1>
          {rep.rep_site_bio && (
            <p className="text-white/50 text-[13px] leading-[2] font-light max-w-[420px] mb-6">{rep.rep_site_bio}</p>
          )}
          <p className="text-white/30 text-[12px] leading-[1.9]">
            I'm an independent OHMI Coffee representative. Every bag I sell contributes to our mission — feeding children in need through our community church partnerships.
          </p>
        </div>
        <div className="space-y-2">
          {[['Package', rep.package_id || 'Builder'],['Rank',rep.current_rank],['Left Team',rep.left_team_count?.toString()],['Right Team',rep.right_team_count?.toString()]].map(([l,v]) => (
            <div key={l} className="flex items-baseline justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/25">{l}</span>
              <span className="font-cond font-bold text-[14px]">{v}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Products */}
      <CollectionGrid products={products} />
      <SiteFooter />
    </main>
  )
}
