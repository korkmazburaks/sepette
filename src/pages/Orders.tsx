import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, RefreshCw, Check, Clock, Bike, Package, ChefHat,
  CalendarClock, Star, ChevronRight, X, ShoppingBag, MapPin, MessageCircle,
  Zap, Utensils, ThumbsUp,
} from 'lucide-react'
import { FALLBACK_RESTAURANTS } from '@/data/fallback'
import { StarRowInteractive } from '@/components/restaurant/ReviewsSection'
import { Button } from '@/components/ui/Button'
import { useLangStore } from '@/store/langStore'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import type { OrderRow } from '@/lib/supabase'
import { sendNotification, type NotifEvent } from '@/hooks/useNotifications'
import { useCartStore } from '@/store/cartStore'
import type { MenuItem } from '@/types'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 26, stiffness: 300 } },
  exit:    { opacity: 0, y: 12, transition: { duration: 0.15 } },
}

const sheetVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { type: 'spring' as const, damping: 30, stiffness: 320 } },
  exit:    { y: '100%', transition: { duration: 0.22 } },
}

type ActiveStatus = 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered'

const STEPS: { key: ActiveStatus; icon: React.ElementType; de: string; en: string }[] = [
  { key: 'confirmed',  icon: Check,    de: 'Bestätigt',   en: 'Confirmed' },
  { key: 'preparing',  icon: ChefHat,  de: 'Zubereitung', en: 'Preparing' },
  { key: 'ready',      icon: Package,  de: 'Bereit',      en: 'Ready' },
  { key: 'on_the_way', icon: Bike,     de: 'Unterwegs',   en: 'On the way' },
  { key: 'delivered',  icon: Check,    de: 'Geliefert',   en: 'Delivered' },
]

const ACTIVE_STATUSES: OrderRow['status'][] = ['scheduled', 'confirmed', 'preparing', 'ready', 'on_the_way']

