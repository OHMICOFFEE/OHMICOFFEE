import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json()
  const client = db()

  try {
    // Create Supabase Auth user
    const auth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: authData, error: authError } = await auth.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Generate rep slug from name
    const slug = `${body.first_name}${body.last_name}`.toLowerCase().replace(/[^a-z0-9]/g,'') + Math.floor(Math.random()*1000)

    // Create representative record
    const { data: rep, error: repError } = await client.from('representatives').insert({
      auth_user_id: authData.user.id,
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      id_number: body.id_number,
      date_of_birth: body.date_of_birth,
      city: body.city,
      province: body.province,
      bank_name: body.bank_name,
      bank_account_number: body.bank_account_number,
      bank_branch_code: body.bank_branch_code,
      bank_account_type: body.bank_account_type || 'cheque',
      crypto_wallet: body.crypto_wallet || null,
      payout_method: body.crypto_wallet ? 'crypto' : 'bank',
      sponsor_id: body.sponsor_id || null,
      sponsor_name: body.sponsor_name || null,
      leg: body.leg || 'left',
      status: 'pending',
      is_active: false,
      kyc_status: 'submitted',
      agreement_signed: true,
      agreement_signed_at: new Date().toISOString(),
      current_rank: 'Unranked',
      total_earned: 0,
      pending_payout: 0,
      total_paid_out: 0,
      left_team_count: 0,
      right_team_count: 0,
      personal_actives: 0,
      rep_slug: slug,
    }).select().single()

    if (repError) throw repError

    // Send welcome email
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: body.email,
        template: 'welcome',
        data: { name: body.first_name, repId: rep.id }
      })
    }).catch(() => {}) // non-blocking

    return NextResponse.json({ ok: true, repId: rep.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
