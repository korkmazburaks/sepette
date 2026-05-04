import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Check, ChevronRight, CalendarClock, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { CartItem } from './CartItem'
import { formatPrice } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { useSettingsStore } from '@/store/settingsStore'
import { useOrders } from '@/hooks/useOrders'
import { sendNotification } from '@/hooks/useNotifications'

const SLOT_MINS = [30, 60, 120, 180, 240]

function addMinutes(mins: number): string {
  const d = new Date(Date.now() + mins * 60000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-fog mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-mist rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-fog/60 outline-none focus:ring-2 focus:ring-wolt-base/30"
      />
    </div>
  )
}

export function CartSheet() {
  const { isSheetOpen, closeSheet, items, totalPrice, restaurantId, restaurantName, restaurantIsOpen, clearCart } = useCartStore()
  const { lang } = useLangStore()
  const t = getT(lang)
  const constraintsRef = useRef(null)
  const { user } = useAuth()
  const { activeAddress } = useSettingsStore()
  const { placeOrder } = useOrders(user)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [ordering, setOrdering] = useState(false)
  const [success, setSuccess] = useState(false)

  // Guest fields
  const [guestFirstName, setGuestFirstName] = useState('')
  const [guestLastName,  setGuestLastName]  = useState('')
  const [guestPhone,     setGuestPhone]     = useState('')
  const [guestAddress,   setGuestAddress]   = useState('')

  const subtotal = totalPrice()
  const de = lang === 'de'

  const isGuest = !user
  const guestValid = !isGuest || (
    guestFirstName.trim().length > 0 &&
    guestLastName.trim().length > 0 &&
    guestPhone.trim().length > 0 &&
    guestAddress.trim().length > 0
  )

  const slotLabel = (mins: number) => {
    if (mins === 30)  return de ? 'In 30 Min' : 'In 30 min'
    if (mins === 60)  return de ? 'In 1 Std' : 'In 1 hr'
    if (mins === 120) return de ? 'In 2 Std' : 'In 2 hrs'
    if (mins === 180) return de ? 'In 3 Std' : 'In 3 hrs'
    return de ? 'In 4 Std' : 'In 4 hrs'
  }

  const deliveryAddress = isGuest
    ? guestAddress.trim()
    : (activeAddress || (de ? 'Keine Adresse' : 'No address'))

  const handleOrder = async () => {
    if (ordering || !guestValid) return
    setOrdering(true)
    const rname = restaurantName ?? restaurantId ?? 'Restaurant'
    if (items.length > 0) {
      await placeOrder({
        restaurantName: rname,
        items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
        total: subtotal,
        address: deliveryAddress,
        guestName:  isGuest ? `${guestFirstName.trim()} ${guestLastName.trim()}` : undefined,
        guestPhone: isGuest ? guestPhone.trim() : undefined,
      })
    }
    sendNotification('order_placed', rname)
    setSuccess(true)
    setTimeout(() => { clearCart(); closeSheet(); setSuccess(false); setOrdering(false) }, 1400)
  }

  const handleSchedule = async () => {
    if (ordering || selectedSlot === null || !guestValid) return
    setOrdering(true)
    const rname = restaurantName ?? restaurantId ?? 'Restaurant'
    if (items.length > 0) {
      const scheduledFor = new Date(Date.now() + selectedSlot * 60000).toISOString()
      await placeOrder({
        restaurantName: rname,
        items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
        total: subtotal,
        address: deliveryAddress,
        scheduledFor,
        guestName:  isGuest ? `${guestFirstName.trim()} ${guestLastName.trim()}` : undefined,
        guestPhone: isGuest ? guestPhone.trim() : undefined,
      })
    }
    sendNotification('order_placed', rname)
    setSuccess(true)
    setTimeout(() => {
      clearCart(); closeSheet(); setSuccess(false); setOrdering(false); setSelectedSlot(null)
    }, 1600)
  }

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} onClick={closeSheet}
            className="fixed inset-0 bg-ink/50 z-50 backdrop-blur-sm"
          />
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-50">
            <motion.div
              ref={constraintsRef}
              initial={{ y: '100%' }}
              animate={{ y: 0, transition: { type: 'spring', damping: 32, stiffness: 360 } }}
              exit={{ y: '100%', transition: { type: 'spring', damping: 36, stiffness: 400 } }}
              drag="y" dragConstraints={{ top: 0 }} dragElastic={0.12}
              onDragEnd={(_, info) => { if (info.velocity.y > 350 || info.offset.y > 160) closeSheet() }}
              className="w-full bg-canvas rounded-t-[2rem] shadow-sheet flex flex-col"
              style={{ maxHeight: '92dvh' }}
            >
              <div className="flex-none pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1 bg-cloud rounded-full" />
              </div>

              {/* Header */}
              <div className="flex-none flex items-center justify-between px-5 pt-1 pb-4 border-b border-cloud">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-wolt-light rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-wolt-base" />
                  </div>
                  <div>
                    <h2 className="font-bold text-ink text-base leading-tight">{t.cart.title}</h2>
                    {restaurantName && <p className="text-xs text-fog leading-tight">{restaurantName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button onClick={clearCart} className="w-8 h-8 rounded-xl bg-coral/10 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5 text-coral" />
                    </button>
                  )}
                  <button onClick={closeSheet} className="w-8 h-8 rounded-xl bg-mist flex items-center justify-center">
                    <X className="w-4 h-4 text-ink" />
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-8 text-center">
                  <div className="w-16 h-16 bg-mist rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-fog" />
                  </div>
                  <p className="font-semibold text-ink mb-1">{t.cart.empty}</p>
                  <p className="text-xs text-fog">{de ? 'Füge Artikel aus einem Restaurant hinzu' : 'Add items from a restaurant'}</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2">
                    {items.map(item => <CartItem key={item.id} item={item} />)}
                  </div>

                  <div className="flex-none px-5 pt-4 pb-safe border-t border-cloud space-y-4">
                    {/* Price summary */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm text-slate">
                        <span>{t.cart.subtotal}</span><span>{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate">
                        <span>{t.cart.delivery}</span>
                        <span className="text-emerald font-medium">{de ? 'Gratis' : 'Free'}</span>
                      </div>
                      <div className="flex justify-between font-bold text-ink text-base pt-1.5 border-t border-cloud">
                        <span>{t.cart.total}</span>
                        <span className="text-wolt-base">{formatPrice(subtotal)}</span>
                      </div>
                    </div>

                    {/* Logged-in address */}
                    {!isGuest && activeAddress && (
                      <p className="text-xs text-fog">📍 {activeAddress}</p>
                    )}

                    {/* Guest form */}
                    {isGuest && (
                      <div className="space-y-2.5 bg-mist/50 rounded-2xl p-3.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <User className="w-3.5 h-3.5 text-wolt-base" />
                          <span className="text-xs font-semibold text-ink">
                            {de ? 'Lieferdetails' : 'Delivery details'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Field
                            label={de ? 'Vorname' : 'First name'}
                            value={guestFirstName}
                            onChange={setGuestFirstName}
                            placeholder="Max"
                          />
                          <Field
                            label={de ? 'Nachname' : 'Last name'}
                            value={guestLastName}
                            onChange={setGuestLastName}
                            placeholder="Mustermann"
                          />
                        </div>
                        <Field
                          label={de ? 'Telefon' : 'Phone'}
                          value={guestPhone}
                          onChange={setGuestPhone}
                          type="tel"
                          placeholder="+49 170 1234567"
                        />
                        <Field
                          label={de ? 'Lieferadresse' : 'Delivery address'}
                          value={guestAddress}
                          onChange={setGuestAddress}
                          placeholder={de ? 'Musterstraße 1, 87435 Kempten' : '123 Main St, City'}
                        />
                      </div>
                    )}

                    {restaurantIsOpen ? (
                      <button
                        onClick={handleOrder}
                        disabled={ordering || !guestValid}
                        className={`w-full rounded-2xl px-5 py-4 flex items-center justify-between shadow-wolt active:scale-[0.98] transition-all text-white disabled:opacity-50 ${success ? 'bg-emerald' : 'bg-wolt-base'}`}
                      >
                        {success ? (
                          <span className="flex-1 flex items-center justify-center gap-2 font-semibold text-base">
                            <Check className="w-5 h-5" />{de ? 'Bestellung aufgegeben!' : 'Order placed!'}
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-2">
                              <span className="bg-wolt-deep rounded-xl w-7 h-7 flex items-center justify-center text-sm font-bold">
                                {items.reduce((s, i) => s + i.quantity, 0)}
                              </span>
                              <span className="font-semibold text-base">{t.cart.order}</span>
                            </span>
                            <span className="flex items-center gap-1 font-bold text-base">
                              {formatPrice(subtotal)}<ChevronRight className="w-4 h-4" />
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <CalendarClock className="w-3.5 h-3.5 text-wolt-base" />
                            <span className="text-xs font-semibold text-ink">
                              {de ? 'Restaurant geschlossen – Lieferzeit wählen' : 'Restaurant closed – choose delivery time'}
                            </span>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {SLOT_MINS.map(mins => (
                              <button
                                key={mins}
                                onClick={() => setSelectedSlot(mins)}
                                className={`flex-none px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                                  selectedSlot === mins
                                    ? 'bg-wolt-base text-white border-wolt-base'
                                    : 'bg-canvas text-slate border-cloud hover:border-wolt-base'
                                }`}
                              >
                                {slotLabel(mins)}
                                <span className="ml-1 opacity-70">{addMinutes(mins)}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={handleSchedule}
                          disabled={ordering || selectedSlot === null || !guestValid}
                          className={`w-full rounded-2xl px-5 py-4 flex items-center justify-between shadow-wolt active:scale-[0.98] transition-all text-white disabled:opacity-50 ${success ? 'bg-emerald' : 'bg-wolt-base'}`}
                        >
                          {success ? (
                            <span className="flex-1 flex items-center justify-center gap-2 font-semibold text-base">
                              <Check className="w-5 h-5" />
                              {de ? 'Vorbestellung gespeichert!' : 'Pre-order saved!'}
                            </span>
                          ) : (
                            <>
                              <span className="flex items-center gap-2">
                                <span className="bg-wolt-deep rounded-xl w-7 h-7 flex items-center justify-center text-sm font-bold">
                                  {items.reduce((s, i) => s + i.quantity, 0)}
                                </span>
                                <span className="font-semibold text-base">
                                  {de ? 'Vorbestellen' : 'Pre-order'}
                                  {selectedSlot !== null && ` · ${addMinutes(selectedSlot)}`}
                                </span>
                              </span>
                              <span className="flex items-center gap-1 font-bold text-base">
                                {formatPrice(subtotal)}<ChevronRight className="w-4 h-4" />
                              </span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                    <div className="pb-2" />
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}