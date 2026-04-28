'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/admin/Topbar'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Stat from '@/components/ui/Stat'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { fmt } from '@/lib/types'

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([])

  async function load() {
    const { data } = await supabase.from('payouts').select('*').order('created_at', { ascending: false })
    setPayouts(data || [])
  }
  useEffect(() => { load() }, [])

  async function markPaid(id: string) {
    await supabase.from('payouts').update({ status: 'paid', processed_at: new Date().toISOString() }).eq('id', id)
    await load()
  }

  const pending = payouts.filter(p => p.status === 'pending')
  const totalDue = pending.reduce((s: number, p: any) => s + (p.amount || 0), 0)
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount || 0), 0)

  // Get next Friday
  const today = new Date()
  const daysUntilFriday = (5 - today.getDay() + 7) % 7 || 7
  const nextFriday = new Date(today)
  nextFriday.setDate(today.getDate() + daysUntilFriday)
  const fridayStr = nextFriday.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Friday Payouts">
        <span className="text-[10px] tracking-wider text-cream-muted/30 uppercase">Next payout: {fridayStr}</span>
      </Topbar>
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        <div className="grid grid-cols-3 gap-px bg-navy-border">
          <Stat label="Due This Friday" value={fmt(totalDue)} sub={`${pending.length} reps`} accent />
          <Stat label="Total Paid All Time" value={fmt(totalPaid)} sub="completed payouts" />
          <Stat label="Payout Records" value={payouts.length.toString()} sub="total" />
        </div>

        {pending.length > 0 && (
          <div className="border border-crimson/30 bg-crimson/5 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-[0.3em] uppercase text-crimson mb-1">Action Required</div>
              <div className="text-cream font-medium">{pending.length} pending payouts totalling {fmt(totalDue)}</div>
            </div>
            <button
              onClick={async () => {
                for (const p of pending) {
                  await supabase.from('payouts').update({ status: 'processing' }).eq('id', p.id)
                }
                await load()
              }}
              className="bg-crimson hover:bg-crimson-dark text-cream text-[10px] tracking-[0.2em] uppercase px-5 py-2 transition-colors">
              Process All Pending
            </button>
          </div>
        )}

        <Table>
          <thead><tr>
            <Th>Representative</Th><Th>Amount</Th><Th>Method</Th><Th>Bank / Wallet</Th><Th>Week Ending</Th><Th>Status</Th><Th>Action</Th>
          </tr></thead>
          <tbody>
            {payouts.map((p: any) => (
              <Tr key={p.id}>
                <Td><span className="text-cream font-medium">{p.rep_name || '—'}</span></Td>
                <Td className="font-mono text-emerald-400">{fmt(p.amount)}</Td>
                <Td><Badge status={p.method || 'bank'} /></Td>
                <Td className="font-mono text-[11px] text-cream-muted/40">{p.bank_account || p.crypto_wallet || '—'}</Td>
                <Td className="font-mono text-[11px] text-cream-muted/40">{p.week_ending || '—'}</Td>
                <Td><Badge status={p.status} /></Td>
                <Td>
                  {p.status !== 'paid' && (
                    <button onClick={() => markPaid(p.id)}
                      className="text-[9px] tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 transition-colors">
                      Mark Paid
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
            {payouts.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No payouts yet</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  )
}
