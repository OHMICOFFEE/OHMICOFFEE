'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const STEPS = ['Package', 'Personal Details', 'Address & Banking', 'KYC Documents', 'Agreement & Signature']

type FileObj = { file: File; name: string; preview?: string } | null

export default function JoinPage({ params }: { params: { sponsorSlug: string } }) {
  const [step, setStep] = useState(0)
  const [sponsor, setSponsor] = useState<any>(null)
  const [form, setForm] = useState<Record<string, string>>({ leg: 'left' })
  const [files, setFiles] = useState<{ idFront: FileObj; idBack: FileObj; selfie: FileObj; bankProof: FileObj }>({
    idFront: null, idBack: null, selfie: null, bankProof: null
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [signature, setSignature] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    supabase.from('representatives').select('id,first_name,last_name,current_rank,rep_slug')
      .eq('rep_slug', params.sponsorSlug).single()
      .then(({ data }) => setSponsor(data))
  }, [params.sponsorSlug])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function handleFile(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    setFiles(f => ({ ...f, [key]: { file, name: file.name, preview } }))
  }

  // Signature canvas
  function getPos(canvas: HTMLCanvasElement, e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true
    const canvas = canvasRef.current!
    const pos = getPos(canvas, e.nativeEvent as MouseEvent)
    lastPos.current = pos
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(canvas, e.nativeEvent as MouseEvent)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1C1C1C'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDraw() {
    if (!drawing.current) return
    drawing.current = false
    setSignature(canvasRef.current!.toDataURL())
  }

  function clearSignature() {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature(null)
  }

  function validateStep(): boolean {
    setError('')
    if (step === 1) {
      if (!form.first_name || !form.last_name || !form.email || !form.phone || !form.id_number) {
        setError('Please fill in all required fields'); return false
      }
      if (!form.password || form.password.length < 8) {
        setError('Password must be at least 8 characters'); return false
      }
      if (form.password !== form.confirm_password) {
        setError('Passwords do not match'); return false
      }
    }
    if (step === 3) {
      if (!files.idFront) { setError('Please upload your ID document (front)'); return false }
      if (!files.selfie) { setError('Please upload your selfie'); return false }
    }
    if (step === 4) {
      if (!signature) { setError('Please draw your signature'); return false }
      if (form.agreed !== 'yes') { setError('Please agree to the distributor agreement'); return false }
    }
    return true
  }

  function next() { if (validateStep()) setStep(s => s + 1) }
  function back() { setError(''); setStep(s => s - 1) }

  async function submit() {
    if (!validateStep()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/rep/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sponsor_id: sponsor?.id,
          sponsor_name: `${sponsor?.first_name} ${sponsor?.last_name}`,
          signature_data: signature,
        }),
      })
      if (res.ok) { setDone(true) }
      else {
        const data = await res.json()
        setError(data.error || 'Registration failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#2C2825', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(45,106,79,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 26 }}>✓</div>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 28, color: '#1C1C1C', marginBottom: 6 }}>Application Submitted</div>
        <div style={{ width: 36, height: 1, background: '#C41E4A', margin: '12px auto 20px' }} />
        <p style={{ color: '#6B6258', fontSize: 13, lineHeight: 1.9, marginBottom: 28 }}>
          Your application has been received. Our team will verify your KYC documents within 24 hours. You will be notified at <strong>{form.email}</strong> once your account is activated.
        </p>
        <a href="/rep/login" style={{ background: '#C41E4A', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block' }}>
          Sign In to Portal →
        </a>
      </div>
    </div>
  )

  const FileUpload = ({ label, hint, fileKey, required = false }: { label: string; hint: string; fileKey: string; required?: boolean }) => {
    const f = (files as any)[fileKey]
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B6258', marginBottom: 6 }}>
          {label}{required && ' *'}
        </label>
        <div onClick={() => document.getElementById(`file_${fileKey}`)?.click()}
          style={{ background: f ? 'rgba(45,106,79,0.04)' : '#F8F5F0', border: `1.5px dashed ${f ? '#2D6A4F' : '#C8BFB2'}`, borderRadius: 10, padding: '14px 18px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}>
          {f?.preview ? (
            <img src={f.preview} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #D8D0C4' }} alt="preview" />
          ) : (
            <div style={{ width: 48, height: 48, background: '#EDE8DF', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#9A9088', flexShrink: 0 }}>
              {f ? '📄' : '↑'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: f ? '#2D6A4F' : '#1C1C1C', fontWeight: 500, marginBottom: 2 }}>{f ? f.name : label}</div>
            <div style={{ fontSize: 11, color: '#9A9088' }}>{f ? '✓ Uploaded — click to replace' : hint}</div>
          </div>
        </div>
        <input id={`file_${fileKey}`} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(fileKey, e)} />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#2C2825', display: 'flex' }}>
      {/* Left sidebar */}
      <div style={{ width: 260, background: 'rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.08)', padding: '36px 24px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F5EDD6', marginBottom: 3 }}>OHMI Coffee Co.</div>
        <div style={{ fontSize: 9, color: 'rgba(245,237,214,0.4)', letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 36 }}>Distributor Application</div>

        {sponsor && (
          <div style={{ background: 'rgba(196,30,74,0.12)', border: '1px solid rgba(196,30,74,0.2)', borderRadius: 10, padding: '14px 16px', marginBottom: 32 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,237,214,0.4)', marginBottom: 6 }}>Referred by</div>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 16, color: '#F5EDD6', marginBottom: 2 }}>{sponsor.first_name} {sponsor.last_name}</div>
            <div style={{ fontSize: 11, color: '#C41E4A' }}>{sponsor.current_rank || 'Representative'}</div>
          </div>
        )}

        <div style={{ flex: 1 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', opacity: i <= step ? 1 : 0.35, transition: 'opacity 0.2s' }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: i < step ? '#C41E4A' : i === step ? 'transparent' : 'transparent',
                border: `1.5px solid ${i < step ? '#C41E4A' : i === step ? '#C41E4A' : 'rgba(245,237,214,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: i < step ? '#fff' : i === step ? '#C41E4A' : 'rgba(245,237,214,0.3)',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, color: i === step ? '#F5EDD6' : 'rgba(245,237,214,0.5)', fontWeight: i === step ? 500 : 400 }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(245,237,214,0.3)', lineHeight: 1.9 }}>
          <div>R2,000 once-off</div>
          <div>R1,500/month</div>
          <div style={{ marginTop: 6 }}>7-day buyback guarantee</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Dark header */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 48px', flexShrink: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, color: '#F5EDD6', letterSpacing: '0.04em' }}>{STEPS[step]}</div>
          <div style={{ fontSize: 11, color: 'rgba(245,237,214,0.4)', marginTop: 2 }}>Step {step + 1} of {STEPS.length}</div>
        </div>

        {/* White card content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px', display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #D8D0C4', padding: '36px 40px', width: '100%', maxWidth: 620, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>

            {error && (
              <div style={{ background: 'rgba(196,30,74,0.06)', border: '1px solid rgba(196,30,74,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#C41E4A' }}>
                {error}
              </div>
            )}

            {/* STEP 0 — Package */}
            {step === 0 && (
              <div>
                <p style={{ color: '#6B6258', fontSize: 13, lineHeight: 1.8, marginBottom: 28 }}>
                  {sponsor ? <>You have been referred by <strong>{sponsor.first_name} {sponsor.last_name}</strong>. </> : ''}
                  Review the OHMI distributor package below before continuing.
                </p>
                <div style={{ border: '2px solid #C41E4A', borderRadius: 12, padding: '24px 28px', marginBottom: 24, background: 'rgba(196,30,74,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 24, color: '#1C1C1C', marginBottom: 4 }}>Standard Package</div>
                      <div style={{ fontSize: 10, color: '#9A9088', letterSpacing: '0.14em', textTransform: 'uppercase' }}>OHMI Distributor License</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 30, color: '#C41E4A', lineHeight: 1 }}>R 2,000</div>
                      <div style={{ fontSize: 11, color: '#9A9088', marginTop: 2 }}>once-off</div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 20, color: '#1C1C1C', marginBottom: 3 }}>
                      R 1,500 <span style={{ fontSize: 13, color: '#9A9088', fontFamily: 'Inter, sans-serif' }}>/ month</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B6258' }}>Monthly subscription to remain active and earn residuals</div>
                  </div>
                  {['Binary network position (left or right leg)', 'Rep portal with downline tree', 'Weekly direct commissions (paid following Friday)', 'Monthly residual income R1–R8 (up to R180,000/month)', 'Wholesale coffee pricing', '7-day buyback guarantee (ECT Act)', 'KYC verification required'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', fontSize: 13, color: '#6B6258', borderBottom: '1px solid #F0EBE4' }}>
                      <span style={{ color: '#C41E4A', fontSize: 8, marginTop: 5, flexShrink: 0 }}>●</span>{f}
                    </div>
                  ))}
                </div>
                <div className="field">
                  <label>Leg Placement</label>
                  <select value={form.leg || 'left'} onChange={e => set('leg', e.target.value)}>
                    <option value="left">Left Leg</option>
                    <option value="right">Right Leg</option>
                  </select>
                </div>
                <button onClick={next} style={{ width: '100%', background: '#C41E4A', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Continue →
                </button>
              </div>
            )}

            {/* STEP 1 — Personal */}
            {step === 1 && (
              <div>
                <div className="grid-2">
                  {[['first_name', 'First Name *'], ['last_name', 'Last Name *'], ['email', 'Email Address *'], ['phone', 'Phone / WhatsApp *'], ['id_number', 'SA ID Number *'], ['date_of_birth', 'Date of Birth'], ['occupation', 'Occupation'], ['gender', 'Gender']].map(([k, l]) => (
                    <div key={k} className="field">
                      <label>{l}</label>
                      {k === 'gender' ? (
                        <select value={form[k] || ''} onChange={e => set(k, e.target.value)}>
                          <option value="">Select</option>
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      ) : (
                        <input type={k === 'email' ? 'email' : k === 'date_of_birth' ? 'date' : 'text'} value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                      )}
                    </div>
                  ))}
                  <div className="field"><label>Password *</label><input type="password" value={form.password || ''} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" /></div>
                  <div className="field"><label>Confirm Password *</label><input type="password" value={form.confirm_password || ''} onChange={e => set('confirm_password', e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-outline" onClick={back}>← Back</button>
                  <button className="btn btn-red" style={{ flex: 1 }} onClick={next}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 2 — Address & Banking */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9088', marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #EDE8DF' }}>Address</div>
                <div className="grid-2">
                  {[['address_line1', 'Address Line 1'], ['address_line2', 'Address Line 2'], ['city', 'City'], ['province', 'Province'], ['postal_code', 'Postal Code']].map(([k, l]) => (
                    <div key={k} className={`field${k === 'address_line1' ? ' span-2' : ''}`}>
                      <label>{l}</label>
                      <input value={form[k] || ''} onChange={e => set(k, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9088', margin: '20px 0 16px', paddingBottom: 8, borderBottom: '1px solid #EDE8DF' }}>Banking Details</div>
                <div className="grid-2">
                  {[['bank_name', 'Bank Name'], ['bank_account_number', 'Account Number'], ['bank_branch_code', 'Branch Code'], ['bank_account_type', 'Account Type']].map(([k, l]) => (
                    <div key={k} className="field">
                      <label>{l}</label>
                      {k === 'bank_account_type' ? (
                        <select value={form[k] || 'cheque'} onChange={e => set(k, e.target.value)}>
                          <option value="cheque">Cheque / Current</option>
                          <option value="savings">Savings</option>
                          <option value="transmission">Transmission</option>
                        </select>
                      ) : <input value={form[k] || ''} onChange={e => set(k, e.target.value)} />}
                    </div>
                  ))}
                  <div className="field span-2">
                    <label>USDT Wallet Address (Optional — for crypto payouts)</label>
                    <input value={form.crypto_wallet || ''} onChange={e => set('crypto_wallet', e.target.value)} placeholder="TRC20 wallet address" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-outline" onClick={back}>← Back</button>
                  <button className="btn btn-red" style={{ flex: 1 }} onClick={next}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 3 — KYC Documents */}
            {step === 3 && (
              <div>
                <p style={{ color: '#6B6258', fontSize: 13, lineHeight: 1.8, marginBottom: 24 }}>
                  Upload clear, legible copies of your documents. All files are encrypted and stored securely. Required for compliance under South African law.
                </p>
                <FileUpload label="SA ID Document — Front" hint="JPG, PNG or PDF · Max 5MB" fileKey="idFront" required />
                <FileUpload label="SA ID Document — Back" hint="JPG, PNG or PDF · Max 5MB" fileKey="idBack" />
                <FileUpload label="Selfie Holding Your ID" hint="JPG or PNG · Must be clear and in good lighting" fileKey="selfie" required />
                <FileUpload label="Proof of Banking" hint="Bank statement — last 3 months · PDF or JPG" fileKey="bankProof" />
                <div style={{ background: '#F8F5F0', border: '1px solid #D8D0C4', borderRadius: 8, padding: '12px 16px', marginTop: 16, fontSize: 12, color: '#9A9088' }}>
                  Your documents are stored in a private, encrypted bucket. Only OHMI admins can access them for verification purposes.
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button className="btn btn-outline" onClick={back}>← Back</button>
                  <button className="btn btn-red" style={{ flex: 1 }} onClick={next}>Continue →</button>
                </div>
              </div>
            )}

            {/* STEP 4 — Agreement & Signature */}
            {step === 4 && (
              <div>
                <div style={{ fontSize: 10, color: '#9A9088', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>OHMI Coffee Co.</div>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 22, color: '#1C1C1C', marginBottom: 4 }}>Distributor Agreement</div>
                <div style={{ fontSize: 11, color: '#9A9088', marginBottom: 20 }}>Version 1.0 · Please read and sign before continuing</div>

                <div style={{ background: '#F8F5F0', border: '1px solid #D8D0C4', borderRadius: 10, padding: '20px 22px', height: 200, overflowY: 'auto', marginBottom: 20, fontSize: 12, color: '#6B6258', lineHeight: 1.9 }}>
                  <div style={{ fontWeight: 600, color: '#1C1C1C', marginBottom: 10, fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15 }}>OHMI Coffee Co. — Distributor Agreement v1.0</div>
                  <p>By submitting this application, you confirm that you are 18 years or older, a South African resident, and agree to operate as an independent OHMI Coffee Co. distributor.</p>
                  <p style={{ marginTop: 10 }}><strong>Cooling-off Period:</strong> You are entitled to a 7-day cooling-off period under the Electronic Communications and Transactions Act (ECT Act). Unopened products may be returned within 7 days at your cost. Opened products cannot be refunded.</p>
                  <p style={{ marginTop: 10 }}><strong>Commission Payouts:</strong> Direct commissions are paid the following Friday. Residual income is paid within 14 days of month end. Rank R1–R3 requires 2 personal active subscribers. Rank R4–R8 requires 4 personal active subscribers.</p>
                  <p style={{ marginTop: 10 }}><strong>Independent Contractor:</strong> You are an independent distributor, not an employee of OHMI Coffee Co. You are responsible for your own tax obligations.</p>
                  <p style={{ marginTop: 10 }}>Income is not guaranteed and depends entirely on individual effort and market conditions.</p>
                </div>

                {/* Signature pad */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#9A9088', marginBottom: 8 }}>Your Signature *</div>
                  <div style={{ border: '1.5px solid #D8D0C4', borderRadius: 10, overflow: 'hidden', background: '#F8F5F0', position: 'relative' }}>
                    <canvas
                      ref={canvasRef} width={520} height={130}
                      style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
                      onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                      onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                    />
                    {!signature && (
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 13, color: '#C8BFB2', pointerEvents: 'none', fontStyle: 'italic' }}>
                        Draw your signature here
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ fontSize: 11, color: '#9A9088' }}>Signed by: {form.email || 'your@email.com'}</div>
                    <button onClick={clearSignature} style={{ fontSize: 11, color: '#C41E4A', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Clear</button>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24, background: '#F8F5F0', padding: '14px 16px', borderRadius: 8, border: '1px solid #D8D0C4' }}>
                  <input type="checkbox" checked={form.agreed === 'yes'} onChange={e => set('agreed', e.target.checked ? 'yes' : '')} style={{ width: 16, height: 16, marginTop: 2, accentColor: '#C41E4A', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#6B6258', lineHeight: 1.7 }}>
                    I, <strong>{form.first_name || '___'} {form.last_name || '___'}</strong>, have read and understood the OHMI Coffee Co. Distributor Agreement and agree to be bound by its terms. I understand this is a legally binding digital signature under the Electronic Communications and Transactions Act 25 of 2002.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" onClick={back}>← Back</button>
                  <button onClick={submit} disabled={form.agreed !== 'yes' || submitting}
                    style={{ flex: 1, background: form.agreed === 'yes' ? '#C41E4A' : '#D8D0C4', color: '#fff', border: 'none', borderRadius: 8, padding: '14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: form.agreed === 'yes' ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
                    {submitting ? 'Submitting Application...' : '✍ Sign & Submit Application'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
