'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/types'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  useEffect(() => {
    supabase.from('customers').select('*').order('created_at', { ascending: false }).then(({ data }) => setCustomers(data || []))
  }, [])
  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Customers" action={{ label: 'Export CSV', onClick: () => alert('Export coming soon') }} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-[#0c0c0c] border border-white/[0.07] overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Name','Email','Phone','Orders','Total Spend','Referred By','Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {customers.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No customers yet</td></tr>}
              {customers.map(c => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[13px]">{c.name}</td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{c.email}</td>
                  <td className="px-4 py-3 text-[12px] text-white/50">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-[12px]">{c.total_orders}</td>
                  <td className="px-4 py-3 font-cond font-bold text-[13px] text-red">{fmt(c.total_spend)}</td>
                  <td className="px-4 py-3 text-[11px] text-white/40">—</td>
                  <td className="px-4 py-3 text-[11px] text-white/30">{new Date(c.created_at).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
