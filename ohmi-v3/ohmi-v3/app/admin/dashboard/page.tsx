import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { zar, MONTHLY, ONCOFF } from '@/lib/types'
export const revalidate = 30

async function getStats() {
  const client = db()
  const [{ data: reps }, { data: orders }, { data: comms }, { data: payouts }] = await Promise.all([
    client.from('representatives').select('id,is_active,total_earned,left_team_count,right_team_count,current_rank'),
    client.from('orders').select('total,status,created_at').order('created_at',{ascending:false}).limit(6),
    client.from('commissions').select('amount,type,status').eq('status','pending'),
    client.from('payouts').select('amount,status').eq('status','pending'),
  ])
  const totalReps = reps?.length || 0
  const activeReps = reps?.filter((r:any) => r.is_active).length || 0
  const monthlyPool = activeReps * MONTHLY.pool
  const pendingComms = comms?.reduce((s:number,c:any)=>s+c.amount,0) || 0
  const pendingPayouts = payouts?.reduce((s:number,p:any)=>s+p.amount,0) || 0
  return { totalReps, activeReps, monthlyPool, pendingComms, pendingPayouts, recentOrders: orders || [] }
}

export default async function AdminDashboard() {
  const s = await getStats()
  return (
    <div className="main">
      <Topbar title="Dashboard" />
      <div className="page">
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          {[
            { label: 'Total Reps', val: s.totalReps, sub: `${s.activeReps} active` },
            { label: 'Monthly Pool', val: zar(s.monthlyPool * 100), sub: `${s.activeReps} × R750` },
            { label: 'Pending Commissions', val: zar(s.pendingComms), sub: 'Awaiting payout' },
            { label: 'Pending Payouts', val: zar(s.pendingPayouts), sub: 'Next Friday' },
          ].map(stat => (
            <div key={stat.label} className="stat">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-val">{stat.val}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Pool breakdown */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div className="pool-meter">
            <div className="pool-meter-title">Monthly Revenue Breakdown (per rep)</div>
            {[
              ['Monthly Subscription', `R${MONTHLY.subscription.toLocaleString('en-ZA')}`,''],
              ['Coffee Product', `R${MONTHLY.coffee_cost.toLocaleString('en-ZA')}`,'var(--text3)'],
              ['Commission Pool', `R${MONTHLY.pool.toLocaleString('en-ZA')}`,'var(--red)'],
            ].map(([k,v,c]) => (
              <div key={k as string} className="pool-row">
                <span className="pool-key">{k as string}</span>
                <span style={{fontWeight:600,color:(c as string)||'var(--cream)'}}>{v as string}</span>
              </div>
            ))}
          </div>
          <div className="pool-meter">
            <div className="pool-meter-title">Once-Off Join Fee Breakdown</div>
            {[
              ['Total Join Fee', `R${ONCOFF.total.toLocaleString('en-ZA')}`,''],
              ['Distributor License', `R${ONCOFF.license.toLocaleString('en-ZA')}`,'var(--text3)'],
              ['Coffee Product', `R${ONCOFF.coffee.toLocaleString('en-ZA')}`,'var(--text3)'],
              ['Direct Commission', `R${ONCOFF.commission.toLocaleString('en-ZA')}`,'var(--red)'],
              ['Your Profit', `R${ONCOFF.profit.toLocaleString('en-ZA')}`,'var(--green)'],
            ].map(([k,v,c]) => (
              <div key={k as string} className="pool-row">
                <span className="pool-key">{k as string}</span>
                <span style={{fontWeight:600,color:(c as string)||'var(--cream)'}}>{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="table-wrap">
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>Recent Orders</span>
          </div>
          <table>
            <thead><tr>
              {['Order','Total','Status','Date'].map(h=><th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {s.recentOrders.length === 0
                ? <tr className="empty-row"><td colSpan={4}>No orders yet</td></tr>
                : s.recentOrders.map((o:any,i:number)=>(
                  <tr key={i}>
                    <td className="td-name">#{String(i+1).padStart(4,'0')}</td>
                    <td className="td-amount">{zar(o.total)}</td>
                    <td><span className={`badge ${o.status==='fulfilled'?'badge-green':o.status==='pending'?'badge-yellow':'badge-gray'}`}>{o.status}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-ZA')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
