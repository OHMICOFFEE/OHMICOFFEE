import { db } from '@/lib/supabase'
import Topbar from '@/components/Topbar'
import { zar } from '@/lib/types'
export const revalidate = 60

export default async function RepLeaderboard() {
  const client = db()
  const { data: reps } = await client.from('representatives')
    .select('first_name,last_name,current_rank,total_earned,personal_recruits')
    .eq('is_active', true).order('total_earned', { ascending: false }).limit(10)
  const byRecruits = [...(reps||[])].sort((a:any,b:any)=>(b.personal_recruits||0)-(a.personal_recruits||0))

  return (
    <div className="main">
      <Topbar title="Leaderboard" />
      <div className="page">
        <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:13,color:'var(--text4)',marginBottom:20,letterSpacing:'0.04em'}}>
          Top performers across the OHMI network this month
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <div className="table-wrap">
            <div className="card-header">Top Earners</div>
            <table>
              <thead><tr>{['#','Name','Rank','Earned'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {(reps||[]).map((r:any,i:number) => (
                  <tr key={i}>
                    <td style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:i===0?'var(--red)':'var(--text4)',fontWeight:600}}>{i+1}</td>
                    <td className="td-name">{r.first_name} {r.last_name}</td>
                    <td><span className="badge badge-gray">{r.current_rank||'—'}</span></td>
                    <td className="td-amount">{zar(r.total_earned||0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-wrap">
            <div className="card-header">Top Recruiters</div>
            <table>
              <thead><tr>{['#','Name','Rank','Recruits'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {byRecruits.map((r:any,i:number) => (
                  <tr key={i}>
                    <td style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:i===0?'var(--red)':'var(--text4)',fontWeight:600}}>{i+1}</td>
                    <td className="td-name">{r.first_name} {r.last_name}</td>
                    <td><span className="badge badge-gray">{r.current_rank||'—'}</span></td>
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
