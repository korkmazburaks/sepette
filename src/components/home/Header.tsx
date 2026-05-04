import { useState } from 'react'
import { MapPin, Bell, X, ChevronDown } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useLangStore } from '@/store/langStore'
import { useSettingsStore } from '@/store/settingsStore'
import { getT } from '@/i18n'
import { LangToggle } from '@/components/ui/LangToggle'
import { AddressModal } from '@/components/ui/AddressModal'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (q: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { lang } = useLangStore()
  const { activeAddress } = useSettingsStore()
  const t = getT(lang)
  const de = lang === 'de'
  const [sheetOpen, setSheetOpen] = useState(false)

  const addressLabel = activeAddress
    ? (activeAddress.length > 22 ? activeAddress.slice(0, 22) + '…' : activeAddress)
    : (de ? 'Adresse wählen' : 'Select address')

  return (
    <>
      <header className="pt-safe px-4 pb-3 bg-snow sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-ink leading-none tracking-tight">Sepette</span>
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-1 mt-0.5 active:opacity-70 transition-opacity"
            >
              <MapPin className="w-3.5 h-3.5 text-wolt-base flex-none" />
              <span className={`text-xs ${activeAddress ? 'text-ink font-medium' : 'text-fog'}`}>
                {addressLabel}
              </span>
              <ChevronDown className="w-3 h-3 text-fog" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <LangToggle size="sm" />
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-mist">
              <Bell className="w-5 h-5 text-ink" />
            </button>
          </div>
        </div>

        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fog" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={t.search}
            className="w-full bg-mist rounded-2xl pl-10 pr-10 py-3 text-sm text-ink placeholder:text-fog outline-none focus:ring-2 focus:ring-wolt-base/30 transition-all"
            style={{ fontSize: '16px' }}
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-fog" />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {sheetOpen && <AddressModal key="addr" onClose={() => setSheetOpen(false)} de={de} />}
      </AnimatePresence>
    </>
  )
}