import type { Restaurant, MenuCategory, MenuItem } from '@/types'
import { FALLBACK_RESTAURANTS } from '@/data/fallback'
import { LAMILA_MENU } from '@/data/lamila-menu'
import { PIZZA_PALACE_MENU, BURGER_HOUSE_MENU, SUSHI_GARDEN_MENU, DON_GIOVANNI_MENU } from '@/data/other-menus'
import { supabase } from '@/lib/supabase'
import { computeIsOpen } from '@/lib/utils'

const BASE = '/api/lieferando'

/* ── Supabase restaurant live state ───────────────────────────────────────── */
interface SupabaseRestaurant {
  id: string
  slug: string
  name: string
  is_open: boolean
  paused: boolean
  hours: ({ open: string; close: string } | null)[]
  unavailable_item_ids: string[]
}

async function fetchSupabaseRestaurants(): Promise<SupabaseRestaurant[]> {
  try {
    const { data } = await supabase
      .from('restaurants')
      .select('id,slug,name,is_open,paused,hours,unavailable_item_ids')
    return (data as SupabaseRestaurant[]) ?? []
  } catch {
    return []
  }
}

/* ── Local menus ──────────────────────────────────────────────────────────── */
const LOCAL_MENUS: Record<string, MenuCategory[]> = {
  'la-mila':          LAMILA_MENU,
  'pizza-palace-ulm': PIZZA_PALACE_MENU,
  'burger-house-ulm': BURGER_HOUSE_MENU,
  'sushi-garden-ulm': SUSHI_GARDEN_MENU,
  'don-giovanni-ulm': DON_GIOVANNI_MENU,
}

// keep for backwards compat (used in restoran panel's localMenus)
export const MENUS = LOCAL_MENUS

/* ── fetchRestaurants — merges static fallback with Supabase live state ───── */
export async function fetchRestaurants(): Promise<Restaurant[]> {
  const [staticList, supabaseList] = await Promise.all([
    fetchStaticRestaurants(),
    fetchSupabaseRestaurants(),
  ])

  const liveMap = new Map(supabaseList.map(r => [r.slug, r]))

  return staticList.map(r => {
    const live = liveMap.get(r.slug)
    if (!live) return r
    // Live hours override static, then compute isOpen
    const hours = live.hours ?? r.hours
    const isOpen = live.is_open && !live.paused && computeIsOpen(hours)
    return { ...r, hours, isOpen }
  })
}

async function fetchStaticRestaurants(): Promise<Restaurant[]> {
  try {
    const url = `${BASE}/api/v33/restaurants?lat=48.3830&lng=10.0000&limit=20&deliveryMethods=delivery&language=de`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as { restaurants?: Record<string, unknown>[] }
    return (data.restaurants ?? []).map(mapRestaurant)
  } catch {
    return FALLBACK_RESTAURANTS
  }
}

/* ── fetchMenu — local items + Supabase custom items, minus unavailable ───── */
export async function fetchMenu(slug: string): Promise<MenuCategory[]> {
  const localMenu = LOCAL_MENUS[slug] ?? []

  // Get restaurant's unavailable IDs and custom DB items
  const [liveData, dbItems] = await Promise.allSettled([
    supabase.from('restaurants').select('unavailable_item_ids,id').eq('slug', slug).single(),
    supabase.from('menu_items').select('*').eq('available', true).order('category').order('position'),
  ])

  const unavailableIds = new Set<string>(
    liveData.status === 'fulfilled' ? (liveData.value.data?.unavailable_item_ids ?? []) : []
  )
  const restaurantId = liveData.status === 'fulfilled' ? liveData.value.data?.id : null

  // Filter local menu by unavailableIds
  const filteredLocal = localMenu.map(cat => ({
    ...cat,
    items: cat.items.filter(item => !unavailableIds.has(item.id)),
  })).filter(cat => cat.items.length > 0)

  // Merge Supabase custom items (only for this restaurant)
  if (dbItems.status === 'fulfilled' && restaurantId) {
    const rawDbItems = (dbItems.value.data ?? []) as {
      id: string; restaurant_id: string; category: string
      name: string; description: string; price: number
      image_url: string; available: boolean; position: number; created_at: string
    }[]

    const restaurantDbItems = rawDbItems.filter(i => i.restaurant_id === restaurantId)

    if (restaurantDbItems.length > 0) {
      const grouped = new Map<string, MenuItem[]>()
      for (const item of restaurantDbItems) {
        if (!grouped.has(item.category)) grouped.set(item.category, [])
        grouped.get(item.category)!.push({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          price: item.price,
          imageUrl: item.image_url || undefined,
        })
      }

      // Prepend DB categories that don't already exist, append new ones
      const existingCatNames = new Set(filteredLocal.map(c => c.name))
      for (const [catName, items] of grouped) {
        if (existingCatNames.has(catName)) {
          const cat = filteredLocal.find(c => c.name === catName)!
          cat.items = [...items, ...cat.items]
        } else {
          filteredLocal.unshift({
            id: `db-${catName}`,
            name: catName,
            items,
          })
        }
      }
    }
  }

  return filteredLocal
}

function mapRestaurant(raw: Record<string, unknown>): Restaurant {
  const rating      = raw.rating     as Record<string, number> | undefined
  const deliveryFee = raw.deliveryFee as Record<string, number> | undefined
  const minOrder    = raw.minimumOrderValue as Record<string, number> | undefined
  const location    = raw.location   as Record<string, string | number> | undefined
  const cuisines    = raw.cuisines   as Array<Record<string, string>> | undefined

  return {
    id:           String(raw.publicId ?? raw.id ?? ''),
    name:         String(raw.name ?? ''),
    slug:         String(raw.primarySlug ?? raw.slug ?? ''),
    logo:         String(raw.logoUrl ?? ''),
    hero:         raw.heroImageUrl ? String(raw.heroImageUrl) : null,
    rating:       (rating?.score ?? 0) / 2,
    reviewCount:  rating?.votes ?? 0,
    deliveryFee:  (deliveryFee?.amount ?? 0) / 100,
    minOrder:     (minOrder?.amount ?? 0) / 100,
    deliveryTime: Number(raw.deliveryTime ?? 30),
    cuisines:     (cuisines ?? []).map(c => c.name),
    isOpen:       Boolean(raw.isOpen ?? false),
    address:      String(location?.address ?? ''),
    lat:          Number(location?.latitude ?? 0),
    lng:          Number(location?.longitude ?? 0),
    hours:        [],
  }
}