'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { zar } from '@/lib/types'

const empty = { name:'',origin:'',roast:'',type:'single_origin',sca_score:85,tasting_notes:'',price_250g:21000,price_500g:34000,price_1kg:58000,wholesale_250g:13000,wholesale_500g:21000,wholesale_1kg:36000,image_url:'',status:'active' }

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>(empty)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
  }
  useEffect(() => { load() }, [])

  function set(k: string, v: any) { setForm((f:any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    if (form.id) {
      await supabase.from('products').update(form).eq('id', form.id)
    } else {
      await supabase.from('products').insert({ ...form, slug: form.name.toLowerCase().replace(/\s+/g,'-') })
    }
    await load(); setModal(false); setForm(empty); setSaving(false)
  }

  const F = ({ label, k, type='text' }: { label:string; k:string; type?:string }) => (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={form[k]||''} onChange={e=>set(k,type==='number'?parseInt(e.target.value)||0:e.target.value)} />
    </div>
  )

  return (
    <div className="main">
      <Topbar title="Products" action={<button className="btn btn-red" onClick={()=>{setForm(empty);setModal(true)}}>+ Add Product</button>} />
      <div className="page">
        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Name','Type','SCA','Retail 250g','Retail 500g','Retail 1kg','Status',''].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {products.length===0 && <tr className="empty-row"><td colSpan={8}>No products yet — add your first one</td></tr>}
              {products.map(p=>(
                <tr key={p.id}>
                  <td className="td-name">{p.name}</td>
                  <td><span className="badge badge-gray">{p.type==='infused'?'Infused':'Single Origin'}</span></td>
                  <td>{p.sca_score}</td>
                  <td>{zar(p.price_250g)}</td>
                  <td>{zar(p.price_500g)}</td>
                  <td>{zar(p.price_1kg)}</td>
                  <td><span className={`badge ${p.status==='active'?'badge-green':'badge-gray'}`}>{p.status}</span></td>
                  <td style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost" onClick={()=>{setForm(p);setModal(true)}}>Edit</button>
                    <button className="btn btn-ghost" onClick={async()=>{await supabase.from('products').update({status:'draft'}).eq('id',p.id);await load()}}>Archive</button>
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
              <span className="modal-title">{form.id?'Edit Product':'Add Product'}</span>
              <button className="modal-close" onClick={()=>setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="span-2"><F label="Product Name" k="name" /></div>
                <div className="field">
                  <label>Type</label>
                  <select value={form.type} onChange={e=>set('type',e.target.value)}>
                    <option value="single_origin">Single Origin</option>
                    <option value="infused">Infused</option>
                  </select>
                </div>
                <F label="Origin" k="origin" />
                <F label="Roast" k="roast" />
                <F label="SCA Score" k="sca_score" type="number" />
                <div className="span-2"><F label="Tasting Notes" k="tasting_notes" /></div>
                <F label="250g Retail (cents)" k="price_250g" type="number" />
                <F label="500g Retail (cents)" k="price_500g" type="number" />
                <F label="1kg Retail (cents)" k="price_1kg" type="number" />
                <F label="250g Wholesale (cents)" k="wholesale_250g" type="number" />
                <F label="500g Wholesale (cents)" k="wholesale_500g" type="number" />
                <F label="1kg Wholesale (cents)" k="wholesale_1kg" type="number" />
                <div className="span-2"><F label="Image URL" k="image_url" /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setModal(false)}>Cancel</button>
              <button className="btn btn-red" onClick={save} disabled={saving}>{saving?'Saving...':'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
