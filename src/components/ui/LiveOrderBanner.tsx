import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, ChefHat, Package, Bike, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useLangStore } from '@/store/langStore'
import type { OrderRow } from '@/lib/supabase'

const ACTIVE_STATUSES: OrderRow['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'on_the_way']

const STEP_META: Partial<Record<OrderRow['status'], { icon: React.ElementType; de: string; en: string }>> = {
  pending:    { icon: Clock,   de: 'Empfangen',   en: 'Received'   },
  confirmed:  { icon: Check,   de: 'Bestätigt',   en: 'Confirmed'  },
  preparing:  { icon: ChefHat, de: 'Zubereitung', en: 'Preparing'  },
  ready:      { icon: Package, de: 'Bereit',       en: 'Ready'      },
  on_the_way: { icon: Bike,    de: 'Unterwegs',    en: 'On the way' },
}

export function LiveOrderBanner() {
  const { user }      = useAuth()
  const { lang }      = useLangStore()
  const de            = lang === 'de'
  const navigate      = useNavigate()
  const { pathname }  = useLocation()
  const [order, setOrder] = useState<OrderRow | null>(null)

  useEffect(() => {
    if (!user) { setOrder(null); return }

    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ACTIVE_STATUSES as string[])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setOrder(data as OrderRow | null))

    const ch = supabase.channel(`live-banner-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const updated = payload.new as OrderRow
        if ((ACTIVE_STATUSES as string[]).includes(updated.status)) {
          setOrder(updated)
        } else {
          setOrder(prev => prev?.id === updated.id ? null : prev)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [user])

  const visible = !!order && pathname !== '/orders'
  const meta       = order ? STEP_META[order.status] : null
  const StatusIcon = meta?.icon ?? Clock

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={order!.id + order!.status}
          initial={{ y: 16, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 16, opacity: 0, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          className="fixed bottom-[4.5rem] left-1/2 z-40 w-[calc(100%-2rem)] max-w-[calc(430px-2rem)]"
          style={{ transform: 'translateX(-50%)' }}
        >
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-ink/88 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/8 active:scale-[0.98] transition-transform"
          >
            {/* Icon with live dot */}
            <div className="relative flex-none">
              <div className="w-9 h-9 bg-wolt-base rounded-xl flex items-center justify-center">
                <StatusIcon className="w-4 h-4 text-white" />
              </div>
              <motion.span
                className="absolute -top-0.5 -right-0.5 block w-2.5 h-2.5 bg-emerald rounded-full border-2 border-[rgba(10,10,10,0.88)]"
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Labels */}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-bold text-white leading-snug truncate">
                {order!.restaurant_name}
              </p>
              <p className="text-[11px] text-white/55 leading-snug truncate">
                {de ? meta?.de : meta?.en}
              </p>
            </div>

            {/* Track CTA */}
            <div className="flex items-center gap-0.5 flex-none">
              <span className="text-xs text-white/50 font-medium">
                {de ? 'Verfolgen' : 'Track'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-white/35" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
