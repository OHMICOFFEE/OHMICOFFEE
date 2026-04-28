export default function Stat({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className="bg-navy-light border border-navy-border p-5">
      <div className="text-[10px] tracking-[0.3em] uppercase text-cream-muted/50 mb-2">{label}</div>
      <div className={`font-display text-3xl font-light leading-none ${accent ? 'text-crimson' : 'text-cream'}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-cream-muted/30 mt-2">{sub}</div>}
    </div>
  )
}
