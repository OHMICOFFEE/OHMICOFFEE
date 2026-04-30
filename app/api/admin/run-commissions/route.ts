import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { calcDirectCommission, nextFriday, MONTHLY } from '@/lib/types'

export async function POST(req: Request) {
  const client = db()
  const now = new Date()
  const friday = nextFriday(now)
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  try {
    // Get all active reps
    const { data: reps } = await client.from('representatives').select('*').eq('is_active', true)
    if (!reps?.length) return NextResponse.json({ ok: true, processed: 0 })

    let processed = 0

    for (const rep of reps) {
      // Count their signups this week and this month
      const { count: weeklySignups } = await client.from('representatives')
        .select('id', { count: 'exact' })
        .eq('sponsor_id', rep.id)
        .gte('created_at', weekStart.toISOString())

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const { count: monthlySignups } = await client.from('representatives')
        .select('id', { count: 'exact' })
        .eq('sponsor_id', rep.id)
        .gte('created_at', monthStart)

      const directAmount = calcDirectCommission(weeklySignups || 0, monthlySignups || 0)

      if (directAmount > 0) {
        // Create commission record
        await client.from('commissions').insert({
          rep_id: rep.id,
          type: 'direct',
          amount: directAmount * 100, // store in cents
          description: `Direct commission — ${weeklySignups} signup(s) this week`,
          week_ending: friday.toISOString().split('T')[0],
          status: 'approved',
          payout_type: 'direct',
        })

        // Update pending payout
        await client.from('representatives').update({
          pending_payout: (rep.pending_payout || 0) + directAmount * 100,
          total_earned: (rep.total_earned || 0) + directAmount * 100,
        }).eq('id', rep.id)

        // Create payout record
        await client.from('payouts').insert({
          rep_id: rep.id,
          rep_name: `${rep.first_name} ${rep.last_name}`,
          amount: directAmount * 100,
          method: rep.payout_method || 'bank',
          bank_name: rep.bank_name,
          bank_account: rep.bank_account_number,
          crypto_wallet: rep.crypto_wallet,
          status: 'pending',
          payout_type: 'direct',
          week_ending: friday.toISOString().split('T')[0],
        })

        processed++
      }
    }

    return NextResponse.json({ ok: true, processed, friday: friday.toISOString().split('T')[0] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
