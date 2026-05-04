interface MobileShellProps {
  children: React.ReactNode
}

export function MobileShell({ children }: MobileShellProps) {
  return (
    <div className="min-h-dvh bg-snow relative mx-auto max-w-mobile overflow-x-hidden">
      {children}
    </div>
  )
}