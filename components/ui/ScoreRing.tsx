interface ScoreRingProps {
  score: number   // 0-100
  size?: number
  label?: string
  className?: string
}

export default function ScoreRing({ score, size = 64, label, className = '' }: ScoreRingProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color =
    score >= 80 ? '#00C853' :
    score >= 60 ? '#FF5722' :
    score >= 40 ? '#FFB300' :
    '#FF1744'

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#23232E"
            strokeWidth={4}
          />
          {/* Score ring */}
          <circle
            className="score-ring"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-titan-text" style={{ fontSize: size < 56 ? '10px' : '14px' }}>
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-2xs text-titan-muted uppercase tracking-widest text-center leading-tight">
          {label}
        </span>
      )}
    </div>
  )
}
