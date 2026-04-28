'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/admin/Topbar'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Stat from '@/components/ui/Stat'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { fmt } from '@/lib/types'

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [rate, setRate] = useState(10)

  async function load() {
    const { data } = await supabase.from('commissions').select('*').order('created_at', { ascending: false })
    setCommissions(data || [])
    // get live counts
    const { data: reps } = await supabase.from('representatives').select('leg, is_active')
    if (reps) {
      setLeft(reps.filter((r: any) => r.leg === 'left' && r.is_active).length)
      setRight(reps.filter((r: any) => r.leg === 'right' && r.is_active).length)
    }
  }
  useEffect(() => { load() }, [])

  async function approve(id: string) {
    await supabase.from('commissions').update({ status: 'approved' }).eq('id', id)
    await load()
  }

  const pending = commissions.filter(c => c.status === 'pending').reduce((s: number, c: any) => s + (c.amount || 0), 0)
  const paid = commissions.filter(c => c.status === 'paid').reduce((s: number, c: any) => s + (c.amount || 0), 0)
  const weaker = Math.min(left, right)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Commissions" />
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        <div className="grid grid-cols-3 gap-px bg-navy-border">
          <Stat label="Pending Commissions" value={fmt(pending)} sub="awaiting approval" accent />
          <Stat label="Total Paid Out" value={fmt(paid)} sub="all time" />
          <Stat label="Commission Records" value={commissions.length.toString()} sub="total entries" />
        </div>

        {/* Binary Calculator */}
        <div className="bg-navy-light border border-navy-border p-6">
          <div className="text-[9px] tracking-[0.35em] uppercase text-cream-muted/30 mb-4">Binary Commission Calculator</div>
          <div className="grid grid-cols-4 gap-4 items-end">
            {[
              ['Left Leg (active reps)', left, setLeft],
              ['Right Leg (active reps)', right, setRight],
              ['Commission Rate (%)', rate, setRate],
            ].map(([label, value, setter]: any) => (
              <div key={label}>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">{label}</label>
                <input type="number" value={value} onChange={e => setter(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-[13px]" />
              </div>
            ))}
            <div className="border border-crimson p-4">
              <div className="text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Commission Due</div>
              <div className="font-display text-2xl text-crimson font-light">
                R {Math.round(weaker * rate / 100).toLocaleString('en-ZA')}
              </div>
              <div className="text-[10px] text-cream-muted/30 mt-1">Based on weaker leg × {rate}%</div>
            </div>
          </div>
        </div>

        <Table>
          <thead><tr>
            <Th>Representative</Th><Th>Type</Th><Th>Amount</Th><Th>Description</Th><Th>Week Ending</Th><Th>Status</Th><Th>Action</Th>
          </tr></thead>
          <tbody>
            {commissions.map((c: any) => (
              <Tr key={c.id}>
                <Td><span className="text-cream">{c.rep_name || c.rep_id?.slice(0,8)}</span></Td>
                <Td><Badge status={c.type} /></Td>
                <Td className="font-mono text-emerald-400">{fmt(c.amount)}</Td>
                <Td className="text-cream-muted/50 text-[11px]">{c.description || '—'}</Td>
                <Td className="font-mono text-[11px] text-cream-muted/40">{c.week_ending || '—'}</Td>
                <Td><Badge status={c.status} /></Td>
                <Td>
                  {c.status === 'pending' && (
                    <button onClick={() => approve(c.id)}
                      className="text-[9px] tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 transition-colors">
                      Approve
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
            {commissions.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No commission records yet</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
