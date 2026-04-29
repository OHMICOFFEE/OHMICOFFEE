'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { zar, nextFriday } from '@/lib/types'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'pending'|'paid'>('all')

  async function load() {
    const q = supabase.from('payouts').select('*').order('created_at',{ascending:false})
    const {data} = await q
    setPayouts(data||[])
  }
  useEffect(()=>{load()},[])

  async function markPaid(id:string) {
    await supabase.from('payouts').update({status:'paid',processed_at:new Date().toISOString()}).eq('id',id)
    await load()
  }

  async function markAllPaid() {
    await supabase.from('payouts').update({status:'paid',processed_at:new Date().toISOString()}).eq('status','pending')
    await load()
  }

  const filtered = filter==='all' ? payouts : payouts.filter(p=>p.status===filter)
  const pendingTotal = payouts.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0)
  const paidTotal = payouts.filter(p=>p.status==='paid').reduce((s,p)=>s+p.amount,0)
  const friday = nextFriday()

  return (
    <div className="main">
      <Topbar title="Payouts" action={
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" onClick={markAllPaid}>Pay All Pending</button>
          <button className="btn btn-red" onClick={()=>alert('Invoice generation — Phase 2')}>Generate Invoices</button>
        </div>
      } />
      <div className="page">
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:20}}>
          {[
            {label:'Pending This Friday', val:zar(pendingTotal*100), sub:friday.toLocaleDateString('en-ZA')},
            {label:'Total Paid Out', val:zar(paidTotal*100), sub:'All time'},
            {label:'Next Payout Day', val:'Friday', sub:'Directs — Following Friday · Residuals — 7 days after month end'},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val" style={{fontSize:s.label==='Next Payout Day'?18:24}}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {(['all','pending','paid'] as const).map(f=>(
            <button key={f} className={`btn ${filter===f?'btn-red':'btn-outline'}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Rep','Amount','Method','Bank / Wallet','Type','Payout Date','Status','Action'].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.length===0 && <tr className="empty-row"><td colSpan={8}>No payouts yet</td></tr>}
              {filtered.map(p=>(
                <tr key={p.id}>
                  <td className="td-name">{p.rep_name||'—'}</td>
                  <td className="td-green">{zar(p.amount)}</td>
                  <td><span className="badge badge-gray">{p.method||'bank'}</span></td>
                  <td style={{fontSize:11,color:'var(--text3)'}}>{p.bank_account||p.crypto_wallet||'—'}</td>
                  <td><span className="badge badge-cream">{p.payout_type||'direct'}</span></td>
                  <td>{p.week_ending||'—'}</td>
                  <td><span className={`badge ${p.status==='paid'?'badge-green':'badge-yellow'}`}>{p.status}</span></td>
                  <td>{p.status!=='paid'&&<button className="btn btn-ghost" onClick={()=>markPaid(p.id)}>Mark Paid</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{marginTop:12,fontSize:11,color:'var(--text4)',textAlign:'center'}}>
          Direct commissions → following Friday · Residual income → within 7 days of month end · Bank EFT only · Full invoice history Phase 2
        </div>
      </div>
    </div>
  )
}
