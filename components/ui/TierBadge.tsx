import type { Tier } from '@/lib/types'

interface TierBadgeProps {
  tier: Tier
  className?: string
}

export default function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black text-white shadow-sm
        ${tier === 'S' ? 'tier-s' : tier === 'A' ? 'tier-a' : 'tier-b'} ${className}`}
    >
      {tier}
    </span>
  )
}
