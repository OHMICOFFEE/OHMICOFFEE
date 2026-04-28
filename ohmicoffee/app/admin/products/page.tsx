'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { Product, fmt } from '@/lib/types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').order('sort_order').then(({ data }) => setProducts(data || []))
  }, [])

  async function save() {
    if (!editing) return
    setSaving(true)
    if (editing.id) {
      await supabase.from('products').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('products').insert({ ...editing, slug: editing.name?.toLowerCase().replace(/ /g,'-') })
    }
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
    setShowModal(false)
    setEditing(null)
    setSaving(false)
  }

  function Field({ label, field, type='text' }: { label:string; field:keyof Product; type?:string }) {
    return (
      <div>
        <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">{label}</label>
        <input type={type} value={(editing as any)?.[field] || ''} onChange={e => setEditing(prev => ({...prev, [field]: type==='number'?parseInt(e.target.value)||0:e.target.value}))}
          className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Products" action={{ label: '+ Add Product', onClick: () => { setEditing({}); setShowModal(true) } }} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Product','Type','SCA','Origin','250g','500g','1kg','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[13px]">{p.name}</td>
                  <td className="px-4 py-3"><span className="bg-red/15 text-red text-[10px] tracking-wider uppercase px-2 py-[2px]">{p.type === 'infused' ? 'Infused' : 'Single'}</span></td>
                  <td className="px-4 py-3 text-[12px] font-mono text-white/60">{p.sca_score}</td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{p.origin}</td>
                  <td className="px-4 py-3 text-[12px] font-mono">{fmt(p.price_250g)}</td>
                  <td className="px-4 py-3 text-[12px] font-mono">{fmt(p.price_500g)}</td>
                  <td className="px-4 py-3 text-[12px] font-mono">{fmt(p.price_1kg)}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] tracking-wider uppercase px-2 py-[2px] ${p.status==='active'?'bg-green-400/10 text-green-400':p.status==='draft'?'bg-yellow-400/10 text-yellow-400':'bg-red/10 text-red'}`}>{p.status}</span></td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => { setEditing(p); setShowModal(true) }} className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[11px] px-2 py-1 transition-all">Edit</button>
                    <button onClick={async () => { await supabase.from('products').update({status:'draft'}).eq('id',p.id); const { data } = await supabase.from('products').select('*').order('sort_order'); setProducts(data||[]) }} className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[11px] px-2 py-1 transition-all">Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 z-[900] flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <div className="bg-[#0c0c0c] border border-white/[0.1] w-full max-w-[650px] max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.07]">
              <h3 className="font-cond font-bold text-[14px] tracking-[0.08em]">{editing?.id ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-white/30 hover:text-white text-xl">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Field label="Product Name" field="name" />
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Type</label>
                <select value={editing?.type||'single_origin'} onChange={e=>setEditing(p=>({...p,type:e.target.value as any}))} className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2">
                  <option value="single_origin">Single Origin</option>
                  <option value="infused">Infused Single Origin</option>
                </select>
              </div>
              <Field label="Origin" field="origin" />
              <Field label="Roast Level" field="roast" />
              <Field label="Process" field="process" />
              <Field label="MASL" field="masl" />
              <Field label="Body" field="body" />
              <Field label="SCA Score" field="sca_score" type="number" />
              <Field label="Tasting Notes" field="tasting_notes" />
              <Field label="Flavour Profile" field="flavour_profile" />
              <div className="col-span-2 border-t border-white/[0.07] pt-4">
                <div className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">Retail Pricing (ZAR cents)</div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="250g Retail" field="price_250g" type="number" />
                  <Field label="500g Retail" field="price_500g" type="number" />
                  <Field label="1kg Retail" field="price_1kg" type="number" />
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">Wholesale Pricing (ZAR cents)</div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="250g Wholesale" field="wholesale_250g" type="number" />
                  <Field label="500g Wholesale" field="wholesale_500g" type="number" />
                  <Field label="1kg Wholesale" field="wholesale_1kg" type="number" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Status</label>
                <select value={editing?.status||'active'} onChange={e=>setEditing(p=>({...p,status:e.target.value}))} className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2">
                  <option value="active">Active — Live on Site</option>
                  <option value="draft">Draft — Hidden</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
              <Field label="Image URL" field="image_url" />
            </div>
            <div className="px-6 py-4 border-t border-white/[0.07] flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border border-white/[0.12] text-white/40 font-cond font-bold text-[11px] tracking-wider uppercase px-5 py-2">Cancel</button>
              <button onClick={save} disabled={saving} className="bg-red hover:bg-red-dark disabled:opacity-50 text-white font-cond font-bold text-[11px] tracking-wider uppercase px-6 py-2 transition-colors">
                {saving ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
