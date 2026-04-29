'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { getRank, zar, RANKS } from '@/lib/types'

export default function AdminNetwork() {
  const [reps, setReps] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<Record<string,string>>({})
  const [tab, setTab] = useState<'all'|'left'|'right'>('all')

  async function load() {
    const { data } = await supabase.from('representatives').select('*').order('created_at',{ascending:false})
    setReps(data || [])
  }
  useEffect(() => { load() }, [])

  const leftActive = reps.filter(r=>r.leg==='left'&&r.is_active).length
  const rightActive = reps.filter(r=>r.leg==='right'&&r.is_active).length
  const rank = getRank(leftActive, rightActive)
  const filtered = tab==='all' ? reps : reps.filter(r=>r.leg===tab)

  async function addRep() {
    await supabase.from('representatives').insert({
      first_name:form.first_name, last_name:form.last_name,
      email:form.email, phone:form.phone,
      leg:form.leg||'left', sponsor_name:form.sponsor_name,
      status:'pending', is_active:false,
      total_earned:0, pending_payout:0,
      left_team_count:0, right_team_count:0, personal_actives:0,
      current_rank:'Unranked',
    })
    await load(); setModal(false); setForm({})
  }

  async function toggle(id:string, current:boolean) {
    await supabase.from('representatives').update({is_active:!current,status:!current?'active':'suspended'}).eq('id',id)
    await load()
  }

  return (
    <div className="main">
      <Topbar title="Representatives" action={<button className="btn btn-red" onClick={()=>setModal(true)}>+ Add Rep</button>} />
      <div className="page">
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          {[
            {label:'Total Reps', val:reps.length, sub:'All time'},
            {label:'Left Leg (Active)', val:leftActive, sub:'Monthly subscribers'},
            {label:'Right Leg (Active)', val:rightActive, sub:'Monthly subscribers'},
            {label:'Current Rank', val:rank?.id||'—', sub:rank?.id ? `${rank.left}L + ${rank.right}R required` : 'Below R1 threshold'},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val" style={{fontSize:s.label==='Current Rank'?18:24}}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {rank && (
          <div className="pool-meter" style={{marginBottom:20}}>
            <div className="pool-meter-title">Active Rank — {rank.id}: {rank.name || ''}</div>
            <div className="pool-row">
              <span className="pool-key">Monthly Residual Income</span>
              <span className="pool-val-red" style={{fontSize:18}}>{rank.type==='fixed' ? `R ${(rank.monthly||0).toLocaleString('en-ZA')}` : `${(rank as any).pct}% of net profit`}</span>
            </div>
            <div className="pool-row">
              <span className="pool-key">Qualification</span>
              <span className="pool-val">{leftActive}L + {rightActive}R active subscribers</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {(['all','left','right'] as const).map(t=>(
            <button key={t} className={`btn ${tab===t?'btn-red':'btn-outline'}`} onClick={()=>setTab(t)}>
              {t==='all'?'All Reps':t==='left'?'Left Leg':'Right Leg'}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Name','Email','Phone','Leg','Sponsor','Personal Actives','Rank','Status','Actions'].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.length===0 && <tr className="empty-row"><td colSpan={9}>No representatives yet</td></tr>}
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td className="td-name">{r.first_name} {r.last_name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone||'—'}</td>
                  <td><span className={`badge ${r.leg==='left'?'badge-cream':'badge-red'}`}>{r.leg}</span></td>
                  <td>{r.sponsor_name||'—'}</td>
                  <td style={{textAlign:'center'}}>{r.personal_actives||0}</td>
                  <td><span className="badge badge-gray">{r.current_rank||'Unranked'}</span></td>
                  <td><span className={`badge ${r.is_active?'badge-green':'badge-yellow'}`}>{r.is_active?'Active':'Pending'}</span></td>
                  <td>
                    <button className="btn btn-ghost" onClick={()=>toggle(r.id,r.is_active)}>
                      {r.is_active?'Suspend':'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Representative</span>
              <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                {[['first_name','First Name'],['last_name','Last Name'],['email','Email'],['phone','Phone'],['sponsor_name','Sponsor Name']].map(([k,l])=>(
                  <div key={k} className="field">
                    <label>{l}</label>
                    <input type="text" value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
                  </div>
                ))}
                <div className="field">
                  <label>Leg Placement</label>
                  <select value={form.leg||'left'} onChange={e=>setForm(f=>({...f,leg:e.target.value}))}>
                    <option value="left">Left Leg</option>
                    <option value="right">Right Leg</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-red" onClick={addRep}>Add Rep</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
