'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Product, fmt } from '@/lib/types'
import ProductModal from './ProductModal'

export default function CollectionGrid({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null)
  return (
    <>
      {/* Intro */}
      <div className="grid grid-cols-2 gap-20 px-10 py-20 border-b border-white/[0.07]">
        <div>
          <p className="font-cond text-[11px] tracking-[0.45em] uppercase text-red font-bold mb-4">The Collection</p>
          <h2 className="font-cond font-black uppercase text-[4.5rem] leading-[0.88]">10 ORIGINS.<br/>ONE MISSION.</h2>
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-white/45 text-[13px] leading-[2.1] font-light mb-6">
            We conducted blind tastings comparing over two dozen varieties against South Africa's finest. Only these ten passed. Each with a story, an altitude, and a cupping score to prove it.
          </p>
          <div className="flex gap-10 pt-5 border-t border-white/[0.07]">
            {[['10','Coffees'],['100%','Arabica'],['20%','To Charity'],['255+','Meals Served']].map(([n,l]) => (
              <div key={l}>
                <div className="font-cond font-black text-[2.2rem] leading-none">{n}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Grid */}
      <div className="border-b border-white/[0.07]">
        {[0,3,6].map(start => (
          <div key={start} className="grid grid-cols-3 border-b border-white/[0.07] last:border-b-0">
            {products.slice(start, start+3).map(p => (
              <div key={p.id} onClick={() => setSelected(p)}
                className="group border-r border-white/[0.07] last:border-r-0 cursor-pointer overflow-hidden">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0c0c0c]">
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] to-[#050505]" />
                  )}
                  <div className="absolute top-0 left-0 bg-red text-white font-cond text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-[4px]">
                    SCA {p.sca_score}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/55 text-[10px] tracking-[0.18em] uppercase px-2 py-1">
                    {p.type === 'infused' ? 'Infused' : 'Single Origin'}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="font-cond font-black text-[1.65rem] uppercase leading-[0.9] mb-1">{p.name}</div>
                  <div className="text-red text-[10px] tracking-[0.2em] uppercase font-medium mb-2">{p.origin} · {p.roast}</div>
                  <p className="text-white/40 text-[12px] leading-[1.75] font-light mb-4 line-clamp-2">{p.tasting_notes}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[9px] tracking-[0.15em] uppercase text-white/25">From</div>
                      <div className="font-cond font-bold text-[1.3rem]">{fmt(p.price_250g)}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setSelected(p) }}
                      className="bg-red hover:bg-red-dark w-8 h-8 flex items-center justify-center text-white text-xl transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
