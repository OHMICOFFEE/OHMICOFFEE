'use client'
export default function Marquee({ text }: { text: string }) {
  const raw = text || 'Brew Good · Do Good · From Our Cup To Their Cup · 255 Meals Served · Single Origin · Specialty Coffee'
  const items = raw.split('·').map(t => t.trim())
  const doubled = [...items, ...items]
  return (
    <div className="bg-red overflow-hidden py-[7px] relative z-50 select-none">
      <div className="marquee-track flex whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="font-cond text-white text-[11px] font-bold tracking-[0.3em] uppercase px-8">
            {item} <span className="mx-6 opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
