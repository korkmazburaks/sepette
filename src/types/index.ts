export interface DayHours { open: string; close: string }
// index 0=Sun 1=Mon 2=Tue 3=Wed 4=Thu 5=Fri 6=Sat  — null means closed
export type WeekHours = (DayHours | null)[]

export interface Restaurant {
  id: string
  name: string
  slug: string
  logo: string
  hero: string | null
  rating: number
  reviewCount: number
  deliveryFee: number
  minOrder: number
  deliveryTime: number
  cuisines: string[]
  isOpen: boolean        // computed at runtime from hours; kept for fallback
  address: string
  lat: number
  lng: number
  hours: WeekHours       // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
  distanceKm?: number    // injected after geolocation
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  popular?: boolean
  isAvailable?: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  restaurantId: string
}