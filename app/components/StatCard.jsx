export default function StatCard({ label, value, tone = 'text-ink', icon, hint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      {icon && (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xl text-soft" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className={`truncate text-2xl font-extrabold ${tone}`}>{value}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
    </div>
  )
}
