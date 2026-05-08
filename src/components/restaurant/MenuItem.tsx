import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import type { MenuItem as MenuItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useLangStore } from '@/store/langStore'

interface MenuItemProps {
  item: MenuItemType
  restaurantId: string
  restaurantSlug: string
  restaurantName: string
  isOpen: boolean
}

export function MenuItem({ item, restaurantId, restaurantSlug, restaurantName, isOpen }: MenuItemProps) {
  const addItem   = useCartStore(s => s.addItem)
  const items     = useCartStore(s => s.items)
  const updateQty = useCartStore(s => s.updateQuantity)
  const cartItem  = items.find(i => i.id === item.id)
  const qty       = cartItem?.quantity ?? 0
  const [imgError, setImgError] = useState(false)
  const { lang } = useLangStore()
  const de = lang === 'de'

  // isAvailable defaults to true for legacy local-menu items
  const isAvailable = item.isAvailable ?? true
  const canAdd = isOpen && isAvailable

  return (
    <div className={`flex gap-3 py-3 border-b border-cloud last:border-0 transition-opacity ${!isAvailable ? 'opacity-60' : ''}`}>
      {item.imageUrl && (
        imgError ? (
          <div className="w-20 h-20 bg-mist rounded-2xl flex-none flex items-center justify-center text-2xl select-none">
            🍽️
          </div>
        ) : (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-20 h-20 object-cover rounded-2xl flex-none"
          />
        )
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-medium text-ink text-sm leading-snug">{item.name}</p>
              {!isAvailable && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-coral/10 text-coral border border-coral/20 leading-none">
                  {de ? 'Ausverkauft' : 'Sold out'}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-fog mt-0.5 line-clamp-2">{item.description}</p>
            )}
          </div>
          <span className="font-semibold text-ink text-sm flex-none">{formatPrice(item.price)}</span>
        </div>

        <div className="mt-2 flex justify-end">
          {qty === 0 ? (
            <button
              onClick={() => canAdd && addItem(item, restaurantId, isOpen, restaurantSlug, restaurantName)}
              disabled={!canAdd}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                canAdd
                  ? 'bg-wolt-base shadow-wolt active:scale-90'
                  : 'bg-mist cursor-not-allowed opacity-50'
              }`}
            >
              <Plus className={`w-4 h-4 ${canAdd ? 'text-white' : 'text-fog'}`} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, qty - 1)}
                className="w-8 h-8 bg-mist rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <Minus className="w-4 h-4 text-ink" />
              </button>
              <span className="w-5 text-center font-semibold text-ink text-sm">{qty}</span>
              <button
                onClick={() => canAdd && addItem(item, restaurantId, isOpen, restaurantSlug, restaurantName)}
                disabled={!canAdd}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                  canAdd
                    ? 'bg-wolt-base shadow-wolt active:scale-90'
                    : 'bg-mist cursor-not-allowed opacity-50'
                }`}
              >
                <Plus className={`w-4 h-4 ${canAdd ? 'text-white' : 'text-fog'}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
