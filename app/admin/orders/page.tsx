'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'pending'|'processing'|'shipped'|'fulfilled'>('all')
  const [selected, setSelected] = useState<any>(null)
  const [tracking, setTracking] = useState('')

  async function load() {
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setOrders(data || [])
  }
  useEffect(() => { load() }, [filter])

  function zar(cents: number) { return 'R ' + (cents / 100).toLocaleString('en-ZA') }

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status, ...(status === 'shipped' ? { tracking_number: tracking, shipped_at: new Date().toISOString() } : {}) }).eq('id', id)
    await load()
    setSelected(null)
    setTracking('')
  }

  const pending = orders.filter(o => o.status === 'pending').length

  return (
    <div className="main">
      <Topbar title="Orders" action={
        pending > 0 ? <span style={{fontSize:12,color:'var(--red)',fontWeight:600}}>{pending} pending order{pending>1?'s':''} to process</span> : undefined
      } />
      <div className="page">
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {(['all','pending','processing','shipped','fulfilled'] as const).map(f=>(
            <button key={f} className={`btn ${filter===f?'btn-red':'btn-outline'}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              {['Order #','Rep ID','Customer','Address','Items','Total','Payment','Status','Actions'].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.length===0 && <tr className="empty-row"><td colSpan={9}>No orders yet</td></tr>}
              {orders.map(o=>(
                <tr key={o.id}>
                  <td className="td-name">{o.order_number}</td>
                  <td style={{fontSize:11,color:'var(--text4)'}}>{o.rep_id?.slice(0,8)}…</td>
                  <td>
                    <div style={{fontWeight:500,color:'var(--text)',fontSize:12}}>{o.customer_name}</div>
                    <div style={{fontSize:11,color:'var(--text4)'}}>{o.customer_phone}</div>
                  </td>
                  <td style={{fontSize:11,color:'var(--text3)'}}>
                    {o.shipping_address?.line1}<br/>{o.shipping_address?.city}, {o.shipping_address?.province}
                  </td>
                  <td style={{fontSize:11}}>{Array.isArray(o.items)?o.items.length:0} item(s)</td>
                  <td className="td-amount">{zar(o.total)}</td>
                  <td><span className={`badge ${o.payment_status==='paid'?'badge-green':'badge-yellow'}`}>{o.payment_status}</span></td>
                  <td><span className={`badge ${o.status==='fulfilled'?'badge-green':o.status==='shipped'?'badge-cream':o.status==='processing'?'badge-yellow':'badge-red'}`}>{o.status}</span></td>
                  <td>
                    <button className="btn btn-ghost" onClick={()=>setSelected(o)}>Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal" style={{maxWidth:520}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order {selected.order_number}</span>
              <button className="modal-close" onClick={()=>setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              {/* Customer */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:8}}>Customer</div>
                <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{selected.customer_name}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>{selected.customer_phone} · {selected.customer_email}</div>
              </div>
              {/* Delivery */}
              <div style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',marginBottom:16}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:6}}>Delivery Address</div>
                <div style={{fontSize:13,color:'var(--text)',lineHeight:1.7}}>
                  {selected.shipping_address?.line1}<br/>
                  {selected.shipping_address?.city}, {selected.shipping_address?.province} {selected.shipping_address?.postal_code}
                </div>
              </div>
              {/* Items */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:8}}>Items</div>
                {(Array.isArray(selected.items)?selected.items:[]).map((item:any,i:number)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
                    <span style={{color:'var(--text)'}}>{item.product_name} {item.size} × {item.quantity}</span>
                    <span style={{color:'var(--red)',fontWeight:600}}>{zar(item.total)}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontSize:14,fontWeight:600}}>
                  <span>Total</span><span style={{color:'var(--red)'}}>{zar(selected.total)}</span>
                </div>
              </div>
              {/* Tracking */}
              {selected.status !== 'fulfilled' && (
                <div className="field">
                  <label>Tracking Number (optional)</label>
                  <input value={tracking} onChange={e=>setTracking(e.target.value)} placeholder="e.g. POSTNET123456" />
                </div>
              )}
              {selected.notes && <div style={{fontSize:12,color:'var(--text3)',marginBottom:12,background:'var(--bg)',padding:'10px 14px',borderRadius:8}}><strong>Notes:</strong> {selected.notes}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={()=>setSelected(null)}>Close</button>
              {selected.status==='pending' && <button className="btn btn-outline" onClick={()=>updateStatus(selected.id,'processing')}>Mark Processing</button>}
              {(selected.status==='pending'||selected.status==='processing') && <button className="btn btn-red" onClick={()=>updateStatus(selected.id,'shipped')}>Mark Shipped</button>}
              {selected.status==='shipped' && <button className="btn btn-red" onClick={()=>updateStatus(selected.id,'fulfilled')}>Mark Fulfilled</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
