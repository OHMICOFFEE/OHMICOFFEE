'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { Payout, fmt } from '@/lib/types'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  useEffect(() => {
    supabase.from('payouts').select('*').order('created_at', { ascending: false }).then(({ data }) => setPayouts(data || []))
  }, [])

  async function markPaid(id: string) {
    await supabase.from('payouts').update({ status: 'paid', processed_at: new Date().toISOString() }).eq('id', id)
    const { data } = await supabase.from('payouts').select('*').order('created_at', { ascending: false })
    setPayouts(data || [])
  }

  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Friday Payouts" action={{ label: 'Process All Pending', onClick: () => alert('Bulk payout processing — iKhokha/EFT integration Phase 2') }} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#0c0c0c] border border-red/30 p-5 mb-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-1">Total Pending This Friday</div>
            <div className="font-cond font-black text-[2rem] text-red">{fmt(totalPending)}</div>
          </div>
          <div className="text-white/30 text-[12px]">Payouts every Friday · Bank EFT or USDT</div>
        </div>
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Rep','Amount','Method','Bank/Wallet','Week Ending','Status','Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {payouts.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No payouts yet — run commissions first</td></tr>}
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[13px]">{p.rep_name}</td>
                  <td className="px-4 py-3 font-cond font-bold text-green-400 text-[14px]">{fmt(p.amount)}</td>
                  <td className="px-4 py-3"><span className="text-[10px] uppercase tracking-wider bg-white/5 px-2 py-[1px]">{p.method}</span></td>
                  <td className="px-4 py-3 text-[11px] text-white/40">{p.bank_account || p.crypto_wallet || '—'}</td>
                  <td className="px-4 py-3 text-[11px] text-white/40">{p.week_ending}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${p.status==='paid'?'bg-green-400/10 text-green-400':'bg-yellow-400/10 text-yellow-400'}`}>{p.status}</span></td>
                  <td className="px-4 py-3">{p.status !== 'paid' && <button onClick={() => markPaid(p.id)} className="bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] tracking-wider uppercase px-3 py-1 hover:bg-green-500/25 transition-colors font-cond font-bold">Mark Paid</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
