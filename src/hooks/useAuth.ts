import { useEffect, useState } from 'react'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  user: User | null
  loading: boolean
  emailPending: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, emailPending: null })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false, emailPending: null })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((s) => ({ ...s, user: session?.user ?? null, loading: false }))
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (!error) setState((s) => ({ ...s, emailPending: email }))
    return error
  }

  const signIn = async (email: string, password: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState((s) => ({ ...s, emailPending: null }))
  }

  const clearPending = () => setState((s) => ({ ...s, emailPending: null }))

  const changePassword = async (newPassword: string): Promise<AuthError | null> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return error
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!state.user) return null
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${state.user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) return null
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = `${data.publicUrl}?t=${Date.now()}`
    await supabase.auth.updateUser({ data: { avatar_url: url, avatar_emoji: '' } })
    return url
  }

  const setAvatarEmoji = async (emoji: string): Promise<void> => {
    await supabase.auth.updateUser({ data: { avatar_emoji: emoji, avatar_url: '' } })
  }

  return {
    ...state,
    signUp, signIn, signInWithGoogle, signInWithApple,
    signOut, clearPending, changePassword, uploadAvatar, setAvatarEmoji,
  }
}