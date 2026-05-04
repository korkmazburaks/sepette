import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-mist rounded-xl', className)} />
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className="bg-canvas rounded-3xl overflow-hidden shadow-card">
      <Skeleton className="h-44 rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}