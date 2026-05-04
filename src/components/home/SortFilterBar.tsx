import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLangStore } from '@/store/langStore'

export type SortKey = 'default' | 'rating' | 'distance' | 'time' | 'minorder'

export interface FilterState {
  sort: SortKey
  freeDelivery: boolean
  openNow: boolean
  maxTime: number | null  // null = no limit
}

export const DEFAULT_FILTERS: FilterState = {
  sort: 'default',
  freeDelivery: false,
  openNow: false,
  maxTime: null,
}

interface Props {
  value: FilterState
  onChange: (f: FilterState) => void
}

export function SortFilterBar({ value, onChange }: Props) {
  const { lang } = useLangStore()
  const de = lang === 'de'
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeCount = [
    value.sort !== 'default',
    value.freeDelivery,
    value.openNow,
    value.maxTime !== null,
  ].filter(Boolean).length

  const sortLabels: Record<SortKey, string> = de
    ? { default: 'Empfohlen', rating: 'Bewertung', distance: 'Entfernung', time: 'Lieferzeit', minorder: 'Mindestbestellung' }
    : { default: 'Recommended', rating: 'Rating', distance: 'Distance', time: 'Delivery time', minorder: 'Min. order' }

  const MAX_TIME_OPTIONS = [20, 30, 45, 60]

  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })

  return (
    <>
      <div className="scroll-x flex gap-2 px-4 pb-2 pt-1">
        {/* Sort / Filter button */}
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            'flex-none flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-medium border transition-all',
            activeCount > 0
              ? 'bg-wolt-base text-white border-wolt-base shadow-wolt'
              : 'bg-canvas text-slate border-cloud hover:bg-mist',
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {de ? 'Filter' : 'Filter'}
          {activeCount > 0 && (
            <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick filter chips */}
        <button
          onClick={() => set({ freeDelivery: !value.freeDelivery })}
          className={cn(
            'flex-none px-3 py-2 rounded-2xl text-sm font-medium border transition-all whitespace-nowrap',
            value.freeDelivery
              ? 'bg-wolt-base text-white border-wolt-base'
              : 'bg-canvas text-slate border-cloud hover:bg-mist',
          )}
        >
          {de ? 'Gratis Lieferung' : 'Free delivery'}
        </button>

        <button
          onClick={() => set({ openNow: !value.openNow })}
          className={cn(
            'flex-none px-3 py-2 rounded-2xl text-sm font-medium border transition-all whitespace-nowrap',
            value.openNow
              ? 'bg-emerald text-white border-emerald'
              : 'bg-canvas text-slate border-cloud hover:bg-mist',
          )}
        >
          {de ? 'Jetzt geöffnet' : 'Open now'}
        </button>

        {/* Active sort label chip */}
        {value.sort !== 'default' && (
          <button
            onClick={() => set({ sort: 'default' })}
            className="flex-none flex items-center gap-1 px-3 py-2 rounded-2xl text-sm font-medium border bg-wolt-light text-wolt-base border-wolt-base whitespace-nowrap"
          >
            {sortLabels[value.sort]}
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Full filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/50 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
              <div className="w-full max-w-mobile pointer-events-auto">
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0, transition: { type: 'spring', damping: 30, stiffness: 320 } }}
                  exit={{ y: '100%', transition: { duration: 0.2 } }}
                  className="bg-canvas rounded-t-3xl px-5 pt-4 pb-safe"
                >
                  {/* handle */}
                  <div className="flex justify-center mb-4">
                    <div className="w-10 h-1 bg-cloud rounded-full" />
                  </div>

                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-ink">{de ? 'Sortieren & Filtern' : 'Sort & Filter'}</h2>
                    <div className="flex items-center gap-2">
                      {activeCount > 0 && (
                        <button
                          onClick={() => { onChange(DEFAULT_FILTERS); setSheetOpen(false) }}
                          className="text-xs font-semibold text-wolt-base"
                        >
                          {de ? 'Zurücksetzen' : 'Reset'}
                        </button>
                      )}
                      <button onClick={() => setSheetOpen(false)}
                        className="w-8 h-8 rounded-full bg-mist flex items-center justify-center">
                        <X className="w-4 h-4 text-fog" />
                      </button>
                    </div>
                  </div>

                  {/* Sort */}
                  <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2">
                    {de ? 'Sortieren nach' : 'Sort by'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {(Object.keys(sortLabels) as SortKey[]).map(key => (
                      <button
                        key={key}
                        onClick={() => set({ sort: key })}
                        className={cn(
                          'flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-all',
                          value.sort === key
                            ? 'bg-wolt-base text-white border-wolt-base'
                            : 'bg-mist text-ink border-cloud',
                        )}
                      >
                        {sortLabels[key]}
                        {value.sort === key && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>

                  {/* Filters */}
                  <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-2">
                    {de ? 'Filter' : 'Filters'}
                  </p>
                  <div className="space-y-2 mb-5">
                    {/* Free delivery toggle */}
                    <button
                      onClick={() => set({ freeDelivery: !value.freeDelivery })}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all',
                        value.freeDelivery ? 'bg-wolt-light border-wolt-base' : 'bg-mist border-cloud',
                      )}
                    >
                      <span className="text-sm font-medium text-ink">
                        {de ? 'Nur Gratis-Lieferung' : 'Free delivery only'}
                      </span>
                      {value.freeDelivery && <Check className="w-4 h-4 text-wolt-base" />}
                    </button>

                    {/* Open now toggle */}
                    <button
                      onClick={() => set({ openNow: !value.openNow })}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all',
                        value.openNow ? 'bg-emerald/10 border-emerald' : 'bg-mist border-cloud',
                      )}
                    >
                      <span className="text-sm font-medium text-ink">
                        {de ? 'Jetzt geöffnet' : 'Open now'}
                      </span>
                      {value.openNow && <Check className="w-4 h-4 text-emerald" />}
                    </button>

                    {/* Max delivery time */}
                    <div>
                      <p className="text-xs font-medium text-fog mb-2 px-1">
                        {de ? 'Max. Lieferzeit' : 'Max. delivery time'}
                      </p>
                      <div className="flex gap-2">
                        {MAX_TIME_OPTIONS.map(t => (
                          <button
                            key={t}
                            onClick={() => set({ maxTime: value.maxTime === t ? null : t })}
                            className={cn(
                              'flex-1 py-2 rounded-2xl border text-sm font-medium transition-all',
                              value.maxTime === t
                                ? 'bg-wolt-base text-white border-wolt-base'
                                : 'bg-mist text-ink border-cloud',
                            )}
                          >
                            {t} min
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSheetOpen(false)}
                    className="w-full bg-wolt-base text-white font-semibold py-4 rounded-2xl text-sm active:scale-[0.98] transition-transform mb-2"
                  >
                    {de ? 'Anwenden' : 'Apply'}
                  </button>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}