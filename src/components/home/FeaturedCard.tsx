import { motion } from 'framer-motion'
import { Clock, Zap, Star, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Restaurant } from '@/types'
import { RatingBadge } from '@/components/ui/RatingBadge'
import { formatPrice } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

interface FeaturedCardProps {
  restaurant: Restaurant
}

function getBadge(r: Restaurant, de: boolean): { icon: React.ElementType; label: string } {
  if (r.deliveryFee === 0 && r.deliveryTime <= 25)
    return { icon: Zap, label: de ? 'Schnell & Gratis' : 'Fast & Free' }
  if (r.deliveryFee === 0)
    return { icon: Tag, label: de ? 'Gratis Lieferung' : 'Free Delivery' }
  if (r.rating >= 4.5)
    return { icon: Star, label: de ? 'Top bewertet' : 'Top Rated' }
  if (r.deliveryTime <= 25)
    return { icon: Zap, label: de ? 'Schnelle Lieferung' : 'Fast Delivery' }
  return { icon: Zap, label: de ? 'Empfohlen' : 'Featured' }
}

export function FeaturedCard({ restaurant }: FeaturedCardProps) {
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const t = getT(lang)
  const de = lang === 'de'
  const badge = getBadge(restaurant, de)
  const BadgeIcon = badge.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { type: 'spring', damping: 24, stiffness: 280, delay: 0.05 } }}
      onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
      className="mx-4 rounded-3xl overflow-hidden shadow-card-hover cursor-pointer active:scale-[0.98] transition-transform relative"
    >
      <img
        src={restaurant.hero ?? restaurant.logo}
        alt={restaurant.name}
        loading="eager"
        decoding="async"
        className="w-full h-52 object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

      <div className="absolute top-3 left-3">
        <span className="flex items-center gap-1 bg-wolt-base text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-wolt">
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-0.5">{restaurant.name}</h2>
            <p className="text-xs text-white/70">{restaurant.cuisines.join(' · ')}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <RatingBadge
              rating={restaurant.rating}
              reviewCount={restaurant.reviewCount}
              className="bg-canvas/15 backdrop-blur px-2 py-1 rounded-xl text-white [&_span]:text-white [&_span.text-fog]:text-white/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {restaurant.deliveryTime} {t.restaurant.min}
          </span>
          <span>·</span>
          <span>
            {restaurant.deliveryFee === 0
              ? <span className="text-emerald font-medium">{t.restaurant.free}</span>
              : formatPrice(restaurant.deliveryFee)
            }
          </span>
          <span>·</span>
          <span>{t.restaurant.minOrder} {formatPrice(restaurant.minOrder)}</span>
        </div>
      </div>
    </motion.div>
  )
}