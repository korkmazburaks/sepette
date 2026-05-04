import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  as string
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

/* ─── DB row types ──────────────────────────────────────────────────────────── */
export interface AddressRow {
  id: string
  user_id: string
  label: string
  is_active: boolean
  created_at: string
}

export interface OrderRow {
  id: string
  user_id: string | null
  restaurant_name: string
  items: OrderItem[]
  total: number
  address: string
  status: 'scheduled' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
  scheduled_for: string | null
  estimated_minutes: number | null
  created_at: string
  guest_name: string | null
  guest_phone: string | null
}

export interface OrderItem {
  name: string
  price: number
  qty: number
}