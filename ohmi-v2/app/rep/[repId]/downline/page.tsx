import { serviceClient } from '@/lib/supabase'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { calcRank } from '@/lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 30

export default async function RepDownline({ params }: { params: { repId: string } }) {
  const db = serviceClient()
  const { data: rep } = await db.from('representatives').select('*').eq('id', params.repId).single()
  if (!rep) notFound()

  const { data: downline } = await db.from('representatives')
    .select('*').eq('sponsor_id', params.repId).order('created_at', { ascending: false })

  const leftReps = (downline || []).filter((r: any) => r.leg === 'left')
  const rightReps = (downline || []).filter((r: any) => r.leg === 'right')

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Downline" />
      <div className="flex-1 p-6 overflow-y-auto space-y-5 fade-in">
        {/* Counts */}
        <div className="grid grid-cols-3 gap-px bg-navy-border">
          <div className="bg-navy-light p-5">
            <div className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/30 mb-2">Total Direct Downline</div>
            <div className="font-display text-3xl text-cream font-light">{(downline || []).length}</div>
          </div>
          <div className="bg-navy-light p-5">
            <div className="text-[9px] tracking-[0.3em] uppercase text-blue-400/50 mb-2">Left Leg</div>
            <div className="font-display text-3xl text-cream font-light">{leftReps.length}</div>
          </div>
          <div className="bg-navy-light p-5">
            <div className="text-[9px] tracking-[0.3em] uppercase text-purple-400/50 mb-2">Right Leg</div>
            <div className="font-display text-3xl text-cream font-light">{rightReps.length}</div>
          </div>
        </div>

        {/* Two legs side by side */}
        <div className="grid grid-cols-2 gap-5">
          {[{ label: 'Left Leg', reps: leftReps, side: 'left' }, { label: 'Right Leg', reps: rightReps, side: 'right' }].map(({ label, reps, side }) => (
            <div key={side}>
              <div className={`text-[9px] tracking-[0.3em] uppercase mb-2 ${side === 'left' ? 'text-blue-400/50' : 'text-purple-400/50'}`}>{label}</div>
              <Table>
                <thead><tr><Th>Name</Th><Th>Package</Th><Th>Rank</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {reps.map((r: any) => {
                    const rank = calcRank(r.left_team_count || 0, r.right_team_count || 0)
                    return (
                      <Tr key={r.id}>
                        <Td><span className="text-cream">{r.first_name} {r.last_name}</span></Td>
                        <Td className="text-cream-muted/40 text-[11px]">{r.package_name || '—'}</Td>
                        <Td className="text-cream-muted/40 text-[11px]">{rank?.name || 'Unranked'}</Td>
                        <Td><Badge status={r.is_active ? 'active' : 'pending'} /></Td>
                      </Tr>
                    )
                  })}
                  {reps.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-cream-muted/15 text-[11px] tracking-widest uppercase">Empty leg</td></tr>
                  )}
                </tbody>
              </Table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
