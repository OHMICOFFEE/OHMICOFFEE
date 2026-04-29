'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'
import { zar, RANKS, DIRECT_COMMISSION, MONTHLY, nextFriday, residualPayoutDate, calcDirectCommission } from '@/lib/types'

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [activeReps, setActiveReps] = useState(0)
  const [weeklySignups, setWeeklySignups] = useState(1)
  const [monthlySignups, setMonthlySignups] = useState(1)
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<string|null>(null)

  useEffect(() => {
    supabase.from('commissions').select('*').order('created_at',{ascending:false}).then(({data})=>setCommissions(data||[]))
    supabase.from('representatives').select('id').eq('is_active',true).then(({data})=>setActiveReps(data?.length||0))
  }, [])

  const pool = activeReps * MONTHLY.pool
  const directDue = calcDirectCommission(weeklySignups, monthlySignups)
  const friday = nextFriday()
  const now = new Date()
  const residualDate = residualPayoutDate(now.getFullYear(), now.getMonth()+1)

  async function runDirects() {
    setRunning(true); setRunResult(null)
    const res = await fetch('/api/admin/run-commissions', { method: 'POST' })
    const data = await res.json()
    setRunResult(data.ok ? `✓ Processed ${data.processed} reps — payout date: ${data.friday}` : `Error: ${data.error}`)
    setRunning(false)
    supabase.from('commissions').select('*').order('created_at',{ascending:false}).then(({data})=>setCommissions(data||[]))
  }

  async function runResiduals() {
    setRunning(true); setRunResult(null)
    const res = await fetch('/api/admin/run-residuals', { method: 'POST' })
    const data = await res.json()
    setRunResult(data.ok ? `✓ Processed ${data.processed} reps — payout date: ${data.payoutDate}` : `Error: ${data.error}`)
    setRunning(false)
    supabase.from('commissions').select('*').order('created_at',{ascending:false}).then(({data})=>setCommissions(data||[]))
  }

  return (
    <div className="main">
      <Topbar title="Commissions" action={
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-outline" onClick={runResiduals} disabled={running}>Run Monthly Residuals</button>
          <button className="btn btn-red" onClick={runDirects} disabled={running}>{running?'Running…':'Run Weekly Directs'}</button>
        </div>
      } />
      <div className="page">
        {runResult && (
          <div style={{background:runResult.startsWith('✓')?'rgba(26,102,64,0.1)':'rgba(196,30,74,0.1)',border:`1px solid ${runResult.startsWith('✓')?'rgba(26,102,64,0.25)':'rgba(196,30,74,0.25)'}`,borderRadius:3,padding:'10px 16px',marginBottom:20,fontSize:12,color:runResult.startsWith('✓')?'var(--green)':'var(--red)'}}>
            {runResult}
          </div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div className="pool-meter">
            <div className="pool-meter-title">Direct Commission Calculator</div>
            <div className="field"><label>Signups This Week</label>
              <input type="number" value={weeklySignups} onChange={e=>setWeeklySignups(parseInt(e.target.value)||0)} min={0} />
            </div>
            <div className="field" style={{marginBottom:12}}><label>Total Signups This Month</label>
              <input type="number" value={monthlySignups} onChange={e=>setMonthlySignups(parseInt(e.target.value)||0)} min={0} />
            </div>
            <div className="pool-row">
              <span className="pool-key">Commission Due</span>
              <span className="pool-val-red" style={{fontSize:20}}>R {directDue.toLocaleString('en-ZA')}</span>
            </div>
            <div className="pool-row">
              <span className="pool-key">Paid On</span>
              <span className="pool-val">{friday.toLocaleDateString('en-ZA')} (Following Friday)</span>
            </div>
          </div>
          <div className="pool-meter">
            <div className="pool-meter-title">Monthly Pool Health</div>
            <div className="pool-row"><span className="pool-key">Active Reps</span><span className="pool-val">{activeReps}</span></div>
            <div className="pool-row"><span className="pool-key">Total Pool</span><span className="pool-val-green">R {pool.toLocaleString('en-ZA')}</span></div>
            <div className="pool-row"><span className="pool-key">Residual Payout By</span><span className="pool-val">{residualDate.toLocaleDateString('en-ZA')}</span></div>
          </div>
        </div>
        <div className="table-wrap" style={{marginBottom:20}}>
          <div className="card-header">Rank Payout Structure</div>
          <table>
            <thead><tr>{['Rank','Left','Right','Monthly Payout','Min Personal Actives','Type'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {RANKS.map(r=>(
                <tr key={r.id}>
                  <td className="td-name">{r.id}</td>
                  <td>{r.left}</td><td>{r.right}</td>
                  <td className="td-amount">{r.type==='fixed'?`R ${(r.monthly||0).toLocaleString('en-ZA')}`:`${(r as any).pct}% net profit`}</td>
                  <td style={{textAlign:'center'}}>{'min_personal' in r?(r as any).min_personal:'—'}</td>
                  <td><span className={`badge ${r.type==='fixed'?'badge-cream':'badge-red'}`}>{r.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-wrap">
          <div className="card-header">Commission Log</div>
          <table>
            <thead><tr>{['Rep','Type','Amount','Description','Payout Date','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {commissions.length===0 && <tr className="empty-row"><td colSpan={6}>No commissions yet — run weekly directs above</td></tr>}
              {commissions.map(c=>(
                <tr key={c.id}>
                  <td className="td-name">{c.rep_id?.slice(0,8)}…</td>
                  <td><span className="badge badge-gray">{c.type}</span></td>
                  <td className="td-green">{zar(c.amount)}</td>
                  <td style={{fontSize:11,color:'var(--text3)'}}>{c.description||'—'}</td>
                  <td style={{fontSize:11}}>{c.week_ending||'—'}</td>
                  <td><span className={`badge ${c.status==='paid'?'badge-green':c.status==='approved'?'badge-cream':'badge-yellow'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
