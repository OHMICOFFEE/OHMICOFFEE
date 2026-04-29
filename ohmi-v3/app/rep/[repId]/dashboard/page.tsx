import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { getRank, getNextRank, zar, MONTHLY } from '@/lib/types'
export const revalidate = 30

export default async function RepDashboard({ params }: { params: { repId: string } }) {
  const { data: rep } = await db().from('representatives').select('*').eq('id', params.repId).single()
  if (!rep) return <div style={{padding:40,color:'var(--text3)'}}>Representative not found.</div>

  const left = rep.left_team_count || 0
  const right = rep.right_team_count || 0
  const personal = rep.personal_actives || 0
  const rank = getRank(left, right, personal)
  const next = getNextRank(left, right, personal)

  return (
    <div className="main">
      <Topbar title={`${rep.first_name} ${rep.last_name}`} />
      <div className="page">
        {/* Status bar */}
        <div style={{background:'var(--red3)',border:'1px solid rgba(196,30,74,0.2)',borderRadius:4,padding:'10px 16px',marginBottom:20,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span className="rank-badge">{rank?.id || 'Unranked'}</span>
            <span style={{fontSize:12,color:'var(--text3)'}}>{rank?.name || 'Below R1 threshold'}</span>
          </div>
          <span style={{fontSize:11,color:rep.is_active?'var(--green)':'var(--yellow)'}}>
            {rep.is_active ? '● Active' : '● Pending activation'}
          </span>
        </div>

        {/* KPIs */}
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          {[
            {label:'Total Earned', val:zar(rep.total_earned||0), sub:'All commissions'},
            {label:'Pending Payout', val:zar(rep.pending_payout||0), sub:'Next payout date'},
            {label:'Left Leg', val:left, sub:'Active members'},
            {label:'Right Leg', val:right, sub:'Active members'},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          {/* Rank income */}
          <div className="pool-meter">
            <div className="pool-meter-title">Rank Income</div>
            {rank ? (
              <>
                <div className="pool-row">
                  <span className="pool-key">Current Rank</span>
                  <span className="pool-val">{rank.id} — {rank.name||''}</span>
                </div>
                <div className="pool-row">
                  <span className="pool-key">Monthly Residual</span>
                  <span className="pool-val-red" style={{fontSize:18}}>
                    {rank.type==='fixed'?`R ${(rank.monthly||0).toLocaleString('en-ZA')}/mo`:`${(rank as any).pct}% of net profit`}
                  </span>
                </div>
                <div className="pool-row">
                  <span className="pool-key">Personal Actives</span>
                  <span className="pool-val">{personal} {personal >= 4 ? '✓' : `(need 4 from R4)`}</span>
                </div>
              </>
            ) : (
              <div style={{color:'var(--text3)',fontSize:12,padding:'8px 0'}}>Not yet ranked. Build both legs to 5 active members to reach R1.</div>
            )}
          </div>

          {/* Next rank progress */}
          {next && (
            <div className="card card-pad">
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)',marginBottom:14}}>
                Progress to {next.id}
              </div>
              {(['left','right'] as const).map(side=>{
                const current = side==='left'?left:right
                const required = side==='left'?next.left:next.right
                const pct = Math.min((current/required)*100,100)
                return (
                  <div key={side} className="progress-wrap">
                    <div className="progress-label">
                      <span>{side} leg</span>
                      <span>{current} / {required}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${pct}%`}} />
                    </div>
                  </div>
                )
              })}
              <div style={{marginTop:12,fontSize:12,color:'var(--red)',fontWeight:600}}>
                {next.type==='fixed'?`R ${(next.monthly||0).toLocaleString('en-ZA')}/month at ${next.id}`:`${(next as any).pct}% net profit at ${next.id}`}
              </div>
            </div>
          )}
        </div>

        {/* Qualification checklist */}
        <div className="table-wrap">
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)'}}>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>Qualification Status</span>
          </div>
          <table>
            <thead><tr>{['Requirement','Status','Detail'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                ['Monthly Subscription', rep.is_active, rep.is_active?'Active — R1,500/month':'Inactive'],
                ['KYC Verification', rep.kyc_status==='verified', rep.kyc_status||'Pending'],
                ['Distributor Agreement', rep.agreement_signed, rep.agreement_signed?'Signed':'Not signed'],
                ['Personal Actives (R4+)', personal>=4, `${personal} of 4 required`],
              ].map(([label,ok,detail])=>(
                <tr key={label as string}>
                  <td className="td-name">{label as string}</td>
                  <td><span className={`badge ${ok?'badge-green':'badge-yellow'}`}>{ok?'✓ Met':'Pending'}</span></td>
                  <td style={{color:'var(--text3)'}}>{detail as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
