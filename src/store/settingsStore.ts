import { create } from 'zustand'

export type NotifPermission = 'granted' | 'denied' | 'default' | 'unsupported'
export type LabelType = 'home' | 'work' | 'school' | 'custom'

export interface SavedAddress {
  id: string
  labelType: LabelType
  customLabel: string   // used when labelType === 'custom'
  address: string       // full address string
}

interface SettingsStore {
  notifications: boolean
  notifPermission: NotifPermission
  addresses: SavedAddress[]
  activeAddress: string
  phone: string
  requestNotifications: () => Promise<void>
  setNotifications: (val: boolean) => void
  addAddress: (entry: Omit<SavedAddress, 'id'>) => void
  setActiveAddress: (address: string) => void
  removeAddress: (id: string) => void
  setPhone: (phone: string) => void
  getDisplayLabel: (de: boolean) => string
}

function getInitialPermission(): NotifPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as NotifPermission
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  notifications: false,
  notifPermission: getInitialPermission(),
  addresses: [],
  activeAddress: '',
  phone: '',

  requestNotifications: async () => {
    const { notifications, notifPermission } = get()
    if (notifications) { set({ notifications: false }); return }
    if (notifPermission === 'unsupported') return
    if (notifPermission === 'denied') { set({ notifPermission: 'denied' }); return }
    if (notifPermission === 'granted') { set({ notifications: true }); return }
    try {
      const result = await Notification.requestPermission()
      set({ notifPermission: result as NotifPermission, notifications: result === 'granted' })
    } catch {
      set({ notifications: false })
    }
  },

  setNotifications: (val) => set({ notifications: val }),

  addAddress: (entry) => {
    const { addresses, activeAddress } = get()
    const existing = addresses.find(a => a.address === entry.address)
    if (existing) {
      set({ activeAddress: entry.address })
      return
    }
    const newAddr: SavedAddress = { ...entry, id: crypto.randomUUID() }
    set({
      addresses: [...addresses, newAddr],
      activeAddress: activeAddress || entry.address,
    })
  },

  setActiveAddress: (address) => set({ activeAddress: address }),

  setPhone: (phone) => set({ phone }),

  removeAddress: (id) => {
    const { addresses, activeAddress } = get()
    const next = addresses.filter(a => a.id !== id)
    const removed = addresses.find(a => a.id === id)
    set({
      addresses: next,
      activeAddress: removed?.address === activeAddress ? (next[0]?.address ?? '') : activeAddress,
    })
  },

  getDisplayLabel: (de) => {
    const { addresses, activeAddress } = get()
    if (!activeAddress) return ''
    const found = addresses.find(a => a.address === activeAddress)
    if (!found) return activeAddress
    if (found.labelType === 'custom') return found.customLabel || activeAddress
    const map: Record<LabelType, { de: string; en: string }> = {
      home:   { de: 'Zuhause', en: 'Home'   },
      work:   { de: 'Arbeit',  en: 'Work'   },
      school: { de: 'Schule',  en: 'School' },
      custom: { de: activeAddress, en: activeAddress },
    }
    return map[found.labelType][de ? 'de' : 'en']
  },
}))