import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === 'light' ? 'dark' : 'light'
      applyTheme(next)
      return { theme: next }
    }),
}))