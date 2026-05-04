import { create } from 'zustand'
import type { Lang } from '@/i18n'

interface LangStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangStore>((set) => ({
  lang: 'de',
  setLang: (lang) => set({ lang }),
}))