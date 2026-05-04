import { create } from 'zustand'

interface LocationStore {
  lat: number | null
  lng: number | null
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'
  request: () => void
}

export const useLocationStore = create<LocationStore>((set) => ({
  lat: null,
  lng: null,
  status: 'idle',

  request: () => {
    if (!navigator.geolocation) {
      set({ status: 'unavailable' })
      return
    }
    set({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) => set({ lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'granted' }),
      () => set({ status: 'denied' }),
      { timeout: 8000, maximumAge: 60_000 },
    )
  },
}))