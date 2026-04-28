'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string,string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('*').then(({ data }) => {
      const s: Record<string,string> = {}
      data?.forEach((x: any) => { s[x.key] = x.value })
      setSettings(s)
    })
  }, [])

  async function save() {
    setSaving(true)
    await Promise.all(Object.entries(settings).map(([key, value]) =>
      supabase.from('site_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key)
    ))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'meals_served', label: 'Meals Served Counter' },
    { key: 'marquee_text', label: 'Marquee Ticker Text' },
    { key: 'foundation_story', label: 'Foundation Story', multiline: true },
    { key: 'commission_matching_rate', label: 'Matching Bonus Rate (%)' },
    { key: 'payout_minimum', label: 'Minimum Payout (cents)' },
    { key: 'buyback_days', label: 'Buyback Guarantee Days' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Site Settings" action={{ label: saving ? 'Saving...' : saved ? '✓ Saved' : 'Save All', onClick: save }} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[700px] space-y-5">
          {fields.map(f => (
            <div key={f.key} className="bg-[#0c0c0c] border border-white/[0.07] p-5">
              <label className="block text-[10px] tracking-[0.25em] uppercase text-white/30 mb-2 font-medium">{f.label}</label>
              {f.multiline ? (
                <textarea value={settings[f.key] || ''} onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                  rows={4} className="w-full bg-[#141414] border border-white/[0.1] text-white text-[12px] px-3 py-2 resize-y" />
              ) : (
                <input type="text" value={settings[f.key] || ''} onChange={e => setSettings(s => ({...s, [f.key]: e.target.value}))}
                  className="w-full bg-[#141414] border border-white/[0.1] text-white text-[12px] px-3 py-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
