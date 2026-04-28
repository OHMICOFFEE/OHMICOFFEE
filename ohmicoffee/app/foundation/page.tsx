import { getSettings } from '@/lib/supabase'
import Marquee from '@/components/Marquee'
import Nav from '@/components/Nav'
import SiteFooter from '@/components/SiteFooter'
export const revalidate = 60
export default async function FoundationPage() {
  const settings = await getSettings()
  const meals = parseInt(settings.meals_served || '255')
  return (
    <main className="bg-black min-h-screen">
      <Marquee text={settings.marquee_text} />
      <Nav />
      <div className="min-h-[55vh] bg-red flex items-end px-10 pb-12 pt-28 relative overflow-hidden">
        <div className="absolute right-0 bottom-[-3rem] font-cond font-black text-[18rem] text-black/12 leading-none pointer-events-none select-none">{meals}</div>
        <div className="relative z-10">
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-white/60 font-bold mb-4">The OHMI Foundation</p>
          <h1 className="font-cond font-black uppercase text-[5.5rem] leading-[0.85] text-white">
            FROM OUR CUP<br/><span className="opacity-50">TO THEIR CUP</span>
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-white/[0.07]">
        <div className="px-10 py-16 border-r border-white/[0.07]">
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-5">Our Mission</p>
          <p className="text-white/50 text-[13px] leading-[2.2] font-light max-w-[480px]">{settings.foundation_story}</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/[0.05]">
          {[[meals.toString(),'Meals Served to Date'],['20%','of All Profits Donated'],['6','Partner Kitchens'],['∞','Children Impacted']].map(([n,l]) => (
            <div key={l} className="bg-[#141414] p-10 flex flex-col justify-end">
              <div className="font-cond font-black text-[3.5rem] text-red leading-none">{n}</div>
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mt-2">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  )
}
