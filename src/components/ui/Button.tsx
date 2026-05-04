import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-95 select-none',
        variant === 'primary' && 'bg-wolt-base text-white shadow-wolt hover:bg-wolt-deep',
        variant === 'ghost'   && 'bg-transparent text-wolt-base hover:bg-wolt-light',
        variant === 'outline' && 'border border-cloud text-ink hover:bg-mist',
        size === 'sm' && 'px-3 py-2 text-sm',
        size === 'md' && 'px-5 py-3 text-base',
        size === 'lg' && 'px-6 py-4 text-lg w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}