function fmt(iso: string, de: boolean) {
  return new Date(iso).toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const REVIEW_CRITERIA = [
  { key: 'speed',   Icon: Zap,      de: 'Lieferzeit', en: 'Speed'   },
  { key: 'taste',   Icon: Utensils, de: 'Geschmack',  en: 'Taste'   },
  { key: 'service', Icon: ThumbsUp, de: 'Service',    en: 'Service' },
] as const

/* ── Review Sheet ── */
function ReviewSheet({
  order, de, onClose,
}: { order: OrderRow; de: boolean; onClose: () => void }) {
  const [ratings, setRatings] = useState({ speed: 0, taste: 0, service: 0 })
  const [comment,   setComment]   = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (!done) return
    const t = setTimeout(onClose, 1800)
    return () => clearTimeout(t)
  }, [done])

  async function submit() {
    const allSet = REVIEW_CRITERIA.every(c => ratings[c.key] > 0)
    if (!allSet) { setError(de ? 'Bitte alle Kategorien bewerten.' : 'Please rate all categories.'); return }
    setSaving(true)
    const avg = Math.round((ratings.speed + ratings.taste + ratings.service) / 3)
    const displayName = anonymous
      ? null
      : (user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? null)
    await supabase.from('reviews').insert({
      order_id:        order.id,
      user_id:         anonymous ? null : (user?.id ?? null),
      restaurant_name: order.restaurant_name,
      rating:          avg,
      comment:         comment.trim() || null,
      reviewer_name:   displayName,
      anonymous:       anonymous || !user,
      speed_rating:    ratings.speed,
      taste_rating:    ratings.taste,
      service_rating:  ratings.service,
    })
    setSaving(false)
    setDone(true)
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[69] bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-[70] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-canvas rounded-t-3xl pt-3 pb-safe pointer-events-auto max-h-[88dvh] overflow-y-auto"
          variants={sheetVariants} initial="hidden" animate="visible" exit="exit"
        >
          <div className="w-10 h-1 bg-cloud rounded-full mx-auto mb-4" />
          <div className="px-5 pb-6">
            {done ? (
              <div className="flex flex-col items-center py-8 text-center gap-3">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                  className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-emerald" />
                </motion.div>
                <p className="font-bold text-ink text-lg">
                  {de ? 'Danke für deine Bewertung!' : 'Thanks for your review!'}
                </p>
                <p className="text-sm text-fog">
                  {de ? 'Deine Bewertung ist jetzt sichtbar.' : 'Your review is now visible.'}
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-ink text-lg text-center mb-1">
                  {de ? 'Restaurant bewerten' : 'Rate restaurant'}
                </h3>
                <p className="text-sm text-fog text-center mb-5">{order.restaurant_name}</p>

                <div className="space-y-4 mb-4">
                  {REVIEW_CRITERIA.map(({ key, Icon, de: deLabel, en: enLabel }) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 w-24 flex-none">
                        <Icon className="w-4 h-4 text-wolt-base flex-none" />
                        <span className="text-sm text-ink">{de ? deLabel : enLabel}</span>
                      </div>
                      <StarRowInteractive
                        value={ratings[key]}
                        onChange={(v) => { setRatings(r => ({ ...r, [key]: v })); setError('') }}
                        size="lg"
                      />
                    </div>
                  ))}
                </div>

                {error && <p className="text-xs text-coral mb-3">{error}</p>}

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={de ? 'Kommentar (optional)' : 'Comment (optional)'}
                  rows={3}
                  className="w-full bg-mist rounded-2xl px-4 py-3 text-sm text-ink placeholder:text-fog resize-none outline-none mb-3"
                />

                <button
                  type="button"
                  onClick={() => setAnonymous(a => !a)}
                  className="flex items-center gap-2.5 w-full mb-1"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-none ${
                    anonymous ? 'bg-wolt-base border-wolt-base' : 'border-cloud'
                  }`}>
                    {anonymous && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-ink">{de ? 'Anonym senden' : 'Post anonymously'}</span>
                </button>
                <p className="text-xs text-fog mb-4 pl-7">
                  {anonymous || !user
                    ? (de ? 'Wird anonym veröffentlicht' : 'Will be posted anonymously')
                    : <>{de ? 'Als ' : 'As '}<span className="font-semibold text-ink">{user?.user_metadata?.full_name ?? user?.email?.split('@')[0]}</span></>
                  }
                </p>

                <Button
                  onClick={submit}
                  disabled={saving}
                  className="w-full"
                >
                  {saving
                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                    : (de ? 'Bewertung absenden' : 'Submit review')
                  }
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ── Order Detail Modal ── */
function OrderDetailModal({
  order, de, onClose, onReview, onOrderAgain,
}: {
  order: OrderRow; de: boolean
  onClose: () => void
  onReview: () => void
  onOrderAgain: () => void
}) {
  const items     = Array.isArray(order.items) ? order.items : []
  const delivered = order.status === 'delivered'
  const cancelled = order.status === 'cancelled'

  const restaurant = FALLBACK_RESTAURANTS.find(
    r => r.name === order.restaurant_name || r.slug === order.restaurant_name
  )
  const restaurantAddress = restaurant?.address

  const statusLabel = () => {
    if (delivered) return de ? 'Geliefert' : 'Delivered'
    if (cancelled) return de ? 'Storniert' : 'Cancelled'
    const map: Record<string, string> = {
      scheduled: de ? 'Wartet auf Bestätigung' : 'Awaiting confirmation',
      confirmed: de ? 'Bestätigt' : 'Confirmed',
      preparing: de ? 'In Zubereitung' : 'Preparing',
      ready:     de ? 'Bereit' : 'Ready',
      on_the_way:de ? 'Unterwegs' : 'On the way',
    }
    return map[order.status] ?? order.status
  }
  const statusColor = delivered
    ? 'text-emerald bg-emerald/10'
    : cancelled
      ? 'text-coral bg-coral/10'
      : 'text-wolt-base bg-wolt-light'

  const openMap = (addr: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank')
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 z-[69] bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-[70] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-canvas rounded-t-3xl pointer-events-auto max-h-[88dvh] flex flex-col"
          variants={sheetVariants} initial="hidden" animate="visible" exit="exit"
        >
          {/* Handle + close */}
          <div className="pt-3 px-5 pb-4 border-b border-cloud flex-none">
            <div className="w-10 h-1 bg-cloud rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink text-lg">{de ? 'Bestelldetails' : 'Order details'}</h3>
              <button onClick={onClose} className="w-8 h-8 bg-mist rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {/* Meta */}
            <div className="bg-mist rounded-2xl px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-fog">{de ? 'Restaurant' : 'Restaurant'}</span>
                <span className="font-medium text-ink">{order.restaurant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fog">{de ? 'Datum' : 'Date'}</span>
                <span className="text-ink">{fmt(order.created_at, de)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fog">{de ? 'Uhrzeit' : 'Time'}</span>
                <span className="text-ink">{fmtTime(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fog">{de ? 'Bestellnr.' : 'Order No.'}</span>
                <span className="text-ink font-mono text-xs">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-fog">Status</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
                  {statusLabel()}
                </span>
              </div>
              {order.address && (
                <div className="flex justify-between gap-4">
                  <span className="text-fog flex-none">{de ? 'Lieferadresse' : 'Delivery address'}</span>
                  <span className="text-ink text-right text-xs leading-snug">{order.address}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-mist rounded-2xl overflow-hidden">
              <p className="px-4 pt-3 pb-2 text-xs font-semibold text-fog uppercase tracking-wide">
                {de ? 'Artikel' : 'Items'}
              </p>
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 border-t border-cloud/60">
                  <span className="text-sm text-ink">{item.qty}× {item.name}</span>
                  <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3 border-t border-cloud font-bold text-ink">
                <span>{de ? 'Gesamt' : 'Total'}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Restaurant address + map */}
            {restaurantAddress && (
              <div className="bg-mist rounded-2xl px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-fog uppercase tracking-wide">
                  {de ? 'Restaurantadresse' : 'Restaurant address'}
                </p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-wolt-base flex-none mt-0.5" />
                  <p className="text-sm text-ink leading-snug">{restaurantAddress}</p>
                </div>
                <button
                  onClick={() => openMap(restaurantAddress)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-wolt-light text-wolt-base text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  <MapPin className="w-4 h-4" />
                  {de ? 'Auf Karte anzeigen' : 'Show on map'}
                </button>
              </div>
            )}

            {/* Contact / Problem */}
            <div className="bg-mist rounded-2xl px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-fog uppercase tracking-wide">
                {de ? 'Hilfe' : 'Help'}
              </p>
              <p className="text-sm text-fog leading-snug">
                {de
                  ? 'Problem mit deiner Bestellung? Wir helfen dir gerne.'
                  : 'Problem with your order? We\'re happy to help.'}
              </p>
              <button
                onClick={() => window.open('mailto:support@sepette.de?subject=' + encodeURIComponent(`Order #${order.id.slice(0,8).toUpperCase()}`))}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-canvas border border-cloud text-ink text-sm font-medium active:scale-[0.98] transition-transform"
              >
                <MessageCircle className="w-4 h-4 text-wolt-base" />
                {de ? 'Kontakt aufnehmen' : 'Contact us'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-safe pt-3 border-t border-cloud flex-none space-y-2.5">
            {!cancelled && (
              <button
                onClick={onReview}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber/10 text-amber font-semibold text-sm active:scale-[0.98] transition-transform"
              >
                <Star className="w-4 h-4" />
                {de ? 'Restaurant bewerten' : 'Rate restaurant'}
              </button>
            )}
            <button
              onClick={onOrderAgain}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-wolt-base text-white font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              <ShoppingBag className="w-4 h-4" />
              {de ? 'Nochmal bestellen' : 'Order again'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

/* ── Tracking Card ── */
function TrackingCard({
  order, de, onConfirmDelivered, onOpen,
}: {
  order: OrderRow; de: boolean
  onConfirmDelivered: (id: string) => void
  onOpen: () => void
}) {
  const isScheduled = order.status === 'scheduled'
  const isCancelled = order.status === 'cancelled'
  const isOnTheWay  = order.status === 'on_the_way'
  const stepIdx     = STEPS.findIndex(s => s.key === order.status)
  const items       = Array.isArray(order.items) ? order.items : []

  return (
    <div className="bg-canvas rounded-3xl overflow-hidden shadow-card">
      <button onClick={onOpen} className="w-full text-left">
        <div className="px-4 pt-4 pb-3 border-b border-cloud">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-ink">{order.restaurant_name}</p>
              <p className="text-xs text-fog mt-0.5">
                {fmt(order.created_at, de)} · {items.map(i => `${i.qty}× ${i.name}`).join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-ink text-sm flex-none">{formatPrice(order.total)}</span>
              <ChevronRight className="w-4 h-4 text-fog" />
            </div>
          </div>
        </div>
      </button>

      <div className="px-4 py-4">
        {isCancelled ? (
          <div className="flex items-center gap-2 text-sm text-coral font-medium">
            <span className="w-5 h-5 rounded-full bg-coral/10 flex items-center justify-center text-xs">✕</span>
            {de ? 'Bestellung storniert' : 'Order cancelled'}
          </div>
        ) : isScheduled ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-wolt-light flex items-center justify-center flex-none">
              <CalendarClock className="w-4 h-4 text-wolt-base" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{de ? 'Vorbestellung' : 'Pre-order'}</p>
              <p className="text-xs text-fog">
                {order.scheduled_for
                  ? `${de ? 'Lieferung um' : 'Delivery at'} ${fmtTime(order.scheduled_for)}`
                  : de ? 'Wartet auf Bestätigung' : 'Waiting for confirmation'}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-cloud" style={{ zIndex: 0 }} />
            <div
              className="absolute top-4 left-4 h-0.5 bg-wolt-base transition-all duration-700"
              style={{ zIndex: 0, width: stepIdx > 0 ? `${(stepIdx / (STEPS.length - 1)) * (100 - 8)}%` : '0%' }}
            />
            <div className="relative flex justify-between" style={{ zIndex: 1 }}>
              {STEPS.map((step, i) => {
                const done    = i < stepIdx
                const current = i === stepIdx
                const Icon    = step.icon
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1.5" style={{ width: '20%' }}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      done    ? 'bg-wolt-base'
                      : current ? 'bg-wolt-base ring-4 ring-wolt-base/20'
                      : 'bg-cloud'
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${done || current ? 'text-white' : 'text-fog'}`} />
                    </div>
                    <span className={`text-[9px] text-center leading-tight ${
                      current ? 'text-wolt-base font-semibold' : done ? 'text-ink' : 'text-fog'
                    }`}>
                      {de ? step.de : step.en}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {order.estimated_minutes != null && !isCancelled && order.status !== 'delivered' && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-fog">
            <Clock className="w-3.5 h-3.5" />
            {de ? `Geschätzte Lieferzeit: ${order.estimated_minutes} Min.` : `Est. delivery: ${order.estimated_minutes} min`}
          </div>
        )}

        {isOnTheWay && (
          <button
            onClick={() => onConfirmDelivered(order.id)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald/10 text-emerald font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <Check className="w-4 h-4" />
            {de ? 'Essen erhalten ✓' : 'Food received ✓'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── History Card ── */
function HistoryCard({
  order, de, onClick,
}: { order: OrderRow; de: boolean; onClick: () => void }) {
  const items     = Array.isArray(order.items) ? order.items : []
  const delivered = order.status === 'delivered'
  return (
    <button onClick={onClick} className="w-full text-left bg-canvas rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm text-ink">{order.restaurant_name}</p>
          <p className="text-xs text-fog">{fmt(order.created_at, de)} · {fmtTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-xl flex-none ${
            delivered ? 'bg-emerald/10 text-emerald' : 'bg-coral/10 text-coral'
          }`}>
            {delivered ? (de ? 'Geliefert' : 'Delivered') : (de ? 'Storniert' : 'Cancelled')}
          </span>
          <ChevronRight className="w-4 h-4 text-fog" />
        </div>
      </div>
      <p className="text-xs text-slate line-clamp-1 mb-2">
        {items.map(i => `${i.qty}× ${i.name}`).join(', ')}
      </p>
      <div className="flex justify-between items-center pt-2 border-t border-cloud">
        <span className="font-bold text-sm text-ink">{formatPrice(order.total)}</span>
        <span className="text-[10px] text-fog">#{order.id.slice(0, 8).toUpperCase()}</span>
      </div>
    </button>
  )
}

/* ── Page ── */
export function Orders() {
  const navigate  = useNavigate()
  const { lang }  = useLangStore()
  const de        = lang === 'de'
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders]     = useState<OrderRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [detail, setDetail]     = useState<OrderRow | null>(null)
  const [reviewing, setReviewing] = useState<OrderRow | null>(null)
  const addItem = useCartStore(s => s.addItem)

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders((data as OrderRow[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('my-orders')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const updated = payload.new as OrderRow
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
        setDetail(prev => prev?.id === updated.id ? updated : prev)

        const statusEventMap: Partial<Record<OrderRow['status'], NotifEvent>> = {
          confirmed:  'order_confirmed',
          preparing:  'order_preparing',
          ready:      'order_ready',
          on_the_way: 'order_on_the_way',
          delivered:  'order_delivered',
          cancelled:  'order_cancelled',
        }
        const event = statusEventMap[updated.status]
        if (event) sendNotification(event, updated.restaurant_name)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user])

  async function confirmDelivered(orderId: string) {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' as const } : o))
  }

  function handleOrderAgain(order: OrderRow) {
    const items = Array.isArray(order.items) ? order.items : []
    items.forEach(item => {
      const menuItem: MenuItem = {
        id: crypto.randomUUID(),
        name: item.name,
        price: item.price,
      }
      for (let q = 0; q < (item.qty ?? 1); q++) {
        addItem(menuItem, '', true)
      }
    })
    setDetail(null)
    navigate('/')
  }

  const active  = orders.filter(o => ACTIVE_STATUSES.includes(o.status))
  const history = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled')

  if (authLoading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <RefreshCw className="w-6 h-6 text-wolt-base animate-spin" />
    </div>
  )

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-dvh">
      <div className="pt-safe px-4 pb-3 bg-snow sticky top-0 z-30 border-b border-cloud flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">{de ? 'Bestellungen' : 'Orders'}</h1>
        {user && (
          <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-full bg-mist">
            <RefreshCw className={`w-4 h-4 text-fog ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <div className="px-4 pt-4 mb-nav">
        {!user ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-wolt-light rounded-full flex items-center justify-center mb-5">
              <ClipboardList className="w-9 h-9 text-wolt-base" />
            </div>
            <h3 className="font-bold text-ink text-lg mb-2">{de ? 'Anmeldung erforderlich' : 'Sign in required'}</h3>
            <p className="text-sm text-fog mb-6 max-w-xs">
              {de ? 'Melde dich an, um deine Bestellungen zu verfolgen.' : 'Sign in to track your orders.'}
            </p>
            <Button onClick={() => navigate('/profile')}>{de ? 'Zum Profil' : 'Go to Profile'}</Button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            <div className="h-32 bg-canvas rounded-3xl animate-pulse shadow-card" />
            <div className="h-20 bg-canvas rounded-2xl animate-pulse shadow-card" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 bg-wolt-light rounded-full flex items-center justify-center mb-5">
              <ClipboardList className="w-9 h-9 text-wolt-base" />
            </div>
            <h3 className="font-bold text-ink text-lg mb-2">{de ? 'Noch keine Bestellungen' : 'No orders yet'}</h3>
            <Button onClick={() => navigate('/')}>{de ? 'Restaurants entdecken' : 'Discover restaurants'}</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
                  {de ? 'Aktive Bestellungen' : 'Active orders'} · {active.length}
                </p>
                <div className="space-y-3">
                  {active.map(o => (
                    <TrackingCard
                      key={o.id}
                      order={o}
                      de={de}
                      onConfirmDelivered={confirmDelivered}
                      onOpen={() => setDetail(o)}
                    />
                  ))}
                </div>
              </section>
            )}
            {history.length > 0 && (
              <section>
                <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
                  {de ? 'Verlauf' : 'History'} · {history.length}
                </p>
                <div className="space-y-2">
                  {history.map(o => (
                    <HistoryCard key={o.id} order={o} de={de} onClick={() => setDetail(o)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {detail && (
          <OrderDetailModal
            key="detail"
            order={detail}
            de={de}
            onClose={() => setDetail(null)}
            onReview={() => { setReviewing(detail); setDetail(null) }}
            onOrderAgain={() => handleOrderAgain(detail)}
          />
        )}
        {reviewing && (
          <ReviewSheet
            key="review"
            order={reviewing}
            de={de}
            onClose={() => setReviewing(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}