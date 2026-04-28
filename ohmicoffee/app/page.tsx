import { getProducts, getSettings, getPackages, getRanks } from '@/lib/supabase'
import Marquee from '@/components/Marquee'
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import CollectionGrid from '@/components/CollectionGrid'
import MissionBlock from '@/components/MissionBlock'
import NetworkTeaser from '@/components/NetworkTeaser'
import SiteFooter from '@/components/SiteFooter'

export const revalidate = 60

export default async function Home() {
  const [products, settings, packages, ranks] = await Promise.all([
    getProducts(), getSettings(), getPackages(), getRanks()
  ])
  return (
    <main className="bg-black min-h-screen">
      <Marquee text={settings.marquee_text} />
      <Nav />
      <Hero products={products} meals={parseInt(settings.meals_served || '255')} />
      <CollectionGrid products={products} />
      <MissionBlock meals={parseInt(settings.meals_served || '255')} story={settings.foundation_story} />
      <NetworkTeaser packages={packages} ranks={ranks} />
      <SiteFooter />
    </main>
  )
}
