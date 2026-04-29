'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STEPS = ['Package', 'Personal', 'Banking', 'KYC', 'Agreement']

export default function JoinPage({ params }: { params: { sponsorSlug: string } }) {
  const [step, setStep] = useState(0)
  const [sponsor, setSponsor] = useState<any>(null)
  const [form, setForm] = useState<Record<string,string>>({ leg: 'left', package: 'standard' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.from('representatives').select('id,first_name,last_name,current_rank')
      .eq('rep_slug', params.sponsorSlug).single()
      .then(({ data }) => setSponsor(data))
  }, [params.sponsorSlug])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function submit() {
    setSubmitting(true)
    const res = await fetch('/api/rep/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sponsor_id: sponsor?.id, sponsor_name: `${sponsor?.first_name} ${sponsor?.last_name}` }),
    })
    if (res.ok) {
      setDone(true)
    } else {
      alert('Registration failed. Please try again.')
    }
    setSubmitting(false)
  }

  if (done) return (
    <div className="login-wrap">
      <div style={{textAlign:'center',maxWidth:400}}>
        <div className="login-logo-name" style={{marginBottom:16}}>Application Submitted</div>
        <div className="login-logo-line" style={{margin:'0 auto 20px'}} />
        <p style={{color:'var(--text3)',fontSize:13,lineHeight:1.8,marginBottom:24}}>
          Your application has been received. Our team will verify your KYC documents within 24 hours. You will receive an email at {form.email} once your account is activated.
        </p>
        <a href="/rep/login" className="btn btn-red" style={{textDecoration:'none'}}>Go to Rep Login</a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex'}}>
      {/* Sidebar */}
      <div style={{width:220,background:'var(--bg2)',borderRight:'1px solid var(--border)',padding:'32px 20px',display:'flex',flexDirection:'column'}}>
        <div className="sidebar-logo-name" style={{marginBottom:4}}>OHMI</div>
        <div className="sidebar-logo-sub" style={{marginBottom:32}}>Representative Application</div>
        {sponsor && (
          <div style={{background:'var(--red3)',border:'1px solid rgba(196,30,74,0.2)',borderRadius:3,padding:'10px 12px',marginBottom:28}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--text4)',marginBottom:4}}>Referred by</div>
            <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:15,color:'var(--text)'}}>{sponsor.first_name} {sponsor.last_name}</div>
            <div style={{fontSize:10,color:'var(--red)',marginTop:2}}>{sponsor.current_rank || 'Representative'}</div>
          </div>
        )}
        {STEPS.map((s, i) => (
          <div key={s} style={{display:'flex',alignItems:'center',gap:10,padding:'6px 0',opacity:i<=step?1:0.35}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:i<step?'var(--red)':i===step?'var(--red)':'transparent',border:`1px solid ${i<=step?'var(--red)':'var(--border2)'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:i<=step?'var(--bg)':'var(--text4)',flexShrink:0}}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{fontSize:11,color:i===step?'var(--text)':'var(--text3)',fontWeight:i===step?500:400}}>{s}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:40}}>
        <div style={{width:'100%',maxWidth:520}}>

          {step === 0 && (
            <div>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--text)',marginBottom:6}}>Choose Your Package</div>
              <div style={{fontSize:11,color:'var(--text4)',marginBottom:28}}>R2,000 once-off · R1,500/month to stay active</div>
              <div style={{background:'var(--red3)',border:'1px solid rgba(196,30,74,0.25)',borderRadius:4,padding:'16px 20px',marginBottom:12,cursor:'pointer'}} onClick={()=>set('package','standard')}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:18,color:'var(--text)'}}>Standard</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>R2,000 once-off + R1,500/month</div>
                    <div style={{fontSize:10,color:'var(--red)',marginTop:4}}>R500 direct commission per referral</div>
                  </div>
                  <div style={{width:18,height:18,borderRadius:'50%',background:'var(--red)',border:'2px solid var(--red2)',flexShrink:0}} />
                </div>
              </div>
              <div style={{fontSize:10,color:'var(--text4)',lineHeight:1.8,marginBottom:28}}>
                Includes: Network position · Rep portal access · Binary tree placement · Weekly Friday direct commissions · Monthly residual income from R1 rank
              </div>
              <button className="btn btn-red" onClick={()=>setStep(1)}>Continue →</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--text)',marginBottom:24}}>Personal Information</div>
              <div className="grid-2">
                {[['first_name','First Name'],['last_name','Last Name'],['email','Email Address'],['phone','Phone / WhatsApp'],['id_number','SA ID Number'],['date_of_birth','Date of Birth'],['city','City'],['province','Province']].map(([k,l]) => (
                  <div key={k} className="field">
                    <label>{l}</label>
                    <input type="text" value={form[k]||''} onChange={e=>set(k,e.target.value)} />
                  </div>
                ))}
                <div className="field">
                  <label>Password</label>
                  <input type="password" value={form.password||''} onChange={e=>set('password',e.target.value)} placeholder="Min 8 characters" />
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" value={form.confirm_password||''} onChange={e=>set('confirm_password',e.target.value)} />
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button className="btn btn-outline" onClick={()=>setStep(0)}>← Back</button>
                <button className="btn btn-red" onClick={()=>setStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--text)',marginBottom:8}}>Banking Details</div>
              <div style={{fontSize:11,color:'var(--text4)',marginBottom:24}}>For weekly Friday commission payouts</div>
              <div className="grid-2">
                {[['bank_name','Bank Name'],['bank_account_number','Account Number'],['bank_branch_code','Branch Code'],['bank_account_type','Account Type (Cheque/Savings)']].map(([k,l]) => (
                  <div key={k} className="field">
                    <label>{l}</label>
                    <input type="text" value={form[k]||''} onChange={e=>set(k,e.target.value)} />
                  </div>
                ))}
                <div className="field span-2">
                  <label>USDT Wallet Address (Optional — for crypto payouts)</label>
                  <input type="text" value={form.crypto_wallet||''} onChange={e=>set('crypto_wallet',e.target.value)} placeholder="TRC20 address" />
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:8}}>
                <button className="btn btn-outline" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn btn-red" onClick={()=>setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--text)',marginBottom:8}}>KYC Verification</div>
              <div style={{fontSize:11,color:'var(--text4)',marginBottom:24}}>Your documents are encrypted and secure</div>
              {[['id_doc_url','SA ID Document or Passport','PDF, JPG, PNG'],['selfie_url','Selfie holding your ID','JPG, PNG'],['bank_proof_url','Proof of Banking (last 3 months)','PDF, JPG']].map(([k,l,hint]) => (
                <div key={k} style={{border:'1px dashed var(--border2)',borderRadius:3,padding:'14px 16px',marginBottom:10,cursor:'pointer'}} onClick={()=>document.getElementById(k)?.click()}>
                  <div style={{fontSize:12,fontWeight:500,color:'var(--text)',marginBottom:2}}>{l}</div>
                  <div style={{fontSize:10,color:'var(--text4)'}}>{hint} · Max 5MB</div>
                  <input id={k} type="file" style={{display:'none'}} onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) set(k, file.name)
                  }} />
                  {form[k] && <div style={{fontSize:10,color:'var(--red)',marginTop:4}}>✓ {form[k]}</div>}
                </div>
              ))}
              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button className="btn btn-outline" onClick={()=>setStep(2)}>← Back</button>
                <button className="btn btn-red" onClick={()=>setStep(4)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{fontFamily:'Cormorant Garamond,Georgia,serif',fontSize:28,color:'var(--text)',marginBottom:8}}>Distributor Agreement</div>
              <div style={{fontSize:11,color:'var(--text4)',marginBottom:20}}>Please read and sign the agreement below</div>
              <div style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:3,padding:'16px 18px',height:200,overflowY:'auto',marginBottom:16,fontSize:11,color:'var(--text3)',lineHeight:1.9}}>
                <div style={{fontWeight:600,color:'var(--text)',marginBottom:8}}>OHMI Coffee Co. — Distributor Agreement v1.0</div>
                <p>By submitting this application, you confirm that you are 18 years or older, a South African resident, and agree to operate as an independent OHMI Coffee Co. distributor under the terms of this agreement and the compensation plan.</p>
                <p style={{marginTop:8}}>You acknowledge the 7-day cooling-off period under the Electronic Communications and Transactions Act (ECT Act). Unopened products may be returned within 7 days at your own shipping cost. Opened products cannot be refunded.</p>
                <p style={{marginTop:8}}>Commission payouts: Direct commissions are paid the following Friday. Residual income is paid within 7 days of month end. Payouts require minimum 2 active monthly subscribers per leg to qualify for residual income. From Rank 4 onwards, 4 personal active monthly subscribers are required.</p>
                <p style={{marginTop:8}}>This is an independent business opportunity. Income is not guaranteed and depends on individual effort, skill, and market conditions.</p>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:20}}>
                <input type="checkbox" checked={form.agreed==='yes'} onChange={e=>set('agreed',e.target.checked?'yes':'')} style={{width:16,height:16,accentColor:'var(--red)'}} />
                <span style={{fontSize:12,color:'var(--text3)'}}>I have read and agree to the OHMI Distributor Agreement</span>
              </label>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-outline" onClick={()=>setStep(3)}>← Back</button>
                <button className="btn btn-red" onClick={submit} disabled={form.agreed!=='yes'||submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
