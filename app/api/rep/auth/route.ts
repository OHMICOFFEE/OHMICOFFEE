import { NextResponse } from 'next/server'
import { db } from '@/lib/supabase'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const client = db()

  // Sign in via Supabase Auth
  const { createClient } = await import('@supabase/supabase-js')
  const auth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data, error } = await auth.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Get rep record
  const { data: rep } = await client
    .from('representatives')
    .select('id, first_name, last_name, is_active, kyc_status')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!rep) {
    return NextResponse.json({ error: 'No representative account found' }, { status: 404 })
  }

  const res = NextResponse.json({ repId: rep.id, name: `${rep.first_name} ${rep.last_name}` })
  res.cookies.set('ohmi_rep', rep.id, {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ohmi_rep')
  return res
}
