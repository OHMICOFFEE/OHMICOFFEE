'use client'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { fmt } from '@/lib/types'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, removeItem, total, count } = useCart()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/75 z-[900]" onClick={onClose} />}
      <div className={`fixed right-0 top-0 bottom-0 w-[400px] bg-[#0c0c0c] border-l border-white/[0.07] z-[901] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <h3 className="font-cond font-bold text-[1.2rem] tracking-[0.12em] uppercase">Your Bag ({count})</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl transition-colors">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!items.length ? (
            <div className="text-center py-16 text-white/20 text-[11px] tracking-[0.3em] uppercase">Your bag is empty</div>
          ) : items.map(item => (
            <div key={item.product.id + item.size} className="flex gap-3 py-4 border-b border-white/[0.07]">
              <div className="w-14 h-[72px] bg-[#141414] relative flex-shrink-0 overflow-hidden">
                {item.product.image_url && <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-cond font-bold text-[14px] uppercase tracking-[0.05em]">{item.product.name}</div>
                <div className="text-white/40 text-[11px] tracking-wider mt-[2px]">{item.size} · {item.grind}</div>
                {item.quantity > 1 && <div className="text-white/40 text-[11px]">Qty: {item.quantity}</div>}
                <div className="font-cond font-bold text-red text-[1rem] mt-1">{fmt(item.unit_price * item.quantity)}</div>
              </div>
              <button onClick={() => removeItem(item.product.id, item.size)}
                className="text-white/20 hover:text-red text-[11px] uppercase tracking-wider transition-colors self-start">Remove</button>
            </div>
          ))}
        </div>
        <div className="px-6 py-5 border-t border-white/[0.07]">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/25">Total</span>
            <span className="font-cond font-black text-[1.9rem]">{fmt(total)}</span>
          </div>
          <button className="w-full bg-red hover:bg-red-dark text-white font-cond font-bold text-[12px] tracking-[0.22em] uppercase py-4 transition-colors"
            onClick={() => alert('Checkout — iKhokha integration coming in Phase 2')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  )
}
