import { create } from 'zustand'

type Mode = 'delivery' | 'pickup'

interface DeliveryStore {
  mode: Mode
  setMode: (mode: Mode) => void
}

export const useDeliveryStore = create<DeliveryStore>((set) => ({
  mode: 'delivery',
  setMode: (mode) => set({ mode }),
}))