import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ohmicoffee.co.za'
  const adminPass = process.env.ADMIN_PASSWORD || 'ohmi2025'

  if (email === adminEmail && password === adminPass) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('ohmi_admin', 'authenticated', {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return res
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('ohmi_admin')
  return res
}
