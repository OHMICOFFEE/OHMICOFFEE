'use client'
import { useState, useEffect, useRef } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { getRank, zar } from '@/lib/types'

const emptyForm = {
  first_name:'', last_name:'', email:'', phone:'',
  leg:'left', sponsor_id:'', sponsor_name:'', personal_actives:'0'
}

export default function AdminNetwork() {
  const [reps, setReps] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({...emptyForm})
  const [tab, setTab] = useState<'all'|'left'|'right'>('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sponsorSearch, setSponsorSearch] = useState('')
  const [showSponsorDropdown, setShowSponsorDropdown] = useState(false)
  const sponsorRef = useRef<HTMLDivElement>(null)

  async function load() {
    const { data } = await supabase.from('representatives')
      .select('*').order('created_at', { ascending: false })
    setReps(data || [])
  }
  useEffect(() => { load() }, [])

  // Close sponsor dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (sponsorRef.current && !sponsorRef.current.contains(e.target as Node)) {
        setShowSponsorDropdown(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const leftActive = reps.filter(r => r.leg === 'left' && r.is_active).length
  const rightActive = reps.filter(r => r.leg === 'right' && r.is_active).length
  const rank = getRank(leftActive, rightActive, 0)
  const filtered = tab === 'all' ? reps : reps.filter(r => r.leg === tab)

  const sponsorResults = sponsorSearch.length > 0
    ? reps.filter(r => {
        const name = `${r.first_name} ${r.last_name}`.toLowerCase()
        const email = (r.email || '').toLowerCase()
        const q = sponsorSearch.toLowerCase()
        return name.includes(q) || email.includes(q)
      }).slice(0, 6)
    : reps.slice(0, 6)

  function openAdd(prefillLeg?: 'left'|'right', sponsorId?: string, sponsorName?: string) {
    setForm({ ...emptyForm, leg: prefillLeg || 'left', sponsor_id: sponsorId || '', sponsor_name: sponsorName || '' })
    setSponsorSearch(sponsorName || '')
    setEditing(null)
    setError('')
    setModal(true)
  }

  function openEdit(r: any) {
    setForm({
      first_name: r.first_name, last_name: r.last_name,
      email: r.email, phone: r.phone || '',
      leg: r.leg, sponsor_id: r.sponsor_id || '',
      sponsor_name: r.sponsor_name || '',
      personal_actives: (r.personal_actives || 0).toString(),
    })
    setSponsorSearch(r.sponsor_name || '')
    setEditing(r)
    setError('')
    setModal(true)
  }

  function selectSponsor(rep: any) {
    setForm((f: any) => ({ ...f, sponsor_id: rep.id, sponsor_name: `${rep.first_name} ${rep.last_name}` }))
    setSponsorSearch(`${rep.first_name} ${rep.last_name}`)
    setShowSponsorDropdown(false)
  }

  function closeModal() {
    setModal(false)
    setForm({...emptyForm})
    setSponsorSearch('')
    setEditing(null)
    setError('')
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
      const slug = `${form.first_name}${form.last_name}`.toLowerCase().replace(/[^a-z0-9]/g,'') + Math.floor(Math.random()*9000+1000)
      const { error: err } = await supabase.from('representatives').insert({
        ...payload,
        status: 'active',
        is_active: true,
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

      // Update sponsor's team counts
      if (form.sponsor_id) {
        const sponsor = reps.find(r => r.id === form.sponsor_id)
        if (sponsor) {
          const field = form.leg === 'left' ? 'left_team_count' : 'right_team_count'
          await supabase.from('representatives').update({
            [field]: (sponsor[field] || 0) + 1
          }).eq('id', form.sponsor_id)
        }
      }
    }
    await load()
    closeModal()
    setSaving(false)
  }

  async function toggle(id: string, current: boolean) {
    await supabase.from('representatives')
      .update({ is_active: !current, status: !current ? 'active' : 'suspended' })
      .eq('id', id)
    await load()
  }

  async function deleteRep(id: string, name: string) {
    if (!confirm(`Remove ${name} from the network? This cannot be undone.`)) return
    await supabase.from('representatives').delete().eq('id', id)
    await load()
  }

  return (
    <div className="main">
      <Topbar title="Representatives" action={
        <button className="btn btn-red" onClick={() => openAdd()}>+ Add Rep</button>
      } />
      <div className="page">
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            { label:'Total Reps', val: reps.length, sub:'All time' },
            { label:'Left Leg (Active)', val: leftActive, sub:'Monthly subscribers' },
            { label:'Right Leg (Active)', val: rightActive, sub:'Monthly subscribers' },
            { label:'Current Rank', val: rank?.id || '—', sub: rank ? `R ${rank.monthly.toLocaleString('en-ZA')}/month` : 'Below R1 threshold' },
          ].map(s => (
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className={`stat-val${s.label==='Current Rank'?' stat-val-sm':''}`}>{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {(['all','left','right'] as const).map(t => (
            <button key={t} className={`btn ${tab===t?'btn-red':'btn-outline'}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All Reps' : t === 'left' ? 'Left Leg' : 'Right Leg'}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Name','Email','Phone','Leg','Sponsor','Personal Actives','Rank','Status','Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.length === 0 && (
                <tr className="empty-row"><td colSpan={9}>No representatives yet — click + Add Rep</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="td-name">{r.first_name} {r.last_name}</td>
                  <td style={{color:'var(--text3)',fontSize:12}}>{r.email}</td>
                  <td style={{color:'var(--text3)'}}>{r.phone || '—'}</td>
                  <td><span className={`badge ${r.leg==='left'?'badge-cream':'badge-red'}`}>{r.leg}</span></td>
                  <td style={{color:'var(--text4)',fontSize:12}}>{r.sponsor_name || '—'}</td>
                  <td style={{textAlign:'center'}}>{r.personal_actives || 0}</td>
                  <td><span className="badge badge-gray">{r.current_rank || 'Unranked'}</span></td>
                  <td><span className={`badge ${r.is_active?'badge-green':'badge-yellow'}`}>{r.is_active?'Active':'Pending'}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-ghost" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-ghost" onClick={() => toggle(r.id, r.is_active)}>
                        {r.is_active ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="btn btn-ghost" style={{color:'var(--red)'}}
                        onClick={() => deleteRep(r.id, `${r.first_name} ${r.last_name}`)}>✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL — stops propagation so clicking inside never closes it */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal" style={{maxWidth:540}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                {editing ? `Edit — ${editing.first_name} ${editing.last_name}` : 'Add Representative'}
              </span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {error && (
                <div style={{background:'rgba(196,30,74,0.06)',border:'1px solid rgba(196,30,74,0.2)',borderRadius:6,padding:'10px 14px',marginBottom:16,fontSize:12,color:'var(--red)'}}>
                  {error}
                </div>
              )}
              <div className="grid-2">
                <div className="field">
                  <label>First Name *</label>
                  <input value={form.first_name} onChange={e => setForm((f:any) => ({...f, first_name: e.target.value}))} placeholder="First name" />
                </div>
                <div className="field">
                  <label>Last Name *</label>
                  <input value={form.last_name} onChange={e => setForm((f:any) => ({...f, last_name: e.target.value}))} placeholder="Last name" />
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm((f:any) => ({...f, email: e.target.value}))} placeholder="email@example.com" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input value={form.phone} onChange={e => setForm((f:any) => ({...f, phone: e.target.value}))} placeholder="+27 xx xxx xxxx" />
                </div>
                <div className="field">
                  <label>Leg Placement</label>
                  <select value={form.leg} onChange={e => setForm((f:any) => ({...f, leg: e.target.value}))}>
                    <option value="left">Left Leg</option>
                    <option value="right">Right Leg</option>
                  </select>
                </div>
                <div className="field">
                  <label>Personal Actives</label>
                  <input type="number" min="0" value={form.personal_actives}
                    onChange={e => setForm((f:any) => ({...f, personal_actives: e.target.value}))} />
                </div>

                {/* Sponsor — search + dropdown */}
                <div className="field span-2" ref={sponsorRef} style={{position:'relative'}}>
                  <label>Sponsor (search by name or email)</label>
                  <input
                    value={sponsorSearch}
                    onChange={e => { setSponsorSearch(e.target.value); setShowSponsorDropdown(true); setForm((f:any) => ({...f, sponsor_name: e.target.value, sponsor_id: ''})) }}
                    onFocus={() => setShowSponsorDropdown(true)}
                    placeholder="Type name or email, or leave blank for root..."
                  />
                  {showSponsorDropdown && sponsorResults.length > 0 && (
                    <div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:999,background:'var(--white)',border:'1px solid var(--border)',borderRadius:8,boxShadow:'var(--shadow2)',marginTop:4,maxHeight:200,overflowY:'auto'}}>
                      <div style={{padding:'6px 12px',fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text4)',borderBottom:'1px solid var(--border)'}}>
                        Select Sponsor
                      </div>
                      <div style={{padding:'6px 12px',borderBottom:'1px solid var(--border)',cursor:'pointer',fontSize:12,color:'var(--text4)'}}
                        onClick={() => { setForm((f:any) => ({...f, sponsor_id:'', sponsor_name:''})); setSponsorSearch(''); setShowSponsorDropdown(false) }}>
                        — No Sponsor (Root) —
                      </div>
                      {sponsorResults.map(r => (
                        <div key={r.id} onClick={() => selectSponsor(r)}
                          style={{padding:'10px 12px',cursor:'pointer',borderBottom:'1px solid var(--border)',transition:'background 0.1s'}}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{r.first_name} {r.last_name}</div>
                          <div style={{fontSize:11,color:'var(--text4)'}}>{r.email} · {r.leg} leg</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.sponsor_id && (
                    <div style={{marginTop:6,fontSize:11,color:'var(--green)'}}>
                      ✓ Sponsor selected: {form.sponsor_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Rep'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
