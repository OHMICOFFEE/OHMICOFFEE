'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'

export default function AdminMedia() {
  const [media, setMedia] = useState<any[]>([])
  useEffect(() => {
    supabase.from('media').select('*').order('created_at', { ascending: false }).then(({ data }) => setMedia(data || []))
  }, [])

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const path = `${Date.now()}_${file.name}`
    const { data } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (data) {
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
      await supabase.from('media').insert({ name: file.name, url: urlData.publicUrl, size_bytes: file.size, mime_type: file.type })
      const { data: m } = await supabase.from('media').select('*').order('created_at', { ascending: false })
      setMedia(m || [])
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="Media Library" />
      <div className="flex-1 p-6 overflow-y-auto">
        <label className="block bg-[#0c0c0c] border border-dashed border-white/[0.12] hover:border-red/50 p-8 text-center cursor-pointer mb-6 transition-colors">
          <input type="file" accept="image/*" onChange={upload} className="hidden" />
          <div className="text-white/30 text-[13px] mb-1">Drop product images here or click to upload</div>
          <div className="text-white/20 text-[11px]">PNG · JPG · WEBP · Max 10MB each</div>
        </label>
        {media.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-[11px] tracking-widest uppercase">No media uploaded yet</div>
        ) : (
          <div className="grid grid-cols-6 gap-px bg-white/[0.05]">
            {media.map(m => (
              <div key={m.id} className="bg-[#0c0c0c] aspect-square relative overflow-hidden group cursor-pointer">
                <img src={m.url} alt={m.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                  <div className="text-[9px] text-white/60 truncate">{m.name}</div>
                  <button onClick={() => navigator.clipboard.writeText(m.url)} className="text-[9px] text-red hover:underline">Copy URL</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
