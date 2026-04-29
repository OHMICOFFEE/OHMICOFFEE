import { db } from '@/lib/supabase'
import RepSidebar from '@/components/rep/Sidebar'
export default async function RepLayout({ children, params }: { children: React.ReactNode; params: { repId: string } }) {
  const { data: rep } = await db().from('representatives').select('first_name,last_name').eq('id', params.repId).single()
  const name = rep ? `${rep.first_name} ${rep.last_name}` : 'Representative'
  return (
    <div className="layout">
      <RepSidebar repId={params.repId} name={name} />
      <div className="main">{children}</div>
    </div>
  )
}
