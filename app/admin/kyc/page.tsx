'use client'
import { useState, useEffect } from 'react'
import Topbar from '@/components/Topbar'
import { supabase } from '@/lib/supabase'

export default function AdminKYC() {
  const [reps, setReps] = useState<any[]>([])
  const [filter, setFilter] = useState<'submitted'|'pending'|'verified'|'rejected'|'all'>('submitted')
  const [processing, setProcessing] = useState<string|null>(null)
  const [viewing, setViewing] = useState<any>(null)

  async function load() {
    let q = supabase.from('representatives').select('*').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('kyc_status', filter)
    const { data } = await q
    setReps(data || [])
  }
  useEffect(() => { load() }, [filter])

  async function action(repId: string, act: 'approve'|'reject') {
    setProcessing(repId)
    await fetch('/api/admin/kyc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repId, action: act }),
    })
    await load()
    setProcessing(null)
    setViewing(null)
  }

  const counts = {
    submitted: reps.filter(r => r.kyc_status === 'submitted').length,
    pending: reps.filter(r => r.kyc_status === 'pending').length,
    verified: reps.filter(r => r.kyc_status === 'verified').length,
    rejected: reps.filter(r => r.kyc_status === 'rejected').length,
  }

  return (
    <div className="main">
      <Topbar title="KYC Verification" action={
        counts.submitted > 0 ? <span style={{fontSize:12,color:'var(--red)',fontWeight:600}}>{counts.submitted} awaiting review</span> : undefined
      } />
      <div className="page">
        {/* Filter tabs */}
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {(['submitted','pending','verified','rejected','all'] as const).map(f => (
            <button key={f} className={`btn ${filter===f?'btn-red':'btn-outline'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
              {f !== 'all' && counts[f] > 0 && (
                <span style={{marginLeft:6,background:f==='submitted'?'rgba(196,30,74,0.15)':'rgba(0,0,0,0.06)',color:f==='submitted'?'var(--red)':'var(--text4)',borderRadius:20,padding:'1px 6px',fontSize:10,fontWeight:700}}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {reps.length === 0 ? (
          <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:10,padding:'60px 20px',textAlign:'center',color:'var(--text4)',fontSize:12,letterSpacing:'0.06em',boxShadow:'var(--shadow)'}}>
            No {filter === 'all' ? '' : filter} KYC applications
          </div>
        ) : (
          <div style={{display:'grid',gap:12}}>
            {reps.map(rep => (
              <div key={rep.id} style={{background:'var(--white)',border:`1px solid ${rep.kyc_status==='submitted'?'rgba(196,30,74,0.2)':'var(--border)'}`,borderRadius:10,overflow:'hidden',boxShadow:'var(--shadow)'}}>
                {/* Header */}
                <div style={{background:rep.kyc_status==='submitted'?'rgba(196,30,74,0.03)':'var(--bg3)',padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:rep.kyc_status==='verified'?'rgba(45,106,79,0.1)':rep.kyc_status==='submitted'?'rgba(196,30,74,0.1)':'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:16,color:rep.kyc_status==='verified'?'var(--green)':'var(--red)',fontWeight:500}}>
                      {rep.first_name?.[0]}{rep.last_name?.[0]}
                    </div>
                    <div>
                      <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:17,color:'var(--text)',fontWeight:500}}>{rep.first_name} {rep.last_name}</div>
                      <div style={{fontSize:11,color:'var(--text4)',marginTop:1}}>{rep.email} · {rep.phone||'—'}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <span className={`badge ${rep.kyc_status==='verified'?'badge-green':rep.kyc_status==='submitted'?'badge-red':rep.kyc_status==='rejected'?'badge-red':'badge-yellow'}`}>
                      {rep.kyc_status}
                    </span>
                    <button onClick={() => setViewing(viewing?.id===rep.id?null:rep)}
                      className="btn btn-outline" style={{padding:'5px 12px',fontSize:11}}>
                      {viewing?.id===rep.id?'Hide':'Review'}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {viewing?.id === rep.id && (
                  <div style={{padding:'20px 24px'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
                      {[
                        ['ID Number', rep.id_number||'—'],
                        ['Date of Birth', rep.date_of_birth||'—'],
                        ['Submitted', rep.kyc_submitted_at?new Date(rep.kyc_submitted_at).toLocaleDateString('en-ZA'):'—'],
                        ['Bank', rep.bank_name||'—'],
                        ['Account', rep.bank_account_number||'—'],
                        ['Branch Code', rep.bank_branch_code||'—'],
                        ['Leg', rep.leg||'—'],
                        ['Sponsor', rep.sponsor_name||'—'],
                        ['Payout Method', rep.payout_method||'bank'],
                      ].map(([l,v]) => (
                        <div key={l} style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px'}}>
                          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:4}}>{l}</div>
                          <div style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Document previews */}
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--text4)',marginBottom:12}}>Documents</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                        {[
                          ['ID Document (Front)', rep.id_document_url],
                          ['ID Document (Back)', rep.id_document_back_url],
                          ['Selfie with ID', rep.selfie_url],
                          ['Proof of Banking', rep.bank_proof_url],
                        ].map(([label, url]) => (
                          <div key={label as string} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
                            <div style={{height:100,display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg3)'}}>
                              {url
                                ? <img src={url as string} alt={label as string} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>(e.currentTarget.style.display='none')} />
                                : <span style={{fontSize:24}}>📄</span>
                              }
                            </div>
                            <div style={{padding:'8px 10px'}}>
                              <div style={{fontSize:10,color:'var(--text3)',fontWeight:500,marginBottom:4}}>{label as string}</div>
                              {url
                                ? <a href={url as string} target="_blank" style={{fontSize:10,color:'var(--red)',textDecoration:'none',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>View →</a>
                                : <span style={{fontSize:10,color:'var(--text4)'}}>Not uploaded</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {rep.kyc_status === 'submitted' && (
                      <div style={{display:'flex',gap:10,paddingTop:16,borderTop:'1px solid var(--border)'}}>
                        <button
                          onClick={() => action(rep.id, 'reject')}
                          disabled={processing===rep.id}
                          style={{background:'none',border:'1px solid rgba(196,30,74,0.3)',borderRadius:8,padding:'10px 20px',fontSize:12,cursor:'pointer',color:'var(--red)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>
                          ✗ Reject
                        </button>
                        <button
                          onClick={() => action(rep.id, 'approve')}
                          disabled={processing===rep.id}
                          style={{background:'var(--green)',border:'none',borderRadius:8,padding:'10px 24px',fontSize:12,cursor:'pointer',color:'#fff',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',flex:1}}>
                          {processing===rep.id ? 'Processing...' : '✓ Approve & Activate Account'}
                        </button>
                      </div>
                    )}
                    {rep.kyc_status === 'verified' && (
                      <div style={{padding:'10px 14px',background:'rgba(45,106,79,0.06)',border:'1px solid rgba(45,106,79,0.2)',borderRadius:8,fontSize:12,color:'var(--green)',fontWeight:500}}>
                        ✓ KYC Verified on {rep.kyc_verified_at ? new Date(rep.kyc_verified_at).toLocaleDateString('en-ZA') : '—'}
                      </div>
                    )}
                    {rep.kyc_status === 'rejected' && (
                      <button onClick={() => action(rep.id, 'approve')} className="btn btn-red">Re-approve</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
