'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function RepLogin() {
  const [email, setEmail] = useState('')
  const [repCode, setRepCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function login() {
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('representatives')
      .select('id, email, rep_code, status, kyc_status')
      .eq('email', email.toLowerCase().trim())
      .eq('rep_code', repCode.toUpperCase().trim())
      .single()

    if (err || !data) {
      setError('Invalid email or rep code. Contact your sponsor.')
      setLoading(false)
      return
    }
    if (data.status === 'suspended') {
      setError('Your account has been suspended. Contact support.')
      setLoading(false)
      return
    }
    document.cookie = `ohmi_rep=${data.id};path=/;max-age=86400`
    router.push(`/rep/${data.id}/dashboard`)
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-full max-w-[380px] px-8 fade-in">
        <div className="mb-10">
          <Logo size="lg" />
          <div className="w-8 h-px bg-crimson mt-3" />
        </div>
        <h1 className="font-display text-4xl font-light text-cream mb-1">Rep Portal</h1>
        <p className="text-[11px] tracking-[0.25em] uppercase text-cream-muted/30 mb-8">By invitation only</p>
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full px-4 py-3 text-[13px]" />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Rep Code</label>
            <input type="text" placeholder="e.g. OHMI-AB12CD" value={repCode} onChange={e => setRepCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full px-4 py-3 text-[13px] font-mono" />
          </div>
          {error && <p className="text-crimson text-[11px]">{error}</p>}
        </div>
        <button onClick={login} disabled={loading}
          className="w-full bg-crimson hover:bg-crimson-dark disabled:opacity-40 text-cream font-medium text-[11px] tracking-[0.25em] uppercase py-3 transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-[10px] text-cream-muted/20 text-center mt-6 leading-relaxed">
          Your rep code is provided by your sponsor or OHMI admin on signup.
        </p>
        <div className="mt-8 pt-6 border-t border-navy-border">
          <p className="text-[10px] text-cream-muted/15 text-center tracking-wider">
            OHMI COFFEE CO. · INVITATION ONLY PLATFORM
          </p>
        </div>
      </div>
    </main>
  )
}
