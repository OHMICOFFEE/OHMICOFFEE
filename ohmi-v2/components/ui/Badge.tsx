const variants = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  direct: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  residual: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  matching: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  left: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  right: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  processing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  submitted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  single_origin: 'bg-cream/5 text-cream-muted border-cream/10',
  infused: 'bg-crimson/10 text-crimson border-crimson/20',
}
export default function Badge({ status }: { status: string }) {
  const cls = (variants as any)[status] || 'bg-white/5 text-cream-muted/50 border-white/10'
  return (
    <span className={`inline-block text-[10px] tracking-[0.18em] uppercase px-2 py-[2px] border ${cls}`}>
      {status}
    </span>
  )
}
