export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  return (
    <div className={`font-display font-bold tracking-[0.15em] uppercase ${sizes[size]}`}>
      <span className="text-cream">OHMI</span>
      <span className="text-crimson mx-2">·</span>
      <span className="text-cream/40 font-light">Coffee Co.</span>
    </div>
  )
}
