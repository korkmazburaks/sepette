import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingBadgeProps {
  rating: number
  reviewCount?: number
  className?: string
}

export function RatingBadge({ rating, reviewCount, className }: RatingBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Star className="w-3.5 h-3.5 fill-amber text-amber" />
      <span className="text-sm font-semibold text-ink">{rating.toFixed(1)}</span>
      {reviewCount != null && (
        <span className="text-xs text-fog">({reviewCount})</span>
      )}
    </span>
  )
}