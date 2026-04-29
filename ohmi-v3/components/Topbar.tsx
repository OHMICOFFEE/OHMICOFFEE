export default function Topbar({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>
      {action}
    </div>
  )
}
