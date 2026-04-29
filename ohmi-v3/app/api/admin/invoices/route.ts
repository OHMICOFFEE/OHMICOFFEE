import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const payoutId = searchParams.get('payoutId')
  const repId = searchParams.get('repId')
  const client = db()

  let query = client.from('payouts').select(`
    *,
    representatives(first_name, last_name, email, id_number, bank_name, bank_account_number)
  `)

  if (payoutId) query = query.eq('id', payoutId)
  if (repId) query = query.eq('rep_id', repId)

  const { data } = await query.order('created_at', { ascending: false }).limit(50)
  return NextResponse.json({ payouts: data || [] })
}
