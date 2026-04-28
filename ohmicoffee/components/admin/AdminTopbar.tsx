'use client'
export default function AdminTopbar({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="h-12 bg-[#0c0c0c] border-b border-white/[0.07] flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-[12px] font-bold tracking-[0.08em]">{title}</h1>
      <div className="flex items-center gap-2">
        <input placeholder="Search..." className="bg-[#141414] border border-white/[0.08] text-white/60 text-[11px] px-3 py-1 w-44 placeholder:text-white/20" />
        {action && (
          <button onClick={action.onClick} className="bg-red hover:bg-red-dark text-white font-cond font-bold text-[11px] tracking-[0.1em] px-4 py-[6px] transition-colors">
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
