import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, Tag } from 'lucide-react'
import type { Restaurant } from '@/types'
import { fetchRestaurants } from '@/lib/lieferando'
import { supabase } from '@/lib/supabase'
import { computeIsOpen } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { Header } from '@/components/home/Header'
import { DeliveryToggle } from '@/components/home/DeliveryToggle'
import { CategoryFilter } from '@/components/home/CategoryFilter'
import { SortFilterBar, type FilterState, DEFAULT_FILTERS } from '@/components/home/SortFilterBar'
import { RestaurantList } from '@/components/home/RestaurantList'
import { RestaurantCard } from '@/components/home/RestaurantCard'
import { FeaturedCard } from '@/components/home/FeaturedCard'
import { SectionHeader } from '@/components/home/SectionHeader'
import { RestaurantCardSkeleton } from '@/components/ui/Skeleton'
import { useLangStore } from '@/store/langStore'
import { useLocationStore } from '@/store/locationStore'
import { haversineKm, formatPrice } from '@/lib/utils'


const pageVariants = {
  initial: { x: '-25%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 280 } },
  exit:    { x: '-25%', opacity: 0, transition: { duration: 0.18, ease: 'easeIn' as const } },
}

type FoodMatch = { name: string; price: number; description?: string }
type FoodResult = { restaurant: Restaurant; items: FoodMatch[] }

const CATEGORY_CUISINE_MAP: Record<string, string[]> = {
  pizza:  ['pizza', 'Pizza', 'Italienisch', 'italian'],
  burger: ['burger', 'Burger', 'American', 'amerikanisch'],
  kebab:  ['kebab', 'Kebab', 'Turkish', 'türkisch', 'Türkisch'],
  sushi:  ['sushi', 'Sushi', 'Japanese', 'japanisch'],
  asian:  ['asian', 'Asian', 'asiatisch', 'Asiatisch', 'Chinese', 'chinesisch', 'Thai'],
  salad:  ['salad', 'Salad', 'Salat', 'Healthy', 'gesund'],
}

export function Home() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [foodResults, setFoodResults] = useState<FoodResult[]>([])
  const { lang } = useLangStore()
  const { lat, lng, status, request } = useLocationStore()
  const de = lang === 'de'
  const restaurantsRef = useRef(restaurants)
  restaurantsRef.current = restaurants

  useEffect(() => {
    if (status === 'idle') request()
  }, [status, request])

  useEffect(() => {
    fetchRestaurants().then(data => { setRestaurants(data); setLoading(false) })

    const { setRestaurantIsOpen } = useCartStore.getState()
    const ch = supabase.channel('home-restaurants')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'restaurants' }, (payload) => {
        const u = payload.new as { slug: string; is_open: boolean; paused: boolean; hours: ({ open: string; close: string } | null)[] }
        const isOpen = u.is_open && !u.paused && computeIsOpen(u.hours ?? [])
        setRestaurants(prev => prev.map(r =>
          r.slug === u.slug ? { ...r, hours: u.hours ?? r.hours, isOpen } : r
        ))
        setRestaurantIsOpen(u.slug, isOpen)
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // Debounced food search via Supabase
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length === 0) { setFoodResults([]); return }

    const timer = setTimeout(async () => {
      const { data: items } = await supabase
        .from('menu_items')
        .select('restaurant_id, name, price, description')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .eq('available', true)
        .limit(50)

      if (!items || items.length === 0) { setFoodResults([]); return }

      const restaurantIds = [...new Set((items as { restaurant_id: string }[]).map(i => i.restaurant_id))]
      const { data: slugRows } = await supabase
        .from('restaurants')
        .select('id, slug')
        .in('id', restaurantIds)

      const slugMap = new Map((slugRows ?? []).map((r: { id: string; slug: string }) => [r.id, r.slug]))

      const grouped = new Map<string, FoodMatch[]>()
      for (const item of items as { restaurant_id: string; name: string; price: number; description?: string }[]) {
        const slug = slugMap.get(item.restaurant_id)
        if (!slug) continue
        if (!grouped.has(slug)) grouped.set(slug, [])
        grouped.get(slug)!.push({ name: item.name, price: item.price, description: item.description || undefined })
      }

      const results: FoodResult[] = []
      for (const [slug, foodItems] of grouped) {
        const restaurant = restaurantsRef.current.find(r => r.slug === slug)
        if (restaurant) results.push({ restaurant, items: foodItems })
      }
      setFoodResults(results)
    }, 350)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const withDistance: Restaurant[] = restaurants.map(r => ({
    ...r,
    distanceKm: lat != null && lng != null ? haversineKm(lat, lng, r.lat, r.lng) : undefined,
  })).sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1
    if (a.distanceKm != null && b.distanceKm != null) return a.distanceKm - b.distanceKm
    return 0
  })

  const filterByCuisine = (list: Restaurant[]) => {
    if (activeCategory === 'all') return list
    const keys = CATEGORY_CUISINE_MAP[activeCategory] ?? []
    return list.filter(r => r.cuisines.some(c => keys.some(k => c.toLowerCase().includes(k.toLowerCase()))))
  }

  const applyFiltersAndSort = (list: Restaurant[]): Restaurant[] => {
    let out = [...list]
    if (filters.freeDelivery) out = out.filter(r => r.deliveryFee === 0)
    if (filters.openNow)      out = out.filter(r => r.isOpen)
    if (filters.maxTime != null) out = out.filter(r => r.deliveryTime <= filters.maxTime!)
    switch (filters.sort) {
      case 'rating':   out.sort((a, b) => b.rating - a.rating); break
      case 'distance': out.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)); break
      case 'time':     out.sort((a, b) => a.deliveryTime - b.deliveryTime); break
      case 'minorder': out.sort((a, b) => a.minOrder - b.minOrder); break
    }
    return out
  }

  const featured = withDistance[0] ?? null
  const rest = applyFiltersAndSort(filterByCuisine(withDistance.slice(1)))
  const deals = withDistance.filter(r => r.deliveryFee === 0)

  const q = searchQuery.trim().toLowerCase()

  const restaurantResults = q.length > 0
    ? withDistance.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisines.some(c => c.toLowerCase().includes(q))
      )
    : []

  const allMatchSlugs = new Set(foodResults.map(fr => fr.restaurant.slug))
  const pureRestaurantResults = restaurantResults.filter(r => !allMatchSlugs.has(r.slug))
  const hasResults = restaurantResults.length > 0 || foodResults.length > 0

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {q.length === 0 ? (
        <>
          <DeliveryToggle />
          <CategoryFilter onSelect={setActiveCategory} />
          <SortFilterBar value={filters} onChange={setFilters} />

          {loading ? (
            <div className="space-y-4 mb-nav">
              <div className="mx-4"><RestaurantCardSkeleton /></div>
              <div className="h-5 bg-mist rounded-xl w-1/3 mx-4 animate-pulse" />
              <div className="px-4 space-y-4">
                <RestaurantCardSkeleton />
                <RestaurantCardSkeleton />
              </div>
            </div>
          ) : (
            <div className="mb-nav space-y-6">
              {featured && <FeaturedCard restaurant={featured} />}

              {/* Deals */}
              {deals.length > 0 && (
                <section>
                  <SectionHeader label={de ? 'Angebote & Deals' : 'Deals'} />
                  <div className="scroll-x flex gap-3 px-4 pb-1">
                    {deals.map(r => (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/restaurant/${r.slug}`)}
                        className="flex-none w-52 bg-canvas border border-cloud rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                      >
                        {r.hero ? (
                          <img src={r.hero} alt={r.name} className="w-full h-28 object-cover" />
                        ) : (
                          <div className="w-full h-28 bg-mist" />
                        )}
                        <div className="p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold bg-emerald/10 text-emerald px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5" />{de ? 'Gratis Lieferung' : 'Free delivery'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-ink truncate">{r.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-0.5 text-[10px] text-fog">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{r.rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-0.5 text-[10px] text-fog">
                              <Clock className="w-3 h-3" />{r.deliveryTime} min
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* All restaurants */}
              <div>
                <SectionHeader
                  label={de ? 'Alle Restaurants' : 'All Restaurants'}
                  count={rest.length}
                />
                <RestaurantList restaurants={rest} />
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Search results ── */
        <div className="px-4 pt-4 mb-nav">
          {loading ? (
            <div className="space-y-4">
              <RestaurantCardSkeleton />
              <RestaurantCardSkeleton />
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="text-5xl mb-4">🔍</span>
              <p className="font-semibold text-ink mb-1">{de ? 'Keine Treffer' : 'No results'}</p>
              <p className="text-sm text-fog">
                {de ? `Nichts für „${searchQuery}" gefunden` : `Nothing found for "${searchQuery}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Restaurants with food matches: full card + items strip below */}
              {foodResults.map(({ restaurant: r, items }, i) => (
                <div key={r.id}>
                  <RestaurantCard restaurant={r} index={i} />
                  <div className="mt-1 bg-canvas border border-cloud rounded-2xl overflow-hidden divide-y divide-cloud">
                    {items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigate(`/restaurant/${r.slug}`)}
                        className="w-full flex items-center justify-between px-4 py-2.5 gap-4 hover:bg-mist transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-ink font-medium truncate">{item.name}</p>
                          {item.description && <p className="text-xs text-fog truncate">{item.description}</p>}
                        </div>
                        <span className="text-sm font-semibold text-wolt-base flex-none">{formatPrice(item.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Pure restaurant matches */}
              {pureRestaurantResults.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} index={foodResults.length + i} />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}