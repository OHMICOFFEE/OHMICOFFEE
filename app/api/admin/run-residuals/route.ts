import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { getRank, residualPayoutDate, RANKS } from '@/lib/types'

export async function POST() {
  const client = db()
  const now = new Date()
  const payoutDate = residualPayoutDate(now.getFullYear(), now.getMonth() + 1)

  try {
    const { data: reps } = await client.from('representatives').select('*').eq('is_active', true)
    if (!reps?.length) return NextResponse.json({ ok: true, processed: 0 })

    // Get total active reps for profit share calculation
    const totalActive = reps.filter(r => r.is_active).length
    const monthlyPool = totalActive * 750 // R750 per rep
    let processed = 0

    for (const rep of reps) {
      const left = rep.left_team_count || 0
      const right = rep.right_team_count || 0
      const personal = rep.personal_actives || 0
      const rank = getRank(left, right, personal)
      if (!rank) continue

      let amount = 0

      if (rank.type === 'fixed' && rank.monthly) {
        amount = rank.monthly * 100 // cents
      } else if (rank.type === 'profit' && rank.pct) {
        // Net profit = pool minus all fixed rank payouts
        // Simplified: use % of total pool
        amount = Math.floor(monthlyPool * rank.pct / 100) * 100
      }

      if (amount <= 0) continue

      await client.from('commissions').insert({
        rep_id: rep.id,
        type: 'residual',
        amount,
        description: `Residual income — ${rank.id} rank · ${left}L + ${right}R`,
        week_ending: payoutDate.toISOString().split('T')[0],
        status: 'approved',
        payout_type: 'residual',
      })

      await client.from('representatives').update({
        pending_payout: (rep.pending_payout || 0) + amount,
        total_earned: (rep.total_earned || 0) + amount,
        total_residual_commissions: (rep.total_residual_commissions || 0) + amount,
      }).eq('id', rep.id)

      await client.from('payouts').insert({
        rep_id: rep.id,
        rep_name: `${rep.first_name} ${rep.last_name}`,
        amount,
        method: rep.payout_method || 'bank',
        bank_name: rep.bank_name,
        bank_account: rep.bank_account_number,
        crypto_wallet: rep.crypto_wallet,
        status: 'pending',
        payout_type: 'residual',
        week_ending: payoutDate.toISOString().split('T')[0],
      })

      processed++
    }

    return NextResponse.json({ ok: true, processed, payoutDate: payoutDate.toISOString().split('T')[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
