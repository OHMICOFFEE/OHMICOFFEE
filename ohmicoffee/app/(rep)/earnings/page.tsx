'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/types'

export default function RepEarnings() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])

  // Demo data until auth session is wired up
  const demoComms = [
    { id:'1', type:'direct', amount:50000, description:'New Builder signup — Sarah K.', week_ending:'2025-01-17', status:'paid', from_rep_name:'Sarah Kotze' },
    { id:'2', type:'residual', amount:80000, description:'Monthly binary income — Rising Star rank', week_ending:'2025-01-17', status:'paid', from_rep_name:null },
    { id:'3', type:'direct', amount:50000, description:'New Builder signup — James M.', week_ending:'2025-01-24', status:'pending', from_rep_name:'James Muller' },
    { id:'4', type:'matching', amount:8000, description:'10% matching bonus — James M.', week_ending:'2025-01-24', status:'pending', from_rep_name:'James Muller' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-12 bg-[#0c0c0c] border-b border-white/[0.07] flex items-center px-6">
        <h1 className="text-[12px] font-bold tracking-[0.08em]">Earnings History</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.05] mb-6">
          {[
            ['Total Earned', fmt(188000), 'All time'],
            ['Pending (This Friday)', fmt(58000), 'Pays out Friday'],
            ['Paid Out', fmt(130000), 'Received to date'],
          ].map(([l,v,s]) => (
            <div key={l} className="bg-[#0c0c0c] p-5">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">{l}</div>
              <div className="font-cond font-black text-[1.6rem]">{v}</div>
              <div className="text-[11px] text-white/30">{s}</div>
            </div>
          ))}
        </div>
        {/* Commission types breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[['Direct Commissions',fmt(100000),'2 × R500'],['Residual Income',fmt(80000),'1 payout'],['Matching Bonuses',fmt(8000),'10% of R80k']].map(([t,v,d]) => (
            <div key={t} className="bg-[#141414] border border-white/[0.07] px-4 py-4">
              <div className="text-[10px] uppercase tracking-wider text-white/25 mb-1">{t}</div>
              <div className="font-cond font-black text-red text-[1.3rem]">{v}</div>
              <div className="text-[11px] text-white/30">{d}</div>
            </div>
          ))}
        </div>
        {/* Transaction table */}
        <div className="bg-[#0c0c0c] border border-white/[0.07]">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Type','Amount','Description','Week Ending','Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {demoComms.map(c => (
                <tr key={c.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${c.type==='direct'?'bg-blue-400/10 text-blue-400':c.type==='residual'?'bg-green-400/10 text-green-400':'bg-yellow-400/10 text-yellow-400'}`}>{c.type}</span></td>
                  <td className="px-4 py-3 font-cond font-bold text-[14px] text-green-400">{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-[12px] text-white/60">{c.description}</td>
                  <td className="px-4 py-3 text-[11px] text-white/40">{c.week_ending}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${c.status==='paid'?'bg-green-400/10 text-green-400':'bg-yellow-400/10 text-yellow-400'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-white/15 text-[11px] mt-4">Payouts every Friday by bank EFT or USDT. Minimum threshold: R200.</p>
      </div>
    </div>
  )
}
