'use client'
import { useState } from 'react'
import Link from 'next/link'

const STEPS = ['Package','Personal Info','Banking','KYC','Agreement']

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [pkg, setPkg] = useState('')
  const [form, setForm] = useState<Record<string,string>>({})

  function update(k: string, v: string) { setForm((f: Record<string,string>) => ({...f, [k]: v})) }

  return (
    <main className="bg-black min-h-screen flex">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#0c0c0c] border-r border-white/[0.07] flex flex-col pt-10 px-6">
        <Link href="/" className="font-cond font-black text-[1rem] tracking-[0.2em] uppercase text-white mb-10">
          OHMI <span className="text-red">COFFEE CO.</span>
        </Link>
        <div className="space-y-1">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 px-3 py-2 text-[12px] font-medium ${i === step ? 'text-white' : i < step ? 'text-white/40' : 'text-white/20'}`}>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === step ? 'border-red bg-red text-white' : i < step ? 'border-white/40 bg-white/10 text-white/40' : 'border-white/15'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {s}
            </div>
          ))}
        </div>
        <div className="mt-auto pb-8 text-[11px] text-white/20 leading-relaxed">
          7-day buyback guarantee.<br/>KYC verification required.<br/>Distributor agreement on signup.
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-16 max-w-[700px]">
        {step === 0 && (
          <div>
            <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">Step 1</p>
            <h1 className="font-cond font-black uppercase text-[3.5rem] leading-[0.9] mb-8">Choose Your<br/><span className="text-red">Package</span></h1>
            <div className="space-y-3 mb-8">
              {[['starter','Starter','R1,000','R250 direct commission · 30% wholesale discount'],
                ['builder','Builder','R2,000','R500 direct commission · 40% wholesale discount'],
                ['elite','Elite','R5,000','R1,000 direct commission · 50% wholesale discount']].map(([val,name,price,desc]) => (
                <label key={val} className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${pkg===val?'border-red bg-red/10':'border-white/[0.1] hover:border-white/25'}`}>
                  <input type="radio" name="package" value={val} checked={pkg===val} onChange={() => setPkg(val)} className="accent-red" />
                  <div className="flex-1">
                    <div className="font-cond font-bold text-[14px]">{name} — <span className="text-red">{price} once-off</span></div>
                    <div className="text-white/40 text-[11px] mt-1">{desc} · + R1,000/month</div>
                  </div>
                </label>
              ))}
            </div>
            <button onClick={() => pkg && setStep(1)} disabled={!pkg}
              className="bg-red hover:bg-red-dark disabled:opacity-30 text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 transition-all">
              Continue →
            </button>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">Step 2</p>
            <h1 className="font-cond font-black uppercase text-[3.5rem] leading-[0.9] mb-8">Personal<br/><span className="text-red">Information</span></h1>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[['first_name','First Name'],['last_name','Last Name'],['email','Email Address'],['phone','Phone / WhatsApp'],['id_number','SA ID Number'],['date_of_birth','Date of Birth']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">{l}</label>
                  <input type="text" value={form[k]||''} onChange={e=>update(k,e.target.value)}
                    className="w-full bg-[#141414] border border-white/[0.1] text-white text-[13px] px-3 py-2" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="border border-white/20 text-white/50 font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-6 py-3">← Back</button>
              <button onClick={() => setStep(2)} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 transition-all">Continue →</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">Step 3</p>
            <h1 className="font-cond font-black uppercase text-[3.5rem] leading-[0.9] mb-8">Banking<br/><span className="text-red">Details</span></h1>
            <p className="text-white/40 text-[12px] mb-6">Your payout method for weekly Friday commissions.</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[['bank_name','Bank Name'],['bank_account_number','Account Number'],['bank_branch_code','Branch Code'],['bank_account_type','Account Type']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">{l}</label>
                  <input type="text" value={form[k]||''} onChange={e=>update(k,e.target.value)}
                    className="w-full bg-[#141414] border border-white/[0.1] text-white text-[13px] px-3 py-2" />
                </div>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-white/30 mb-1">USDT Wallet (Optional)</label>
              <input type="text" value={form.crypto_wallet||''} onChange={e=>update('crypto_wallet',e.target.value)} placeholder="TRC20 wallet address"
                className="w-full bg-[#141414] border border-white/[0.1] text-white text-[13px] px-3 py-2" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="border border-white/20 text-white/50 font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-6 py-3">← Back</button>
              <button onClick={() => setStep(3)} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 transition-all">Continue →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">Step 4</p>
            <h1 className="font-cond font-black uppercase text-[3.5rem] leading-[0.9] mb-6">KYC<br/><span className="text-red">Verification</span></h1>
            <p className="text-white/40 text-[12px] mb-6">Upload your documents. Your data is encrypted and secure.</p>
            <div className="space-y-4 mb-8">
              {[['id_doc','SA ID Document / Passport'],['selfie','Selfie with ID in hand'],['proof_bank','Proof of Banking (last 3 months)']].map(([k,l]) => (
                <div key={k} className="border border-white/[0.1] p-4 hover:border-red/50 transition-colors cursor-pointer">
                  <div className="text-[12px] font-medium mb-1">{l}</div>
                  <div className="text-white/30 text-[11px]">Click to upload · PDF, JPG, PNG · Max 5MB</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="border border-white/20 text-white/50 font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-6 py-3">← Back</button>
              <button onClick={() => setStep(4)} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 transition-all">Continue →</button>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">Step 5</p>
            <h1 className="font-cond font-black uppercase text-[3.5rem] leading-[0.9] mb-6">Distributor<br/><span className="text-red">Agreement</span></h1>
            <div className="bg-[#141414] border border-white/[0.07] p-5 h-48 overflow-y-auto mb-5 text-[12px] text-white/50 leading-relaxed">
              <p className="font-bold text-white mb-3">OHMI Coffee Co. Distributor Agreement v1.0</p>
              <p>By signing this agreement, you confirm that you are 18 years or older, a South African resident, and agree to operate as an independent distributor under OHMI Coffee Co.'s compensation plan and terms of service.</p>
              <p className="mt-3">You acknowledge the 7-day buyback guarantee policy under the South African Consumer Protection Act. All commission payments are subject to maintaining active status requirements (minimum 2 active monthly subscribers per leg).</p>
              <p className="mt-3">Income claims are not guaranteed. This is a business opportunity requiring effort, skill, and market conditions to achieve success.</p>
            </div>
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input type="checkbox" className="accent-red w-4 h-4" />
              <span className="text-[12px] text-white/60">I have read, understood and agree to the Distributor Agreement</span>
            </label>
            <button onClick={() => alert('Registration submitted. Our team will verify your KYC within 24 hours.')}
              className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 transition-all">
              Submit Application
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
