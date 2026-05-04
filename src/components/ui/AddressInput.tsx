import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isInDeliveryZone } from '@/lib/utils'

interface Suggestion {
  place_id: number
  display_name: string
  short: string
  lat: number
  lng: number
  inZone: boolean
}

export interface AddressMeta {
  inZone: boolean
  lat: number
  lng: number
}

interface AddressInputProps {
  value: string
  onChange: (val: string) => void
  onSelect: (address: string, meta: AddressMeta) => void
  placeholder?: string
}

function shorten(display: string): string {
  const parts = display.split(', ')
  return parts.slice(0, Math.min(3, parts.length)).join(', ')
}

export function AddressInput({ value, onChange, onSelect, placeholder }: AddressInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 3) {
      setSuggestions([])
      setOpen(false)
      setNotFound(false)
      return
    }

    setNotFound(false)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&countrycodes=de&limit=5`
        const res = await fetch(url, { headers: { 'Accept-Language': 'de' } })
        const data = await res.json() as { place_id: number; display_name: string; lat: string; lon: string }[]
        const items: Suggestion[] = data.map((d) => {
          const lat = parseFloat(d.lat)
          const lng = parseFloat(d.lon)
          return {
            place_id: d.place_id,
            display_name: d.display_name,
            short: shorten(d.display_name),
            lat,
            lng,
            inZone: isInDeliveryZone(lat, lng),
          }
        })
        setSuggestions(items)
        setOpen(items.length > 0)
        setNotFound(items.length === 0)
      } catch {
        setSuggestions([])
        setNotFound(false)
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (s: Suggestion) => {
    onSelect(s.short, { inZone: s.inZone, lat: s.lat, lng: s.lng })
    onChange(s.short)
    setSuggestions([])
    setOpen(false)
    setNotFound(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-mist rounded-2xl px-3 py-2.5">
        {loading
          ? <Loader className="w-4 h-4 text-wolt-base flex-none animate-spin" />
          : <MapPin className="w-4 h-4 text-fog flex-none" />
        }
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value) }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder ?? 'Adresse eingeben…'}
          className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none"
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {/* Suggestions dropdown — opens upward so it's never clipped by sheet bottom */}
        {open && suggestions.length > 0 && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 bottom-full mb-1.5 bg-canvas rounded-2xl shadow-card-hover border border-cloud overflow-hidden z-50"
          >
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-mist transition-colors border-b border-cloud last:border-0"
              >
                <MapPin className={`w-3.5 h-3.5 flex-none mt-0.5 ${s.inZone ? 'text-wolt-base' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-ink leading-snug">{s.short}</span>
                  {!s.inZone && (
                    <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                      Aktuell keine Lieferung · kommt bald
                    </p>
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Not found */}
        {notFound && !loading && value.trim().length >= 3 && (
          <motion.div
            key="notfound"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 bottom-full mb-1.5 bg-canvas rounded-2xl shadow-card border border-cloud px-4 py-3 z-50 flex items-center gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-none" />
            <span className="text-sm text-fog">Keine Adresse gefunden</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}