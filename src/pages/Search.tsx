import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Restaurant } from '@/types'
import { fetchRestaurants, MENUS } from '@/lib/lieferando'
import { RestaurantCard } from '@/components/home/RestaurantCard'
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton'
import { useLangStore } from '@/store/langStore'
import { formatPrice } from '@/lib/utils'

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 280 } },
  exit:    { x: '100%', opacity: 0, transition: { duration: 0.18, ease: 'easeIn' as const } },
}

const QUICK_TAGS = [
  { de: 'Pizza',       en: 'Pizza',       q: 'pizza' },
  { de: 'Burger',      en: 'Burger',      q: 'burger' },
  { de: 'Döner',       en: 'Kebab',       q: 'kebab' },
  { de: 'Sushi',       en: 'Sushi',       q: 'sushi' },
  { de: 'Vegetarisch', en: 'Vegetarian',  q: 'vege' },
  { de: 'Pasta',       en: 'Pasta',       q: 'pasta' },
]

type FoodMatch = { name: string; price: number; description?: string }
type FoodResult = { restaurant: Restaurant; items: FoodMatch[] }

export function Search() {
  const navigate = useNavigate()
  const { lang } = useLangStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [all, setAll] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRestaurants().then(data => { setAll(data); setLoading(false) })
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  const q = query.trim().toLowerCase()

  const restaurantResults = q.length > 0
    ? all.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisines.some(c => c.toLowerCase().includes(q))
      )
    : []

  const foodResults: FoodResult[] = q.length > 0
    ? Object.entries(MENUS).flatMap(([slug, categories]) => {
        const restaurant = all.find(r => r.slug === slug)
        if (!restaurant) return []
        const items = categories.flatMap(cat =>
          cat.items
            .filter(item =>
              item.name.toLowerCase().includes(q) ||
              item.description?.toLowerCase().includes(q)
            )
            .map(item => ({ name: item.name, price: item.price, description: item.description }))
        )
        if (items.length === 0) return []
        return [{ restaurant, items }]
      })
    : []

  const hasResults = restaurantResults.length > 0 || foodResults.length > 0

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-dvh">
      <div className="pt-safe px-4 pb-3 bg-snow sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-mist flex-none"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'de' ? 'Restaurant oder Gericht…' : 'Restaurant or dish…'}
              className="w-full bg-mist rounded-2xl pl-10 pr-10 py-3 text-sm text-ink placeholder:text-fog outline-none focus:ring-2 focus:ring-wolt-base/30"
              style={{ fontSize: '16px' }}
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-fog" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {!query && (
          <>
            <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
              {lang === 'de' ? 'Schnellsuche' : 'Quick search'}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag.q}
                  onClick={() => setQuery(tag.q)}
                  className="px-4 py-2 bg-canvas border border-cloud rounded-2xl text-sm text-slate font-medium hover:bg-mist transition-colors"
                >
                  {lang === 'de' ? tag.de : tag.en}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
              {lang === 'de' ? 'Alle Restaurants' : 'All Restaurants'}
            </p>
            {loading ? (
              <div className="space-y-4 mb-nav">
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
              </div>
            ) : (
              <div className="space-y-4 mb-nav">
                {all.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
              </div>
            )}
          </>
        )}

        {query && (
          <div className="mb-nav">
            {loading ? (
              <div className="space-y-4">
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
              </div>
            ) : !hasResults ? (
              <div className="flex flex-col items-center py-20 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <p className="font-semibold text-ink mb-1">
                  {lang === 'de' ? 'Keine Treffer' : 'No results'}
                </p>
                <p className="text-sm text-fog">
                  {lang === 'de' ? `Nichts für „${query}" gefunden` : `Nothing found for "${query}"`}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {restaurantResults.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
                      {lang === 'de' ? 'Restaurants' : 'Restaurants'} ({restaurantResults.length})
                    </p>
                    <div className="space-y-4">
                      {restaurantResults.map((r, i) => <RestaurantCard key={r.id} restaurant={r} index={i} />)}
                    </div>
                  </section>
                )}

                {foodResults.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3">
                      {lang === 'de' ? 'Gerichte' : 'Dishes'} ({foodResults.reduce((sum, fr) => sum + fr.items.length, 0)})
                    </p>
                    <div className="space-y-3">
                      {foodResults.map(({ restaurant, items }) => (
                        <div
                          key={restaurant.id}
                          className="bg-canvas border border-cloud rounded-2xl overflow-hidden"
                        >
                          <button
                            onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-mist transition-colors text-left"
                          >
                            <img
                              src={restaurant.logo}
                              alt={restaurant.name}
                              className="w-9 h-9 rounded-xl object-cover flex-none"
                            />
                            <span className="font-semibold text-sm text-ink">{restaurant.name}</span>
                            <span className="ml-auto text-xs text-fog">{items.length} {lang === 'de' ? 'Treffer' : 'matches'}</span>
                          </button>
                          <div className="border-t border-cloud divide-y divide-cloud">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between px-4 py-2.5 gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm text-ink font-medium truncate">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-fog truncate">{item.description}</p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-wolt-base flex-none">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}