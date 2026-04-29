'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { zar } from '@/lib/types'

const empty = {
  name:'', origin:'', roast:'', type:'single_origin', sca_score:85,
  tasting_notes:'', flavour_profile:'', body:'', process:'', masl:'',
  price_250g:21000, price_500g:34000, price_1kg:58000,
  wholesale_250g:13000, wholesale_500g:21000, wholesale_1kg:36000,
  image_url:'', status:'active'
}

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string|null>(null)

  async function load() {
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
  }
  useEffect(() => { load() }, [])

  function set(k: string, v: any) { setForm((f:any) => ({ ...f, [k]: v })) }
  function openAdd() { setForm({...empty}); setModal(true) }
  function openEdit(p: any) { setForm({...p}); setModal(true) }

  async function save() {
    if (!form.name) return alert('Product name is required')
    setSaving(true)
    if (form.id) {
      const { error } = await supabase.from('products').update({
        name: form.name, origin: form.origin, roast: form.roast,
        type: form.type, sca_score: parseInt(form.sca_score)||85,
        tasting_notes: form.tasting_notes, flavour_profile: form.flavour_profile,
        body: form.body, process: form.process, masl: form.masl,
        price_250g: parseInt(form.price_250g)||0,
        price_500g: parseInt(form.price_500g)||0,
        price_1kg: parseInt(form.price_1kg)||0,
        wholesale_250g: parseInt(form.wholesale_250g)||0,
        wholesale_500g: parseInt(form.wholesale_500g)||0,
        wholesale_1kg: parseInt(form.wholesale_1kg)||0,
        image_url: form.image_url, status: form.status,
        updated_at: new Date().toISOString(),
      }).eq('id', form.id)
      if (error) { alert('Save failed: ' + error.message); setSaving(false); return }
    } else {
      const slug = form.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      const { error } = await supabase.from('products').insert({
        ...form, slug,
        sca_score: parseInt(form.sca_score)||85,
        price_250g: parseInt(form.price_250g)||0,
        price_500g: parseInt(form.price_500g)||0,
        price_1kg: parseInt(form.price_1kg)||0,
        wholesale_250g: parseInt(form.wholesale_250g)||0,
        wholesale_500g: parseInt(form.wholesale_500g)||0,
        wholesale_1kg: parseInt(form.wholesale_1kg)||0,
      })
      if (error) { alert('Save failed: ' + error.message); setSaving(false); return }
    }
    await load(); setModal(false); setForm({...empty}); setSaving(false)
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    await load()
    setDeleting(null)
  }

  async function toggleStatus(id: string, current: string) {
    await supabase.from('products').update({ status: current === 'active' ? 'draft' : 'active' }).eq('id', id)
    await load()
  }

  const F = ({ label, k, type='text', span=false }: { label:string; k:string; type?:string; span?:boolean }) => (
    <div className={`field${span?' span-2':''}`}>
      <label>{label}</label>
      <input type={type} value={form[k]??''} onChange={e=>set(k,e.target.value)} />
    </div>
  )

  return (
    <div className="main">
      <Topbar title={`Products (${products.length})`} action={<button className="btn btn-red" onClick={openAdd}>+ Add Product</button>} />
      <div className="page">
        <div className="table-wrap">
          <table>
            <thead><tr>{['Name','Type','SCA','250g','500g','1kg','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {products.length===0 && <tr className="empty-row"><td colSpan={8}>No products</td></tr>}
              {products.map(p=>(
                <tr key={p.id}>
                  <td className="td-name">{p.name}</td>
                  <td><span className="badge badge-gray">{p.type==='infused'?'Infused':'Single Origin'}</span></td>
                  <td style={{color:'var(--text3)'}}>{p.sca_score}</td>
                  <td>{zar(p.price_250g)}</td>
                  <td>{zar(p.price_500g)}</td>
                  <td>{zar(p.price_1kg)}</td>
                  <td><button onClick={()=>toggleStatus(p.id,p.status)} style={{background:'none',border:'none',cursor:'pointer',padding:0}}><span className={`badge ${p.status==='active'?'badge-green':'badge-gray'}`}>{p.status}</span></button></td>
                  <td><div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost" onClick={()=>openEdit(p)}>Edit</button>
                    <button className="btn btn-ghost" style={{color:'var(--red)',borderColor:'rgba(196,30,74,0.25)'}} disabled={deleting===p.id} onClick={()=>deleteProduct(p.id,p.name)}>{deleting===p.id?'…':'Delete'}</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={()=>{ if(!saving){setModal(false);setForm({...empty})} }}>
          <div className="modal" style={{maxWidth:620}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{form.id?`Edit — ${form.name}`:'Add New Product'}</span>
              <button className="modal-close" onClick={()=>{setModal(false);setForm({...empty})}}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <F label="Product Name" k="name" span />
                <div className="field"><label>Type</label>
                  <select value={form.type||'single_origin'} onChange={e=>set('type',e.target.value)}>
                    <option value="single_origin">Single Origin</option>
                    <option value="infused">Infused Single Origin</option>
                  </select>
                </div>
                <div className="field"><label>Status</label>
                  <select value={form.status||'active'} onChange={e=>set('status',e.target.value)}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <F label="Origin" k="origin" />
                <F label="Roast Level" k="roast" />
                <F label="Process" k="process" />
                <F label="MASL" k="masl" />
                <F label="Body" k="body" />
                <F label="SCA Score" k="sca_score" type="number" />
                <F label="Tasting Notes" k="tasting_notes" span />
                <F label="Flavour Profile" k="flavour_profile" span />
                <div style={{gridColumn:'1/-1',paddingTop:8,borderTop:'1px solid var(--border)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text4)',marginBottom:12}}>Retail Pricing (cents — R210 = 21000)</div>
                  <div className="grid-3"><F label="250g" k="price_250g" type="number" /><F label="500g" k="price_500g" type="number" /><F label="1kg" k="price_1kg" type="number" /></div>
                </div>
                <div style={{gridColumn:'1/-1',paddingTop:8,borderTop:'1px solid var(--border)'}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text4)',marginBottom:12}}>Wholesale Pricing (for reps)</div>
                  <div className="grid-3"><F label="250g" k="wholesale_250g" type="number" /><F label="500g" k="wholesale_500g" type="number" /><F label="1kg" k="wholesale_1kg" type="number" /></div>
                </div>
                <F label="Image URL" k="image_url" span />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>{setModal(false);setForm({...empty})}}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>{saving?'Saving...':form.id?'Save Changes':'Add Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
