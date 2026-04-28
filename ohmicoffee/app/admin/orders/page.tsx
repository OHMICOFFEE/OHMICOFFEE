'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { Order, fmt } from '@/lib/types'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => setOrders(data || []))
  }, [])
  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Orders" action={{ label: 'Export CSV', onClick: () => alert('Export coming soon') }} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Order #','Customer','Items','Total','Payment','Status','Date','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No orders yet</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[11px] text-red">{o.order_number}</td>
                  <td className="px-4 py-3 text-[12px]">{o.customer_name}</td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{Array.isArray(o.items) ? o.items.length : 0} item(s)</td>
                  <td className="px-4 py-3 font-cond font-bold text-[13px]">{fmt(o.total)}</td>
                  <td className="px-4 py-3"><span className={`text-[10px] tracking-wider uppercase px-2 py-[2px] ${o.payment_status==='paid'?'bg-green-400/10 text-green-400':'bg-yellow-400/10 text-yellow-400'}`}>{o.payment_status}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] tracking-wider uppercase px-2 py-[2px] ${o.status==='fulfilled'?'bg-green-400/10 text-green-400':o.status==='shipped'?'bg-blue-400/10 text-blue-400':'bg-yellow-400/10 text-yellow-400'}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-[11px] text-white/40">{new Date(o.created_at).toLocaleDateString('en-ZA')}</td>
                  <td className="px-4 py-3"><button className="border border-white/[0.12] text-white/40 hover:border-red hover:text-red text-[11px] px-2 py-1 transition-all">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
