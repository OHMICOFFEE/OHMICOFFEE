'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Product, fmt } from '@/lib/types'
import { useCart } from '@/hooks/useCart'

export default function ProductModal({ product: p, onClose }: { product: Product; onClose: () => void }) {
  const [size, setSize] = useState<'250g'|'500g'|'1kg'>('250g')
  const [grind, setGrind] = useState('Whole Bean')
  const { addItem } = useCart()

  const priceMap = { '250g': p.price_250g, '500g': p.price_500g, '1kg': p.price_1kg }

  function handleAdd() {
    addItem({ product: p, size, grind, quantity: 1, unit_price: priceMap[size] })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/92 z-[800] flex items-end justify-stretch" onClick={onClose}>
      <div className="w-full bg-[#0c0c0c] border-t border-white/[0.07] grid grid-cols-2 max-h-[85vh]"
        onClick={e => e.stopPropagation()}>
        {/* Image */}
        <div className="relative min-h-[500px] bg-[#141414]">
          {p.image_url ? (
            <Image src={p.image_url} alt={p.name} fill className="object-cover object-top" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
          )}
          <button onClick={onClose}
            className="absolute top-4 right-4 bg-black/70 border border-white/[0.12] text-white w-9 h-9 flex items-center justify-center hover:border-red transition-colors z-10">
            ×
          </button>
        </div>
        {/* Content */}
        <div className="p-10 overflow-y-auto flex flex-col">
          <span className="bg-red text-white font-cond text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 w-fit mb-4">
            Cupping Score {p.sca_score}
          </span>
          <h2 className="font-cond font-black uppercase text-[2.8rem] leading-[0.88] mb-1">{p.name}</h2>
          <p className="text-red text-[10px] tracking-[0.25em] uppercase font-medium mb-5">
            {p.type === 'infused' ? 'Infused Single Origin' : 'Single Origin'} · 100% Arabica
          </p>
          {/* Specs */}
          <div className="grid grid-cols-2 gap-px bg-white/[0.06] mb-5">
            {[['Origin',p.origin],['Roast',p.roast],['Process',p.process],['MASL',p.masl],['Body',p.body],['Variety','Red Bourbon']].map(([l,v]) => (
              <div key={l} className="bg-[#141414] px-3 py-2">
                <div className="text-[9px] tracking-[0.18em] uppercase text-white/25 mb-[2px]">{l}</div>
                <div className="text-[12px] font-medium">{v}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-red font-bold mb-2">Tasting Notes</p>
          <p className="text-white/50 text-[12.5px] leading-[1.9] font-light mb-5">{p.tasting_notes}</p>
          {/* Size */}
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 mb-2">Select Weight</p>
          <div className="flex gap-2 mb-4">
            {(['250g','500g','1kg'] as const).map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`border font-cond font-bold text-[12px] tracking-[0.12em] px-4 py-2 transition-all ${size === s ? 'bg-red border-red text-white' : 'border-white/[0.12] text-white/50 hover:border-red hover:text-red'}`}>
                {s}<br/><span className="text-[10px] font-normal">{fmt(priceMap[s])}</span>
              </button>
            ))}
          </div>
          {/* Grind */}
          <p className="text-[9px] tracking-[0.25em] uppercase text-white/25 mb-2">Grind Preference</p>
          <select value={grind} onChange={e => setGrind(e.target.value)}
            className="bg-[#141414] border border-white/[0.1] text-white text-[12px] px-3 py-2 mb-6 w-full">
            {['Whole Bean','Coarse Grind','Medium Grind','Fine Grind'].map(g => <option key={g}>{g}</option>)}
          </select>
          <div className="flex items-center gap-4 mt-auto">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-white/25">Price</div>
              <div className="font-cond font-black text-[2rem] leading-none">{fmt(priceMap[size])}</div>
            </div>
            <button onClick={handleAdd} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.22em] uppercase px-6 py-3 transition-colors">
              Add to Bag
            </button>
            <button onClick={handleAdd} className="border border-white/20 hover:border-red text-white font-cond font-bold text-[12px] tracking-[0.22em] uppercase px-5 py-3 transition-all hover:text-red">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
