import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Locate, Loader, Phone, Home, Trash2, Check, AlertTriangle, Pencil, Briefcase, GraduationCap } from 'lucide-react'
import { useSettingsStore, type LabelType } from '@/store/settingsStore'
import { isInDeliveryZone } from '@/lib/utils'

interface Suggestion {
  place_id: number
  display_name: string
  short: string
  street: string
  lat: number
  lng: number
  inZone: boolean
}

function shorten(display: string): string {
  const parts = display.split(', ')
  return parts.slice(0, Math.min(3, parts.length)).join(', ')
}

async function nominatimSearch(query: string): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=de&limit=6`
  const res = await fetch(url, { headers: { 'Accept-Language': 'de' } })
  const data = await res.json() as { place_id: number; display_name: string; lat: string; lon: string; address?: { road?: string } }[]
  return data.map(d => {
    const lat = parseFloat(d.lat)
    const lng = parseFloat(d.lon)
    return {
      place_id: d.place_id,
      display_name: d.display_name,
      short: shorten(d.display_name),
      street: d.address?.road ?? d.display_name.split(',')[0],
      lat, lng,
      inZone: isInDeliveryZone(lat, lng),
    }
  })
}

async function nominatimReverse(lat: number, lng: number): Promise<{ short: string; street: string; houseNum: string }> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
  const res = await fetch(url, { headers: { 'Accept-Language': 'de' } })
  const data = await res.json() as { display_name: string; address?: { road?: string; house_number?: string; city?: string; town?: string; postcode?: string } }
  const addr = data.address ?? {}
  const street = addr.road ?? data.display_name.split(',')[0]
  const city = addr.city ?? addr.town ?? ''
  const postcode = addr.postcode ?? ''
  const short = [street, postcode, city].filter(Boolean).join(', ')
  return { short, street, houseNum: addr.house_number ?? '' }
}

interface AddressModalProps {
  onClose: () => void
  de: boolean
}

export function AddressModal({ onClose, de }: AddressModalProps) {
  const { addresses, activeAddress, addAddress, setActiveAddress, removeAddress } = useSettingsStore()

  const [stage, setStage] = useState<'home' | 'form'>('home')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [gpsLoading, setGpsLoading] = useState(false)

  // form fields
  const [baseShort, setBaseShort] = useState('')
  const [baseStreet, setBaseStreet] = useState('')
  const [baseInZone, setBaseInZone] = useState(true)
  const [houseNumber, setHouseNumber] = useState('')
  const [apartment, setApartment] = useState('')
  const [phone, setPhone] = useState(useSettingsStore.getState().phone ?? '')
  const [labelType, setLabelType] = useState<LabelType>('home')
  const [customLabel, setCustomLabel] = useState('')
  const [formError, setFormError] = useState('')
  const [zoneWarning, setZoneWarning] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 3) {
      setSuggestions([])
      setNotFound(false)
      return
    }
    setNotFound(false)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await nominatimSearch(query)
        setSuggestions(results)
        setNotFound(results.length === 0)
      } catch {
        setSuggestions([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  const openForm = (short: string, street: string, inZone: boolean, houseNum = '') => {
    setBaseShort(short)
    setBaseStreet(street)
    setBaseInZone(inZone)
    setHouseNumber(houseNum)
    setApartment('')
    setFormError('')
    setZoneWarning(false)
    setStage('form')
  }

  const handleGPS = () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { short, street, houseNum } = await nominatimReverse(pos.coords.latitude, pos.coords.longitude)
          const inZone = isInDeliveryZone(pos.coords.latitude, pos.coords.longitude)
          openForm(short, street, inZone, houseNum)
        } catch { /* ignore */ }
        finally { setGpsLoading(false) }
      },
      () => setGpsLoading(false),
    )
  }

  const handleSave = () => {
    if (!houseNumber.trim()) {
      setFormError(de ? 'Bitte Hausnummer eingeben.' : 'Please enter a house number.')
      return
    }
    const cityPart = baseShort.split(',').slice(1).join(',').trim()
    const streetWithNum = `${baseStreet} ${houseNumber.trim()}`
    const parts = [streetWithNum, apartment.trim() || null, cityPart || null].filter(Boolean)
    const full = parts.join(', ')

    if (phone.trim()) useSettingsStore.setState({ phone: phone.trim() })
    addAddress({ labelType, customLabel: customLabel.trim(), address: full })
    setActiveAddress(full)

    if (baseInZone) {
      onClose()
    } else {
      setZoneWarning(true)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[59] bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Mobile-width container — outer div handles centering, motion.div handles slide */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-mobile z-[60] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-canvas flex flex-col pointer-events-auto"
          initial={{ x: '100%' }}
          animate={{ x: 0, transition: { type: 'spring', damping: 30, stiffness: 320 } }}
          exit={{ x: '100%', transition: { duration: 0.22 } }}
        >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="pt-safe flex-none border-b border-cloud">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={stage === 'form' ? () => { setStage('home'); setZoneWarning(false) } : onClose}
            className="w-9 h-9 rounded-full bg-mist flex items-center justify-center flex-none"
          >
            <ArrowLeft className="w-5 h-5 text-ink" />
          </button>
          <h1 className="text-lg font-bold text-ink">
            {stage === 'form'
              ? (de ? 'Adresse ergänzen' : 'Complete address')
              : (de ? 'Lieferadresse' : 'Delivery address')}
          </h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Stage: Home ────────────────────────────────── */}
        {stage === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-4 pt-5 space-y-3">
              {/* GPS button */}
              <button
                onClick={handleGPS}
                disabled={gpsLoading}
                className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl bg-wolt-light border border-wolt-base/20 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {gpsLoading
                  ? <Loader className="w-5 h-5 text-wolt-base animate-spin flex-none" />
                  : <Locate className="w-5 h-5 text-wolt-base flex-none" />
                }
                <div className="text-left">
                  <p className="text-sm font-semibold text-wolt-base leading-tight">
                    {de ? 'Meinen Standort verwenden' : 'Use my location'}
                  </p>
                  <p className="text-xs text-fog leading-tight mt-0.5">GPS</p>
                </div>
              </button>

              {/* Search input */}
              <div className="flex items-center gap-2.5 bg-mist rounded-2xl px-4 py-3.5 ring-0 focus-within:ring-2 focus-within:ring-wolt-base/30 transition-all">
                {searching
                  ? <Loader className="w-4 h-4 text-wolt-base flex-none animate-spin" />
                  : <MapPin className="w-4 h-4 text-fog flex-none" />
                }
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={de ? 'Straße suchen…' : 'Search street…'}
                  autoFocus
                  autoComplete="off"
                  className="flex-1 bg-transparent text-sm text-ink placeholder-fog outline-none"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* Results area — inline, no popup */}
            <div className="px-4 mt-4 pb-6">
              {query.trim().length >= 3 ? (
                /* Suggestions */
                notFound && !searching ? (
                  <div className="flex items-center gap-2.5 py-4 px-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-none" />
                    <span className="text-sm text-fog">
                      {de ? 'Keine Adresse gefunden' : 'No address found'}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {suggestions.map(s => (
                      <button
                        key={s.place_id}
                        onClick={() => openForm(s.short, s.street, s.inZone)}
                        className="w-full flex items-start gap-3 px-3 py-3.5 rounded-2xl hover:bg-mist active:bg-mist transition-colors text-left"
                      >
                        <MapPin className={`w-4 h-4 flex-none mt-0.5 ${s.inZone ? 'text-wolt-base' : 'text-amber-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug">{s.short}</p>
                          {!s.inZone && (
                            <p className="text-[11px] text-amber-500 font-medium mt-0.5">
                              {de ? 'Aktuell keine Lieferung · kommt bald' : 'No delivery yet · coming soon'}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                /* Saved addresses */
                addresses.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-fog uppercase tracking-wide mb-3 px-1">
                      {de ? 'Gespeicherte Adressen' : 'Saved addresses'}
                    </p>
                    <div className="space-y-2">
                      {addresses.map(addr => {
                        const isActive = activeAddress === addr.address
                        const LabelIcon = addr.labelType === 'work' ? Briefcase : addr.labelType === 'school' ? GraduationCap : Home
                        const labelNames: Record<LabelType, { de: string; en: string }> = {
                          home:   { de: 'Zuhause', en: 'Home'   },
                          work:   { de: 'Arbeit',  en: 'Work'   },
                          school: { de: 'Schule',  en: 'School' },
                          custom: { de: addr.customLabel || addr.address, en: addr.customLabel || addr.address },
                        }
                        const labelName = labelNames[addr.labelType][de ? 'de' : 'en']
                        return (
                        <div key={addr.id} className="flex items-center gap-2">
                          <button
                            onClick={() => { setActiveAddress(addr.address); onClose() }}
                            className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-colors text-left ${
                              isActive
                                ? 'border-wolt-base bg-wolt-light'
                                : 'border-cloud hover:border-wolt-base'
                            }`}
                          >
                            <LabelIcon className={`w-4 h-4 flex-none ${isActive ? 'text-wolt-base' : 'text-fog'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-ink leading-tight">{labelName}</p>
                              <p className="text-xs text-fog leading-snug truncate">{addr.address}</p>
                            </div>
                            {isActive && <Check className="w-4 h-4 text-wolt-base flex-none" />}
                          </button>
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-coral hover:bg-coral/10 transition-colors flex-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-fog text-center py-10">
                    {de ? 'Noch keine Adresse gespeichert' : 'No address saved yet'}
                  </p>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* ── Stage: Form ────────────────────────────────── */}
        {stage === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto px-4 py-5 space-y-4"
          >
            {/* Base address chip */}
            <div className="flex items-center gap-2.5 bg-mist rounded-2xl px-4 py-3">
              <MapPin className="w-4 h-4 text-wolt-base flex-none" />
              <span className="flex-1 text-sm text-ink">{baseShort}</span>
              <button onClick={() => setStage('home')} className="flex-none">
                <Pencil className="w-3.5 h-3.5 text-fog" />
              </button>
            </div>

            {/* House number */}
            <div>
              <label className="text-xs font-semibold text-fog uppercase tracking-wide block mb-1.5 px-1">
                {de ? 'Hausnummer *' : 'House number *'}
              </label>
              <input
                value={houseNumber}
                onChange={e => { setHouseNumber(e.target.value); setFormError('') }}
                placeholder={de ? 'z.B. 5' : 'e.g. 5'}
                autoFocus
                className="w-full bg-mist rounded-2xl px-4 py-3.5 text-sm text-ink placeholder-fog outline-none focus:ring-2 focus:ring-wolt-base/30 transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Apartment */}
            <div>
              <label className="text-xs font-semibold text-fog uppercase tracking-wide block mb-1.5 px-1">
                {de ? 'Wohnungsnr. / Etage (optional)' : 'Apartment / Floor (optional)'}
              </label>
              <input
                value={apartment}
                onChange={e => setApartment(e.target.value)}
                placeholder={de ? 'z.B. 2. OG, Wohnung 3' : 'e.g. 2nd floor, Apt 3'}
                className="w-full bg-mist rounded-2xl px-4 py-3.5 text-sm text-ink placeholder-fog outline-none focus:ring-2 focus:ring-wolt-base/30 transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-fog uppercase tracking-wide block mb-1.5 px-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3" />
                {de ? 'Telefonnummer (optional)' : 'Phone number (optional)'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={de ? 'z.B. +49 731 123456' : 'e.g. +49 731 123456'}
                className="w-full bg-mist rounded-2xl px-4 py-3.5 text-sm text-ink placeholder-fog outline-none focus:ring-2 focus:ring-wolt-base/30 transition-all"
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Label picker */}
            <div>
              <label className="text-xs font-semibold text-fog uppercase tracking-wide block mb-2 px-1">
                {de ? 'Adressname' : 'Address label'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { type: 'home'  as LabelType, Icon: Home,          de: 'Zuhause', en: 'Home'   },
                  { type: 'work'  as LabelType, Icon: Briefcase,     de: 'Arbeit',  en: 'Work'   },
                  { type: 'school'as LabelType, Icon: GraduationCap, de: 'Schule',  en: 'School' },
                  { type: 'custom'as LabelType, Icon: Pencil,        de: 'Eigener', en: 'Custom' },
                ]).map(({ type, Icon, de: deLabel, en: enLabel }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLabelType(type)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                      labelType === type
                        ? 'border-wolt-base bg-wolt-light text-wolt-base'
                        : 'border-cloud bg-mist text-fog hover:border-wolt-base/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">{de ? deLabel : enLabel}</span>
                  </button>
                ))}
              </div>
              {labelType === 'custom' && (
                <input
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  placeholder={de ? 'z.B. Eltern, Studio…' : 'e.g. Parents, Studio…'}
                  className="mt-2 w-full bg-mist rounded-2xl px-4 py-3 text-sm text-ink placeholder-fog outline-none focus:ring-2 focus:ring-wolt-base/30 transition-all"
                  style={{ fontSize: '16px' }}
                />
              )}
            </div>

            {formError && (
              <p className="text-xs text-coral px-1">{formError}</p>
            )}

            {zoneWarning && (
              <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-none mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    {de
                      ? 'Aktuell liefern wir noch nicht in dieses Gebiet – kommt bald!'
                      : "We don't deliver to this area yet — coming soon!"}
                  </p>
                  <button onClick={onClose} className="text-xs text-amber-700 dark:text-amber-400 font-semibold underline mt-1">
                    {de ? 'Trotzdem speichern & schließen' : 'Save anyway & close'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-wolt-base text-white font-semibold py-4 rounded-2xl text-base active:scale-[0.98] transition-all shadow-wolt"
            >
              {de ? 'Adresse speichern' : 'Save address'}
            </button>

            <div className="h-4" />
          </motion.div>
        )}
      </AnimatePresence>
        </motion.div>
      </div>
    </>
  )
}