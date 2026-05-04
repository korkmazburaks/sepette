import { ArrowLeft, ShoppingBag, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Restaurant } from '@/types'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

interface RestaurantHeroProps {
  restaurant: Restaurant
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const navigate = useNavigate()
  const totalItems = useCartStore(s => s.totalItems())
  const openSheet  = useCartStore(s => s.openSheet)
  const { lang }   = useLangStore()
  const t = getT(lang)

  return (
    <div>
      <div className="relative">
        <img
          src={restaurant.hero ?? restaurant.logo}
          alt={restaurant.name}
          loading="lazy"
          decoding="async"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-canvas/90 backdrop-blur rounded-full flex items-center justify-center shadow-card"
        >
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>

        {totalItems > 0 && (
          <button
            onClick={openSheet}
            className="absolute top-4 right-4 w-10 h-10 bg-wolt-base rounded-full flex items-center justify-center shadow-wolt"
          >
            <ShoppingBag className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </button>
        )}
      </div>

      <div className="px-4 pt-4 pb-3 bg-canvas">
        <h1 className="text-2xl font-bold text-ink mb-1">{restaurant.name}</h1>
        <p className="text-xs text-fog mb-2">{restaurant.cuisines.join(' · ')}</p>

        <div className="flex items-center gap-3 text-xs text-slate flex-wrap">
          <RatingBadge rating={restaurant.rating} reviewCount={restaurant.reviewCount} />
          <span>·</span>
          <span>{restaurant.deliveryTime}–{restaurant.deliveryTime + 5} {t.restaurant.min}</span>
          <span>·</span>
          <span>
            {restaurant.deliveryFee === 0
              ? <span className="text-emerald font-medium">{t.restaurant.free}</span>
              : `${formatPrice(restaurant.deliveryFee)} ${t.restaurant.delivery}`
            }
          </span>
          <span>·</span>
          <span>{t.restaurant.minOrder} {formatPrice(restaurant.minOrder)}</span>
        </div>

        <button
          onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-3 flex items-center gap-1.5 bg-mist hover:bg-cloud rounded-full px-3 py-1.5 text-xs font-medium text-ink transition-colors active:scale-95"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {lang === 'de' ? 'Zu den Bewertungen' : 'See reviews'}
        </button>
      </div>
    </div>
  )
}