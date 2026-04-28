'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'ohmi2025') {
      document.cookie = 'ohmi_admin=1;path=/;max-age=86400'
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="w-full max-w-[380px] px-8 fade-in">
        <div className="mb-10">
          <Logo size="lg" />
          <div className="w-8 h-px bg-crimson mt-3" />
        </div>
        <h1 className="font-display text-4xl font-light text-cream mb-1">Admin</h1>
        <p className="text-[11px] tracking-[0.25em] uppercase text-cream-muted/30 mb-8">Restricted Access</p>
        <div className="space-y-3 mb-6">
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full px-4 py-3 text-[13px]"
          />
          {error && <p className="text-crimson text-[11px]">{error}</p>}
        </div>
        <button onClick={login}
          className="w-full bg-crimson hover:bg-crimson-dark text-cream font-medium text-[11px] tracking-[0.25em] uppercase py-3 transition-colors">
          Enter
        </button>
        <div className="mt-12 pt-6 border-t border-navy-border">
          <p className="text-[10px] text-cream-muted/15 text-center tracking-wider">
            OHMI COFFEE CO. · INTERNAL PLATFORM
          </p>
        </div>
      </div>
    </main>
  )
}
