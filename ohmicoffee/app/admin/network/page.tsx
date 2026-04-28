'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { Representative, fmt, calcRank, residualIncome } from '@/lib/types'

export default function AdminNetwork() {
  const [reps, setReps] = useState<Representative[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<Record<string,string>>({})
  useEffect(() => {
    supabase.from('representatives').select('*').order('created_at', { ascending: false }).then(({ data }) => setReps(data || []))
  }, [])

  const totalLeft = reps.filter(r => r.leg === 'left' && r.is_active).length
  const totalRight = reps.filter(r => r.leg === 'right' && r.is_active).length
  const currentRank = calcRank(totalLeft, totalRight)
  const monthlyIncome = residualIncome(totalLeft, totalRight)

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Binary Network" action={{ label: '+ Add Member', onClick: () => setShowModal(true) }} />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-px bg-white/[0.06] mb-6">
          {[['Total Active Reps',(reps.filter(r=>r.is_active).length).toString()],['Left Leg',totalLeft.toString()],['Right Leg',totalRight.toString()],['Current Rank',currentRank]].map(([l,v]) => (
            <div key={l} className="bg-[#0c0c0c] p-5">
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-2">{l}</div>
              <div className="font-cond font-bold text-[1rem] leading-tight text-white">{v}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#0c0c0c] border border-white/[0.07] px-5 py-4 mb-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-1">Monthly Residual Income Potential</div>
            <div className="font-cond font-black text-[2rem] text-red">{fmt(monthlyIncome * 100)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-1">Next Rank</div>
            <div className="font-cond font-bold text-[13px] text-white/60">Grow both legs equally to advance</div>
          </div>
        </div>
        {/* Rep table */}
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Name','Email','Package','Leg','Sponsor','Monthly Vol.','Commission','KYC','Status','Actions'].map(h => (
                <th key={h} className="text-left px-3 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {reps.length === 0 && <tr><td colSpan={10} className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No representatives yet</td></tr>}
              {reps.map(r => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-medium text-[12px]">{r.first_name} {r.last_name}</td>
                  <td className="px-3 py-3 text-[11px] text-white/40">{r.email}</td>
                  <td className="px-3 py-3 text-[11px] text-white/50">—</td>
                  <td className="px-3 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${r.leg==='left'?'bg-blue-400/10 text-blue-400':'bg-purple-400/10 text-purple-400'}`}>{r.leg}</span></td>
                  <td className="px-3 py-3 text-[11px] text-white/40">{r.sponsor_name || '—'}</td>
                  <td className="px-3 py-3 text-[12px] font-mono">—</td>
                  <td className="px-3 py-3 text-[12px] font-mono text-green-400">{fmt(r.total_earned)}</td>
                  <td className="px-3 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${r.kyc_status==='verified'?'bg-green-400/10 text-green-400':r.kyc_status==='submitted'?'bg-yellow-400/10 text-yellow-400':'bg-red/10 text-red'}`}>{r.kyc_status}</span></td>
                  <td className="px-3 py-3"><span className={`text-[10px] uppercase tracking-wider px-2 py-[1px] ${r.is_active?'bg-green-400/10 text-green-400':'bg-white/5 text-white/30'}`}>{r.is_active?'Active':'Pending'}</span></td>
                  <td className="px-3 py-3 flex gap-1">
                    <button className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[10px] px-2 py-1 transition-all">View</button>
                    <button onClick={async () => { await supabase.from('representatives').update({is_active:!r.is_active,status:r.is_active?'suspended':'active'}).eq('id',r.id); const {data} = await supabase.from('representatives').select('*').order('created_at',{ascending:false}); setReps(data||[]) }} className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[10px] px-2 py-1 transition-all">{r.is_active?'Suspend':'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add member modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 z-[900] flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-[#0c0c0c] border border-white/[0.1] w-full max-w-[540px]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-5 py-4 border-b border-white/[0.07]">
              <h3 className="font-cond font-bold text-[14px]">Add Network Member</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[['first_name','First Name'],['last_name','Last Name'],['email','Email'],['phone','Phone'],['id_number','SA ID Number'],['bank_name','Bank Name'],['bank_account_number','Account Number'],['bank_branch_code','Branch Code']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">{l}</label>
                  <input type="text" value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Leg Placement</label>
                <select value={form.leg||'left'} onChange={e=>setForm(f=>({...f,leg:e.target.value}))} className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2">
                  <option value="left">Left Leg</option><option value="right">Right Leg</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Membership Tier</label>
                <select value={form.tier||'starter'} onChange={e=>setForm(f=>({...f,tier:e.target.value}))} className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2">
                  <option value="starter">Starter — R1,000</option><option value="builder">Builder — R2,000</option><option value="elite">Elite — R5,000</option>
                </select>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/[0.07] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border border-white/[0.12] text-white/40 text-[11px] tracking-wider uppercase px-4 py-2 font-cond font-bold">Cancel</button>
              <button onClick={async () => { await supabase.from('representatives').insert({...form,status:'pending',is_active:false,total_earned:0,pending_payout:0,left_team_count:0,right_team_count:0}); const {data}=await supabase.from('representatives').select('*').order('created_at',{ascending:false}); setReps(data||[]); setShowModal(false); setForm({}) }} className="bg-red hover:bg-red-dark text-white text-[11px] tracking-wider uppercase px-6 py-2 font-cond font-bold transition-colors">Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
