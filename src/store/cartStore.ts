import { create } from 'zustand'
import type { CartItem, MenuItem } from '@/types'

interface CartStore {
  items: CartItem[]
  restaurantId: string | null
  restaurantSlug: string | null
  restaurantName: string | null
  restaurantIsOpen: boolean
  isSheetOpen: boolean
  addItem:        (item: MenuItem, restaurantId: string, isOpen?: boolean, slug?: string, name?: string) => void
  removeItem:     (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart:      () => void
  openSheet:      () => void
  closeSheet:     () => void
  setRestaurantIsOpen: (slug: string, isOpen: boolean) => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantSlug: null,
  restaurantName: null,
  restaurantIsOpen: true,
  isSheetOpen: false,

  addItem: (item, restaurantId, isOpen = true, slug, name) => {
    if (get().restaurantId && get().restaurantId !== restaurantId) {
      set({ items: [], restaurantId, restaurantSlug: slug ?? null, restaurantName: name ?? null, restaurantIsOpen: isOpen })
    } else {
      set({ restaurantIsOpen: isOpen, restaurantSlug: slug ?? get().restaurantSlug, restaurantName: name ?? get().restaurantName })
    }
    set((s) => {
      const existing = s.items.find(i => i.id === item.id)
      if (existing) {
        return { items: s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return { restaurantId, items: [...s.items, { ...item, quantity: 1, restaurantId }] }
    })
  },

  setRestaurantIsOpen: (slug, isOpen) => {
    if (get().restaurantSlug === slug) set({ restaurantIsOpen: isOpen })
  },

  removeItem: (id) => set((s) => ({ items: s.items.filter(i => i.id !== id) })),

  updateQuantity: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return }
    set((s) => ({ items: s.items.map(i => i.id === id ? { ...i, quantity: qty } : i) }))
  },

  clearCart:  () => set({ items: [], restaurantId: null, restaurantName: null }),
  openSheet:  () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}))