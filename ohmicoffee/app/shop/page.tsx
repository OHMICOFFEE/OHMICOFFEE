import { getProducts, getSettings } from '@/lib/supabase'
import Marquee from '@/components/Marquee'
import Nav from '@/components/Nav'
import CollectionGrid from '@/components/CollectionGrid'
import SiteFooter from '@/components/SiteFooter'
export const revalidate = 60
export default async function ShopPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()])
  return (
    <main className="bg-black min-h-screen">
      <Marquee text={settings.marquee_text} />
      <Nav />
      <div className="min-h-[35vh] flex items-end px-10 pb-10 pt-28 bg-[#0c0c0c] border-b border-white/[0.07]">
        <div>
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">The OHMI Store</p>
          <h1 className="font-cond font-black uppercase text-[5.5rem] leading-[0.85]">SHOP <span className="text-red">OHMI</span></h1>
        </div>
      </div>
      <CollectionGrid products={products} />
      <SiteFooter />
    </main>
  )
}
