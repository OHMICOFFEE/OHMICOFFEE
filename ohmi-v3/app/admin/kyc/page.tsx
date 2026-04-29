'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'

export default function AdminKYC() {
  const [reps, setReps] = useState<any[]>([])
  const [filter, setFilter] = useState<'submitted'|'pending'|'verified'|'rejected'|'all'>('submitted')
  const [processing, setProcessing] = useState<string|null>(null)

  async function load() {
    let q = supabase.from('representatives').select('*').order('kyc_submitted_at', { ascending: false })
    if (filter !== 'all') q = q.eq('kyc_status', filter)
    const { data } = await q
    setReps(data || [])
  }
  useEffect(() => { load() }, [filter])

  async function action(repId: string, act: 'approve'|'reject') {
    setProcessing(repId)
    await fetch('/api/admin/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repId, action: act }),
    })
    await load()
    setProcessing(null)
  }

  return (
    <div className="main">
      <Topbar title="KYC Verification" />
      <div className="page">
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {(['submitted','pending','verified','rejected','all'] as const).map(f => (
            <button key={f} className={`btn ${filter===f?'btn-red':'btn-outline'}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Name','Email','ID Number','Submitted','KYC Status','Account Status','Actions'].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {reps.length===0 && <tr className="empty-row"><td colSpan={7}>No {filter} KYC applications</td></tr>}
              {reps.map(r => (
                <tr key={r.id}>
                  <td className="td-name">{r.first_name} {r.last_name}</td>
                  <td style={{color:'var(--text3)'}}>{r.email}</td>
                  <td style={{color:'var(--text3)',fontSize:11}}>{r.id_number||'—'}</td>
                  <td style={{color:'var(--text4)',fontSize:11}}>{r.kyc_submitted_at?new Date(r.kyc_submitted_at).toLocaleDateString('en-ZA'):'—'}</td>
                  <td><span className={`badge ${r.kyc_status==='verified'?'badge-green':r.kyc_status==='submitted'?'badge-yellow':r.kyc_status==='rejected'?'badge-red':'badge-gray'}`}>{r.kyc_status}</span></td>
                  <td><span className={`badge ${r.is_active?'badge-green':'badge-yellow'}`}>{r.is_active?'Active':'Pending'}</span></td>
                  <td>
                    {r.kyc_status==='submitted' && (
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost" style={{color:'var(--green)',borderColor:'rgba(26,102,64,0.3)',fontSize:11}} disabled={processing===r.id} onClick={()=>action(r.id,'approve')}>
                          {processing===r.id?'…':'✓ Approve'}
                        </button>
                        <button className="btn btn-ghost" style={{color:'var(--red)',borderColor:'rgba(196,30,74,0.3)',fontSize:11}} disabled={processing===r.id} onClick={()=>action(r.id,'reject')}>
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {r.kyc_status==='verified' && <span style={{fontSize:11,color:'var(--green)'}}>✓ Verified</span>}
                    {r.kyc_status==='rejected' && <span style={{fontSize:11,color:'var(--red)'}}>✗ Rejected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
