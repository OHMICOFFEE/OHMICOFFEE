import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { zar } from '@/lib/types'
export const revalidate = 60

export default async function AdminLeaderboard() {
  const client = db()
  const { data: reps } = await client.from('representatives')
    .select('*').eq('is_active', true).order('total_earned', { ascending: false }).limit(20)

  const byRecruits = [...(reps||[])].sort((a,b)=>(b.personal_recruits||0)-(a.personal_recruits||0))

  return (
    <div className="main">
      <Topbar title="Leaderboard" />
      <div className="page">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {/* Top Earners */}
          <div className="table-wrap">
            <div className="card-header">Top Earners</div>
            <table>
              <thead><tr>
                {['#','Name','Rank','Total Earned'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {(reps||[]).length===0 && <tr className="empty-row"><td colSpan={4}>No active reps yet</td></tr>}
                {(reps||[]).map((r,i) => (
                  <tr key={r.id}>
                    <td style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:i===0?'var(--red)':'var(--text4)',fontWeight:600}}>{i+1}</td>
                    <td className="td-name">{r.first_name} {r.last_name}</td>
                    <td><span className="badge badge-gray">{r.current_rank||'Unranked'}</span></td>
                    <td className="td-amount">{zar(r.total_earned||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Top Recruiters */}
          <div className="table-wrap">
            <div className="card-header">Top Recruiters</div>
            <table>
              <thead><tr>
                {['#','Name','Rank','Direct Recruits'].map(h=><th key={h}>{h}</th>)}
              </tr></thead>
              <tbody>
                {byRecruits.length===0 && <tr className="empty-row"><td colSpan={4}>No active reps yet</td></tr>}
                {byRecruits.map((r,i) => (
                  <tr key={r.id}>
                    <td style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:i===0?'var(--red)':'var(--text4)',fontWeight:600}}>{i+1}</td>
                    <td className="td-name">{r.first_name} {r.last_name}</td>
                    <td><span className="badge badge-gray">{r.current_rank||'Unranked'}</span></td>
                    <td style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:20,color:'var(--text)'}}>{r.personal_recruits||0}</td>
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
