import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { zar, nextFriday, residualPayoutDate, DIRECT_COMMISSION } from '@/lib/types'
export const revalidate = 30

export default async function RepEarnings({ params }: { params: { repId: string } }) {
  const client = db()
  const [{ data: rep }, { data: comms }, { data: payouts }] = await Promise.all([
    client.from('representatives').select('total_earned,total_paid_out,pending_payout').eq('id',params.repId).single(),
    client.from('commissions').select('*').eq('rep_id',params.repId).order('created_at',{ascending:false}).limit(20),
    client.from('payouts').select('*').eq('rep_id',params.repId).order('created_at',{ascending:false}).limit(10),
  ])

  const friday = nextFriday()
  const now = new Date()
  const residualDate = residualPayoutDate(now.getFullYear(), now.getMonth()+1)

  return (
    <div className="main">
      <Topbar title="My Earnings" />
      <div className="page">
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          {[
            {label:'Total Earned', val:zar(rep?.total_earned||0)},
            {label:'Pending Payout', val:zar(rep?.pending_payout||0)},
            {label:'Total Paid Out', val:zar(rep?.total_paid_out||0)},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val">{s.val}</div>
            </div>
          ))}
        </div>

        {/* Payout schedule info */}
        <div className="pool-meter" style={{marginBottom:20}}>
          <div className="pool-meter-title">Payout Schedule</div>
          <div className="pool-row">
            <span className="pool-key">Direct Commissions</span>
            <span className="pool-val">Following Friday — {friday.toLocaleDateString('en-ZA')}</span>
          </div>
          <div className="pool-row">
            <span className="pool-key">Residual Income</span>
            <span className="pool-val">Within 7 days of month end — {residualDate.toLocaleDateString('en-ZA')}</span>
          </div>
          <div className="pool-row">
            <span className="pool-key">Payment Method</span>
            <span className="pool-val">Bank EFT</span>
          </div>
        </div>

        {/* Direct commission guide */}
        <div className="table-wrap" style={{marginBottom:20}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>Direct Commission Structure</span>
          </div>
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
                <tr key={s as string}>
                  <td>{s as string}</td>
                  <td className="td-amount">{v as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
          <div className="table-wrap">
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>Commission History</span>
            </div>
            <table>
              <thead><tr>{['Type','Amount','Description','Payout Date','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(comms||[]).length===0 && <tr className="empty-row"><td colSpan={5}>No commissions yet</td></tr>}
                {(comms||[]).map((c:any)=>(
                  <tr key={c.id}>
                    <td><span className="badge badge-gray">{c.type}</span></td>
                    <td className="td-green">R {(c.amount/100).toLocaleString('en-ZA')}</td>
                    <td style={{fontSize:11,color:'var(--text3)'}}>{c.description||'—'}</td>
                    <td style={{fontSize:11}}>{c.week_ending||'—'}</td>
                    <td><span className={`badge ${c.status==='paid'?'badge-green':c.status==='approved'?'badge-cream':'badge-yellow'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>Payout History</span>
            </div>
            <table>
              <thead><tr>{['Amount','Date','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(payouts||[]).length===0 && <tr className="empty-row"><td colSpan={3}>No payouts yet</td></tr>}
                {(payouts||[]).map((p:any)=>(
                  <tr key={p.id}>
                    <td className="td-amount">R {(p.amount/100).toLocaleString('en-ZA')}</td>
                    <td style={{fontSize:11}}>{p.week_ending||'—'}</td>
                    <td><span className={`badge ${p.status==='paid'?'badge-green':'badge-yellow'}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
