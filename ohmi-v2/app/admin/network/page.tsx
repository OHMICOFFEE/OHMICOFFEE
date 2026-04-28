'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/admin/Topbar'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Stat from '@/components/ui/Stat'
import { Table, Th, Td, Tr } from '@/components/ui/Table'
import { calcRank, RANKS, fmt } from '@/lib/types'

export default function AdminNetwork() {
  const [reps, setReps] = useState<any[]>([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  async function load() {
    const { data } = await supabase.from('representatives').select('*').order('created_at', { ascending: false })
    setReps(data || [])
  }
  useEffect(() => { load() }, [])

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })) }

  async function save() {
    setSaving(true)
    const repCode = `OHMI-${Math.random().toString(36).substr(2,6).toUpperCase()}`
    await supabase.from('representatives').insert({
      ...form, rep_code: repCode, status: 'pending', is_active: false,
      kyc_status: 'pending', left_team_count: 0, right_team_count: 0,
      personal_recruits: 0, total_earned: 0, total_paid_out: 0, pending_payout: 0,
      current_rank: 'Unranked', agreement_signed: false,
    })
    await load()
    setModal(false)
    setForm({})
    setSaving(false)
  }

  async function toggle(id: string, current: boolean) {
    await supabase.from('representatives').update({ is_active: !current, status: !current ? 'active' : 'suspended' }).eq('id', id)
    await load()
  }

  async function verifyKYC(id: string) {
    await supabase.from('representatives').update({ kyc_status: 'verified', is_active: true, status: 'active', kyc_verified_at: new Date().toISOString() }).eq('id', id)
    await load()
  }

  const leftCount = reps.filter(r => r.leg === 'left' && r.is_active).length
  const rightCount = reps.filter(r => r.leg === 'right' && r.is_active).length
  const rank = calcRank(leftCount, rightCount)
  const filtered = filter === 'all' ? reps : reps.filter(r => r.leg === filter || r.status === filter || r.kyc_status === filter)

  const F = ({ label, k }: { label: string; k: string }) => (
    <div>
      <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">{label}</label>
      <input type="text" value={form[k] || ''} onChange={e => set(k, e.target.value)} className="w-full px-3 py-2 text-[12px]" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Binary Network">
        <button onClick={() => { setForm({ leg: 'left', package_name: 'Builder', payout_method: 'bank' }); setModal(true) }}
          className="bg-crimson hover:bg-crimson-dark text-cream text-[10px] tracking-[0.2em] uppercase px-4 py-2 transition-colors">
          + Add Rep
        </button>
      </Topbar>
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        <div className="grid grid-cols-4 gap-px bg-navy-border">
          <Stat label="Total Reps" value={reps.length.toString()} sub={`${reps.filter(r=>r.is_active).length} active`} />
          <Stat label="Left Leg" value={leftCount.toString()} sub="active" />
          <Stat label="Right Leg" value={rightCount.toString()} sub="active" />
          <Stat label="Network Rank" value={rank?.name || 'Unranked'} sub={rank ? `R${rank.monthly.toLocaleString()}/mo` : '—'} accent />
        </div>

        {/* Rank progress */}
        <div className="bg-navy-light border border-navy-border p-5">
          <div className="text-[9px] tracking-[0.3em] uppercase text-cream-muted/25 mb-3">Rank Progression</div>
          <div className="grid grid-cols-7 gap-2">
            {RANKS.slice(0,7).map(r => {
              const achieved = leftCount >= r.left && rightCount >= r.right
              return (
                <div key={r.name} className={`p-3 border text-center ${achieved ? 'border-crimson bg-crimson/5' : 'border-navy-border'}`}>
                  <div className={`text-[9px] tracking-wider uppercase leading-tight mb-1 ${achieved ? 'text-crimson' : 'text-cream-muted/25'}`}>{r.name}</div>
                  <div className={`font-mono text-[10px] ${achieved ? 'text-cream' : 'text-cream-muted/20'}`}>R{r.monthly.toLocaleString()}</div>
                  <div className="text-[9px] text-cream-muted/20 mt-1">{r.left}+{r.right}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all','left','right','pending','active','submitted'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-[10px] tracking-wider uppercase px-3 py-1 border transition-colors ${filter===f ? 'border-crimson text-crimson' : 'border-navy-border text-cream-muted/30 hover:border-cream-muted/30'}`}>
              {f}
            </button>
          ))}
        </div>

        <Table>
          <thead><tr>
            <Th>Name</Th><Th>Email</Th><Th>Package</Th><Th>Leg</Th>
            <Th>Sponsor</Th><Th>Rep Code</Th><Th>KYC</Th><Th>Status</Th><Th>Actions</Th>
          </tr></thead>
          <tbody>
            {filtered.map((r: any) => (
              <Tr key={r.id}>
                <Td><span className="text-cream font-medium">{r.first_name} {r.last_name}</span></Td>
                <Td className="text-cream-muted/40 text-[11px]">{r.email}</Td>
                <Td className="text-cream-muted/50 text-[11px]">{r.package_name || '—'}</Td>
                <Td><Badge status={r.leg || 'left'} /></Td>
                <Td className="text-cream-muted/40 text-[11px]">{r.sponsor_name || '—'}</Td>
                <Td className="font-mono text-[10px] text-cream-muted/40">{r.rep_code || '—'}</Td>
                <Td><Badge status={r.kyc_status || 'pending'} /></Td>
                <Td><Badge status={r.is_active ? 'active' : 'pending'} /></Td>
                <Td>
                  <div className="flex gap-1">
                    {r.kyc_status === 'submitted' && (
                      <button onClick={() => verifyKYC(r.id)} className="text-[9px] tracking-wider uppercase border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 transition-colors">
                        Verify KYC
                      </button>
                    )}
                    <button onClick={() => toggle(r.id, r.is_active)}
                      className="text-[9px] tracking-wider uppercase border border-navy-border text-cream-muted/30 hover:border-crimson hover:text-crimson px-2 py-1 transition-colors">
                      {r.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-cream-muted/20 text-[11px] tracking-widest uppercase">No representatives</td></tr>
            )}
          </tbody>
        </Table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-6" onClick={() => setModal(false)}>
          <div className="bg-navy border border-navy-border w-full max-w-[560px] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-navy-border">
              <h2 className="font-display text-xl text-cream font-light">Add Representative</h2>
              <button onClick={() => setModal(false)} className="text-cream-muted/30 hover:text-cream text-xl leading-none">×</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <F label="First Name" k="first_name" />
              <F label="Last Name" k="last_name" />
              <F label="Email" k="email" />
              <F label="Phone" k="phone" />
              <F label="SA ID Number" k="id_number" />
              <F label="Sponsor Name" k="sponsor_name" />
              <div>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Leg Placement</label>
                <select value={form.leg || 'left'} onChange={e => set('leg', e.target.value)} className="w-full px-3 py-2 text-[12px]">
                  <option value="left">Left Leg</option>
                  <option value="right">Right Leg</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Package</label>
                <select value={form.package_name || 'Builder'} onChange={e => set('package_name', e.target.value)} className="w-full px-3 py-2 text-[12px]">
                  <option value="Starter">Starter — R1,000</option>
                  <option value="Builder">Builder — R2,000</option>
                  <option value="Elite">Elite — R5,000</option>
                </select>
              </div>
              <F label="Bank Name" k="bank_name" />
              <F label="Account Number" k="bank_account_number" />
              <F label="Branch Code" k="bank_branch_code" />
              <F label="USDT Wallet (optional)" k="crypto_wallet" />
              <div>
                <label className="block text-[9px] tracking-[0.25em] uppercase text-cream-muted/30 mb-1">Payout Method</label>
                <select value={form.payout_method || 'bank'} onChange={e => set('payout_method', e.target.value)} className="w-full px-3 py-2 text-[12px]">
                  <option value="bank">Bank EFT</option>
                  <option value="crypto">USDT Crypto</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-navy-border flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="text-[11px] tracking-wider uppercase text-cream-muted/30 hover:text-cream px-4 py-2 border border-navy-border">Cancel</button>
              <button onClick={save} disabled={saving} className="bg-crimson hover:bg-crimson-dark disabled:opacity-40 text-cream text-[11px] tracking-wider uppercase px-6 py-2 transition-colors">
                {saving ? 'Saving...' : 'Add Representative'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
