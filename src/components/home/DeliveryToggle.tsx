import { motion } from 'framer-motion'
import { Bike, Store } from 'lucide-react'
import { useDeliveryStore } from '@/store/deliveryStore'
import { useLangStore } from '@/store/langStore'

export function DeliveryToggle() {
  const { mode, setMode } = useDeliveryStore()
  const { lang } = useLangStore()
  const de = lang === 'de'

  const options = [
    { key: 'delivery' as const, icon: Bike,  label: de ? 'Lieferung'  : 'Delivery' },
    { key: 'pickup'   as const, icon: Store, label: de ? 'Abholung'   : 'Pickup'   },
  ]

  return (
    <div className="px-4 pt-1 pb-3">
      <div className="relative flex bg-mist rounded-2xl p-1 gap-1">
        {/* Sliding pill */}
        <motion.div
          layout
          layoutId="delivery-pill"
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          className="absolute inset-1 w-[calc(50%-2px)] bg-canvas rounded-xl shadow-card"
          style={{ left: mode === 'delivery' ? '4px' : 'calc(50% + 2px)' }}
        />

        {options.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-colors"
          >
            <Icon className={`w-4 h-4 transition-colors ${mode === key ? 'text-wolt-base' : 'text-fog'}`} />
            <span className={`text-sm font-semibold transition-colors ${mode === key ? 'text-ink' : 'text-fog'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}