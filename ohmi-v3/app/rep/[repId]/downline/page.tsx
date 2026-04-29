import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
export const revalidate = 30

export default async function RepDownline({ params }: { params: { repId: string } }) {
  const { data: downline } = await db().from('representatives').select('*').eq('sponsor_id', params.repId).order('created_at',{ascending:false})
  const all = downline || []
  const left = all.filter((r:any)=>r.leg==='left')
  const right = all.filter((r:any)=>r.leg==='right')

  return (
    <div className="main">
      <Topbar title="My Downline" />
      <div className="page">
        <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          {[
            {label:'Total Direct Recruits', val:all.length},
            {label:'Left Leg', val:left.length},
            {label:'Right Leg', val:right.length},
          ].map(s=>(
            <div key={s.label} className="stat">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val">{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          {[['Left Leg',left],['Right Leg',right]].map(([side,list])=>(
            <div key={side as string} className="table-wrap">
              <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--text3)'}}>{side as string}</span>
                <span style={{fontSize:11,color:'var(--text4)'}}>{(list as any[]).length} members</span>
              </div>
              <table>
                <thead><tr>{['Name','Status','Rank'].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {(list as any[]).length===0 && <tr className="empty-row"><td colSpan={3}>No members yet</td></tr>}
                  {(list as any[]).map((r:any)=>(
                    <tr key={r.id}>
                      <td className="td-name">{r.first_name} {r.last_name}</td>
                      <td><span className={`badge ${r.is_active?'badge-green':'badge-yellow'}`}>{r.is_active?'Active':'Pending'}</span></td>
                      <td><span className="badge badge-gray">{r.current_rank||'Unranked'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
