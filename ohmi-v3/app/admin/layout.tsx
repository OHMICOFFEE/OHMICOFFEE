import AdminSidebar from '@/components/admin/Sidebar'
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <AdminSidebar />
      <div className="main">{children}</div>
    </div>
  )
}
