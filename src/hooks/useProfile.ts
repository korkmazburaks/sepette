import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { ProfileRow } from '@/lib/supabase'

export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setProfile(null); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) { setProfile(data ?? null); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [user?.id])

  const updateProfile = async (
    data: Partial<Pick<ProfileRow, 'full_name' | 'phone' | 'avatar_url'>>
  ) => {
    if (!user) return null
    const { error } = await supabase.from('profiles').upsert(
      { id: user.id, ...data, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    if (!error) {
      setProfile(p =>
        p
          ? { ...p, ...data }
          : {
              id: user.id,
              full_name: null,
              phone: null,
              avatar_url: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...data,
            }
      )
    }
    return error
  }

  return { profile, loading, updateProfile }
}