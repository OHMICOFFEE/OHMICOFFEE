import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: Request) {
  const { repId, action } = await req.json()
  const client = db()

  const { data: rep } = await client.from('representatives').select('*').eq('id', repId).single()
  if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 })

  if (action === 'approve') {
    await client.from('representatives').update({
      kyc_status: 'verified',
      kyc_verified_at: new Date().toISOString(),
      is_active: true,
      status: 'active',
      activated_at: new Date().toISOString(),
    }).eq('id', repId)

    // Send approval email
    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: rep.email,
        template: 'kyc_approved',
        data: {
          name: rep.first_name,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ohmicoffee.vercel.app'}/rep/login`,
        }
      })
    }).catch(() => {})
  } else if (action === 'reject') {
    await client.from('representatives').update({
      kyc_status: 'rejected',
      is_active: false,
      status: 'pending',
    }).eq('id', repId)
  }

  return NextResponse.json({ ok: true })
}
