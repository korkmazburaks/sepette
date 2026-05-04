import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { OrderRow, OrderItem } from '@/lib/supabase'

export function useOrders(user: User | null) {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) { setOrders([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const placeOrder = async (params: {
    restaurantName: string
    items: OrderItem[]
    total: number
    address: string
    scheduledFor?: string
    guestName?: string
    guestPhone?: string
  }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        restaurant_name: params.restaurantName,
        items: params.items,
        total: params.total,
        address: params.address,
        status: params.scheduledFor ? 'scheduled' : 'confirmed',
        ...(params.scheduledFor ? { scheduled_for: params.scheduledFor } : {}),
        guest_name: params.guestName ?? null,
        guest_phone: params.guestPhone ?? null,
      })
      .select()
      .single()
    if (!error && data) setOrders((prev) => [data, ...prev])
    return error ? null : data
  }

  return { orders, loading, placeOrder, refetch: fetch }
}