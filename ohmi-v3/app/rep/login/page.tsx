'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RepLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/rep/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      const { repId } = await res.json()
      router.push(`/rep/${repId}/dashboard`)
    } else {
      const { error: err } = await res.json()
      setError(err || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <div className="login-logo-name">OHMI Coffee Co.</div>
          <div className="login-logo-line" />
          <div className="login-logo-sub">Representative Portal</div>
        </div>
        <form onSubmit={login}>
          <div className="field"><label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="field"><label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn btn-red" style={{width:'100%'}} disabled={loading}>
            {loading?'Signing in...':'Sign In to Portal'}
          </button>
        </form>
        <div style={{marginTop:24,textAlign:'center',fontSize:11,color:'var(--text4)',lineHeight:1.9}}>
          Access by invitation only.<br/>Contact your sponsor for a referral link.
        </div>
      </div>
    </div>
  )
}
