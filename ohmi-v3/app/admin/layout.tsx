import AdminSidebar from '@/components/admin/Sidebar'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="layout">
      <AdminSidebar />
      <div className="main">{children}</div>
    </div>
  )
}
