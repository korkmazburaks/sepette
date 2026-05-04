import type { Restaurant } from '@/types'
import { computeIsOpen } from '@/lib/utils'

// hours array: [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
// null = kapalı o gün

const EVERY_DAY = (o: string, c: string) =>
  Array(7).fill({ open: o, close: c }) as Restaurant['hours']

const RAW: Omit<Restaurant, 'isOpen' | 'distanceKm'>[] = [
  {
    id: 'la-mila',
    name: 'La Mila',
    slug: 'la-mila',
    logo: 'https://res.cloudinary.com/tkwy-prod-eu/image/upload/c_pad,h_100,w_100/v1/static-takeaway-com/images/restaurants/de/R0N35713/logo',
    hero: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=85',
    rating: 4.5,
    reviewCount: 400,
    deliveryFee: 0,
    minOrder: 15.00,
    deliveryTime: 35,
    cuisines: ['Italienisch', 'Pizza', 'Pasta', 'Burger'],
    address: 'Marienstraße 8, 89231 Neu-Ulm',
    lat: 48.3957,
    lng: 9.9965,
    hours: EVERY_DAY('11:00', '22:00'),
  },
  {
    id: 'pizza-palace-ulm',
    name: 'Pizza Palace',
    slug: 'pizza-palace-ulm',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
    hero: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=85',
    rating: 4.2,
    reviewCount: 189,
    deliveryFee: 1.99,
    minOrder: 12.00,
    deliveryTime: 25,
    cuisines: ['Pizza', 'Italienisch'],
    address: 'Bahnhofstr. 10, 89231 Neu-Ulm',
    lat: 48.3988,
    lng: 10.0012,
    // Mon kapalı
    hours: [
      { open: '11:30', close: '23:00' }, // Sun
      null,                               // Mon
      { open: '11:30', close: '23:00' }, // Tue
      { open: '11:30', close: '23:00' }, // Wed
      { open: '11:30', close: '23:00' }, // Thu
      { open: '11:30', close: '23:30' }, // Fri
      { open: '11:30', close: '23:30' }, // Sat
    ],
  },
  {
    id: 'burger-house-ulm',
    name: 'Burger House',
    slug: 'burger-house-ulm',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
    hero: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=85',
    rating: 4.5,
    reviewCount: 312,
    deliveryFee: 0.00,
    minOrder: 10.00,
    deliveryTime: 20,
    cuisines: ['Burger', 'Amerikanisch'],
    address: 'Münchner Str. 5, 89231 Neu-Ulm',
    lat: 48.3946,
    lng: 9.9980,
    hours: EVERY_DAY('10:00', '22:00'),
  },
  {
    id: 'sushi-garden-ulm',
    name: 'Sushi Garden',
    slug: 'sushi-garden-ulm',
    logo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&q=80',
    hero: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=85',
    rating: 4.6,
    reviewCount: 97,
    deliveryFee: 3.49,
    minOrder: 20.00,
    deliveryTime: 40,
    cuisines: ['Sushi', 'Japanisch'],
    address: 'Silcherstr. 12, 89231 Neu-Ulm',
    lat: 48.3976,
    lng: 9.9996,
    // Tue-Sun açık, Mon kapalı
    hours: [
      { open: '12:00', close: '22:00' }, // Sun
      null,                               // Mon
      { open: '12:00', close: '22:00' }, // Tue
      { open: '12:00', close: '22:00' }, // Wed
      { open: '12:00', close: '22:00' }, // Thu
      { open: '12:00', close: '22:30' }, // Fri
      { open: '12:00', close: '22:30' }, // Sat
    ],
  },
  {
    id: 'don-giovanni-ulm',
    name: 'Don Giovanni',
    slug: 'don-giovanni-ulm',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
    hero: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=85',
    rating: 4.3,
    reviewCount: 156,
    deliveryFee: 2.49,
    minOrder: 15.00,
    deliveryTime: 35,
    cuisines: ['Pasta', 'Italienisch'],
    address: 'Ludwigstr. 8, 89231 Neu-Ulm',
    lat: 48.3968,
    lng: 10.0024,
    hours: [
      { open: '12:00', close: '22:00' }, // Sun
      null,                               // Mon — Ruhetag
      { open: '12:00', close: '22:00' }, // Tue
      { open: '12:00', close: '22:00' }, // Wed
      { open: '12:00', close: '22:00' }, // Thu
      { open: '12:00', close: '22:30' }, // Fri
      { open: '12:00', close: '22:30' }, // Sat
    ],
  },
]

export const FALLBACK_RESTAURANTS: Restaurant[] = RAW.map((r) => ({
  ...r,
  isOpen: computeIsOpen(r.hours),
}))