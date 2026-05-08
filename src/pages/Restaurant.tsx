import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChefHat, Clock } from 'lucide-react'
import type { Restaurant as RestaurantType, MenuCategory } from '@/types'
import { fetchRestaurants, fetchMenu } from '@/lib/lieferando'
import { supabase } from '@/lib/supabase'
import { computeIsOpen } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { RestaurantHero } from '@/components/restaurant/RestaurantHero'
import { MenuTabs } from '@/components/restaurant/MenuTabs'
import { MenuCategory as MenuCategoryComponent } from '@/components/restaurant/MenuCategory'
import { ReviewsSection } from '@/components/restaurant/ReviewsSection'
import { Skeleton } from '@/components/ui/Skeleton'
import { useLangStore } from '@/store/langStore'
import { getT } from '@/i18n'

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 280 } },
  exit:    { x: '-25%', opacity: 0, transition: { duration: 0.18, ease: 'easeIn' as const } },
}

export function Restaurant() {
  const { slug } = useParams<{ slug: string }>()
  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null)
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const { lang } = useLangStore()
  const t = getT(lang)

  const loadAll = useCallback(async () => {
    if (!slug) return
    const [restaurants, menuData] = await Promise.all([fetchRestaurants(), fetchMenu(slug)])
    const found = restaurants.find(r => r.slug === slug) ?? null
    setRestaurant(found)
    setMenu(menuData)
    setLoading(false)
  }, [slug])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (!slug) return
    const { setRestaurantIsOpen } = useCartStore.getState()

    const ch = supabase.channel(`restaurant-live-${slug}`)
      // Restaurant durum değişiklikleri (is_open, paused, hours, unavailable_item_ids)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'restaurants' }, (payload) => {
        const u = payload.new as {
          slug: string; is_open: boolean; paused: boolean;
          hours: ({ open: string; close: string } | null)[];
          unavailable_item_ids: string[]
        }
        if (u.slug !== slug) return
        const isOpen = u.is_open && !u.paused && computeIsOpen(u.hours ?? [])
        setRestaurant(prev => prev ? { ...prev, hours: u.hours ?? prev.hours, isOpen } : prev)
        setRestaurantIsOpen(slug, isOpen)
        // unavailable_item_ids değişince menüyü yeniden filtrele
        fetchMenu(slug).then(setMenu)
      })
      // Menü öğesi eklendi / güncellendi / silindi
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'menu_items' }, () => {
        fetchMenu(slug).then(setMenu)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_items' }, () => {
        fetchMenu(slug).then(setMenu)
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'menu_items' }, () => {
        fetchMenu(slug).then(setMenu)
      })
      .subscribe()

    return () => { supabase.removeChannel(ch) }
  }, [slug])

  if (loading) {
    return (
      <div>
        <Skeleton className="h-52 rounded-none" />
        <div className="px-4 pt-4 space-y-2 bg-canvas">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-dvh text-fog">
        Restaurant nicht gefunden
      </div>
    )
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="mb-nav">
      <RestaurantHero restaurant={restaurant} />

      {!restaurant.isOpen && (
        <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl bg-coral/10 border border-coral/20 px-4 py-3">
          <Clock className="w-4 h-4 text-coral mt-0.5 flex-none" />
          <div>
            <p className="text-sm font-semibold text-coral">{t.restaurant.closed}</p>
            <p className="text-xs text-fog mt-0.5">
              {lang === 'de'
                ? 'Dieses Restaurant nimmt gerade keine Bestellungen an.'
                : 'This restaurant is not accepting orders right now.'}
            </p>
          </div>
        </div>
      )}

      {menu.length > 0 && <MenuTabs categories={menu} />}
      <div className="mt-2">
        {menu.length === 0 ? (
          <EmptyMenu lang={lang} name={restaurant.name} />
        ) : (
          menu.map(category => (
            <MenuCategoryComponent
              key={category.id}
              category={category}
              restaurantId={restaurant.id}
              restaurantSlug={restaurant.slug}
              restaurantName={restaurant.name}
              isOpen={restaurant.isOpen}
            />
          ))
        )}
      </div>
      <ReviewsSection restaurantName={restaurant.name} />
    </motion.div>
  )
}

function EmptyMenu({ lang, name }: { lang: string; name: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-20 h-20 bg-wolt-light rounded-full flex items-center justify-center mb-5">
        <ChefHat className="w-9 h-9 text-wolt-base" />
      </div>
      <h3 className="font-bold text-ink text-lg mb-2">
        {lang === 'de' ? 'Speisekarte kommt bald' : 'Menu coming soon'}
      </h3>
      <p className="text-sm text-fog leading-relaxed">
        {lang === 'de'
          ? `${name} ist neu bei Sepette. Die Speisekarte wird in Kürze verfügbar sein.`
          : `${name} is new to Sepette. The menu will be available shortly.`}
      </p>
    </div>
  )
}