import { NextResponse } from 'next/server'

const TEMPLATES: Record<string, (data: any) => { subject: string; html: string }> = {
  welcome: (d) => ({
    subject: 'Welcome to OHMI Coffee Co. — Your Application is Received',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a0808">
        <div style="font-size:22px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">OHMI Coffee Co.</div>
        <div style="width:40px;height:1px;background:#C41E4A;margin:10px 0 28px"></div>
        <p style="font-size:15px;margin-bottom:16px">Dear ${d.name},</p>
        <p style="line-height:1.8;margin-bottom:16px">Thank you for applying to become an OHMI Coffee Co. representative. Your application has been received and your KYC documents are under review.</p>
        <p style="line-height:1.8;margin-bottom:24px">Our team will verify your documents within 24 hours. Once approved, your account will be activated and you can begin building your network.</p>
        <p style="font-size:12px;color:#8a6060;line-height:1.8">Brew Good, Do Good.<br/>OHMI Coffee Co. · sales@ohmicoffee.co.za</p>
      </div>
    `
  }),
  payout_sent: (d) => ({
    subject: `OHMI Payout Processed — R ${d.amount}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a0808">
        <div style="font-size:22px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">OHMI Coffee Co.</div>
        <div style="width:40px;height:1px;background:#C41E4A;margin:10px 0 28px"></div>
        <p style="font-size:15px;margin-bottom:16px">Dear ${d.name},</p>
        <p style="line-height:1.8;margin-bottom:16px">Your commission payout of <strong>R ${d.amount}</strong> has been processed and transferred to your bank account.</p>
        <div style="background:#F5EDD6;border:1px solid #C4B99A;padding:16px 20px;margin:20px 0;border-radius:3px">
          <div style="font-size:11px;color:#8a6060;margin-bottom:4px">PAYOUT AMOUNT</div>
          <div style="font-size:28px;color:#C41E4A;font-weight:600">R ${d.amount}</div>
          <div style="font-size:11px;color:#8a6060;margin-top:8px">${d.type} · ${d.date}</div>
        </div>
        <p style="font-size:12px;color:#8a6060;line-height:1.8">Brew Good, Do Good.<br/>OHMI Coffee Co. · sales@ohmicoffee.co.za</p>
      </div>
    `
  }),
  rank_achieved: (d) => ({
    subject: `Congratulations! You've reached ${d.rank} — OHMI Coffee Co.`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a0808">
        <div style="font-size:22px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">OHMI Coffee Co.</div>
        <div style="width:40px;height:1px;background:#C41E4A;margin:10px 0 28px"></div>
        <p style="font-size:15px;margin-bottom:16px">Dear ${d.name},</p>
        <p style="line-height:1.8;margin-bottom:16px">Congratulations! You have achieved <strong>${d.rank}</strong> rank in the OHMI network.</p>
        <div style="background:#C41E4A;color:#F5EDD6;padding:20px 24px;margin:20px 0;border-radius:3px;text-align:center">
          <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.7;margin-bottom:6px">New Rank</div>
          <div style="font-size:28px;font-weight:600">${d.rank}</div>
          <div style="font-size:14px;opacity:0.8;margin-top:4px">R ${d.monthly}/month residual income</div>
        </div>
        <p style="font-size:12px;color:#8a6060;line-height:1.8">Brew Good, Do Good.<br/>OHMI Coffee Co. · sales@ohmicoffee.co.za</p>
      </div>
    `
  }),
  kyc_approved: (d) => ({
    subject: 'Your OHMI Account is Now Active',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a0808">
        <div style="font-size:22px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">OHMI Coffee Co.</div>
        <div style="width:40px;height:1px;background:#C41E4A;margin:10px 0 28px"></div>
        <p style="font-size:15px;margin-bottom:16px">Dear ${d.name},</p>
        <p style="line-height:1.8;margin-bottom:16px">Your KYC verification has been approved and your OHMI representative account is now active. You can now log in to your portal and begin building your network.</p>
        <a href="${d.loginUrl}" style="display:inline-block;background:#C41E4A;color:#F5EDD6;padding:12px 24px;text-decoration:none;border-radius:3px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;margin:16px 0">Access Your Portal →</a>
        <p style="font-size:12px;color:#8a6060;line-height:1.8;margin-top:24px">Brew Good, Do Good.<br/>OHMI Coffee Co. · sales@ohmicoffee.co.za</p>
      </div>
    `
  }),
}

export async function POST(req: Request) {
  const { to, template, data } = await req.json()
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.log('Email (no Resend key):', { to, template, data })
    return NextResponse.json({ ok: true, note: 'No Resend key — logged only' })
  }

  const t = TEMPLATES[template]
  if (!t) return NextResponse.json({ error: 'Unknown template' }, { status: 400 })

  const { subject, html } = t(data)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'OHMI Coffee Co. <sales@ohmicoffee.co.za>', to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
