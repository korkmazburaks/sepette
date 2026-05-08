import type { Restaurant, MenuCategory, MenuItem } from '@/types'
import { FALLBACK_RESTAURANTS } from '@/data/fallback'
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
}

async function fetchSupabaseRestaurants(): Promise<SupabaseRestaurant[]> {
  try {
    const { data } = await supabase
      .from('restaurants')
      .select('id,slug,name,is_open,paused,hours')
    return (data as SupabaseRestaurant[]) ?? []
  } catch {
    return []
  }
}

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

/* ── fetchMenu — Supabase only ────────────────────────────────────────────── */
export async function fetchMenu(slug: string): Promise<MenuCategory[]> {
  const { data: restaurantData } = await supabase
    .from('restaurants')
    .select('id')
    .eq('slug', slug)
    .single()

  const restaurantId = restaurantData?.id as string | undefined
  if (!restaurantId) return []

  const { data: rawItems } = await supabase
    .from('menu_items')
    .select('id, category, name, description, price, image_url, available, position')
    .eq('restaurant_id', restaurantId)
    .eq('available', true)
    .order('category')
    .order('position')

  if (!rawItems || rawItems.length === 0) return []

  const grouped = new Map<string, MenuItem[]>()
  for (const item of rawItems as {
    id: string; category: string; name: string; description: string
    price: number; image_url: string; available: boolean; position: number
  }[]) {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category)!.push({
      id:          item.id,
      name:        item.name,
      description: item.description || undefined,
      price:       item.price,
      imageUrl:    item.image_url  || undefined,
      isAvailable: true,
    })
  }
  return Array.from(grouped.entries()).map(([catName, items]) => ({
    id:    `cat-${catName}`,
    name:  catName,
    items,
  }))
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