import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Zap, Utensils, ThumbsUp, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLangStore } from '@/store/langStore'

interface Review {
  id: string
  rating: number
  comment: string | null
  reviewer_name: string | null
  anonymous: boolean | null
  speed_rating: number | null
  taste_rating: number | null
  service_rating: number | null
  created_at: string
}

const CRITERIA = [
  { key: 'speed',   Icon: Zap,      de: 'Lieferzeit', en: 'Speed'   },
  { key: 'taste',   Icon: Utensils, de: 'Geschmack',  en: 'Taste'   },
  { key: 'service', Icon: ThumbsUp, de: 'Service',    en: 'Service' },
] as const

/* ── Star row (read-only display) ── */
function StarRow({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${
            n <= value
              ? 'fill-amber text-amber'
              : 'fill-amber/30 text-amber/30'
          }`}
        />
      ))}
    </div>
  )
}

/* ── Interactive star row (for forms in Orders.tsx) ── */
export function StarRowInteractive({
  value, onChange, size = 'lg',
}: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' | 'lg' }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform active:scale-90"
        >
          <Star className={`${sz} transition-colors ${
            n <= (hover || value)
              ? 'fill-amber text-amber'
              : 'fill-amber/30 text-amber/30'
          }`} />
        </button>
      ))}
    </div>
  )
}

/* ── Relative time ── */
function timeAgo(iso: string, de: boolean): string {
  const diff  = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return de ? 'gerade eben' : 'just now'
  if (mins  < 60) return de ? `vor ${mins} Min.`   : `${mins}m ago`
  if (hours < 24) return de ? `vor ${hours} Std.`  : `${hours}h ago`
  if (days  < 30) return de ? `vor ${days} Tag${days > 1 ? 'en' : ''}` : `${days}d ago`
  return new Date(iso).toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'short' })
}

/* ── Rating summary ── */
function RatingSummary({ reviews, de }: { reviews: Review[]; de: boolean }) {
  if (reviews.length === 0) return null
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  const criteriaAvg = CRITERIA.map(({ key, de: deLabel, en: enLabel }) => {
    const vals = reviews
      .map(r => r[`${key}_rating` as keyof Review] as number | null)
      .filter((v): v is number => v != null)
    return {
      label: de ? deLabel : enLabel,
      avg: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
    }
  })

  return (
    <div className="bg-mist rounded-2xl p-4 mb-4 space-y-3">
      <div className="flex items-center gap-4">
        <div className="text-center flex-none">
          <p className="text-3xl font-black text-ink">{avg.toFixed(1)}</p>
          <StarRow value={Math.round(avg)} size="sm" />
          <p className="text-[10px] text-fog mt-1">{reviews.length} {de ? 'Bewertungen' : 'reviews'}</p>
        </div>
        <div className="flex-1 space-y-2">
          {criteriaAvg.map(({ label, avg: cAvg }) => cAvg != null && (
            <div key={label} className="flex items-center gap-2">
              <span className="text-[11px] text-fog w-20 flex-none">{label}</span>
              <div className="flex-1 h-1.5 bg-cloud rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${(cAvg / 5) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-ink w-6 text-right">{cAvg.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Main ── */
export function ReviewsSection({ restaurantName }: { restaurantName: string }) {
  const { lang }  = useLangStore()
  const de        = lang === 'de'
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('reviews')
      .select('id, rating, comment, reviewer_name, anonymous, speed_rating, taste_rating, service_rating, created_at')
      .eq('restaurant_name', restaurantName)
      .order('created_at', { ascending: false })
      .limit(40)
      .then(({ data }) => {
        setReviews((data as Review[]) ?? [])
        setLoading(false)
      })
  }, [restaurantName])

  return (
    <div id="reviews-section" className="px-4 pb-10 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-ink text-lg">
          {de ? 'Bewertungen' : 'Reviews'}
          {reviews.length > 0 && (
            <span className="ml-2 text-sm font-normal text-fog">({reviews.length})</span>
          )}
        </h2>
      </div>

      {/* Summary */}
      {!loading && <RatingSummary reviews={reviews} de={de} />}

      {/* "Leave a review via orders" hint */}
      {!loading && (
        <div className="flex items-center gap-2 bg-wolt-light rounded-xl px-3 py-2.5 mb-4">
          <ShoppingBag className="w-4 h-4 text-wolt-base flex-none" />
          <p className="text-xs text-wolt-deep">
            {de
              ? 'Bewertungen können nach einer Bestellung im Bestellverlauf abgegeben werden.'
              : 'Reviews can be left after ordering via your order history.'}
          </p>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-canvas rounded-2xl animate-pulse shadow-card" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center gap-2">
          <span className="text-3xl">🌟</span>
          <p className="text-sm font-semibold text-ink">
            {de ? 'Noch keine Bewertungen' : 'No reviews yet'}
          </p>
          <p className="text-xs text-fog">
            {de ? 'Bestelle und hinterlasse die erste Bewertung!' : 'Order and leave the first review!'}
          </p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {reviews.map((review) => {
            const isAnon  = review.anonymous || !review.reviewer_name
            const initial = isAnon ? '?' : review.reviewer_name![0].toUpperCase()
            const name    = isAnon ? (de ? 'Anonym' : 'Anonymous') : review.reviewer_name!
            const hasSub  = review.speed_rating != null && review.taste_rating != null && review.service_rating != null

            return (
              <motion.div
                key={review.id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                className="bg-canvas rounded-2xl shadow-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-wolt-light flex items-center justify-center text-sm font-bold text-wolt-base flex-none">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink leading-tight">{name}</p>
                      <p className="text-[10px] text-fog">{timeAgo(review.created_at, de)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-none">
                    <StarRow value={review.rating} size="sm" />
                    <span className="text-xs font-bold text-ink">{review.rating}</span>
                  </div>
                </div>

                {hasSub && (
                  <div className="grid grid-cols-3 gap-2 mb-2 pl-11">
                    {CRITERIA.map(({ key, Icon, de: deLabel, en: enLabel }) => (
                      <div key={key} className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <Icon className="w-3 h-3 text-fog flex-none" />
                          <span className="text-[10px] text-fog truncate">{de ? deLabel : enLabel}</span>
                        </div>
                        <StarRow value={review[`${key}_rating` as keyof Review] as number} size="sm" />
                      </div>
                    ))}
                  </div>
                )}

                {review.comment && (
                  <p className="text-sm text-slate leading-relaxed pl-11">{review.comment}</p>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}