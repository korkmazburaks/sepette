import { Plus, Minus } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const updateQty = useCartStore(s => s.updateQuantity)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-cloud last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-ink">{item.name}</p>
        <p className="text-xs text-fog">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQty(item.id, item.quantity - 1)}
          className="w-7 h-7 bg-mist rounded-full flex items-center justify-center active:scale-90 transition-transform"
        >
          <Minus className="w-3.5 h-3.5 text-ink" />
        </button>
        <span className="w-4 text-center font-semibold text-sm text-ink">{item.quantity}</span>
        <button
          onClick={() => updateQty(item.id, item.quantity + 1)}
          className="w-7 h-7 bg-wolt-base rounded-full flex items-center justify-center shadow-wolt active:scale-90 transition-transform"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      <span className="font-semibold text-sm text-ink w-14 text-right">
        {formatPrice(item.price * item.quantity)}
      </span>
    </div>
  )
}