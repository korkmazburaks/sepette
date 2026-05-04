import { useSettingsStore } from '@/store/settingsStore'
import { useLangStore } from '@/store/langStore'

export type NotifEvent =
  | 'order_placed'
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_ready'
  | 'order_on_the_way'
  | 'order_delivered'
  | 'order_cancelled'

const NOTIF_CONFIG: Record<NotifEvent, { title: (de: boolean) => string; body: (de: boolean, name: string) => string; icon: string }> = {
  order_placed:     { icon: '🛒', title: de => de ? 'Bestellung aufgegeben!' : 'Order placed!',      body: (de, n) => de ? `Deine Bestellung bei ${n} wurde aufgegeben.`         : `Your order at ${n} was placed.` },
  order_confirmed:  { icon: '✅', title: de => de ? 'Bestellung bestätigt'   : 'Order confirmed',    body: (de, n) => de ? `${n} hat deine Bestellung bestätigt.`                : `${n} confirmed your order.` },
  order_preparing:  { icon: '👨‍🍳', title: de => de ? 'Wird zubereitet'      : 'Being prepared',     body: (de, n) => de ? `${n} bereitet deine Bestellung jetzt zu.`            : `${n} is now preparing your order.` },
  order_ready:      { icon: '📦', title: de => de ? 'Bestellung bereit'      : 'Order ready',        body: (de, n) => de ? `Deine Bestellung bei ${n} ist bereit.`               : `Your order at ${n} is ready.` },
  order_on_the_way: { icon: '🛵', title: de => de ? 'Unterwegs!'             : 'On the way!',        body: (de, _n) => de ? 'Dein Fahrer ist auf dem Weg zu dir.'                : 'Your driver is on the way.' },
  order_delivered:  { icon: '🎉', title: de => de ? 'Geliefert!'             : 'Delivered!',         body: (de, n) => de ? `Guten Appetit! Deine Bestellung von ${n} ist angekommen.` : `Enjoy! Your order from ${n} has arrived.` },
  order_cancelled:  { icon: '❌', title: de => de ? 'Bestellung storniert'   : 'Order cancelled',    body: (de, n) => de ? `Deine Bestellung bei ${n} wurde storniert.`          : `Your order at ${n} was cancelled.` },
}

export function sendNotification(event: NotifEvent, restaurantName?: string) {
  const { notifications } = useSettingsStore.getState()
  if (!notifications) return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const de = useLangStore.getState().lang === 'de'
  const cfg = NOTIF_CONFIG[event]
  const name = restaurantName ?? 'Restaurant'

  try {
    new Notification(`${cfg.icon}  ${cfg.title(de)}`, {
      body:  cfg.body(de, name),
      icon:  '/favicon.ico',
      badge: '/favicon.ico',
      tag:   event,
    })
  } catch {
    // incognito veya izin kısıtlaması
  }
}