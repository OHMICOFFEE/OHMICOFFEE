'use client'
export default function Topbar({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="h-12 bg-ink border-b border-navy-border flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-[11px] tracking-[0.2em] uppercase text-cream-muted/50 font-medium">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}
