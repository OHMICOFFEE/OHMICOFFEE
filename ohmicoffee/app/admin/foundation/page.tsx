'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'

export default function AdminFoundation() {
  const [meals, setMeals] = useState(255)
  const [addMeals, setAddMeals] = useState('')
  const [kitchen, setKitchen] = useState('')
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key','meals_served').single().then(({ data }) => { if (data) setMeals(parseInt(data.value)) })
    supabase.from('foundation_entries').select('*').order('created_at', { ascending: false }).then(({ data }) => setEntries(data || []))
  }, [])

  async function update() {
    const n = parseInt(addMeals)
    if (!n) return
    const newTotal = meals + n
    await supabase.from('site_settings').update({ value: newTotal.toString(), updated_at: new Date().toISOString() }).eq('key', 'meals_served')
    await supabase.from('foundation_entries').insert({ meals_count: n, kitchen_name: kitchen, recorded_by: 'admin' })
    setMeals(newTotal)
    setAddMeals('')
    setKitchen('')
    const { data } = await supabase.from('foundation_entries').select('*').order('created_at', { ascending: false })
    setEntries(data || [])
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Foundation" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-4 gap-px bg-white/[0.06] mb-6">
          {[['Meals Served Total',meals.toString()],['Monthly Contribution','R4,836'],['Partner Kitchens','6'],['Children Impacted',meals.toString()]].map(([l,v]) => (
            <div key={l} className="bg-[#0c0c0c] p-5">
              <div className="text-[10px] tracking-[0.25em] uppercase text-white/25 mb-2">{l}</div>
              <div className="font-cond font-black text-[1.9rem] text-red">{v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Update Meal Counter</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Meals Added This Entry</label>
                <input type="number" value={addMeals} onChange={e=>setAddMeals(e.target.value)} placeholder="e.g. 50"
                  className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">Partner Kitchen</label>
                <input type="text" value={kitchen} onChange={e=>setKitchen(e.target.value)} placeholder="Kitchen name"
                  className="w-full bg-[#1c1c1c] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
              </div>
              <button onClick={update} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[11px] tracking-wider uppercase px-6 py-2 transition-colors">
                Update & Publish to Site
              </button>
            </div>
          </div>
          <div className="bg-[#0c0c0c] border border-white/[0.07] p-5">
            <h3 className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-4">Progress to Goal</h3>
            <div className="font-cond font-black text-[3rem] text-red mb-2">{meals}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/25 mb-4">Total Meals Served</div>
            <div className="bg-[#141414] h-2 mb-2"><div className="bg-red h-full transition-all" style={{width:`${Math.min((meals/1000)*100,100)}%`}} /></div>
            <div className="text-[11px] text-white/25">{((meals/1000)*100).toFixed(1)}% towards 1,000 meal milestone</div>
          </div>
        </div>
        {/* Entry log */}
        <div className="bg-[#0c0c0c] border border-white/[0.07]">
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.07]">
              {['Meals','Kitchen','Recorded By','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-white/25">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {entries.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-white/20 text-[11px] tracking-widest uppercase">No entries yet</td></tr>}
              {entries.map(e => (
                <tr key={e.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 font-cond font-bold text-red text-[14px]">+{e.meals_count}</td>
                  <td className="px-4 py-3 text-[12px] text-white/60">{e.kitchen_name || '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-white/40">{e.recorded_by}</td>
                  <td className="px-4 py-3 text-[11px] text-white/30">{new Date(e.created_at).toLocaleDateString('en-ZA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
