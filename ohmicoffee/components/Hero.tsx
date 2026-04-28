'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'

export default function Hero({ products, meals }: { products: Product[], meals: number }) {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)
  const featured = products.filter(p => p.image_url)

  useEffect(() => {
    if (!featured.length) return
    const t = setInterval(() => {
      setFade(false)
      setTimeout(() => { setIdx(i => (i + 1) % featured.length); setFade(true) }, 350)
    }, 4500)
    return () => clearInterval(t)
  }, [featured.length])

  const current = featured[idx]

  return (
    <section className="min-h-screen grid grid-cols-2 relative overflow-hidden">
      {/* Left */}
      <div className="flex flex-col justify-end pb-20 pl-10 pr-6 pt-28 relative z-10">
        <p className="font-cond text-[11px] tracking-[0.5em] uppercase text-red font-bold mb-5">
          Brew Good · Do Good · South Africa
        </p>
        <h1 className="font-cond font-black uppercase leading-[0.83] text-[8.5rem] tracking-[-0.01em] mb-5">
          OHMI<br/><span className="text-red text-[10rem]">COFFEE</span>
        </h1>
        {/* Meals chip */}
        <div className="flex items-stretch overflow-hidden mb-6 w-fit">
          <div className="bg-white text-black font-cond font-black text-[1rem] tracking-[0.15em] uppercase px-4 py-2 flex items-center">
            OHMI
          </div>
          <div className="bg-red px-6 py-2 flex flex-col justify-center">
            <div className="font-cond font-black text-[2.2rem] text-white leading-none">{meals}</div>
            <div className="text-[9px] tracking-[0.25em] uppercase text-white/65 font-medium">Meals Served</div>
          </div>
        </div>
        <p className="text-white/50 text-[12.5px] leading-[2] font-light max-w-[380px] mb-8">
          With every bag of coffee purchased, OHMI provides food to children in need. Single Origin Specialty Coffee — sourced with purpose, roasted with precision.
        </p>
        <div className="flex gap-3">
          <Link href="/shop" className="bg-white text-black font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-8 py-3 hover:opacity-90 transition-opacity">
            Shop Now
          </Link>
          <Link href="/coffees" className="border border-white/25 text-white font-cond font-bold text-[12px] tracking-[0.25em] uppercase px-7 py-3 hover:border-red hover:text-red transition-all">
            Our Coffees
          </Link>
        </div>
      </div>
      {/* Right — product image */}
      <div className="relative overflow-hidden bg-[#0c0c0c]">
        {current?.image_url ? (
          <Image
            src={current.image_url}
            alt={current.name}
            fill
            className={`object-cover object-center transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        {/* SCA badge */}
        <div className="absolute bottom-8 right-8 w-[84px] h-[84px] border border-white/15 rounded-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="font-cond font-black text-[1.4rem] text-red leading-none">SCA</div>
          <div className="text-[9px] tracking-[0.2em] uppercase text-white/40 leading-tight text-center mt-1">Up to<br/>Score 89</div>
        </div>
      </div>
      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.07]" />
    </section>
  )
}
