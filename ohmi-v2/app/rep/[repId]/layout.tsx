import RepSidebar from '@/components/rep/Sidebar'
export default function RepLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-navy">
      <RepSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
