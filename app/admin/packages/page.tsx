'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { zar } from '@/lib/types'

const empty = {
  name: '',
  once_off_fee: 200000,
  monthly_fee: 150000,
  direct_commission: 50000,
  description: '',
  features: '',
  is_active: true,
  sort_order: 1,
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('packages').select('*').order('sort_order')
    setPackages(data || [])
  }
  useEffect(() => { load() }, [])

  function set(k: string, v: any) { setForm((f:any) => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.name) return alert('Package name is required')
    setSaving(true)
    const payload = {
      name: form.name,
      once_off_fee: parseInt(form.once_off_fee)||0,
      monthly_fee: parseInt(form.monthly_fee)||0,
      direct_commission: parseInt(form.direct_commission)||0,
      description: form.description,
      features: typeof form.features === 'string'
        ? form.features.split('\n').filter((f:string)=>f.trim())
        : form.features,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order)||1,
    }
    if (form.id) {
      await supabase.from('packages').update(payload).eq('id', form.id)
    } else {
      await supabase.from('packages').insert(payload)
    }
    await load(); setModal(false); setForm({...empty}); setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('packages').update({ is_active: !current }).eq('id', id)
    await load()
  }

  async function deletePackage(id: string, name: string) {
    if (!confirm(`Delete package "${name}"?`)) return
    await supabase.from('packages').delete().eq('id', id)
    await load()
  }

  function openEdit(p: any) {
    setForm({
      ...p,
      features: Array.isArray(p.features) ? p.features.join('\n') : p.features || '',
    })
    setModal(true)
  }

  return (
    <div className="main">
      <Topbar title="Rep Packages" action={
        <button className="btn btn-red" onClick={()=>{ setForm({...empty}); setModal(true) }}>+ Add Package</button>
      } />
      <div className="page">
        {/* Info box */}
        <div className="pool-meter" style={{marginBottom:20}}>
          <div className="pool-meter-title">Current Package Structure</div>
          <div className="pool-row">
            <span className="pool-key">Once-off join fee</span>
            <span className="pool-val">R2,000 — splits: R500 license + R750 coffee + R500 commission + R250 profit</span>
          </div>
          <div className="pool-row">
            <span className="pool-key">Monthly subscription</span>
            <span className="pool-val">R1,500 — splits: R250 license + R500 coffee + R750 pool</span>
          </div>
          <div className="pool-row">
            <span className="pool-key">Direct commission</span>
            <span className="pool-val">R500 per signup (paid following Friday)</span>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
          {packages.map(pkg => (
            <div key={pkg.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:4,overflow:'hidden'}}>
              <div style={{background:pkg.is_active?'var(--red)':'var(--bg3)',padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:20,color:pkg.is_active?'var(--bg)':'var(--text)',fontWeight:500}}>{pkg.name}</div>
                  <div style={{fontSize:9,color:pkg.is_active?'rgba(245,237,214,0.65)':'var(--text4)',letterSpacing:'0.14em',textTransform:'uppercase',marginTop:2}}>{pkg.is_active?'Active':'Inactive'}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:22,color:pkg.is_active?'var(--bg)':'var(--red)',lineHeight:1}}>{zar(pkg.once_off_fee)}</div>
                  <div style={{fontSize:10,color:pkg.is_active?'rgba(245,237,214,0.6)':'var(--text4)',marginTop:2}}>once-off</div>
                </div>
              </div>
              <div style={{padding:'14px 18px'}}>
                <div style={{fontSize:13,color:'var(--text2)',marginBottom:12}}>{zar(pkg.monthly_fee)}<span style={{fontSize:10,color:'var(--text4)'}}>/month</span></div>
                <div style={{fontSize:11,color:'var(--red)',marginBottom:12}}>Direct commission: {zar(pkg.direct_commission)}</div>
                {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                  <ul style={{listStyle:'none',marginBottom:14}}>
                    {pkg.features.map((f:string,i:number) => (
                      <li key={i} style={{fontSize:11,color:'var(--text3)',padding:'3px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:8,alignItems:'flex-start'}}>
                        <span style={{color:'var(--red)',flexShrink:0}}>·</span>{f}
                      </li>
                    ))}
                  </ul>
                )}
                <div style={{display:'flex',gap:6,marginTop:12}}>
                  <button className="btn btn-ghost" style={{flex:1}} onClick={()=>openEdit(pkg)}>Edit</button>
                  <button className="btn btn-ghost" style={{flex:1,color:pkg.is_active?'var(--yellow)':'var(--green)'}} onClick={()=>toggleActive(pkg.id,pkg.is_active)}>
                    {pkg.is_active?'Deactivate':'Activate'}
                  </button>
                  <button className="btn btn-ghost" style={{color:'var(--red)',borderColor:'rgba(196,30,74,0.25)'}} onClick={()=>deletePackage(pkg.id,pkg.name)}>✗</button>
                </div>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div style={{gridColumn:'1/-1',textAlign:'center',padding:'60px 20px',color:'var(--text4)',fontSize:12,letterSpacing:'0.08em'}}>
              No packages yet — add your first one above
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>{ if(!saving){ setModal(false); setForm({...empty}) }}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{form.id?`Edit — ${form.name}`:'Add Package'}</span>
              <button className="modal-close" onClick={()=>{ setModal(false); setForm({...empty}) }}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="field span-2">
                  <label>Package Name</label>
                  <input type="text" value={form.name||''} onChange={e=>set('name',e.target.value)} placeholder="e.g. Standard" />
                </div>
                <div className="field">
                  <label>Once-off Fee (cents — R2,000 = 200000)</label>
                  <input type="number" value={form.once_off_fee||''} onChange={e=>set('once_off_fee',e.target.value)} />
                </div>
                <div className="field">
                  <label>Monthly Fee (cents — R1,500 = 150000)</label>
                  <input type="number" value={form.monthly_fee||''} onChange={e=>set('monthly_fee',e.target.value)} />
                </div>
                <div className="field">
                  <label>Direct Commission (cents — R500 = 50000)</label>
                  <input type="number" value={form.direct_commission||''} onChange={e=>set('direct_commission',e.target.value)} />
                </div>
                <div className="field">
                  <label>Sort Order</label>
                  <input type="number" value={form.sort_order||1} onChange={e=>set('sort_order',e.target.value)} />
                </div>
                <div className="field span-2">
                  <label>Description</label>
                  <input type="text" value={form.description||''} onChange={e=>set('description',e.target.value)} />
                </div>
                <div className="field span-2">
                  <label>Features (one per line)</label>
                  <textarea value={form.features||''} onChange={e=>set('features',e.target.value)} rows={5} placeholder={"Network position\nRep portal access\nBinary tree placement"} style={{resize:'vertical'}} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.is_active?'active':'inactive'} onChange={e=>set('is_active',e.target.value==='active')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>{ setModal(false); setForm({...empty}) }}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>
                {saving?'Saving...':form.id?'Save Changes':'Add Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
