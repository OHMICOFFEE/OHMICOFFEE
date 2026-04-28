import { serviceClient } from '@/lib/supabase'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { fmt } from '@/lib/types'

async function getStats() {
  const db = serviceClient()
  const [orders, reps, settings] = await Promise.all([
    db.from('orders').select('total, status').limit(100),
    db.from('representatives').select('status, is_active, total_earned'),
    db.from('site_settings').select('key, value'),
  ])
  const totalRev = (orders.data || []).reduce((s: number, o: {total:number}) => s + o.total, 0)
  const activeReps = (reps.data || []).filter((r: {is_active:boolean}) => r.is_active).length
  const meals = (settings.data || []).find((s: {key:string}) => s.key === 'meals_served')?.value || '255'
  return { totalRev, activeReps, meals: parseInt(meals), totalOrders: orders.data?.length || 0 }
}
export default async function Dashboard() {
  const stats = await getStats()
  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Dashboard" />
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-px bg-white/[0.06] mb-6">
          {[
            { label: 'Revenue (MTD)', value: fmt(stats.totalRev), delta: '↑ 18.4%' },
            { label: 'Total Orders', value: stats.totalOrders.toString(), delta: '↑ 12 today' },
            { label: 'Active Reps', value: stats.activeReps.toString(), delta: '↑ 3 this week' },
            { label: 'Meals Served', value: stats.meals.toString(), delta: '↑ 50 this month' },
          ].map(s => (
            <div key={s.label} className="bg-[#0c0c0c] p-5">
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-2">{s.label}</div>
              <div className="font-cond font-black text-[1.9rem] leading-none text-white">{s.value}</div>
              <div className="text-[11px] text-green-400 mt-1">{s.delta}</div>
            </div>
          ))}
        </div>
        {/* Two column */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Recent Orders</h3>
            {['Heartfelt Honduras 500g · R380','Elegant Ethiopia 250g · R230','Golden Toffee 1kg · R580','Crown of Colombia 500g · R360'].map(o => (
              <div key={o} className="flex justify-between py-2 border-b border-white/[0.05] text-[12px] last:border-b-0">
                <span className="text-white/60">{o.split(' · ')[0]}</span>
                <span className="text-red font-cond font-bold">{o.split(' · ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">Foundation Impact</h3>
            <div className="font-cond font-black text-[3rem] text-red leading-none mb-1">{stats.meals}</div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-white/25 mb-4">Meals Served</div>
            <div className="bg-[#141414] h-1 mb-1"><div className="bg-red h-full" style={{width: `${(stats.meals/1000)*100}%`}} /></div>
            <div className="text-[11px] text-white/20">{((stats.meals/1000)*100).toFixed(1)}% to 1,000 meal goal</div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[['6','Partner Kitchens'],['20%','Profit Donated']].map(([n,l]) => (
                <div key={l} className="bg-[#141414] p-3 text-center">
                  <div className="font-cond font-black text-red text-[1.3rem]">{n}</div>
                  <div className="text-[9px] uppercase tracking-wider text-white/25">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Top Products</h3>
            {[['01','Heartfelt Honduras','34 units'],['02','Elegant Ethiopia','28 units'],['03','Golden Toffee','21 units'],['04','Crown of Colombia','19 units']].map(([n,p,u]) => (
              <div key={p} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-b-0">
                <span className="text-red font-cond font-black text-[12px] w-6">{n}</span>
                <span className="text-white/70 text-[12px] flex-1">{p}</span>
                <span className="text-white/30 text-[11px]">{u}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Network Summary</h3>
            {[['Starter Reps','18'],['Builder Reps','12'],['Elite Reps','4'],['Commission Paid','R3,240'],['Active Both Legs','Yes ✓']].map(([l,v]) => (
              <div key={l} className="flex justify-between py-2 border-b border-white/[0.05] text-[12px] last:border-b-0">
                <span className="text-white/50">{l}</span>
                <span className="font-cond font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
