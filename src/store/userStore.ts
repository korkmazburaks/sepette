import { create } from 'zustand'

interface User {
  name: string
  email: string
}

interface UserStore {
  user: User | null
  signIn: (name: string, email: string) => void
  signOut: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  signIn: (name, email) => set({ user: { name, email } }),
  signOut: () => set({ user: null }),
}))