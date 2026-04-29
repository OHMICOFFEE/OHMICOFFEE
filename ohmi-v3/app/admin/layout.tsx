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
    setRunResult(data.ok ? `✓ Processed ${data.processed} reps — payout: ${data.friday}` : `Error: ${data.error}`)
    setRunning(false)
    supabase.from('commissions').select('*').order('created_at',{ascending:false}).then(({data})=>setCommissions(data||[]))
  }

  async function runResiduals() {
    setRunning(true); setRunResult(null)
    const res = await fetch('/api/admin/run-residuals', { method: 'POST' })
    const data = await res.json()
    setRunResult(data.ok ? `✓ Processed ${data.processed} reps — payout: ${data.payoutDate}` : `Error: ${data.error}`)
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
            <div className="pool-meter-title">Monthly Pool</div>
            <div className="pool-row"><span className="pool-key">Active Reps</span><span className="pool-val">{activeReps}</span></div>
            <div className="pool-row"><span className="pool-key">Pool (R750 × reps)</span><span className="pool-val-green">R {pool.toLocaleString('en-ZA')}</span></div>
            <div className="pool-row"><span className="pool-key">Residual Paid By</span><span className="pool-val">{residualDate.toLocaleDateString('en-ZA')}</span></div>
            <div className="pool-row"><span className="pool-key">Monthly Sub</span><span className="pool-val">R {MONTHLY.subscription.toLocaleString('en-ZA')}</span></div>
          </div>
        </div>

        {/* Direct commission structure */}
        <div className="table-wrap" style={{marginBottom:20}}>
          <div className="card-header">Direct Commission Structure — Paid Following Friday</div>
          <table>
            <thead><tr>{['Scenario','Commission'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                ['1 signup this week', `R ${DIRECT_COMMISSION.one_signup.toLocaleString('en-ZA')}`],
                ['2 signups this week', `R ${DIRECT_COMMISSION.two_signups.toLocaleString('en-ZA')}`],
                ['3 signups this month', `R ${DIRECT_COMMISSION.three_plus_monthly.toLocaleString('en-ZA')} each`],
                ['4 signups this month', `R ${DIRECT_COMMISSION.four_monthly.toLocaleString('en-ZA')} each`],
                ['5+ signups this month', `R ${DIRECT_COMMISSION.five_plus.toLocaleString('en-ZA')} each`],
              ].map(([s,v])=>(
                <tr key={s}><td>{s}</td><td className="td-amount">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rank table */}
        <div className="table-wrap" style={{marginBottom:20}}>
          <div className="card-header">Residual Income — R1 to R8 — Paid Within 14 Days of Month End</div>
          <table>
            <thead><tr>{['Rank','Left Team','Right Team','Min Personal Actives','Monthly Payout'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {RANKS.map(r=>(
                <tr key={r.id}>
                  <td className="td-name">{r.id}</td>
                  <td>{r.left}</td>
                  <td>{r.right}</td>
                  <td style={{textAlign:'center'}}>{r.min_personal}</td>
                  <td className="td-amount">R {r.monthly.toLocaleString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Commission log */}
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
