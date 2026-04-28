import type { Metadata } from 'next'
import AdminSidebar from '@/components/admin/AdminSidebar'
export const metadata: Metadata = { title: 'OHMI Admin' }
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-black min-h-screen text-white" style={{fontFamily:'Barlow,sans-serif'}}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  )
}
