'use client'
import { fmt } from '@/lib/types'

const demoTree = {
  left: [
    { name: 'Sarah Kotze', pkg: 'Builder', rank: 'Qualified Rep', left: 2, right: 1, status: 'active' },
    { name: 'James Muller', pkg: 'Builder', rank: 'Unranked', left: 0, right: 1, status: 'active' },
    { name: 'Lebo Dlamini', pkg: 'Starter', rank: 'Unranked', left: 0, right: 0, status: 'active' },
    { name: 'Riana Nel', pkg: 'Elite', rank: 'Unranked', left: 0, right: 0, status: 'pending' },
    { name: 'Thabo Nkosi', pkg: 'Starter', rank: 'Unranked', left: 0, right: 0, status: 'active' },
  ],
  right: [
    { name: 'Cara Smith', pkg: 'Elite', rank: 'Rising Star', left: 5, right: 3, status: 'active' },
    { name: 'Johan Visser', pkg: 'Builder', rank: 'Unranked', left: 1, right: 0, status: 'active' },
    { name: 'Mpho Sithole', pkg: 'Starter', rank: 'Unranked', left: 0, right: 0, status: 'active' },
    { name: 'Anri Botha', pkg: 'Builder', rank: 'Unranked', left: 0, right: 0, status: 'pending' },
    { name: 'Keagan Fourie', pkg: 'Starter', rank: 'Unranked', left: 0, right: 0, status: 'active' },
  ],
}

export default function RepDownline() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="h-12 bg-[#0c0c0c] border-b border-white/[0.07] flex items-center px-6">
        <h1 className="text-[12px] font-bold tracking-[0.08em]">My Downline Tree</h1>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {/* You at top */}
        <div className="flex justify-center mb-8">
          <div className="bg-red px-6 py-3 text-center">
            <div className="font-cond font-black text-white text-[1.1rem]">BRANDON MARRIOTT</div>
            <div className="text-white/65 text-[11px]">Builder · Rising Star</div>
          </div>
        </div>
        {/* Connector */}
        <div className="flex justify-center mb-4">
          <div className="w-px h-6 bg-white/[0.15]" />
        </div>
        <div className="flex gap-8 justify-center mb-4">
          <div className="h-px bg-white/[0.15] w-1/4" />
          <div className="h-px bg-white/[0.15] w-1/4" />
        </div>
        {/* Two legs */}
        <div className="grid grid-cols-2 gap-6">
          {(['left','right'] as const).map(side => (
            <div key={side}>
              <div className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{color: side==='left'?'#60a5fa':'#a78bfa'}}>
                {side} Leg — {demoTree[side].filter(r=>r.status==='active').length} Active
              </div>
              <div className="space-y-2">
                {demoTree[side].map((r,i) => (
                  <div key={r.name} className="bg-[#0c0c0c] border border-white/[0.07] px-4 py-3 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white/40 border border-white/[0.15] flex-shrink-0">
                      {i+1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[12px]">{r.name}</div>
                      <div className="text-white/40 text-[11px]">{r.pkg} · {r.rank}</div>
                    </div>
                    <div className="text-right text-[10px] text-white/30">
                      <div>L{r.left} / R{r.right}</div>
                      <div className={r.status==='active'?'text-green-400':'text-yellow-400'}>{r.status}</div>
                    </div>
                  </div>
                ))}
                <button className="w-full border border-dashed border-white/[0.1] hover:border-red/50 text-white/20 hover:text-red/50 text-[11px] tracking-wider uppercase py-3 transition-all">
                  + Refer to {side} leg
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
