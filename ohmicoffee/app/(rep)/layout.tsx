import type { Metadata } from 'next'
import RepSidebar from '@/components/rep/RepSidebar'
export const metadata: Metadata = { title: 'OHMI Rep Portal' }
export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-black min-h-screen text-white" style={{fontFamily:'Barlow,sans-serif'}}>
      <RepSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">{children}</div>
    </div>
  )
}
