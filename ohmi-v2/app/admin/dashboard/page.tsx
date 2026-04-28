import { serviceClient } from '@/lib/supabase'
import Topbar from '@/components/admin/Topbar'
import Stat from '@/components/ui/Stat'
import Badge from '@/components/ui/Badge'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { fmt, calcRank } from '@/lib/types'

export const revalidate = 30

async function getData() {
  const db = serviceClient()
  const [repsRes, productsRes, commissionsRes, payoutsRes] = await Promise.all([
    db.from('representatives').select('*'),
    db.from('products').select('*').eq('status','active').order('sort_order').limit(10),
    db.from('commissions').select('*').eq('status','pending'),
    db.from('payouts').select('*').eq('status','pending'),
  ])
  return {
    reps: repsRes.data || [],
    products: productsRes.data || [],
    pending_commissions: commissionsRes.data || [],
    pending_payouts: payoutsRes.data || [],
  }
}

export default async function AdminDashboard() {
  const { reps, products, pending_commissions, pending_payouts } = await getData()
  const active = reps.filter((r: any) => r.is_active)
  const leftCount = reps.filter((r: any) => r.leg === 'left' && r.is_active).length
  const rightCount = reps.filter((r: any) => r.leg === 'right' && r.is_active).length
  const rank = calcRank(leftCount, rightCount)
  const pendingPayout = pending_payouts.reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const pendingComm = pending_commissions.reduce((s: number, c: any) => s + (c.amount || 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-px bg-navy-border">
          <Stat label="Total Representatives" value={reps.length.toString()} sub={`${active.length} active`} />
          <Stat label="Left Leg" value={leftCount.toString()} sub="active reps" />
          <Stat label="Right Leg" value={rightCount.toString()} sub="active reps" />
          <Stat label="Network Rank" value={rank?.name || 'Unranked'} sub={rank ? `R${rank.monthly.toLocaleString()}/mo potential` : '—'} accent />
        </div>
        <div className="grid grid-cols-4 gap-px bg-navy-border">
          <Stat label="Pending Commissions" value={fmt(pendingComm)} sub="awaiting approval" accent />
          <Stat label="Friday Payout Due" value={fmt(pendingPayout)} sub="pending payouts" />
          <Stat label="Products Live" value={products.length.toString()} sub="in catalogue" />
          <Stat label="KYC Pending" value={reps.filter((r: any) => r.kyc_status === 'submitted').length.toString()} sub="awaiting review" accent />
        </div>
        {/* Recent reps + Products */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-cream-muted/30 mb-3">Recent Representatives</h3>
            <Table>
              <thead><tr><Th>Name</Th><Th>Leg</Th><Th>Rank</Th><Th>Status</Th></tr></thead>
              <tbody>
                {reps.slice(0,8).map((r: any) => (
                  <Tr key={r.id}>
                    <Td><span className="text-cream">{r.first_name} {r.last_name}</span></Td>
                    <Td><Badge status={r.leg} /></Td>
                    <Td className="text-cream-muted/50 text-[11px]">{r.current_rank || '—'}</Td>
                    <Td><Badge status={r.is_active ? 'active' : 'pending'} /></Td>
                  </Tr>
                ))}
                {reps.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No representatives yet</td></tr>
                )}
              </tbody>
            </Table>
          </div>
          <div>
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-cream-muted/30 mb-3">Product Catalogue</h3>
            <Table>
              <thead><tr><Th>Product</Th><Th>SCA</Th><Th>250g</Th><Th>Status</Th></tr></thead>
              <tbody>
                {products.map((p: any) => (
                  <Tr key={p.id}>
                    <Td><span className="text-cream">{p.name}</span></Td>
                    <Td className="font-mono text-[11px] text-cream-muted/50">{p.sca_score}</Td>
                    <Td className="font-mono text-[11px]">{fmt(p.price_250g)}</Td>
                    <Td><Badge status={p.status} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
