'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { getRank, zar } from '@/lib/types'

const emptyForm = { first_name:'', last_name:'', email:'', phone:'', leg:'left', sponsor_id:'', sponsor_name:'', personal_actives:'0' }

export default function AdminNetwork() {
  const [reps, setReps] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [tab, setTab] = useState<'all'|'left'|'right'>('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data } = await supabase.from('representatives').select('*').order('created_at', { ascending: false })
    setReps(data || [])
  }
  useEffect(() => { load() }, [])

  const leftActive = reps.filter(r => r.leg === 'left' && r.is_active).length
  const rightActive = reps.filter(r => r.leg === 'right' && r.is_active).length
  const rank = getRank(leftActive, rightActive)
  const filtered = tab === 'all' ? reps : reps.filter(r => r.leg === tab)

  function openAdd() { setForm({...emptyForm}); setEditing(null); setError(''); setModal(true) }
  function openEdit(r: any) {
    setForm({
      first_name: r.first_name, last_name: r.last_name,
      email: r.email, phone: r.phone || '',
      leg: r.leg, sponsor_id: r.sponsor_id || '',
      sponsor_name: r.sponsor_name || '',
      personal_actives: (r.personal_actives || 0).toString(),
    })
    setEditing(r)
    setError('')
    setModal(true)
  }

  async function save() {
    if (!form.first_name || !form.last_name || !form.email) {
      setError('First name, last name and email are required')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone,
      leg: form.leg,
      sponsor_id: form.sponsor_id || null,
      sponsor_name: form.sponsor_name || null,
      personal_actives: parseInt(form.personal_actives) || 0,
    }

    if (editing) {
      const { error: err } = await supabase.from('representatives').update(payload).eq('id', editing.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const slug = `${form.first_name}${form.last_name}`.toLowerCase().replace(/[^a-z0-9]/g,'') + Math.floor(Math.random()*1000)
      const { error: err } = await supabase.from('representatives').insert({
        ...payload,
        status: 'pending',
        is_active: false,
        kyc_status: 'pending',
        agreement_signed: false,
        current_rank: 'Unranked',
        total_earned: 0,
        pending_payout: 0,
        total_paid_out: 0,
        left_team_count: 0,
        right_team_count: 0,
        rep_slug: slug,
      })
      if (err) { setError(err.message); setSaving(false); return }
    }
    await load(); setModal(false); setForm({...emptyForm}); setEditing(null); setSaving(false)
  }

  async function toggle(id: string, current: boolean) {
    await supabase.from('representatives').update({ is_active: !current, status: !current ? 'active' : 'suspended' }).eq('id', id)
    await load()
  }

  async function deleteRep(id: string, name: string) {
    if (!confirm(`Remove ${name} from the network?`)) return
    await supabase.from('representatives').delete().eq('id', id)
    await load()
  }

  return (
    <div className="main">
      <Topbar title="Representatives" action={<button className="btn btn-red" onClick={openAdd}>+ Add Rep</button>} />
      <div className="page">
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}} className="stats-row" >
          {[
            { label:'Total Reps', val:reps.length, sub:'All time' },
            { label:'Left Leg (Active)', val:leftActive, sub:'Monthly subscribers' },
            { label:'Right Leg (Active)', val:rightActive, sub:'Monthly subscribers' },
            { label:'Current Rank', val:rank?.id||'—', sub:rank?`R ${rank.monthly.toLocaleString('en-ZA')}/month`:'Below R1 threshold' },
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-val${s.label==='Current Rank'?' stat-val-sm':''}`}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

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
              {filtered.length===0 && <tr className="empty-row"><td colSpan={9}>No representatives yet — click + Add Rep to get started</td></tr>}
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td className="td-name">{r.first_name} {r.last_name}</td>
                  <td style={{color:'var(--text3)',fontSize:12}}>{r.email}</td>
                  <td style={{color:'var(--text3)'}}>{r.phone||'—'}</td>
                  <td><span className={`badge ${r.leg==='left'?'badge-cream':'badge-red'}`}>{r.leg}</span></td>
                  <td style={{color:'var(--text4)',fontSize:12}}>{r.sponsor_name||'—'}</td>
                  <td style={{textAlign:'center'}}>{r.personal_actives||0}</td>
                  <td><span className="badge badge-gray">{r.current_rank||'Unranked'}</span></td>
                  <td><span className={`badge ${r.is_active?'badge-green':'badge-yellow'}`}>{r.is_active?'Active':'Pending'}</span></td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost" onClick={()=>openEdit(r)}>Edit</button>
                      <button className="btn btn-ghost" onClick={()=>toggle(r.id,r.is_active)}>{r.is_active?'Suspend':'Activate'}</button>
                      <button className="btn btn-ghost" style={{color:'var(--red)'}} onClick={()=>deleteRep(r.id,`${r.first_name} ${r.last_name}`)}>✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>{ if(!saving){setModal(false);setForm({...emptyForm});setEditing(null)} }}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing?`Edit — ${editing.first_name} ${editing.last_name}`:'Add Representative'}</span>
              <button className="modal-close" onClick={()=>{setModal(false);setForm({...emptyForm});setEditing(null)}}>×</button>
            </div>
            <div className="modal-body">
              {error && <div className="login-error" style={{marginBottom:16}}>{error}</div>}
              <div className="grid-2">
                <div className="field"><label>First Name *</label><input value={form.first_name} onChange={e=>setForm((f:any)=>({...f,first_name:e.target.value}))} placeholder="First name" /></div>
                <div className="field"><label>Last Name *</label><input value={form.last_name} onChange={e=>setForm((f:any)=>({...f,last_name:e.target.value}))} placeholder="Last name" /></div>
                <div className="field"><label>Email *</label><input type="email" value={form.email} onChange={e=>setForm((f:any)=>({...f,email:e.target.value}))} placeholder="email@example.com" /></div>
                <div className="field"><label>Phone</label><input value={form.phone} onChange={e=>setForm((f:any)=>({...f,phone:e.target.value}))} placeholder="+27 xx xxx xxxx" /></div>
                <div className="field">
                  <label>Leg Placement</label>
                  <select value={form.leg} onChange={e=>setForm((f:any)=>({...f,leg:e.target.value}))}>
                    <option value="left">Left Leg</option>
                    <option value="right">Right Leg</option>
                  </select>
                </div>
                <div className="field"><label>Personal Actives</label><input type="number" min="0" value={form.personal_actives} onChange={e=>setForm((f:any)=>({...f,personal_actives:e.target.value}))} /></div>
                <div className="field"><label>Sponsor Name</label><input value={form.sponsor_name} onChange={e=>setForm((f:any)=>({...f,sponsor_name:e.target.value}))} placeholder="Sponsor's full name" /></div>
                <div className="field">
                  <label>Sponsor</label>
                  <select value={form.sponsor_id} onChange={e=>{
                    const rep = reps.find(r=>r.id===e.target.value)
                    setForm((f:any)=>({...f,sponsor_id:e.target.value,sponsor_name:rep?`${rep.first_name} ${rep.last_name}`:f.sponsor_name}))
                  }}>
                    <option value="">— No Sponsor (Root) —</option>
                    {reps.filter(r=>!editing||r.id!==editing.id).map(r=>(
                      <option key={r.id} value={r.id}>{r.first_name} {r.last_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>{setModal(false);setForm({...emptyForm});setEditing(null)}}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>{saving?'Saving...':editing?'Save Changes':'Add Rep'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
