'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { Commission, fmt } from '@/lib/types'

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [leftVol, setLeftVol] = useState(8400)
  const [rightVol, setRightVol] = useState(7200)
  const [rate, setRate] = useState(10)

  useEffect(() => {
    supabase.from('commissions').select('*').order('created_at', { ascending: false }).then(({ data }) => setCommissions(data || []))
  }, [])

  const weaker = Math.min(leftVol, rightVol)
  const commDue = Math.round(weaker * rate / 100)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Commissions" action={{ label: 'Run Friday Payout', onClick: () => alert('Payout run initiated — see Payouts page') }} />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Calculator */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] p-5 mb-6">
          <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Binary Commission Calculator</h3>
          <div className="grid grid-cols-4 gap-4 items-end">
            {[['Left Leg Volume (R)', leftVol, setLeftVol],['Right Leg Volume (R)', rightVol, setRightVol],['Commission Rate (%)', rate, setRate]].map(([l,v,fn]) => (
              <div key={l as string}>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">{l as string}</label>
                <input type="number" value={v as number} onChange={e => (fn as Function)(parseFloat(e.target.value)||0)}
                  className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
              </div>
            ))}
            <div className="bg-[#141414] border border-red px-4 py-2">
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-1">Commission Due</div>
              <div className="font-cond font-black text-red text-[1.4rem]">R {commDue.toLocaleString('en-ZA')}</div>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Rep','From','Type','Amount','Week Ending','Status','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {commissions.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No commissions yet</td></tr>}
              {commissions.map(c => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-[12px] font-medium">{c.rep_id?.slice(0,8)}...</td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{c.from_rep_name || '—'}</td>
                  <td className="px-4 py-3"><span className="bg-red/10 text-red text-[10px] uppercase tracking-wider px-2 py-[1px]">{c.type}</span></td>
                  <td className="px-4 py-3 font-cond font-bold text-green-400">{fmt(c.amount)}</td>
                  <td className="px-4 py-3 text-[11px] text-white/40">{c.week_ending}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${c.status==='paid'?'bg-green-400/10 text-green-400':'bg-yellow-400/10 text-yellow-400'}`}>{c.status}</span></td>
                  <td className="px-4 py-3"><button className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[11px] px-2 py-1 transition-all">{c.status==='paid'?'Receipt':'Pay'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
