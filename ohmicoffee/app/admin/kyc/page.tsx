'use client'
import { useState, useEffect } from 'react'
import AdminTopbar from '@/components/admin/AdminTopbar'
import { supabase } from '@/lib/supabase'

export default function AdminKYC() {
  const [pending, setPending] = useState<any[]>([])
  useEffect(() => {
    supabase.from('representatives').select('*').eq('kyc_status','submitted').then(({ data }) => setPending(data || []))
  }, [])

  async function verify(id: string, status: string) {
    await supabase.from('representatives').update({ kyc_status: status, kyc_verified_at: status === 'verified' ? new Date().toISOString() : null, is_active: status === 'verified' }).eq('id', id)
    const { data } = await supabase.from('representatives').select('*').eq('kyc_status','submitted')
    setPending(data || [])
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminTopbar title="KYC Verification" />
      <div className="flex-1 p-6 overflow-y-auto">
        {pending.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-[11px] tracking-widest uppercase">No pending KYC submissions</div>
        ) : (
          <div className="space-y-4">
            {pending.map(rep => (
              <div key={rep.id} className="bg-[#0c0c0c] border border-white/[0.07] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-cond font-bold text-[14px]">{rep.first_name} {rep.last_name}</div>
                    <div className="text-white/40 text-[12px] mt-1">{rep.email} · {rep.phone}</div>
                    <div className="text-white/30 text-[11px] mt-1">ID: {rep.id_number} · Submitted: {rep.kyc_submitted_at ? new Date(rep.kyc_submitted_at).toLocaleDateString('en-ZA') : '—'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => verify(rep.id, 'verified')} className="bg-green-500/20 border border-green-500/30 text-green-400 font-cond font-bold text-[11px] tracking-wider uppercase px-4 py-2 hover:bg-green-500/30 transition-colors">
                      ✓ Approve
                    </button>
                    <button onClick={() => verify(rep.id, 'rejected')} className="bg-red/10 border border-red/20 text-red font-cond font-bold text-[11px] tracking-wider uppercase px-4 py-2 hover:bg-red/20 transition-colors">
                      ✗ Reject
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {rep.id_document_url && <div className="bg-[#141414] border border-white/[0.07] p-3 text-[11px]"><div className="text-white/30 mb-1">ID Document</div><a href={rep.id_document_url} target="_blank" className="text-red hover:underline">View Document →</a></div>}
                  {rep.selfie_url && <div className="bg-[#141414] border border-white/[0.07] p-3 text-[11px]"><div className="text-white/30 mb-1">Selfie with ID</div><a href={rep.selfie_url} target="_blank" className="text-red hover:underline">View Photo →</a></div>}
                  <div className="bg-[#141414] border border-white/[0.07] p-3 text-[11px]"><div className="text-white/30 mb-1">Bank Details</div><div className="text-white/60">{rep.bank_name} · {rep.bank_account_number}</div></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
