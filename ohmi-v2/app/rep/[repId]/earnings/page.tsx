import { serviceClient } from '@/lib/supabase'
import Topbar from '@/components/admin/Topbar'
import Badge from '@/components/ui/Badge'
import Stat from '@/components/ui/Stat'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { fmt } from '@/lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 30

export default async function RepEarnings({ params }: { params: { repId: string } }) {
  const db = serviceClient()
  const { data: rep } = await db.from('representatives').select('*').eq('id', params.repId).single()
  if (!rep) notFound()

  const { data: commissions } = await db.from('commissions')
    .select('*').eq('rep_id', params.repId)
    .order('created_at', { ascending: false })

  const { data: payouts } = await db.from('payouts')
    .select('*').eq('rep_id', params.repId)
    .order('created_at', { ascending: false })

  const comms = commissions || []
  const pays = payouts || []

  const direct = comms.filter((c: any) => c.type === 'direct').reduce((s: number, c: any) => s + (c.amount || 0), 0)
  const residual = comms.filter((c: any) => c.type === 'residual').reduce((s: number, c: any) => s + (c.amount || 0), 0)
  const matching = comms.filter((c: any) => c.type === 'matching').reduce((s: number, c: any) => s + (c.amount || 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Earnings" />
      <div className="flex-1 p-6 overflow-y-auto space-y-5 fade-in">
        <div className="grid grid-cols-4 gap-px bg-navy-border">
          <Stat label="Total Earned" value={fmt(rep.total_earned || 0)} sub="all time" />
          <Stat label="Pending Payout" value={fmt(rep.pending_payout || 0)} sub="next Friday" accent />
          <Stat label="Total Paid Out" value={fmt(rep.total_paid_out || 0)} sub="received" />
          <Stat label="Payout Method" value={rep.payout_method === 'crypto' ? 'USDT' : 'Bank EFT'} sub="every Friday" />
        </div>
        <div className="grid grid-cols-3 gap-px bg-navy-border">
          <Stat label="Direct Commissions" value={fmt(direct)} sub="once-off per signup" />
          <Stat label="Residual Income" value={fmt(residual)} sub="monthly binary" />
          <Stat label="Matching Bonuses" value={fmt(matching)} sub="from downline" />
        </div>

        {/* Commission log */}
        <div>
          <h3 className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/25 mb-3">Commission History</h3>
          <Table>
            <thead><tr>
              <Th>Type</Th><Th>Amount</Th><Th>Description</Th><Th>Week Ending</Th><Th>Status</Th>
            </tr></thead>
            <tbody>
              {comms.map((c: any) => (
                <Tr key={c.id}>
                  <Td><Badge status={c.type} /></Td>
                  <Td className="font-mono text-emerald-400">{fmt(c.amount)}</Td>
                  <Td className="text-cream-muted/50 text-[11px]">{c.description || '—'}</Td>
                  <Td className="font-mono text-[11px] text-cream-muted/30">{c.week_ending || '—'}</Td>
                  <Td><Badge status={c.status} /></Td>
                </Tr>
              ))}
              {comms.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No earnings yet</td></tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Payout log */}
        {pays.length > 0 && (
          <div>
            <h3 className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/25 mb-3">Payout History</h3>
            <Table>
              <thead><tr><Th>Amount</Th><Th>Method</Th><Th>Week Ending</Th><Th>Status</Th></tr></thead>
              <tbody>
                {pays.map((p: any) => (
                  <Tr key={p.id}>
                    <Td className="font-mono text-emerald-400">{fmt(p.amount)}</Td>
                    <Td><Badge status={p.method || 'bank'} /></Td>
                    <Td className="font-mono text-[11px] text-cream-muted/30">{p.week_ending || '—'}</Td>
                    <Td><Badge status={p.status} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
