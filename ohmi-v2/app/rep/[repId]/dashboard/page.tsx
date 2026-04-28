import { serviceClient } from '@/lib/supabase'
import Topbar from '@/components/admin/Topbar'
import Stat from '@/components/ui/Stat'
import Badge from '@/components/ui/Badge'
import { calcRank, RANKS, fmt } from '@/lib/types'
import { notFound } from 'next/navigation'

export const revalidate = 30

export default async function RepDashboard({ params }: { params: { repId: string } }) {
  const db = serviceClient()
  const { data: rep } = await db.from('representatives').select('*').eq('id', params.repId).single()
  if (!rep) notFound()

  const rank = calcRank(rep.left_team_count || 0, rep.right_team_count || 0)
  const rankIdx = RANKS.findIndex(r => r.name === rank?.name)
  const nextRank = RANKS[rankIdx + 1]

  const { data: recentComms } = await db.from('commissions')
    .select('*').eq('rep_id', params.repId)
    .order('created_at', { ascending: false }).limit(6)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title={`Welcome, ${rep.first_name}`} />
      <div className="flex-1 p-6 overflow-y-auto space-y-5 fade-in">
        {/* Identity strip */}
        <div className="border border-navy-border bg-navy-light p-5 flex items-center justify-between">
          <div>
            <div className="font-display text-2xl text-cream font-light mb-1">{rep.first_name} {rep.last_name}</div>
            <div className="flex items-center gap-3">
              <Badge status={rep.is_active ? 'active' : 'pending'} />
              <span className="text-[10px] tracking-wider text-cream-muted/40 uppercase">{rep.package_name || 'Builder'} Package</span>
              <span className="font-mono text-[11px] text-cream-muted/30">{rep.rep_code}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/25 mb-1">Current Rank</div>
            <div className="font-display text-lg text-crimson font-light">{rank?.name || 'Unranked'}</div>
            {rank && <div className="font-mono text-[11px] text-cream-muted/40">{fmt(rank.monthly * 100)}/month</div>}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-px bg-navy-border">
          <Stat label="Total Earned" value={fmt(rep.total_earned || 0)} sub="all time" />
          <Stat label="Pending Payout" value={fmt(rep.pending_payout || 0)} sub="next Friday" accent />
          <Stat label="Left Leg" value={(rep.left_team_count || 0).toString()} sub="active reps" />
          <Stat label="Right Leg" value={(rep.right_team_count || 0).toString()} sub="active reps" />
        </div>

        {/* Progress to next rank */}
        {nextRank && (
          <div className="border border-navy-border bg-navy-light p-5">
            <div className="flex justify-between items-baseline mb-3">
              <div className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/30">
                Next rank: <span className="text-cream">{nextRank.name}</span>
              </div>
              <div className="font-mono text-[11px] text-crimson">R{nextRank.monthly.toLocaleString()}/mo</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(['left','right'] as const).map(side => {
                const current = side === 'left' ? (rep.left_team_count || 0) : (rep.right_team_count || 0)
                const required = side === 'left' ? nextRank.left : nextRank.right
                const pct = Math.min(Math.round((current / required) * 100), 100)
                return (
                  <div key={side}>
                    <div className="flex justify-between text-[10px] text-cream-muted/30 mb-1">
                      <span className="uppercase tracking-wider">{side} leg</span>
                      <span className="font-mono">{current} / {required}</span>
                    </div>
                    <div className="bg-navy-border h-[2px]">
                      <div className="bg-crimson h-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent commissions */}
        <div>
          <h3 className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/25 mb-3">Recent Commission Activity</h3>
          <div className="border border-navy-border">
            {(recentComms || []).length === 0 && (
              <div className="px-5 py-8 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No commissions yet</div>
            )}
            {(recentComms || []).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3 border-b border-navy-border/50 last:border-b-0">
                <div>
                  <div className="text-[12px] text-cream">{c.description || c.type}</div>
                  <div className="text-[10px] text-cream-muted/30 mt-[2px] font-mono">{c.week_ending || '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={c.status} />
                  <span className="font-mono text-emerald-400">{fmt(c.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
