'use client'
import Link from 'next/link'
import { useState } from 'react'
export default function RepLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <main className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[400px] px-8">
        <Link href="/" className="font-cond font-black text-[1.1rem] tracking-[0.2em] uppercase text-white block mb-10">
          OHMI <span className="text-red">COFFEE CO.</span>
        </Link>
        <h1 className="font-cond font-black uppercase text-[3rem] leading-[0.9] mb-2">Rep<br/><span className="text-red">Portal</span></h1>
        <p className="text-white/35 text-[12px] mb-8">Sign in to your back office</p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.1] text-white text-[13px] px-4 py-3" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.1] text-white text-[13px] px-4 py-3" />
          </div>
        </div>
        <button className="w-full bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase py-3 transition-colors mb-4">
          Sign In
        </button>
        <p className="text-white/30 text-[12px] text-center">
          Not a rep yet? <Link href="/rep/register" className="text-red hover:underline">Join OHMI Network</Link>
        </p>
      </div>
    </main>
  )
}
