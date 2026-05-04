import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

export function CartFAB() {
  const { totalItems, totalPrice, openSheet } = useCartStore()
  const { lang } = useLangStore()
  const t = getT(lang)
  const count = totalItems()
  const price = totalPrice()

  return (
    <AnimatePresence>
      {count > 0 && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile px-4 z-30 pointer-events-none"
          style={{ paddingBottom: 'calc(var(--nav-height) + var(--sab) + 10px)' }}
        >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        >
          <button
            onClick={openSheet}
            className="pointer-events-auto w-full bg-wolt-base text-white rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-wolt active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-2.5">
              <span className="bg-wolt-deep rounded-xl w-7 h-7 flex items-center justify-center text-sm font-bold tabular-nums">
                {count}
              </span>
              <span className="font-semibold text-base">{t.cart.title}</span>
            </span>
            <span className="font-bold text-base tabular-nums">{formatPrice(price)}</span>
          </button>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}