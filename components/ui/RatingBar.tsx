interface RatingBarProps {
  value: number   // 0-10
  label: string
  max?: number
  className?: string
}

export default function RatingBar({ value, label, max = 10, className = '' }: RatingBarProps) {
  const pct = (value / max) * 100
  const color =
    pct >= 80 ? 'bg-titan-green' :
    pct >= 60 ? 'bg-titan-accent' :
    pct >= 40 ? 'bg-titan-gold' :
    'bg-titan-muted'

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs text-titan-muted">{label}</span>
        <span className="text-xs font-semibold text-titan-text">{value}/{max}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
