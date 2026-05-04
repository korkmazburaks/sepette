import { Home, ClipboardList, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

export function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const t = getT(lang)

  const tabs = [
    { icon: Home,          label: t.nav.home,   path: '/' },
    { icon: ClipboardList, label: t.nav.orders, path: '/orders' },
    { icon: User,          label: t.nav.profile,path: '/profile' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile glass-white z-40"
      style={{ height: 'calc(64px + var(--sab))', paddingBottom: 'var(--sab)' }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ icon: Icon, label, path }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-3"
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                active ? 'text-wolt-base' : 'text-fog',
              )} />
              <span className={cn(
                'text-[10px] font-medium transition-colors',
                active ? 'text-wolt-base' : 'text-fog',
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}