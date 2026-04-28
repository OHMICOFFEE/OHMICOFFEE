'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fmt, calcRank, residualIncome, RANKS_TABLE } from '@/lib/types'
import Link from 'next/link'

export default function RepDashboard() {
  const [rep, setRep] = useState<any>(null)

  useEffect(() => {
    // In production: fetch from auth session
    // Demo data for layout purposes
    setRep({
      first_name: 'Brandon', last_name: 'Marriott',
      email: 'brandon@ohmicoffee.co.za',
      current_rank: 'Rising Star',
      left_team_count: 5, right_team_count: 5,
      total_earned: 250000, pending_payout: 80000,
      total_paid_out: 170000, personal_recruits: 4,
      is_active: true, rep_slug: 'brandon',
      package_name: 'Builder',
    })
  }, [])

  if (!rep) return <div className="flex-1 flex items-center justify-center text-white/20 text-[11px] tracking-widest uppercase">Loading...</div>

  const rank = calcRank(rep.left_team_count, rep.right_team_count)
  const monthly = residualIncome(rep.left_team_count, rep.right_team_count)
  const rankIdx = RANKS_TABLE.findIndex(r => r.name === rank)
  const nextRank = RANKS_TABLE[rankIdx + 1]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-12 bg-[#0c0c0c] border-b border-white/[0.07] flex items-center px-6">
        <h1 className="text-[12px] font-bold tracking-[0.08em]">Dashboard</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Welcome */}
        <div className="bg-red px-6 py-5 mb-5 flex items-center justify-between">
          <div>
            <div className="font-cond font-black text-[1.6rem] uppercase text-white leading-tight">
              Welcome back, {rep.first_name}.
            </div>
            <div className="text-white/65 text-[12px] mt-1">
              {rep.current_rank} · {rep.package_name} Package · ohmicoffee.co.za/rep/{rep.rep_slug}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-[0.25em] uppercase text-white/50">Your Rep Site</div>
            <a href={`/rep/${rep.rep_slug}`} target="_blank" className="text-white text-[12px] hover:underline font-mono">
              /rep/{rep.rep_slug} →
            </a>
          </div>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-px bg-white/[0.05] mb-5">
          {[
            { label: 'Total Earned', value: fmt(rep.total_earned), sub: 'All time' },
            { label: 'Pending Payout', value: fmt(rep.pending_payout), sub: 'Pays out Friday' },
            { label: 'Total Paid Out', value: fmt(rep.total_paid_out), sub: 'Received' },
            { label: 'Direct Recruits', value: rep.personal_recruits.toString(), sub: 'Your referrals' },
          ].map(s => (
            <div key={s.label} className="bg-[#0c0c0c] p-5">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">{s.label}</div>
              <div className="font-cond font-black text-[1.6rem] text-white">{s.value}</div>
              <div className="text-[11px] text-white/30">{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Rank + Legs */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">Current Rank</div>
            <div className="font-cond font-black text-[1.2rem] text-white mb-1">{rank}</div>
            <div className="font-cond font-bold text-red text-[1.4rem]">{fmt(monthly * 100)}<span className="font-sans font-normal text-white/30 text-[11px]">/mo</span></div>
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">Left Leg</div>
            <div className="font-cond font-black text-[2rem] text-white">{rep.left_team_count}</div>
            <div className="text-[11px] text-white/30">Active members</div>
            {nextRank && <div className="text-[10px] text-white/20 mt-1">Need {nextRank.left - rep.left_team_count} more</div>}
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">Right Leg</div>
            <div className="font-cond font-black text-[2rem] text-white">{rep.right_team_count}</div>
            <div className="text-[11px] text-white/30">Active members</div>
            {nextRank && <div className="text-[10px] text-white/20 mt-1">Need {nextRank.right - rep.right_team_count} more</div>}
          </div>
        </div>
        {/* Next rank progress */}
        {nextRank && (
          <div className="bg-[#0c0c0c] border border-white/[0.07] px-5 py-4 mb-5">
            <div className="flex justify-between items-baseline mb-2">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/25">Progress to: <span className="text-white">{nextRank.name}</span></div>
              <div className="font-cond font-black text-red">R{nextRank.earnings.toLocaleString('en-ZA')}/mo</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['left','right'].map(side => {
                const current = side === 'left' ? rep.left_team_count : rep.right_team_count
                const required = side === 'left' ? nextRank.left : nextRank.right
                const pct = Math.min((current / required) * 100, 100)
                return (
                  <div key={side}>
                    <div className="flex justify-between text-[10px] text-white/30 mb-1">
                      <span className="uppercase">{side} leg</span>
                      <span>{current}/{required}</span>
                    </div>
                    <div className="bg-[#1c1c1c] h-[3px]"><div className="bg-red h-full" style={{width:`${pct}%`}} /></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        {/* CTA row */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/downline" className="bg-[#141414] border border-white/[0.07] hover:border-red p-5 transition-colors group">
            <div className="font-cond font-bold text-[14px] group-hover:text-red transition-colors">My Downline Tree →</div>
            <div className="text-white/35 text-[12px] mt-1">View your full binary network</div>
          </Link>
          <Link href="/shop" className="bg-red hover:bg-red-dark p-5 transition-colors">
            <div className="font-cond font-bold text-[14px] text-white">Wholesale Shop →</div>
            <div className="text-white/65 text-[12px] mt-1">Order at your package discount rate</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
