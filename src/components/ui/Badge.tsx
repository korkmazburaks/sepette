import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variant === 'default' && 'bg-wolt-light text-wolt-deep',
      variant === 'success' && 'bg-emerald/10 text-emerald',
      variant === 'warning' && 'bg-amber/10 text-amber',
      variant === 'error'   && 'bg-coral/10 text-coral',
      className,
    )}>
      {children}
    </span>
  )
}