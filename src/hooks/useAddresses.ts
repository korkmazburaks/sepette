import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { AddressRow } from '@/lib/supabase'

export function useAddresses(user: User | null) {
  const [addresses, setAddresses] = useState<AddressRow[]>([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) { setAddresses([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
    setAddresses(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const addAddress = async (label: string) => {
    if (!user || !label.trim()) return
    // deactivate others if this is the first
    const isFirst = addresses.length === 0
    const { data } = await supabase
      .from('addresses')
      .insert({ user_id: user.id, label: label.trim(), is_active: isFirst })
      .select()
      .single()
    if (data) setAddresses((prev) => [...prev, data])
  }

  const setActive = async (id: string) => {
    if (!user) return
    await supabase.from('addresses').update({ is_active: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_active: true }).eq('id', id)
    setAddresses((prev) => prev.map((a) => ({ ...a, is_active: a.id === id })))
  }

  const remove = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id)
      if (next.length > 0 && !next.some((a) => a.is_active)) {
        setActive(next[0].id)
      }
      return next
    })
  }

  const activeAddress = addresses.find((a) => a.is_active)

  return { addresses, loading, addAddress, setActive, remove, activeAddress, refetch: fetch }
}