export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-navy-border overflow-hidden">
      <table className="w-full">{children}</table>
    </div>
  )
}
export function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-[10px] tracking-[0.25em] uppercase text-cream-muted/30 font-medium border-b border-navy-border">{children}</th>
}
export function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-[13px] border-b border-navy-border/50 ${className}`}>{children}</td>
}
export function Tr({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <tr onClick={onClick} className={onClick ? 'cursor-pointer hover:bg-white/[0.015]' : 'hover:bg-white/[0.01]'}>{children}</tr>
}
