import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, User, X } from 'lucide-react'
import { useLangStore } from '@/store/langStore'
import type { ProfileRow } from '@/lib/supabase'

const PHONE_RE = /^\+?[\d\s\-(). ]{7,20}$/

interface Props {
  profile: ProfileRow
  onSave: (data: { phone: string; full_name?: string }) => Promise<unknown>
  onSkip: () => void
}

export function ProfileCompleteModal({ profile, onSave, onSkip }: Props) {
  const { lang } = useLangStore()
  const de = lang === 'de'

  const needsName = !profile.full_name
  const [phone, setPhone]     = useState('')
  const [name, setName]       = useState(profile.full_name ?? '')
  const [phoneError, setPhoneError] = useState('')
  const [nameError, setNameError]   = useState('')
  const [loading, setLoading] = useState(false)

  const validateAndSubmit = async () => {
    let ok = true

    if (needsName && !name.trim()) {
      setNameError(de ? 'Pflichtfeld' : 'Required')
      ok = false
    } else {
      setNameError('')
    }

    if (!phone.trim()) {
      setPhoneError(de ? 'Telefonnummer ist erforderlich' : 'Phone number is required')
      ok = false
    } else if (!PHONE_RE.test(phone.trim())) {
      setPhoneError(de ? 'Ungültige Nummer (z.B. +49 170 1234567)' : 'Invalid number (e.g. +49 170 1234567)')
      ok = false
    } else {
      setPhoneError('')
    }

    if (!ok) return
    setLoading(true)
    await onSave({ phone: phone.trim(), ...(needsName ? { full_name: name.trim() } : {}) })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onSkip}
      />
      <motion.div
        className="relative w-full max-w-mobile bg-canvas rounded-t-3xl shadow-2xl px-5 pt-5 pb-safe z-10"
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { type: 'spring', damping: 30, stiffness: 320 } }}
      >
        {/* handle + close */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-cloud rounded-full" />
        </div>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-bold text-ink text-lg leading-tight">
              {de ? 'Profil vervollständigen' : 'Complete your profile'}
            </h2>
            <p className="text-sm text-fog mt-0.5">
              {de
                ? 'Für schnellere Bestellungen deine Nummer speichern'
                : 'Save your number for faster checkout'}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="w-8 h-8 rounded-full bg-mist flex items-center justify-center flex-none ml-3"
          >
            <X className="w-4 h-4 text-fog" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          {needsName && (
            <div>
              <label className="text-[11px] font-semibold text-fog mb-1 block uppercase tracking-wide">
                {de ? 'Vollständiger Name' : 'Full name'}
              </label>
              <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${nameError ? 'bg-coral/8 ring-2 ring-coral/30' : 'bg-mist'}`}>
                <User className="w-4 h-4 text-fog flex-none" />
                <input
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError('') }}
                  placeholder={de ? 'Max Mustermann' : 'Jane Smith'}
                  className="flex-1 bg-transparent text-sm text-ink placeholder-fog/60 outline-none"
                />
              </div>
              {nameError && <p className="text-[11px] text-coral mt-1 px-1">{nameError}</p>}
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-fog mb-1 block uppercase tracking-wide">
              {de ? 'Telefonnummer' : 'Phone number'}
            </label>
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${phoneError ? 'bg-coral/8 ring-2 ring-coral/30' : 'bg-mist'}`}>
              <Phone className="w-4 h-4 text-fog flex-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setPhoneError('') }}
                placeholder="+49 170 1234567"
                className="flex-1 bg-transparent text-sm text-ink placeholder-fog/60 outline-none"
              />
            </div>
            {phoneError && <p className="text-[11px] text-coral mt-1 px-1">{phoneError}</p>}
          </div>
        </div>

        <button
          onClick={validateAndSubmit}
          disabled={loading}
          className="w-full bg-wolt-base text-white font-semibold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : (de ? 'Speichern' : 'Save')
          }
        </button>

        <button
          onClick={onSkip}
          className="w-full text-center text-sm text-fog py-2 active:opacity-60"
        >
          {de ? 'Jetzt überspringen' : 'Skip for now'}
        </button>
      </motion.div>
    </div>
  )
}
