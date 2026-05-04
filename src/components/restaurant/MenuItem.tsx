import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import type { MenuItem as MenuItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface MenuItemProps {
  item: MenuItemType
  restaurantId: string
  restaurantSlug: string
  restaurantName: string
  isOpen: boolean
}

export function MenuItem({ item, restaurantId, restaurantSlug, restaurantName, isOpen }: MenuItemProps) {
  const addItem      = useCartStore(s => s.addItem)
  const items        = useCartStore(s => s.items)
  const updateQty    = useCartStore(s => s.updateQuantity)
  const cartItem     = items.find(i => i.id === item.id)
  const qty          = cartItem?.quantity ?? 0
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex gap-3 py-3 border-b border-cloud last:border-0">
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
            <p className="font-medium text-ink text-sm leading-snug">{item.name}</p>
            {item.description && (
              <p className="text-xs text-fog mt-0.5 line-clamp-2">{item.description}</p>
            )}
          </div>
          <span className="font-semibold text-ink text-sm flex-none">{formatPrice(item.price)}</span>
        </div>

        <div className="mt-2 flex justify-end">
          {qty === 0 ? (
            <button
              onClick={() => addItem(item, restaurantId, isOpen, restaurantSlug, restaurantName)}
              className="w-8 h-8 bg-wolt-base rounded-full flex items-center justify-center shadow-wolt active:scale-90 transition-transform"
            >
              <Plus className="w-4 h-4 text-white" />
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
                onClick={() => addItem(item, restaurantId, isOpen, restaurantSlug, restaurantName)}
                className="w-8 h-8 bg-wolt-base rounded-full flex items-center justify-center shadow-wolt active:scale-90 transition-transform"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}