import { motion } from 'framer-motion'
import { Clock, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Restaurant } from '@/types'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { formatPrice, formatDistance, computeIsOpen } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

interface RestaurantCardProps {
  restaurant: Restaurant
  index: number
}

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 320 } },
}

function todayHours(r: Restaurant, de: boolean): string | null {
  const day = r.hours[new Date().getDay()]
  if (!day) return de ? 'Heute geschlossen' : 'Closed today'
  return `${day.open} – ${day.close}`
}

export function RestaurantCard({ restaurant, index }: RestaurantCardProps) {
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const t = getT(lang)
  const de = lang === 'de'
  const isOpen = computeIsOpen(restaurant.hours)
  const hoursLabel = todayHours(restaurant, de)

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
      className="bg-canvas rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow cursor-pointer active:scale-[0.98]"
    >
      <div className="relative">
        <img
          src={restaurant.hero ?? restaurant.logo}
          alt={restaurant.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-44 object-cover transition-all ${!isOpen ? 'grayscale brightness-50' : ''}`}
        />

        {!isOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="text-white font-black uppercase select-none"
              style={{
                fontSize: '22px',
                textShadow: '0 0 12px rgba(255,255,255,0.3), 2px 2px 0 rgba(0,0,0,0.8)',
                letterSpacing: '0.3em',
              }}
            >
              {t.restaurant.closed}
            </p>
            {hoursLabel && (
              <p className="text-white/60 text-[10px] tracking-widest uppercase mt-1">{hoursLabel}</p>
            )}
          </div>
        )}

        {/* top-right: rating + distance */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <RatingBadge
            rating={restaurant.rating}
            className={`bg-canvas/90 backdrop-blur px-2 py-1 rounded-xl shadow-sm ${!isOpen ? 'opacity-50' : ''}`}
          />
          {restaurant.distanceKm != null && (
            <span className="flex items-center gap-1 bg-canvas/90 backdrop-blur px-2 py-1 rounded-xl shadow-sm text-xs font-semibold text-ink">
              <Navigation className="w-3 h-3 text-wolt-base" />
              {formatDistance(restaurant.distanceKm)}
            </span>
          )}
        </div>

        {/* bottom-left: hours when open */}
        {isOpen && hoursLabel && (
          <div className="absolute bottom-3 left-3">
            <span className="flex items-center gap-1 bg-emerald/90 backdrop-blur text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3" />
              {hoursLabel}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className={`font-semibold text-base leading-tight mb-1 ${!isOpen ? 'text-fog' : 'text-ink'}`}>
          {restaurant.name}
        </h3>
        <p className="text-xs text-fog mb-2">{restaurant.cuisines.join(' · ')}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 bg-mist rounded-xl px-2.5 py-1 text-xs font-medium text-slate">
            <Clock className="w-3 h-3 text-wolt-base" />
            {restaurant.deliveryTime} {t.restaurant.min}
          </span>
          <span className={`rounded-xl px-2.5 py-1 text-xs font-medium bg-mist ${restaurant.deliveryFee === 0 ? 'text-emerald' : 'text-slate'}`}>
            {restaurant.deliveryFee === 0 ? t.restaurant.free : formatPrice(restaurant.deliveryFee)}
          </span>
          <span className="bg-mist rounded-xl px-2.5 py-1 text-xs font-medium text-slate">
            {t.restaurant.minOrder} {formatPrice(restaurant.minOrder)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}