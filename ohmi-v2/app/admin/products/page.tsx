'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/admin/Topbar'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { fmt } from '@/lib/types'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
  }
  useEffect(() => { load() }, [])

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const slug = form.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (form.id) {
      await supabase.from('products').update({ ...form, updated_at: new Date().toISOString() }).eq('id', form.id)
    } else {
      await supabase.from('products').insert({ ...form, slug, status: form.status || 'active' })
    }
    await load()
    setModal(false)
    setForm({})
    setSaving(false)
  }

  const F = ({ label, k, type = 'text' }: { label: string; k: string; type?: string }) => (
    <div>
      <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">{label}</label>
      <input type={type} value={form[k] || ''} onChange={e => set(k, type === 'number' ? Number(e.target.value) || 0 : e.target.value)}
        className="w-full px-3 py-2 text-[12px]" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Products">
        <button onClick={() => { setForm({ status: 'active', type: 'single_origin' }); setModal(true) }}
          className="bg-crimson hover:bg-crimson-dark text-cream text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-colors">
          + Add Product
        </button>
      </Topbar>
      <div className="flex-1 p-6 overflow-y-auto">
        <Table>
          <thead><tr>
            <Th>Product</Th><Th>Type</Th><Th>SCA</Th><Th>Origin</Th>
            <Th>250g</Th><Th>500g</Th><Th>1kg</Th><Th>Status</Th><Th>Actions</Th>
          </tr></thead>
          <tbody>
            {products.map(p => (
              <Tr key={p.id}>
                <Td><span className="text-cream font-medium">{p.name}</span></Td>
                <Td><Badge status={p.type} /></Td>
                <Td className="font-mono text-[11px] text-cream-muted/50">{p.sca_score}</Td>
                <Td className="text-cream-muted/50 text-[12px]">{p.origin}</Td>
                <Td className="font-mono text-[12px]">{fmt(p.price_250g)}</Td>
                <Td className="font-mono text-[12px]">{fmt(p.price_500g)}</Td>
                <Td className="font-mono text-[12px]">{fmt(p.price_1kg)}</Td>
                <Td><Badge status={p.status} /></Td>
                <Td>
                  <button onClick={() => { setForm(p); setModal(true) }}
                    className="text-[10px] tracking-wider uppercase text-cream-muted/40 hover:text-crimson transition-colors border border-navy-border px-2 py-1">
                    Edit
                  </button>
                </Td>
              </Tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No products yet</td></tr>
            )}
          </tbody>
        </Table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-6" onClick={() => setModal(false)}>
          <div className="bg-navy border border-navy-border w-full max-w-[600px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-navy-border">
              <h2 className="font-display text-xl text-cream font-light">{form.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setModal(false)} className="text-cream-muted/30 hover:text-cream text-xl leading-none">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <F label="Product Name" k="name" />
              <div>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Type</label>
                <select value={form.type || 'single_origin'} onChange={e => set('type', e.target.value)} className="w-full px-3 py-2 text-[12px]">
                  <option value="single_origin">Single Origin</option>
                  <option value="infused">Infused Single Origin</option>
                </select>
              </div>
              <F label="Origin" k="origin" />
              <F label="Roast" k="roast" />
              <F label="Process" k="process" />
              <F label="MASL" k="masl" />
              <F label="Body" k="body" />
              <F label="SCA Score" k="sca_score" type="number" />
              <div className="col-span-2">
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Tasting Notes</label>
                <input type="text" value={form.tasting_notes || ''} onChange={e => set('tasting_notes', e.target.value)} className="w-full px-3 py-2 text-[12px]" />
              </div>
              <div className="col-span-2 pt-2 border-t border-navy-border">
                <div className="text-[9px] tracking-[0.25em] uppercase text-cream-muted/20 mb-3">Retail Pricing (cents — e.g. R210 = 21000)</div>
                <div className="grid grid-cols-3 gap-3">
                  <F label="250g" k="price_250g" type="number" />
                  <F label="500g" k="price_500g" type="number" />
                  <F label="1kg" k="price_1kg" type="number" />
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[9px] tracking-[0.25em] uppercase text-cream-muted/20 mb-3">Wholesale Pricing (cents)</div>
                <div className="grid grid-cols-3 gap-3">
                  <F label="250g wholesale" k="wholesale_250g" type="number" />
                  <F label="500g wholesale" k="wholesale_500g" type="number" />
                  <F label="1kg wholesale" k="wholesale_1kg" type="number" />
                </div>
              </div>
              <F label="Image URL" k="image_url" />
              <div>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Status</label>
                <select value={form.status || 'active'} onChange={e => set('status', e.target.value)} className="w-full px-3 py-2 text-[12px]">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-border flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="text-[11px] tracking-wider uppercase text-cream-muted/30 hover:text-cream px-4 py-2 border border-navy-border transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="bg-crimson hover:bg-crimson-dark disabled:opacity-40 text-cream text-[11px] tracking-wider uppercase px-6 py-2 transition-colors">
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
